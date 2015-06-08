/* spinner load more items list */
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
