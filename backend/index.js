const CarState = require("./models/CarState.js");
const express = require("express");
const app = express();

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

app.listen(3000, function() {
    state.carStates.push(CarState());
    console.log("Example app listening on port 3000!");
});
