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

//get location based on brewery address...
//many of the breweryDBs provide coordinates, BUT quite a few don't. This ensures that every brewery location is shown on the map.
function getLocation(address, city, state, zip) {
    var locationSearch = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURI(address) + '%20' + encodeURI(city) + '%20' + encodeURI(state) + '%20' + encodeURI(zip) + '.json?access_token=' + mapBoxApi;
    console.log(locationSearch);
    $.ajax({
        url: locationSearch,
        method: "GET",
    }).then(function(response) {
        console.log(response);
        latitude = response.features[0].center[1];
        longitude = response.features[0].center[0];
        mapBox(longitude, latitude);
        searchZomato(longitude,latitude);
    });
}

//display brewery location on map modal
function mapBox(long, lat) {
    mapboxgl.accessToken = mapBoxApi;
    //display map according to event location
    var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [long, lat],
    zoom: 13
    });
    //display map marker
    new mapboxgl.Marker().setLngLat([long, lat]).addTo(map);
    //allows for full screen map
    map.addControl(new mapboxgl.FullscreenControl());
    //allows to zoom in and zoom out map
    map.addControl(new mapboxgl.NavigationControl());
    map.scrollZoom.disable();
    //initial map is blurry, so calling resize adjusts blur
    map.on('load', function() {
        map.resize();
    });
}


//search breweryDB API
function searchBreweryDB() {
    var queryURL = 'https://api.openbrewerydb.org/breweries?per_page=50&by_city=' + encodeURI(city) + '&by_state=' + encodeURI(state) + '&sort=type,-name';
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
        else if (response.length === 0) {
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

//whatever the user inputs as a city, correct capitalization for display purposes 
function cityCapitalization(str) {
    str = str.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    displayCity = str;
    return displayCity;
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
    city = cityAndState[0];
    //make all letters lowercase and then make each first letter uppercase and return var displayCity;
    cityCapitalization(city);
    if (cityAndState[1] === undefined) {
        state = "";
    }
    else if (cityAndState[1].length === 2 || cityAndState[1].length === 3) {
        var ref = cityAndState[1].trim().toUpperCase();
        state = states[ref];
    }
    else {
        state = cityAndState[1].trim();
    }
    //search breweryDB api
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
    event.preventDefault();
    var dataNum = $(this).attr('data-number');
    var areaCode = breweries[dataNum].phone.substr(0,3);
    var prefix = breweries[dataNum].phone.substr(3,3);
    var lineNum = breweries[dataNum].phone.substr(6,4);
    $('#brewery').text(breweries[dataNum].name);
    $('#address-info').html('<div id="address"><i class="fas fa-map-marker-alt"></i> ' + breweries[dataNum].street + '<br>' + breweries[dataNum].city + ', ' + breweries[dataNum].state + ' ' + breweries[dataNum].zip + '</div>');
    $('#phone-info').html('<div id="phone"><i class="fas fa-phone"></i>  (' + areaCode + ') ' + prefix + '-' + lineNum + '</div>')
    $('#website-info').html('<div id="website"><i class="fab fa-safari"></i> <a href="' + breweries[dataNum].url + '" class="text-dark" target="_blank">' + breweries[dataNum].url + '</a></div>')
    getLocation(breweries[dataNum].street, breweries[dataNum].city, breweries[dataNum].state, breweries[dataNum].zip);
    //dropped the following method...not all brewery locations were provided on brewery DB api...
    //mapBox(breweries[dataNum].longitude, breweries[dataNum].latitude);
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

function searchZomato(){

var foodURL = "https://developers.zomato.com/api/v2.1/search?count=5&lat=" + latitude + "&lon=" + longitude + "&radius=2500&api_key=5b256502a738dbdef9eadd620cd79d8f"

$.ajax({
    url: foodURL,
    headers: {
        "user-key": "5b256502a738dbdef9eadd620cd79d8f",
        "content-type": "application/json"
      },
    method: "GET"
}).then(function(foodR) {
    console.log(foodR);

    var foodResults = foodR.restaurants;

    for (var f = 0; f < foodResults.length; f++) {

        var foodDiv = $("<div>");

        var foodName = $("<p>").text(foodResults[f].restaurant.name);
        var foodRate = $("<p>").text(foodResults[f].restaurant.user_rating.rating_text);
        var foodPrice = $("<p>").text(foodResults[f].restaurant.price_range);
        var foodAddress = $("<p>").text(foodResults[f].restaurant.location.address);

        foodDiv.append(foodName);
        foodDiv.append(foodAddress);
        foodDiv.append(foodRate);
        foodDiv.append(foodPrice);

        $("nearby-restaurants").append(foodDiv);

    }
})}
