/**
 * AngularJS stopwatch directive
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.stopwatch', [
			'nb.stopwatch.templates',
			'nb.animationFrame'
		])
		.provider('nbStopwatchConfig', nbStopwatchConfig)
		.controller('nbStopwatchController', nbStopwatchController)
		.directive('nbStopwatch', nbStopwatchDirective)
		.directive('nbStopwatchHand', nbStopwatchHandDirective);

	if (!Date.now) {
		Date.now = function now () {
			return new Date().getTime();
		};
	}

	function nbStopwatchConfig () {
		var config = {
			duration: 1000
		};
		return {
			set: function (values) {
				config = extend(true, {}, config, values);
			},
			$get: function () {
				return config;
			}
		};
	}

	nbStopwatchController.$inject = ['$scope', 'AnimationFrame', 'nbStopwatchConfig'];
	function nbStopwatchController ($scope, AnimationFrame, nbStopwatchConfig) {
		var deregister = [];
		var self = this;
		var isInitialized = false;
		var isRunning = false;
		var duration, startTime, stopTime;
		var raf = new AnimationFrame;
		var rafId;

		self.start = function () {
			if (isRunning) {
				return;
			}

			isRunning = true;

			if (!isInitialized) {
				duration = ($scope.duration || nbStopwatchConfig.duration);
				startTime = Date.now();
				stopTime = startTime + duration;
				isInitialized = true;
			}

			(function animate () {
				rafId = raf.request(function () {
					var now = Date.now();

					if (now > stopTime) {
						self.stop();
						return;
					}

					var current = (now - startTime) / duration;
					$scope.$broadcast('nbStopwatch:render', current);

					animate();
				});
			}());
		};

		self.stop = function () {
			if (!isRunning) {
				return;
			}

			isRunning = false;

			if (rafId) {
				raf.cancel(rafId);
				rafId = null;
			}
		};

		self.reset = function () {
			var wasRunning = isRunning;

			if (isRunning) {
				self.stop();
			}

			duration = null;
			startTime = null;
			stopTime = null;
			isInitialized = false;

			if (wasRunning) {
				self.start();
			}
		};

		deregister.push($scope.$on('nbStopwatch:start', function (event) {
			self.start();
		}));

		deregister.push($scope.$on('nbStopwatch:stop', function (event) {
			self.stop();
		}));

		deregister.push($scope.$on('nbStopwatch:reset', function (event) {
			self.reset();
		}));

		deregister.push($scope.$on('nbStopwatch:restart', function (event) {
			self.reset();
			self.start();
		}));

		$scope.$on('$destroy', function () {
			self.stop();

			angular.forEach(deregister, function (fn) {
				fn();
			});
		});
	}

	function nbStopwatchDirective () {
		return {
			restrict: 'EA',
			transclude: true,
			replace: true,
			controller: 'nbStopwatchController',
			templateUrl: 'templates/nb-stopwatch.html',
			scope: {
				duration: '=?'
			}
		};
	}

	function nbStopwatchHandDirective () {
		return {
			require: '^nbStopwatch',
			restrict: 'EA',
			link: function (scope, element, attrs) {
				var deregister = [];

				deregister.push(scope.$on('nbStopwatch:render', function (event, value) {
					var str = 'rotate(' + (value * 360) + 'deg)';
					element.css({
						'-webkit-transform': str,
						'-moz-transform': str,
						'-o-transform': str,
						'transform': str
					});
				}));

				scope.$on('$destroy', function () {
					angular.forEach(deregister, function (fn) {
						fn();
					});
				});
			}
		};
	}

	/**
	 * Checks if value is an object created by the Object constructor.
	 *
	 * @param {mixed} value
	 * @returns {Boolean}
	 */
	function isPlainObject (value) {
		return (!!value && typeof value === 'object' && value.constructor === Object
			// Not DOM node
			&& !value.nodeType
			// Not window
			&& value !== value.window);
	}

	/**
	 * Merge the contents of two or more objects together into the first object.
	 *
	 * Shallow copy: extend({}, old)
	 * Deep copy: extend(true, {}, old)
	 *
	 * Based on jQuery (MIT License, (c) 2014 jQuery Foundation, Inc. and other contributors)
	 */
	function extend () {
		var options, key, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if (typeof target === 'boolean') {
			deep = target;

			// Skip the boolean and the target
			target = arguments[i] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if (!isPlainObject(target) && !angular.isFunction(target)) {
			target = {};
		}

		// If only one argument is passed
		if (i === length) {
			i--;
		}

		for (; i < length; i++) {
			// Only deal with non-null/undefined values
			if ((options = arguments[i]) != null) {
				// Extend the base object
				for (key in options) {
					src = target[key];
					copy = options[key];

					// Prevent never-ending loop
					if (target === copy) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = angular.isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && angular.isArray(src) ? src : [];
						}
						else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[key] = extend(deep, clone, copy);
					}
					// Don't bring in undefined values
					else if (copy !== undefined) {
						target[key] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	}
})(window, window.angular);

angular.module('nb.stopwatch.templates', ['templates/nb-stopwatch.html']);

angular.module("templates/nb-stopwatch.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("templates/nb-stopwatch.html",
    "<div class=\"stopwatch\">\n" +
    "	<div class=\"stopwatch-clock\">\n" +
    "		<div class=\"stopwatch-face\"></div>\n" +
    "		<div nb-stopwatch-hand class=\"stopwatch-hand\"></div>\n" +
    "	</div>\n" +
    "</div>");
}]);
