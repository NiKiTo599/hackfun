const audio = document.getElementById('audio');
const container = document.querySelector('.container');
let source;
let buffer;

const getPeak = () => {
  let prev = 0;
  let prevprev = 0;

  return (buffer) => {
    let result = false;
    const current = buffer[0] + buffer[1] + buffer[2];

    if (prev > current + 50 && prev > current + 50) {
      result = true;
    }

    prevprev = prev;
    prev = current;

    return result;
  };
};

const g = getPeak();

const isBass = (buffer) => {
    const low = buffer[0] >= 240 && buffer[1] >= 220 && buffer[2] > 150 && buffer[3] > 100 && buffer[4] > 60;
    const hight = buffer[15] === 0 && buffer[14] === 0 && buffer[13] > 0;

    return hight && low;
}

function update() {
  let avg = buffer.reduce((a, b) => a + b, 0) / buffer.length;

  console.log(buffer.toString(), isBass(buffer))

  if (isBass(buffer) || avg > 170 || g(buffer)) {
    window.dispatchEvent(new CustomEvent('CREATE', {
        detail: { value: avg / 200 }
    }));
  }
}

function createAudioBufferFromFile(input) {
  let fileToProcess = new FileReader();
  fileToProcess.readAsArrayBuffer(input.files[0]);
  fileURL = blob.createObjectURL(input.files[0]);
  audio.src = fileURL;

  fileToProcess.onload = (b, t) => {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.1;
    analyser.fftSize = 32;
    const node = context.createScriptProcessor(2048, 1, 1);

    buffer = new Uint8Array(analyser.frequencyBinCount);

    audio.addEventListener('canplay', function () {
      if (!source) {
        source = context.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(node);
        node.connect(context.destination);
        source.connect(context.destination);

        node.onaudioprocess = function () {
          analyser.getByteFrequencyData(buffer);
          if (!audio.paused) {
            return update();
          }
        };
      }
    });
  };
}

var blob = window.URL || window.webkitURL;
if (!blob) {
  console.log('Your browser does not support Blob URLs :(');
}

document.getElementById('file').addEventListener('change', function (event) {
  createAudioBufferFromFile(event.target);
});
