
// @ ALL GLOBAL VARIABLES
const video = document.getElementById("video");
var viewportWidth = window.innerWidth;
console.log("Viewport width in pixels: " + viewportWidth);
let newWidth, newHeight;

let circleLeftOd , circleTopOd , circleRightOd, circleBottomOd;

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
      console.log(`Video ${width} x ${height}`);
       newWidth = 0.9 * viewportWidth;
       newHeight = (newWidth * height) / width;
      video.height = newHeight;
      video.width = newWidth;
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


  video.style.transform = "scaleX(-1)";
  canvas.style.transform = "scaleX(-1)";
  canvas.style.webkitTransform = "scaleX(-1)";
  canvas.style.marginTop = "60px";
  canvas.style.msTransform = "scaleX(-1)";


  faceapi.matchDimensions(canvas, { height: newHeight, width: newWidth });

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
    

    // video.style.transform = "scaleX(-1)";
    // canvas.style.transform = "scaleX(-1)";
    // // Flip the canvas horizontally
    // canvas.style.webkitTransform = "scaleX(-1)";
    // canvas.style.marginTop = "60px";
    // canvas.style.msTransform = "scaleX(-1)";


    // faceapi.draw.drawDetections(canvas, resizedWindow);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedWindow);
    // faceapi.draw.drawFaceExpressions(canvas, resizedWindow);

    resizedWindow.forEach((detection) => {
      const box = detection.detection.box;
     
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: Math.round(detection.age) + " year old " + detection.gender,
      });
      drawBox.draw(canvas);

      const landmarks = detection.landmarks;



      const leftEyePoints = landmarks.getLeftEye();
      const rightEyePoints = landmarks.getRightEye();


      const leftEyeCenter = calculateCenter(leftEyePoints);
      const rightEyeCenter = calculateCenter(rightEyePoints);

      let  leftEye = leftEyeCenter;
      let  rightEye = rightEyeCenter;

      // Draw circles at the center of each eye
      drawCircle(canvas, leftEye, 'red');
      drawCircle(canvas, rightEye,'red');

      // @NOTE: Getting Jawline co-ordinates
      const jawline = landmarks.getJawOutline(); 

      // @NOTE: Getting first and last jawline
      const leftJawPoint = jawline[0];
      const rightJawPoint = jawline[jawline.length - 1];

      // @NOTE: Drawing a circle on the jaws
      drawCircle(canvas, leftJawPoint, 'yellow');
      drawCircle(canvas, rightJawPoint, 'yellow');
     

      const nose = landmarks.getNose();
      drawCircle(canvas, nose[0], 'yellow');
      drawCircle(canvas, nose[1], 'yellow');
      drawCircle(canvas, nose[2], 'yellow');
      drawCircle(canvas, nose[3], 'yellow'); //nose tip
      drawCircle(canvas, nose[6], 'yellow');


      const mouth = landmarks.getMouth();
      drawCircle(canvas, mouth[3], 'orange');
      drawCircle(canvas, mouth[9], 'orange');
      drawCircle(canvas, mouth[14], 'orange');
      drawCircle(canvas, mouth[18], 'orange');

      if(leftEye.y && rightEye.y){
        let diff = Math.abs(leftEye.y - rightEye.y);

        let diff2 = Math.abs(nose[2].x - mouth[3].x);

        let noseTip = nose[3];
        let noseStart = nose[0];
        let mouthIndex = mouth[3];

        let diff3 = Math.abs(noseTip.x - noseStart.x);
        let diff4 = Math.abs(noseStart.x - mouthIndex.x);
        
        let diff5, diff6;
        if(leftJawPoint && circleLeftOd){
          diff5 = Math.abs(leftJawPoint.x - circleLeftOd.x);
          diff6 = Math.abs(rightJawPoint.x - circleRightOd.x);
        }

        // console.log(leftJawPoint.x, circleLeftOd.x);
        console.log(diff5, diff6);


        let p = document.querySelector('p');
        if(diff<=5 && diff2 <=5 && diff3 <=5 && diff4 <=5        && diff5 <=15 && diff6 <=15){
          p.textContent = 'FACE ALIGNED';
        }else{
          p.textContent = 'FACE NOT ALIGNED';
        }


      }


    });

    drawCircleInCenter(canvas); 

    // console.log(detection);
  }, 100);
});
function calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance;
}
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

function drawCircle(canvas, point, color) {
  const context = canvas.getContext("2d");
  context.beginPath();
  context.arc(point.x, point.y, 3, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
}
function calculateAngle(x1, y1, x2, y2) {
  const angleRadians = Math.atan2(y2 - y1, x2 - x1);
  const angleDegrees = angleRadians * 180 / Math.PI;
  return angleDegrees;
}

function drawCircleInCenter(canvas) {
  const context = canvas.getContext("2d");
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2; // Adjusted to be above the center
  const horizontalRadius = 80; // Adjust the horizontal radius as needed
  const verticalRadius = 120; // Adjust the vertical radius as needed

  context.beginPath();
  context.ellipse(centerX, centerY, horizontalRadius, verticalRadius, 0, 0, 2 * Math.PI);
  context.strokeStyle = "blue";
  context.lineWidth = 2;
  context.stroke();

  // Calculate rightmost and leftmost points
  const rightmostX = centerX + horizontalRadius;
  const leftmostX = centerX - horizontalRadius;


  circleRightOd = {x : rightmostX , y : centerY};
  circleLeftOd = {x:leftmostX , y:centerY};

}

