import { launchGame , pseudoCheck} from "../pong.js"
import { hideDivs, showDivs } from "../utils.js";

function put_game_launcher_form_html() {
    var game_launcher_div = document.getElementById("game_launcher_div");
    game_launcher_div.innerHTML = `  
    <div class="card" id="game_launcher">   
        <div class="card-body"  id="game_card">
            <div class="row" id="pong_button">
              <div class="col-md-6 text-center">
                <button class="btn btn-primary btn-block" id="play_button">play</button>
              </div>
              <div class="col-md-4 text-center">
                <button class="btn btn-primary btn-block" id="tournament">Tournament</button>
              </div>
            </div>
            <div id ="pong_launcher"></div>
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