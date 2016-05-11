var _ = require("lodash");

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
}

$(document).ready(function() {
	var letters = [];
	$(document).on("keyup", function(evt) {
		console.log("evt", evt);
		if (evt.keyCode === 8) {
			letters.pop();
		} else if (evt.keyCode >= 65 && evt.keyCode <= 90) {
			letters.push(evt.keyCode);
		}
		renderLetters(letters);
	});
});
