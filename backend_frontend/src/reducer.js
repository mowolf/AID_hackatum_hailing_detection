const default_sate = {
    carStates: [],
    waitingPassengers: []
}

export default (state = default_sate, action) => {
    switch (action.type) {
        case 'carStatuses':
            return {
                ...state,
                carStates: action.payload
            }
        case "waitingPassengers":
            return {
                ...state,
                waitingPassengers: action.payload
            }
        default:
            return state;
    }
}