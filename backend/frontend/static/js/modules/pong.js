
function launchGame() {
    const socket = new WebSocket('ws://localhost:8000/ws/game/');

    // Connection opened
    socket.addEventListener('open', (event) => {
        console.log('WebSocket connection opened:', event);
        
        // Send a message to the server
        const message = {
            type: 'chat',
            content: 'Hello, server!',
        };
        socket.send(JSON.stringify(message));
    });

    // Listen for messages from the server
    socket.addEventListener('message', (event) => {
        console.log('Received message from server:', event.data);

        // Handle your WebSocket messages here
        const message = JSON.parse(event.data);
        // Handle the message based on its type or content
    });

    // Connection closed
    socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed:', event);
    });
  
    // Connection error
    socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
    });
}

export { launchGame }
