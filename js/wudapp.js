var wudApp = angular.module('wudApp', ['ui.bootstrap', 'ngTouch']).run(function(){
	FastClick.attach(document.body);
});;wudApp.factory('CollectionsService', function(){

	var factory = {
 
		currentCollections : [],

		setCurrentCollections : function(current) {

			factory.currentCollections = current;

		},

		updateCurrentCollections : function(current) {

			factory.currentCollections = factory.currentCollections.concat(current);

		},

		getItemById : function(id) {

			var currentCollections = factory.getCurrentCollections();
				currentCollectionLth = currentCollections.length;

			for(var i=0; i<currentCollectionLth; i++) {

				var collection = currentCollections[i];

				if(collection['id'] == id) {

					return collection;

				}

			}

		},

		getCurrentCollections : function() {

			return factory.currentCollections;

		},

		resetCollections : function() {
			factory.currentCollections = [];
		}

	}

	return factory;

});;wudApp.factory('DataEDMService', function($http, $q, ItemsService){

	var factory = {

			base : 'http://www.europeana.eu/api/v2/',
			key : 'Da5hthRYW',
			optional : {},
			data : {},
			dataDetail : {},
 
		setQuery : function(params) {

			var api = factory.base, 
				method = 'search.json?',
				apiKey = 'wskey='+factory.key,
				query = '&query=',
				valueQuery = params['search'], 
				pagination = params['pagination'],
				timeline = params['timeline'] || '',
				languages = params['languages'] || '', 
				mediatypes = params['mediatypes'] || '';

			return api + method + apiKey + query + valueQuery + mediatypes + timeline + languages + pagination;

		},

		getId : function(item) {

			if(item.hasOwnProperty('id')) {

				return item['id'];

			}

			return '';

		},

		getLink : function(item) {

			if(item.hasOwnProperty('guid')) {

				var link = item['guid'];

				var linkArray = link.split('.html'),
					reformatLink = linkArray[0]+'.html';

				return reformatLink;

			}

			return '';

		},

		getTitle : function(item) {

			if(item.hasOwnProperty('title')) {

				return item['title'][0];

			}

			return '';

		},

		getImage : function(item) {

			if(item.hasOwnProperty('edmPreview')){

				return item['edmPreview'][0];

			} else {

				return 'img/missing-edm.jpg'; 

			}

		},

		getScore : function(item) {

			if(item.hasOwnProperty('score')) {

				return item['score'];

			}

			return '';

		},

		getType : function(item) {

			if(item.hasOwnProperty('type')) {

				return item['type'];

			}

			return '';

		},

		getSource : function(item) {

			if(item.hasOwnProperty('edmIsShownAt')) {

				return item['edmIsShownAt'][0];

			}

			return '';

		},

		checkResult : function(data) {

			if(data['itemsCount'] > 0) {

				return {
					total : data['totalResults'],
					objects : data['items'],
					limit : data['itemsCount']
				}

			} else {

				return null

			}

		},

		parseCollection : function(results) {

			var items = results,
				nbrItems = items.length,
				reformatItems = [];

			for(var i=0; i<nbrItems; i++) {

				var item = items[i]; 

				reformatItems.push({
					'id' : factory.getId(item),
					'title' : factory.getTitle(item), 
					'image' : factory.getImage(item),
					'link' : factory.getLink(item),
					'score' : factory.getScore(item),
					'source' : factory.getSource(item),
					'type' : factory.getType(item),
					'api' : 'edm'
				});

			}

			return reformatItems;

		},

		isMoreObjAvailable : function() {
			return ItemsService.getInfoEDM()['items'] >= ItemsService.getInfoEDM()['total'];
		},

		queryDetail : function(id) {

			var method = 'record/',
				type = '.json?wskey=',
				url = factory.base + method + id + type + factory.key,
				deferred = $q.defer();

			// $http.get(url).success(function(response, status){

			// 	factory.dataDetail = response;
			// 	deferred.resolve(factory.dataDetail);


			// }).error(function(error, status){

			// 	deferred.reject('Impossible d\'accéder à Europeana');

			// });

			$http.jsonp(url+'&callback=JSON_CALLBACK').success(function(response, status){

				factory.dataDetail = response;
				deferred.resolve(factory.dataDetail);

			}).error(function(error, status){

				deferred.reject('Impossible d\'accéder à Europeana');

			});

			return deferred.promise;

		},

		formatDublinCore : function(term) {

			var label = '';

			switch(term) {
				case 'dcCreator':
					label = 'Creator';
					break;
				case 'dcDate':
					label = 'Date';
					break;
				case 'dctermsCreated':
					label = 'Date of creation';
					break;
				case 'dcDescription':
					label = 'Description';
					break;
				case 'dcPublisher':
					label = 'Publisher';
					break;
				case 'dctermsTemporal':
					label = 'Time Period';
					break;

			}

			return label;

		},

		getMoreDetailOnItem : function(data) {

			var detail = data['object'],
				detailContent = Object.keys(detail),
				detailContentLth = detailContent.length,
				detailProp = ['dcCreator', 'dcDate', 'dctermsCreated', 'dcDescription', 'dcPublisher', 'dctermsTemporal'],
				detailPropLth = detailProp.length,
				formatDetailObj = {
					'empty' : 'no further informations available'
				};

			if(detailContentLth > 0) {

				if(detail.hasOwnProperty('proxies')) {

					var proxies = detail['proxies'][0];

					for(var i=0; i<detailPropLth; i++) {

						if(proxies.hasOwnProperty(detailProp[i])) {

							if(proxies[detailProp[i]].hasOwnProperty('def')) {

								var def = proxies[detailProp[i]]['def'],
									defLth = def.length;
								
								var label = factory.formatDublinCore(detailProp[i]);

								formatDetailObj[label] = '';
								delete formatDetailObj.empty;

								if(defLth > 1) {

									for(var j=0; j<defLth; j++) {

										formatDetailObj[label] = def[j];

									}

								} else {

									formatDetailObj[label] = def[0];

								}

							}

						}

					}

				} 

			} 

			return formatDetailObj;

		}
 
	}

	return factory;

});;wudApp.factory('DataDPLAService', function(ItemsService){

	var factory = {

		base : 'http://api.dp.la/v2/',
		key : 'f1ab088394bc0548b7b2048ef06c0a29',
		optional : {},
		data : {},
 
		setQuery : function(params) {

			var api = factory.base, 
				method = 'items?q=',
				apiKey = '&api_key='+factory.key,
				valueQuery = params['search'], 
				pagination = params['pagination'],
				timeline = params['timeline'] || '',
				languages = params['languages'] || '', 
				mediatypes = params['mediatypes'] || '';

			return api + method + valueQuery + mediatypes + timeline + languages + apiKey + pagination;

		},
 
		getId : function(item) {

			if(item.hasOwnProperty('id')) {

				return item['id'];
 
			}

			return '';
		},

		getLink : function(id){

			return 'http://dp.la/item/'+id;

		},

		getTitle : function(item){

			if(item.hasOwnProperty('sourceResource')) {

				if(item['sourceResource'].hasOwnProperty('title')) {

					if(typeof item['sourceResource']['title'] == 'object') {

						return item['sourceResource']['title'][0];

					}

					return item['sourceResource']['title'];

				} 

			} 

			return '';

		},

		getDescription : function(item){

			if(item.hasOwnProperty('sourceResource')) {

				if(item['sourceResource'].hasOwnProperty('description')) {

					if(typeof item['sourceResource']['description'] == 'object') {

						if(item['sourceResource']['description'][0] != '') {

							return item['sourceResource']['description'][0];

						}

					}

					if(item['sourceResource']['description'] != '') {

						return item['sourceResource']['description'];
						
					}

				} else {

					return '';

				}

			} else {

				return '';

			}

		},

		getDatation : function(item){

			if(item.hasOwnProperty('sourceResource')) {

				if(item['sourceResource'].hasOwnProperty('date')) {

					if(item['sourceResource']['date'].hasOwnProperty('displayDate')) {

						if(item['sourceResource']['date']['displayDate'] != '') {

							return item['sourceResource']['date']['displayDate'];

						}

					}

				}

			}

			return '';

		},

		getImage : function(item){

			if(item.hasOwnProperty('object')) {

				return item['object'];

			} else {

				return 'img/missing-dpla.jpg';

			}

		},

		getScore : function(item){

			if(item.hasOwnProperty('score')) {

				return item['score'];

			}

			return '';

		},

		getType : function(item){

			if(item.hasOwnProperty('sourceResource')) {

				if(item['sourceResource'].hasOwnProperty('type')) {

					return item['sourceResource']['type'];

				}

			}

			return '';

		},

		getSource : function(item){

			if(item.hasOwnProperty('isShownAt')) {

				return item['isShownAt'];

			}

			return '';

		},

		checkResult : function(data) {

			if(data['count'] > 0) {

				return {
					total : data['count'],
					objects : data['docs'],
					limit : data['limit'],
					start : data['start']
				}

			} else {

				return null

			}

		},

		parseCollection : function(results) {

			var items = results,
				nbrItems = items.length,
				reformatItems = [];

			for(var i=0; i<nbrItems; i++) {

				var item = items[i];

				reformatItems.push({
					'id' : factory.getId(item),
					'title' : factory.getTitle(item),
					'desc' : factory.getDescription(item),
					'date' : factory.getDatation(item),
					'image' : factory.getImage(item),
					'link' : factory.getLink(factory.getId(item)),
					'score' : factory.getScore(item),
					'source' : factory.getSource(item),
					'type' : factory.getType(item),
					'api' : 'dpla'
				});

			}

			return reformatItems;

		}, 

		isMoreObjAvailable : function() {
			return ItemsService.getInfoDPLA()['items'] >= ItemsService.getInfoDPLA()['total'];
		}

	}

	return factory;

});;wudApp.factory('FavoritesService', function(CollectionsService){

	var factory = { 

		favoritesArr : [],
 
		addFavorite : function(current) {

			// checking if any previous favorites registered in storage
			factory.favoritesArr = factory.getFavoritesList();

			factory.favoritesArr.unshift(CollectionsService.getItemById(current));
			localStorage.setItem('favorites', JSON.stringify(factory.favoritesArr));
		},

		getFavoritesList : function() {

			if(localStorage.getItem('favorites') != '' && localStorage.getItem('favorites') != null) {

				factory.favoritesArr = JSON.parse(localStorage.getItem('favorites'));

			} else {

				factory.favoritesArr = [];

			}

			return factory.favoritesArr;
		},
 
		removeFavorite : function(current) {

			factory.favoritesArr = factory.getFavoritesList();
			
			if(factory.favoritesArr.length > 0) {

				for(var i=0; i<factory.favoritesArr.length; i++) {

					var currentIndex = -1;
						
					if(factory.favoritesArr[i]['id'] === current) {

						currentIndex = i;
						factory.favoritesArr.splice(currentIndex, 1);
						localStorage.setItem('favorites', JSON.stringify(factory.favoritesArr));
						break;

					}

				}

			} else {

				return false;

			}
		},

		isFavorite : function(currentID) {

			factory.favoritesArr = factory.getFavoritesList();
			
			if(factory.favoritesArr.length > 0) {

				for(var i=0; i<factory.favoritesArr.length; i++) {

					if(factory.favoritesArr[i]['id'] == currentID) {
						return true; 
					} 

				}

			} 

			return false;
		},

		getComment : function(currentID) {

			factory.favoritesArr = factory.getFavoritesList();
			
			if(factory.favoritesArr.length > 0) {

				for(var i=0; i<factory.favoritesArr.length; i++) {

					if(factory.favoritesArr[i]['id'] == currentID) {
						
						if(factory.favoritesArr[i]['comment'] != undefined) {
							return factory.favoritesArr[i]['comment'];
						}

					} 

				}

			} 

		},

		checkCommentOnFavorites : function(currentID) {

			factory.favoritesArr = factory.getFavoritesList();
			
			if(factory.favoritesArr.length > 0) {

				for(var i=0; i<factory.favoritesArr.length; i++) {

					if(factory.favoritesArr[i]['id'] == currentID) {
						
						if(factory.favoritesArr[i]['comment'] != undefined) {
							return true;
						}

					} 

				}

			} 

			return false;
		},

		deleteComment : function(currentID) {

			factory.favoritesArr = factory.getFavoritesList();
			
			if(factory.favoritesArr.length > 0) {

				for(var i=0; i<factory.favoritesArr.length; i++) {

					if(factory.favoritesArr[i]['id'] == currentID) {
						
						if(factory.favoritesArr[i]['comment'] != undefined) {
							factory.favoritesArr[i]['comment'] = '';
							delete factory.favoritesArr[i]['comment'];
							localStorage.setItem('favorites', JSON.stringify(factory.favoritesArr));
						}

					} 

				}

			} 

			return false;
		},

		getCurrentNbrFavorites : function() {

			factory.favoritesArr = factory.getFavoritesList();

			return factory.favoritesArr.length;
		},

		resetFavoritesList : function() {

			factory.favoritesList = [];
			localStorage.clear();
		},

		addCommentOnFavorite : function(params) {

			factory.favoritesArr = factory.getFavoritesList();

			if(factory.favoritesArr.length > 0) {

				for(var i=0; i<factory.favoritesArr.length; i++) {

					if(factory.favoritesArr[i]['id'] == params.id) {

						factory.favoritesArr[i]['comment'] = '';
						factory.favoritesArr[i]['comment'] = params.comment;
						localStorage.setItem('favorites', JSON.stringify(factory.favoritesArr));

					} 

				}

			} 
		}

	};

	return factory;

}); ;wudApp.factory('ItemsService', function(){

	var factory = {

		currentSearch : '',
		currentItemsDpla : 0,
		totalItemsDpla : 0,
		currentItemsEDM : 0,
		totalItemsEDM : 0,
		allCurrentItems : 0,

		/* SEARCH */
		setCurrentSearch : function(current) {

			factory.currentSearch = current;

		},

		getCurrentSearch : function() {
			return factory.currentSearch;
		},

		/* EDM */
		setCurrentItemsEDM : function(items) {
			factory.currentItemsEDM == 0 ? factory.currentItemsEDM = items : factory.currentItemsEDM += items;
		},

		setTotalItemsEDM : function(total) {
			factory.totalItemsEDM = total;
		},

		updateInfoEDM : function(edmObj) {
			factory.setCurrentItemsEDM(edmObj['limit']);
			factory.setTotalItemsEDM(edmObj['total']);
		},

		getInfoEDM : function() {
			return {
				items : factory.currentItemsEDM,
				total : factory.totalItemsEDM
			}
		},

		/* DPLA */ 
		setCurrentItemsDPLA : function(items) {

			if(items['limit'] >= items['total']) {

				factory.currentItemsDpla = items['total'];

			} else {

				if((factory.currentItemsDpla + items['limit']) >= items['total']) {

					factory.currentItemsDpla += items['total'] % items['limit'];

				} else {

					factory.currentItemsDpla += items['limit']; 

				}
				
			}
	 
		},

		setTotalItemsDPLA : function(item) {
			factory.totalItemsDpla = item['total'];
		},

		updateInfoDPLA : function(dplaObj) {
			factory.setTotalItemsDPLA(dplaObj);
			factory.setCurrentItemsDPLA(dplaObj);
		},

		getInfoDPLA : function() {
			return {
				items : factory.currentItemsDpla,
				total : factory.totalItemsDpla
			}
		},

		sortObjectsByScore : function(p_array) {
			return p_array.sort(function(a, b){ return parseFloat(b.score) - parseFloat(a.score) });
		},

		/* ALL */
		resetItemsCount : function() {
			factory.currentItemsDpla = 0,
			factory.totalItemsDpla = 0,
			factory.currentItemsEDM = 0,
			factory.totalItemsEDM = 0,
			factory.allCurrentItems = 0;
		}, 

		getInfo : function() {
			return {
				items : factory.currentItemsDpla + factory.currentItemsEDM,
				total : factory.totalItemsDpla + factory.totalItemsEDM,
				edm : factory.totalItemsEDM,
				dpla : factory.totalItemsDpla,
				search : factory.currentSearch
			}
		}

	}

	return factory;

});;wudApp.factory('MainDataService', function(DataDPLAService, DataEDMService, ItemsService, $http, $q){

	var factory = {

		apiData : {
			'edm' : {},
			'dpla' : {}
		},

		loadMoreState : false,

		setRequest : function(params) {
 
			var deferred = $q.defer();

			// Old methods
			// var promiseDPLA = $http({method : 'GET', url : params['dpla']});
			// var promiseEDM = $http({method : 'GET', url : params['edm']});

			// Setting Promises 
			var promiseDPLA = $http.jsonp(params['dpla']+'&callback=JSON_CALLBACK');
			var promiseEDM = $http.jsonp(params['edm']+'&callback=JSON_CALLBACK');

			var promiseList = [promiseDPLA, promiseEDM];

			$q.all(promiseList).then(function(response){

				// console.log(response[0].data);
				// console.log(response[1].data);

				factory.apiData.dpla = response[0].data;
				factory.apiData.edm = response[1].data;
				deferred.resolve(factory.apiData);

			}, function(error){

				return deferred.reject('Probleme');

			});

			return deferred.promise;
 
		},

		checkResults : function(data) {

			// checking result DPLA & Europeana
			var checkedResultDPLA = DataDPLAService.checkResult(data['dpla']);
			var checkedResultEDM = DataEDMService.checkResult(data['edm']);

			return {
				'edm' : checkedResultEDM,
				'dpla' : checkedResultDPLA
			}

		},

		checkCollections : function(object) {

			var dplaCollection = '',
				edmCollection = '';

			if(object.hasOwnProperty('edm')) {

				if(object['edm'] != null) {

					// update info europeana
					ItemsService.updateInfoEDM(object['edm']);

					// set europeana collection
					edmCollection = DataEDMService.parseCollection(object['edm']['objects']);

				}

			}

			if(object.hasOwnProperty('dpla')) {

				if(object['dpla'] != null) {

					// update info dpla
					ItemsService.updateInfoDPLA(object['dpla']);

					// set dpla collection
					dplaCollection = DataDPLAService.parseCollection(object['dpla']['objects']);

				}

			}

			// If europeana and dpla are present in collection
			if(edmCollection && dplaCollection) {

				// Merge Collections
				var mergedCollections = edmCollection.concat(dplaCollection);

				// Get btn load more state DPLA and EDM
				DataEDMService.isMoreObjAvailable() && DataDPLAService.isMoreObjAvailable() ? factory.loadMoreState = false : factory.loadMoreState = true;

				// Return merged collections sorted by score
				return ItemsService.sortObjectsByScore(mergedCollections);

			} else {


				if(edmCollection) { 

					// get btn load more state EDM
					DataEDMService.isMoreObjAvailable() ? factory.loadMoreState = false : factory.loadMoreState = true;

					// if europeana is present in collection
					return edmCollection;

				} else if(dplaCollection) {

					// get btn load more state DPLA
					DataDPLAService.isMoreObjAvailable() ? factory.loadMoreState = false : factory.loadMoreState = true;

					// if dpla is present in collection
					return dplaCollection;

				}

				return false;

			}

		}

	}

	return factory;

});;wudApp.factory('ModalService', function(){

	var factory = {

		onerror :  {
			title : 'Oups : "Unavailable Services"',
			message : '<strong>Message : </strong><p>Please come back later</p>'
		},

		onnoresults : {
			title : 'Oups : "no matching results"',
			message : '<strong>Message : </strong><p>0 results</p>'
		},

		onload : {
			title : 'Loading data...',
			message : '<div id="loader-wrap"><img src="img/ajax-loader.gif" alt=""></div>'
		}

	};

	return factory;

});;wudApp.factory('OptionsService', function(){

	var factory = {

		optionsDPLA : {},
		optionsEDM : {},

		resetOptions : function() {
			factory.optionsDPLA = {};
			factory.optionsEDM = {};
		},

		setYearRangeDPLA : function(range) {

			var min = 0,
				max = range['max'];

			// default value min = 1
			range['min'] == 0 ? min = 1 : min = range['min'];

			return '&sourceResource.date.after='+min+'&sourceResource.date.before='+max;
		},

		parseMinAndMax : function(val) {

			var parsedValue = '';

			if(val < 999) {

				var valLth = val.toString().length;

				switch(valLth) {

					case 1 :
						parsedValue = '000' + val;
						break;
					case 2 :
						parsedValue = '00' + val;
						break;
					case 3 :
						parsedValue = '0' + val;
						break;

				}

			} else {

				parsedValue = val;

			}



			return parsedValue;
		},

		setYearRangeEDM : function(range) {

			var min = factory.parseMinAndMax(range['min']),
				max = factory.parseMinAndMax(range['max']);

			return '&qf=YEAR:['+min+'+TO+'+max+']';
		},

		setLanguageDPLA : function(languages) {
			
			var languageOptions = '';

			for(var i=0; i<languages.length; i++) {

				if(languages[i]['state'] == true) {

					languageOptions = '&sourceResource.language=' + languages[i]['title'];

				}

			}

			return languageOptions;
		},

		setLanguageEDM : function(languages) {

			var languageOptions = '';

			for(var i=0; i<languages.length; i++) {

				if(languages[i]['state'] == true) {

					languageOptions = '&qf=LANGUAGE:' + languages[i]['title'];

				}

			}

			return languageOptions;
		},

		setMediaTypesEDM : function(mediatypes) {

			var mediaOption = '';

			for(var i=0; i<mediatypes.length; i++) {

				if(mediatypes[i]['state'] == true) {

					mediaOption += '&qf=TYPE:' + mediatypes[i]['title'];

				}				

			}

			return mediaOption;
		},

		setMediaTypesDPLA : function(mediatypes) {

			var mediaOption = '';

			for(var i=0; i<mediatypes.length; i++) {

				if(mediatypes[i]['state'] == true) {

					mediatypes[i]['title'] == 'video' ? mediatypes[i]['title'] = 'moving image' : mediatypes[i]['title'] = mediatypes[i]['title'];

					mediaOption += '&sourceResource.type=' + mediatypes[i]['title'];

				}				

			}

			return mediaOption;
		},

		setOptionsDPLA : function(values) {

			var options = values;

			// Check timeline
			if(options.hasOwnProperty('timeline')) {

				if(options['timeline'] != null) { 

					factory.optionsDPLA['timeline'] = factory.setYearRangeDPLA(options['timeline']);

				}

			}

			// Check mediatypes
			if(options.hasOwnProperty('mediatypes')) {

				if(options['mediatypes'] != null) {

					factory.optionsDPLA['mediatypes'] = factory.setMediaTypesDPLA(options['mediatypes']);

				}

			}

			// Check lang
			if(options.hasOwnProperty('languages')) {

				if(options['languages'] != null) {

					factory.optionsDPLA['languages'] = factory.setLanguageDPLA(options['languages']);

				}
				

			}

		},

		setOptionsEDM : function(values) {

			var options = values;

			// Check mediatypes
			if(options.hasOwnProperty('mediatypes')) {

				if(options['mediatypes'] != null) {

					factory.optionsEDM['mediatypes'] = factory.setMediaTypesEDM(options['mediatypes']);

				}

			}

			// Check timeline
			if(options.hasOwnProperty('timeline')) {

				if(options['timeline'] != null) {

					factory.optionsEDM['timeline'] = factory.setYearRangeEDM(options['timeline']);

				}

			}

			// Check lang
			if(options.hasOwnProperty('languages')) {

				if(options['languages'] != null) {
					factory.optionsEDM['languages'] = factory.setLanguageEDM(options['languages']);
				}
				

			}

		},

		getOptions : function() {

			return {
				dpla : factory.optionsDPLA,
				edm : factory.optionsEDM
			}
		}

	};

	return factory;

});;wudApp.factory('OptionsMenuService', function(){

	var factory = {

		menuElements : [
			{
				title : 'timeline',
				state : false,
				status : false,
				icon : 'icon-hourglass-1'
			},
			{
				title : 'mediatypes',
				state : false,
				status : false,
				icon : 'icon-doc'
			},
			{ 
				title : 'languages',
				state : false,
				status : false,
				icon : 'icon-globe-4'
			},
			{
				title : 'favorites',
				state : false,
				status : false,
				icon : 'icon-heart-empty'
			}
		],

		subcontentState : false,
		lastSelectedElem : '',

		getSubcontentState : function() {

			return factory.subcontentState;

		},

		setOptionsMenuState : function(current) {
			
			// if last elem selected is the same as current = togglestate
			if(factory.lastSelectedElem == current) {

				factory.subcontentState = !factory.subcontentState;
 
			} else {

				factory.subcontentState = true;				

			}

			for(var i=0; i<factory.menuElements.length; i++) {

				// reset any previous state
				factory.menuElements[i]['state'] = false;

				if(factory.menuElements[i]['title'] == current) {

					// set state current elem
					factory.menuElements[i]['state'] = true;

				}

			}

			// set last selected element
			factory.lastSelectedElem = current;
			
			if(factory.subcontentState == false) { 
				factory.resetOptionMenuState();
			}

		},

		getOptionsMenu : function() {
			return factory.menuElements;
		},

		getOptionsStateByMenuTitle : function(title) {

			for(var i=0; i<factory.menuElements.length; i++) {

				if(factory.menuElements[i]['title'] == title) {

					// get state current title
					return factory.menuElements[i]['state'];

				}

			}

		},

		resetOptionMenuState : function() {
			for(var i=0; i<factory.menuElements.length; i++) {
				factory.menuElements[i]['state'] = false;
			}
		},

		closeSubcontent : function() {
			factory.resetOptionMenuState();
			factory.subcontentState = false;
		},

		/* timeline */

		timelineValues : '0;2000',

		timelineVal : '',
		isTimelineActive : false,

		getTimelineValues : function() {

			return factory.timelineVal;

		},

		resetTimelineValues : function() {

			return '0;2000'

		},

		getStatusTimeline : function() {

			return factory.isTimelineActive;

		},

		setTimeline : function(data) {

			var values = data.toString().split(";"),
				valueMin = values[0],
				valueMax = values[1];

			if(valueMin > 0 || valueMax < 2000) {

				factory.isTimelineActive = true;

				factory.menuElements[0]['status'] = true;

				factory.timelineVal = {min : valueMin, max : valueMax};

			} else {

				factory.isTimelineActive = false;

				factory.menuElements[0]['status'] = false;

			}
			
		},

		getTimeline : function() {
			return {
				min : factory.timelineVal.from,
				max : factory.timelineVal.to
			};
		},

		/* mediatypes */

		mediatypesElements : [
			{
				title : 'text',
				state : false,
				icon : 'icon-doc-text'
			},
			{
				title : 'image',
				state : false,
				icon : 'icon-picture'
			},
			{
				title : 'video',
				state : false,
				icon : 'icon-videocam'
			},
			{
				title : 'sound',
				state : false,
				icon : 'icon-volume-off'
			}
		],

		isMediatypesActive : false,

		setMediatypesStatus : function(val) {

			if(val) {
				factory.menuElements[1]['status'] = true;
				factory.isMediatypesActive = true;
			} else {
				factory.menuElements[1]['status'] = false;
				factory.isMediatypesActive = false;
			}			

		},

		getStatusMediatypes : function() {

			return factory.isMediatypesActive;

		},

		getMediatypesElements : function() {
			return factory.mediatypesElements;
		},

		resetMediatypesElements : function() {
			for(var i=0; i<factory.mediatypesElements.length; i++) {
				factory.mediatypesElements[i]['state'] = false;
			}
		},

		/* languages */

		languagesElements : [

			{
				title : 'english',
				img : 'gb.png',
				state : false
			},
			{
				title : 'french',
				img : 'fr.png',
				state : false
			},
			{
				title : 'german',
				img : 'de.png',
				state : false
			},
			{
				title : 'spanish',
				img : 'es.png',
				state : false
			}

		],

		isLanguagesActive : false,

		getLanguagesElements : function() {
			return factory.languagesElements;
		},

		setLanguagesState : function(current) {
			for(var i=0; i<factory.languagesElements.length; i++) {
				factory.languagesElements[i]['state'] = false;
				if(factory.languagesElements[i]['title'] == current) {
					factory.languagesElements[i]['state'] = true;
					factory.menuElements[2]['status'] = true;
					factory.isLanguagesActive = true;
				}
			}
		},

		resetLanguagesState : function() {
			for(var i=0; i<factory.languagesElements.length; i++) {
				factory.languagesElements[i]['state'] = false;
			}

			factory.menuElements[2]['status'] = false;
			factory.isLanguagesActive = false;
		},

		getStatusLanguages : function() {

			return factory.isLanguagesActive;

		}
		/* favorites */

	};

	return factory;

});;wudApp.factory('PaginationService', function(){

	var factory = {

		pageDpla : 0, 
		pageSizeDpla : 0,
		startEDM : 0,
		rowsEDM : 0,

		incrementPageDpla : function() {
			factory.pageDpla++;
		},

		incrementStartEDM : function() {
			factory.startEDM = factory.rowsEDM + factory.startEDM;
		},

		resetPagination : function() {
			factory.pageDpla = 1;
			factory.pageSizeDpla = 12,
			factory.startEDM = 1, 
			factory.rowsEDM = 12;
		},

		getCurrentPagination : function() {
			return {
				dpla : '&page='+factory.pageDpla+'&page_size='+factory.pageSizeDpla,
				edm : '&start='+factory.startEDM+'&rows='+factory.rowsEDM+'&qt=false'
			}
		},

		updatePagination : function() {
			factory.incrementPageDpla();
			factory.incrementStartEDM();
		}

	};

	return factory;

});;wudApp.controller('SearchController', function($scope, $rootScope, $modal, $window, MainDataService, CollectionsService, DataDPLAService, DataEDMService, FavoritesService, ItemsService, ModalService, OptionsService, OptionsMenuService, PaginationService){

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











;// Simple CRUD on Comments
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

});;wudApp.directive('favoriteLinkList', function($rootScope, FavoritesService){

	return {
		restrict : 'A',
		scope : {
			sourceId : '@'
		},
		link : function(scope, elem, attrs) {

			// when favorites is triggered from detail
			$rootScope.$on('favoritesEventDetail', function(e, args){

				e.preventDefault();

				if(attrs.sourceId == args['id']) {
					
					switch(args['state']) {
						case true:
						elem.addClass('active');
						break;
						case false:
						elem.removeClass('active');
						break;
					}
				}

			});

			// when delete all favorites is triggered
			$rootScope.$on('deleteAllFavorites', function(){

				elem.removeClass('active');

			});

			attrs.$observe('sourceId', function(val){

				// favorite check on list on load
				if(FavoritesService.isFavorite(val)) {
					elem.addClass('active');
				} else {
					elem.removeClass('active');
				}

			});

			elem.bind('click', function(e){

				e.preventDefault();
				
				var isFavorited = false;

				var currentID = scope.sourceId;

				// check if current data-id is on favorites
				if(FavoritesService.isFavorite(currentID)) { 
					FavoritesService.removeFavorite(currentID);
					elem.removeClass('active');
					isFavorited = false;
				} else {
					FavoritesService.addFavorite(currentID);
					elem.addClass('active');
					isFavorited = true;
				}

				$rootScope.$broadcast('favoritesEventList', {id : currentID, state : isFavorited});

				// update favorites count indicator
				if(FavoritesService.getCurrentNbrFavorites() > 0) {
					$rootScope.favoritesIndicator = FavoritesService.getCurrentNbrFavorites();
				} else {
					$rootScope.favoritesIndicator = '';
				}

				$rootScope.$apply();

			});
		}
		
	}

}); 

