//global variables
let searchLocation;
let cityAndState;
let city = ""; 
let state = "";
let displayCity = "";
let displayCount = 9;
let header;
let imageURL;
let breweryImage = {};
let images;
let randomNum;
var startNum;
let breweries = [];
let breweryData = {};
//found online...not yet being used. Want to write a function that converts state abbreviation to full state name (to increase user friendliness)
const states = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
}
//firebase...in keys.js
firebaseConfig;
//Initialize Firebase
firebase.initializeApp(firebaseConfig);
database = firebase.database();

//search breweryDB API
function searchBreweryDB() {
    var queryURL = 'https://api.openbrewerydb.org/breweries?per_page=50&by_city=' + city + '&by_state=' + state + '&sort=type,-name';
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        type: "GET", 
    }).then(function(response) {
        //clear breweryies array
        breweries = [];
        console.log(response.length);
        var breweriesDiv = ('<div class="col-lg-12" id="breweries">');
        var moreBrewsButton = $('<button type="button" class="btn btn-lg m-3 btn-info" id="more-beer">More breweries</button>');
        if (response.length > 1) {
            header = $('<h2 id="brewery-header">There are ' + response.length + ' breweries in ' + displayCity + '</h2>');
        }
        //not working>
        else if (breweries.length === 0) {
            header = $('<h1 id="brewery-header">There were no breweries found in ' + displayCity + '. Check your spelling or search another city. </h1>');
        }
        else {
            header = $('<h2 id="brewery-header">There is ' + response.length + ' brewery in ' + displayCity + ' </h2>');
        }
        $('#brewery-list').append(header, breweriesDiv, moreBrewsButton);
        //adds one to random image, as there are 100 (0-99) images stored on firebase
        //done like this to keep images consistent, otherwise it keeps generating a new image when new breweries are added. could make user confused.
        startNum = randomNum;
        for (var i = 0; i < displayCount; i++)  {
            if(response[i]) {
                //brewery card info
                var brewCard = $('<div class="mx-0 my-2 brewery-' + i + '" id="card-container" data-number="' + i + '" data-toggle="modal" data-target="#info-modal">');
                $('#breweries').append(brewCard);
                var zip = response[i].postal_code.substr(0,5);
                var addressDiv = $('<div id="address"><i class="fas fa-map-marker-alt"></i> ' + response[i].street + '<br>' + response[i].city + ', ' + response[i].state + ' ' + zip + '</div>')
                var breweryImg = $('<img id="random-img" src="' + images[startNum].url + '" alt="brewery logo">')
                var breweryNameH3 = $('<h3 id="brewery-name">' + response[i].name + '</h3>');
                $(brewCard).append(breweryNameH3, addressDiv, breweryImg);
                startNum += 1;
                //loop through array
                if (startNum > 99) {
                    startNum = 0;
                }
                //create a data array to use for modal
                var breweryName = response[i].name;
                var breweryStreet = response[i].street;
                var breweryCity = response[i].city;
                var breweryState = response[i].state;
                //zip is above
                var breweryLong = response[i].longitude;
                var breweryLat = response[i].latitude;
                var breweryPhone = response[i].phone;
                var breweryUrl = response[i].website_url;
                breweryData = {"name": breweryName, "street": breweryStreet, "city": breweryCity, "state": breweryState, "zip": zip, "longitude": breweryLong, "latitude": breweryLat, "phone": breweryPhone, "url": breweryUrl}
                breweries.push(breweryData);
            }
        }
        console.log(breweries);
    });
}

//reset display
function clearBreweries() {
    $('#breweries').remove();
    $('#brewery-header').remove();
    $('#more-beer').remove();
}

//on form click
$('form').on('submit', function(event) {
    event.preventDefault();
    clearBreweries();
    displayCount = 9;
    //pulls random number for images from firebase
    randomNum = Math.floor(Math.random() * 100);
    searchLocation = $('.search-input').val().trim();
    cityAndState = searchLocation.split(',');
    displayCity = cityAndState[0];
    city = cityAndState[0].split(' ').join('%20');
    if (cityAndState[1] === undefined) {
        state = "";
    }
    else if (cityAndState[1].length <= 3) {
        state = "";
        //var ref = cityAndState[1].trim();
        //state = states.ref;
        //trying to use the state const above to convert abbreviated state name to full state name for search purposes. Keeps coming out as undefined though :( 
    }
    else if (cityAndState[1] != undefined) {
        state = cityAndState[1].trim().split(' ').join('%20');
    }
    //other code will go here
    searchBreweryDB();
    //scroll down to #breweries <div>
    $('html, body').animate({
        scrollTop: $("#brewery-list").offset().top - 50
   }, 500);
   $('.search-input').val('');
});

//on feautured cities click
$('.city-container').on('click', function(event) {
    event.preventDefault();
    clearBreweries();
    //pulls random number for images from firebase
    randomNum = Math.floor(Math.random() * 100);
    displayCount = 9;
    city = $(this).attr('data-city');
    state = $(this).attr('data-state');
    displayCity = $(this).attr('id');
    searchBreweryDB();
    $('html, body').animate({
        scrollTop: $("#brewery-list").offset().top - 50
   }, 500);
});

//add more breweries from same city
$('html, body').on('click', '#more-beer', function(event) {
    event.preventDefault();
    clearBreweries();
    city; 
    state;
    displayCity;
    displayCount += 3;
    searchBreweryDB();
})

$('#brewery-list').on('click', '#card-container', function(event) {
    var dataNum = $(this).attr('data-number');
    $('#brewery').text(breweries[dataNum].name);
    $('#address-info').html('<div id="address"><i class="fas fa-map-marker-alt"></i> ' + breweries[dataNum].street + '<br>' + breweries[dataNum].city + ', ' + breweries[dataNum].state + ' ' + breweries[dataNum].zip + '</div>');
    $('#phone-info').html('<div id="phone"><i class="fas fa-phone"></i>  ' + breweries[dataNum].phone + '</div>')
    $('#website-info').html('<div id="website"><i class="fab fa-safari"></i>  ' + breweries[dataNum].url + '</div>')
})

//I ran a bing images api search and stored 100 generic brewery object image urls in and array called images on firebase
//There images generate randomly at the top of each brewery card
database.ref().on('value', function(snapshot) {
    if (snapshot.child('images').exists()) {
        images = snapshot.val().images;
        console.log(snapshot.val());
        }
    }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
    });

if (!Array.isArray(images)) {
images = [];
}

