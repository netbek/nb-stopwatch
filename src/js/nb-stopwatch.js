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
				config = angular.extend({}, config, values);
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
})(window, window.angular);
