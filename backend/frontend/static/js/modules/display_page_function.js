import { check2faStatus } from "./two_fa.js";
import { put_register_form_html } from "./renderDiv/register_form.js"
import {put_login_form_html} from "./renderDiv/login_form.js"
import {put_top_box_form_html} from "./renderDiv/top_box.js"
import {put_game_launcher_form_html} from "./renderDiv/game_laucher.js"
import { put_friend_list_form_html } from "./renderDiv/friend_list.js"
import { put_profil_card_html } from "./renderDiv/profil_card.js"
import { put_match_history_html } from "./renderDiv/match_history.js"
import { closeAllWebSockets } from "./utils.js";
import { isUserLoggedIn } from "../main.js";

var isTopBoxDisplayed = false;
function hideAllDivs() {
    hideDivs(["login_page", "home_page", "profil_page", "error404", "top_box_div"]);
}

function displayLoginPage() {
    // if (isUserLoggedIn()){
    //     console.log("login")
    //     history.pushState({}, '', '/home');
    //     displayHomePage();
    //     return;
    // }
    hideAllDivs();
    showDivs(["login_page"]);
    closeAllWebSockets();
    put_register_form_html();
    put_login_form_html();     
}

function error404() {
    hideAllDivs();
    showDivs(['error404'])
}

async function displayProfilPage() {
    hideDivs(["login_page", "home_page", "profil page", "error404"]);
    put_match_history_html();
    if (!isTopBoxDisplayed){
        put_top_box_form_html();
        isTopBoxDisplayed = true;
    }
    closeAllWebSockets();
    try {
        await put_profil_card_html();
        showDivs(["top_box_div", "profil_page"]);
    }
    catch {
        console.log("error 404")
        error404();
    }
}

function extractPathname() {
    // Get the pathname from the current window location
    const pathname = window.location.pathname;

    // Remove any leading and trailing slashes
    const trimmedPathname = pathname.replace(/^\/|\/$/g, '');

    return `/${trimmedPathname}`;
}

function displayHomePage() {
    if (!isTopBoxDisplayed){
        put_top_box_form_html();
        isTopBoxDisplayed = true;
    }
    console.log("hihi")
    put_game_launcher_form_html();
    put_friend_list_form_html();
    closeAllWebSockets();
    hideDivs(["login_page", "home_page", "profil_page", "error404", "top_box_div"]);
    showDivs(["home_page", "top_box_div"])
}

function hideDivs(divIds) {
    divIds.forEach(function (divId) {
        var targetDiv = document.getElementById(divId);
        if (targetDiv) {
            targetDiv.style.display = 'none';
        }
    });
}
  
function showDiv(div){
    var targetDiv = document.getElementById(div);
    if (targetDiv) {
        targetDiv.style.display = 'block';
    }
}
function showDivs(divIds) {
    console.log(divIds)
    divIds.forEach(function (divId) {
        var targetDiv = document.getElementById(divId);
        if (targetDiv) {
            targetDiv.style.display = 'block';
        }
      });
    }

export { displayHomePage , displayLoginPage , displayProfilPage, error404, hideDivs, showDivs, showDiv }

