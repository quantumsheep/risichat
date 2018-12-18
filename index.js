const express = require("express");
const app = express();
const http = require("http").Server(app);
const WebSocket = require("ws");
const path = require("path");

const PORT = 3000;

const ws = new WebSocket.Server(
  {
    port: "3500"
  },
  () => {
    console.log(`Websocket stated on port ${PORT}`);
  }
);
app.use("/static", express.static("static"));

const ANONYMOUS = "anonymous";

/** @type {WebSocket[]} */
const clients = [];

ws.on("connection", (socket, request) => {
  socket.nickname = ANONYMOUS;

  const index = clients.push(socket) - 1;
  console.log(`${clients.length} clients online`);

  socket.on("message", message => {
    if (message.startsWith("$nickname=")) {
      const [, nickname = ANONYMOUS] = message.split("=", 2);
      socket.nickname = nickname;
    } else {
      //for (let client of clients) {
      clients.forEach((client) => {      
        if (client.readyState === WebSocket.OPEN) {
          client.send(`${socket.nickname}> ${message}`);
        }
      });
    }
  });

  socket.on("close", socket => {
    console.log("Socket closed");
    const user = clients[index];
    clients.splice(index, 1);
    clients.forEach((client) => {    
      if (client.readyState === WebSocket.OPEN) {
        client.send(`${user.nickname} disconnected`);
      }
    });
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve("static/index.html"));
});

http.listen(PORT, () => console.log(`> Running on http://localhost:${PORT}`));
