const electron = require("electron");
const audio = require("win-audio").speaker;

const { ipcRenderer } = electron;

var slider = document.getElementById("slider");
var currentVolumeSlider = document.getElementById("current-volume-slider");

let min = 0,
  max = 100;
current = audio.get();
// sending request to send info at startup

ipcRenderer.on("start-values", function(e, item) {
  // console.log("from html file", item);
  min = item[0];
  max = item[1];
  document.getElementById("value-1").innerText = item[0];
  document.getElementById("value-2").innerText = item[1];
  slider.noUiSlider.set([min, max]);
});
ipcRenderer.on("current-volume", function(e, item) {
  // console.log("from html file", item);
  currentVolumeSlider.noUiSlider.set(item);

});
ipcRenderer.send("retrieve-initial-info", true);
// console.log("!!");
// slider for limit volume
noUiSlider.create(slider, {
  start: [0, 100],
  step: 1,
  connect: true,
  // tooltips: true,
  format: wNumb({
    decimals: 0
  }),
  range: {
    min: 0,
    max: 100
  }
  // tooltips: true,
});
// slider for current volume
noUiSlider.create(currentVolumeSlider, {
  start: [0],
  step: 1,
  connect: true,
  connect: [true, false],
  // tooltips: true,
  format: wNumb({
    decimals: 0
  }),
  range: {
    min: 0,
    max: 100
  },
  tooltips: true,
  // pips: {mode: 'count', values: 2}
  // tooltips: true,
});
slider.noUiSlider.on("update", function(values, handle) {
  // console.log(values, handle);
  document.getElementById("value-1").innerText =
    "MIN : " + Math.trunc(values[0]);
  document.getElementById("value-2").innerText =
    "MAX : " + Math.trunc(values[1]);
  min = Math.trunc(values[0]);
  max = Math.trunc(values[1]);
});

document
  .getElementById("submit-button")
  .addEventListener("click", function(event) {
    //sending value to mainJs

    ipcRenderer.send("values", [min, max]);
  });
document
  .getElementById("clear-button")
  .addEventListener("click", function(event) {
    //sending value to mainJs

    ipcRenderer.send("clear", true);
  });
document
  .getElementById("close-icon")
  .addEventListener("click", function(event) {
    //sending value to mainJs
    ipcRenderer.send("close", true);
  });
// for current volume slider
currentVolumeSlider.noUiSlider.set(audio.get());
currentVolumeSlider.noUiSlider.on("update", function(values, handle) {
  // console.log("changed",current,parseInt(values[0]))
  if (current != parseInt(values[0])) {
    current = parseInt(values[0]);
    if (current <= min) {
      current = min;
      currentVolumeSlider.noUiSlider.set(current);
    }
    if (current >= max) {
      current = max;
      currentVolumeSlider.noUiSlider.set(current);
    }
    audio.set(current);
    //   currentVolumeSlider.noUiSlider.updateOptions({
    //     range: {
    //         'min': min,
    //         'max': max
    //     }
    // });

    // console.log();
  }
});
