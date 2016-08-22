var map;
var marker = [];
var infowindow;

//List of schools in Toronto
var schools = [

    {
        name: "University of Toronto",
        latitude: 43.662891,
        longitude: -79.395651,
        website: "https://www.utoronto.ca/"
    }, {
        name: "Wilfred Laurier University",
        latitude: 43.648409,
        longitude: -79.383386,
         website: "https://www.utoronto.ca/"
    }, {
        name: "Ryerson University",
        latitude: 43.657657,
        longitude: -79.378805,
         website: "https://www.utoronto.ca/"
    }, {
        name: "OCAD University",
        latitude: 43.651996,
        longitude: -79.389098,
         website: "https://www.utoronto.ca/"
    }, {
        name: "George Brown College",
        latitude: 43.650952,
        longitude: -79.370225,
         website: "https://www.utoronto.ca/"
    }, {
        name: "Centennial College",
        latitude: 43.653229,
        longitude: -79.383185,
         website: "https://www.utoronto.ca/"
    }, {
        name: 'Lighthouse Labs',
        latitude: 43.644645,
        longitude: -79.394973,
         website: "https://www.utoronto.ca/"
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

    infowindow = new google.maps.InfoWindow({
        content: "<div style = 'width:300px;min-height:150px'>" + '<div class="info"></div>'
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

     var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < schoolItem().length; i++) {


        var title = schools[i].name;
        var LatLng = new google.maps.LatLng(schools[i].latitude,schools[i].longitude);
        marker[i] = new google.maps.Marker({
            map: map,
            icon: defaultIcon,
            title: name,
            animation: google.maps.Animation.DROP,
            position: LatLng
        });

        google.maps.event.addListener(marker[i], 'click', function () {
        ViewModel.displayWikiInfo(this);
         map.panTo(LatLng);


        });

        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        google.maps.event.addListener(marker[i], 'mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        google.maps.event.addListener(marker[i], 'mouseout', function() {
            this.setIcon(defaultIcon);
        });

  bounds.extend(LatLng);

    }
    map.fitBounds(bounds);
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


var School = function(data) {

    this.name = ko.observable(data.name);
    this.latitude = ko.observable(data.latitude);
    this.longitude = ko.observable(data.longitude);
    this.website = ko.observable(data.website);




};


var ViewModel = function() {
    var self = this;

    this.allSchools = ko.observableArray([]);

//Sets sidebar list
    schools.forEach(function(schoolItem) {
        self.allSchools.push( new School(schoolItem) );
    });


     //Displaying infowindow containing content from Wikipedia
    displayWikiInfo: function(marker) {

        infowindow.open(map, marker);
        toggleBounce(marker);





        //Setting the school variable in order to concatenate the end of the Wiki url.
        var selectSchool;
        for (var i = 0; i < schools.length; i++) {
            //Position of schools are specified with entire lat & lng fixed to the function
            if (marker.position.LatLng().toFixed(8) == schools[i].latitude.toFixed(8),schools[i].longitude.toFixed(8)) {
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


    //Function for when schools are clicked in the sidebar menu
    schoolClicked: function(school) {


        var schoolList;
        for (var i = 0; i < schools.length; i++) {
            if (schools[i].name === school.name) {
                schoolList = i;
            }
        }
        ViewModel.displayWikiInfo(marker[schoolList]);


    },





};

ko.applyBindings(new ViewModel());
