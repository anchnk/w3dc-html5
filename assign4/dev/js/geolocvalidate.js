/*jslint browser: true */
/*global google, console*/

// Do not spoil JS Global Scope
// AMD approach would be better
(function () {
  "use strict";

  // Global Variables
  var
    picture_container = document.getElementById('picture'),
    address_ul_elem = document.querySelector('#address'),
    form = document.getElementById('register_form'),
    submit_btn = document.getElementById('submit_form'),
    geo_button = document.createElement('button'),
    address,
    getPosFunction,
    geoDecPosFunction,
    errHandlFunction,
    formDataObj = {},
    updateFormFunction;

  /**************************************************************************
   *  Function handler that returns which element fired an event            *
   *  Cross-browser and retro-backward compatible.                          *
   *  Paremeters: The event which fired the function                        *
   *  Returns: The element which fired the event                            *
   *  Credits: http://www.quirksmode.org/js/events_properties.html          *
   **************************************************************************/
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

  /**************************************************************************
  *  Function that add current input element value to sessionStorage        *
  *  This function is triggered by input event which is attached to each    *
  *  form's input elements. It's save on sessionStorage as JSON data        *
  *  whose key is formData. Template JSON DATA : element id > element value *
  *  This function removes element from JSON object if it's value is emtpy  *
  *  Parameters: The event which fired the function                         *
  **************************************************************************/
  function addElemValueToSessionStorage(e) {
    var elm = returnEventElement(e),
      id = null;

    if (elm.id) {
      id = elm.id;
    }

    // if sessionStorage is supported
    if (sessionStorage !== 'undefined') {
      // if something is tipped we store it in session storage
      if (elm.value.length > 0) {
        formDataObj[id] = elm.value;
        sessionStorage.setItem('formData', JSON.stringify(formDataObj));
      // otherwise we remove the key from session storage
      } else {
        delete formDataObj[id];
        sessionStorage.removeItem('formData');
        sessionStorage.setItem('formData', JSON.stringify(formDataObj));
      }
    }
  }

  /**************************************************************************  
   *  Insert geolocalisation button using JS                                *
   *  If JS is disabled and geolocalisation not enable                      *
   *  The button won't work so it's useless to display it.                  *
   *  So only add the button if JS is enable and geolocation is supported   *
  **************************************************************************/
  function addGeolocButton() {
    var
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
  }

  /**************************************************************************
   *  Function use to remove geolocation button                             *
   *  Used here to remove the geo UI if there                               *
   *  isn't any active network connection                                   *
   **************************************************************************/
  function removeGeolocButton() {
    var
      geo_button_container = document.querySelector('#address>li:first-child');

    if (geo_button_container !== null) {
      address_ul_elem.removeChild(geo_button_container);
    }
  }

  /**************************************************************************  
   *  Geolocation Part, could be an object as this function                 * 
   *  bundled several others utility function. Use Google                   *
   *  Maps API to geo decode latitude and longitude                         *
   *  As well as updating the form with matching address                    *
   **************************************************************************/
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
        formDataObj.street_address1 = street_adr1_elm.value;
        formDataObj.street_address2 = street_adr2_elm.value;
        formDataObj.zipcode = zipcode_elm.value;
        formDataObj.city = city_elm.value;
        formDataObj.country = country_elm.value;
        sessionStorage.setItem('formData', JSON.stringify(formDataObj));
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

  /**************************************************************************
   *  Utility Function. Returns password value.                             *
   *  Used in checkEventElementValidity to compare with password            * 
   *  confirmation.                                                         *
   **************************************************************************/
  function getPassword() {
    return document.getElementById('enter_password').value;
  }

  /**************************************************************************
  *  Function that override DOM checkValidity function with some custom     *
  *  rules. Like checking password lenght and if they matches. This         *
  *  function also add some class to style input elements while the user is *
  *  typing. This function is fired by input event on all input element     *
  *  Parameters: The element which fired the event                          *
  **************************************************************************/
  function customCheckValidity(elm) {
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

  /**************************************************************************  
   *  This function call customCheckValidity on the element which fired the *
   *  input event. It use returnEventElement to get current element which   *
   *  fired the event. So basically it just got an event as input paremeter *
   *  and check the validity of the event's element using custom rules      *
   *  Parameters: The event which has ben fired                             *
   **************************************************************************/
  function checkEventElementValidity(e) {
    var elm = returnEventElement(e);
    customCheckValidity(elm);
  }

  /**************************************************************************
   *  Function which check all elements validity using custom rules.        *
   *  Call on DOMContentLoaded event to check form elements validity on     *
   *  page reload.                                                          *
   **************************************************************************/
  function checkFormValidity() {
    var inputs = document.querySelectorAll('input'),
      i;

    for (i = 0; i < inputs.length; i = i + 1) {
      customCheckValidity(inputs[i]);
    }
  }

  /**************************************************************************
   *  Utility function use to remove the CSS border around                  *
   *  the element passed as a parameter. Used when an event                 *
   *  is fired so that we are using returnEventElement function             *
   **************************************************************************/
  function removeBorder(e) {
    var elm = returnEventElement(e);
    elm.style.border = 'none';
  }

 /**************************************************************************
   *  Render a thumbnail of the selected file passed as an argument         *
   *  Could be more generic taking a second parameter which would be        *
   *  the container where the preview will be display. Also add it to       *
   *  storage so that the picture can be found later.                       *
   *  Parameter: file -> The file which have ben selected or dragged        *
   **************************************************************************/
  function displayPicturePreview(file) {

    var
      aboutyou_list = document.querySelector('#aboutyou'),
      progressBar = document.createElement('progress'),
      li = document.createElement('li'),
      filereader = new window.FileReader(),
      img = null,
      xhr = new XMLHttpRequest();

    filereader.readAsDataURL(file);

    // Add progress bar only once
    if (!document.querySelector('#picture_upload_prgBar')) {
      progressBar.value = 0;
      progressBar.max = 100;
      progressBar.id = 'picture_upload_prgBar';
      progressBar.style.width = '280px';
      progressBar.style.marginLeft = '220px';
      // append progress bar to form
      li.appendChild(progressBar);
      aboutyou_list.appendChild(li);
    }

    filereader.onload = function (e) {
      // Remove previous picture before loading the new one
      if (picture_container.hasChildNodes()) {
        while (picture_container.firstChild) {
          picture_container.removeChild(picture_container.firstChild);
        }
      }

      // update Progress Bar and upload image to form
      xhr.open('POST', form.getAttribute('action'), true);
      xhr.setRequestHeader('X_FILENAME', file.name);
      xhr.upload.onprogress = function (e) {
        progressBar.value = e.loaded;
        progressBar.max = e.total;

        if (progressBar.value === progressBar.max) {
          // remove the progress bar and put a message
          li.innerHTML += ' DONE';
        }
      };

      xhr.send(file);
      // add the picture to the DOM
      img = document.createElement('img');
      img.src = e.target.result;
      picture_container.appendChild(img);



      // save picture data url to storage
      if (file.size <= 1000000) {
        formDataObj.picture_src = e.target.result;
        sessionStorage.setItem('formData', JSON.stringify(formDataObj));
      }
    };
  }

  /**************************************************************************
   *  Handle file selection and call displayPicturePreview when the user    *
   *  select a picture using the field input type file with id              *
   *  picture_input.                                                        *
   **************************************************************************/
  function handleFileSelect() {
    var picture = document.getElementById('picture_input').files.item(0);
    displayPicturePreview(picture);
  }

  /**************************************************************************
   **************************************************************************/
  function dragStartHandler(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.dropEffect = 'move';
  }

  /**************************************************************************
   **************************************************************************/
  function dragEnterHandler(e) {
    var elm = returnEventElement(e);
    elm.classList.add('dragOver');
  }

  /**************************************************************************
   **************************************************************************/
  function dragOverHandler(e) {
    console.log('drag Over');
    e.stopPropagation();
    e.preventDefault();
  }

  /**************************************************************************
   **************************************************************************/
  function dropHandler(e) {
    e.stopPropagation();
    e.preventDefault();
    returnEventElement(e).classList.remove('dragOver');

    var picture = e.dataTransfer.files[0];
    displayPicturePreview(picture);

  }

  /************************************************************************** 
   *  Bind event handlers on all input elements                             *
   *  input and blur event are actually handled on all form input elements  *
   *  Attach checkEventElementValidity and addElmValueToSessionStorage to   *
   *  input event.                                                          *
   *  Attach removeBorder to blur event.                                    *
   **************************************************************************/
  function attachEvents() {
    var
      inputs = document.querySelectorAll('input'),

      i;

    // Input Elements Events Listeners
    for (i = 0; i < inputs.length; i = i + 1) {
      // if input element isn't the file chooser
      if (inputs[i].id !== 'picture_input') {
        // Validation Part
        inputs[i].addEventListener('input', checkEventElementValidity);
        inputs[i].addEventListener('blur', removeBorder);

        // Storage Part
        inputs[i].addEventListener('input', addElemValueToSessionStorage);
        // the input element is the file chooser 
      } else {
        inputs[i].addEventListener('change', handleFileSelect);
      }
    }

    // Picture dnd Events Listeners
    picture_container.addEventListener('dragenter', dragEnterHandler);
    picture_container.addEventListener('drop', dropHandler);
    picture_container.addEventListener('dragover', dragOverHandler);
    picture_container.addEventListener('dragstart', dragStartHandler);
  }

  /**************************************************************************
   *  Function that retrieve form input value from storage JSON and         *
   *  Put them back on input element. Use to restore values on page reload  *
   *  Loop against all id and if matching id is in JSON get the value back  *
   *  Used in retrieveDataFromStorage                                       *
   *  Parameters:                                                           * 
   *    formDataObj the JSON object which contains form values              *
   *    elm the current element which we want the value to be restore       * 
   **************************************************************************/
  function updateFormElemWithStorage(formDataObj, elm) {
    var
      id = null,
      img = null;

    for (id in formDataObj) {
      if (formDataObj.hasOwnProperty(id)) {
        elm = document.getElementById(id);
        if (id !== 'picture_src') {
          elm.value = formDataObj[id];
        } else {
          img = document.createElement('img');
          img.src = formDataObj[id];
          picture_container.appendChild(img);
        }
      }
    }
  }

  /**************************************************************************
   *  Function use to retrieve data from either                             *
   *  sessionStorage or localStorage.                                       *
   *  Used to get values back when page is refreshed                        *
   *  or form values saved when offline                                     *
   **************************************************************************/
  function retrieveDataFromStorage() {
    var id, elm;

    // If HTML5 Storage is supported
    if (localStorage !== 'undefined' || sessionStorage !== 'undefined') {

      // If we got something stored in sessionStorage
      if (sessionStorage.formData) {
        formDataObj = JSON.parse(sessionStorage.getItem('formData'));
        updateFormElemWithStorage(formDataObj, elm);
      // If we got something stored in localStorage
      } else if (localStorage.formData) {
        formDataObj = JSON.parse(localStorage.getItem('formData'));
        updateFormElemWithStorage(formDataObj, elm);
      }
    }
  }

  /**************************************************************************
   *  Save current sessionStorage JSON object to localStorage               *
   *  Used when there isn't connectivity by the submit button in order to   *
   *  save form data for later use when connectivity is back                *
   *  Parameters: the event fired by the submit button                      *
   **************************************************************************/
  function saveToLocalStorage(e) {
    localStorage.setItem('formData', JSON.stringify(formDataObj));
    // prevent to submit form when connectivity is off
    e.preventDefault();
  }

  /**************************************************************************
   *  Function triggered when we lost connectivity by the offline event     *
   *  Removes the geolocation button (because no geolocation possible if    *
   *  no connectivity). Change submit button label and behavior allowing    *
   *  user to save current form data to localStorage for later use          *
   **************************************************************************/
  function saveFormData() {
    var
      geo_button = document.getElementById('geolocation');

    console.log('lost connection');

    if (geo_button !== null) {
      console.log('if');
      removeGeolocButton();
    }

    submit_btn.value = 'Save Form Data';
    submit_btn.textContent = 'Save Form Data';

    submit_btn.addEventListener('click', saveToLocalStorage);
  }

  /**************************************************************************
   *  Function triggered when connectivity is back by online event          *
   *  Add the geolocation back to the form change submit button label and   *
   *  behavior allowing to submit form again.                               *
   **************************************************************************/
  function submitForm() {

    if (!document.getElementById('geolocation')) {
      addGeolocButton();
    }

    console.log('got connection');
    submit_btn.value = 'Register';
    submit_btn.textContent = 'Register';
    submit_btn.removeEventListener('click', saveToLocalStorage);

    // form submission
    sessionStorage.clear();
  }


  /**************************************************************************
   *  Fired on page load or when the browser is refreshed. Check current    *
   *  connectivity, and update form according to online mode.               *
   *  Handle form data reload either from sessionStorage or localStorage    *
   *  Add geolocation and attach validity events on form inputs elements    *
   **************************************************************************/
  document.addEventListener('DOMContentLoaded', function () {
    // check connectivity state on page load
    if (!navigator.onLine) {
      saveFormData();
    }
    window.addEventListener('offline', saveFormData, false);
    window.addEventListener('online', submitForm, false);
    geolocation();
    attachEvents();
    retrieveDataFromStorage();
    // used to update form elements validity on page reload
    checkFormValidity();
  });

}());