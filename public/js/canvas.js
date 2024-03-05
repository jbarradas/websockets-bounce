const protocol = window.location.protocol == "https:" ? "wss://" : "ws://";
let serverURL = protocol + window.location.host;
let socket;
let c, canvas, ctx;

function getCanvas() {
  c = document.getElementById("myCanvas");
  canvas = c.getBoundingClientRect();
  ctx = c.getContext("2d");
  sizeCanvas();
}

function openSocket(url) {
  socket = new WebSocket(url);
  socket.addEventListener("open", openConnection);
  socket.addEventListener("close", closeConnection);
  socket.addEventListener("message", readIncomingMessage);
}

function setup() {
  openSocket(serverURL);
  getCanvas();
  new ResizeObserver(() => {
    getCanvas();
    sendCanvas();
  }).observe(c);

  window.addEventListener("resize", () => {
    sizeCanvas();
    sendCanvas();
  });
}

function setInnerHTML(elementId, innerHTML) {
  const element = document.getElementById(elementId);
  element.innerHTML = innerHTML;
}

function sendMessage(action, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ action, payload }));
  }
}

function changeConnection(event) {
  // open the connection if it's closed, or close it if open:
  if (socket.readyState === WebSocket.CLOSED) {
    openSocket(serverURL);
  } else {
    socket.close();
  }
}

function sizeCanvas() {
  const padding = 50;
  const width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  const height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

  c.width = width - padding;
  c.height = height - padding;
}

function openConnection() {
  sendCanvas();
}

function sendCanvas() {
  sendMessage("client", {
    canvas: {
      width: canvas.width,
      height: canvas.height,
    },
  });
}

function closeConnection() {}

function readIncomingMessage(event) {
  if (!event?.data) return null;
  const msg = event.data;
  let data;
  try {
    data = JSON.parse(msg);
  } catch (e) {
    data = null;
  }

  if (data) {
    if (data.action === "coords") draw(data.payload);
    if (data.action === "client")
      setInnerHTML(
        "client",
        `ID: ${data.payload.id} - Is lead: ${data.payload.isLead}`
      );
  }
}

function draw(coords, sAngle, eAngle, counterclockwise = false) {
  if (!coords) return null;

  setInnerHTML("online", `Users online: ${coords.online}`);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  ctx.arc(coords.x, coords.y, coords.r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.closePath();
}

// Wait for the page to load
window.addEventListener("load", setup);
