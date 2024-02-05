import { registerUser, updateUser } from './modules/register.js';
import { login } from './modules/login.js'
import { updateValidationState, updateValidationClass, myInput, length, letter, capital, number, ForbiddenCharElement } from './modules/parsingPwd.js'
import { launchGame, drawPong } from './modules/pong.js';
import { logout } from './modules/logout.js'
import { displayHomePage, displayLoginPage, displayProfilPage } from './modules/display_page_function.js'
import { makeApiRequest, getCookie } from './modules/utils.js';

const playBtn = document.getElementById("play_button");
playBtn.addEventListener('click', () => {
  launchGame();
})

drawPong();

var path = window.location.pathname;
console.log(path);
if (!isUserLoggedIn())
  history.pushState({}, '', '/login');
else if (path === '/') {
  console.log('ici')
  history.pushState({}, '', '/home');
}
else
  history.pushState({}, '', path);

window.onload = function () {
  var path = window.location.pathname;
  if (path === "/home")
    displayHomePage();
  else if (path === '/login')
    displayLoginPage();
  else if (path.startsWith('/profil/')) {
    displayProfilPage(path);
  }
}

window.onpopstate = function (event) {
  var path = window.location.pathname;
  if (path === "/home")
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
  if (username_regex.test(userName)) {
    document.getElementById('loginUsernameError').innerHTML = '';
    await login();
    displayLoginPage();
    document.getElementById('login_form').reset();
  }
  else {
    loginUsernameError.textContent = "Please enter letters, numbers, '-' or '_'."
    console.log("Username not valide");
  }
})

const addFriend = document.getElementById('addFriend_button');
addFriend.addEventListener('click', async function (event) {
  event.preventDefault();

  const csrfToken = getCookie('csrftoken');
  const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
  const clientURL = window.location.href;
  const segments = clientURL.split('/');
  let lastSegment = segments[segments.length - 2];
  lastSegment += "/";
  const result = await fetch(`${baseURL}/api/add_friend/${lastSegment}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
  })
})

async function friend_list() {
  const friendListElement = document.getElementById('friendListCard');

  try {
    const response = await fetch('/api/my_friends');
    const data = await response.json();
    console.log(data.friend_list);
    friendListElement.innerHTML = '';
    data.friend_list.forEach(friend => {
      console.log(friend.username);
      var friendElement = document.createElement('div');
      friendElement.classList.add('card', 'text-center', 'mb-3')
      friendElement.innerHTML = `
        <div class="row">
          <div class="col">
            <button class="btn friend-button">${friend.username}</button>
          </div>
        </div>`;
      friendListElement.appendChild(friendElement);

      friendElement.querySelector('.friend-button').addEventListener('click', () => {
        const username = friend.username;
        console.log(`Clic sur le bouton de ${username}`);
        getFriendProfil(username);
      });
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la liste d\'amis :', error);
  }
}


const logoutBtn = document.getElementById('logout_button');
logoutBtn.addEventListener('click', () => {
  document.getElementById('emailError').innerHTML = '';
  document.getElementById('usernameError').innerHTML = '';
  localStorage.removeItem('jwt_token');
  displayLoginPage();
  logout();
});

const profilBtn = document.getElementById('profil_button');
profilBtn.addEventListener('click', async () => {
  const response = await makeApiRequest("username");
  const data = await response.json()
  displayProfilPage("/profil/" + data.username);
});

async function getFriendProfil(username) {
  try {
    displayProfilPage(`profil/${username}/`);
    const jwtToken = localStorage.getItem('jwt_token');
    const response = await fetch(`/api/profil/${username}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur réseau');
    }
    
    const userData = await response.json();
    console.log(userData);
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur :', error);
  }
}

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

  if (username_regex.test(userName) || (userName === null || userName === undefined || userName === '')) {
    document.getElementById('updateUsernameError').innerHTML = '';
  }
  else {
    updateUsernameError.textContent = "Please enter letters, numbers, '-' or '_'."
    console.log("Username not valide");
    isValid = false;
  }
  if ((regex.test(userEmail) && secRegexEmail.test(userEmail)) || (userEmail === null || userEmail === undefined || userEmail === '')) {
    document.getElementById('updateEmailError').innerHTML = '';
  }
  else {
    updateEmailError.textContent = 'Please enter a valid e-mail address.';
    // inputEmail.classList.add('error');
    console.log("Email not valid");
    isValid = false;
  }
  if (password_regex.test(userPassword) || (userPassword === null || userPassword === undefined || userPassword === '')) {
    document.getElementById('updatePasswordError').innerHTML = '';
  }
  else {
    updatePasswordError.textContent = "Password must contain the following: lowercase letter, uppercase letter, number, 8 characters and special character(!@#$%&?)"
    console.log("Username not valide");
    isValid = false;
  }
  if (isValid) {
    updateUser();
    document.getElementById('update_form').reset();
  }
  else {
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

  if (username_regex.test(userName)) {
    document.getElementById('usernameError').innerHTML = '';
    count++;
  }
  else {
    usernameError.textContent = "Please enter letters, numbers, '-' or '_'."
    console.log("Username not valide");
  }
  if (regex.test(userEmail) && secRegexEmail.test(userEmail)) {
    document.getElementById('emailError').innerHTML = '';
    count++;
  }
  else {
    emailError.textContent = 'Please enter a valid e-mail address.';
    // inputEmail.classList.add('error');
    console.log("Email not valid");
  }
  var isPwdValid = updateValidationState(myInput, letter, capital, number, length, ForbiddenCharElement);
  if (isPwdValid && count == 2) {
    registerUser();
    document.getElementById('register_form').reset();
    updateValidationState(); // Reset the color of pwd_checkbox
  }
  else {
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

export { isUserLoggedIn, friend_list }
