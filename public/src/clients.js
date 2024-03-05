const { sendClient } = require("./actions");
const { moveBall, moveBallInterval } = require("./bouncer");

const clients = [];
let online = 0;
let leadClient;

function getOnline() {
  return online;
}

function handleMessage(thisClient, data) {
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
    // update client canvas (width + height)
    clients[clientIndex].canvas = clientData.payload.canvas;
    // update leadClient
    if (!leadClient || leadClient.id === thisClient.id) {
      leadClient = clients[clientIndex];
    }
  }
}

function startClient(thisClient, request) {
  online += 1;
  thisClient.id = request.headers["sec-websocket-key"];
  clients.push(thisClient);
  if (!leadClient) leadClient = thisClient;
  sendClient(thisClient, leadClient);
  if (clients.length === 1) moveBall(clients, leadClient, getOnline);
}

function endClient(thisClient) {
  online -= 1;
  const position = clients.indexOf(thisClient);
  clients.splice(position, 1);
  console.log("Connection closed");

  if (clients.length <= 0) {
    clearInterval(moveBallInterval);
    // resetBall();
    leadClient = null;
  } else {
    if (leadClient.id === thisClient.id) {
      leadClient = clients[0];
      sendClient(clients[0], leadClient);
    }
  }
}

function handleClient(thisClient, request) {
  console.log("New Connection");
  startClient(thisClient, request);

  thisClient.on("message", (data) => handleMessage(thisClient, data));
  thisClient.on("close", () => endClient(thisClient));
}

module.exports = {
  handleClient,
};
