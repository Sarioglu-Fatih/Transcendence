import { registerUser, updateUser }  from './modules/register.js';
import { login } from './modules/login.js';
import { checkAuth42 } from './modules/auth.js';
import { updateValidationState, updateValidationClass, myInput, length, letter, capital, number, ForbiddenCharElement } from './modules/parsingPwd.js'
import { logout } from './modules/logout.js'
import { displayHomePage , displayLoginPage , displayProfilPage } from './modules/display_page_function.js'
import { handleAvatarUpload } from './modules/avatar_upload.js'
import { makeApiRequest, getCookie } from './modules/utils.js';


var state = 0;
var path = window.location.pathname;
await checkAuth42();
console.log('path', path);
if (!isUserLoggedIn())
  history.pushState({}, '', '/login');
else if (path === '/'){
  console.log('ici')
  history.pushState({}, '', '/home');}
else
  history.pushState({}, '', path);

window.onload = function() {
  var path = window.location.pathname;
  if (path === "/home")
      displayHomePage();
  else if (path === '/login')
      displayLoginPage();
  else if (path.startsWith('/profil/')){
      displayProfilPage(path);
  }
}

window.onpopstate = function(event) {
  var path = window.location.pathname;
  if (!isUserLoggedIn())
  	displayLoginPage();
  else if (path === "/home" && isUserLoggedIn())
      displayHomePage();
  else if (path === '/login')
    displayLoginPage();
  else if (path.startsWith('/profil/'))
      displayProfilPage();
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
profilBtn.addEventListener('click', async () => {
  const response = await makeApiRequest("username");
  const data = await response.json()
  displayProfilPage("/profil/" + data.username);
});

const updateForm = document.getElementById('update_form');
updateForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  

  var inputUsername = document.getElementById('updateUsername');   // update page parsing
  var userName = inputUsername.value;
  var username_regex = /^[a-zA-Z0-9-_]+$/;
  
  
  var inputEmail = document.getElementById('updateEmail');
  var userEmail = inputEmail.value;
  var regex = /\S+@\S+\.\S+/;
  var secRegexEmail = /^[a-zA-Z0-9@.]+$/;

  var inputPassword = document.getElementById('updatePassword');
  var userPassword = inputPassword.value;
  var password_regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  
  let isValid = true;

  if (username_regex.test(userName) || (userName === null || userName === undefined || userName === ''))
  {
    document.getElementById('updateUsernameError').innerHTML = '';
  }
  else
  {
    updateUsernameError.textContent = "Please enter letters, numbers, '-' or '_'."
    console.log("Username not valide");
    isValid = false;
  }
  if ((regex.test(userEmail) && secRegexEmail.test(userEmail)) || (userEmail === null || userEmail === undefined || userEmail === ''))
  {
    document.getElementById('updateEmailError').innerHTML = '';
  }
  else
  {
    updateEmailError.textContent = 'Please enter a valid e-mail address.';
       // inputEmail.classList.add('error');
        console.log("Email not valid");
        isValid = false;
  }
  if (password_regex.test(userPassword) || (userPassword === null || userPassword === undefined || userPassword === ''))
  {
    document.getElementById('updatePasswordError').innerHTML = '';
  }
  else
  {
    updatePasswordError.textContent = "Password must contain the following: lowercase letter, uppercase letter, number, 8 characters and special character(!@#$%&?)"
    console.log("Username not valide");
    isValid = false;
  }
  if (isValid)
  {
    updateUser();
    document.getElementById('update_form').reset();
  }
  else
  {
    console.log("Form not valid");
  }
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

// const authForm = document.getElementById('auth_form')
// authForm.addEventListener('submit', async (event) => {
//   event.preventDefault();
//   authUser();
//   console.log("authUser lancee et fini");
// });

async function isUserLoggedIn() {
  const response = await makeApiRequest("isUserLoggedIn");
  console.log(response);
  const jwtToken = getCookie('jwt_token');
  if (jwtToken !== null && response.ok) {
    console.log("user connected")
    return (true)
  }
  console.log("user not  connected")
  return (false)
}


window.uploadAvatar = async function () {
	handleAvatarUpload()
}

// Link avatar to homepage
const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
const homePageURL = '/home';
const fullHomePageURL = baseURL + homePageURL;
const homelink = document.getElementById('homelink');
homelink.href = fullHomePageURL;

const authButton = document.getElementById('authButton');
authButton.addEventListener('click', () => {
  function generateRandomState() {
    var array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  }

  state = generateRandomState();

  var baseUrl = 'https://api.intra.42.fr/oauth/authorize?';
  var client_id = '&client_id=' + 'u-s4t2ud-e95dac742f419c01abf9f266b8219d8be7c13613ebcc4b3a64edc9e84beac84c';
  var redirect_uri = '&redirect_uri=https%3A%2F%2Flocalhost%3A8000%2Fhome';
  var response_type = '&response_type=code';
  var random_state = '&state=' + state;
  var scope = '&scope=public';
  var fullUrl = baseUrl + client_id + redirect_uri + response_type + scope + random_state;

  window.location = fullUrl;
});

export { isUserLoggedIn, state }
 