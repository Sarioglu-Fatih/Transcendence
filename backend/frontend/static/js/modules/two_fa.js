import { makeApiRequestPost, makeApiRequest} from "./utils.js";

async function enable2fa() {
	try {
		// Check if the user already has a TOTP token
		const totpEnabledResponse = await makeApiRequest('get_2fa_status');
		if (totpEnabledResponse.ok) {
			const totpEnabledData = await totpEnabledResponse.json();
			if (totpEnabledData.two_factor_enabled) {
				console.log('2FA already enabled for the user.');
				return; // Exit function if 2FA is already enabled
			}
		}
		else {
			console.error('Error checking 2FA status:', totpEnabledResponse.status);
			return;
		}
		// If 2FA is not enabled, proceed to enable it
		const body = {
		}
		const enable2faResponse = await makeApiRequestPost('enable_2fa', body);
		if (enable2faResponse.ok) {
			const data = await enable2faResponse.json();
			if (data.two_factor_confirmation) {
				// Prompt the user to enter the TOTP token
				const qrcode = data.qrcode;
				displayQRCode(qrcode);
				await new Promise(resolve => setTimeout(resolve, 500));
				const token = prompt('Please enter the TOTP token to activate 2FA:');
				if (token) {
					await enable2faWithTOTP(token);
				}
				else {
					console.error('Error enabling 2FA: TOTP token not provided');
				}
			}
			else {
				console.error('Error enabling 2FA:', data.error);
			}
		}
		else {
			console.error('Error enabling 2FA:', enable2faResponse.status);
		}
	}
	catch (error) {
		console.error('Error enabling 2FA:', error);
	}
}

async function enable2faWithTOTP(token) {
	try {
		const response = await makeApiRequestPost('enable_2fa', { token });
		if (response.ok) {
			const data = await response.json();
			if (data.success) {
				// 2FA enabled successfully
				console.log('2FA enabled successfully');
				alert("2FA enabled successfully");
			}
			else {
				console.error('Error enabling 2FA:', data.error);
			}
		}
		else {
			await disable2fa();
			await check2faStatus();
			console.error('Invalid TOTP token', response.status);
			alert("Invalid TOTP token, 2FA disable");
		}
	}
	catch (error)
	{
		console.error('Error enabling 2FA:', error);
	}
}

function displayQRCode(otpauthUrl) {
	const qrCodeContainer = document.getElementById('qrcode');
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
		const response = await makeApiRequest('get_2fa_status');
		if (response.ok) {
			const data = await response.json();
			if (data.two_factor_enabled) {
				switchbox2FA.checked = true
				const qrcode = data.qrcode;
				displayQRCode(qrcode);
			}
			else {
				switchbox2FA.checked = false
			}
			return switchbox2FA;
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