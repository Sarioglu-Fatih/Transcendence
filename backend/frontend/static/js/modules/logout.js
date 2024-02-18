import { displayLoginPage } from "./display_page_function.js";
import { hideDivs, showDivs } from "./utils.js";
import { makeApiRequest, makeApiRequestPatch, getCookie } from "./utils.js";
import { closeAllWebSockets } from "./utils.js";


async function logout() {
    try {
      const response = await  fetch('https://localhost:8000/api/logout/')
      if (response.ok) {
        history.pushState({}, '', '/login');
        closeAllWebSockets();
        displayLoginPage()
      }
      else {
        console.error('Error logout:', response.status);
      }
    } catch (error) {
      console.error('Error logging out user:', error);
    }
  }

export { logout }