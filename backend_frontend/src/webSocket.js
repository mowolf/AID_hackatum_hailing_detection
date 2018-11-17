import io from "socket.io-client";

const socket = io("http://localhost:3000");

export const init = store => {
  ["carStatuses", "waitingPassengers"].forEach(type =>
    socket.on(type, payload => {
      store.dispatch({ type, payload });
    })
  );
};

export const emit = (type, payload) => socket.emit(type, payload);
