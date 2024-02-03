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
        const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        const response = await fetch(`${baseURL}/api/register`, { // where we send data
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

async function updateUser() {
    var username = document.getElementById("updateUsername").value; // Get info from the register form
    var email = document.getElementById("updateEmail").value;
    var password = document.getElementById("updatePassword").value;
    let body = {
        'username': username,
        'email': email,
        'password': password
    }

    try {
        const csrfToken = getCookie('csrftoken');
        const jwtToken = localStorage.getItem('jwt_token');
        const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        const response = await fetch(`${baseURL}/api/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(body), // the data we send
            credentials: 'include',
        })
        if (response.ok) {
            console.log('Update ok', response);
        }
        else {
            console.error('Failed to register user:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error registering user:', error);
    }
}

export { registerUser, updateUser } 

