/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */
var fs = require('fs'),
	util = require('util'),
	stn = require('stn'),
	text,
	results;

text = fs.readFileSync('test-samples/timesheet-1.txt');
results = stn.parse(text, {normalize_date: true, hours: true, tags: true});
console.log(util.inspect(results, false, 4));
