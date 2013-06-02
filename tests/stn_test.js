//
// stn-test.js - a JavaScript test module for processing plain text in 
// Simple Timesheet Notation
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under the Simplified BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

var	util = require('util'),
	fs = require('fs'),
	path = require("path"),
    Y = require("yui/test"),
    assert = Y.Assert,
	stn = require('../stn'),
	test_name = "tests/stn_test.js",
	sample1_text  = fs.readFileSync("test-samples/timesheet-1.txt").toString(),
	sample1a = JSON.parse(fs.readFileSync("test-samples/timesheet-1a.json").toString()),
	sample1b = JSON.parse(fs.readFileSync("test-samples/timesheet-1b.json").toString()),
	sample_map = JSON.parse(fs.readFileSync("test-samples/testmap.json").toString()),
	result;


try {
	test_name = module.filename;
} catch (err0) {
}

var basicTests = new Y.Test.Case({
    name: "Basic Tests",
    "Should pass basic setup": function () {
	var i,
		j,
		timesheet,
		testmap = sample_map,
		expected_tm = sample1a,
		tm,
		expected_dates,
		expected_ranges,
		dates,
		ranges,
		expected_s,
		s;
	
	// Call as simple function without callback or options
	timesheet = new stn.Stn({}, {
			normalize_date: false,
			hours: false,
			tags: false,
			map: false,
			save_parse: false
		});
	assert.isObject(timesheet.defaults, "Should have defaults in timesheet\n" +
		util.inspect(timesheet));
	assert.areEqual(timesheet.defaults.normalize_date, false, "Should have normalize_date set false" +
		util.inspect(timesheet));
	assert.areEqual(timesheet.defaults.hours, false, "Should have hours set false");
	assert.areEqual(timesheet.defaults.tags, false, "Should have tags set false");
	assert.areEqual(timesheet.defaults.map, false, "Should have map set false");
	assert.areEqual(timesheet.defaults.save_parse, false, "Should have save_parse set false");
	
	timesheet.parse(sample1_text);
	tm = timesheet.valueOf();
	assert.areEqual(Object.keys(tm).length, 0,
		"tm should be empty because valueOf() is empty when save_parse is false\n" +
		util.inspect(tm));
	// Now save the parse result since save_parse is false 
	tm = timesheet.parse(sample1_text);
	assert.isObject(tm, "Should get a non-false tm from parsing sample1_text: " + stn.messages());

	// check for Missing results
	// now see parse trees match
	expected_dates = Object.keys(expected_tm);
	dates = Object.keys(tm.valueOf());
	assert.areEqual(dates.length, expected_dates.length, "Should have same number of dates\n" +
		util.inspect(dates) + "\n" + 
		util.inspect(expected_dates));

	expected_dates.forEach(function (dt, i) {
		assert.areEqual(dates.indexOf(dt), expected_dates.indexOf(dt), "Should have date " + dt +
			" at " + i + "\n" +
			util.inspect(dates) + "\n" +
			util.inspect(expected_dates));
		expected_ranges = Object.keys(expected_tm[dt]);
		ranges = Object.keys(tm[dt]);
		assert.areEqual(expected_ranges.length, ranges.length, "Should have the same number of ranges (" +
			dt + ", " + i + ")\n" +
			util.inspect(ranges) + "\n" + util.inspect(expected_ranges));
		expected_ranges.forEach(function (rng, j) {
			assert.areEqual(ranges.indexOf(rng), expected_ranges.indexOf(rng), "Should have same range " +
				rng + " at " + i + ", " + j);
			/*
			assert.isObject(tm[dt][rng].map, "Should have a map at " + dt + ", " + rng +
				"\n" + util.inspect(tm[dt][rng]));
			assert.isObject(tm[dt][rng].tags, "Should have a tags at " + dt + ", " + rng);
			*/
			assert.areEqual(tm[dt][rng].notes, expected_tm[dt][rng].notes, "Should have matching notes");
			assert.areEqual(tm[dt][rng].hours, expected_tm[dt][rng].hours, "Should have matching hours");
			
		});
	});
	expected_s = JSON.stringify(expected_tm);
	s = JSON.stringify(tm);
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);
		
	// Test the alternative JSON representation with normalized date, hours and tag extraction

	// Call as simple function without callback or options
	stn.defaults = {normalize_date: true, hours: true, tags: true, save_parse: false, map: false};
	result = stn.parse(sample1_text);
	assert.isObject(result, "Should get a non-false results from parsing sample1_text: " + stn.messages());

	// Check for missing results
	i = sample1b.length;
	j = result.length;
	Object.keys(sample1b).forEach(function (dy) {
		assert.areNotEqual(typeof result[dy], "undefined",
				  "missing from sample1b [" + dy + "] <-- [" + util.inspect(sample1b[dy]) + "]");
		Object.keys(sample1b[dy]).forEach(function (tm) {
			assert.areNotEqual(typeof result[dy][tm], "undefined",
					  'sample1b ' + dy + ' -> [' + tm + '] missing in result ' +
					  util.inspect(result[dy]));
			assert.areSame(sample1b[dy][tm].notes, result[dy][tm].notes,
					  'mrs notes ' + dy + ' ' + tm + ' -> [' +
					  sample1b[dy][tm].notes + '] !== [' + result[dy][tm].notes + ']');
			assert.areSame(Math.round(sample1b[dy][tm].hours), Math.round(result[dy][tm].hours),
					  'mrs hours ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].hours +
					  '] !== [' + result[dy][tm].hours + ']');
			assert.areSame(sample1b[dy][tm].tags.toString(), result[dy][tm].tags.toString(),
					  'mrs tags ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].tags.toString() +
					  '] !== [' + result[dy][tm].tags.toString() + ']');
			assert.areSame(result[dy][tm].map, false, "Should have result.map set to false.");
		});
	});
	assert.areEqual(i, j, "Missing results");
	
	// Check for unexpected results 
	i = Object.keys(sample1b).length;
	j = Object.keys(result).length;
	Object.keys(result).forEach(function (dy) {
		assert.areNotEqual(typeof sample1b[dy], "undefined",
				  "unexpected in result " + dy + " <-- " + util.inspect(result[dy]));
		Object.keys(result[dy]).forEach(function (tm) {
			assert.areNotEqual(typeof result[dy][tm], "undefined",
					  "result " + dy + ' -> ' + tm + " missing in simple1a " +
					  util.inspect(sample1b[dy]));
			assert.areSame(sample1b[dy][tm].notes, result[dy][tm].notes,
					  'urs notes ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].notes +
					  '] !== [' + result[dy][tm].notes + ']');
			assert.areSame(Math.round(sample1b[dy][tm].hours), Math.round(result[dy][tm].hours),
					  'urs hours ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].hours +
					  '] !== [' + result[dy][tm].hours + ']');
			assert.areSame(sample1b[dy][tm].tags.toString(), result[dy][tm].tags.toString(),
					  'urs tags ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].tags.toString() +
					  '] !== [' + result[dy][tm].tags.toString() + ']');
			assert.areSame(result[dy][tm].map, false,
							   "Should have result.map set to false.");
		});
	});
	assert.areEqual(i, j, "Missing or unexpected results");
}
});

