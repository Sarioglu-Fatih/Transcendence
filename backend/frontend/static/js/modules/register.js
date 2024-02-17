import { getCookie, makeApiRequestPost, makeApiRequestPatch} from './utils.js'

async function registerUser() {
	var username = document.getElementById("inputUsername").value; // Get info from the register form
	var email = document.getElementById("inputEmail").value;
	var password = document.getElementById("inputPassword").value;
    let body = {
        'username': username,
        'email': email,
        'password': password,
        'pseudo': ""
    }

    const response = await makeApiRequestPost("register", body)
    if (response.ok) {
        console.log('User registered successfully', response);
    }
    else {
        console.error('Failed to register user:', response.statusText);
    }
}

async function updateUser() {
    var username = document.getElementById("updateUsername").value; // Get info from the register form
    var pseudo = document.getElementById("updatePseudo").value;
    var email = document.getElementById("updateEmail").value;
    var password = document.getElementById("updatePassword").value;
    let body = {
        'username': username,
        'email': email,
        'password': password,
        'pseudo': pseudo
    }

    try {
        const response = await  makeApiRequestPatch('update/', body)
        if (response.ok) {
            console.log('Update ok', response);
        }
        else {
            console.error('Failed to register user:', response.statusText);
            return "error";
        }
    }
    catch (error) {
        console.error('Error registering user:', error);
    }
}

export { registerUser, updateUser } 

