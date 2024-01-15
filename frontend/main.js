import { displayProfilPage, displayAvatar} from './modules/profilPage.js';
import { registerUser, displayRegisterForm }  from './modules/register.js';
import { login, displayLoginFrom } from './modules/login.js'

if (!isUserLoggedIn()) {
  history.pushState({}, '', '/login');
  displayRegisterForm()
  displayLoginFrom()
}
else {
  displayProfilPage()
}

function isUserLoggedIn() {
  const jwtToken = localStorage.getItem('jwt_token');
  if (jwtToken) {
    console.log("user connected")
    return (true)
  }
  console.log("user not  connected")
  return (false)
}


const logoutBtn = document.getElementById('logout_button');

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('jwt_token');
});

window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    if (path === '/profil')
        displayProfilPage();
    else if (path === '/register')
        registerUser();
})

window.addEventListener('load', () => {
    const path = window.location.pathname;
    if (path === '/profil')
        displayProfilPage();
    else if (path === '/register')
        registerUser();
});
