import { login } from './modules/login.js';
import { checkAuth42 } from './modules/auth.js';
import { logout } from './modules/logout.js'
import { displayHomePage , displayLoginPage , displayProfilPage } from './modules/display_page_function.js'
import { makeApiRequest, getCookie } from './modules/utils.js';

var state
await checkAuth42();
console.log(state)

var path = window.location.pathname;
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

export { isUserLoggedIn, state }


 