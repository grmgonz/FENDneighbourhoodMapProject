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
        website: "https://www.wlu.ca/"
    }, {
        name: "Ryerson University",
        latitude: 43.657657,
        longitude: -79.378805,
        website: "http://www.ryerson.ca/index.html"
    }, {
        name: "OCAD University",
        latitude: 43.651996,
        longitude: -79.389098,
        website: "http://www.ocadu.ca/"
    }, {
        name: "George Brown College",
        latitude: 43.650952,
        longitude: -79.370225,
        website: "http://www.georgebrown.ca/"
    }, {
        name: "Centennial College",
        latitude: 43.653229,
        longitude: -79.383185,
        website: "http://www.centennialcollege.ca/"
    }, {
        name: 'Lighthouse Labs',
        latitude: 43.644645,
        longitude: -79.394973,
        website: "https://www.lighthouselabs.ca/"
    }

];
//VIEW MODEL for utilizing Knockout: http://knockoutjs.com/

var ViewModel = {

    allSchools: ko.observableArray(schools),

    //Displaying infowindow containing content from Wikipedia
    displayWikiInfo: function(marker) {

        infowindow.open(map, marker);
        toggleBounce(marker);

        //Setting the school variable in order to form the Wikipedia Url for each school
        var selectSchool;
        for (var i = 0; i < schools.length; i++) {
            //Position of schools are specified with precise lat & lng coordinates fixed to the function
            if (marker.position.lat().toPrecision(8) == schools[i].latitude.toPrecision(8)
                && marker.position.lng().toPrecision(8) == schools[i].longitude.toPrecision(8)) {
                selectSchool = schools[i].name;
            }

}
    //Append schools to Wikipedia url
        var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + selectSchool +
            '&format=json';



        $.ajax({
            url: wikiUrl,
            dataType: "jsonp"
        }).done(function(data) {
            var info = $(".info");
            info.html("");
            //Set error handling, if Wikipedia doesn't find any info.
            if (data[1].length === 0) {
                info.html("Sorry!!! There is no information related to this school");
            } else {
                var infowindowContent = '<ul>';
                for (var i = 0; i < 1; i++) {

                    var website = "View School's Website Here";

                    if (data[1][i]) {
                        infowindowContent += '<a href="' + data[3][i] + '" target="_blank"><h2>' + data[1][i]
                        + '</h2></a><p>' + data[2][i] + '</p>' + '<p class="via">Info via Wikipedia</p>' + '<h4>' + '<a href=" '
                        + marker.content + '" target="_blank">' + website + '</a>' + '</h4>';
                    }
                }
                infowindowContent += '</ul>';
                info.html(infowindowContent);
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
    //now let's handle the search filter function
    query: ko.observable(''),
    search: function(value) {
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

//Set infowinow content
    infowindow = new google.maps.InfoWindow({
        content: "<div style = 'width:400px;min-height:150px'>" + '<div class="info"></div>' + '<div id ="URLlink"></div>'
    });
//Load Map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 43.658324, lng: -79.370928},
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

     var bounds = new google.maps.LatLngBounds();


     //Loop through KO Observable Array to display markers
    for (var i = 0; i < ViewModel.allSchools().length; i++) {

        //Set variables for map marker
        var title = schools[i].name;
        var URL = schools[i].website;
        var LatLng = new google.maps.LatLng(schools[i].latitude,schools[i].longitude);
        marker[i] = new google.maps.Marker({
            map: map,
            icon: defaultIcon,
            title: name,
            content: URL,
            animation: google.maps.Animation.DROP,
            position: LatLng
        });

        //Add click function to ViewModel functions
        google.maps.event.addListener(marker[i], 'click', function () {
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
        }, 800);
    }
}






// Activates knockout.js
ko.applyBindings(ViewModel);
ViewModel.query.subscribe(ViewModel.search);