#!/bin/bash

CURRENT_UID=${uid}:${gid} docker-compose build

session=hackatum
window=${session}:0

tmux kill-session -t $session
tmux new-session -d -s $session
tmux split-window  -h -t $window
tmux split-window  -t $window -p 50

uid=$(id -u)
gid=$(id -g)

tmux send-keys -t "${window}.0" "CURRENT_UID=${uid}:${gid} docker-compose up" Enter

echo "Waiting until docker container come online"

while [ -z $id_frontend ] || [ -z $id_backend ]; do
  sleep .5

  id_frontend=$(docker ps -q --filter=ancestor=hackatum/backend_frontend:dev | head -n 1)
  id_backend=$(docker ps -q --filter=ancestor=hackatum/backend:dev | head -n 1)

  printf "."
done

tmux send-keys -t "${window}.1" "printf \"\x1b[38;5;125mFrontend\x1b[0m\n\"" Enter
tmux send-keys -t "${window}.1" "docker exec -it --user 1000:1000 $id_frontend bash" Enter
tmux send-keys -t "${window}.2" "printf \"\x1b[38;5;125mBackend\x1b[0m\n\"" Enter
tmux send-keys -t "${window}.2" "docker exec -it $id_backend bash" Enter

tmux attach -t $session
