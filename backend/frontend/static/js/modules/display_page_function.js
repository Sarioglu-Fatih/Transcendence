import { renderProfilPage, displayAvatar, match_history} from "./profilPage.js";
import { isUserLoggedIn } from "../main.js";
import { check2faStatus } from "./two_fa.js";

function hideAllDivs() {
    hideDivs(['top_box', 'game_launcher', 'friend_list', 'profil_page', 'div_register_form', 'div_login_form', "history", "profile_settings"]);
}

function displayLoginPage() {
    if (isUserLoggedIn()) {
        console.log('la')
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
    check2faStatus();
    renderProfilPage();
    match_history();
    hideDivs(['div_register_form', 'div_login_form', 'game_launcher', 'friend_list']);
    showDivs(['top_box', "profil_page", "profile_settings", "history", 'avatar_upload_form'])
}

function displayHomePage() {
    history.pushState({}, '', '/home');
    displayAvatar();
    hideAllDivs();
    showDivs(['top_box', 'game_launcher', 'friend_list', 'pong_button'])
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

export { displayHomePage , displayLoginPage , displayProfilPage, hideDivs, showDivs }