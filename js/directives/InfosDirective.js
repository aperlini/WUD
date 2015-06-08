wudApp.directive('infoCollapse', function(){

	return {
		restrict : 'A',
		controller : function($scope) {

			$scope.isCollapsed = true;

		}
	}

});