var mapTests = new Y.Test.Case({
    name: "mapTests",
    "Should pass mapTests": function () {
	// Call as simple function without callback or options
	result = stn.parse(sample1_text, {map: sample_map});
	assert.areNotEqual(result, false, "Should get a non-false results from parsing sample1_text: " + stn.messages());
	Object.keys(result).forEach(function (dy) {
		assert.areNotEqual(typeof sample1b[dy], "undefined",
				  "unexpected in result " + dy + " <-- " + util.inspect(result[dy]));
		Object.keys(result[dy]).forEach(function (tm) {
			assert.areNotEqual(result[dy][tm].map, "undefined",
					  "result " + dy + ' -> ' + tm + ".map missing in simple1a " +
					  util.inspect(sample1b[dy]));
			if (result[dy][tm].map !== false) {
				assert.areNotEqual(typeof result[dy][tm].map.client_name, "undefined",
						  "result " + dy + ' -> ' + tm + ".map should have a client_name");
				assert.areNotEqual(typeof result[dy][tm].map.project_name, "undedined", 
						  "result " + dy + ' -> ' + tm + ".map should have a project_name");
				assert.areNotEqual(typeof result[dy][tm].map.task, "undefined",
						  "result " + dy + ' -> ' + tm + ".map should have a task");
			}
		});
	});
}
});


