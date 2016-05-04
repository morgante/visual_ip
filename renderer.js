var _ = require("lodash");

function renderLetters(letters) {
	if (letters.length < 1) {
		letters = ["&nbsp;"];
	} else {
		letters = _.map(letters, function(code) {
			var char = String.fromCharCode(code);
			return char;
		});
	}
	var html = _.map(letters, function(letter) {
		return "<span>" + letter + "</span>";
	});
	$("#input-letters").html(html);
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
