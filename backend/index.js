const express = require("express");
const app = express();

const http = require("http").Server(app);
const io = require("socket.io")(http);

const cors = require("cors");
const bodyParser = require("body-parser");

const MakeCarStatus = require("./models/CarStatus.js");
const MakeWaitingPassenger = require("./models/waitingPassenger.js");

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
    }, 1000);

    socket.on("disconnect", function() {
        console.log("A user disconnected");
    });
});

http.listen(3000, function() {
    console.log("websocket listening on 3000");

    const newCarStatus = MakeCarStatus();
    state.carStatuses.push(newCarStatus);
});

const checkWaitingPassengers = function() {
    if (state.waitingPassengers.length == 0) {
        return;
    }

    console.log("We have waiting customers...");
    console.log(state.waitingPassengers);
};

setInterval(checkWaitingPassengers, 5000);
