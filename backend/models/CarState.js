export default class CarState {
    constructor() {
        this.car_id = "";
        this.pos = {
            lat: 0.0,
            long: 0.0
        };
        this.state = "FREE"; // FREE, BUSY, CHARGING, ERROR, MAINTENANCE
        this.change = 0.0;
        this.battery_charge = 1;
    }
}
