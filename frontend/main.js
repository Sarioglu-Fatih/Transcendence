import { displayProfilPage, displayAvatar} from './modules/profilPage.js';
import { registerUser }  from './modules/register.js';
import { login } from './modules/login.js'


document.addEventListener('DOMContentLoaded', function () {
  history.pushState({}, '', '/login');
  if (isUserLoggedIn()) {
    history.pushState({}, '', '/home');
    console.log('yo')
    hideDivs(['div_register_form', 'div_login_form']);
    showDivs(['top_box'])
  } else
    hideDivs(['top_box'])
})

const loginBtn = document.getElementById('login_button');
loginBtn.addEventListener('click', async function (){
  event.preventDefault();
  await login();
  if (isUserLoggedIn()) {
    history.pushState({}, '', '/home');
    displayAvatar();
    hideDivs(['div_register_form', 'div_login_form']);
    showDivs(['top_box'])
  }
})

const logoutBtn = document.getElementById('logout_button');
logoutBtn.addEventListener('click', () => {
  history.pushState({}, '', '/login');
  localStorage.removeItem('jwt_token');
  hideDivs(['top_box', 'profil_page']);
  showDivs(['div_register_form', 'div_login_form']);
});

const profilBtn = document.getElementById('profil_button');
profilBtn.addEventListener('click', () => {
  history.pushState({}, '', '/profil');
  displayProfilPage();
  showDivs(['profil_page']);
});

const registerBtn = document.getElementById('register_button')
  registerBtn.addEventListener('click', () => {
  event.preventDefault();
  registerUser();
});

function hideDivs(divIds) {
  divIds.forEach(function (divId) {
      var targetDiv = document.getElementById(divId);
      if (targetDiv) {
          targetDiv.style.display = 'none';
      }
  });
}

function showDivs(divIds) {
  divIds.forEach(function (divId) {
      var targetDiv = document.getElementById(divId);
      if (targetDiv) {
          targetDiv.style.display = 'block';
      }
  });
}

function isUserLoggedIn() {
  const jwtToken = localStorage.getItem('jwt_token');
  if (jwtToken !== null) {
    console.log("user connected")
    return (true)
  }
  console.log("user not  connected")
  return (false)
}
 