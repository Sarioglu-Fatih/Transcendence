import { getCookie } from './utils.js'

async function changeLocation() {
    window.location = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-b25d192aa1c27b77cd86bfce4016950bc897fa49c2b81823d2070c3fac4fbe5f&redirect_uri=https%3A%2F%2Flocalhost%3A8000%2Fhome&response_type=code';
}

async function currentLocation() {
    var actualLocation = window.location;
    console.log("actualLogin :", actualLocation);
}

async function authUser() {
    console.log("authUser");

    await changeLocation();

    var actualLocation = window.location;
    console.log("actualLogin :",actualLocation);
    // try {
    //     const csrfToken = getCookie('csrftoken');
    //     console.log('CSRF Token in cookie REGISTER:', csrfToken);
    //     const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
    //     const response = await fetch(`${baseURL}/api/register`, { // where we send data
    //         method: 'POST', // post = sending data
    //         headers: {
    //             'Content-Type': 'application/json', //data type we send
    //             'X-CSRFToken': csrfToken, // cookie for django
    //         },
    //         body: JSON.stringify(body), // the data we send
    //         credentials: 'include',
    //     })
    //     if (response.ok) {
    //         console.log('User registered successfully', response);
    //     }
    //     else {
    //         console.error('Failed to register user:', response.statusText);
    //     }
    // }
    // catch (error) {
    //     console.error('Error registering user:', error);
    // }
}

export { authUser, currentLocation };