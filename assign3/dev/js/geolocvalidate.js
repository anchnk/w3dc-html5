(function() {

    // GELOCALISATION
    var geo_button = document.createElement('button'),
        coords, address,
        input_elms,
        inv_elm,
        hints;
    
    if(navigator.geolocation) {

        // TODO debug this one
        // function insertGoogleMapAPI() {

        //     // Google Maps API
        //     var gmap_script_src = "https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false";
        //     var gmap_script = document.createElement('script');
        //     // Set script src to google map api src
        //     gmap_script.src= gmap_script_src;

        //     // Insert before the current script and returns so that we can check if it loads 
        //     document.body.insertBefore(gmap_script, document.getElementsByTagName('script')[0]);
        //     return gmap_script;
        // }

        // Add the button using JS, useless if JS is disable to see that
        // button that won't have any effect
        function addButton() {

            var address_ul_elem = document.querySelector('#address');
            var address_ul_first_item = document.querySelector('#address>li:first-child');
    
            // init button attributes
            geo_button.classList.add('geobutton');
            geo_button.innerHTML = 'locate me';

            // address_ul_elem.appendChild(geo_button);
            address_ul_elem.insertBefore(geo_button, address_ul_first_item);
        }

        // This function is triger when someone click on the locate button
        function getPosition() {
            navigator.geolocation.getCurrentPosition(geoDecodePosition);
        }

        // Ok we got access to geolocation
        function geoDecodePosition(position) {

            var my_lat = position.coords.latitude,
                my_long = position.coords.longitude,
                geocoder = new google.maps.Geocoder();
                latlng = new google.maps.LatLng(my_lat, my_long);
                
            geocoder.geocode({'latLng': latlng}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    address = results[0];
                    updateFormWithPosition();
                }
            });
        }

        // Oups something went wrong when trying to geolocate user
        function errorHandler() {
            console.log('oups error');
            // see example + some work to let user notice about the error
        }

        function updateFormWithPosition() {
            // Get form adress fields elements
            var street_adr1_elm = document.getElementById('street_address1'),
                street_adr2_elm = document.getElementById('street_address2'),
                zipcode_elm = document.getElementById('zipcode'),
                city_elm = document.getElementById('city'),
                country_elm = document.getElementById('country'),
                address_comps = address.address_components,
                res;

            // Fill form address fields according to objects matching properties
            for (i in address_comps) {

                res = address_comps[i].long_name;

                switch(address_comps[i].types[0]) {
                    case 'street_number':
                        street_adr1_elm.value = res;
                        break;

                    case 'route': 
                         street_adr1_elm.value += ' ' + res;
                        break;

                    case 'locality':
                        city_elm.value = res;
                        break;

                    case 'sublocality':
                        street_adr2_elm.value = res;

                    case 'postal_code':
                        zipcode_elm.value = res;
                        break;

                    case 'country':
                        country_elm.value = res;
                        break;
                }
            }
        }

        // this script is using Google API so useless to make it works
        // if we can't reach googl map API
        // if(insertGoogleMapAPI()) {
            addButton();
            geo_button.addEventListener('click', function(e) {
                e.preventDefault();
                getPosition();
            })
        // }
    }

    // VALIDATION
    input_elms = document.getElementsByTagName('input');

    // add event listener to form input element
    // so that validity is checked when user leave the input field
    for (var i=0; i<input_elms.length; i = i+1) {
        input_elms[i].addEventListener('blur', function() {
            checkValidity(this);
        });
    }

    // function check inputs validity as well as passwords matches
    function checkValidity(elm) {

        var submit_btn,
            inv_elm, 
            passwd_elm,
            validityState_obj;

        // get invalid pseudo selector input elements
        inv_elm = document.querySelector(':invalid');

        // only check invalidity if the user has tipped something
        if (elm.value.length !== 0) {
            // if current element is invalid add visual style to it
            if(inv_elm === elm) {
                elm.classList.add('invalid');        
            }

            // special case of password matching
            if (elm.id === 'confirm_password') {
                // get previous password element
                passwd_elm = document.getElementById('enter_password');
                // compare passwords
                if(elm.value.length !== passwd_elm.value.length) {
                    elm.setCustomValidity('length does not match');
                } else {
                    if (elm.value !== passwd_elm.value) {
                        elm.setCustomValidity('password do not match');
                        elm.classList.remove('valid');
                        elm.classList.add('invalid');
                    } else {
                        elm.classList.remove('invalid');
                        elm.classList.add('valid');
                    }
                }
            }
        }
    }

    // some more work to do there
    function showHint() {

        hints = document.getElementsByClassName('hint');
        for (var i=0; i<hints.length; i++) {
            hints[i].style.display = 'visible';
        }
    }


}) ();