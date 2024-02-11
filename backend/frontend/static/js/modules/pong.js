import {hideDivs, makeApiRequest, showDivs, makeApiRequestPost, getCookie} from './utils.js'
import { createWebSocket } from './utils.js';

async function addPseudo() {
    const pseudo = document.getElementById('pseudo').value;
    console.log(pseudo);
    const body = {
        'pseudo': pseudo,
    };

    const response = await makeApiRequestPost("registerpseudo", body);
    if (response.ok) {
        console.log('Pseudo registered successfully', response);
    } else {
        console.error('Failed to register user:', response.statusText);
        throw new Error('Failed to register pseudo');
    }
}

async function pseudoCheck() {
    try {
        const response = await makeApiRequest('pseudo');
        if (!response.ok)
            throw new Error('error with the request');
        const data = await response.json();
        if (!data)
            throw new Error('No Data');
        console.log(data);
        if (data.pseudo === '') {
            await new Promise((resolve) => {
                const pong_launcher = document.getElementById("pong_launcher");
                pong_launcher.innerHTML = `
                    <form id="pseudo_form">
                        <label for="pseudo" class="form-label">Pseudo</label>
                        <input type="pseudo" class="form-control" id="pseudo">
                        <div class="container d-flex justify-content-center mt-4">
                            <button id="submit_pseudo_button" class="btn btn-primary">Submit</button>
                        </div>
                    </form>`;
                const pseudoForm = document.getElementById('pseudo_form');
                pseudoForm.addEventListener('submit', async (event) => {
                    event.preventDefault();
                    try {
                        await addPseudo();
                        resolve(); // Resolve the promise after pseudo is set
                    } catch (err) {
                        console.error(err.message);
                    }
                });
            });
        } else {
            return;
        }
    } catch (err) {
        console.error(err.message);
    }
}

function launchGame(mode) {
    const pong_launcher = document.getElementById("pong_launcher");
    const socketURL = 'wss://localhost:8000/ws/game/';
    pong_launcher.innerHTML = `
    <p>Looking for Game</p>
    <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>`
    
    const socket = createWebSocket(socketURL);
    const jwtToken = getCookie('jwt_token');
    // Connection opened

    socket.addEventListener('open', (event) => {
        console.log('WebSocket connection opened:', event);
        // Send a message to the server
        const message = {
            type: 'open',
            content: 'Hello, server!',
            mode: mode,
            jwtToken: jwtToken,
        };
        socket.send(JSON.stringify(message));
    });

    // Listen for messages from the server
    var player1;
    var player2;
    var winner = '';

    socket.addEventListener('message', (event) => {
        //console.log('Received message from server:', event.data);
        // Parse the JSON string
        const data = JSON.parse(event.data);
        // Extract values as integers
        console.log(data);
        if (data.type === 'position_update'){
            var p1 = parseInt(data.p1);
            var p2 = parseInt(data.p2);
            var bx = parseInt(data.bx);
            var by = parseInt(data.by);
            var score1 = parseInt(data.p1_score);
            var score2 = parseInt(data.p2_score);
            winner = '';
        }
        else if (data.type === 'match_info'){
            player1 = data.player1;
            player2 = data.player2;
        }
        else if (data.type === 'game_end') {
            winner = data.winner;
        }

        drawPong(player1, player2, bx, by, p1, p2, score1, score2, winner);
    });

    // Connection closed
    socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event);
    });
  
    // Connection error
    socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
    });

    let key_w_press = false;
    let key_s_press = false;

    document.addEventListener('keydown', function(event) {
        // Check for the pressed key
        switch (event.key) {
          case 'w':
            key_w_press = true
            key_s_press = false
            break;
          case 's':
            key_s_press = true
            key_w_press = false
            break;
        }
    });
    
    document.addEventListener('keyup', function(event) {
        switch (event.key) {
            case 'w':
                key_w_press = false
                break;
            case 's':
                key_s_press = false
                break;
        }
    })

    window.addEventListener('blur', function() {
        key_w_press = false;
        key_s_press = false;
    });

    let keyPressInterval = setInterval(function() {
        if (key_w_press || key_s_press) {
            KeyPress(key_w_press ? 'w' : 's');
        }
    }, 20);
    
    function KeyPress(key) {
        
        const keyMsg = {
            type: 'keyPress',
            content: key,
            jwtToken: jwtToken,
        };
        socket.send(JSON.stringify(keyMsg));
    }
}



function drawPong(player1, player2, bx, by, p1, p2, score1, score2, winner) {
    const pong_launcher = document.getElementById("pong_launcher");
    pong_launcher.innerHTML = `<canvas id="pong" width="858" height="525"></canvas>`
    const canvas = document.getElementById('pong');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw center dotted line
    if (winner) {
        ctx.font = '50px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = "center";
        ctx.fillText(winner + ' WON!', 858 / 2, 525 / 2);
        return;
    }
    ctx.beginPath();
    ctx.setLineDash([5, 15]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(5, p1, 10, 60);
    ctx.fillRect(canvas.width - 15, p2, 10, 60);

    // Draw ball
    ctx.beginPath();
    ctx.arc(bx, by, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.closePath();

    // Draw player scores
    ctx.font = '20px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = "left";
    ctx.fillText(player1 + ':' + score1, 30, 30);
    ctx.textAlign = "right";
    ctx.fillText(player2 + ':' + score2, 828, 30);
    ctx.textAlign = 'center';
    ctx.fillText("PONG", 858 / 2, 30);
}


export { launchGame , drawPong, pseudoCheck }
