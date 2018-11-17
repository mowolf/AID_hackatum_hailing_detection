module.exports = function(obj) {
    // if (obj && (!obj.carId || !obj.pos)) {
    //     return null;
    // }

    // obj = {};



    return {
        carId: obj.carId === (undefined || null) ? 0 : obj.carId,
        pos: obj.pos || {
            lat: 1.23,
            lng: 2.34
        },
        state: obj.state || "FREE", // FREE, BUSY, APPROACHING, CHARGING, ERROR, MAINTENANCE
        change: obj.change || 0.0,
        batteryCharge: obj.batteryCharge || 1
    };
};