wudApp.directive('favoriteLinkDetail', function($rootScope, FavoritesService){

	return {
		restrict : 'A',
		scope : {
			sourceId : '@'
		},
		// require : 'favoriteLinkList',
		link : function(scope, elem, attrs) {
			
			// when favorites is triggered from list
			$rootScope.$on('favoritesEventList', function(e, args){

				e.preventDefault(); 

				if(attrs.sourceId == args['id']) {
					switch(args['state']) {
						case true:
						elem.children('#favorite-icon').addClass('icon-heart-3 active');
						break;
						case false:
						elem.children('#favorite-icon').removeClass('icon-heart-3 active');
						break;
					}
				}

			});

			// when delete all favorites is triggered
			$rootScope.$on('deleteAllFavorites', function(){

				elem.children('#favorite-icon').removeClass('icon-heart-3 active');

			});

			attrs.$observe('sourceId', function(val){

				// favorite check on list on load
				if(FavoritesService.isFavorite(val)) {
					elem.children('#favorite-icon').addClass('icon-heart-3 active');
				} else {
					elem.children('#favorite-icon').removeClass('icon-heart-3 active');
				}

			});

			elem.bind('click', function(e){

				e.preventDefault();

				var isFavorited = false;

				var currentID = scope.sourceId;

				// check if current data-id is on favorites
				if(FavoritesService.isFavorite(currentID)) {
					FavoritesService.removeFavorite(currentID);
					elem.children('#favorite-icon').removeClass('icon-heart-3 active');
					isFavorited = false;
				} else {
					FavoritesService.addFavorite(currentID);
					elem.children('#favorite-icon').addClass('icon-heart-3 active');
					isFavorited = true;
				}

				$rootScope.$broadcast('favoritesEventDetail', {id : currentID, state : isFavorited});
				
				// update favorites count indicator
				if(FavoritesService.getCurrentNbrFavorites() > 0) {
					$rootScope.favoritesIndicator = FavoritesService.getCurrentNbrFavorites();
				} else {
					$rootScope.favoritesIndicator = '';
				}

				$rootScope.$apply();

			});
		}
	}

});

