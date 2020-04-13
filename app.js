'use strict';

var localVideo;
var localStream;
var remoteVideo;
var peerConnection;
var uuid;
var _socket;


var peerConnectionConfig = {
  'iceServers': [
    {'urls': 'stun:stun.stunprotocol.org:3478'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
};

function call() {
	peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.onicecandidate = (candidate) => {
  	if(event.candidate != null) {
    	_socket.emit('message', JSON.stringify({'event': 'candidate', 'candidate': event.candidate, 'uuid': uuid}));
  	}
  };

  peerConnection.ontrack = (event) => {
		remoteVideo.srcObject = event.streams[0];
  };

  peerConnection.addStream(localStream);

  peerConnection.createOffer().then((description) => {

  	peerConnection.setLocalDescription(description).then(function() {
    	_socket.emit('message', JSON.stringify({'event': 'offer', 'sdp': peerConnection.localDescription, 'uuid': uuid}));
  	}).catch(_errorHandler);

  }).catch(_errorHandler);
}



function init() {
	localVideo = document.getElementById('localVideo');
  remoteVideo = document.getElementById('remoteVideo');

  uuid = createUUID();

  _getStream();

  _registerWebsocket();

}



function _getStream() {
	var constraints = {
    video: true,
    audio: true,
  };

  if(navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getDisplayMedia().then((stream) => {
    	localStream = stream;
  		localVideo.srcObject = stream;
    }).catch(_errorHandler);
  } else {
    alert('Your browser does not support getUserMedia API');
  }	
}

function _registerWebsocket() {
	_socket = io('http://localhost:3000');
	_socket.on('message', (s) => {
		var data = JSON.parse(s);
		if(data.uuid == uuid) return;
		if (data.event === 'offer') {

				peerConnection = new RTCPeerConnection(peerConnectionConfig);
			  peerConnection.onicecandidate = (candidate) => {
			  	if(event.candidate != null) {
			    	_socket.emit('message', JSON.stringify({'event': 'candidate', 'candidate': event.candidate, 'uuid': uuid}));
			  	}
			  };

			  peerConnection.ontrack = (event) => {
					remoteVideo.srcObject = event.streams[0];
			  };

			  peerConnection.addStream(localStream);


			peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp)).then(function() {
      	// Only create answers in response to offers
	        peerConnection.createAnswer().then((description) => {

				  	peerConnection.setLocalDescription(description).then(function() {
				    	_socket.emit('message', JSON.stringify({'event': 'answer', 'sdp': peerConnection.localDescription, 'uuid': uuid}));
				  	}).catch(_errorHandler);

				  }).catch(_errorHandler);
    	}).catch(_errorHandler);
		} else if (data.event === 'answer') {
			peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
		} else if (data.event === 'candidate') {
			peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(_errorHandler);
		}
	});
}


function _errorHandler(error) {
  console.log(error);
}

function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}


init();