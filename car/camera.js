/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as posenet from "@tensorflow-models/posenet";
import dat from "dat.gui";
import Stats from "stats.js";
import io from "socket.io-client";

let id = null;

const socket = io("http://localhost:3000", { path: "/car" });

socket.on("id", payload => {
  console.log("id", payload);
  id = payload;
});

socket.on("pickup", payload => {
  console.log("passenger", payload);
});

import { drawBoundingBox, drawKeypoints, drawSkeleton } from "./demo_util";

const videoWidth = 600;
const videoHeight = 500;
const stats = new Stats();
let lastCallTime = -60000;
const rightMP3 = require("./sound/right.mp3");
const nextMP3 = require("./sound/next.mp3");
let switchBool = true;
let samePose = false;
let previousDetectedPose = [];
const minPoseSimilarityScore = 3300;

// state for time detection of constant action, array of true and false values
let frameStateBooleanArray = [];
let frameID = 0;
const framesToCheck = 20;

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  const video = document.getElementById("video");
  video.width = videoWidth;
  video.height = videoHeight;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight
    }
  });
  video.srcObject = stream;

  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

const guiState = {
  algorithm: "multi-pose",
  input: {
    mobileNetArchitecture: isMobile() ? "0.50" : "0.75",
    outputStride: 16,
    imageScaleFactor: 0.5
  },
  singlePoseDetection: {
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5
  },
  multiPoseDetection: {
    maxPoseDetections: 5,
    minPoseConfidence: 0.15,
    minPartConfidence: 0.1,
    nmsRadius: 30.0
  },
  output: {
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    showBoundingBox: false
  },
  net: null
};

/**
 * Sets up dat.gui controller on the top-right of the window
 */
function setupGui(cameras, net) {
  guiState.net = net;

  if (cameras.length > 0) {
    guiState.camera = cameras[0].deviceId;
  }

  const gui = new dat.GUI({ width: 300 });

  // The single-pose algorithm is faster and simpler but requires only one
  // person to be in the frame or results will be innaccurate. Multi-pose works
  // for more than 1 person
  const algorithmController = gui.add(guiState, "algorithm", [
    "single-pose",
    "multi-pose"
  ]);

  // The input parameters have the most effect on accuracy and speed of the
  // network
  let input = gui.addFolder("Input");
  // Architecture: there are a few PoseNet models varying in size and
  // accuracy. 1.01 is the largest, but will be the slowest. 0.50 is the
  // fastest, but least accurate.
  const architectureController = input.add(
    guiState.input,
    "mobileNetArchitecture",
    ["1.01", "1.00", "0.75", "0.50"]
  );
  // Output stride:  Internally, this parameter affects the height and width of
  // the layers in the neural network. The lower the value of the output stride
  // the higher the accuracy but slower the speed, the higher the value the
  // faster the speed but lower the accuracy.
  input.add(guiState.input, "outputStride", [8, 16, 32]);
  // Image scale factor: What to scale the image by before feeding it through
  // the network.
  input
    .add(guiState.input, "imageScaleFactor")
    .min(0.2)
    .max(1.0);
  input.open();

  // Pose confidence: the overall confidence in the estimation of a person's
  // pose (i.e. a person detected in a frame)
  // Min part confidence: the confidence that a particular estimated keypoint
  // position is accurate (i.e. the elbow's position)
  let single = gui.addFolder("Single Pose Detection");
  single.add(guiState.singlePoseDetection, "minPoseConfidence", 0.0, 1.0);
  single.add(guiState.singlePoseDetection, "minPartConfidence", 0.0, 1.0);

  let multi = gui.addFolder("Multi Pose Detection");
  multi
    .add(guiState.multiPoseDetection, "maxPoseDetections")
    .min(1)
    .max(20)
    .step(1);
  multi.add(guiState.multiPoseDetection, "minPoseConfidence", 0.0, 1.0);
  multi.add(guiState.multiPoseDetection, "minPartConfidence", 0.0, 1.0);
  // nms Radius: controls the minimum distance between poses that are returned
  // defaults to 20, which is probably fine for most use cases
  multi
    .add(guiState.multiPoseDetection, "nmsRadius")
    .min(0.0)
    .max(40.0);
  multi.open();

  let output = gui.addFolder("Output");
  output.add(guiState.output, "showVideo");
  output.add(guiState.output, "showSkeleton");
  output.add(guiState.output, "showPoints");
  output.add(guiState.output, "showBoundingBox");
  output.open();

  architectureController.onChange(function(architecture) {
    guiState.changeToArchitecture = architecture;
  });

  algorithmController.onChange(function(value) {
    switch (guiState.algorithm) {
      case "single-pose":
        multi.close();
        single.open();
        break;
      case "multi-pose":
        single.close();
        multi.open();
        break;
    }
  });
}

