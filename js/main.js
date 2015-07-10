
// = Highlight JS - for syntax highlighting
//-----------------------------------------------------------------------------//

$('.owl-carousel--responsive').owlCarousel({
    loop: true,
    margin: 20,
    nav: true,
    responsiveClass: true,
    responsive: {
        0: {
            items: 1,
        },
        600: {
            items: 3,
        },
        1000: {
            items: 4,
        }
    }
});

$('.owl-carousel--basic').owlCarousel({
    items: 1,
    animateOut: 'fadeOut',
    lazyLoad:true,
    loop: $('.owl-carousel--basic .item').length > 1,
    margin: 0,
    navElement: 'button',
    nav: $('.owl-carousel--basic .item').length > 1,
    dots: $('.owl-carousel--basic .item').length > 1,
    mouseDrag:false,
    pullDrag:false,
});
$('.owl-carousel--quotes').owlCarousel({
    items: 1,
    loop: $('.owl-carousel--quotes .item').length > 1,
    margin: 0,
    navElement: 'button',
    nav: $('.owl-carousel--quotes .item').length > 1,
    dots: $('.owl-carousel--quotes .item').length > 1,
    autoHeight:true,
    mouseDrag:false,
    pullDrag:false,
});



    // = Isotope
    //-----------------------------------------------------------------------------//

    $('.isotope').isotope({
        itemSelector: '.isotope-item',
        layoutMode: 'fitRows',
        transitionDuration: 0,
        hiddenStyle: {
            opacity: 0
        },
        visibleStyle: {
            opacity: 1
        }
    }),
    $(".filters").on("click", "button", function () {
        var a = $(this).attr("data-filter");
        $(".isotope").isotope({ filter: a })
    });

          
    // = The Wall
    //-----------------------------------------------------------------------------//
/*
    var wall = $('.GITheWall').GITheWall({
        // Callbacks API
        onBeforeInit: null,
        onReady: null,
        onViewPortUpdate: null,
        onItemChange: null,
        onDestroy: null,
        onShow: null,
        onHide: null,
        onContentLoading: null,
        onContentLoaded: null,
        margin: {
            top: 10,
            bottom: 10
        },
        scrollerElm: null,
        scrollOffset: 400,
        // settings
        arrows: true,
        closebutton: true,
        keyboardNavigation: true,
        animationSpeed: 300,
        autoscroll: true,
        responsive: true,
        initialWrapperHeight: 600,
        dynamicHeight: true,
        nextButtonClass: 'icon-angle-right',
        prevButtonClass: 'icon-angle-left',
        closeButtonClass: 'icon-cancel'
    });
*/
    function init() {
        window.addEventListener('scroll', function(e){
            var distanceY = window.pageYOffset || document.documentElement.scrollTop,
                shrinkOn = 300,
                header = document.querySelector(".site-header");
            if (distanceY > shrinkOn) {
                classie.add(header,"site-header--smaller");
            } else {
                if (classie.has(header,"site-header--smaller")) {
                    classie.remove(header,"site-header--smaller");
                }
            }
        });
    }
    window.onload = init();

    jQuery(document).ready(function($){
        var timelineBlocks = $('.cd-timeline-block'),
          offset = 0.8;

        //hide timeline blocks which are outside the viewport
        hideBlocks(timelineBlocks, offset);

        //on scolling, show/animate timeline blocks when enter the viewport
        $(window).on('scroll', function(){
            (!window.requestAnimationFrame) 
              ? setTimeout(function(){ showBlocks(timelineBlocks, offset); }, 100)
              : window.requestAnimationFrame(function(){ showBlocks(timelineBlocks, offset); });
        });

        function hideBlocks(blocks, offset) {
            blocks.each(function(){
                ( $(this).offset().top > $(window).scrollTop()+$(window).height()*offset ) && $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
            });
        }

        function showBlocks(blocks, offset) {
            blocks.each(function(){
                ( $(this).offset().top <= $(window).scrollTop()+$(window).height()*offset && $(this).find('.cd-timeline-img').hasClass('is-hidden') ) && $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
            });
        }
    });
