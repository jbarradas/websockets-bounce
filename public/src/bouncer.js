const { sendCoordinates } = require("./actions");

const r = 25;
let x = r;
let y = r;
let dx = 1;
let dy = 1;
let moveBallInterval;

function moveBall(clients, leadClient, online) {
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

      sendCoordinates(
        {
          x,
          y,
          r,
          dx,
          dy,
          online,
        },
        clients
      );
    }
  }, 10);
  return moveBallInterval;
}

module.exports = {
  r,
  x,
  y,
  dx,
  dy,
  moveBallInterval,
  moveBall,
};
