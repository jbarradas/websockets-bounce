const { sendClient } = require("./actions");
const { moveBall, moveBallInterval } = require("./bouncer");

const clients = [];
let online = 0;
let leadClient;

function handleClient(thisClient, request) {
  console.log("New Connection");

  online += 1;
  thisClient.id = request.headers["sec-websocket-key"];
  clients.push(thisClient);
  if (!leadClient) leadClient = thisClient;
  sendClient(thisClient, leadClient);
  if (clients.length === 1) moveBall(clients, leadClient, online);

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
        sendClient(clients[0], leadClient);
      }
    }
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

module.exports = {
  handleClient,
};
