const registerBtn = document.getElementById('register_button')

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

async function registerUser() {
    var csrftoken = getCookie('csrftoken');
    console.log(csrftoken);

	var username = document.getElementById("register_form")[0].value; // Get info from the register form
	var email = document.getElementById("register_form")[1].value;
	var password = document.getElementById("register_form")[2].value;
	var userData = [username, email, password];
	console.log("Les infos du form:", userData);

    try {
        const response = await fetch(`http://localhost:8000/api/register`, { // where we send data
            method: 'POST', // post = sending data
            headers: {
                'Content-Type': 'application/json', //data type we send
                'X-CSRFToken': csrftoken // cookie for django
            },
            body: JSON.stringify(userData), //the data we send
        })

        if (response.ok) {
            const data = await response.json();
            console.log('User registered successfully:', data);
        }
        else {
            console.error('Failed to register user:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error registering user:', error);
    }
}

export { getCookie, registerUser, registerBtn } 

