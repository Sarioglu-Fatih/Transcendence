import {getCookie, makeApiRequest,  makeApiRequestPost} from './utils.js'
import { check2faStatus } from './two_fa.js';
import { displayHomePage, error404 } from './display_page_function.js';

async function send_TOTP(token, username) {
	try {
		const body = {
			'token': token,
			'username': username
		};
		const response = await makeApiRequestPost("check_totp", body);
		return response
	}
	catch (error) {
		console.error('Error login user:', error);
	}
}

async function login() {

		var username = document.getElementById("login_Username").value;
		var password = document.getElementById("login_Password").value;
		let body = {
			'username': username,
			'password': password
		}
		
		try {
			const response = await makeApiRequestPost("login", body)
			if (response.ok) {
				if (response.status === 222){
					const token = prompt("Enter the code from your authenticator")
					const response_TOPT = await send_TOTP(token, username);
					if (!response_TOPT.ok) {
						alert("Wrong TOTP token.");
						throw new Error("Error in sending TOTP")
					}
				}
				history.pushState({}, '', '/home');
				makeApiRequest('refresh_user_status');
				displayHomePage();
			}
			else {
				if (response.status === 401) {
					// Display error message for wrong input
					alert('Wrong input. Please try again.');
				}
			}
		}
		catch (error) {
			console.error('Error login user:', error);
		}
}

export { login, getCookie}