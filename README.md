## HackaTUM 2018: Autonomous Intelligent Driving Challenge
# Swarm intelligence based taxi service with gesture recognition UI

by: [hobbeshunter](https://github.com/hobbeshunter) [whateverforever](https://github.com/whateverforever) [asakhnenko](https://github.com/asakhnenko) [t1llr1cht3r](https://github.com/t1llr1cht3r) [mowolf](https://github.com/mowolf) 

This repository hosts the project that was developed during HackaTUM 2018 during 36 hours. The aim of the project is to improve the user experience by allowing interactions with autonomous cabs through simple gestures. The cab will detect the passenger and offer a ride. In case the cab is currently unavailable, it sends a signal to a back-end server to send the next available cab to this area.

## Installation

1. Install tmux
1. Install and make sure Docker CE runs
1. Clone Project
> `git clone https://github.com/mowolf/AID_hackatum_hailing_detection`
4. Start bash script
> `bash dev-setup.sh`
5. open browser: 'localhost:1234'

## Examples

![](detected.png)
![](fleetControl.png)

# The Hackaton - our Mission & Vision

## Inspiration
Imagine the future of mobility. Everything is autonomous and happens almost instantly. You don´t need to have a car, you don´t need to be able to drive. Fleets of autonomous vehicles are waiting to move you from A to B. But do you need in-depth tech knowledge, experience to handle complicated apps and communicate to dozens of computers on four wheels? This part doesn´t seem right. Just think of your grandparents trying to handle their Wifi, how can we expect them to be as common with modern technology as we are? The future of mobility needs to be democratic. Everybody - techies or grandparents, bankers without time, disabled people - have to be guaranteed the same access. Come on, let´s catch a ride!

## What we did
Our approach to democratic access to mobility is to have the entire user experience (UX) of mobility in mind and rethink every aspect towards intuitive usage without any prerequisites, but for all demands. The goal is to gain a human-centered model, for every possible human. Consequently, in the middle of our model is the customer with his entire UX, requiring a ride, having the mobility and all the regarded services to his demand. To address everybody, the contact from between human and machine needs to be intuitive and possible under diverse circumstances. An app-based approach is thus only completely satisfying for those using an app. For those not using an app, this approach needs to be extended to a non-app-based communication. A main challenge is the detection of a person requiring transportation without usage of an app.
We belive, that in the future a fleet of intelligent vehicles communicates to each other. Individual mobility is of course still apparent, but the majority of transports will happen on a shared basis. With this fleet communication is possible to each car, whether it is already occupied or not. The customer may now send his signal to a taxi. It may be the techie via app, the grandparents via telephone, or the banker just via gestures. Via gestures? With a clever AI algorithm the car can detect if a pedestrian wants a ride!
For the desired intuitive communication it doesn´t matter if the cab is already occupied. In such a case the customers location is given to the next cab, which is happy to move to your location! As soon as it has arrived it will detect you, and ask you to enjoy your ride.
But to the UX belongs more than just calling a cab and driving from A to B. We imagine a NLP algorithm talking to the customer. It greets him in the vehicle and asks about the destination. It has knowledge about the city - take me to the best beer garden in the vicinity! With grandparents the conversation might cause the car to drive more slowly and carefully. With an emergency mode the fleet might optimize the concerning vehicles way to the next hospital.
Of course, mobility comes at a price. How can a banker, working during the ride, have the same well-being as the grandparents who don´t use modern payment methods at all? As a result, a democratic technology needs to be suitable for different payment method. We imagine a traditional cash automat for the grandparents. Their UX should not be changed too much for them to still feel well. Cashless paying

## How we built it
The complete service runs in three docker containers. One for the car, the backend and the interface for the fleet manager. Using posenet we detect a gesture of a person who signals a cab to pick him up. Main programming language is javascript. Furthermore React, Node, Leaflet (Open Street Maps), Redux, Tensorflow (PoseNet), Socket.io and more.

## Challenges we ran into
Defining the festure to detect was quite hard and required more time than we thought. We expected many issues with regard to a realistic model, but diverse problems occurred, some of them not solvable for us. Particularly with regard to the reliable detection of a person some difficulties arised. As an example, the algorithm we used has problems if people with similar clothes - like black pullovers - are close to each other. Here it is hard to differenciate to which person an arm belongs, what plays an important role in communication to the cab.
After all there are, of course, different aspects that remain unsolved towards a realistic approach. But many issues we faced were solvable in the end and made our model more realistic and thus more robust.

## Accomplishments that we're proud of
First of all, we are proud of the overall performance of our team. In a short time we organized ourselves, created and managed a project and solved the problem in a team. Everybody was able to put his individual talents into our project.
Technically spoken, the environment, that simulates the car with an camera and communicates to possible passengers is a component we are proud of. Our approach was to create a framework which shows some basic aspects about the real world, and we think that our hierarchy is a good approach. The car talks to our backend, that would also direct nearby cars in the fleet to the passenger, if the car which detected a passenger was occupied. Also, we built an interface for the fleet operator, showing all cars, their status (battery, and occupation) and the location on a map. Furthermore we simulated the cars to pick up waiting passengers. 
Overall we are really proud of this complete approach to the problem of mobility, that our team created.

## What we learned
Since everybody from our team brought her or his individual talents to the project, we could really learn a lot from each other. While some could provide our group with strong programming skills, others managed the whole project and kept all aspects in mind.
With regard to the project itself we definetely gained a lot of knowledge with regard to all the small aspects that need to be kept in mind while programming such an autonomous task. Even with all our considerations our approach is only a model and only in a model world. 
Technically spoken we of course learned a lot about creating a hierarchy and about the AI algorithm we used. Many aspects that might seem easy become almost unsolvable problems if converted to the real world.
At all this weekend and the work on the AID challenge was an extraordinary experience for all of us, out of which we definetely took a lot for ourselves.

## What's next for AID-cab
We would love to see that our approach is appreciated, so that some ideas might be further evolved. Perhaps our entire approach is such a good idea, that the principles might be further evolved. But first of all, we look forward to fruitfull discussions about our ideas and thoughts about the challenge. We have now built a first small knowledge and experience base for the area of autonomous driving. Thus learning from the hands-in experience from AID would definetely push us forward.

---

## Dependencies

### Docker
[Docker](https://www.docker.com/)

### PoseNet
Pre-trained machine learning model ported to TensorFlow.js which can recognize human poses real-time.

[GitHub Repo](https://github.com/tensorflow/tfjs-models/tree/master/posenet)

### React
React is a JavaScript library for building UIs.

[GitHub Repo](https://github.com/facebook/react)

### Leaflet
Open-source JavaScript library for interactive maps.

[GitHub Repo](https://github.com/Leaflet/Leaflet)