wudApp.directive('stopEvent', function(){
	return {
		restrict : 'A',
		link : function(scope, elem, attrs) {
			elem.bind('click', function(e){
				e.stopPropagation();
			});
		}
	}
});;wudApp.directive('cancelSearch', function(){

	return {
		restrict : 'C',
		link : function(scope, element, attrs) {

			element.bind('click', function(e){

				// empty input
				scope.basicquery = '';

				// hide cancel btn basic
				scope.$apply('cancelbasicbtn = true');

				// focus input on cancel
				element.parent().find('input')[0].focus();

			});

		}
 
	}

});

wudApp.directive('cancelBooleanFirst', function(){

	return {
		restrict : 'C',
		link : function(scope, element, attrs) {

			element.bind('click', function(e){

				// empty input
				scope.booleanquery.first = '';

				// hide cancel btn boolean first
				scope.$apply('cancelfirstbtn = true');

				// set focus on form
				element.parent().find('input')[0].focus();

			});

		}
 
	}

});

wudApp.directive('cancelBooleanSecond', function(){

	return {
		restrict : 'C',
		link : function(scope, element, attrs) {

			element.bind('click', function(e){

				// empty input
				scope.booleanquery.second = '';

				// hide cancel btn boolean second
				scope.$apply('cancelsecondbtn = true');

				// set focus on form
				element.parent().find('input')[0].focus();

			});

		}
 
	}

});

