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
// revision: 0.0.1b
//

var	util = require('util'),
	fs = require('fs'),
	assert = require('assert'),
	stn = require('./stn'),
	sample1_text, sample1a, sample1b, result;

console.log("Starting [stn-test.js] ...");

// Setup and read in samples to run tests on
sample1_text = fs.readFileSync("test-samples/timesheet-1.txt").toString();
try {
	sample1a = JSON.parse(fs.readFileSync("test-samples/timesheet-1a.json").toString());
} catch (err) {
	console.error("TEST JSON ERROR: " + err);
	process.exit(1);
}
try {
	sample1b = JSON.parse(fs.readFileSync("test-samples/timesheet-1b.json").toString());
} catch (err) {
	console.error("TEST JSON ERROR: " + err);
	process.exit(1);
}

// Testing
console.log("Checking module setup ...");
assert.strictEqual(typeof stn, 'object', "Should have an stn object: " + typeof stn);
assert.strictEqual(typeof stn.parse, 'function', "Should have an stn.parse method on stn object: " + util.inspect(stn));


console.log("Checking parse method ...");
// Call as simple function without callback or options
result = stn.parse(sample1_text);
assert.ok(result, "Should get a non-false results from parsing sample1_text: " + stn.messages());

console.log("Checking for missing results (mrs) ...");
// Check for missing results
Object.keys(sample1a).forEach(function (dy) {
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
	assert.ok(sample1a[dy] !== undefined, "unexpected in result " + dy + " <-- " + util.inspect(result[dy])); 
	Object.keys(result[dy]).forEach(function (tm) {
		assert.ok(result[dy][tm] !== undefined, "result " + dy + ' -> ' + tm + " missing in simple1a " + util.inspect(sample1a[dy])); 
		assert.ok(sample1a[dy][tm].toString() === result[dy][tm].toString(), 'urs ' + dy + ' ' + tm + ' -> [' + sample1a[dy][tm].toString() + '] !== [' + result[dy][tm].toString() + ']'); 
	});
});
console.log("... No unexpected results");

// Test the alternative JSON representation with normalized date, hours and tag extraction
console.log("Testing passing in an options array");

console.log("Checking parse method ...");
// Call as simple function without callback or options
result = stn.parse(sample1_text, {normalize_date:true, hours:true, tags:true});
assert.ok(result, "Should get a non-false results from parsing sample1_text: " + stn.messages());

console.log("Checking for missing results (mrs) ...");
// Check for missing results
Object.keys(sample1b).forEach(function (dy) {
	assert.ok(result[dy] !== undefined, "missing from sample1b [" + dy + "] <-- [" + util.inspect(sample1b[dy]) + "]");
	//console.error("DEBUG result[" + dy + "]: " + util.inspect(result[dy]));// DEBUG
	//console.error("DEBUG sample1b[" + dy + "]: " + util.inspect(sample1b[dy]));// DEBUG
	Object.keys(sample1b[dy]).forEach(function (tm) {
		assert.ok(result[dy][tm] !== undefined, 'sample1b ' + dy + ' -> [' + tm + '] missing in result ' + util.inspect(result[dy]));
		assert.ok(sample1b[dy][tm].notes === result[dy][tm].notes, 'mrs notes ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].notes + '] !== [' + result[dy][tm].notes + ']'); 
		assert.ok(Math.round(sample1b[dy][tm].hours) === Math.round(result[dy][tm].hours), 'mrs hours ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].hours + '] !== [' + result[dy][tm].hours + ']'); 
		assert.ok(sample1b[dy][tm].tags.toString() === result[dy][tm].tags.toString(), 'mrs tags ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].tags.toString() + '] !== [' + result[dy][tm].tags.toString() + ']'); 
	});
});
console.log("... No missing results");

console.log("Checking for unexpected results (urs) ...");
// Check for unexpected results 
Object.keys(result).forEach(function (dy) {
	assert.ok(sample1b[dy] !== undefined, "unexpected in result " + dy + " <-- " + util.inspect(result[dy])); 
	Object.keys(result[dy]).forEach(function (tm) {
		assert.ok(result[dy][tm] !== undefined, "result " + dy + ' -> ' + tm + " missing in simple1a " + util.inspect(sample1b[dy])); 
		assert.ok(sample1b[dy][tm].notes === result[dy][tm].notes, 'urs notes ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].notes + '] !== [' + result[dy][tm].notes + ']'); 
		assert.ok(Math.round(sample1b[dy][tm].hours) === Math.round(result[dy][tm].hours), 'urs hours ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].hours + '] !== [' + result[dy][tm].hours + ']'); 
		assert.ok(sample1b[dy][tm].tags.toString() === result[dy][tm].tags.toString(), 'urs tags ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].tags.toString() + '] !== [' + result[dy][tm].tags.toString() + ']'); 
	});
});
console.log("... No unexpected results");


console.log("Success!");
