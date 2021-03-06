const express = require("express");
const uuidv4 = require("uuid/v4");
const app = express();

const http = require("http").Server(app);
const socketio = require("socket.io");
const controllio = socketio(http);
const cario = socketio(http, {
  path: "/car",
  serveClient: false
});

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

app.get("/test", function(req, res) {
  console.log("###### test page triggered, adding test data...");

  const passenger = MakeWaitingPassenger({
    colorHist: 123,
    pos: {
      lat: 48.154145,
      lng: 11.558108
    }
  });

  const taxi = MakeCarStatus({
    carId: 666,
    pos: {
      lat: 48.15486,
      lng: 11.555665
    },
    state: "FREE", // FREE, BUSY, APPROACHING, CHARGING, ERROR, MAINTENANCE
    change: 0.0,
    batteryCharge: 1
  });

  state.waitingPassengers.push(passenger);
  state.carStatuses.push(taxi);

  res.send(state);
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

// Websocketzeug

controllio.on("connection", function(socket) {
  console.warn("User connected");

  controllio.clients((error, clients) => {
    if (error) throw error;
    //console.log("clients");
    //console.log(clients); // => [6em3d4TJP8Et9EMNAAAA, G5p55dHhGgUnLUctAAAB]
  });

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

cario.on("connection", function(socket) {
  console.warn("Car connected");

  const newCarStatus = MakeCarStatus({
    carId: uuidv4(),
    pos: { lat: 48.1347975, lng: 11.5424506 }
  });
  newCarStatus.socket = socket.id;
  state.carStatuses.push(newCarStatus);
  socket.emit("id", newCarStatus.carId);

  socket.on("status", function(data) {
    newCarStatus.pos = data.pos;
    newCarStatus.state = data.state;
  });

  socket.on("servedPassenger", function(data) {
    state.waitingPassengers = state.waitingPassengers.filter(passenger => passenger.id !== data.id);
    console.log("Passenger served");
  });

  socket.on("disconnect", function() {
    state.carStatuses = state.carStatuses.filter(
      carStatus => carStatus !== newCarStatus
    );
    console.log(`Car ${newCarStatus.carId} disconnected`);
  });
});

http.listen(3000, function() {
  console.log("websocket listening on 3000 ");

  // let newCarStatus = MakeCarStatus({
  //   carId: 0,
  //   pos: { lat: 48.1347975, lng: 11.5424506 }
  // });
  // state.carStatuses.push(newCarStatus);
  // newCarStatus = MakeCarStatus({
  //   carId: 1,
  //   pos: { lat: 48.1288533, lng: 11.5811703 }
  // });
  // state.carStatuses.push(newCarStatus);

  // const passenger = MakeWaitingPassenger({
  //   colorHist: 123,
  //   pos: {
  //     lat: 48.154145,
  //     lng: 11.558108
  //   }
  // });
  // state.waitingPassengers.push(passenger);
});

const tellCabToGetPassenger = function(cabId, passenger) {
  console.log("telling " + cabId + " to go and get sb");

  const cab = state.carStatuses.find(carStatus => carStatus.carId === cabId);

  if (cab === null) {
    return;
  }

  const targetPos = cab.pos;

  cab.state = "APPROACHING";
  passenger.cabId = cabId;
  cario.sockets.connected[cab.socket].emit("pickup", passenger);

  console.log("found cab to get passenger");
  console.log(cabId + " should get " + passenger);

  console.log("found cab to get passenger");
  console.log(cabId + " should get " + passenger);

  // TODO: Networking code to tell cab to go to targetPos
};

const distanceBetweenPositions = function(posA, posB) {
  // TODO: replace by API call to roadnav service or some other metric
  // TODO: replace by API call to roadnav service or some other metric
  // TODO: replace by API call to roadnav service

  const deltaLat = posA.lat - posB.lat;
  const deltaLng = posA.lng - posB.lng;

  return Math.sqrt(Math.pow(deltaLat, 2) + Math.pow(deltaLng, 2));
};

const checkWaitingPassengers = function() {
  let haveWaitingPassengers = false;

  state.waitingPassengers.forEach(passenger => {
    // Don't serve passengers that already have an associated cab
    if (!passenger.cabId) {
      haveWaitingPassengers = true;
      return;
    }
  });

  if (!haveWaitingPassengers) {
    // console.log("Everybody is being served...");
    setTimeout(checkWaitingPassengers, 5000);
    return;
  }

  // console.log("We have waiting customers...");
  // console.log(state.waitingPassengers);
  // for passenger in waitingpassengers
  state.waitingPassengers.forEach(passenger => {
    // Don't serve passengers that already have an associated cab
    if (passenger.cabId) {
      return;
    }

    var minDist = Infinity;
    var bestCabId = -1;

    // find closest free cab
    state.carStatuses
      .filter(carStatus => carStatus.socket)
      .forEach(carStatus => {
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

    // console.log("min dist: " + minDist);
    // console.log("best car: " + bestCabId); // asdf

    // tell cab to get passenger
    if (bestCabId !== -1) {
      tellCabToGetPassenger(bestCabId, passenger);
    }
  });

  // console.log("We have waiting customers...");
  // console.log(state);

  setTimeout(checkWaitingPassengers, 5000);
};
checkWaitingPassengers();
