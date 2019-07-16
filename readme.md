# ***Earthquakes Monitor***

 

### **Objective :**

An app, updated every minute, shows real-time world map, where the earthquakes are and their magnitudes.  

 

### **Author :**

Emily Mo

 

### **About the data :**

It is based on the US Geological Survey up-to-the-minute earthquakes dataset at http://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php.  It is in geojson format containing the location (latitude and longitude) and magnitude of the earthquake.  The latitude and longitude will be used to mark where the earthquake takes place.  

Another set of data is from https://github.com/fraxen/tectonicplates which features the tectonic fault lines around the world. 

 

### **About this app :**

This app presents the world map (from mapbox with an API key) with tectonic fault lines and marks the locations of the earthquakes provided by the USGS dataset's latitudes and longitudes.  There are three choices for the base map of the world.  They are satellite map, outdoors map and grayscale (dark) map.  The map layers are the earthquakes and the tectonic plates.  

Every earthquake is denoted by a marker.  The size and color of the circular marker depicting the earthquake will depend on its magnitude.  The darker and larger the marker, the stronger the earthquake. Hovering over the marker (tooltip) will display the location of the earthquake, the time it took place and its magnitude.  The duration of the app is ten minutes long.  It fetches the up-to-the-minute data from USGS,  refreshes the world map every single minute and  adjusts the map such that the strongest latest earthquake will be situated at the center of the world map.

The ten-minute bar at the top of the screen will count down once the app is opened.  

Technical features used :

- HTML/CSS/Bootstrap, 
- leaflet,
- mapbox, with an API access,
- tooltip to display the details of an earthquake,
- javascript,
- geojson format,
- static website hosting in S3, 
- flask app (python) - for deployment in Heroku only. 

The flask app renders the template when it is deployed in Heroku.



### Deployment :

This app is deployed in AWS S3 using their static website hosting. Flask app (python) is not needed in this deployment.  And its URL is : 

http://moemily-earthquakes-monitor.s3-website.us-east-2.amazonaws.com/