wudApp.directive('noLink', function() {
    return {
        restrict: 'C',
        link: function(scope, elem, attrs) {
            if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
                elem.on('click', function(e){
                    e.preventDefault();
                });
            }
        }
   };
});

// hide boolean inputs on certain width
wudApp.directive('mobileSearchType', function($window, $rootScope) {
    return {
    	restrict : 'A',
        link: function(scope, element, attrs) {

            angular.element($window).bind('resize', function(e){

            	// $rootScope
            	

            	if($window.innerWidth < 660) {

					$rootScope.basicinput = true;
					$rootScope.booleaninput = false;
					$rootScope.linkbasicclass = true;
					$rootScope.linkbooleanclass = false;

				}

            });
        }
   };
});
;wudApp.directive('infoCollapse', function(){

	return {
		restrict : 'A',
		controller : function($scope) {

			$scope.isCollapsed = true;

		}
	}

});;wudApp.directive('optionsMenu', function($rootScope, FavoritesService, OptionsMenuService){

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
;// update classes on scroll event
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

});;/* spinner load more items list */
var spinnerlist = document.getElementById('spinnerlist');
var spinnerL = new Spinner({
  lines: 13, // The number of lines to draw
  length: 7.5, // The length of each line
  width: 2.5, // The line thickness
  radius: 10, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#FFF', // #rgb or #rrggbb or array of colors
  speed: 1.5, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
}).spin(spinnerlist);

