import { displayAvatar } from './profilPage.js';
import { getCookie } from './login.js';

async function handleAvatarUpload() {
	const form = document.getElementById('avatar_upload_form');
	const formData = new FormData(form);
	const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
  
	// Get CSRF token from the cookie dynamically
	const csrfToken = getCookie('csrftoken');
  
	try {
	  const response = await fetch(`${baseURL}/api/upload_avatar/`, {
		method: 'POST',
		headers: {
		  'X-CSRFToken': csrfToken,
		},
		body: formData,
	  });
  
	  if (response.ok) {
		// Optionally, update the displayed avatar immediately
		await displayAvatar();
		// Provide feedback to the user if needed
	  } else {
		console.error('Avatar upload failed');
	  }
	} catch (error) {
	  console.error('Avatar upload failed:', error);
	}
}

export {handleAvatarUpload}