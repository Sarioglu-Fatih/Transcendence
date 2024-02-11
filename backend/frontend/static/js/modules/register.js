import { getCookie, makeApiRequestPost} from './utils.js'

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
    
    const response = await makeApiRequestPost("register", body)
    if (response.ok) {
        console.log('User registered successfully', response);
    }
    else {
        console.error('Failed to register user:', response.statusText);
    }
}

async function updateUser() {
    console.log("update_user")
    var username = document.getElementById("updateUsername").value; // Get info from the register form
    var email = document.getElementById("updateEmail").value;
    var password = document.getElementById("updatePassword").value;
    let body = {
        'username': username,
        'email': email,
        'password': password
    }
    console.log(body);

    try {
        const csrfToken = getCookie('csrftoken');
        const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
        const response = await fetch(`${baseURL}/api/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
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

