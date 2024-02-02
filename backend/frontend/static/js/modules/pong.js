function launchGame() {
    
    const socketURL = 'wss://localhost:8000/ws/game/';
    const socket = new WebSocket(socketURL)
    const jwtToken = localStorage.getItem('jwt_token');
    // Connection opened

    socket.addEventListener('open', (event) => {
        console.log('WebSocket connection opened:', event);
        // Send a message to the server
        const message = {
            type: 'open',
            content: 'Hello, server!',
            jwtToken: jwtToken,
        };
        socket.send(JSON.stringify(message));
    });

    // Listen for messages from the server
    socket.addEventListener('message', (event) => {
        console.log('Received message from server:', event.data);
        // Parse the JSON string
        const data = JSON.parse(event.data);
 
        // Extract values as integers
        let p1 = parseInt(data.p1);
        let p2 = parseInt(data.p2);
        let bx = parseInt(data.bx);
        let by = parseInt(data.by);
        let score1 = parseInt(data.p1_score);
        let score2 = parseInt(data.p2_score);

        drawPong(bx, by, p1, p2);
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



//xb and yb = ball, ylp == left paddle, yrp == right
function drawPong(xb, yb, ylp, yrp) {
    const canvas = document.getElementById('pong');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(10, ylp, 15, 80);
    ctx.fillRect(570,  yrp, 15, 80);
    ctx.fillRect(xb, yb, 10, 10 )
}


export { launchGame , drawPong }
