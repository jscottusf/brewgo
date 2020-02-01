//on form click
$('form').on('submit', function(event) {
    event.preventDefault();

    //other code will go here

    //scroll down to #breweries <div>
    $('html, body').animate({
        scrollTop: $("#breweries").offset().top - 50
   }, 500);
})