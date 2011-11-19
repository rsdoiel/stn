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
		if (callback !== undefined) {
			callback("stn.parse not implemented.", options);
		}
		return false;
	}
};

exports.parse = stn.parse;