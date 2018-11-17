const MakeCarState = require("./models/CarState.js");
const express = require("express");
const app = express();

const http = require("http").Server(app);
const io = require("socket.io")(http);
const cors = require("cors");

const state = {
    carStates: [],
    waitingPassengers: []
};

app.use(cors());

app.get("/", function(req, res) {
    res.send("Hello World!");
});

app.get("/carStates", (req, res) => {
    res.json(state.carStates);
});

io.on("connection", function(socket) {
    console.log("A user connected");

    socket.send("hallo-socket");
    socket.emit("carStates", state.carStates);

    setTimeout(function() {
        console.log("hallo");
        socket.send("hallo-socket");
        socket.emit("carStates", state.carStates);
    }, 1000);

    setTimeout(function() {
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
