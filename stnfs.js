//
// stnfs.js - This is a demonstration of binding
// stn module with NodeJS' fs module to get persistance.
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under the Simplified BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

var fs = require("fs"),
	stn = require("./stn");

var StnFS = stn.Stn;

// e.g. stn.writeFile(filename, callback)
// write the state of stn to disc.
// @param filename - the name/path of the file you want to writeout.
// @param callback - the function envoke in completion, parameter passed is error
var writeFile = function (filename, callback) {
	return fs.writeFile(filename, this.toString(), "utf8", callback);
};

// e.g. stn.writeFileSync(filename)
// write the state of stn to disc.
// @param filename - the name/path of the file you want to writeout.
// @return null on successful write, an error otherwise.
var writeFileSync = function (filename) {
	return fs.writeFileSync(filename, this.toString());
};

// e.g. stn.readFile(filename, callback)
// @param filename - the name/path of the file you want to writeout.
// @param callback - the function envoke in completion, parameters passed are error, stn parse tree
var readFile = function (filename, callback) {
	var self = this;

	fs.readFile(filename, function (err, buf) {
		if (err) {
			callback(err, null);
			return;
		}
		callback(null, self.parse(buf.toString()));
	});
};

// e.g. stn.readFileSync(filename)
// @param filename - the name/path of the file you want to writeout.
// @return an updated Stn object.
var readFileSync = function (filename) {
	var buf;
	
	buf = fs.readFileSync(filename).toString();
	this.parse(buf);
	
	return (this.errorCount() === 0);
};

StnFS.prototype.readFile = readFile;
StnFS.prototype.readFileSync = readFileSync;
StnFS.prototype.writeFile = writeFile;
StnFS.prototype.writeFileSync = writeFileSync;


// Re-expect stn
exports.Stn = stn.Stn;

// Export additional funcitonality
exports.StnFS = StnFS;
exports.valueOf = stn.valueOf;
exports.toString = stn.toString;
exports.toJSON = stn.toJSON;
exports.YYYYMMDD = stn.YYYYMMDD;
exports.HHMM = stn.HHMM;
exports.reset = stn.reset;
exports.parse = stn.parse;
exports.error = stn.error;
exports.errorCount = stn.errorCount;
exports.messages = stn.messages;
exports.addEntry = stn.addEntry;
exports.readFile = readFile;
exports.readFileSync = readFileSync;
exports.writeFile = writeFile;
exports.writeFileSync = writeFileSync;

