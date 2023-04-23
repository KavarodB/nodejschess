
function connect() {
  const socket = io("http://localhost:8000");

  socket.on("connect", function () {
    console.log("joined a game");
  });
  socket.on("disconnect", () => {
    console.log("DISCONNECTED");
  })

  return socket;
}
function sendMessage() {
  const socket = connect();
  const InputEl = document.getElementById('input');
  const message = InputEl.value;
  socket.emit("move", message);
  socket.on("move", (move) => {
    document.getElementById('value').innerHTML = move;
  })
}



