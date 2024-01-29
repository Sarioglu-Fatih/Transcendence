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
            const response = await makeApiRequest("avatar")er
            avatarData = await response.json()
            const encodedAvatar = avatarData.avatar;
            const dataUri = 'data:image/png;base64,' + encodedAvatar;
  
            // Store the avatar data in local storage
            localStorage.setItem('avatar', JSON.stringify(avatarData));
  
        }
        catch (err) {
            profilPage.innerHTML = '<p class="error-msg">There was an error loading the avatar</p>';
        }
    }
  
    const encodedAvatar = avatarData.avatar;
    const dataUri = 'data:image/png;base64,' + encodedAvatar;
    console.log('avatar');
    avatar.innerHTML = `<img class="avatar-image" src="${dataUri}" alt="default-avatar">`;
  }
  

export { renderProfilPage, displayAvatar};