import { displayProfilPage } from "../display_page_function.js";
import { makeApiRequest, IP } from "../utils.js";
import { getFriendProfil } from "./friend_list.js";

function put_match_history_html() {
    var match_history_div = document.getElementById("match_history_div");
    match_history_div.innerHTML = `  
    <div class="card" id="match_history">                      
        <div class="card-body" id="history">
        </div>
        <div class="card-footer" id="history_footer">
            <div class="row">
                <div class="col-md-6 d-flex justify-content-center align-items-center">
                    <button id="load_less_match" class="btn btn-primary mt-3">Load Less</button>
                </div>
                <div class="col-md-6 d-flex justify-content-center align-items-center">
                    <button id="load_more_match" class="btn btn-primary mt-3">Load More</button>
                </div>
            </div>
        </div>
    </div>
    `;
    match_history();
}

async function match_history() {
    const history = document.getElementById('history');
    const loadLessButton = document.getElementById('load_less_match');
    const loadMoreButton = document.getElementById('load_more_match');

    var offset = 0;
    try {
        const currentPath = window.location.pathname.substring(1);
        const newPath = currentPath.replace(/^profil/, 'history');
        // const Path = newPath.substring(0, newPath.length);
        const response = await makeApiRequest(newPath);
        const userData = await response.json();
        // if (!userData)
        //     throw new Error('no userData')
        const allGamesArray = await JSON.parse(userData.all_games);
        // if (!allGamesArray)
        //     throw new Error('Invalid or missing data for all_games');

        const loadfiveMatches = () => {
            history.innerHTML = ''
            const nextMatches = allGamesArray.slice(offset, offset + 5);
            if (nextMatches.length > 0) {
                nextMatches.forEach(game => {
                    const cardElement = document.createElement('div');
                    cardElement.classList.add('card', 'text-center', 'mb-3');
                    cardElement.style.backgroundColor = "#32353c";
                    cardElement.style.borderColor = "#32353c";
                    // Create card body
                    const cardBodyElement = document.createElement('div');
                    cardBodyElement.classList.add('card-body');

                    // Format the date using JavaScript's Date object
                    const formattedDate = new Date(game.fields.date).toLocaleString();

                    // Populate the card body with game information
                    cardBodyElement.innerHTML = `
                        <div class="row">
                            <div class="col">
                            <p><a href="#" class="player1-link-${game.fields.player1_username}">${game.fields.player1_username}</a></p>
                            </div>
                            <div class="col">
                                <p>VS</p>
                            </div>
                            <div class="col">
                                <p><a href="#" class="player2-link-${game.fields.player2_username}">${game.fields.player2_username}</a></p>
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
                    cardBodyElement.querySelector(`.player1-link-${game.fields.player1_username}`).addEventListener('click', (event) => {
                        event.preventDefault(); 
                        getFriendProfil(`${game.fields.player1_username}`);
                      });
                    
                    cardBodyElement.querySelector(`.player2-link-${game.fields.player2_username}`).addEventListener('click', (event) => {
                        event.preventDefault(); 
                        getFriendProfil(`${game.fields.player2_username}`);
                    });
                
                    const cardFooterElement = document.createElement('div');
                    cardFooterElement.classList.add('card-footer', 'text-muted');
                    cardFooterElement.innerHTML = `<p class="card-text">Date: ${formattedDate}</p>`; // Replace with desired footer content
                    cardFooterElement.style.backgroundColor = "#32353c";
                    cardFooterElement.style.borderColor = "#32353c";
   
                    // Append the card body and footer to the card
                    cardElement.appendChild(cardBodyElement);
                    cardElement.appendChild(cardFooterElement);

                    // Append the card element to the history element
                    history.appendChild(cardElement);
                });
            }
        };
        // Attach click event to the "Load More" button
        loadMoreButton.addEventListener('click', async (e) => {
            e.preventDefault()
            const nextMatches = allGamesArray.slice(offset, offset + 5);
            if (nextMatches.length > 4)
                offset += 5;
            loadfiveMatches();
        });

        loadLessButton.addEventListener('click', (e) => {
            e.preventDefault()
            if (offset >= 5)
                offset -= 5;
            loadfiveMatches();
        });
        // Initial load of matches
        loadfiveMatches();
    } catch (err) {
        history.innerHTML = `<p class="error-msg">${err.message}</p>`;
    }
}


export { put_match_history_html };
