//
// stnfs_test.js - Test the file system support in an extended stn.
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under the Simplified BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

var util = require("util"),
	fs = require("fs"),
	path = require("path"),
	assert = require("assert"),
	YUITest = require("yuitest"),
	stnfs = require("../stnfs");

// Grab some source files to compare with
var timesheet_1_txt = fs.readFileSync("test-samples/timesheet-1.txt").toString();
	//timesheet_2_txt = fs.readFileSync("test-samples/timesheet-2.txt").toString(),
	//timesheet_3_txt = fs.readFileSync("test-samples/timesheet-3.txt").toString();

// Cleanup any test write test files.
try {
	fs.unlinkSync("test-samples/async-write-testsheet-1.txt");
	fs.unlinkSync("test-samples/sync-write-testsheet-1.txt");
} catch (e0) {
	// Ignore the errors since the files may not really be there.
}

YUITest.TestRunner.add(new YUITest.TestCase({
    name: "Test constructor",
    "Should test constructors": function () {
	var obj = new stnfs.StnFS();

	assert.ok(stnfs.toJSON, "stnfs.toJSON() should exist.");	
	assert.ok(stnfs.toString, "stnfs.toString() should exist.");
	assert.ok(stnfs.readFile, "stnfs.readFile should exist.");
	assert.ok(stnfs.readFileSync, "stnfs.readFileSync should exist.");
	assert.ok(stnfs.writeFile, "stnfs.readFile should exist.");
	assert.ok(stnfs.writeFileSync, "stnfs.readFileSync should exist.");

	assert.equal(typeof obj.readFile, "function", "Should have readFile()");
	assert.equal(typeof obj.readFileSync, "function", "Should have readFileSync()");
	assert.equal(typeof obj.writeFile, "function", "Should have writeFile()");
	assert.equal(typeof obj.writeFileSync, "function", "Should have writeFileSync()");
}}));

YUITest.TestRunner.add(new YUITest.TestCase({
    name: "Test async read",
    "Should do async reads": function () {
	var expected_tm = new stn.Stn(),
		tm = new stnfs.StnFS();
	
	expected_tm.reset();
	expected_tm.parse(timesheet_1_txt);
	tm.reset();
	// Now try a Ansync read.
	tm.readFile("test-samples/timesheet-1.txt", function (err, parse_tree) {
		var s, expected_s;
		
		assert.ok(!err, "Shouldn't have an error on read: " + err);
		assert.ok(parse_tree, "Should get back the parse tree.");
		
		expected_s = expected_tm.toJSON();
		s = tm.toJSON();
		assert.equal(s, expected_s, "JSON:\n" + s + "\n" + expected_s);
		
		expected_s = expected_tm.toString();
		s = tm.toString();
		assert.equal(s, expected_s, "JSON:\n" + s + "\n" + expected_s);
	});
}}));

YUITest.TestRunner.add(new YUITest.TestCase({
    name: "Test async writes",
    "Should do async writes": function () {
	var expected_tm = new stn.Stn(),
		tm = new stnfs.StnFS();
	
	expected_tm.reset();
	expected_tm.parse(timesheet_1_txt);
	assert.ok(expected_tm.toString(), "Should get something with toString()");
	
	tm.reset();
	tm.parse(timesheet_1_txt);
	tm.writeFile("test-samples/async-write-testsheet-1.txt", function (err) {
		assert.ok(!err, err);
		console.log("\t\tReading back data for test-samples/async-testsheet-1.txt");
		fs.readFile("test-samples/async-write-testsheet-1.txt", function (err2, buf) {
			var expected_tm = new stn.Stn(),
				s,
				expected_s;
			assert.ok(!err2, "Shouldn't get an error reading the file back in. " + err2);
			
			expected_tm.reset();
			expected_tm.parse(timesheet_1_txt);
			console.log("\t\tIn read callback for test-samples/async-testsheet-1.txt");
			expected_s = expected_tm.toString();
			s = buf.toString();
			assert.equal(s, expected_s, "\n" + s + "\n" + expected_s);
		});
	});
}}));

YUITest.TestRunner.add(new YUITest.TestCase({
    name: "Test synchronous read/write",
    "Should do synchronous read/write": function () {
	var expected_tm = new stn.Stn(),
		tm = new stnfs.StnFS(),
		expected_s,
		s;
	
	expected_tm.reset();
	expected_tm.parse(timesheet_1_txt);
	assert.ok(expected_tm.toString(), "Should get something with toString()");
	
	
	tm.reset();
	tm.readFileSync("test-samples/async-write-testsheet-1.txt");
	expected_s = expected_tm.toString();
	s = tm.toString();
	assert.equal(s, expected_s, "\n" + s + "\n" + expected_s);
	
	tm.reset();
	tm.parse(timesheet_1_txt);
	tm.writeFileSync("test-samples/sync-write-testsheet-1.txt");

	tm.reset();
	tm.readFile("test-samples/sync-write-testsheet-1.txt", function (err, buf) {
		var s, expected_s;

		assert.ok(!err, err);

		expected_s = expected_tm.toString();
		s = tm.toString();
		assert.equal(s, expected_s, "\n" + s + "\n" + expected_s);
	});
}}));

YUITest.TestRunner.run();

