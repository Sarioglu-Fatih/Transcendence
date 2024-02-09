import { login } from './modules/login.js';
import { checkAuth42 } from './modules/auth.js';
import { logout } from './modules/logout.js'
import { displayHomePage , displayLoginPage , displayProfilPage } from './modules/display_page_function.js'
import { makeApiRequest } from './modules/utils.js';

var state = 0;
var path = window.location.pathname;
await checkAuth42();
console.log('path', path);
if (!isUserLoggedIn())
	history.pushState({}, '', '/login');
else if (path === '/')
	history.pushState({}, '', '/home');
else
	history.pushState({}, '', path);

window.onload = function() {
	console.log('NNNNNNNN')
	var path = window.location.pathname;
	if (!isUserLoggedIn()){
		console.log('aaaaaaaaaa')
		displayLoginPage();}
	else if (path === "/home")
		displayHomePage();
	else if (path === '/login'){
		console.log('aaaaaaaaaa')
		displayLoginPage();}
	else if (path.startsWith('/profil/'))
		displayProfilPage();
  }

window.onpopstate = async function() {
  var path = window.location.pathname;
  if (!await isUserLoggedIn())
  	displayLoginPage();
  else if (path === "/home")
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
  displayProfilPage(window.location.pathname);
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
  updateFormParse();
});

const registerForm = document.getElementById('register_form')
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  inputRegisterForm();
});

// const authForm = document.getElementById('auth_form')
// authForm.addEventListener('submit', async (event) => {
//   event.preventDefault();
//   authUser();
//   console.log("authUser lancee et fini");
// });

function isUserLoggedIn() {
//   const response = await makeApiRequest("isUserLoggedIn");
//   console.log(response);
const jwtToken = getCookie('jwt_token');
console.log(jwtToken);
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

// Switchbox for enable 2FA
var switchbox2FA = document.getElementById('switchbox2FA');
switchbox2FA.addEventListener('change', async (event) => {
	event.preventDefault();
	if (switchbox2FA.checked) {
		enable2fa();
		console.log('2FA is enabled');
	}
	else {
		disable2fa();
		console.log('2FA is disabled');
	}
});
export { isUserLoggedIn, state, friend_list }
 