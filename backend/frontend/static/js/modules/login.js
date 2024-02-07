import {getCookie, makeApiRequest,  makeApiRequestPost} from './utils.js'
import { check2faStatus } from './two_fa.js';

async function send_TOTP(token, username) {
  try {
    const body = {
      'token': token,
      'username': username
    };
    const response = await makeApiRequestPost("check_totp", body);
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
        if (response.status === 222){
          const token = prompt("enter code biatch")
          console.log(token);
          await send_TOTP(token, username);
          displayLoginPage();
        }
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