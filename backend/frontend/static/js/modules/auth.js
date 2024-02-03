import { getCookie } from './utils.js'

async function changeLocation() {
    window.location = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-b25d192aa1c27b77cd86bfce4016950bc897fa49c2b81823d2070c3fac4fbe5f&redirect_uri=https%3A%2F%2Flocalhost%3A8000%2Fhome&response_type=code';
}

async function authUser() {
    console.log("authUser");
    await changeLocation();
}

async function fetchCode(code) {
    try {
        const csrfToken = getCookie('csrftoken');
        const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        const response = await fetch(`${baseURL}/api/auth42`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ code: code }),
            credentials: 'include',
        })
        if (response.ok) {
            const data = await response.json();
            if (data.token && data.refresh_token) {
                const token = data.token;
                const refreshToken = data.refresh_token;
                localStorage.setItem('jwt_token', token);
                localStorage.setItem('refresh_token', refreshToken);
                console.log('Login successful. Token:', token);
            }
        }
        else {
            console.error('Error login user:', response.status);
        }
    }
    catch (error) {
        console.error('Error login user:', error);
    }
}

async function checkAuth42() {
    var url = window.location;
    var urlSearch = window.location.search;
    var urlPathname = window.location.pathname;
    console.log('url', url);
    console.log('urlPathname', urlPathname);
    console.log('urlSearch', urlSearch);
    var totalPath = urlPathname + urlSearch;
    console.log('totalPath', totalPath);

    // Vérifie si l'URL contient "/home"
    if (!totalPath.match(/^\/home/)) {
        console.log("L'URL n'est pas valide.");
        return;
    }

    // Vérifie si la partie parser.search commence par "error"
    if (!urlSearch.startsWith("?code")) {
        console.log("La recherche commence par 'error', donc la fonction retourne sans faire quoi.");
        return;
    }
    else
        console.log("On a un code");
    // on a un ?code=123456...
    var queryParams = urlSearch.split('=');
    var codeValue = queryParams[1];

    await fetchCode(codeValue);
    console.log(totalPath);
}

export { authUser, checkAuth42 };