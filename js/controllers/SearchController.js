wudApp.controller('SearchController', function($scope, $rootScope, $modal, $window, MainDataService, CollectionsService, DataDPLAService, DataEDMService, FavoritesService, ItemsService, ModalService, OptionsService, OptionsMenuService, PaginationService){

	// page load
	$scope.pageloader = true;

	// modal message
	$scope.modal = false;

	// main load more btn
	$scope.loadmore = true;
	$scope.spinnerlist = true;
	$scope.loaderLabel = true;
	
	// right panel
	$scope.panelactive = '';
	$scope.mask = true;

	// detail europeana
	$scope.edmdetails = {};

	// load more btn detail
	$scope.spinnerdetail = true;
	$scope.loaderDetailLabel = true;
	
	// basic and boolean (+operator) query models
	$scope.basicquery = '';
	$scope.booleanquery = {};
	$scope.operator = 'AND';
	$scope.checkModel = {
		AND: true,
		OR: false 
	};
 
	// cancel btns 
	$scope.cancelbasicbtn = true;
	$scope.cancelfirstbtn = true;
	$scope.cancelsecondbtn = true;

	// big search basic and boolean inputs status
	$rootScope.basicinput = true;
	$rootScope.booleaninput = false;

	// big search link query type state
	$rootScope.linkbasicclass = true;
	$rootScope.linkbooleanclass = false;

	// query type selector and link
	$scope.querytype = ['basic', 'boolean'];

	// Favorites indicator
	if(FavoritesService.getCurrentNbrFavorites() > 0) {
		$rootScope.favoritesIndicator = FavoritesService.getCurrentNbrFavorites();
	}

	$scope.getType = function(type) {

		switch(type) {

			case 'basic' :
			$rootScope.basicinput = true;
			$rootScope.booleaninput = false;
			$rootScope.linkbasicclass = true;
			$rootScope.linkbooleanclass = false;
			break;

			case 'boolean' :
			$rootScope.basicinput = false;
			$rootScope.booleaninput = true;
			$rootScope.linkbasicclass = false;
			$rootScope.linkbooleanclass = true;
			break;
		}

		$scope.resetForm();
	}

	$scope.cancel = function() {
		$scope.$modalInstance.close();
	}

	$scope.initApp = function() {

		var keywords = ['syphilis', 'mélancolie', '"marie curie"', 'neurone', 'stethoscope', 'melancholy', 'sphere'],
				keyLth = keywords.length;
				item = keywords[Math.floor(Math.random()*keyLth)];

		// Set Modal
		$rootScope.modaltitle = ModalService['onload']['title'];
		$rootScope.loadermain =  false;
		$rootScope.msgnoresults = true;
		$rootScope.msgerror = true;

		$scope.$modalInstance = $modal.open({
			scope : $scope,
			templateUrl : 'partials/modal.html'
		});

		// set basic input field 
		$scope.basicquery = item;

		var currentQuery = $scope.basicquery;

		$scope.cancelbasicbtn = false;

		$scope.pageloader = false;

		// modal message
		$scope.modal = true;

		// Set current search value
		ItemsService.setCurrentSearch(currentQuery);

		// Reset items count
		ItemsService.resetItemsCount();

		// Reset Collections
		CollectionsService.resetCollections();

		// Reset Pagination
		PaginationService.resetPagination();

		// Reset Options
		OptionsService.resetOptions();
				
		$scope.sendQuery();
 
	}

	$scope.checkOperator = function(operator) {
		
		switch(operator) {

			case 'AND' :
			$scope.checkModel = {
				AND: true,
				OR: false 
			};
			break;

			case 'OR' :
			$scope.checkModel = {
				AND: false,
				OR: true
			};
			break;

		}
	}

	$scope.loadMore = function(e) {

		// Update pagination
		PaginationService.updatePagination();

		// modal message
		$scope.modal = false;

		// Send request
		$scope.sendQuery();

		// Set loader state
		$scope.spinnerlist = false;
		$scope.loaderLabel = false;

	}

	$scope.sendQuery = function() {

		// Get current Search
		var currentQuery = ItemsService.getCurrentSearch();

		// Get current Pagination
		var pagination = PaginationService.getCurrentPagination();

		// Get current Options
		var options = OptionsService.getOptions();

		// Setting URIs
		var edmURI = DataEDMService.setQuery({
			search : currentQuery,
			pagination : pagination['edm'],
			mediatypes : options['edm']['mediatypes'],
			timeline : options['edm']['timeline'],
			languages : options['edm']['languages']
		});

		var dplaURI = DataDPLAService.setQuery({
			search : currentQuery,
			pagination : pagination['dpla'],
			mediatypes : options['dpla']['mediatypes'],
			timeline : options['dpla']['timeline'],
			languages : options['dpla']['languages'] 
		});

		// Set current request
		var response = MainDataService.setRequest({
			edm : edmURI,
			dpla : dplaURI
		});

		response.then(function(data){ 

			// page loader
			$scope.pageloader = true;

			// 1) check results
			var checkedResults = MainDataService.checkResults(data);

			// 2) check collections
			var itemsCollections = MainDataService.checkCollections(checkedResults);

			// If returned collections are empty
			if(!itemsCollections) {

				// Set Modal
				$rootScope.modaltitle = ModalService['onnoresults']['title'];
				$rootScope.loadermain =  true;
				$rootScope.msgnoresults = false;

			} else {

				// Dismiss modal
				$scope.$modalInstance.close();

				// Update current collections
				CollectionsService.updateCurrentCollections(itemsCollections);

				// Get current collections
				var currentCollection = CollectionsService.getCurrentCollections();

				var title = '',
					reformat = [];

				for(var i=0; i<currentCollection.length; i++) {

					currentCollection[i]['title'].length > 20 ? title = currentCollection[i]['title'].substring(0,20)+'...' : title = currentCollection[i]['title'];

					reformat.push({
						
						api : currentCollection[i]['api'],
						date : currentCollection[i]['date'],
						desc : currentCollection[i]['desc'],
						id : currentCollection[i]['id'],
						image : currentCollection[i]['image'],
						link : currentCollection[i]['link'],
						score : currentCollection[i]['score'],
						source : currentCollection[i]['source'],
						title : title,
						type : currentCollection[i]['type']
						
					});

				}

				// render view items list
				$scope.items = reformat;

				// render view current query
				$scope.query = currentQuery;

				// render view infos
				var info = ItemsService.getInfo();

				$scope.infos = {
					items : info.items,
					total : info.total,
					edm : info.edm,
					dpla : info.dpla
				};

				// checking btn load more state
				if(MainDataService.loadMoreState) {

					$scope.loadmore = false;

					$scope.spinnerlist = true;
					$scope.loaderLabel = true;

				} else {

					$scope.loadmore = true;

				}

			}

		}, function(error){

			console.log(error);

			// Set Modal
			$rootScope.modaltitle = ModalService['onerror']['title'];
			$rootScope.loadermain =  true;
			$rootScope.msgnoresults = true;
			$rootScope.msgerror = false;

			$scope.pageloader = true;

		});

	}

	$scope.search = function() {

		var currentQuery = '';

		// Set basic query
		if($scope.basicquery != '') {

			currentQuery = $scope.basicquery;

			$scope.cancelbasicbtn = false;

			
		} else {

			// Set boolean query
			if($scope.booleanquery.first != undefined && $scope.booleanquery.second != undefined) {

				currentQuery = $scope.booleanquery.first + '+' + $scope.operator + '+' + $scope.booleanquery.second;

				$scope.cancelfirstbtn = false;
				$scope.cancelsecondbtn = false;

			}

		}

		// if current query is set
		if(currentQuery != '') {

			// Set current search value
			ItemsService.setCurrentSearch(currentQuery);

			// Reset items count
			ItemsService.resetItemsCount();

			// Reset Collections
			CollectionsService.resetCollections();

			// Reset Pagination
			PaginationService.resetPagination();

			// Reset Options
			OptionsService.resetOptions();

			// get options values
			var optionsvalues = {
				timeline : null,
				mediatypes : null,
				languages : null
			};

			// Get timeline values
			if(OptionsMenuService.getStatusTimeline()) {
				optionsvalues['timeline'] = OptionsMenuService.getTimelineValues();
			}

			// Get mediatypes values
			if(OptionsMenuService.getStatusMediatypes()) {
				optionsvalues['mediatypes'] = OptionsMenuService.getMediatypesElements();
			}

			// Get languages values
			if(OptionsMenuService.getStatusLanguages()) {
				optionsvalues['languages'] = OptionsMenuService.getLanguagesElements();
			}

			// Set options
			OptionsService.setOptionsEDM(optionsvalues);
			OptionsService.setOptionsDPLA(optionsvalues);

			// Set Modal
			$rootScope.modaltitle = ModalService['onload']['title'];
			$rootScope.loadermain =  false;
			$rootScope.msgnoresults = true;

			$scope.$modalInstance = $modal.open({
				scope : $scope,
				templateUrl : 'partials/modal.html'
			});

			$scope.sendQuery();

		}

	}

	// reset basic and boolean fields
	$scope.resetForm = function() {

		// reset cancel btns
		$scope.cancelbasicbtn = true;
		$scope.cancelfirstbtn = true;
		$scope.cancelsecondbtn = true;

		// reset fields
		$scope.basicquery = '';
		$scope.booleanquery = {};

		// reset operators
		$scope.checkModel = {
			AND: true,
			OR: false 
		};

	}

	$scope.showpanel = function(id) {

		// clear europeana detail if set
		$scope.edmdetails = {};

		var detailItem = CollectionsService.getItemById(id);	

		/* should be a directive */

		$scope.isdescription = true;
		$scope.isdate = true;

		$scope.detail = {};
		
		if(detailItem.hasOwnProperty('id')) {

			$scope.detail.id = detailItem['id'];
		}

		if(detailItem.hasOwnProperty('title')) {

			$scope.detail.title = detailItem['title'];

		}

		if(detailItem.hasOwnProperty('desc')) {

			$scope.detail.description = detailItem['desc'];
			$scope.isdescription = false;

		}

		if(detailItem.hasOwnProperty('date')) {

			if(detailItem['date'] != '') {

				$scope.detail.date = detailItem['date'];
				$scope.isdate = false;

			}
			
		}

		if(detailItem.hasOwnProperty('source')) {

			if(detailItem['source'] != '') {

				$scope.detail.source = detailItem['source'];

			} else {

				$scope.detail.source = '#';

			}
			
		}

		var apiType = '';

		if(detailItem.hasOwnProperty('api')) {

			switch(detailItem['api']) {

				case 'edm':
				apiType = 'Europeana Link';
				$scope.loadmoredetail = false;
				break;

				case 'dpla':
				apiType = 'DPLA Link';
				$scope.loadmoredetail = true;
				break;

			}
			
		}

		$scope.detail.api = apiType;
		$scope.detail.link = detailItem['link'];

		$scope.detail.image = '';
		$scope.detail.image = detailItem.image;

		// display panel
		$scope.mask = false;
		$scope.panelactive = 'smr-open';

		// body => overflow:hidden
		$rootScope.isSubmenuactive = true;

	}

	$scope.hidepanel = function() {
		$scope.mask = true;
		$scope.panelactive = '';

		// body => scroll
		$rootScope.isSubmenuactive = false;
	}

	$scope.loadDetail = function(id) {
		
		$scope.spinnerdetail = false;
		$scope.loaderDetailLabel = false;

		var response = DataEDMService.queryDetail(id);

		response.then(function(data){

			// format europeana detail
			var detailEDM = DataEDMService.getMoreDetailOnItem(data);

			// render view
			$scope.edmdetails = detailEDM;

			// load more detail state
			$scope.spinnerdetail = true;
			$scope.loaderDetailLabel = true;
			$scope.loadmoredetail = true;

		});
	}

});











