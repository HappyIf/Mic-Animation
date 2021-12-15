function micFclick() {
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let distortion = audioCtx.createWaveShaper();
let gainNode = audioCtx.createGain();
let biquadFilter = audioCtx.createBiquadFilter();
let analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;

analyser.fftSize = 256;

const mic = document.querySelector('.mic');
let isListening = false;
let tracks = [];

if (!navigator.mediaDevices.getUserMedia) {
  alert('getUserMedia not supported on your browser!');
}

mic.addEventListener('click', async () => {
  if (!isListening) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      isListening = true;

      tracks = stream.getTracks();
      source = audioCtx.createMediaStreamSource(stream);
      source.connect(distortion);
      distortion.connect(biquadFilter);
      biquadFilter.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(audioCtx.destination);

      requestAnimationFrame(function log() {
        let bufferLength = analyser.frequencyBinCount;
        let dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        const level = Math.max.apply(null, dataArray);
        document.querySelector('#level span').textContent = level;
        mic.style.setProperty('border', `${level / 5}px solid grey`);
        requestAnimationFrame(log);
      });
    } catch (err) {
      console.log('The following gUM error occured: ' + err);
    }
  } else {
    isListening = false;
    tracks.forEach((track) => {
      track.stop();
    });
  }
});
}

function onstart() {
  document.querySelector('.mic').removeAttribute("onclick");
  micFclick();
  document.querySelector('.mic').click();
}