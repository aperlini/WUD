// update classes on scroll event
wudApp.directive('scroll', function($window) {
    return {
        link: function(scope, element, attrs) {

            angular.element($window).bind('scroll', function(e){

            	if(this.pageYOffset > 50) {

            		scope.boolScroll = true;

            	} else {

            		scope.boolScroll = false;

            	}

            	scope.$apply();

            });
        }
   };
});
 
// scrollTop on submit new query
wudApp.directive('ngTop', function($window){

	return {
		restrict : 'A',
		link : function(scope, element, attr) {
			element.on('submit', function(){
				$('body').scrollTop(0);
			});
		}
	}

});