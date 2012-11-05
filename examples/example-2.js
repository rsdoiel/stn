/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */
var fs = require('fs'),
	util = require('util'),
	stn = require("../stn"),
	timesheet = new stn.Stn(),
	text,
	map,
	results;

// Set to save_parse = true
text = fs.readFileSync('test-samples/timesheet-1.txt').toString();
timesheet.reset({tags: true});
timesheet.parse(text);
text = fs.readFileSync('test-samples/timesheet-2.txt').toString();
// Parse some more data.
timesheet.parse(text);
console.log(timesheet.toString());

