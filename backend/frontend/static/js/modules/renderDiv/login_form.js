import {login} from "../login.js"
import {displayHomePage} from "../display_page_function.js"
import { checkAuth42 } from "../auth.js";

// await checkAuth42();

async function put_login_form_html() {
    // await checkAuth42();
    var login_div = document.getElementById("login");
    login_div.innerHTML = `  
    <form id="login_form" class="login_form">
        <div class="card">
        <div class="card-body">
            <label for="inputUsername" class="form-label">Username</label>
            <input type="text" class="form-control" id="login_Username" placeholder="Username" maxlength="16" required/>
            <span id="loginUsernameError" class="error-message"></span>

            <label for="inputPassword" class="form-label">Password</label>
            <input type="password" class="form-control"  id="login_Password" placeholder="Password" maxlength="16" required/>
        </div>
        <div class="card-footer text-center">
            <button class="btn btn-primary" id="login_button">login</button>
        </div>
        </div>
    </form>
    <div class="card">
        <input class="authButton" id="authButton" type="button" value="42" />
    </div>
    `;

    const loginForm = document.getElementById('login_form');
    loginForm.addEventListener('submit', async function (event) {
    	event.preventDefault();

    	var inputUsername = document.getElementById('login_Username');   // username login parsing
    	var userName = inputUsername.value;
    	var username_regex = /^[a-zA-Z0-9-_]+$/;

    	console.log(inputUsername.value);
    	if (username_regex.test(userName))
    	{
    		document.getElementById('loginUsernameError').innerHTML = '';
    		await login();
            
    		displayHomePage();
    		document.getElementById('login_form').reset();
    	}
    	else
    	{
    		loginUsernameError.textContent = "Please enter letters, numbers, '-' or '_'."
    		console.log("Username not valide");
    	}
    });

    
    const authButton = document.getElementById('authButton');
    authButton.addEventListener('click', () => {
        function generateRandomState() {
            var array = new Uint8Array(16);
            window.crypto.getRandomValues(array);
            return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
        }
        
        var state = generateRandomState();

        var baseUrl = 'https://api.intra.42.fr/oauth/authorize?';
        var client_id = '&client_id=' + 'u-s4t2ud-e95dac742f419c01abf9f266b8219d8be7c13613ebcc4b3a64edc9e84beac84c';
        var redirect_uri = '&redirect_uri=https%3A%2F%2Flocalhost%3A8000%2Fhome';
        var response_type = '&response_type=code';
        var random_state = '&state=' + state;
        var scope = '&scope=public';
        var fullUrl = baseUrl + client_id + redirect_uri + response_type + scope + random_state;

        window.location = fullUrl;
    });
}
export {put_login_form_html}