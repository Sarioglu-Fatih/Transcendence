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
    console.log("Les infos du form:", body);
    
    try {
      const response = await makeApiRequestPost("login", body)
      if (response.ok) {
        if (response.status === 222){
          const token = prompt("enter code biatch")
          console.log(token);
          const response_TOPT = await send_TOTP(token, username);
          if (!response_TOPT.ok){
            throw new Error("Error in sending TOTP")
          }
        }
        history.pushState({}, '', '/home');
        displayHomePage();
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