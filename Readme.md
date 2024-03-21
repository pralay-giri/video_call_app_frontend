# Video caling app using core WEBRTC [click to see](https://video-call-app-nine.vercel.app)

## project implementation

-   creating the room and accesing the camera and mick

```js
localStream = await navigator.mediaDevices.getUserMedia(mediaConstrain);
localVideo.srcObject = localStream;
```

-   i create a class PEER for the utility function

```js
class PEER {
    //STUN servers
    static servers = {
        iceServer: [
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
        ],
    };

    constructor() {
        this.peer = new RTCPeerConnection(PEER.servers);
    }

    async createOffer() {
        if (!this.peer) return;
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        return offer;
    }

    async createAnswer(offer) {
        if (!this.peer) return;
        await this.peer.setRemoteDescription(offer);
        const answer = await this.peer.createAnswer(offer);
        await this.peer.setLocalDescription(answer);
        return answer;
    }

    async setRemoteDescription(answer) {
        if (!this.peer) return;
        await this.peer.setRemoteDescription(answer);
    }
}
```

-   create an instance of RTCPeerConnection for local and remote users

```js
peerConnection = new RTCPeerConnection(PEER.servers);
```

-   setting the media tracks in the pipe line. That remote user can see the video and listen the audio

```js
// audio video
localPeerConnection.peer.addTrack(localStream.getTracks()[0], localStream);
localPeerConnection.peer.addTrack(localStream.getTracks()[1], localStream);
```

-   set the same thing for the other user how joined the room by invite link/room id. access the camera and audio set the tracks

-   after joining local and remote client, then exchange the SPD offer/answer by using the PEER.createOffer() and PEER.createAnswer() methods, using the signling server

```js
// for generating SDP offer
// this create offer set the local description
const offer = await localPeerConnection.createOffer();

socket.emit("SDP:offer", {
    offer,
    roomId,
});

// for sending SDP the answer
const answer = await remotePeerConnection.createAnswer(offer);
//sending the answer to local
socket.emit("SPD:answer", { answer, roomId });

// after geting the answer of the offer set the remote description of the local client
await localPeerConnection.setRemoteDescription(answer);
```

-   after exchanging the SDP, exchange the ICE candidate

```js
// sending the icecandidate
peerConnection.onicecandidate = (event) => {
    if (!event.candidate) return null;
    socket.emit("ICECandidate:local", {
        type: "candidate",
        candidate: event.candidate,
        roomID,
    });
};

// setting the ice candidate to connection
socket.on("ICECandidate:local", ({ type, candidate, roomID }) => {
    peerConnection.addIceCandidate(candidate);
});
```

-   for mute and video disable functionality use the track.enabled method

```js
// for audio
localStream.getTracks().forEach((track) => {
    if (track.kind === "audio") {
        if (isMute) {
            muteBtn.style.backgroundColor = "darkcyan";
        } else {
            muteBtn.style.backgroundColor = "gray";
        }

        isMute = !isMute;
        track.enabled = !track.enabled;
    }
});

// for video
localStream.getTracks().forEach((track) => {
    if (track.kind === "video") {
        if (isVideoShow) {
            videoBtn.style.backgroundColor = "darkcyan";
        } else {
            videoBtn.style.backgroundColor = "gray";
        }

        isVideoShow = !isVideoShow;
        track.enabled = !track.enabled;
    }
});
```

---

### thank you for reading the documentation 🙂
