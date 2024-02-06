import { getCookie } from "./utils.js";

async function enable2fa() {
	try {
		const csrfToken = getCookie('csrftoken');
		const accessToken = localStorage.getItem('jwt_token');
		const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

		// Request a new 2FA setup for the current user
		const response = await fetch(`${baseURL}/api/enable_2fa`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
			'Authorization': `Bearer ${accessToken}`,
		},
		credentials: 'include',
		});
 
		if (response.ok) {
			const data = await response.json();

			// Check if the response contains the secret key for TOTP
			if (data.success) {
				// If 2FA is enabled successfully, generate the OTP URL
				const otpauthUrl = data.otpauth_url;
				displayQRCode(otpauthUrl);
			}
			else {
				console.error('Error enabling 2FA:', data.error);
			}
		}
		else {
			console.error('Error enabling 2FA:', response.status);
		}
	}
	catch (error) {
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

async function disable2fa() {
	try {
		const csrfToken = getCookie('csrftoken');
		const accessToken = localStorage.getItem('jwt_token');
		const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

		const response = await fetch(`${baseURL}/api/disable_2fa`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
			'Authorization': `Bearer ${accessToken}`,
		},
		credentials: 'include',
		});
 
		if (response.ok) {
			const data = await response.json();
			console.log('2FA disabled successfully:', data.message);	
		}
		else {
			console.error('Error disabling 2FA:', response.status);
		}
	}
	catch (error) {
		console.error('Error disabling 2FA:', error);
	}
}

export { enable2fa, disable2fa }