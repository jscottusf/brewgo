let searchLocation;
let cityAndState;
let city = ""; 
let state = "";
let displayCity = "";
let displayCount = 9;
let header;
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

function searchBreweryDB() {
    var queryURL = 'https://api.openbrewerydb.org/breweries?by_city=' + city + '&by_state=' + state;
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        type: "GET", 
    }).then(function(response) {
        console.log(response.length);
        var breweries = ('<div class="col-lg-12" id="breweries">');
        if (response.length > 1) {
            header = $('<h2 id="brewery-header">There are ' + response.length + ' breweries in ' + displayCity + '. </h2>');
        }
        //not working>
        if (breweries.length === 0) {
            header = $('<h2 id="brewery-header">There were no breweries found in ' + displayCity + '. Check your spelling or search another city. </h2>');
        }
        else {
            header = $('<h2 id="brewery-header">There is ' + response.length + ' brewery in ' + displayCity + '. </h2>');
        }
        $('#brewery-list').append(header, breweries);
        for (var i = 0; i < displayCount; i++)  {
            var brewCard = $('<div class="bewery-' + i + '">')
            $('#breweries').append(brewCard);
            var breweryName = $('<h3>' + response[i].name + '</h3>');
            console.log(response[i].name);
            $(brewCard).append(breweryName);
        }
    })
}

function clearBreweries() {
    $('#breweries').remove();
    $('#brewery-header').remove();
}

//on form click
$('form').on('submit', function(event) {
    event.preventDefault();
    clearBreweries();
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
})