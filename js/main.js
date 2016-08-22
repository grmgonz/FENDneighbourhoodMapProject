var map;
var marker = [];
var infowindow;

//List of schools in Toronto
var schools = [

    {
        name: "University of Toronto",
        location: {lat: 43.662891,
        lng: -79.395651}
    }, {
        name: "Wilfred Laurier University",
        location: {lat: 43.648409,
        lng: -79.383386}
    }, {
        name: "Ryerson University",
        location: {lat: 43.657657,
        lng: -79.378805}
    }, {
        name: "OCAD University",
        location: {lat: 43.651996,
        lng: -79.389098}
    }, {
        name: "George Brown College",
        location: {lat: 43.650952,
        lng: -79.370225}
    }, {
        name: "Centennial College",
        location: {lat: 43.653229,
        lng: -79.383185}
    }, {
        name: 'Lighthouse Labs',
        location: {lat: 43.644645,
        lng: -79.394973}
    }

];

// The function to initialize the Google Map
function initMap() {

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

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 43.653229,
            lng: -79.383185
        },
        zoom: 14,
        styles: styles,
        mapTypeControl: false
    })

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

//Create InfoWindow
  infowindow = new google.maps.InfoWindow({
        content: "<div style = 'width:300px;min-height:150px'>" + '<div class="info"></div>'
    });

    for (var i = 0; i < ViewModel.allSchools().length; i++) {
        var position = schools[i].location;
        var title = schools[i].name;
        marker[i] = new google.maps.Marker({
            map: map,
            icon: defaultIcon,
            title: name,
            animation: google.maps.Animation.DROP,
            position: position
        });


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

}

//Function for marker animation
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        window.setTimeout(function() {
            marker.setAnimation(null);
        }, 3000);
    }
}





//VIEW MODEL for utilizing Knockout: http://knockoutjs.com/

var ViewModel = function () {
    var self = this;

    this.allSchools = ko.observableArray(schools),

    //Function for when schools are clicked in the sidebar menu
    this.schoolClicked = function(school) {
        var schoolList;
        for (var i = 0; i < schools.length; i++) {
            if (schools[i].name === school.name) {
                schoolList = i;
            }
        }
        ViewModel.displayWikiInfo(marker[schoolList]);

    },

    //Displaying infowindow containing content from Wikipedia
    this.displayWikiInfo = function(marker) {
          toggleBounce(marker);
        infowindow.open(map, marker);

        //Setting the school variable in order to concatenate the end of the Wiki url.
        var selectSchool;
        for (var i = 0; i < schools.length; i++) {
            //Position of schools are specified with entire lat & lng fixed to the function
            if (marker.position.lat().toFixed(8) == schools[i].latitude.toFixed(8) && marker.position.lng().toFixed(8) == schools[i].longitude.toFixed(8)) {
                selectSchool = schools[i].name;
            }
        }

        var wikiUrl = "https://en.wikipedia.org/w/api.php?callback=?&action=opensearch&limit=20&namespace=0&format=json&search=" + selectSchool;


        $.ajax({
            url: wikiUrl,
            dataType: "jsonp"
        }).done(function(data) {
            var result = $(".info");
            result.html("");
            if (data[1].length === 0) {
                result.html("Sorry!!! There is no information related to this school");
            } else {
                var statusHTML = '<ul>';
                for (var i = 0; i < 1; i++) {

                    if (data[1][i]) {
                        statusHTML += '<a href="' + data[3][i] + '" target="_blank"><h2>' + data[1][i] + '</h2></a><p>' + data[2][i] + '</p>' + '<p class="via">Info via Wikipedia</p>';
                    }
                }
                statusHTML += '</ul>';
                result.html(statusHTML);
            }
        }).fail(function() {
            $(".info").html("Fail to load wiki content");
        });

    },
    //now let's handle the search filter function
    this.query = ko.observable(''),
    this.search = function(value) {
        // remove all the current locations, which removes them from the view
        ViewModel.allSchools([]);
        // remove all marker now, than add them back
        for (var ii = 0; ii < marker.length; ii++) {
            marker[ii].setMap(null);
        }
        console.log(value);
        for (var x in schools) {
            if (schools[x].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                ViewModel.allSchools.push(schools[x]);
                marker[x].setMap(map);
            }
        }
    }
};

// Activates knockout.js
ko.applyBindings(ViewModel);
ViewModel.query.subscribe(ViewModel.search);

