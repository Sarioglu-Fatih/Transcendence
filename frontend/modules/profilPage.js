const profilBtn = document.getElementById('profil_button');
const profilPage = document.getElementById('profil_page');

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

export { displayProfilPage, profilBtn, profilPage};