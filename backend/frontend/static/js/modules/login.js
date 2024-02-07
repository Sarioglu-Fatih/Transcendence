import {getCookie} from './utils.js'

async function login() {

    var username = document.getElementById("login_Username").value;
    var password = document.getElementById("login_Password").value;
    let body = {
      'username': username,
      'password': password
    }
    console.log("Les infos du form:", body);
    
    try {
      const csrfToken = getCookie('csrftoken');
      const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
      // Perform login
      const response = await fetch(`${baseURL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(body),
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json();
        console.log(data.headers)
      }
      else {
        console.error('Error login user:', response.status);
      }
    }
    catch (error) {
      console.error('Error login user:', error);
    }
}

export { login, getCookie}