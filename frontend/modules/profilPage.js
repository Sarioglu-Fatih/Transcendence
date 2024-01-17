const profilPage = document.getElementById('profil_page');
const avatar = document.getElementById('avatar');

async function displayProfilPage() {

    const jwtToken = localStorage.getItem('jwt_token');
    console.log(jwtToken);
    try {
        const response = await fetch(`http://localhost:8000/api/profil`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
        })
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
            const response = await fetch(`http://localhost:8000/api/avatar`, {
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
  
    const encodedAvatar = avatarData.avatar;
    const dataUri = 'data:image/png;base64,' + encodedAvatar;
    console.log('avatar');
    avatar.innerHTML = `<img class="avatar-image" src="${dataUri}" alt="default-avatar">`;
  }
  

export { displayProfilPage, displayAvatar};