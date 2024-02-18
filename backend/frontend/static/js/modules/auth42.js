import { makeApiRequest, makeApiRequestPost } from './utils.js'
import { displayLoginPage, displayHomePage } from './display_page_function.js'

async function fetchCode(code, state) {
    const body = {
        code :code,
        state: state,
    };
    try {
        const response = await makeApiRequestPost('auth42', body);
        if (response.ok) {
            history.pushState({}, '', '/home');
            makeApiRequest('refresh_user_status');
            displayHomePage();
            return true;
        }
        else {
            console.error('Error login user:', response.status);
            return false;
        }
    }
    catch (error) {
        console.error('Error login user:', error);
        return false;
    }
}

async function checkAuth42() {
    var urlSearch = window.location.search;
    var urlSearchParams = new URLSearchParams(urlSearch);
    var urlPathname = window.location.pathname;
    var totalPath = urlPathname + urlSearch;
    // Vérifie si l'URL contient "/home"
    if (!totalPath.match(/^\/home/)) {
        return true;
    }
    // Vérifie si la partie parser.search ne commence pas par "error"
    if (!urlSearch.startsWith("?code")) {
        if (urlSearch.startsWith("?error"))
            return false;
        else{
            return true;
        }
    }
    var codeValue = urlSearchParams.get("code");
    var stateValue = urlSearchParams.get("state");
    var state = localStorage.getItem('state');
    if (state === null || (urlSearchParams.size !== 2 && stateValue !== state))
    {
        console.error("State value not corresponding.");
        return false;
    }
    var ret = await fetchCode(codeValue, stateValue);
    localStorage.removeItem('state');
    return ret;
}

async function auth42(){
    if ((await checkAuth42()) === false) {
        history.pushState({}, '', '/login');
        displayLoginPage();
        alert('42 authentification failed !');
    }
}

export { auth42 };
