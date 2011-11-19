//
// stn-test.js - a JavaScript test module for processing plain text in 
// Simple Timesheet Notation
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.1-alpha
//

var	util = require('util'),
	fs = require('fs'),
	assert = require('assert'),
	stn = require('./stn'),
	sample1_text, sample1_json,
	src;

console.log("Starting [stn-test.js] ...");

// Setup and read in samples to run tests on
sample1_text = fs.readFileSync("test-samples/timesheet-1.txt").toString();
try {
	sample1_json = JSON.parse(fs.readFileSync("test-samples/timesheet-1.json").toString());
} catch (err) {
	console.error("TEST JSON ERROR: " + err);
	process.exit(1);
}

// Testing
console.log("Checking module setup ...")
assert.strictEqual(typeof stn, 'object', "Should have an stn object: " + typeof stn);
assert.strictEqual(typeof stn.parse, 'function', "Should have an stn.parse method on stn object: " + util.inspect(stn));


console.log("Checking parse method ...");
// Call as simple function without callback or options
result = stn.parse(sample1_text);
assert.ok(result, "Should get a non-false results from parsing sample1_text: " + stn.messages());

console.log("Checking parse results ...");
// Check for missing results
Object.keys(sample1_json).forEach(function (dy) {
	var range, notes;
	assert.ok(result[dy] !== undefined, "missing from sample1 " + dy + " <-- " + util.inspect(sample1_json[dy])); 
	assert.equal(sample1_json[dy], result[dy], "sample1 " + util.inspect(sample1_json[dy]) + " result " + util.inspect(result[dy])); 
});
console.log("... No missing results");

// Check for unexpected results 
Object.keys(result).forEach(function (dy) {
	var range, notes;
	assert.ok(sample1_json[dy] !== undefined, "unexpected in result " + dy + " <-- " + util.inspect(result[dy])); 
	assert.equal(result[dy], sample1_json[dy], "result " + util.inspect(result[dy]) + " sample1 " + util.inspect(sample1_json[dy])); 
});
console.log("... No unexpected results");


console.log("Success!");