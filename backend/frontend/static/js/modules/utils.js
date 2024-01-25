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

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export { fetchCsrfToken, getCookie}