const localVideo = document.getElementById("user-1");
const remoteVideo = document.getElementById("user-2");
const confarenceSection = document.querySelector("#confarenceSection");
const closeBtn = document.querySelector(".close-btn");
const muteBtn = document.querySelector(".mute-btn");
const videoBtn = document.querySelector(".video-btn");

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

let localStream,
    remoteStream,
    isCaller,
    roomID,
    isMute = false;
isVideoShow = false;

let localPeerConnection = new PEER();
let remotePeerConnection = new PEER();
const socket = io("http://localhost:8000");

const mediaConstrain = {
    video: {
        width: { min: 640, max: 1920 },
        height: { min: 480, max: 1080 },
    },
    audio: true,
};

const fetchRoomId = () => {
    const searchParams = window.location.search;
    if (!searchParams) {
        window.location = "/";
    }
    return searchParams.replace(/\?roomId=/, "");
};

roomID = fetchRoomId();

socket.emit("create-room", roomID);
socket.on("room:created", async ({ roomId }) => {
    roomID = roomId;
    localStream = await navigator.mediaDevices.getUserMedia(mediaConstrain);

    localVideo.srcObject = localStream;
    // audio video

    localPeerConnection.peer.addTrack(localStream.getTracks()[0], localStream);
    localPeerConnection.peer.addTrack(localStream.getTracks()[1], localStream);
});

socket.on("room:joined", async ({ roomId }) => {
    roomID = roomId;

    localStream = await navigator.mediaDevices.getUserMedia(mediaConstrain);
    localVideo.srcObject = localStream;

    // audio video track
    remotePeerConnection.peer.addTrack(localStream.getTracks()[0], localStream);
    remotePeerConnection.peer.addTrack(localStream.getTracks()[1], localStream);

    socket.emit("remote:ready", { roomId });
});

// local have the confirmation of joning the room
socket.on("remote:ready", async ({ roomId }) => {
    const offer = await localPeerConnection.createOffer();

    // sending the offer to the remote
    socket.emit("SDP:offer", {
        offer,
        roomId,
    });
});

// remote get offer
socket.on("SDP:offer", async ({ offer, roomId }) => {
    const answer = await remotePeerConnection.createAnswer(offer);
    //sending the answer to local
    socket.emit("SPD:answer", { answer, roomId });
});

// local get answer
socket.on("SPD:answer", async ({ answer, roomId }) => {
    await localPeerConnection.setRemoteDescription(answer);
});

localPeerConnection.peer.ontrack = (event) => {
    remoteStream = event.streams[0];
    remoteVideo.srcObject = remoteStream;
};

remotePeerConnection.peer.ontrack = (event) => {
    remoteStream = event.streams[0];
    remoteVideo.srcObject = remoteStream;
};

localPeerConnection.peer.onicecandidate = (event) => {
    if (!event.candidate) return null;
    socket.emit("ICECandidate:local", {
        type: "candidate",
        candidate: event.candidate,
        roomID,
    });
};

remotePeerConnection.peer.onicecandidate = (event) => {
    if (!event.candidate) return null;
    socket.emit("ICECandidate:remote", {
        type: "candidate",
        candidate: event.candidate,
        roomID,
    });
};

socket.on("ICECandidate:local", ({ type, candidate, roomID }) => {
    remotePeerConnection.peer.addIceCandidate(candidate);
});

socket.on("ICECandidate:remote", ({ type, candidate, roomID }) => {
    localPeerConnection.peer.addIceCandidate(candidate);
});

closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    socket.emit("client:disconect", { roomID });
    window.location = "/";
});

socket.on("client:disconect", ({ roomID }) => {
    remoteStream = null;
    remoteVideo.srcObject = null;
    remotePeerConnection.peer.close();
    window.location = "/";
});

muteBtn.addEventListener("click", () => {
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
});

videoBtn.addEventListener("click", () => {
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
});
