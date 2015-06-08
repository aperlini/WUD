wudApp.factory('OptionsService', function(){

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

});