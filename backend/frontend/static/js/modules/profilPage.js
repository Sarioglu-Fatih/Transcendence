import { makeApiRequest } from "./utils.js";

const profilPage = document.getElementById('profil_page');
const avatar = document.getElementById('avatar');



async function renderProfilPage() {
    try {
        const currentPath = window.location.pathname.substring(1) ;
        console.log(currentPath)
        const response = await makeApiRequest(currentPath)
        const userData = await response.json()

        var username_type = document.getElementById('username_key');
        var pseudo_type = document.getElementById('pseudo_key');
        var email_type = document.getElementById('email_key');
        var win_type = document.getElementById('win_key');
        var lose_type = document.getElementById('lose_key');
        var resulte_type = document.getElementById('win_lose_key');

        let win_string = userData.win.toString();
        let lose_string = userData.lose.toString();

        
        username_type.textContent = "username : ";
        username_type.textContent += userData.username;

        pseudo_type.textContent = "pseudo   : ";
        pseudo_type.textContent += userData.pseudo;

        if (userData.email){
            email_type.textContent = "email     : ";
            email_type.textContent += userData.email;
        }
        else 
            email_type.textContent = "";

        resulte_type.textContent = "win  ";
        resulte_type.textContent += win_string;
        resulte_type.textContent += " : ";
        resulte_type.textContent += lose_string;
        resulte_type.textContent += "  lose";
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