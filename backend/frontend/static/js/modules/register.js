import { getCookie} from './utils.js'

async function registerUser() {
	var username = document.getElementById("inputUsername").value; // Get info from the register form
	var email = document.getElementById("inputEmail").value;
	var password = document.getElementById("inputPassword").value;
    let body = {
        'username': username,
        'email': email,
        'password': password
    }
	console.log("Les infos du form:", body);

    try {
        const csrfToken = getCookie('csrftoken');
        console.log('CSRF Token in cookie REGISTER:', csrfToken);
        const BASE_URL = 'http://localhost:8000'
        let endpoint = '/api/register';
        const response = await fetch(BASE_URL + endpoint, { // where we send data
            method: 'POST', // post = sending data
            headers: {
                'Content-Type': 'application/json', //data type we send
                'X-CSRFToken': csrfToken, // cookie for django
            },
            body: JSON.stringify(body), // the data we send
            credentials: 'include',
        })
        if (response.ok) {
            console.log('User registered successfully', response);
        }
        else {
            console.error('Failed to register user:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error registering user:', error);
    }
}

export { registerUser } 

