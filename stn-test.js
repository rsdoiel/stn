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
	sample1_text, sample1a,
	src;

console.log("Starting [stn-test.js] ...");

// Setup and read in samples to run tests on
sample1_text = fs.readFileSync("test-samples/timesheet-1.txt").toString();
try {
	sample1a = JSON.parse(fs.readFileSync("test-samples/timesheet-1a.json").toString());
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

console.log("Checking for missing results (mrs) ...");
// Check for missing results
Object.keys(sample1a).forEach(function (dy) {
	var range, notes;
	assert.ok(result[dy] !== undefined, "missing from sample1 " + dy + " <-- " + util.inspect(sample1a[dy]));
	Object.keys(sample1a[dy]).forEach(function (tm) {
		assert.ok(result[dy][tm] !== undefined, 'sample1 ' + dy + ' -> ' + tm + ' missing in result ' + util.inspect(result[dy]));
		assert.ok(sample1a[dy][tm].toString() === result[dy][tm].toString(), 'mrs ' + dy + ' ' + tm + ' -> [' + sample1a[dy][tm].toString() + '] !== [' + result[dy][tm].toString() + ']'); 
	});
});
console.log("... No missing results");

console.log("Checking for unexpected results (urs) ...");
// Check for unexpected results 
Object.keys(result).forEach(function (dy) {
	var range, notes;
	assert.ok(sample1a[dy] !== undefined, "unexpected in result " + dy + " <-- " + util.inspect(result[dy])); 
	Object.keys(result[dy]).forEach(function (tm) {
		assert.ok(result[dy][tm] !== undefined, "result " + dy + ' -> ' + tm + " missing in simple1a " + util.inspect(sample1a[dy])); 
		assert.ok(sample1a[dy][tm].toString() === result[dy][tm].toString(), 'urs ' + dy + ' ' + tm + ' -> [' + sample1a[dy][tm].toString() + '] !== [' + result[dy][tm].toString() + ']'); 
	});
});
console.log("... No unexpected results");


console.log("Success!");