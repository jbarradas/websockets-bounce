function broadcast(action, payload, clients) {
  for (let c in clients) {
    clients[c].send(
      JSON.stringify({
        action,
        payload,
      })
    );
  }
}

function sendClient(client, leadClient) {
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

function sendCoordinates(coords, clients) {
  broadcast("coords", coords, clients);
}

module.exports = {
  broadcast,
  sendClient,
  sendCoordinates,
};
