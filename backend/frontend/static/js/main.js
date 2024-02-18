import { auth42 } from './modules/auth42.js';
import { displayHomePage , displayLoginPage , displayProfilPage } from './modules/display_page_function.js'
import { getCookie, makeApiRequest } from './modules/utils.js';

await auth42();


makeApiRequest('refresh_user_status');


window.onload = function() {
	var path = window.location.pathname;
	if (path === "/home")
		displayHomePage();
	else if (path === '/login' || path === '/'){
		displayLoginPage();}
	else if (path.startsWith('/profil/'))
		displayProfilPage();
  }

window.onpopstate = async function() {
  var path = window.location.pathname;
  if (path === "/home")
    displayHomePage();
  else if (path === '/login' || path === '/')
    displayLoginPage();
  else if (path.startsWith('/profil/'))
    displayProfilPage();
}

document.onvisibilitychange = function() {
  if (document.visibilityState !== 'hidden') {
    makeApiRequest('refresh_user_status');
  }
};


function isUserLoggedIn() {
  // const response = await makeApiRequest("isUserLoggedIn");
  const jwtToken = getCookie('jwt_token');
  if (jwtToken !== null) {
      return (true)
  }
    return (false)
}

export { isUserLoggedIn }


 