// Testing
var initTests = new Y.Test.Case({
    name: "Initialization tests.",
    "Should initialize properly": function() {
	// Setup and read in samples to run tests on
	sample1_text = fs.readFileSync("test-samples/timesheet-1.txt").toString();
	try {
		sample1a = JSON.parse(fs.readFileSync("test-samples/timesheet-1a.json").toString());
	} catch (err1) {
		console.error("TEST JSON ERROR: " + err1);
		process.exit(1);
	}
	try {
		sample1b = JSON.parse(fs.readFileSync("test-samples/timesheet-1b.json").toString());
	} catch (err2) {
		console.error("TEST JSON ERROR: " + err2);
		process.exit(1);
	}
	
	try {
		sample_map = JSON.parse(fs.readFileSync("test-samples/testmap.json").toString());
	} catch (err3) {
		console.error("TEST JSON ERROR: " + err3);
		process.exit(1);
	}

	assert.areSame(typeof stn, 'object', "Should have an stn object: " + typeof stn);
	assert.areSame(typeof stn.parse, 'function',
					   "Should have an stn.parse method on stn object: " + util.inspect(stn));
}
});

Y.Test.Runner.add(initTests);
Y.Test.Runner.add(basicTests);
Y.Test.Runner.add(mapTests);

var incrementalParseTests = new Y.Test.Case({
    name: "Tests incremental parsing",
    "Should parse incrementally": function () {
	var timesheet = new stn.Stn({}, {save_parse: false}),
		val = {},
		line;
	
	assert.areEqual(timesheet.defaults.save_parse, false, "Should NOT have save_parse.");
	timesheet.reset();
	assert.areEqual(timesheet.defaults.save_parse, true, "Should have save_parse.");
	val = timesheet.valueOf();
	assert.areEqual(Object.keys(val).length, 0, "Should have nothing in the parse tree");
	line = "2012-11-06";
	timesheet.addEntry(line);
	assert.areEqual(timesheet.working_date, "2012-11-06", "Should have a working date of 2012-11-06: " + timesheet.working_date);
	assert.areEqual(Object.keys(val).length, 0, "Should have nothing in the parse tree");
	line = "8:00 - 10:00; staff meeting";
	timesheet.addEntry(line);
	val = timesheet.valueOf();
	assert.areEqual(timesheet.working_date, "2012-11-06", "Should have a working date of 2012-11-06: " + timesheet.working_date);
	assert.areEqual(Object.keys(val).length, 1, "Should have nothing in the parse tree");
	assert.areNotEqual(typeof val["2012-11-06"], "undefined", "Should have a date record now");
	assert.areNotEqual(typeof val["2012-11-06"]["8:00 - 10:00"], "undefined", "Should have a time part of the record: " + util.inspect(val));

	assert.areEqual(val["2012-11-06"]["8:00 - 10:00"].map, false, "Should *.map === false: " + util.inspect(val));

	assert.areEqual(val["2012-11-06"]["8:00 - 10:00"].tags[0], "staff meeting", "Should *.tags[0] === 'staff meeting': " + util.inspect(val));

	assert.areEqual(val["2012-11-06"]["8:00 - 10:00"].notes, "", "Should *.notes === '': " + util.inspect(val));
	
	line = "2:30 - 4:30; weekly; with Boss";
	timesheet.addEntry(line);
	assert.areEqual(val["2012-11-06"]["2:30 - 4:30"].map, false, "Should *.map === false: " + util.inspect(val));

	assert.areEqual(val["2012-11-06"]["2:30 - 4:30"].tags[0], "weekly", "Should *.tags[0] === 'staff meeting': " + util.inspect(val));

	assert.areEqual(val["2012-11-06"]["2:30 - 4:30"].notes, "with Boss", "Should *.notes === 'with Boss': " + util.inspect(val));
}
});
Y.Test.Runner.add(incrementalParseTests);


