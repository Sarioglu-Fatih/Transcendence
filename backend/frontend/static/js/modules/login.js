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
		
		console.log("UEHFWEF");
		if (response.ok) {
			const data = await response.json();
			// Check if the user has 2FA enabled
			if (data.status === 'success' && data.requires_2fa) {
				// If 2FA is required, initiate the 2FA setup
				await enable2FA();
				console.log("LA 2FA login.js", data.requires_2fa);
				console.log('2FA setup initiated.');
			}

			if (data.token && data.refresh_token) {
				const token = data.token;
				const refreshToken = data.refresh_token;
				localStorage.setItem('jwt_token', token);
				localStorage.setItem('refresh_token', refreshToken);
				console.log('Login successful. Token:', token);
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


async function enable2FA() {
	try {
	  const csrfToken = getCookie('csrftoken');
	  const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
  
	  // Prompt the user to enter the TOTP token
	  const totpToken = prompt('Enter the TOTP token:');
	  if (!totpToken) {
		// Handle the case where the user cancels the prompt
		console.error('TOTP token not provided.');
		return;
	  }
  
	  // Request a new 2FA setup for the current user
	  const response = await fetch(`${baseURL}/api/enable_2fa`, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		  'X-CSRFToken': csrfToken,
		},
		credentials: 'include',
		body: JSON.stringify({
		  totp_token: totpToken, // Include the TOTP token in the request
		}),
	  });
  
	  if (response.ok) {
		const data = await response.json();
  
		// Check if the response contains the secret key for TOTP
		if (data.secret_key) {
		  const secretKey = data.secret_key;
  
		  // Generate a URL for the QR code
		  const otpauthUrl = notp.totp.genOTPAuthURL({
			secret: secretKey,
			label: 'YourApp', // Set your application name
			issuer: 'YourApp', // Set your issuer name
		  });
  
		  // Display the QR code on the frontend
		  const qrCodeContainer = document.getElementById('qrcode'); // Replace with your container ID
		  displayQRCode(otpauthUrl, qrCodeContainer);
		}
	  } else {
		console.error('Error enabling 2FA:', response.status);
	  }
	} catch (error) {
	  console.error('Error enabling 2FA:', error);
	}
  }

function displayQRCode(otpauthUrl) {
	const qrCodeContainer = document.getElementById('qrcode'); // Replace with your container ID

	// Construct the data URI for the QR code image
	const dataUri = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(otpauthUrl)}`;

	// Create an <img> element
	const imgElement = document.createElement('img');
	imgElement.src = dataUri;

	// Append the <img> element to the container
	qrCodeContainer.innerHTML = '';
	qrCodeContainer.appendChild(imgElement);

	console.log('QR code generated successfully.');
}

export { login, getCookie}