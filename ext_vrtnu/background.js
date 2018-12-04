
var lastUtterance = '';
var speaking = false;

var rate = 1.0;
var pitch = 1.0;
var volume = 1.0;
var voice = 'Google Nederlands';

function setBrowserIcon(iconpath) {
  chrome.browserAction.setIcon({ path: 'icons/' + iconpath });
}

function speakVideoUtterance(utterance) {
  console.log('speakVideoUtterance, enqueuing');

  chrome.tts.speak(
    utterance,
    {
      voiceName: voice,
      rate: parseFloat(rate),
      pitch: parseFloat(pitch),
      volume: parseFloat(volume),
      'enqueue': true,
      onEvent: function (evt) {
        if (evt.type == 'error') {
          console.log('Error on chrome.tts.speak')
        }
      }
    });
}

function stopSpeaking() {
  //clear
  console.log('stop speaking');
  chrome.tts.stop();
  speaking = false;
}

function initBackground() {
  loadContentScriptInAllTabs();

  chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
      if (request['luidop']) {
        console.log('luidop');
        speakVideoUtterance(request['luidop']);

      } else if (request['seticon']) {
        setBrowserIcon(request['seticon']);
      } else if (request['luidopClear']) {
        //clear array to speak and stop utterances
        stopSpeaking();
      }
    });


  chrome.browserAction.onClicked.addListener(
    function (tab) {
      chrome.tabs.sendRequest(
        tab.id,
        { 'ondertitelLuidop': true });
    });
}



function loadContentScriptInAllTabs() {
  chrome.windows.getAll({ 'populate': true }, function (windows) {
    for (var i = 0; i < windows.length; i++) {
      var tabs = windows[i].tabs;
      for (var j = 0; j < tabs.length; j++) {
        chrome.tabs.executeScript(
          tabs[j].id,
          { file: 'basescript.js' });
      }
    }
  });
}


initBackground();

