import { hideDivs, showDivs } from "./utils.js";
import { makeApiRequest, makeApiRequestPatch, getCookie } from "./utils.js";
import { closeAllWebSockets } from "./utils.js";


async function logout() {
    try {
      const response = await  makeApiRequestPatch('logout/')
      history.pushState({}, '', '/login');
      if (response.ok) {
        // document.getElementById('emailError').innerHTML = '';
        // document.getElementById('usernameError').innerHTML = '';
        closeAllWebSockets();
        hideDivs(['top_box',  'game_launcher', 'friend_list', 'profil_page', 'profile_settings', 'history', 'avatar_upload_form']);
        showDivs(['div_register_form', 'div_login_form']);
        console.log('Logout successful.');
      }
      else {
        console.error('Error logout:', response.status);
      }
    } catch (error) {
      console.error('Error logging out user:', error);
    }
  }

export { logout }