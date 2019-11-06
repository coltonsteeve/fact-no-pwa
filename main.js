var color = {};

//Convert RGB to Hex
var rgbToHex = function (rgb) { 
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
};

//Get full hex string
var fullColorHex = function(r,g,b) {   
  var red = rgbToHex(r);
  var green = rgbToHex(g);
  var blue = rgbToHex(b);
  return red+green+blue;
};

// define handler
const updateColor = () => {
  r = parseInt(document.querySelector('#red').value)
  g = parseInt(document.querySelector('#green').value)
  b = parseInt(document.querySelector('#blue').value)
  const canvasElement = document.querySelector('#canvas')
  canvasElement.style.backgroundColor = `rgb(${r},${g},${b})`
  canvasElement.style.border = "thin solid black"
  document.querySelector('#hex').innerHTML = "#" + fullColorHex(r,g,b)
}


// configure event listeners
document.querySelector('#red').addEventListener('click', updateColor)
document.querySelector('#blue').addEventListener('click', updateColor)
document.querySelector('#green').addEventListener('click', updateColor)
document.querySelector('#red').addEventListener('touchend', updateColor)
document.querySelector('#blue').addEventListener('touchend', updateColor)
document.querySelector('#green').addEventListener('touchend', updateColor)

// call the handler 
updateColor() 