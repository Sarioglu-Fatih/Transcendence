import { makeApiRequest } from "./utils.js";

const profilPage = document.getElementById('profil_page');
const avatar = document.getElementById('avatar');

async function renderProfilPage() {
    try {
        const response = await makeApiRequest("profil")
        const userData = await response.json()
        profilPage.innerHTML = `
            <h2>username = ${userData.username}</h2>
    `;
    }
    catch (err) {
        profilPage.innerHTML = '<p class="error-msg">There was an error loading the user</p>';
    }
}

async function displayAvatar() {
    const jwtToken = localStorage.getItem('jwt_token');
    let avatarData = null;

    // Try to get the avatar data from local storage
    avatarData = JSON.parse(localStorage.getItem('avatar'));

    if (!avatarData) {
        // If the avatar data is not in local storage, fetch it from the server
        try {
            const response = await makeApiRequest("avatar");
            avatarData = await response.json();
            const encodedAvatar = avatarData.avatar;
            const dataUri = 'data:image/jpeg;base64,' + encodedAvatar;

            // Store the avatar data in local storage
            localStorage.setItem('avatar', JSON.stringify(avatarData));
        } catch (err) {
            // Handle error
            console.error('Error loading avatar:', err);
            // Display default avatar or handle the error in your preferred way
            return;
        }
    }

    // Check if avatarData is defined and contains the 'avatar' property
    if (avatarData && avatarData.avatar) {
        const encodedAvatar = avatarData.avatar;
        const dataUri = 'data:image/png;base64,' + encodedAvatar;

        // Set the inner HTML of the avatar element
        const avatarImage = document.getElementById('avatar-image');
        if (avatarImage) {
            avatarImage.src = dataUri;
            avatarImage.alt = 'user-avatar';
        }
    } else {
        console.error('Invalid avatar data received:', avatarData);
        // Display default avatar or handle the error in your preferred way
    }
}


export { renderProfilPage, displayAvatar};