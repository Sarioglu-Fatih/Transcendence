import { displayProfilPage, profilBtn, profilPage } from './modules/profilPage.js';
import { getCookie, registerUser, registerBtn }  from './modules/register.js';


profilBtn.addEventListener('click', () => {
  history.pushState({}, '', '/profil');
  displayProfilPage();
});

registerBtn.addEventListener('click', () => {
  history.pushState({}, '', '/register');
  registerUser();
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
