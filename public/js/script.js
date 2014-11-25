$(document).ready(function(){
	var header_height = $('#header').height();

	/* parallax header */
	function parallax(){
	  var scrolled = $(window).scrollTop();
	  $('#header .backstretch img').css('top',''+-(scrolled*0.6)+'px');
      $('.heading').css('background-position', 'center '+-(scrolled*0.5)+'px');
	}

    /* navbar */
	/*$(window).scroll(function(){
		parallax();
		if($(window).scrollTop() > header_height){
            //$('.navbar').css('border-bottom-color', '#e9573f');
		}else{
            //$('.navbar').css('border-bottom-color', '#fff');
		}
	});*/

    /* scrolltop */
    $('.scroltop').on('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });


    /* masonry layout */
    var $container = $('.container-realestate');
    $container.imagesLoaded( function(){
        $container.masonry();
    });



    /* tooltip */
    $('[rel="tooltip"]').tooltip();





});