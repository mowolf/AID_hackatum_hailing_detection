const default_sate = {
    message: 'Hello World!'
}

export default (state = default_sate, action) => {
    switch (action.type) {
        case 'TEST':
            return {
                ...state,
                message: action.payload
            }
    
        default:
            return state;
    }
}