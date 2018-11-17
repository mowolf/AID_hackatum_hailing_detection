const express = require("express");
const app = express();

const http = require("http").Server(app);
const io = require("socket.io")(http);

const cors = require("cors");
const bodyParser = require("body-parser");

const MakeCarStatus = require("./models/CarStatus.js");
const MakeWaitingPassenger = require("./models/WaitingPassenger.js");

const state = {
  carStatuses: [],
  waitingPassengers: []
};

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function(req, res) {
  res.send("Hello World!");
});

app.post("/waitingPassenger", (req, res) => {
  const passenger = MakeWaitingPassenger(req.body);

  if (!passenger) {
    res.send(500, "Malformed Passenger.. look up the docs");
    return;
  }

  state.waitingPassengers.push(passenger);
  res.sendStatus(200);
});

app.post("/status", (req, res) => {
  const carStatus = MakeCarStatus(req.body);

  if (!carStatus) {
    res.send(500, "Malformed Car State Update...");
    return;
  }

  state.carStatuses.push(carStatus);
  res.sendStatus(200);
});

// Websocketzeug

io.on("connection", function(socket) {
  console.log("A user connected");

  setInterval(function() {
    socket.emit("carStatuses", state.carStatuses);
  }, 1000);

  setInterval(function() {
    socket.emit("waitingPassengers", state.waitingPassengers);
  }, 500);

  socket.on("disconnect", function() {
    console.log("A user disconnected");
  });
});

http.listen(3000, function() {
  console.log("websocket listening on 3000");

  let newCarStatus = MakeCarStatus({
    carId: 0,
    pos: { lat: 48.1347975, lng: 11.5424506 }
  });
  state.carStatuses.push(newCarStatus);
  newCarStatus = MakeCarStatus({
    carId: 1,
    pos: { lat: 48.1288533, lng: 11.5811703 }
  });
  state.carStatuses.push(newCarStatus);
});

const tellCabToGetPassenger = function(cabId, passenger) {
    console.log("telling " + cabId + " to go and get sb");

    const cab = state.carStatuses.filter(
        carStatus => carStatus.carId === cabId
    )[0];
    const targetPos = cab.pos;

    cab.state = "APPROACHING";

    console.log("found cab to get passenger");
    console.log(cabId + " should get " + passenger);

    // TODO: Networking code to tell cab to go to targetPos
};

const distanceBetweenPositions = function(posA, posB) {
    // TODO: replace by API call to roadnav service
    return Math.sqrt(Math.pow(posA, 2) + Math.pow(posB, 2));
};

const checkWaitingPassengers = function() {
  if (state.waitingPassengers.length == 0) {
    setTimeout(checkWaitingPassengers, 5000);
    return;
  }

    console.log("We have waiting customers...");
    console.log(state.waitingPassengers);
    // for passenger in waitingpassengers
    state.waitingPassengers.forEach(passenger => {
        var minDist = Infinity;
        var bestCabId = -1;

        // find closest free cab
        state.carStatuses.forEach(carStatus => {
            if (carStatus.state !== "FREE") {
                return;
            }

            const distanceToPassenger = distanceBetweenPositions(
                carStatus.pos,
                passenger.pos
            );
            if (distanceToPassenger < minDist) {
                minDist = distanceToPassenger;
                bestCabId = carStatus.carId;
            }
        });

        // tell cab to get passenger
        if (bestCabId > -1) {
            tellCabToGetPassenger(bestCabId, passenger);
        }
    });

    console.log("We have waiting customers...");
    console.log(state.waitingPassengers);

  setTimeout(checkWaitingPassengers, 5000);
};
checkWaitingPassengers();
