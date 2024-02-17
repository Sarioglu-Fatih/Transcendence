import { checkAuth42 } from './modules/auth.js';
import { displayHomePage , displayLoginPage , displayProfilPage } from './modules/display_page_function.js'
import { getCookie, makeApiRequest } from './modules/utils.js';

await checkAuth42();
if (isUserLoggedIn()){
  makeApiRequest('refresh_user_status');
}

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

document.onvisibilitychange = function() {
  if (document.visibilityState !== 'hidden') {
    makeApiRequest('refresh_user_status');
  }
};


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

export { isUserLoggedIn }


 