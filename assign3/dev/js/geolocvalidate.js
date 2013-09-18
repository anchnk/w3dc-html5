/*jslint browser: true */
/*global google, console*/
// Do not spoil JS Global Scope/
// AMD approach would be better
(function () {

  "use strict";

  // START GEOLOCALISATION PART---------------------------------------------
  // Script Global Variables
  var geo_button = document.createElement('button'),
    address,
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

        geocoder.geocode({'latLng': latlng}, function (results, status) {
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
      geo_button.addEventListener('click', function (e) {
        e.preventDefault(); // prevent submit form
        getPosFunction();
      });
    }
  }
  // END GEOLOCALISATION PART---------------------------------------------

  // START VALIDATION PART------------------------------------------------
  function getPassword() {
    return document.getElementById('enter_password').value;
  }

  function returnEventElement(e) {
    var elm;

    // Sample from http://www.quirksmode.org/js/events_properties.html

    if (!e) {
      e = window.event;
    }
    // W3C/Netscape
    if (e.target) {
      elm = e.target;
    // Microsoft use srcElement
    } else if (e.srcElement) {
      elm = e.srcElement;
    }

    if (elm.nodeType === 3) {
      elm = elm.parentNode;
    }

    return elm;
  }

  function checkElemValidity(e) {

    var elm = returnEventElement(e);

    // Only apply styles if something has been tipped
    if (elm.value.length > 0) {

      // Special case to check password confirmation 
      if (elm.id === 'confirm_password') {

        // if passwords length does not match
        if (elm.value.length !== getPassword().length) {
          elm.setCustomValidity('Passwords length does not match');
          elm.classList.add('invalid');

        // if length matches check if password matches
        } else {

          // password confirmation do not match password
          if (elm.value !== getPassword()) {
            elm.setCustomValidity('Passwords does not match');
            elm.classList.remove('valid');

          // ok both passwords are equals
          // so element is now valid
          } else {
            elm.setCustomValidity('');
            elm.classList.remove('invalid');
          }
        }

      // other case just check current input field validity state
      } else {
        if (!elm.checkValidity()) {
          elm.classList.add('invalid');
        } else {
          elm.classList.remove('invalid');
        }
      }

    // if nothing has been tipped remove validity style
    } else {
      elm.classList.remove('invalid');
      elm.classList.remove('valid');
    }
  }

  function removeBorder(e) {
    var elm = returnEventElement(e);
    elm.style.border = 'none';
  }

  // Just bind checkElemValidity on all inputs elements
  function formValidation() {

    var inputs = document.querySelectorAll('input'),
      i;

    for (i = 0; i < inputs.length; i = i + 1) {
      inputs[i].addEventListener('input', checkElemValidity);
      inputs[i].addEventListener('blur', removeBorder);
    }

  }

  // END VALIDATION PART------------------------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    geolocation();
    formValidation();
  });
}());