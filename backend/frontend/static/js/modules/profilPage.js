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

    try {
        const response = await makeApiRequest("avatar");
        const avatarData = await response.json();

        if (avatarData.avatar) {
            const dataUri = 'data:image/jpeg;base64,' + avatarData.avatar;
            updateAvatarImage(dataUri);
        }
    } catch (error) {
        console.error('Avatar fetch failed:', error);
        // Handle error (e.g., display a default avatar or show an error message)
        updateAvatarImage(defaultAvatarDataUri);
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
export { renderProfilPage, displayAvatar};