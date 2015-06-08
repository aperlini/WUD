var wudApp = angular.module('wudApp', ['ui.bootstrap', 'ngTouch']).run(function(){
	FastClick.attach(document.body);
});