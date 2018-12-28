
//globals for setInterval
var intervalWaitForVideoDom, intervalplayProgress;
//globals
var vrtTtsRequested = false;
var speakOutWhenPlaying = false;
var webVttLoaded = false;
var webVttParsed = false;
var videoElementLoaded = false;
var readyToSpeak = false;
var videoVttErrorStop = false;
var debugLog = true;

//load parser external component
var parser = new WebVTT.Parser(window, WebVTT.StringDecoder()),
  cues = [];
var previousCueIndex = -1;

function DebugToConsole(valuetoWrite) {
  if (debugLog) {
    console.log(valuetoWrite);
  }
}

//return true and load global - if not found then set to gray and stop trying
function loadParseWebVtt() {
  if (!webVttLoaded) {
    DebugToConsole('loadParseWebVtt not yet loaded? ' + webVttLoaded)
    var videoid = getVideoId();

    if (videoid != undefined && videoid != "") {
      //load webvtt
      if (!webVttLoaded) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {

          if (this.readyState == 4 && this.status == 200) {
            DebugToConsole('Webtt length: ' + this.responseText.length);

            webVttLoaded = true;

            var transform = this.responseText;
            //temp workaround for timecodes returned by VRT
            DebugToConsole('Temp hack - replace timecode format ' + transform.indexOf("\n10:"));
            if (transform.indexOf("\n10:") > -1) {
              
              transform = transform.replace(/\n10:/g, "\n00:");
              transform = transform.replace(/\n11:/g, "\n01:");
              transform = transform.replace(/--> 11:/g, "--> 01:");
              transform = transform.replace(/--> 10:/g, "--> 00:");
              console.log("================================");
            }

            //parse web vtt
            parser.parse(transform);
            parser.flush();

          } else if (this.status >= 400) {
            videoVttErrorStop = true;
            chrome.extension.sendRequest({ 'seticon': 'luidop20_gray.png' });
            DebugToConsole('access denied for vtt file.');
          }
        };

        xmlhttp.onerror = function () {
          videoVttErrorStop = true;
          chrome.extension.sendRequest({ 'seticon': 'luidop20_gray.png' });
          DebugToConsole(xmlhttp.status + ' ' + xmlhttp.statusText);
        }

        xmlhttp.open("GET", "https://services-subtitles.vrt.be/" + videoid, true);
        xmlhttp.setRequestHeader('Content-Type', 'text/plain');

        xmlhttp.send();

      }

    }
  }
}


var playEvent = function () {
  DebugToConsole('play event called');
  if (vrtTtsRequested && webVttParsed) {
    var videoVrt = document.getElementsByTagName('video')[1];
    previousCueIndex = -1;
    intervalplayProgress = setInterval(function () {
      playprogressTts(videoVrt);
    }, 500);
  }
}
var pauseEvent = function () {
  previousCueIndex = -1;
  DebugToConsole('paused');
}


var checkCueToReturn = function (value) {
  if (typeof value.endTime !== 'number')
    return false;
  else

    return value.endTime >= this.minimum;
}

function playprogressTts(videoEl) {
  if (videoEl != undefined && vrtTtsRequested) {    
    DebugToConsole('vrtTtsRequested - ' + vrtTtsRequested);

    if (videoEl.paused == false) {

      var obj = { minimum: videoEl.currentTime }

      var index = cues.findIndex(checkCueToReturn, obj);
      DebugToConsole("index " + index);

      if (index != undefined && index > -1 && cues[index].startTime < videoEl.currentTime) {
        if (index != previousCueIndex) {
          cueToAdd = cues[index].text;
          DebugToConsole("cuetoadd luidop background call - " + cueToAdd);
          previousCueIndex = index;
          
          chrome.extension.sendRequest({ 'luidop': cueToAdd });
        } else {
          DebugToConsole('index same as previous - ' + previousCueIndex);
        }

      }
    }

  }
}


