const MakeCarState = require("./models/CarState.js");
const MakeWaitingPassenger = require("./models/waitingPassenger.js");

const express = require("express");
const app = express();

const http = require("http").Server(app);
const io = require("socket.io")(http);

const cors = require("cors");
const bodyParser = require("body-parser");

const state = {
    carStates: [],
    waitingPassengers: []
};

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function(req, res) {
    res.send("Hello World!");
});

app.get("/carStates", (req, res) => {
    res.json(state.carStates);
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

io.on("connection", function(socket) {
    console.log("A user connected");

    setInterval(function() {
        socket.emit("carStates", state.carStates);
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

    const newCarState = MakeCarState();
    state.carStates.push(newCarState);
});
