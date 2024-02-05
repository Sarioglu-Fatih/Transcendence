async function enable2fa() {
	try {
	  const csrfToken = getCookie('csrftoken');
	  const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
  
	  // Request a new 2FA setup for the current user
	  const response = await fetch(`${baseURL}/api/enable2fa`, {
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
			label: 'bliz', // Set your application name
			issuer: 'bloux', // Set your issuer name
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

export {enable2fa}