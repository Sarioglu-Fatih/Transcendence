import { launchGame , pseudoCheck} from "../pong.js"
import { hideDivs, showDivs } from "../utils.js";

function put_game_launcher_form_html() {
    var game_launcher_div = document.getElementById("game_launcher_div");
    game_launcher_div.innerHTML = `
    <div class="card" id="game_launcher">   
        <div class="card-body d-flex justify-content-center align-items-center text-center"  id="game_card">
            <div class="row" id="pong_button">
              <div class="d-grid gap-2 col-6 mx-auto">
                <button class="btn btn-primary btn-block btn-lg" id="play_button">Play</button>
              </div>
              <div class="d-grid gap-2 col-6 mx-auto">
                <button class="btn btn-primary btn-block btn-lg" id="tournament">Tournament</button>
              </div>
            </div>
            <div id ="pong_launcher"></div>
        </div>
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

}

export { put_game_launcher_form_html };