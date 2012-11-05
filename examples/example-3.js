/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */
var fs = require('fs'),
	util = require('util'),
	stn = require("../stn"),
	timesheet = new stn.Stn(),
	text,
	map,
	results,
	now = new Date(),
	line
	yesterday = new Date([
		now.getFullYear(), 
		String("0" + (now.getMonth() + 1)).substr(-2), 
		String("0" + now.getDate()).substr(-2)
	].join("-"));

// Set to save_parse = true, normalize_date = true, tags = true
timesheet.reset();
// Read in the initial data set
text = fs.readFileSync('test-samples/timesheet-2.txt').toString();
// Parse some more data.
timesheet.parse(text);
// Add an entry with explicit fields
timesheet.addEntry({date: now, start: Number(now.getTime() - 100000), end: now, tags: ["demo"], notes: "This is me, using this software."});

/* We can also add entries by passing short strings. 
	Let's try something like
	
	2012-11-03
	
	08:00 - 9:00; staff meeting
*/

line = "2012-11-03";
timesheet.addEntry(line);
line = "08:00 - 9:00; staff meeting";
timesheet.addEntry(line);
// How let's display the revised contents based on
// the toString() rendering
console.log(timesheet.toString());
console.log("");

