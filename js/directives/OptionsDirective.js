wudApp.directive('optionsMenu', function($rootScope, FavoritesService, OptionsMenuService){

	return {
		restrict : 'A',
        link : function(scope, elem, attrs) {

        },
		controller : function($scope) {

			$scope.menuList = OptionsMenuService.getOptionsMenu();

			$scope.setMenuState = function(current) {

			   $rootScope.hasFavorites = false;

			   // setting submenuactive state
			   $rootScope.isSubmenuactive = !OptionsMenuService.getSubcontentState();

               OptionsMenuService.setOptionsMenuState(current);

               if(current == 'favorites') {

               		if(FavoritesService.getCurrentNbrFavorites() > 0) {

               			$rootScope.hasFavorites = true;

               			if(!OptionsMenuService.getOptionsStateByMenuTitle('favorites')) {

               				$rootScope.hasFavorites = false;

               			}

               		} 

               }

			}

		}
	}

});

wudApp.directive('optionsSubcontent', function($rootScope, OptionsMenuService){

	return {
		restrict : 'A',
		controller : function($scope) {

			$scope.closeSubcontentMenu = function() {

				OptionsMenuService.closeSubcontent();
				$rootScope.hasFavorites = false;
				$rootScope.isSubmenuactive = false;

			}

			$scope.getSubcontentCurrentState = function() {

				return OptionsMenuService.getSubcontentState();

			}

			$scope.getCurrentState = function(current) {

				return OptionsMenuService.getOptionsStateByMenuTitle(current);

			}

		}
	}

});

wudApp.directive('optionTimeline', function(OptionsMenuService){

	return {
		restrict : 'A',
		controller : function($scope) {

			// hide input field
			$scope.inputTimeline = true;

			$scope.timelinevalues = OptionsMenuService.getTimelineValues();

			$scope.$watch('timelinevalues', function(val) {

				OptionsMenuService.setTimeline(val);

			});

		}
	}

});

wudApp.directive('optionMediatypes', function(OptionsMenuService){

	return {
		restrict : 'A',
		controller : function($scope, $filter) {

			$scope.checkModel = OptionsMenuService.getMediatypesElements();

			$scope.$watch('checkModel', function(n,o){
				var trues = $filter("filter")(n, {state : true});
				
				if(trues.length > 0) {
					OptionsMenuService.setMediatypesStatus(true);
				} else {
					OptionsMenuService.setMediatypesStatus(false);
				}

			}, true);

			$scope.resetMediatypes = function() {
				OptionsMenuService.resetMediatypesElements();
			}
		}
	}

});

wudApp.directive('optionLanguages', function(OptionsMenuService){

	return {
		restrict : 'A',
		controller : function($scope) {
			$scope.radio = {model : undefined};

			$scope.radioModel = OptionsMenuService.getLanguagesElements();

			$scope.setRadioModelStatus = function(current) {
				OptionsMenuService.setLanguagesState(current);
			}

			$scope.resetRadio = function() {
				OptionsMenuService.resetLanguagesState();
				$scope.radioModel = OptionsMenuService.getLanguagesElements();
			}
		}
	}

});

wudApp.directive('favoritesSubcontent', function($rootScope, $compile, FavoritesService){

	var template = '';

	return {
		restrict : 'A',
		template : '<div ng-include="myTemplate"></div>',
		replace :'true',
		link : function(scope, elem, attrs) {

			// updating view favorites depending on favorites model
			var checkListFavorites = function() {

				if(FavoritesService.getCurrentNbrFavorites() > 0) {
					scope.favoritesList = FavoritesService.getFavoritesList();
					scope.myTemplate = 'partials/favoritesList.html';

				} else {

					scope.myTemplate = 'partials/favoritesEmpty.html';

				}

			}

			// if favorites event occured on item list
			$rootScope.$on('favoritesEventList', function(e, args){

				e.preventDefault(); 

				checkListFavorites();

			});

			// if favorites event occured on detail
			$rootScope.$on('favoritesEventDetail', function(e, args){

				e.preventDefault(); 

				checkListFavorites();

			});

			checkListFavorites();

			
		},
		controller : function($scope, $rootScope) {

			$scope.deleteFavorites = function() {

				// setting an event to remove active class on list and detail favorite icon
				$rootScope.$broadcast('deleteAllFavorites');

				$rootScope.hasFavorites = false;

				// Deleting all favorites in localstorage
				FavoritesService.resetFavoritesList();

				// Setting favorites empty template
				$scope.myTemplate = 'partials/favoritesEmpty.html';

				// update favorites count indicator
				if(FavoritesService.getCurrentNbrFavorites() > 0) {
					$rootScope.favoritesIndicator = FavoritesService.getCurrentNbrFavorites();
				} else {
					$rootScope.favoritesIndicator = '';
				}
			}

			$scope.deleteFavorite = function(currentID) {

				// Remove item from favorites localstorage
				FavoritesService.removeFavorite(currentID);

				// Update view
				$scope.favoritesList = FavoritesService.getFavoritesList();

				// Update indicator
				$rootScope.favoritesIndicator = FavoritesService.getCurrentNbrFavorites();

				// Update detail favorite state
				$rootScope.$broadcast('favoritesEventDetail', {id : currentID, state : false});

				// Update list favorite state
				$rootScope.$broadcast('favoritesEventList', {id : currentID, state : false});
			}

		}

		
	}

});