/* spinner load more detail (europeana) */
var spinnerdetail = document.getElementById('spinnerdetail');
var spinnerD = new Spinner({
  lines: 13, // The number of lines to draw
  length: 7.5, // The length of each line
  width: 2.5, // The line thickness
  radius: 10, // The radius of the inner circle
  corners: 1, // Corner roundness (0..1)
  rotate: 0, // The rotation offset
  direction: 1, // 1: clockwise, -1: counterclockwise
  color: '#FFF', // #rgb or #rrggbb or array of colors
  speed: 1.5, // Rounds per second
  trail: 60, // Afterglow percentage
  shadow: false, // Whether to render a shadow
  hwaccel: false, // Whether to use hardware acceleration
  className: 'spinner', // The CSS class to assign to the spinner
  zIndex: 2e9, // The z-index (defaults to 2000000000)
  top: '50%', // Top position relative to parent
  left: '50%' // Left position relative to parent
}).spin(spinnerdetail);

/* init ionRangeSlider */
$("#year-range").ionRangeSlider({
    hide_min_max: true,
    keyboard: true,
    min: 0,
    max: 2000,
    from: 0, 
    to: 2000,
    type: 'double',
    step: 10,
    prefix: "",
    grid: true
});

/* register reset event on timeline */
$('#reset-timeline').on('click', function(e){

  e.preventDefault();

  $("#year-range").data('ionRangeSlider').reset();

});
