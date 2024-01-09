const profilBtn = document.getElementById('profil_button');
const profilPage = document.getElementById('profil_page');

let userData = [];

fetch('http://localhost:8000/api/user')
    .then((res) => res.json())
    .then((data) => {
        userData = data;
    })
    .catch((err) => {
        profilPage.innerHTML = '<p class="error-msg">There was an error loading the user</p>';
    })

const displayProfilPage = () => {

    profilPage.innerHTML = `
        <h2>${userData[0].fields.username}, ${userData[0].fields.pseudo}, 
        ${userData[0].fields.mail}, ${userData[0].fields.password}</h2>
    `;
}

profilBtn.addEventListener('click', displayProfilPage);