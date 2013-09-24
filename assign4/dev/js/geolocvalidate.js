/*jslint browser: true */
/*global google, console*/

// Do not spoil JS Global Scope
// AMD approach would be better
(function () {
  "use strict";

  // Script Global Variables
  var
    geo_button = document.createElement('button'),
    address,
    getPosFunction,
    geoDecPosFunction,
    errHandlFunction,
    updateFormFunction;

  /*  Function handler that returns element which fired the event
   *  Cross-browser and retro-backward compatible.
   *  Credits: http://www.quirksmode.org/js/events_properties.html
   */
  function returnEventElement(e) {
    var elm;

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


  function addElemValueToSessionStorage(e) {

    var elm = returnEventElement(e),
      id = null;

    if (elm.id) {
      id = elm.id;
    }

    // if sessionStorage is supported
    if (sessionStorage !== 'undefined') {
      sessionStorage.setItem(id, elm.value);
    }

  }

  /*  Insert geolocalisation button using JS
   *  If JS is disabled and geolocalisation not enable 
   *  The button won't work so it's useless to display it.
   *  So only add the button if JS is enable and geolocation is supported
   */
  function addGeolocButton() {

    var address_ul_elem = document.querySelector('#address'),
      address_ul_first_item = document.querySelector('#address>li:first-child'),
      list_item = document.createElement('li'),
      label = document.createElement('label');

    // Init geolocation button attributes
    geo_button.classList.add('geobutton');
    geo_button.innerHTML = 'Locate Me';
    geo_button.id = 'geolocation';

    label.htmlFor = geo_button.id;
    label.innerHTML = 'Use Geolocation (Optional)';


    // add our button to the DOM tree
    address_ul_elem.insertBefore(list_item, address_ul_first_item);
    list_item.appendChild(label);
    list_item.appendChild(geo_button);
    //address_ul_elem.insertBefore(geo_button, address_ul_first_item);
  }

  /*  Geolocation Part, could be an object as this function 
   *  bundled several others utility function. Use Google 
   *  Maps API to geo decode latitude and longitude
   *  As well as updating the form with matching address
   */
  function geolocation() {
    if (navigator.geolocation && navigator.onLine) {



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

        sessionStorage.setItem('street_address1', street_adr1_elm.value);
        sessionStorage.setItem('street_address2', street_adr2_elm.value);
        sessionStorage.setItem('zipcode', zipcode_elm.value);
        sessionStorage.setItem('city', city_elm.value);
        sessionStorage.setItem('country', country_elm.value);
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

      addGeolocButton();

      geo_button.addEventListener('click', function (e) {
        // prevent submit form
        e.preventDefault();
        getPosFunction();
      });
    }
  }

  // START VALIDATION PART------------------------------------------------

  /*  Utility Function. Returns password value.
   *  Used in checkElemValidity to compare with password confirmation.
   */
  function getPassword() {
    return document.getElementById('enter_password').value;
  }

  /*  Custom input element validity checking rules
   *  Client-side validation API with some custom behavior
   *  Check if passwords length and if passwords matches
   *  Add custom CSS class to style input elements 
   *  According to their validity state
   */
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

  /*  Utility function use to remove the CSS border around
   *  the element passed as a parameter. Used when an event
   *  is fired so that we are using returnEventElement function
   */
  function removeBorder(e) {
    var elm = returnEventElement(e);
    elm.style.border = 'none';
  }
  // END VALIDATION PART--------------------------------------------------

  // RUN -----------------------------------------------------------------

  function attachEvents() {
    var inputs = document.querySelectorAll('input'),
      i;

    for (i = 0; i < inputs.length; i = i + 1) {

      // Validation Part
      inputs[i].addEventListener('input', checkElemValidity);
      inputs[i].addEventListener('blur', removeBorder);

      // Storage Part
      inputs[i].addEventListener('input', addElemValueToSessionStorage);

    }
  }

  function retrieveDataFromStorage() {

    var i, n, id, field_value, elm;

    // If localStorage is supported
    if (localStorage !== 'undefined') {

      // Loop trough all store key/value pairs
      for (i = 0; i < localStorage.length; i++) {

        /*  Each localStorage key match form inputs' id
         *  So that each localStorage entry match a form 
         *  input element.
         */
        id = localStorage.key(i);

        // try go get form input element matching localStorage id key
        elm = document.getElementById(id);

        // the element does exist in the form
        if (elm) {

          // get element value
          field_value = localStorage.getItem(id);

          // if input has no data we remove the value from the store
          // no need to restore something empty, on the contrary
          // we restore the value from sesionStorage
          if (field_value === '') {
            localStorage.removeItem(id);
          } else {
            elm.value = field_value;
          }
        }
      }
    }
  }

  /*  Function use to remove geolocation button 
   *  Used here to remove the geo UI if there 
   *  isn't any active network connection
   */
  function removeGeolocButton() {

    var
      geo_button_container = document.querySelector('#address>li:first-child'),
      address_ul_elem = document.querySelector('#address');

    if (geo_button_container !== null) {
      address_ul_elem.removeChild(geo_button_container);
    }
  }

  function saveToLocalStorage() {
  }


  function saveFormData() {
    var
      submit_btn = document.getElementById('submit_form'),
      geo_button = document.getElementById('geolocation');

    console.log('lost connection');

    if (geo_button !== null) {
      console.log('if');
      removeGeolocButton();
    }
    submit_btn.value = 'Save Form Data';
    submit_btn.textContent = 'Save Form Data';

  }

  function submitForm() {

    var submit_btn = document.getElementById('submit_form');
    if (!document.getElementById('geolocation')) {
      addGeolocButton();
    }
    console.log('got connection');
    submit_btn.value = 'Register';
    submit_btn.textContent = 'Register';
  }

  window.addEventListener('online', submitForm, false);

  window.addEventListener('offline', saveFormData, false);

  document.addEventListener('DOMContentLoaded', function () {
    geolocation();
    attachEvents();
    retrieveDataFromStorage();
  });

}());