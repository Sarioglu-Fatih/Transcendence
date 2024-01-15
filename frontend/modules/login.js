async function fetchCsrfToken() {
    try {
        const response = await fetch('http://localhost:8000/api/get_csrf_token/', {
            method: 'GET',
            credentials: 'include',  // Include credentials in the request
        });
  
        if (response.ok) {
            const data = await response.json();
            const csrfToken = data.csrf_token;
                  
            // Set the CSRF token in the document's cookies
            document.cookie = `csrftoken=${csrfToken}; path=/; SameSite=None; Secure`;
            
            console.log('CSRF Token:', csrfToken);
        } else {
            console.error('Failed to fetch CSRF token:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
    }
}

function getCookie(cookieName) {
    const cookies = document.cookie.split('; ');
    
    for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === cookieName) {
            return decodeURIComponent(value);
        }
    }
    
    return null; // Return null if the cookie is not found
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
      // Fetch CSRF token
      await fetchCsrfToken();
      const csrfToken = getCookie('csrftoken');
      console.log('CSRF Token 2:', csrfToken);
  
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

export { login, }