/**
 * Sets up a frames per second panel on the top-left of the window
 */
function setupFPS() {
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);
}

/**
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */

function eucl_dist(keypoint1, keypoint2) {
  Math.sqrt(
    Math.pow(keypoint1.position.x - keypoint2.position.x, 2) +
      Math.pow(keypoint1.position.y - keypoint2.position.y, 2)
  );
}

// weightedDistance
// poseVector1 and poseVector2 are 52-float vectors composed of:
// Values 0-33: are x,y coordinates for 17 body parts in alphabetical order
// Values 34-51: are confidence values for each of the 17 body parts in alphabetical order
// Value 51: A sum of all the confidence values
// Again the lower the number, the closer the distance
function weightedDistanceMatching(pose1, pose2) {

  let vector1PoseX = pose1.keypoints.map(a => a.position.x);
  let vector1PoseY = pose1.keypoints.map(a => a.position.y);

  let vector1Confidences = pose1.keypoints.map(a => a.score);
  let vector1ConfidenceSum = pose1.score

  let vector2PoseX = pose2.keypoints.map(a => a.position.x);
  let vector2PoseY = pose2.keypoints.map(a => a.position.y);

  let summation2 = 0;

  for (let i = 0; i < 17; i++) {
     summation2 += vector1Confidences[i] * (Math.abs(vector1PoseX[i] - vector2PoseX[i]) + Math.abs(vector1PoseY[i] - vector2PoseY[i]));
    }

  const weightedDistance = (1 / vector1ConfidenceSum * summation2);
  //console.log(weightedDistance);

  return weightedDistance;
}

