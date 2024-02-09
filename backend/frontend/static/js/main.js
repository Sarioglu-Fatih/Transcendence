import { login } from './modules/login.js';
import { checkAuth42 } from './modules/auth.js';
import { logout } from './modules/logout.js'
import { displayHomePage , displayLoginPage , displayProfilPage } from './modules/display_page_function.js'
import { makeApiRequest, getCookie } from './modules/utils.js';

var state = 0;
var path = window.location.pathname;
// await checkAuth42();
if (!isUserLoggedIn())
	history.pushState({}, '', '/login');
else if (path === '/')
	history.pushState({}, '', '/home');
else
	history.pushState({}, '', path);

window.onload = function() {
	var path = window.location.pathname;
	if (path === "/home")
		displayHomePage();
	else if (path === '/login'){
		displayLoginPage();}
	else if (path.startsWith('/profil/'))
		displayProfilPage();
  }

window.onpopstate = async function() {
  var path = window.location.pathname;
  if (path === "/home")
      displayHomePage();
  else if (path === '/login')
    displayLoginPage();
  else if (path.startsWith('/profil/'))
    displayProfilPage();
}



// const addFriend = document.getElementById('addFriend_button');
// addFriend.addEventListener('click', async function (event) {
//   event.preventDefault();

//   const csrfToken = getCookie('csrftoken');
//   const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
//   const clientURL = window.location.href;
//   const segments = clientURL.split('/');
//   let lastSegment = segments[segments.length - 2];
//   lastSegment += "/";
//   const result = await fetch(`${baseURL}/api/add_friend/${lastSegment}`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-CSRFToken': csrfToken,
//     },
//   })
//   displayProfilPage(window.location.pathname);
// })




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

// const authButton = document.getElementById('authButton');
// authButton.addEventListener('click', () => {
//   function generateRandomState() {
//     var array = new Uint8Array(16);
//     window.crypto.getRandomValues(array);
//     return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
//   }

//   state = generateRandomState();

//   var baseUrl = 'https://api.intra.42.fr/oauth/authorize?';
//   var client_id = '&client_id=' + 'u-s4t2ud-e95dac742f419c01abf9f266b8219d8be7c13613ebcc4b3a64edc9e84beac84c';
//   var redirect_uri = '&redirect_uri=https%3A%2F%2Flocalhost%3A8000%2Fhome';
//   var response_type = '&response_type=code';
//   var random_state = '&state=' + state;
//   var scope = '&scope=public';
//   var fullUrl = baseUrl + client_id + redirect_uri + response_type + scope + random_state;

//   window.location = fullUrl;
// });

export { isUserLoggedIn, state}
 