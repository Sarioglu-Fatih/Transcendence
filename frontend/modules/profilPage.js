const profilBtn = document.getElementById('profil_button');
const profilPage = document.getElementById('profil_page');
const avatar = document.getElementById('avatar');

async function displayProfilPage() {
    try {
        const response = await fetch(`http://localhost:8000/api/user`)
        const userData = await response.json()
        profilPage.innerHTML = `
            <h2>username = ${userData[0].fields.username}</h2>
            <h2>mail = ${userData[0].fields.mail}</h2>
            <h2>pseudo = ${userData[0].fields.pseudo}</h2>
            <h2>password = ${userData[0].fields.password}</h2>
    `;
    }
    catch (err) {
        profilPage.innerHTML = '<p class="error-msg">There was an error loading the user</p>';
    }
}

async function displayAvatar() {
    try {
        const response = await fetch(`http://localhost:8000/api/user`)
        const userData = await response.json()
        avatar.innerHTML = `<img src="" alt="default-avatar">`;
    }
    catch (err) {
        profilPage.innerHTML = '<p class="error-msg">There was an error loading the user</p>';
    }
}
export { displayProfilPage, profilBtn, profilPage};