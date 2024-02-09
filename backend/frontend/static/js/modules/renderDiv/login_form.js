import {login} from "../login.js"
import {displayHomePage} from "../display_page_function.js"

function put_login_form_html() {
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
    })
}
export {put_login_form_html}