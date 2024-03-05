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
let leadClient;

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
  if (!leadClient) leadClient = thisClient;
  sendClient(thisClient);
  if (clients.length === 1) moveBall();

  function endClient() {
    online -= 1;
    const position = clients.indexOf(thisClient);
    clients.splice(position, 1);
    console.log("Connection closed");
    if (clients.length <= 0) {
      clearInterval(moveBallInterval);
      // x = r;
      // y = r;
      // dx = 1;
      // dy = 1;
      leadClient = null;
    } else {
      if (leadClient.id === thisClient.id) {
        leadClient = clients[0];
        sendClient(clients[0]);
      }
    }
  }

  function sendClient(client) {
    client.send(
      JSON.stringify({
        action: "client",
        payload: {
          id: client.id,
          isLead: leadClient.id === client.id,
        },
      })
    );
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
      if (leadClient?.canvas) {
        if (x + dx > leadClient.canvas.width - r || x + dx < r) {
          dx = -dx;
        }
        if (y + dy > leadClient.canvas.height - r || y + dy < r) {
          dy = -dy;
        }

        x += dx;
        y += dy;

        sendCoordinates();
      }
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

    if (clientData.action === "client") {
      const clientIndex = clients.findIndex(
        (client) => client.id === thisClient.id
      );
      clients[clientIndex].canvas = clientData.payload.canvas;
      if (!leadClient || leadClient.id === thisClient.id) {
        leadClient = clients[clientIndex];
      }
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
