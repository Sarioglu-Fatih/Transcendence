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

export { fetchCsrfToken, getCookie}