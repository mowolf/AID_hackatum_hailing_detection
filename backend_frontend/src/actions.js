import io from "socket.io-client";

const socket = io("http://localhost:3000");

export const init = store => {
  ["carStatuses"].forEach(type =>
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
