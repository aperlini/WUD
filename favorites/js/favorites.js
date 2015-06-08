jQuery(document).ready(function() {
	var favorites = JSON.parse(localStorage.favorites),
		favoritesLength = favorites.length,
		container = document.getElementById('favoriteslist'),
		output = '';

	for(var i=0; i<favoritesLength; i++) {

		output += '<div class="media favorite-item">';

			output += 	'<div class="media-body favorite-details">';

		for(var key in favorites[i]) {

			if(key == 'image') {

				output += 	'<div class="media-left">';
				output += 		'<div class="panel panel-default">';
				output += 			'<div class="panel-body">';
				output += 					'<img src="'+favorites[i][key]+'" alt="">';
				output +=				'</div>';
				output +=			'</div>';
				output += 	'</div>';

			}

				if(key == 'title') {
				output += '<p class="title">'+favorites[i][key]+'</p><hr>';
			}

				if(key == 'id') {
					output += '<div><span class="label label-primary">Id</span>'+favorites[i][key]+'</div><hr>';
				}

				if(key == 'link') {
					output += 		'<br><p><span class="label label-primary">Link</span><a href="'+favorites[i][key]+'" target="_blank">'+favorites[i][key]+'</a></p><hr>';
				}

				if(key == 'source') {
					output += 		'<p><span class="label label-primary">Source</span><a href="'+favorites[i][key]+'" target="_blank">'+favorites[i][key]+'</a></p>';
				}

				if(key == 'comment') {
					output += '<hr><p><span class="label label-primary">Comment</span>'+favorites[i][key]+'</p>';
				}
			
		}

		output += 	'</div>';
		output +=	'</div>';

		
	}

	container.innerHTML = output;

	$('a.print').on('click', function(e){

		e.preventDefault();

		$('#header-container').remove();

		window.print();
		window.close();
	});
});