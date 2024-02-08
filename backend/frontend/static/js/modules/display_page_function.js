import { renderProfilPage, displayAvatar, match_history, isFriend} from "./profilPage.js";
import { isUserLoggedIn, friend_list } from "../main.js";
import { check2faStatus } from "./two_fa.js";

function hideAllDivs() {
    hideDivs(['top_box', 'game_launcher', 'friendListBody', 'profil_page', 'div_register_form', 'div_login_form', "history", "profilLeftSide", "profilRightSide", "addFriend_button", "error404"]);
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

function error404() {
    hideAllDivs();
    showDivs(['error404'])
}

async function displayProfilPage(path) {
    history.pushState({}, '', path);
    hideAllDivs();
    displayAvatar();
    check2faStatus();
   match_history();
    try {
        let isHimself = await renderProfilPage();
        if (isHimself == true) {
            showDivs(['top_box', "profil_page", "profilLeftSide", "profilRightSide", "history"]);
        }
        else {
            const currentPath = window.location.pathname.substring(1);
            const userToAddName = currentPath.replace(/^profil/, 'isFriend');
            const isFriends = await isFriend(userToAddName);
            console.log(isFriends);
            if (isFriends)
                showDivs(['top_box', "profil_page", "profilLeftSide", "history"])
            else
                showDivs(['top_box', "profil_page", "profilLeftSide", "addFriend_button", "history"])
        }
    }
    catch (error) {
        if (error.status === 400) {
            showDivs(['top_box', "profil_page", "profilLeftSide", "addFriend_button", "history"]) 
        }
        else {
            error404();
        }
    }
}

function displayHomePage() {
    history.pushState({}, '', '/home');
    friend_list();
    displayAvatar();
    hideAllDivs();
    showDivs(['top_box', 'game_launcher', 'friendListBody', 'friendListCard', 'pong_button'])
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

export { displayHomePage , displayLoginPage , displayProfilPage, hideDivs, showDivs, error404 }
