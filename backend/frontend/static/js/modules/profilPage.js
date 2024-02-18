import { makeApiRequest, getCookie } from "./utils.js";
import { renderProfilPage } from "./renderDiv/profil_card.js"

const top_box_div = document.getElementById('top_box_div');


export async function isFriend(user) {
    try {
        const response = await makeApiRequest(user)
        if (response.status == 400) {
            return false;
        }
        else if (response.status == 404) {
            throw new Error('Erreur lors de la récupération des données');
        }
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }
        // const data = await response.json();
        return true
    } catch (error) {
        throw new Error("404 Not found");
    }
}

function updateAvatarImage(dataUri) {
    const avatarImage = document.getElementById('avatar-image');
    if (avatarImage) {
        avatarImage.src = '';  // Clear the current source
        avatarImage.src = dataUri;  // Set the new source
        avatarImage.alt = 'user-avatar';
    }
}

async function displayAvatar() {
    try {
        const response = await makeApiRequest("avatar");
        const avatarData = await response.json();
        if (avatarData.avatar) {
            const dataUri = 'data:image/jpeg;base64,' + avatarData.avatar;
            updateAvatarImage(dataUri);
        }
    } catch (error) {
        console.error('Avatar fetch failed:', error);
        updateAvatarImage(defaultAvatarDataUri);
    }
}


async function handleAvatarUpload() {
	const form = document.getElementById('avatar_upload_form');
	const formData = new FormData(form);
	const body = formData;
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
		  await displayAvatar();
	  }
    else {
		  console.error('Avatar upload failed');
      alert('Avatar upload failed.')
	  }
	}
  catch (error) {
	  console.error('Avatar upload failed:', error);
	}
}

export { renderProfilPage, displayAvatar, handleAvatarUpload};
