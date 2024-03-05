const fs = require("fs");
const path = require("path");
const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

const app = express();

app.use(connectLivereload());
app.use(express.static("public"));

const server = createServer(app);
const wss = new WebSocketServer({ server });
const clients = [];
let online = 0;

// Live Reload for client /public files
const liveReloadServer = livereload.createServer({
  https: {
    key: fs.readFileSync(path.join(__dirname, "./certs/websockets_bounce.pem")),
    cert: fs.readFileSync(path.join(__dirname, "./certs/cert.pem")),
  },
});
liveReloadServer.watch(path.join(__dirname, "public"));

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

function serverStart() {
  const port = wss.address().port;
  console.log("Server listening on port " + port);
}

const r = 25;
let x = r;
let y = r;
let dx = 1;
let dy = 1;
let moveBallInterval;

function handleClient(thisClient, request) {
  console.log("New Connection");

  online += 1;
  thisClient.id = request.headers["sec-websocket-key"];
  clients.push(thisClient);
  thisClient.send(
    JSON.stringify({
      action: "client",
      payload: {
        id: thisClient.id,
      },
    })
  );
  if (clients.length === 1) moveBall();

  function endClient() {
    online -= 1;
    const position = clients.indexOf(thisClient);
    clients.splice(position, 1);
    console.log("Connection closed");
    if (clients.length <= 0) clearInterval(moveBallInterval);
  }

  function hitCanvas(axis) {
    if (axis === "x") {
      dx = -dx;
    } else if (axis === "y") {
      dy = -dy;
    }
  }

  function sendCoordinates() {
    broadcast("coords", {
      x,
      y,
      r,
      dx,
      dy,
      online,
    });
  }

  function moveBall() {
    moveBallInterval = setInterval(() => {
      x += dx;
      y += dy;

      // bounce effect on Y axis

      sendCoordinates();
    }, 10);
    return moveBallInterval;
  }

  function clientResponse(data) {
    let clientData;
    try {
      clientData = JSON.parse(data);
    } catch (e) {
      return null;
    }
    const client = clients[0].id === thisClient.id;
    if (client && clientData.action === "hit_canvas") {
      hitCanvas(clientData.payload);
    }
  }

  // set up client event listeners:
  thisClient.on("message", clientResponse);
  thisClient.on("close", endClient);
}

function broadcast(action, payload) {
  for (let c in clients) {
    clients[c].send(
      JSON.stringify({
        action,
        payload,
      })
    );
  }
}
server.listen(process.env.PORT || 3000, serverStart);
wss.on("connection", handleClient);
