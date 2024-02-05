import { renderProfilPage, displayAvatar } from "./profilPage.js";
import { isUserLoggedIn, friend_list } from "../main.js";

function hideAllDivs() {
    hideDivs(['top_box', 'game_launcher', 'friendListBody', 'profil_page', 'div_register_form', 'div_login_form', "history", "profilLeftSide", "profilRightSide", "addFriend_button"]);
}

function displayLoginPage() {
    if (isUserLoggedIn()) {
        displayHomePage();
    }
    else {
        history.pushState({}, '', '/login');
        hideAllDivs();
        showDivs(['div_register_form', 'div_login_form']);
    }
}

async function displayProfilPage(path) {
    history.pushState({}, '', path);
    hideAllDivs();
    displayAvatar();
    let isHimself = await renderProfilPage();
    if (isHimself == true)
        showDivs(['top_box', "profil_page", "profilLeftSide", "profilRightSide", "history"])
    else
        showDivs(['top_box', "profil_page", "profilLeftSide", "addFriend_button", "history"])
}

function displayHomePage() {
    history.pushState({}, '', '/home');
    friend_list();
    displayAvatar();
    hideAllDivs();
    showDivs(['top_box', 'game_launcher', 'friendListBody', 'friendListCard'])
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