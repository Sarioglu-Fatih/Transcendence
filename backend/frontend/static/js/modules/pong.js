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

    document.addEventListener('keydown', function(event) {
        // Check for the pressed key
        switch (event.key) {
          case 'w':
          case 's':
                const keyMsg = {
                    type: 'keyPress',
                    content: event.key,
                    jwtToken: jwtToken,
                };
                socket.send(JSON.stringify(keyMsg));
                break;
        }
      });
}

//xb and yb = ball, ylp == left paddle, yrp == right
function drawPong(xb, yb, ylp, yrp) {
    const canvas = document.getElementById('pong');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(5, ylp, 10, 40);
    ctx.fillRect(285,  yrp, 10, 40);
    ctx.fillRect(xb, yb, 5, 5 )
}


export { launchGame , drawPong }
