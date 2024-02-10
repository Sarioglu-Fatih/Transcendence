import { check2faStatus } from "./two_fa.js";
import { put_register_form_html } from "./renderDiv/register_form.js"
import {put_login_form_html} from "./renderDiv/login_form.js"
import {put_top_box_form_html} from "./renderDiv/top_box.js"
import {put_game_launcher_form_html} from "./renderDiv/game_laucher.js"
import { put_friend_list_form_html } from "./renderDiv/friend_list.js"
import { put_profil_card_html } from "./renderDiv/profil_card.js"
import { put_match_history_html } from "./renderDiv/match_history.js"


function hideAllDivs() {
    hideDivs(["login_page", "home_page", "profil_page"]);
}

function displayLoginPage() {
    hideAllDivs();
    showDivs(["login_page"]);
    put_register_form_html();
    put_login_form_html();     
}

function error404() {
    hideAllDivs();
    showDivs(['error404'])
}

async function displayProfilPage(path) {
    history.pushState({}, '', path);
    hideAllDivs();
    put_match_history_html();
    put_top_box_form_html();
    await put_profil_card_html();
    showDivs(["top_box_div", "profil_page"]);


    // try {
    //     let isHimself = await renderProfilPage();
    //     if (isHimself == true) {
    //         showDivs(['top_box', "profil_page", "profilLeftSide", "profilRightSide", "history"]);
    //     }
    //     else {
    //         const currentPath = window.location.pathname.substring(1);
    //         const userToAddName = currentPath.replace(/^profil/, 'isFriend');
    //         const isFriends = await isFriend(userToAddName);
    //         console.log(isFriends);
    //         if (isFriends)
    //             showDivs(['top_box', "profil_page", "profilLeftSide", "history"])
    //         else
    //             showDivs(['top_box', "profil_page", "profilLeftSide", "addFriend_button", "history"])
    //     }
    // }
    // catch (error) {
    //     if (error.status === 400) {
    //         showDivs(['top_box', "profil_page", "profilLeftSide", "addFriend_button", "history"]) 
    //     }
    //     else {
    //         error404();
    //     }
    // }
}

function displayHomePage() {
    history.pushState({}, '', '/home');
    hideAllDivs();
    put_top_box_form_html();
    put_game_launcher_form_html();
    put_friend_list_form_html();
    showDivs(["top_box_div", "home_page"])
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

export { displayHomePage , displayLoginPage , displayProfilPage, error404, hideDivs, showDivs }

