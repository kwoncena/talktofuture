let mediaRecorder;
let recordedChunks = [];
let audioBlob;
let stream = null;
let isRecording = false;

// Set up D3 SVG container
const visualContainer = d3.select("#visualContainer")
  .append("svg")
  .attr("width", 800)
  .attr("height", 400);

document.addEventListener("DOMContentLoaded", function () {
  const recordButton = document.getElementById("recordButton");
  const stopButton = document.getElementById("stopButton");
  const sendButton = document.getElementById("sendButton");
  const emailOptions = document.getElementById("emailOptions");
  const emailInput = document.getElementById("email");
  const timeSelect = document.getElementById("time");
  const statusText = document.getElementById("statusText");

  // Button event listeners
  recordButton.addEventListener("click", () => toggleRecording());
  stopButton.addEventListener("click", () => stopRecording());
  sendButton.addEventListener("click", () => sendEmail());

  function toggleRecording() {
    if (!isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(userStream => {
          stream = userStream;
          mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();

          mediaRecorder.ondataavailable = function (e) {
            recordedChunks.push(e.data);
          };

          mediaRecorder.onstop = function () {
            audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
            sendButton.disabled = false;
          };

          statusText.textContent = "Recording in progress... Speak!";
          stopButton.disabled = false;
          emailOptions.style.display = "none";
        })
        .catch(error => console.error("Error accessing microphone:", error));

      isRecording = true;
    }
  }

  function stopRecording() {
    if (isRecording) {
      mediaRecorder.stop();
      isRecording = false;
      statusText.textContent = "Recording stopped. Enter details to send.";
      stopButton.disabled = true;
      emailOptions.style.display = "block";

      // Stop microphone access
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }

  function sendEmail() {
    const email = emailInput.value;
    const time = timeSelect.value;

    if (!email || !audioBlob) {
      alert("Please provide a valid email and complete a recording.");
      return;
    }

    // Simulate sending to backend
    const formData = new FormData();
    formData.append("email", email);
    formData.append("time", time);
    formData.append("audio", audioBlob);

    fetch("https://your-backend-service.com/schedule-email", {
      method: "POST",
      body: formData,
    })
      .then(response => {
        if (response.ok) {
          statusText.textContent = `Your voice will be sent in ${time}!`;
          emailOptions.style.display = "none";
        } else {
          throw new Error("Failed to schedule email.");
        }
      })
      .catch(error => console.error("Error sending email:", error));
  }
});
