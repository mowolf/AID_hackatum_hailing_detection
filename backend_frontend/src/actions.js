import io from "socket.io-client";

const socket = io("http://localhost:3000/socket.io");

export const init = store => {
  ["carStates"].forEach(type =>
    socket.on(type, payload => {
      console.log("received socket message");
        store.dispatch({ type, payload });
    })
  );
};

export const emit = (type, payload) => socket.emit(type, payload);

export const test = message => {
  return {
    type: "TEST",
    payload: message
  };
};
