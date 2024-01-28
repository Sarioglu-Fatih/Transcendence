import { renderProfilPage, displayAvatar } from "./profilPage.js";
import { isUserLoggedIn } from "../main.js";

function displayLoginPage() {
    if (isUserLoggedIn()) {
        displayHomePage();
    }
    else {
        history.pushState({}, '', '/login');
        showDivs(['div_register_form', 'div_login_form']);
        hideDivs(['top_box', 'game_launcher', 'friend_list', 'profil_page']);
    }
}

function displayProfilPage() {
    history.pushState({}, '', '/profil');
    displayAvatar();
    renderProfilPage();
    hideDivs(['div_register_form', 'div_login_form', 'game_launcher', 'friend_list']);
    showDivs(['top_box'])
}

function displayHomePage() {
    history.pushState({}, '', '/home');
    displayAvatar();
    hideDivs(['div_register_form', 'div_login_form']);
    showDivs(['top_box', 'game_launcher', 'friend_list'])
}

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

export { displayHomePage , displayLoginPage , displayProfilPage }