import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import Chess from "./logic/chess.js";

const port = 8000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });


app.set('view engine', 'pug');
app.set("views", "./views");
app.use(express.static('public'));

let uid = Date.now();
app.get('/', (req, res) => {
  res.render('main', { uid: uid });
})

function parseCookies(req) {
  let cookies = {};
  if (req.headers.cookie) {
    const cookiesArray = req.headers.cookie.split(';');
    cookiesArray.forEach((cookie) => {
      const [key, value] = cookie.trim().split('=');
      cookies[key] = value;
    });
  } else {
    cookies = null;
  }
  return cookies;
}
app.get("/live", (req, res) => {
  let cookies = parseCookies(req);
  if (cookies) {
    if (cookies.uid == uid) {
      res.render('game', { uid: uid });
    }
  } else {
    res.redirect('/');
    return;
  }
})

httpServer.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});

let chess = new Chess();
io.on('connection', (socket) => {
  socket.on('move', (message) => {
    if (!chess.ended) {
      chess.playMove(message);
    }
    socket.broadcast.emit('move', message);
  })
  
})