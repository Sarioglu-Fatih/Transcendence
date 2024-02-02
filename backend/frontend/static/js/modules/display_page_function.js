import { renderProfilPage, displayAvatar } from "./profilPage.js";
import { isUserLoggedIn } from "../main.js";

function hideAllDivs() {
    hideDivs(['top_box', 'game_launcher', 'friend_list', 'profil_page', 'div_register_form', 'div_login_form', "history", "profile_settings"]);
}

function displayLoginPage() {
    if (isUserLoggedIn()) {
        displayHomePage();
    }
    else {
        history.pushState({}, '', '/login');
        hideAllDivs();
        showDivs(['div_register_form', 'div_login_form']);
        hideDivs(['top_box', 'game_launcher', 'friend_list', 'profil_page', 'avatar_upload_form']);
    }
}

function displayProfilPage(path) {
    history.pushState({}, '', path);
    hideAllDivs();
    displayAvatar();
    renderProfilPage();
    hideDivs(['div_register_form', 'div_login_form', 'game_launcher', 'friend_list']);
    showDivs(['top_box', "profil_page", "profile_settings", "history", 'avatar_upload_form'])
}

function displayHomePage() {
    history.pushState({}, '', '/home');
    displayAvatar();
    hideAllDivs();
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