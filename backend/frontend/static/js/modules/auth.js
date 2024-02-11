import { makeApiRequestPost } from './utils.js'
import { displayLoginPage, displayHomePage } from './display_page_function.js'

async function fetchCode(code, state) {
    const body = {
        code :code,
        state: state,
    };
    try {
        const response = await makeApiRequestPost('auth42', body);
        if (response.ok) {
            displayHomePage();
        }
        else {
            console.error('Error login user:', response.status);
            displayLoginPage();
        }
    }
    catch (error) {
        console.error('Error login user:', error);
        displayLoginPage();
    }
}

async function checkAuth42() {
    var urlSearch = window.location.search;
    var urlSearchParams = new URLSearchParams(urlSearch);
    var urlPathname = window.location.pathname;
    var totalPath = urlPathname + urlSearch;

    // Vérifie si l'URL contient "/home"
    if (!totalPath.match(/^\/home/)) {
        return;
    }
    // Vérifie si la partie parser.search ne commence pas par "error"
    if (!urlSearch.startsWith("?code")) {
        return;
    }
    var codeValue = urlSearchParams.get("code");
    var stateValue = urlSearchParams.get("state");
    var state = localStorage.getItem('state');
    if (state === null || (urlSearchParams.size !== 2 && stateValue !== state))
    {
        console.error("State value not corresponding.");
        displayLoginPage();
        return;
    }
    await fetchCode(codeValue, stateValue);
    localStorage.removeItem('state');
}

export { checkAuth42 };
