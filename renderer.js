var _ = require("lodash");
const ipcRenderer = require('electron').ipcRenderer;

var globalLetters = [];

function renderLetters(charcodes) {
	var letters;
	if (charcodes.length < 1) {
		letters = ["&nbsp;"];
	} else {
		letters = _.map(charcodes, function(code) {
			var char = String.fromCharCode(code);
			return char;
		});
	}
	var html = _.map(letters, function(letter) {
		return "<span>" + letter + "</span>";
	});
	$("#input-letters").html(html);

	var html2 = _.map(charcodes, function(code) {
		return "<span>" + code + "</span>";
	});
	$("#output-letters").html(html2);

	ipcRenderer.send('set_input', charcodes);

	$(".type").show();
	$(".receive").hide();
}

function renderInput(charcodes) {
	globalLetters = [];
	renderLetters(charcodes);
	$(".type").hide();
	$(".receive").show();
}

$(document).ready(function() {
	$(document).on("keyup", function(evt) {
		console.log("evt", evt);
		if (evt.keyCode === 8) {
			globalLetters.pop();
		} else if (evt.keyCode >= 65 && evt.keyCode <= 90) {
			globalLetters.push(evt.keyCode);
		}
		renderLetters(globalLetters);
	});
	$(".receive").hide();
});

ipcRenderer.on('sent_input', function(event, arg) {
  console.log(arg); // prints "pong"
  globalLetters = [];
  renderLetters([]);
  alert("Your message has been sent.");
});

ipcRenderer.on('alert', function(event, arg) {
  console.log(arg); // prints "pong"
  alert(arg);
});

ipcRenderer.on('receive_data', function(event, arg) {
  console.log('received', arg); // prints "pong"
  renderInput(arg.text);
});
