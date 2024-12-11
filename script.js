document.addEventListener("DOMContentLoaded", function () {
  const recordButton = document.getElementById("recordButton");
  const stopButton = document.getElementById("stopButton");
  const sendButton = document.getElementById("sendButton");
  const emailOptions = document.getElementById("emailOptions");
  const emailInput = document.getElementById("email");
  const timeSelect = document.getElementById("time");
  const statusText = document.getElementById("statusText");

  let mediaRecorder;
  let recordedChunks = [];
  let audioBlob;
  let stream = null;
  let isRecording = false;

  // Button event listeners
  recordButton.addEventListener("click", () => toggleRecording());
  stopButton.addEventListener("click", () => stopRecording());
  sendButton.addEventListener("click", () => sendEmail());

  function toggleRecording() {
    if (!isRecording) {
      // Request user permission for microphone access
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(userStream => {
          stream = userStream;
          mediaRecorder = new MediaRecorder(stream);
          recordedChunks = []; // Reset the chunks for a new recording

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
          recordButton.disabled = true; // Disable record button while recording
          emailOptions.style.display = "none";
          isRecording = true;
        })
        .catch(error => {
          console.error("Error accessing microphone:", error);
          statusText.textContent = "Microphone access denied. Please enable it to record.";
        });
    }
  }

  function stopRecording() {
    if (isRecording) {
      mediaRecorder.stop();
      isRecording = false;

      statusText.textContent = "Recording stopped. Enter details to send.";
      stopButton.disabled = true;
      recordButton.disabled = false; // Enable record button again
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

    // Parse time value for display
    const timeMessage = parseTimeMessage(time);

    // Display success message
    statusText.textContent = `Your message has been sent to you in ${timeMessage}. Thank you!`;
    emailOptions.style.display = "none";
  }

  function parseTimeMessage(time) {
    switch (time) {
      case "5m":
        return "5 minutes";
      case "5y":
        return "5 years";
      case "10y":
        return "10 years";
      case "15y":
        return "15 years";
      case "25y":
        return "25 years";
      case "50y":
        return "50 years";
      case "75y":
        return "75 years";
      default:
        return "the future";
    }
  }
});
