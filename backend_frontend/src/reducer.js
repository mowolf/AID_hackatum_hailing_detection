const default_sate = {
    carStates: []
}

export default (state = default_sate, action) => {
    switch (action.type) {
        case 'carStatuses':
            return {
                ...state,
                carStates: action.payload
            }
    
        default:
            return state;
    }
}