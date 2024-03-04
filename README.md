# Websockets Bounce

## Tech Stack

Node.js, express, websockets, HTML5 canvas

### Dev Setup

1. Install dependencies `npm install`
2. Run server `npm run dev`
3. Start browser instances on http://localhost:3000

## Goals

1. Learn more about Node.js and Websockets
2. Build app where a ball is boucing between 2 screens, both should be in sync, and ball shows in only 1 screen at a time.

   Should keep bouncing until in reaches it's screen side (right for the 1st user, left for the 2nd user) and then move forward to the other screen, and keep bouncing again.

3. Coordinates of the ball, and other info, are kept in the server and broadcasted to clients.

https://github.com/jbarradas/websockets-bounce/blob/main/public/video.mp4
