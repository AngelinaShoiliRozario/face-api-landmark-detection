const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(webCam);

function webCam() {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: false,
    })
    .then((stream) => {
      video.srcObject = stream;
      const videoTrack = stream.getVideoTracks()[0];
      const { width, height } = videoTrack.getSettings();
      console.log("Video width:", width);
      console.log("Video height:", height);
      // alert(`Video ${width} x ${height}`);

      console.log(`Video ${width} x ${height}`);
      video.height = height;
      video.width = width;
    })
    .catch((error) => {
      console.log(error);
    });
}

// video.addEventListener("play", () => {
//   const canvas = faceapi.createCanvasFromMedia(video);
//   document.body.append(canvas);

//   faceapi.matchDimensions(canvas, { height: video.height, width: video.width });

//   setInterval(async () => {
//     const detection = await faceapi
//       .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//       .withFaceLandmarks()
//       .withFaceExpressions().withAgeAndGender();
//     canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

//     const resizedWindow = faceapi.resizeResults(detection, {
//       height: video.height,
//       width: video.width,
//     });

//     faceapi.draw.drawDetections(canvas, resizedWindow);
//     faceapi.draw.drawFaceLandmarks(canvas, resizedWindow);
//     faceapi.draw.drawFaceExpressions(canvas, resizedWindow);

//     resizedWindow.forEach((detection) => {
//       const box = detection.detection.box;
//       const drawBox = new faceapi.draw.DrawBox(box, {
//         label: Math.round(detection.age) + " year old " + detection.gender,
//       });
//       drawBox.draw(canvas);
//     });

//     console.log(detection);
//   }, 100);
// });


video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);

  faceapi.matchDimensions(canvas, { height: video.height, width: video.width });

  setInterval(async () => {
    const detection = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions().withAgeAndGender();
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    const resizedWindow = faceapi.resizeResults(detection, {
      height: video.height,
      width: video.width,
    });
    

    video.style.transform = "scaleX(-1)";
    canvas.style.transform = "scaleX(-1)";
    // Flip the canvas horizontally
    canvas.style.webkitTransform = "scaleX(-1)";
    canvas.style.msTransform = "scaleX(-1)";

    faceapi.draw.drawDetections(canvas, resizedWindow);
    faceapi.draw.drawFaceLandmarks(canvas, resizedWindow);
    faceapi.draw.drawFaceExpressions(canvas, resizedWindow);

    resizedWindow.forEach((detection) => {
      const box = detection.detection.box;
      // Adjust the label position for mirrored image
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: Math.round(detection.age) + " year old " + detection.gender,
      });
      drawBox.draw(canvas);

      const landmarks = detection.landmarks;

      // Get the center points of each eye
      // const leftEye = landmarks.getLeftEye()[1];
      // const rightEye = landmarks.getRightEye()[1];
      // console.log(leftEye, rightEye);
      const leftEyePoints = landmarks.getLeftEye();
      const rightEyePoints = landmarks.getRightEye();

      // Calculate the center of the left eye
      const leftEyeCenter = calculateCenter(leftEyePoints);
      // Calculate the center of the right eye
      const rightEyeCenter = calculateCenter(rightEyePoints);

      let  leftEye = leftEyeCenter;
      let  rightEye = rightEyeCenter;

      // Draw circles at the center of each eye
      drawCircle(canvas, leftEye);
      drawCircle(canvas, rightEye);
    });

    // console.log(detection);
  }, 100);
});

function calculateCenter(points) {
  let centerX = 0;
  let centerY = 0;

  points.forEach(point => {
    centerX += point.x;
    centerY += point.y;
  });

  centerX /= points.length;
  centerY /= points.length;

  return { x: centerX, y: centerY };
}

function drawCircle(canvas, point) {
  const context = canvas.getContext("2d");
  context.beginPath();
  context.arc(point.x, point.y, 3, 0, 2 * Math.PI);
  context.fillStyle = "red";
  context.fill();
}
