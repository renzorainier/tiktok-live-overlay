const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { TikTokLiveConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Hardcoded target user
const tiktokUsername = "4krenzugamingph";

let tiktokConnection = new TikTokLiveConnection(tiktokUsername, {
    processInitialData: false
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}.`);

    tiktokConnection.connect().then(state => {
        console.log(`✅ Connected to Room ID: ${state.roomId}`);
        io.emit('chat', {
            username: "System",
            message: `Connected to ${tiktokUsername}! Awaiting chats...`
        });
    }).catch(err => {
        console.error('❌ TikTok Connection Error:', err.message);
    });
});

tiktokConnection.on('chat', (data) => {
    try {
        const username = data.user.nickname || data.user.displayId || "User";
        const message = data.content || "";

        if (message.trim().length > 0) {
            io.emit('chat', { username, message });
        }
    } catch (error) {}
});

process.on('uncaughtException', (err) => {
    console.error('⚠️ Caught exception:', err.message);
});