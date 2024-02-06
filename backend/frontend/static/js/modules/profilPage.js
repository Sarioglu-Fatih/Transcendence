import { makeApiRequest } from "./utils.js";

const profilPage = document.getElementById('profil_page');
const avatar = document.getElementById('avatar');

async function match_history() {
    const history = document.getElementById('history');
    try {
        const currentPath = window.location.pathname.substring(1);
        const newPath = currentPath.replace(/^profil/, 'history');
        console.log(newPath);
        const response = await makeApiRequest(newPath);
        const userData = await response.json();
        if (!userData)
            throw new Error('no userData')
        const last5GamesArray = JSON.parse(userData.last_5_games);
        if (!last5GamesArray)
            throw new Error('Invalid or missing data for last_5_games')
        console.log(last5GamesArray)
        history.innerHTML = '';
        console.log('ici');

        last5GamesArray.forEach(game => {
            // Create a Bootstrap card element
            const cardElement = document.createElement('div');
            cardElement.classList.add('card', 'text-center', 'mb-3');

            // Create card body
            const cardBodyElement = document.createElement('div');
            cardBodyElement.classList.add('card-body');

            // Format the date using JavaScript's Date object
            const formattedDate = new Date(game.fields.date).toLocaleString();

            // Populate the card body with game information
            cardBodyElement.innerHTML = `
                <div class="row">
                    <div class="col">
                        <p>${game.fields.player1_username}</p>
                    </div>
                    <div class="col">
                        <p>VS</p>
                    </div>
                    <div class="col">
                        <p>${game.fields.player2_username}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <p>${game.fields.p1_score}</p>
                    </div>
                    <div class="col">
                        <p>:</p>
                    </div>
                    <div class="col">
                        <p>${game.fields.p2_score}</p>
                    </div>
                </div>
            `;

            // Create card footer
            const cardFooterElement = document.createElement('div');
            cardFooterElement.classList.add('card-footer', 'text-muted');
            cardFooterElement.innerHTML = `<p class="card-text">Date: ${formattedDate}</p>`; // Replace with desired footer content

            // Append the card body and footer to the card
            cardElement.appendChild(cardBodyElement);
            cardElement.appendChild(cardFooterElement);

            // Append the card element to the history element
            history.appendChild(cardElement);
        });
    } catch (err) {
        history.innerHTML = `<p class="error-msg">${err.message}</p>`;
    }
}

async function renderProfilPage() {
    try {
        const currentPath = window.location.pathname.substring(1) ;
        console.log(currentPath)
        const response = await makeApiRequest(currentPath)
        const userData = await response.json()
        profilPage.innerHTML = '';
        var username_type = document.getElementById('username_key');
        var pseudo_type = document.getElementById('pseudo_key');
        var email_type = document.getElementById('email_key');
        var resulte_type = document.getElementById('win_lose_key');

        let win_string = userData.win.toString();
        let lose_string = userData.lose.toString();

        if (userData.username){
            username_type.textContent = "username : ";
            username_type.textContent += userData.username;
        }
        else
            username_type.textContent = '';

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
export { renderProfilPage, displayAvatar, match_history};