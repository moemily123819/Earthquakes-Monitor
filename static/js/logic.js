//  declare all global variables here : 

var today = new Date();
var start = today.getTime() ;

var total = 600000; // 600000 milliseconds
var total_min = roundDown(total/60000);  // 10 min
var progress = 0.00;
var end = start + total;

console.log('start:', start);
console.log('end:', end);

var initial_place = [];
var strongest_quake = 0;

var by_hour_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
var tectonic_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"


var first_round = true;

var map = L.map("map");

var my_control = '';
var earthquakes = new L.layerGroup()
var tectonic_plates = new L.layerGroup()

  // Create the tile layer that will be the background of our map
  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });


  var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });



  var grayscaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });





// Create a baseMaps object to hold the layers
 var baseMaps = {
    "Satellite Map": satelliteMap,
    "Outdoors Map": outdoorsMap,
    "Grayscale Map": grayscaleMap,
  };
    
    
var overlayMaps = '';

createFaultLines();

// functions start here :

// legend colors :

function getColor(scale) {
    return scale > 5 ? '#FA5858' :
           scale > 4 ? '#FA8258' :
           scale > 3 ? '#FAAC58' :
           scale > 2 ? '#F7D358' :
           scale > 1 ? '#F4FA58' :
                       '#D0FA58';
}



// for the size of marker

function markerSize(mag) {
  return mag * 80000;
}



// createMap 

function createMap(earthquakes) {

// Create an overlayMaps object to hold the earthquakes layer
  
  overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": tectonic_plates
  };

  if (first_round == true) {   
  
      map.setView(initial_place, 3);
//      map.addLayer(grayscaleMap);
//      map.addLayer(outdoorsMap);
      map.addLayer(satelliteMap);
      map.addLayer(earthquakes);
      map.addLayer(tectonic_plates);
     
      createLegend(map);

      my_control = L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
      }).addTo(map);
      first_round = false;
     }
  else {
      map.setView(initial_place);   
      map.removeControl(my_control); 
      map.addLayer(earthquakes);
      my_control = L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
      }).addTo(map);
     

       }  // subsequent calls will only set the center of map to the strongest map.
}



// read in data to create markers as anothe layer to the map

function createMarkers(response) {

  var eachFeature = response.features;
    
  console.log('eachFeature:', eachFeature);
  var quakeMarkers = [];
  strongest_quake = 0;

  // Loop through the stations array
  for (var index = 0; index < eachFeature.length; index++) {

    var data = eachFeature[index];
//    console.log('data :', data);

    var mag = data.properties.mag;
    var marker_color = getColor(mag);
    var marker_size = markerSize(mag);
      
      // locate the strongest earthquake as the center of the map, set it as the initial_place, for defining center of the map
    if (strongest_quake < mag) {
        initial_place = [data.geometry.coordinates[1], data.geometry.coordinates[0]];
        strongest_quake = mag;
    }
      
      
    var quake = L.circle([data.geometry.coordinates[1], data.geometry.coordinates[0]], {
        fillOpacity: 0.75,
        color: "brown",
        fillColor: marker_color,
        radius: marker_size
      }).bindPopup("<h3>" + data.properties.place +
          "</h3><hr><p>" + new Date(data.properties.time) + 
          "</p><hr><p>Magnitude : " + mag + "</p>");
     
    quakeMarkers.push(quake);
  }
  // Create a layer group made from the quake markers array, pass it into the createMap function
   if (first_round == true) {
       earthquakes = L.layerGroup(quakeMarkers);
       createMap(earthquakes);
       console.log('L.layerGroup', L.layerGroup(quakeMarkers));
       console.log('earthquakes', earthquakes);
   }
   else {
       earthquakes.clearLayers();
       console.log('cleared');
       earthquakes = L.layerGroup(quakeMarkers);
       createMap(earthquakes);
//       map.removeLayer(earthquakes);
       }
   
}



function createFaultLines() {
    
   var mapStyle = {
      color: "gold",
      weight: 2
    };

    d3.json(tectonic_url, function(data) {
      // Creating a geoJSON layer with the retrieved data
      L.geoJson(data, {
        // Passing in our style object
        style: mapStyle
      }).addTo(tectonic_plates);
    });
}


function buildMap() {
    console.log('buildMap starts');
    d3.json(by_hour_url, createMarkers);
    console.log(today);
}


// set up legend

function createLegend(map) {    

    var legend = L.control({ position: "topright" });
//    var legend = L.control({ position: "bottomright" });
    
    console.log('legend');
    
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = ['0-1', '1-2', '2-3' , '3-4' , '4-5' , '5+'];
        var magnitudes = [1, 2, 3 , 4 , 5 , 6];
        var labels = [];

        var legendInfo = "<h4>USGS Earthquakes Scales</h4>";
        div.innerHTML = legendInfo;  
      
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i]-0.9) + '"></i> ' +
                limits[i] + '<br>';
        }
        return div;
      };
    
      // Adding legend to the map
      legend.addTo(map);
}



// main line 

buildMap();

//const keep_on_looping = async () => {
//    console.log('b/4 buildMap');
//    await sleep(60000)
//    buildMap();
//}


function timeElapsed() {
    if (progress < 100) {    
        var now = new Date();
        var nowEpoch = now.getTime();
//    var nowEpoch = now.getTime() / (1000 * 3600);
//        console.log('now:', now, nowEpoch);
    
        var elapsed = roundDown(nowEpoch - start);
//        console.log('elapsed', elapsed);
        progress = roundDown(elapsed * 100 / total);
//        console.log('progress', progress);
    
        var elapsed_min = roundDown(elapsed / 60000);
        
    
//every minute it updates the map 
        
    if (progress !== 0 && progress % 10 == 0 ) {
           buildMap();
        }

    if (progress > 100.00) {
            progress = 100.00;
        }
        
    if (elapsed_min > 10.00) {
            elapsed_min = 10.00;
        }
        
        
        document.getElementById("current").innerHTML = 'Current time : ' + showDate(now);
        document.getElementById("total").innerHTML = '    -----    Total duration : ' + total_min + ' minutes';
        document.getElementById("elapsed").innerHTML = '    -----    Elapsed time : ' + elapsed_min + ' minutes';
        document.getElementById("progress").innerHTML = 'Progress : ' + progress + ' %';
        document.getElementById("p").value = progress;
    }
}


function roundDown(floating) {
    var rounded = Math.round(floating * 100) / 100;
    return rounded;
}

function showDate(x) {
    year = x.getFullYear();
    month = (x.getMonth() >= 9) ? x.getMonth() + 1: '0' + (x.getMonth() + 1);
    day = (x.getDate() >= 9) ? x.getDate() : '0' + x.getDate();
    hour = (x.getHours() >= 9) ? x.getHours() : '0' + x.getHours();
    minutes = (x.getMinutes() >= 9) ? x.getMinutes() : '0' + x.getMinutes();
    seconds = (x.getSeconds() >= 9) ? x.getSeconds() : '0' + x.getSeconds();
    string = year + '-' + month + '-' + day + ' ' + hour + ':' + minutes + ':' + seconds;
    return string;
}
window.onload = timeElapsed;

window.setInterval(timeElapsed, 1000);





//keep_on_looping();


//var keep_on_looping = true;

//do {
//    buildMap();
//    console.log('start counting 60000 millisecond');
//    sleep(60000);
//    console.log('back from sleep');    
//}
//while (keep_on_looping);
    