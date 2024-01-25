import {fetchCsrfToken, getCookie} from './utils.js'

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
      // Perform login
      const response = await fetch('http://localhost:8000/api/login', {
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
        if (data.token === undefined){ 
          console.log(data);
          return;
        }
        const token = data.token;
        localStorage.setItem('jwt_token', token);
        console.log('Login successful. Token:', token);
      }
      else {
        console.error('Error login user:', response.status);
      }
    }
    catch (error) {
      console.error('Error login user:', error);
    }
}

export { login, fetchCsrfToken, getCookie}