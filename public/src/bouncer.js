const { sendCoordinates } = require("./actions");

let moveBallInterval;
const coords = {
  r: 15,
  x: 15,
  y: 15,
  dx: 1,
  dy: 1,
};

function moveBall(clients, leadClient, getOnline) {
  moveBallInterval = setInterval(() => {
    if (leadClient?.canvas) {
      // Handle collision
      const { x, dx, r, y, dy } = coords;
      if (x + dx > leadClient.canvas.width - r || x + dx < r) {
        coords.dx = -dx;
      }
      if (y + dy > leadClient.canvas.height - r || y + dy < r) {
        coords.dy = -dy;
      }

      coords.x += coords.dx;
      coords.y += coords.dy;

      const online = getOnline();
      sendCoordinates(
        {
          ...coords,
          online,
        },
        clients
      );
    }
  }, 10);
  return moveBallInterval;
}

function resetBall() {
  coords.x = coords.r;
  coords.y = coords.r;
  coords.dx = 1;
  coords.dy = 1;
}

module.exports = {
  moveBallInterval,
  moveBall,
  resetBall,
};
