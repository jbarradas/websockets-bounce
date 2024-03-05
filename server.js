const path = require("path");
const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");
const { handleClient } = require("./public/src/clients");
const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(connectLivereload());
}
app.use(express.static("public"));

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Live Reload for client /public files
const liveReloadServer = livereload.createServer();
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

server.listen(process.env.PORT || 3000, serverStart);
wss.on("connection", handleClient);
