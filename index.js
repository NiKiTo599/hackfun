const audio = document.getElementById('audio');
const container = document.querySelector('.container');

function update(data) {
  // здесь вычисляем типа некое среднее для показа
  let avg = data.reduce((a, b) => a + b, 0) / data.length;

  if (avg > 60) {
    // рисуем элемент. тут будем отправлять событие в канвас
    const box = document.createElement('div');
    box.style.width = '50px';
    box.style.height = avg + 'px';
    box.style.background = 'black';
    container.append(box);
  }
  console.log('>>>>', avg);
}

function createAudioBufferFromFile(input) {
  let fileToProcess = new FileReader();
  fileToProcess.readAsArrayBuffer(input.files[0]);
  fileURL = blob.createObjectURL(input.files[0]);
  audio.src = fileURL;

  fileToProcess.onload = () => {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;
    const node = context.createScriptProcessor(2048, 1, 1);

    bands = new Uint8Array(analyser.frequencyBinCount);

    audio.addEventListener('canplay', function () {
      source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(node);
      node.connect(context.destination);
      source.connect(context.destination);
      node.onaudioprocess = function () {
        analyser.getByteFrequencyData(bands);
        if (!audio.paused) {
          update(bands);
        }
      };
    });
  };
}

document.getElementById('file').addEventListener('change', function (event) {
  createAudioBufferFromFile(event.target);
});
