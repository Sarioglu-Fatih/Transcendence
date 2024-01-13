const profilBtn = document.getElementById('profil_button');
const profilPage = document.getElementById('profil_page');
const avatar = document.getElementById('avatar');

async function displayProfilPage() {
    try {
        const response = await fetch(`http://localhost:8000/api/user`)
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
    try {
        const response = await fetch(`http://localhost:8000/api/avatar`)
        const avatarData = await response.json()
        const encodedAvatar = avatarData.avatar;
        const dataUri = 'data:image/png;base64,' + encodedAvatar;
        avatar.innerHTML = `<img class="avatar-image" src="${dataUri}" alt="default-avatar">`;
    }
    catch (err) {
        profilPage.innerHTML = '<p class="error-msg">There was an error loading the avatar</p>';
    }
}
export { displayProfilPage, profilBtn, profilPage, displayAvatar};