function attachToPlayerEvents() {
  var videoVrt = document.getElementsByTagName('video')[1];
  if (videoVrt != undefined && vrtTtsRequested && !videoVttErrorStop) {

    videoVrt.addEventListener("pause", pauseEvent);

    videoVrt.addEventListener("play", playEvent);

    if (videoVrt.paused == false) {
      DebugToConsole('intervalplayProgress ' + intervalplayProgress);
      //already palying - 
      intervalplayProgress = setInterval(function () {
        playprogressTts(videoVrt);
      }, 1000);
    }


  } else {
    DebugToConsole('video is not playing or not found');
  }
}


function waitForVideoDom() {
  //wait for the video element to be available in DOM
  var videoEls = document.getElementsByTagName('video');
  DebugToConsole('waitForVideoDom()');
  if (videoEls.length > 1) {

    var videoVrt = document.getElementsByTagName('video')[1];
    DebugToConsole('waitForVideoDom found - ' + videoVrt);
    if (videoVrt != undefined) {
      //stop timeout
      videoElementLoaded = true;
      //attach to video player 
      attachToPlayerEvents();

      clearInterval(intervalWaitForVideoDom);
    }
  }

  if (videoVttErrorStop)
    clearInterval(intervalWaitForVideoDom);

}


function setBaseRequests() {
  DebugToConsole('setBaseRequests current VrtTtsrequested = ' + vrtTtsRequested);
  if (vrtTtsRequested == false) {
    vrtTtsRequested = true;

    if (videoElementLoaded) {
      attachToPlayerEvents();
    }

    if (videoVttErrorStop) {
      chrome.extension.sendRequest({ 'seticon': 'luidop20_gray.png' });
      return;
    }
    else {
      chrome.extension.sendRequest({ 'seticon': 'luidop20_active.png' });
    }
  }
  else {
    vrtTtsRequested = false;
    //stop playing
    chrome.extension.sendRequest({ 'seticon': 'luidop20.png' });
    chrome.extension.sendRequest({ 'luidopClear': "all" });
  }
}

function ensureBaseSetup() {
  DebugToConsole('ensureBaseSetup');
  if (!videoVttErrorStop) {
    //load and parse VTT
    loadParseWebVtt();
    //wait for video element to be available in DOM
    if (!videoElementLoaded) {
      intervalWaitForVideoDom = setInterval(function () {
        waitForVideoDom();
      }, 1000);
    }
  }

}

//function called when clicking the extension - setup all base requirements and activate TTS/deactive on second click
function onExtensionMessage(request) {
  DebugToConsole('onExtensionMessage:');
  DebugToConsole(request);
  
  if (request['ondertitelLuidop'] != undefined) {

    if (videoVttErrorStop) {
      //cannot do anything, global error
      chrome.extension.sendRequest({ 'seticon': 'luidop20_gray.png' });
      return;
    }

    //ensure webvtt is loaded and listen for play event
    ensureBaseSetup();
    setBaseRequests();

  }
}

function initContentScript() {
  DebugToConsole('VRT Luidop-add listener for extension request');
  chrome.extension.onRequest.addListener(onExtensionMessage);
  chrome.extension.sendRequest({ 'init': true }, onExtensionMessage);

}

parser.oncue = function (cue) {
  cues.push(cue);
};
parser.onflush = function () {
  webVttParsed = true;
};
parser.onparsingerror = function (e) {
  videoVttErrorStop = true;
  chrome.extension.sendRequest({ 'seticon': 'luidop20_gray.png' });
  DebugToConsole('VRTNU extension error ' + e);
};


function getVideoId() {
  //identify the videoid
  var videoId = undefined;
  if (document.querySelector('[data-videoid]') != undefined) {
    videoId = document.querySelector('[data-videoid]').dataset.videoid;
  }
  DebugToConsole('VRT Luidop-Videoid via [data-videoid] ' + videoId);
  if (videoId != undefined) {
    return videoId;
  }
  else {
    videoVttErrorStop = true;
    chrome.extension.sendRequest({ 'seticon': 'luidop20_gray.png' });
  }

}


initContentScript();

window.addEventListener('beforeunload', function () {
  chrome.extension.sendRequest({ 'seticon': 'luidop20.png' });
  DebugToConsole('unload vrt nu extension');
});

