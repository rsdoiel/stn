//
// stn.js - a JavaScript module for processing plain text in 
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

var stn = {
	_msgs : [],
	
	/**
	 * error - collect parse errors into the _msgs array.
	 * @param msg - the message to the collection of messages.
	 * @return true on successful add, false otherwise
	 */
	error : function (msg) {
		var i = this._msgs.length;
		
		this._msgs.push('ERROR: ' + msg);
		if ((i + 1) !== this._msgs.length) {
			return false;
		}
		return true;
	},
	
	/**
	 * messages - return the _msgs array as a single string delimited
	 * by new lines.
	 * @param no_clear (optional, defaults to false)
	 * @return string representing in messages
	 */
	messages : function (no_clear) {
		var result = this._msgs.join("\n");

		// set optional default i needed
		if (no_clear !== undefined) {
			no_clear = false;
		}

		if (no_clear === true) {
			return result;
		}

		// Clear the messages
		this._msgs = [];
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
		var lines = text.replace(/\r/g,'').split("\n"),
			errors = [];
		
		if (callback !== undefined) {
			callback("stn.parse not implemented.", options);
		}
		return false;
	}
};

exports.parse = stn.parse;
exports.error = stn.error;
exports.messages = stn.messages;
