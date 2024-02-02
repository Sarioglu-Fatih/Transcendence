import { registerUser }  from './modules/register.js';
import { login } from './modules/login.js'
import { updateValidationState, updateValidationClass, myInput, length, letter, capital, number, ForbiddenCharElement } from './modules/parsingPwd.js'
import { launchGame  } from './modules/pong.js';
import { logout } from './modules/logout.js'
import { displayHomePage , displayLoginPage , displayProfilPage } from './modules/display_page_function.js'
import { handleAvatarUpload } from './modules/avatar_upload.js'

const playBtn = document.getElementById("play_button");
playBtn.addEventListener('click', ()=> {
  launchGame();
})

var path = window.location.pathname;
console.log(path);
if (!isUserLoggedIn())
  history.pushState({}, '', '/login');
else if (path === '/')
  history.pushState({}, '', '/home');
else
  history.pushState({}, '', path);

window.onload = function() {
  var path = window.location.pathname;
  switch(path) {
    case "/home":
      displayHomePage();
      break;
    case "/profil":
      displayProfilPage();
      break;
    case "/login":
      displayLoginPage();
      break;
  }
}

window.onpopstate = function(event) {
  var path = window.location.pathname;
  switch(path) {
    case "/home":
      displayHomePage();
      break;
    case "/profil":
      displayProfilPage();
      break;
    case "/login":
      displayLoginPage();
      break;
  }
 }

const loginForm = document.getElementById('login_form');
loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();

  var inputUsername = document.getElementById('login_Username');   // username login parsing
  var userName = inputUsername.value;
  var username_regex = /^[a-zA-Z0-9-_]+$/;

  console.log(inputUsername.value);
  if (username_regex.test(userName))
  {
    document.getElementById('loginUsernameError').innerHTML = '';
    await login();
    displayLoginPage();
    document.getElementById('login_form').reset();
  }
  else
  {
    loginUsernameError.textContent = "Please enter letters, numbers, '-' or '_'."
    console.log("Username not valide");
  }
})

const logoutBtn = document.getElementById('logout_button');
logoutBtn.addEventListener('click', () => {
  document.getElementById('emailError').innerHTML = '';
  document.getElementById('usernameError').innerHTML = '';
  localStorage.removeItem('jwt_token');
  logout();
});

const profilBtn = document.getElementById('profil_button');
profilBtn.addEventListener('click',  () => {
  displayProfilPage();
});

const registerForm = document.getElementById('register_form')
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  var inputUsername = document.getElementById('inputUsername');   // register page parsing
  var userName = inputUsername.value;
  var username_regex = /^[a-zA-Z0-9-_]+$/;

  
  var inputEmail = document.getElementById('inputEmail');
  var userEmail = inputEmail.value;
  var regex = /\S+@\S+\.\S+/;
  var secRegexEmail = /^[a-zA-Z0-9@.]+$/;
 
  var count = 0;

  if (username_regex.test(userName))
  {
    document.getElementById('usernameError').innerHTML = '';
    count++;
  }
  else
  {
    usernameError.textContent = "Please enter letters, numbers, '-' or '_'."
    console.log("Username not valide");
  }
  if (regex.test(userEmail) && secRegexEmail.test(userEmail))
  {
    document.getElementById('emailError').innerHTML = '';
    count++;
  }
  else
  {
    emailError.textContent = 'Please enter a valid e-mail address.';
       // inputEmail.classList.add('error');
        console.log("Email not valid");
  }
  var isPwdValid = updateValidationState(myInput, letter, capital, number, length, ForbiddenCharElement);
  if (isPwdValid && count == 2)
  {
    registerUser();
    document.getElementById('register_form').reset();
    updateValidationState(); // Reset the color of pwd_checkbox
  }
  else
  {
    console.log("Form not valid");
  }
});

function isUserLoggedIn() {
  const jwtToken = localStorage.getItem('jwt_token');
  if (jwtToken !== null) {
    console.log("user connected")
    return (true)
  }
  console.log("user not  connected")
  return (false)
}


window.uploadAvatar = async function () {
	handleAvatarUpload()
}

export { isUserLoggedIn}
 