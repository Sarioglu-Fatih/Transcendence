import { makeApiRequest } from "../utils.js";

function put_match_history_html() {
    var match_history_div = document.getElementById("match_history_div");
    match_history_div.innerHTML = `  
    <div class="card" >                      
        <div class="card-body" id="history">
            <p>History</p>
        </div>
    </div>
    `;
    match_history();
}

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


export { put_match_history_html };