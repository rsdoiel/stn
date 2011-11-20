//
// self.js - a JavaScript module for processing plain text in 
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

var util = require('util');

var self = {
	_msgs : [],
	_defaults : {
		notes:true,
		hours:false,
		tags:false,
	},
	/**
	 * error - collect parse errors into the _msgs array.
	 * @param msg - the message to the collection of messages.
	 * @return true on successful add, false otherwise
	 */
	error : function (msg) {
		var i = self._msgs.length;
		
		self._msgs.push('ERROR: ' + msg);
		if ((i + 1) !== self._msgs.length) {
			return false;
		}
		return true;
	},
	
	/**
	 * errorCount - number of error messages collected.
	 * @return number of error messages.
	 */
	errorCount : function () {
		if (self._msgs === undefined) {
			return 0;
		}
		return self._msgs.length;
	},
	
	/**
	 * messages - return the _msgs array as a single string delimited
	 * by new lines.
	 * @param no_clear (optional, defaults to false)
	 * @return string representing in messages
	 */
	messages : function (no_clear) {
		var result = self._msgs.join("\n");

		// set optional default i needed
		if (no_clear !== undefined) {
			no_clear = false;
		}

		if (no_clear === true) {
			return result;
		}

		// Clear the messages
		self._msgs = [];
		return result;
	},

	/**
	 * parse - parse a block of plain text and
	 * pass the results to the callback method 
	 * based on any options supplied.
	 * @param: text - the plain text to parse
	 * @param: callback - the function to call when complete
	 * @param: options - an object with option properties to use
	 * for determining the data argument handed to the callback
	 * @returns a object representing the parsed data or false if
	 * errors were found.
	 */
	parse : function (text, callback, options) {
		var lines, data = {}, dy, tm, tmpArray = [],
			reDataEntry, reTimeEntry, reTime;

		lines = text.replace(/\r/g,'').split("\n")
		reDateEntry = /([0-1][0-9]\/[0-3][0-9]\/[0-9][0-9][0-9][0-9]|[0-9][0-9][0-9][0-9][\s]*-[0-1][0-9]-[\s]*[0-3][0-9])$/;
		reTimeEntry = /^[0-9]+:[0-5][0-9][\s]*\-([\s]*[0-9]+:[0-5][0-9]|now)[:,;\,\ ]*/;
		reTime = /[0-9]+:[0-5][0-9]/;

		// Read through the text line, by line and create a new JSON
		// blob
		lines.forEach(function (line, i) {
			line = line.trim();
			if (reDateEntry.exec(line)) {
				dy = line.trim();
				data[dy] = {};
			} else if (reTimeEntry.exec(line)) {
				tm = (reTimeEntry.exec(line))[0].trim();
				line = line.substr(tm.length).trim();
				if (tm.substr(-1) === ':' || 
					tm.substr(-1) === ';' || 
					tm.substr(-1) === ',') {
					tm = tm.slice(0,tm.length - 1).trim();
				}
				data[dy][tm] = line;
			} else if (line !== "" &&
				data[dy] !== undefined &&
				data[dy][tm] !== undefined) {
				if (typeof data[dy][tm] === "string") {
					tmpArray = [data[dy][tm], line.trim()];
					data[dy][tm] =  tmpArray;
				} else {
					data[dy][tm].push(line.trim());
				}
			}
		});
		
		// If options.hours, options.notes true then processing
		// into a more complex object tree.
				
		// Finished parse, return the results
		if (callback !== undefined && typeof callback === 'function') {
			if (self.errorCount() === 0) {
				callback(null, data, options);
			} else {
				callback(self.messages(), data, options);
			}
		}
		
		if (self.errorCount() > 0) {
			return false;
		}
		return data;
	}
};

exports.parse = self.parse;
exports.error = self.error;
exports.messages = self.messages;
