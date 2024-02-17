import { launchGame , pseudoCheck} from "../pong.js"
import { hideDivs, showDivs, makeApiRequest } from "../utils.js";
import {displayHomePage} from "../display_page_function.js"

function put_game_launcher_form_html() {
    var game_launcher_div = document.getElementById("game_launcher_div");
    game_launcher_div.innerHTML = `
    <div class="card" id="game_launcher">   
        <div class="card-body d-flex justify-content-center align-items-center text-center"  id="game_card">
            <div class="row" id="pong_button">
              <div class="d-grid col">
                <button class="btn btn-primary btn-block btn-lg" id="play_button">Play online</button>
              </div>
              <div class="d-grid  col">
                <button class="btn btn-primary btn-block btn-lg" id="tournament">Tournament</button>
              </div>
              <div class="d-grid  col">
                <button class="btn btn-primary btn-block btn-lg" id="local">Local</button>
              </div>
              </div>
            <div id ="pong_launcher"></div>
            </div>
            <div class="card-footer text-center" id="replay">
            <button class="btn btn-primary btn-block" id="replay_button">Replay</button>
        </div>
        <div class="card-body d-flex justify-content-center align-items-center text-center"  id="controls_card">
            <div class="row" id="controls_scheme">
                  <div class="d-grid  col">
                  <button class="btn btn-primary btn-block btn-lg" id="up">Up: W or ↑</button>
                  <button class="btn btn-primary btn-block btn-lg" id="down">Down: S or ↓</button>
                  </div>
                  </div>
            <div id ="controls_scheme"></div>
        </div>  
    </div>
    `;

    const playBtn = document.getElementById("play_button");
    playBtn.addEventListener('click', async () => {
        try {
            hideDivs(['pong_button']);
            await pseudoCheck();
            showDivs(['pong_launcher']);
            launchGame('normal');
        } catch (err) {
            pong_launcher.innerHTML = `<p class="error-msg">${err.message}</p>`;
        }
    });

    const tournamentBtn = document.getElementById("tournament");
    tournamentBtn.addEventListener('click', async ()=> {
        try {
            hideDivs(['pong_button']);
            await pseudoCheck();
            showDivs(['pong_launcher']);
            launchGame('tournament');
        } catch (err) {
            pong_launcher.innerHTML = `<p class="error-msg">${err.message}</p>`;
        }
    })

    const localBtn = document.getElementById("local");
    localBtn.addEventListener('click', async ()=> {
        try {
            hideDivs(['pong_button']);
            showDivs(['pong_launcher']);
            launchGame('local');
        } catch (err) {
            pong_launcher.innerHTML = `<p class="error-msg">${err.message}</p>`;
        }
    })

    hideDivs(['replay'])
    const logoutBtn = document.getElementById('replay_button');
        logoutBtn.addEventListener('click', () => {
            event.preventDefault();
            makeApiRequest('refresh_user_status');
            displayHomePage();
        });
}

export { put_game_launcher_form_html };