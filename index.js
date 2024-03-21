const joinBtn = document.getElementsByClassName("join-btn")[0];
const inputField = document.getElementById("roomId");
const createBtn = document.querySelector(".create-btn");
const shearSection = document.querySelector(".shear-section");
const link = document.querySelector(".link");
const linkText = document.querySelector(".link-text");
const copyBtn = document.querySelector(".copy-btn");
let shearLink, uid;

const randomUID = (uidLength = 15) => {
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
    uid = randomUID();
    inputField.value = uid;
    const origin = window.location.origin;
    shearLink = origin + "/callpage.html?roomId=" + uid;
    shearSection.style.display = "flex";
    link.href = shearLink;
    linkText.innerHTML = uid;
});

copyBtn.addEventListener("click", () => {
    if (!navigator.clipboard) return;
    const copyText = `Direct join link: ${shearLink} , or room id: ${uid}`;
    navigator.clipboard.writeText(copyText);
});
