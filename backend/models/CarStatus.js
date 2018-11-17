module.exports = function(obj) {
    // if (obj && (!obj.carId || !obj.pos)) {
    //     return null;
    // }

    // obj = {};

    return {
        carId: obj.carId === undefined || "",
        pos: obj.pos || {
            lat: 0.0,
            long: 0.0
        },
        state: obj.state || "FREE", // FREE, BUSY, APPROACHING, CHARGING, ERROR, MAINTENANCE
        change: obj.change || 0.0,
        batteryCharge: obj.batteryCharge || 1
    };
};