var bugTests0_0_7 = new Y.Test.Case({
    namme: "Bug tests for 0.0.7",
    "Should show bugs fixed": function () {
	var text,
		val = {},
		config = {
			tags: false,
			map: false,
			normalize_date: true,
			hours: false,
			save_parse: false
		},
		s,
		expected_s,
		timesheet = new stn.Stn({}, config);
	
	text = fs.readFileSync("test-samples/timesheet-3.txt");
	val = timesheet.parse(text);
	assert.areEqual(timesheet.errorCount(), 0, "Should have no errors");

	assert.areNotEqual(typeof val["2012-11-02"], "undefined", "Should have an entry for 2012-11-02");
	assert.areNotEqual(typeof val["2012-11-02"]["8:00 - 12:15"], "undefined",
        "Should have an entry for 2012-11-02, 8:00 - 12:15");
	expected_s = "M101 MongoDB for Developers class";
	s = val["2012-11-02"]["8:00 - 12:15"];
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);

	s = val["2012-11-02"]["12:15 - 3:45"];
	expected_s = "M102 MongoDB for Admins";
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);

	s = val["2012-11-01"]["6:30 - 8:30"];
	expected_s = "professional development; M101 MongoDB Developer course";
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);

	s = val["2012-11-01"]["8:50 - 9:50"];
	expected_s = "news search; implement higher performance JSON API with MongoDB";
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);
		
	s = val["2012-11-01"]["11:00 - 2:00"];
	expected_s = "event calendar; Setup for relink test";
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);
				
	s = val["2012-11-01"]["2:30 - 4:30"];
	expected_s = "news search; implementing a higher performance JSON API with MongoDB";
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);

	s = val["2012-10-31"]["6:30 - 7:30"];
	expected_s = "professional development; M101 MongoDB for developers";
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);

	s = val["2012-10-31"]["9:30 - 12:00"];
	expected_s = "Setup ecal in my sandbox, run relink-event-images.js. Write SPA so Ian, Candy and Sam can review the results. Improve USC object's support for calendar rendering.";
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);

	s = val["2012-10-31"]["1:00 - 4:45"];
	expected_s = "Write SPA so calendar content can be debugged against eo3 API. Got debug page working.";
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);
}
});

