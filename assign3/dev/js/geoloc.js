(function() {

    var geo_button = document.createElement('button');
    var coords, address;
    
    if(navigator.geolocation) {

        function insertGoogleMapAPI() {

            // Google Maps API
            var gmap_script_src = "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false";
            var gmap_script = document.createElement('script');
            // Set script src to google map api src
            gmap_script.src= gmap_script_src;

            // Insert before the current script and returns so that we can check if it loads 
            document.body.insertBefore(gmap_script, document.getElementsByTagName('script')[0]);
            return gmap_script;

        }


        function addButton() {

            var address_ul_elem = document.querySelector('#address');
            var address_ul_first_item = document.querySelector('#address>li:first-child');
    
            // init button attributes
            geo_button.classList.add('right');
            geo_button.innerHTML = 'Locate me !';

            // address_ul_elem.appendChild(geo_button);
            address_ul_elem.insertBefore(geo_button, address_ul_first_item);

        }

        function getPosition() {
            navigator.geolocation.getCurrentPosition(geoDecodePosition);
        }

        function geoDecodePosition(position) {

            var mylat = position.coords.latitude,
                mylong = position.coordS.longitude;
                
            console.log(mylat, mylong);

        }

        function errorHandler() {

        }

        function updateFormWithPosition() {

        }

        // this script is using Google API so useless to make it works
        // if we can't reach googl map API
        if(insertGoogleMapAPI()) {
            addButton();
            geo_button.addEventListener('click', function(e) {
                e.preventDefault();
                getPosition();
                // updateFormWithPosition();
            })
        }


    }
})();