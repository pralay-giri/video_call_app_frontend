const joinBtn = document.getElementsByClassName("join-btn")[0];
const inputField = document.getElementById("roomId");
const createBtn = document.querySelector(".create-btn");

const randomUID = (uidLength = 10) => {
    const chars = "zxcvbnmasdfghjklqwertyuiop1234567890";
    let uid = "";
    for (let i = 0; i < uidLength; i++) {
        uid += chars[Math.floor(Math.random() * chars.length)];
    }
    return uid;
};

const redirect = (location = "/") => {
    const origin = window.location.origin;
    window.location = origin + location;
};

joinBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!inputField.value.trim()) return;
    redirect("/callpage.html?roomId=" + inputField.value);
});

createBtn.addEventListener("click", () => {
    const uid = randomUID();
    redirect("/callpage.html?roomId=" + uid);
});