var atDirectiveTests = new Y.Test.Case({
    name: "@ directives",
    "Should process @ directives": function () {
	var timesheet = new stn.Stn({}, {map: false, tags: false, save_parse: false}),
		timesheet_1_txt = fs.readFileSync("test-samples/timesheet-1.txt").toString(),
		testmap_json = fs.readFileSync("test-samples/testmap.json").toString(),
		testmap = JSON.parse(testmap_json),
		line,
		expected_tm,
		tm,
		expected_pt,
		pt,
		expected_dates,
		dates,
		expected_ranges,
		ranges,
		expected_s,
		s;
	
	assert.areEqual(timesheet.defaults.map, false, "Should map should not be set yet." + util.inspect(timesheet));
	assert.areEqual(timesheet.defaults.tags, false, "Should tags should not be set yet. " + util.inspect(timesheet));
	assert.areEqual(timesheet.defaults.save_parse, false, "Should NOT have save_parse. " + util.inspect(timesheet));
	
	line = "@tag weekly meeting; ACME General serivces; Planning;ACME CEO William Williams";
	timesheet.addEntry(line);
	assert.areEqual(timesheet.defaults.save_parse, true, "Should have defaults.save_parse.");
	assert.areEqual(timesheet.save_parse, true, "Should have save_parse.");
	assert.areEqual(timesheet.defaults.tags, true, "Should tags should not be set yet." + util.inspect(timesheet));
	assert.areSame(timesheet.defaults.map, true, "Map should now be set true. " + util.inspect(timesheet));
	assert.areEqual(typeof timesheet.map, "object", "Should have timesheet.map as object " + util.inspect(timesheet.defaults.map));
	assert.areEqual(typeof timesheet.map["weekly meeting"], "object", "Should have weekly meeting tag. " + util.inspect(timesheet.defaults.map));
	assert.areEqual(timesheet.map["weekly meeting"].project_name, "ACME General serivces", "Should have weekly meeting project_name 'ACME General serivces' " + util.inspect(timesheet.defaults.map));
	assert.areEqual(timesheet.map["weekly meeting"].task, "Planning", "Should have weekly meeting task 'Planning'" + util.inspect(timesheet.defaults.map));
	assert.areEqual(timesheet.map["weekly meeting"].client_name, "ACME CEO William Williams", "Should have weekly meeting client_name 'ACME CEO William Williams' " + util.inspect(timesheet.defaults.map));
	assert.areEqual(Object.keys(timesheet.parse_tree).length, 0, "Shouldn't have anything in parse tree yet.");
	
	line = "2012-11-11";
	timesheet.addEntry(line);
	assert.areEqual(timesheet.working_date, "2012-11-11", "Should have a working date");
	assert.areEqual(Object.keys(timesheet.parse_tree).length, 0, "Shouldn't have anything in parse tree yet.");
	line = "08:00 - 11:00; weekly meeting";
	timesheet.addEntry(line);
	assert.areEqual(Object.keys(timesheet.parse_tree).length,  1, "Should have something in parse tree." + util.inspect(timesheet));

	// Now run with timesheet-1.txt data, and testmap.json data
	// and compare two stn objects.
	testmap.save_parse = true;
	testmap.tags = true;
	testmap.map = true;
	expected_tm = new stn.Stn({}, testmap);
	tm = new stn.Stn();
	
	expected_tm.parse(timesheet_1_txt);
	// Recreating timesheet_1_txt and testmap incrementally
	Object.keys(testmap).forEach(function (ky, i) {
		tm.parse(["@tag " + ky, 
			testmap[ky].project_name, 
			testmap[ky].task, 
			testmap[ky].client_name].join("; "));
	});
	tm.parse(timesheet_1_txt);

	assert.areNotEqual(typeof tm.defaults.map, "undefined",
        "We have a map indefaults");
	// Now save the parse trees for analysis
	expected_pt = expected_tm.valueOf();
	pt = tm.valueOf();
	
	// now see parse trees match
	expected_dates = Object.keys(expected_pt);
	dates = Object.keys(pt);
	assert.areEqual(expected_dates.length, dates.length, "Should have same number of dates\n" +
		util.inspect(dates) + "\n" +
		util.inspect(expected_dates));
	expected_dates.forEach(function (dt, i) {
		assert.areEqual(dates.indexOf(dt), expected_dates.indexOf(dt), "Should have date " + dt + " at " + i);
		expected_ranges = Object.keys(expected_pt[dt]);
		ranges = Object.keys(pt[dt]);
		assert.areEqual(expected_ranges.length, ranges.length, "Should have the same number of ranges (" +
			dt + ", " + i + ")\n" +
			util.inspect(ranges) + "\n" + util.inspect(expected_ranges));
		expected_ranges.forEach(function (rng, j) {
			assert.areEqual(ranges.indexOf(rng), expected_ranges.indexOf(rng), "Should have same range " +
				rng + " at " + i + ", " + j);
			assert.areEqual(true, (pt[dt][rng].map ||
				pt[dt][rng].map === false),
				"Should have a map at " + dt + ", " + rng + "\n" + util.inspect(pt));
			assert.areNotEqual(typeof pt[dt][rng].tags, "undefined", "Should have a tags at " + dt + ", " + rng);
			assert.areEqual(pt[dt][rng].notes, expected_pt[dt][rng].notes, "Should have matching notes");
			assert.areEqual(pt[dt][rng].hours, expected_pt[dt][rng].hours, "Should have matching hours");
		});
	});
	expected_s = String(expected_tm.valueOf());
	s = String(tm.valueOf());
	assert.areEqual(s.length, expected_s.length, "s.length: " + s.length +
		", expected_s.length: " + expected_s.length + "\n" + s);
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);
	
	// Make sure toString() is rendering consistantly.
	expected_s = expected_tm.toString();
	s = tm.toString();
	assert.areEqual(s, expected_s, "\n" + s + "\n" + expected_s);
}
});

Y.Test.Runner.run();

