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
// revision: 0.0.5
//

var	util = require('util'),
	fs = require('fs'),
	path = require("path"),
	assert = require('assert'),
	harness = require("./harness"),
	stn = require('./stn'),
	sample1_text, sample1a, sample1b, sample_map, result;

var basicTests = function () {
	var i, j;
	
	// Call as simple function without callback or options
	result = stn.parse(sample1_text);
	assert.ok(result, "Should get a non-false results from parsing sample1_text: " + stn.messages());
	
	// Check for missing results
	i = sample1a.length;
	j = result.length;
	Object.keys(sample1a).forEach(function (dy) {
		assert.ok(result[dy] !== undefined, "missing from sample1 " + dy + " <-- " + util.inspect(sample1a[dy]));
		Object.keys(sample1a[dy]).forEach(function (tm) {
			assert.ok(result[dy][tm] !== undefined, 'sample1 ' + dy + ' -> ' + tm + ' missing in result ' + util.inspect(result[dy]));
			assert.ok(sample1a[dy][tm].toString() === result[dy][tm].toString(), 'mrs ' + dy + ' ' + tm + ' -> [' + sample1a[dy][tm].toString() + '] !== [' + result[dy][tm].toString() + ']'); 
		});
	});
	assert.equal(i, j, "Missing results");

	i = sample1a.length;
	j = result.length;
	// Check for unexpected results 
	Object.keys(result).forEach(function (dy) {
		assert.ok(sample1a[dy] !== undefined, "unexpected in result " + dy + " <-- " + util.inspect(result[dy])); 
		Object.keys(result[dy]).forEach(function (tm) {
			assert.ok(result[dy][tm] !== undefined, "result " + dy + ' -> ' + tm + " missing in simple1a " + util.inspect(sample1a[dy])); 
			assert.ok(sample1a[dy][tm].toString() === result[dy][tm].toString(), 'urs ' + dy + ' ' + tm + ' -> [' + sample1a[dy][tm].toString() + '] !== [' + result[dy][tm].toString() + ']'); 
		});
	});
	assert.equal(i, j, "Missing results");
	
	// Test the alternative JSON representation with normalized date, hours and tag extraction

	// Call as simple function without callback or options
	result = stn.parse(sample1_text, {normalize_date:true, hours:true, tags:true});
	assert.ok(result, "Should get a non-false results from parsing sample1_text: " + stn.messages());

	// Check for missing results
	i = sample1b.length;
	j = result.length;
	Object.keys(sample1b).forEach(function (dy) {
		assert.ok(result[dy] !== undefined, "missing from sample1b [" + dy + "] <-- [" + util.inspect(sample1b[dy]) + "]");
		//console.error("DEBUG result[" + dy + "]: " + util.inspect(result[dy]));// DEBUG
		//console.error("DEBUG sample1b[" + dy + "]: " + util.inspect(sample1b[dy]));// DEBUG
		Object.keys(sample1b[dy]).forEach(function (tm) {
			assert.ok(result[dy][tm] !== undefined, 'sample1b ' + dy + ' -> [' + tm + '] missing in result ' + util.inspect(result[dy]));
			assert.ok(sample1b[dy][tm].notes === result[dy][tm].notes, 'mrs notes ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].notes + '] !== [' + result[dy][tm].notes + ']'); 
			assert.ok(Math.round(sample1b[dy][tm].hours) === Math.round(result[dy][tm].hours), 'mrs hours ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].hours + '] !== [' + result[dy][tm].hours + ']'); 
			assert.ok(sample1b[dy][tm].tags.toString() === result[dy][tm].tags.toString(), 'mrs tags ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].tags.toString() + '] !== [' + result[dy][tm].tags.toString() + ']'); 
			assert.strictEqual(result[dy][tm].map, false, "Should have result.map set to false.");
		});
	});
	assert.equal(i, j, "Missing results");
	
	// Check for unexpected results 
	i = sample1b.length;
	j = result.length;
	Object.keys(result).forEach(function (dy) {
		assert.ok(sample1b[dy] !== undefined, "unexpected in result " + dy + " <-- " + util.inspect(result[dy])); 
		Object.keys(result[dy]).forEach(function (tm) {
			assert.ok(result[dy][tm] !== undefined, "result " + dy + ' -> ' + tm + " missing in simple1a " + util.inspect(sample1b[dy])); 
			assert.ok(sample1b[dy][tm].notes === result[dy][tm].notes, 'urs notes ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].notes + '] !== [' + result[dy][tm].notes + ']'); 
			assert.ok(Math.round(sample1b[dy][tm].hours) === Math.round(result[dy][tm].hours), 'urs hours ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].hours + '] !== [' + result[dy][tm].hours + ']'); 
			assert.ok(sample1b[dy][tm].tags.toString() === result[dy][tm].tags.toString(), 'urs tags ' + dy + ' ' + tm + ' -> [' + sample1b[dy][tm].tags.toString() + '] !== [' + result[dy][tm].tags.toString() + ']'); 
			assert.strictEqual(result[dy][tm].map, false, "Should have result.map set to false.");
		});
	});
	assert.equal(i, j, "Missing or unexpected results");
};

var mapTests = function () {
	// Call as simple function without callback or options
	result = stn.parse(sample1_text, {map: sample_map});
	assert.ok(result, "Should get a non-false results from parsing sample1_text: " + stn.messages());
	Object.keys(result).forEach(function (dy) {
		assert.ok(sample1b[dy] !== undefined, "unexpected in result " + dy + " <-- " + util.inspect(result[dy])); 
		Object.keys(result[dy]).forEach(function (tm) {
			assert.ok(result[dy][tm].map !== undefined, "result " + dy + ' -> ' + tm + ".map missing in simple1a " + util.inspect(sample1b[dy])); 
			if (result[dy][tm].map !== false) {
				assert.ok(result[dy][tm].map.client_name, "result " + dy + ' -> ' + tm + ".map should have a client_name");
				assert.ok(result[dy][tm].map.project_name, "result " + dy + ' -> ' + tm + ".map should have a project_name");
				assert.ok(result[dy][tm].map.task, "result " + dy + ' -> ' + tm + ".map should have a task");
			}
		});
	});

};



// Testing
harness.push({callback: function () {
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
	
	try {
		sample_map = JSON.parse(fs.readFileSync("test-samples/testmap.json").toString());
	} catch (err) {
		console.error("TEST JSON ERROR: " + err);
		process.exit(1);
	}

	assert.strictEqual(typeof stn, 'object', "Should have an stn object: " + typeof stn);
	assert.strictEqual(typeof stn.parse, 'function', "Should have an stn.parse method on stn object: " + util.inspect(stn));
}, label: "Initialization tests."});

harness.push({callback: basicTests, label: "Basic tests"});
harness.push({callback: mapTests, label: "Map tests"});

if (require.main === module) {
    harness.RunIt(path.basename(module.filename), 10, true);
} else {
    exports.RunIt = harness.RunIt;
}
