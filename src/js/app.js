$(function() {
	var diff = require( "./htmldiff.js" );
	var block1 = $("#block1").html(),
		block2 = $("#block2").html();

	var theDiff = (diff(block1, block2));
	$("#diff").html(theDiff);
});