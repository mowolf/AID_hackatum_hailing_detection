var express = require("express");
var app = express();

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
    console.log("Example app listening on port 3000!");
});
