import { makeApiRequestPost } from "./utils.js";

async function enable2fa() {
	try {
		const response = await makeApiRequestPost('enable_2fa');
		if (response.ok) {
			const data = await response.json();

			if (data.success) {
				// Generate the OTP URL
				const qrcode = data.qrcode;
				console.log("enable 2fa: ", data.qrcode)
				displayQRCode(qrcode);
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
	console.log(otpauthUrl)
	// Construct the data URI for the QR code image
	const dataUri = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(otpauthUrl)}`;

	// Create the qr code
	const imgElement = document.createElement('img');
	imgElement.src = dataUri;
	qrCodeContainer.innerHTML = '';
	qrCodeContainer.appendChild(imgElement);

	console.log('QR code generated successfully.');
}

async function disable2fa() {
	try {
		const response = await makeApiRequestPost('disable_2fa');
		if (response.ok) {
			const data = await response.json();
			const qrCodeContainer = document.getElementById('qrcode');
			qrCodeContainer.innerHTML = '';
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

async function check2faStatus() {
    try {
		const switchbox2FA = document.getElementById('switchbox2FA');
		const response = makeApiRequest('get_2fa_status');
        if (response.ok) {
            const data = await response.json();
            if (data.two_factor_enabled) {
                switchbox2FA.checked = true
				const qrcode = data.qrcode;
				console.log("check 2fa: ", qrcode)
				displayQRCode(qrcode);
            }
			else {
                switchbox2FA.checked = false
            }
        }
		else {
            console.error('Error checking 2FA status:', response.status);
        }
    }
	catch (error) {
        console.error('Error checking 2FA status:', error);
    }
}

export { enable2fa, disable2fa, check2faStatus }