// detect pose
function detectPoseInRealTime(video, net) {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");
  // since images are being fed from a webcam
  const flipHorizontal = true;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    if (guiState.changeToArchitecture) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose();

      // Load the PoseNet model weights for either the 0.50, 0.75, 1.00, or 1.01
      // version
      guiState.net = await posenet.load(+guiState.changeToArchitecture);

      guiState.changeToArchitecture = null;
    }

    // Begin monitoring code for frames per second
    stats.begin();

    // Scale an image down to a certain factor. Too large of an image will slow
    // down the GPU
    const imageScaleFactor = guiState.input.imageScaleFactor;
    const outputStride = +guiState.input.outputStride;

    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;
    switch (guiState.algorithm) {
      case "single-pose":
        const pose = await guiState.net.estimateSinglePose(
          video,
          imageScaleFactor,
          flipHorizontal,
          outputStride
        );
        poses.push(pose);

        minPoseConfidence = +guiState.singlePoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.singlePoseDetection.minPartConfidence;
        break;
      case "multi-pose":
        poses = await guiState.net.estimateMultiplePoses(
          video,
          imageScaleFactor,
          flipHorizontal,
          outputStride,
          guiState.multiPoseDetection.maxPoseDetections,
          guiState.multiPoseDetection.minPartConfidence,
          guiState.multiPoseDetection.nmsRadius
        );

        minPoseConfidence = +guiState.multiPoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.multiPoseDetection.minPartConfidence;
        break;
    }

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (guiState.output.showVideo) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-videoWidth, 0);
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      ctx.restore();
    }

    // For each pose (i.e. person) detected in an image, loop through the poses
    // and draw the resulting skeleton and keypoints if over certain confidence
    // scores

    let detectedPoses = poses.length;
    let roundID = 1;
    let resetPose = true;

    poses.forEach(({ score, keypoints }) => {
      if (score >= minPoseConfidence) {
      let color = "aqua";

      // 0 (nose)
      //left: 5 (shoulder), 7 (elbow), 9 (wrist) --- 1, (eye), 3 (ear),
      //right: 6 (shoulder), 8 (elbow), 10 (wrist) --- 2(eye),4 (ear),

      const armLength =
        eucl_dist(keypoints[5], keypoints[7]) +
        eucl_dist(keypoints[7], keypoints[9]);
      const distanceXShoulderToWrist = Math.max(
        keypoints[9].position.x - keypoints[5].position.x,
        keypoints[6].position.x - keypoints[10].position.x
      );
      const armsReachedOut = distanceXShoulderToWrist > 0.8 * armLength;

      const distanceYShoulderToNose = Math.abs(
        keypoints[0].position.y -
          0.5 * (keypoints[5].position.y + keypoints[6].position.y)
      );
      const gestureAccepted =
        Math.max(
          Math.abs(keypoints[9].position.x - keypoints[0].position.x),
          keypoints[10].position.x - keypoints[0].position.x
        ) > distanceYShoulderToNose;

      const noseDetected = keypoints[0].score > minPartConfidence;
      const eyesDetected =
        keypoints[1].score > minPartConfidence &&
        keypoints[2].score > minPartConfidence;

      const wristAboveShoulder =
        Math.min(keypoints[5].position.y, keypoints[6].position.y) >
        Math.min(keypoints[10].position.y, keypoints[9].position.y);

      const scoreHighEnough = ( (Math.min(keypoints[5].score, keypoints[6].score) + Math.min(keypoints[9].score, keypoints[10].score)) > 0.5);

      if (
        scoreHighEnough &&
        noseDetected &&
        eyesDetected &&
        (wristAboveShoulder || armsReachedOut) &&
        gestureAccepted
      ) {
        color = "orange";
        frameStateBooleanArray[frameID] = 1;
      } else {
        frameStateBooleanArray[frameID] = 0;
      }

      let averageTimeDetectionState =
        frameStateBooleanArray.reduce((a, b) => a + b, 0) /
        frameStateBooleanArray.length;

      // check pose
      const currentPose = {score, keypoints};

      if (previousDetectedPose.hasOwnProperty("score")) {
        samePose = (minPoseSimilarityScore >= weightedDistanceMatching(currentPose, previousDetectedPose));
        if (samePose) {
          console.log("SAME POSE DETECTED");
          color = "red";
          previousDetectedPose = currentPose;
        }
      }

      if (
        (averageTimeDetectionState >
        0.8 / detectedPoses + 0.05 * (detectedPoses - 1) )
        // && (samePose)
      ) {
        // new person detected that wants to hail a stride

        // set api timeout time
        let d = new Date();
        const timeCurrent = d.getTime();
        // api call
        if (( (lastCallTime + 10*1000) <  timeCurrent) && !samePose) {
          // first detection!
          // update color
          color = "red";

          // audio
          switchBool = !switchBool;
          if (switchBool) {
            new Audio(nextMP3).play();

            // send API
            const data = {
              colorHist: 11,
              pos: { lat: 48.263147, lng: 11.670846 }
            };
            postData(
              `http://localhost:3000/waitingPassenger`,
              JSON.stringify(data)
            )
              .then(data => console.log("POST REQUEST SENT TO API")) // JSON-string from `response.json()` call
              .catch(error => console.error(error));
          } else {
            new Audio(rightMP3).play();
            socket.emit("status", {
              state: "BUSY",
              pos: { lat: 48.263147, lng: 11.670846 }
            });
          }

          // timeout for API
          d = new Date();
          lastCallTime = d.getTime();

          // show visuals
          document.getElementById('detection').style.display = 'block';

          // update pose
          previousDetectedPose = currentPose;

        } else {
          if (!samePose) {console.log("WE WONT CALL YOU TWO TAXIS! SAME POSE!");}
          else {console.log("API is NOT ready! Still in timeout.");}
        }
      }

      // delete visuals
      const d2 = new Date();
      const timeCurrentFrame = d2.getTime();
      if (lastCallTime + 2000 < timeCurrentFrame) {
        document.getElementById("detection").style.display = "none";
      }

      // update Frame ID
      frameID++;
      if (frameID > framesToCheck) {
        frameID = 0;
      }

      // draw skeletton

        if (guiState.output.showPoints) {
          drawKeypoints(keypoints, minPartConfidence, ctx);
        }
        if (guiState.output.showSkeleton) {
          drawSkeleton(keypoints, minPartConfidence, ctx, color);
        }
        if (guiState.output.showBoundingBox) {
          drawBoundingBox(keypoints, ctx);
        }
        // if there is no color = red in all rounds we lost our tracking and neet to reset the poses
        if (color == "red") {
            resetPose = false;
        }
        if ((roundID == detectedPoses) && (resetPose)) {
          previousDetectedPose = [];
        }
      }
      roundID++;
    });
    // End monitoring code for frames per second
    stats.end();

    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}

// api call
function postData(url = ``, data = {}) {
  // Default options are marked with *
  return fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    //mode: "cors", // no-cors, cors, *same-origin
    //cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    //credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json; charset=utf-8"
      // "Content-Type": "application/x-www-form-urlencoded",
    },
    //redirect: "follow", // manual, *follow, error
    //referrer: "no-referrer", // no-referrer, *client
    body: data // body data type must match "Content-Type" header
  });
  //.then(response => response.json()); // parses response to JSON
}

/**
 * Kicks off the demo by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
export async function bindPage() {
  // Load the PoseNet model weights with architecture 0.75
  const net = await posenet.load(0.75);

  document.getElementById("loading").style.display = "none";
  document.getElementById("main").style.display = "block";

  let video;

  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById("info");
    info.textContent =
      "this browser does not support video capture," +
      "or this device does not have a camera";
    info.style.display = "block";
    throw e;
  }

  setupGui([], net);
  setupFPS();
  detectPoseInRealTime(video, net);
}

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;
// kick off the demo
bindPage();
