const express = require("express");
const app = express();
const server = require("http").Server(app);
const WebSocket = require("ws");
const path = require("path");

const PORT = 3000;

const ws = new WebSocket.Server({ server });

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
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(`${socket.nickname}> ${message}`);
        }
      });
    }
  });

  socket.on("close", () => {
    const user = clients.splice(index, 1);
    console.log(`${user.nickname || ANONYMOUS} disconnected`);
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.resolve("static/index.html"));
});

server.listen(PORT, () => console.log(`> Running on http://localhost:${PORT}`));
