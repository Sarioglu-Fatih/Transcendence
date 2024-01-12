import { displayProfilPage, profilBtn, profilPage, displayAvatar} from './modules/profilPage.js';
import { getCookie, registerUser, registerBtn }  from './modules/register.js';

const MyForm = document.getElementById('div_register_form');

displayAvatar();

MyForm.innerHTML = `
	<form id="register_form">
	<div>
		<label for="inputUsername" class="form-label">Username</label>
		<input type="text" class="form-control" id="inputUsername" >
	</div>

	<div>
		<label for="inputEmail" class="form-label">Email address</label>
		<input type="email" class="form-control" id="inputEmail" >
	</div>

	<div>
		<label for="inputPassword" class="form-label">Password</label>
		<input type="password" class="form-control" id="inputPassword" >
	</div>
	</form>
`
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
