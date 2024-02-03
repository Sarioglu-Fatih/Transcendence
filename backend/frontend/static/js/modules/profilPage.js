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
    let avatarData = null;
  
    // Try to get the avatar data from local storage
    avatarData = JSON.parse(localStorage.getItem('avatar'));
  
    if (!avatarData) {
        // If the avatar data is not in local storage, fetch it from the server
        try {
            const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            const response = await fetch(`${baseURL}/api/avatar`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${jwtToken}`
                }
            })
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
  
    console.log('avatar');
    const encodedAvatar = avatarData.avatar;
    const dataUri = 'data:image/png;base64,' + encodedAvatar;
    avatar.innerHTML = `<img class="avatar-image" src="${dataUri}" alt="default-avatar">`;
  }
  

export { renderProfilPage, displayAvatar};