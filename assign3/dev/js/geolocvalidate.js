/*jslint browser: true */
/*global google, console*/
// Do not spoil JS Global Scope/
// AMD approach would be better
(function() {

    "use strict";

    // START GEOLOCALISATION PART---------------------------------------------
    // Script Global Variables
    var geo_button = document.createElement('button'),
        address,
        input_elms,
        hints,
        addBtnFunction,
        getPosFunction,
        geoDecPosFunction,
        errHandlFunction,
        updateFormFunction;

    function geolocation() {
        if (navigator.geolocation) {

            /*  Insert geolocalisation button using JS
             *  If JS is disabled and geolocalisation not enable 
             *  The button won't work so it's useless to display it.
             *  So only add the button if JS is enable and geolocation is supported
             */
            addBtnFunction = function addButton() {

                var address_ul_elem = document.querySelector('#address'),
                    address_ul_first_item = document.querySelector('#address>li:first-child');

                // Init geolocation button attributes
                geo_button.classList.add('geobutton');
                geo_button.innerHTML = 'locate me';

                // add our button to the DOM tree
                address_ul_elem.insertBefore(geo_button, address_ul_first_item);
            };

            // Update form's address fieldset with geodecoded location
            updateFormFunction = function updateFormWithPosition() {

                // Get form adress fields elements
                var street_adr1_elm = document.getElementById('street_address1'),
                    street_adr2_elm = document.getElementById('street_address2'),
                    zipcode_elm = document.getElementById('zipcode'),
                    city_elm = document.getElementById('city'),
                    country_elm = document.getElementById('country'),
                    address_comps = address.address_components,
                    res,
                    i;

                // Fill form address fields according to objects matching properties
                for (i in address_comps) {
                    if (address_comps.hasOwnProperty(i)) {
                        res = address_comps[i].long_name;
                        switch (address_comps[i].types[0]) {

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
                            break;

                        case 'postal_code':
                            zipcode_elm.value = res;
                            break;

                        case 'country':
                            country_elm.value = res;
                            break;
                        }
                    }
                }
            };

            // OK: we got a position to decode using gmaps' geodecoder
            geoDecPosFunction = function geoDecodePosition(position) {

                var latlng,
                    my_lat = position.coords.latitude,
                    my_long = position.coords.longitude,
                    geocoder = new google.maps.Geocoder();

                latlng = new google.maps.LatLng(my_lat, my_long);

                geocoder.geocode({'latLng': latlng}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        // According to Gmaps API first result is the more accurate
                        address = results[0];
                        updateFormFunction();
                    }
                });
            };

            // NOT OK: Something went wrong when trying to get user location
            errHandlFunction = function errorHandler() {
                console.log('oups error');
                // see example + some work to let user notice about the error
            };

            // Fired when geolocation button is clicked click event
            getPosFunction = function getPosition() {
                navigator.geolocation.getCurrentPosition(geoDecPosFunction, errHandlFunction);
            };

            addBtnFunction();
            geo_button.addEventListener('click', function(e) {
                e.preventDefault(); // prevent submit form
                getPosFunction();
            });
        }
    }
    // END GEOLOCALISATION PART---------------------------------------------

    // START VALIDATION PART------------------------------------------------
    function formvalidation() {
        var i;

        input_elms = document.getElementsByTagName('input');

        // function check inputs validity as well as passwords matches
        function checkValidity(elm) {

            var inv_elm,
                passwd_elm;

            // get invalid pseudo selector input elements
            inv_elm = document.querySelector(':invalid');


            // only check invalidity if the user has tipped something
            if (elm.value.length !== 0) {
                // if current element is invalid add visual style to it
                if (inv_elm === elm) {
                    elm.style.backgroundColor = '#e19d9d !important';
                    elm.classList.add('invalid');
                }

                // special case of password matching
                if (elm.id === 'confirm_password') {
                    // get previous password element
                    passwd_elm = document.getElementById('enter_password');
                    // compare passwords
                    if (elm.value.length !== passwd_elm.value.length) {
                        elm.setCustomValidity('length does not match');
                        elm.classList.add('invalid');
                    } else {
                        if (elm.value !== passwd_elm.value) {
                            elm.setCustomValidity('password do not match');
                            elm.classList.remove('valid');
                            elm.classList.add('invalid');
                            console.log(elm.classList);
                        } else {
                            elm.setCustomValidity('');
                            elm.classList.remove('invalid');
                            elm.classList.add('valid');
                            console.log(elm.classList);
                        }
                    }
                }
            }
        }

        // add event listener to form input element
        // so that validity is checked when user leave the input field
        for (i = 0; i < input_elms.length; i = i + 1) {
            
            input_elms[i].addEventListener('blur', function() {
                checkValidity(this);
            });
            
        }

        // some more work to do there
        // function showHint() {
        //     var i;
        //     hints = document.getElementsByClassName('hint');
        //     for (i = 0; i < hints.length; i = i + 1) {
        //         hints[i].style.display = 'visible';
        //     }
        // }
    }
    // END VALIDATION PART------------------------------------------------

    geolocation();
    formvalidation();
}());