import { logout } from './logout.js'

function hideDivs(divIds) {
divIds.forEach(function (divId) {
	var targetDiv = document.getElementById(divId);
	if (targetDiv) {
		targetDiv.style.display = 'none';
	}
});
}

function showDivs(divIds) {
divIds.forEach(function (divId) {
	var targetDiv = document.getElementById(divId);
	if (targetDiv) {
		targetDiv.style.display = 'block';
	}
	});
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

async function makeApiRequest(endpoint) {
	try {
		const accessToken = localStorage.getItem('jwt_token');
		const response = await fetch(`https://localhost:8000/api/${endpoint}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${accessToken}`,
			},
		});
		if (response.status === 401) {
			// Token expired, use refresh token to get a new access token
			await handleTokenExpiration();
			// Retry the original request
			return makeApiRequest(endpoint);
		}
		console.log(accessToken);
		return response
	}
	catch {
		return console.error('Error refresh token:', error);
	}
}

async function makeApiRequestPost(endpoint, body) {
	try {
		const accessToken = localStorage.getItem('jwt_token');
        const csrfToken = getCookie('csrftoken');
        console.log('CSRF Token in cookie REGISTER:', csrfToken);
        const response = await fetch(`https://localhost:8000/api/${endpoint}`, { // where we send data
            method: 'POST', // post = sending data
            headers: {
                'Content-Type': 'application/json', //data type we send
                'X-CSRFToken': csrfToken, // cookie for django
				'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(body), // the data we send
            credentials: 'include',
        })
        return response;
    }
    catch (error) {
        console.error('Error registering user:', error);
    }
}

async function handleTokenExpiration() {
	const refreshToken = localStorage.getItem('refresh_token');
	const response = await fetch('https://localhost:8000/api/token/refresh/', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ refresh: refreshToken }),
	});

	try {
		if (response.ok) {
			const data = await response.json();
			const newAccessToken = data.access;
			localStorage.setItem('jwt_token', newAccessToken);
		}
		else {
			// Check if the response contains an error message
			const errorData = await response.json();
			const errorMessage = errorData.detail || 'Token refresh failed';
			console.error(`Error refreshing token: ${errorMessage}`);
			logout(); // Handle refresh token failure
		}
	}
	catch (error) {
		console.error('Error handling token expiration:', error);
		logout(); // Handle refresh token failure
	}
}

export { getCookie, makeApiRequest, showDivs, hideDivs, makeApiRequestPost}