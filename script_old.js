let menu = document.querySelector(".menu-icon");
let navbar = document.querySelector(".navbar");
// Set light theme by default
document.body.classList.add("light-theme");
document.getElementById("icon").src = "images/moon.png"; // Set moon icon initially

var icon = document.getElementById("icon");
icon.onclick = function () {
    document.body.classList.toggle("light-theme");
    if (document.body.classList.contains("light-theme")) {
        icon.src = "images/moon.png"; // Moon icon for dark mode
    } else {
        icon.src = "images/sun.png"; // Sun icon for light mode
    }
};

menu.onclick = () => {
    navbar.classList.toggle("open-menu")
    menu.classList.toggle("move");
};
window.onscroll = () =>{
    navbar.classList.remove("open-menu")
    menu.classList.remove("move");
}
var icon=document.getElementById("icon");
icon.onclick=function(){
    document.body.classList.toggle("light-theme");
    if(document.body.classList.contains("light-theme")){
        icon.src="images/moon.png";
    }
    else{
        icon.src="images/sun.png";
    }
}

// Play Click Sound
function playClickSound() {
    const clickSound = document.getElementById('click-sound');
    if (clickSound) {
        clickSound.play();
    } else {
        console.error('Click sound element not found.');
    }
}
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', playClickSound);
});

// Email Validation and Sending
//   email 
function validate(){
    let name= document.querySelector(".name");
    let email= document.querySelector(".email");
    let msg= document.querySelector(".message");
    let sendBtn= document.querySelector(".send-btn");
    sendBtn.addEventListener('click',(e)=>{
        e.preventDefault();
        if(name.value == "" || email.value == "" || msg.value== ""){
            emptyerror();
        }else{
            sendmail (name.value, email.value, msg.value);
            success();
        }
    });

}
validate();
function sendmail(name,email,msg)
{
    emailjs.send("service_vikash__gupta","template_u8mh7fk",{
        from_name: email,
        to_name: name,
        message: msg,
        });
}
function emptyerror()
{
    swal({
        title: "Complete All The Sections",
        text: "Fields cant be empty",
        icon: "error",
      });
}
function success()
{
    swal({
        title: "Email Sent Succesfully",
        text: "We will Try To Rspond In 24 Hours",
        icon: "success",
      });
}
// header backgrond change on scroll 
let header = document.querySelector("header");
window.addEventListener("scroll", () => {
    header.classList.toggle("header-active", window.scrollY > 0);
});

let scrollTop = document.querySelector(".scroll-top")
window.addEventListener("scroll", () => {
    scrollTop.classList.toggle("scroll-active", window.scrollY >= 400);
});
