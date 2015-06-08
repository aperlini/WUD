// Simple CRUD on Comments
wudApp.directive('comment', function(FavoritesService){

	return {
		restrict : 'A',
		scope : {
			refId : '@'
		},
		templateUrl : 'partials/comment.html',
		link : function(scope, elem, attrs) {

			// output comment
			scope.outputcomment = FavoritesService.getComment(scope.refId) || '';

			// textarea comment
			scope.contentComment = FavoritesService.getComment(scope.refId) || '';

			if(scope.outputcomment != '') {
				scope.textareacomment = false;
				scope.addcomment = false;
				scope.savecomment =  false;
				scope.editcomment = true;
				scope.cancelcomment = false;
				scope.deletecomment = true;
			} else {
				scope.textareacomment = false;
				scope.addcomment = true;
				scope.savecomment =  false;
				scope.editcomment = false;
				scope.cancelcomment = false;
				scope.deletecomment = false;
			}

		},
		controller : function($scope) {

			$scope.addComment = function() {
				$scope.contentComment = FavoritesService.getComment($scope.refId);
				$scope.textareacomment = true;
				$scope.addcomment = false;
				$scope.savecomment =  true;
				$scope.cancelcomment = true;
			}

			$scope.editComment = function() {
				$scope.outputcomment = '';
				$scope.textareacomment = true;
				$scope.addcomment = false;
				$scope.savecomment =  true;
				$scope.cancelcomment = true;
				$scope.deletecomment = false;
				$scope.editcomment = false;
			}

			$scope.saveComment = function() {

				$scope.textareacomment = false;
				$scope.addcomment = false;
				$scope.savecomment =  false;
				$scope.editcomment = true;
				$scope.cancelcomment = false;
				$scope.deletecomment = true;

				if($scope.contentComment != '') {

					FavoritesService.addCommentOnFavorite({
						id : $scope.refId,
						comment : $scope.contentComment
					});

					$scope.outputcomment = FavoritesService.getComment($scope.refId);
					
				}

			}

			$scope.deleteComment = function() {

				FavoritesService.deleteComment($scope.refId);

				$scope.outputcomment = FavoritesService.getComment($scope.refId);
				$scope.textareacomment = false;
				$scope.addcomment = true;
				$scope.savecomment =  false;
				$scope.cancelcomment = false;
				$scope.deletecomment = false;
				$scope.editcomment = false;
				
			}

			$scope.cancelComment = function() {
				if(FavoritesService.getComment($scope.refId) != undefined) {
					$scope.outputcomment = FavoritesService.getComment($scope.refId);
					$scope.textareacomment = false;
					$scope.addcomment = false;
					$scope.savecomment =  false;
					$scope.cancelcomment = false;
					$scope.deletecomment = true;
					$scope.editcomment = true;
				} else {
					$scope.textareacomment = false;
					$scope.addcomment = true;
					$scope.savecomment =  false;
					$scope.cancelcomment = false;
					$scope.deletecomment = false;
					$scope.editcomment = false;
				}
			}
			
		}
	}

});