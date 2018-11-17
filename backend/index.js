const MakeCarState = require("./models/CarState.js");
const express = require("express");
const app = express();

const http = require("http").Server(app);
const io = require("socket.io")(http);

const state = {
    carStates: [],
    waitingPassengers: []
};

app.get("/", function(req, res) {
    res.send("Hello World!");
});

app.get("/carStates", (req, res) => {
    res.json(state.carStates);
});

io.on("connection", function(socket) {
    console.log("A user connected");

    //Send a message after a timeout of 4seconds
    setInterval(function() {
        socket.send("Sent a message 4seconds after connection!");
    }, 4000);

    socket.on("disconnect", function() {
        console.log("A user disconnected");
    });
});

app.listen(3000, function() {
    const newCarState = MakeCarState();
    state.carStates.push(newCarState);
    console.log("Example app listening on port 3000!");
});
