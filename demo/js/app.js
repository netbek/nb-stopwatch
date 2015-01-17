/**
 * AngularJS stopwatch demo
 *
 * @author Hein Bekker <hein@netbek.co.za>
 * @copyright (c) 2015 Hein Bekker
 * @license http://www.gnu.org/licenses/agpl-3.0.txt AGPLv3
 */

(function (window, angular, undefined) {
	'use strict';

	angular
		.module('nb.stopwatch.demo', [
			'nb.stopwatch'
		])
		.controller('MainController', MainController)
		.run(runBlock);

	MainController.$inject = ['$scope', '$timeout'];
	function MainController ($scope, $timeout) {
		$timeout(function () {
			$scope.$broadcast('nbStopwatch:start');
		}, 500);
	}

	runBlock.$inject = ['AnimationFrame'];
	function runBlock (AnimationFrame) {

	}
})(window, window.angular);