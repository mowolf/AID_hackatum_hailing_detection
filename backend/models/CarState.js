module.exports = function() {
    return {
        carId: "",
        pos: {
            lat: 0.0,
            long: 0.0
        },
        state: "FREE", // FREE, BUSY, CHARGING, ERROR, MAINTENANCE
        change: 0.0,
        batteryCharge: 1
    };
};
