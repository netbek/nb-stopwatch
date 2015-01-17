(function () {
	'use strict';

	angular
		.module('nb.stopwatch.demo', [
			'nb.stopwatch'
		])
		.controller('MainController', function MainController () {
		})
		.run(runBlock);

	runBlock.$inject = ['AnimationFrame'];
	function runBlock (AnimationFrame) {

	}
})();