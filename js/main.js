var map;
var marker = [];
var infowindow;


//MODEL
//List of schools in Toronto
var schools = [

    {
        name: 'University of Toronto',
        latitude: 43.662891,
        longitude: -79.395651,
        website: 'https://www.utoronto.ca/'
    }, {
        name: 'Wilfred Laurier University',
        latitude: 43.648409,
        longitude: -79.383386,
        website: 'https://www.wlu.ca/'
    }, {
        name: 'Ryerson University',
        latitude: 43.657657,
        longitude: -79.378805,
        website: 'http://www.ryerson.ca/index.html'
    }, {
        name: 'OCAD University',
        latitude: 43.651996,
        longitude: -79.389098,
        website: 'http://www.ocadu.ca/'
    }, {
        name: 'George Brown College',
        latitude: 43.650952,
        longitude: -79.370225,
        website: 'http://www.georgebrown.ca/'
    }, {
        name: 'Centennial College',
        latitude: 43.653229,
        longitude: -79.383185,
        website: 'http://www.centennialcollege.ca/'
    }, {
        name: 'Lighthouse Labs',
        latitude: 43.644645,
        longitude: -79.394973,
        website: 'https://www.lighthouselabs.ca/'
    }

];

//VIEW
// Function to initialize the Google Map
function initMap(initialize) {
    'use strict';

    //Adding my own style to the map
    var styles = [{
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{
            "color": "#cc66ff"
        }, {
            "lightness": 17
        }]
    }];

    //Set infowinow content
    infowindow = new google.maps.InfoWindow({
        content: "<div style = 'width:300px;min-height:150px'>"
    });
    //Load Map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 43.658324,
            lng: -79.370928
        },
        zoom: 14,
        styles: styles,
        mapTypeControl: false
    });

    //Setting custom markers
    var defaultIcon = {
        url: 'img/school.svg',
        size: new google.maps.Size(64, 64),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 64)
    };

    var highlightedIcon = {
        url: 'img/school2.svg',
        size: new google.maps.Size(64, 64),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 64)
    };


    //Loop through KO Observable Array to display markers
    for (var i = 0; i < ViewModel.allSchools().length; i++) {

        //Set variables for map marker
        var title = schools[i].name;
        var URL = schools[i].website;
        var LatLng = new google.maps.LatLng(schools[i].latitude, schools[i]
            .longitude);
        marker[i] = new google.maps.Marker({
            map: map,
            icon: defaultIcon,
            title: title,
            content: URL,
            animation: google.maps.Animation.DROP,
            position: LatLng
        });

        //Add click function to ViewModel (When both marker and schools from list are clicked)
        google.maps.event.addListener(marker[i], 'click', function() {
            ViewModel.displayWikiInfo(this);

        });

        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        google.maps.event.addListener(marker[i], 'mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        google.maps.event.addListener(marker[i], 'mouseout', function() {
            this.setIcon(defaultIcon);
        });



    }

//Initiate Knockout (The View Model part of the project)

ko.applyBindings(ViewModel);

}



//Function for marker animation
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        window.setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
    }
}


//Added error for loading Google Maps
function googleError() {
    if (typeof $ == "undefined") {
        $("#map").html("Fail to load Google maps");
    } else {
        document.getElementById("map").innerHTML = '<div class="fail">!Sorry, failed to load Google maps...!</div>';
    }
}




//VIEW MODEL for utilizing KO: http://knockoutjs.com/

var ViewModel = {

    //Setting the ko observales linking the data-binding from index.html
    allSchools: ko.observableArray(schools),
    filtering: ko.observable(''),

    //Displaying infowindow containing content from Wikipedia
    displayWikiInfo: function(marker) {

        //Open infowindow
        infowindow.open(map, marker);
        //Call marker animation
        toggleBounce(marker);


        //Setting the school variable in order to form the Wikipedia Url for each school
        var selectSchool;
        for (var i = 0; i < schools.length; i++) {
            //Position of schools are specified with precise lat & lng coordinates fixed to the function
            if (marker.position.lat().toPrecision(8) == schools[i].latitude.toPrecision(
                    8) &&
                marker.position.lng().toPrecision(8) == schools[i].longitude.toPrecision(
                    8)) {
                selectSchool = schools[i].name;
            }


        }
        //Append schools to Wikipedia url
        var wikiUrl =
            'https://en.wikipedia.org/w/api.php?action=opensearch&search=' +
            selectSchool +
            '&format=json';


        //Async AJAX request
        $.ajax({
            url: wikiUrl,
            dataType: "jsonp"
        }).done(function(data) {
             if (infowindow.marker != marker) {
                infowindow.marker = marker;

                var website = "View School's Website Here";


            for (var i = 0; i < 1; i++) {
                if (data[1][i]) {
                    var wikiContent = '<div>' + '<h2>' + marker.title + '</h2>' + '<p>' + data[2][i] + '</p>' +
                        '<a href="' + data[3][1] + '"target="_blank"><p class="via">Info via Wikipedia</p></a>' + '<h4>' +
                        '<a href=" ' +
                        marker.content + '" target="_blank">' + website + '</a>' +
                        '</h4>' + '</div>';
                        infowindow.setContent(wikiContent);

                } else {
                    // Error handling if no Wiki info is found
                    var errorWiki = '<div>' + '<h5>' + "Sorry, we could not find Wikipedia information about this school." + '</h5>' + '</div>';
                      infowindow.setContent(errorWiki);
                  }
            }
        }

        }).fail(function() {
            var fail = '<div>' + '<h5>' + "OOPS, content from Wikipedia has failed to load" + '</h5>' + '</div>';
            infowindow.setContent(fail);
        });

    },


    //Function for when schools are clicked in the sidebar menu
    schoolClicked: function(school) {

        var schoolList;
        for (var i = 0; i < schools.length; i++) {
            if (schools[i].name === school.name) {
                schoolList = i;
            }
          //Append sidebar school list to the Wiki info function in order to open infowindow when clicked
        } ViewModel.displayWikiInfo(marker[schoolList]);
     },

    //Here's the search function with help from: http://opensoul.org/2011/06/23/live-search-with-knockoutjs/ and Udacity Forum

    search: function(value) {
        //Clear all the schools from view
        ViewModel.allSchools([]);

        //Remove markers from view
        for (var r = 0; r < marker.length; r++) {
            marker[r].setVisible(false);
        }
        //Push schools that are being searched and add markers back to map accordingly
        for (var p in schools) {
            if (schools[p].name.toLowerCase().indexOf(value.toLowerCase()) >=
                0) {
                ViewModel.allSchools.push(schools[p]);
                marker[p].setVisible(true);

            }
        }

    }


};




//Special binding for search function
ViewModel.filtering.subscribe(ViewModel.search);