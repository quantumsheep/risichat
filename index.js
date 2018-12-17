const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = 3000;

app.use('/static', express.static('static'));

const ANONYMOUS = "anonymous";

io.on('connection', socket => {
  socket.nickname = ANONYMOUS;

  socket.on('message', message => {
    if (message.startsWith('$nickname=')) {
      const [, nickname = ANONYMOUS] = message.split('=', 2);
      socket.nickname = nickname;
    } else {
      io.emit('message', `${socket.nickname}> ${message}`);
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.resolve('static/index.html'));
});

http.listen(PORT, () => console.log(`> Running on http://localhost:${PORT}`));