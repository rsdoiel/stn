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
// revision: 0.0.3
//

/*jslint devel: true, node: true, maxerr: 10, indent: 4,  vars: true, sloppy: true, stupid: false */

var self = {
	msgs : [],
	defaults : {
        normalize_date: false,
		hours: false,
		tags: false,
		map: false
	},
	/**
	 * error - collect parse errors into the msgs array.
	 * @param msg - the message to the collection of messages.
	 * @return true on successful add, false otherwise
	 */
	error : function (msg) {
		var i = self.msgs.length;

		self.msgs.push('ERROR: ' + msg);
		if ((i + 1) !== self.msgs.length) {
			return false;
		}
		return true;
	},

	/**
	 * errorCount - number of error messages collected.
	 * @return number of error messages.
	 */
	errorCount : function () {
		if (self.msgs === undefined) {
			return 0;
		}
		return self.msgs.length;
	},

	/**
	 * messages - return the msgs array as a single string delimited
	 * by new lines.
	 * @param no_clear (optional, defaults to false)
	 * @return string representing in messages
	 */
	messages : function (no_clear) {
		var result = self.msgs.join("\n");

		// set optional default i needed
		if (no_clear !== undefined) {
			no_clear = false;
		}

		if (no_clear === true) {
			return result;
		}

		// Clear the messages
		self.msgs = [];
		return result;
	},

	/**
	 * parse - parse a block of plain text and
	 * pass the results to the callback method 
	 * based on any options supplied.
	 * @param: text - the plain text to parse
	 * @param: callback - (optional) the function to call when complete
	 * @param: options - (optional) an object with option properties to use
	 * for determining the data argument handed to the callback or
     * returned by parse
	 * @returns a object representing the parsed data or false if
	 * errors were found.
	 */
	parse : function (text, callback, options) {
		if (options === undefined) {
			options = self.defaults;
		} else {
			Object.keys(self.defaults).forEach(function (ky) {
				if (options[ky] === undefined) {
					options[ky] = self.defaults[ky];
				}
			});
		}
		if (typeof callback === 'object') {
			// options arg was folded over callback
			Object.keys(callback).forEach(function (ky) {
				options[ky] = callback[ky];
			});
		}

		var lines, data = {}, dy, tm,
			reDateEntry, reTimeEntry, reTime,
            reDateNormalized;

		lines = String(text).replace(/\r/g, '').split("\n");
		reDateEntry = /([0-1][0-9]\/[0-3][0-9]\/[0-9][0-9][0-9][0-9]|[0-9][0-9][0-9][0-9][\s]*-[0-1][0-9]-[\s]*[0-3][0-9])$/;
		reDateNormalized = /[0-9][0-9][0-9][0-9][\s]*-[0-1][0-9]-[\s]*[0-3][0-9]/;
		reTimeEntry = /^[0-9]+:[0-5][0-9][\s]*\-([\s]*[0-9]+:[0-5][0-9]|now)[:,;\,\ ]*/;
		reTime = /[0-9]+:[0-5][0-9]/;

		// Read through the text line, by line and create a new JSON
		// blob
		lines.forEach(function (line, i) {
			var day, hrs, tmp;

			line = line.trim();
			if (reDateEntry.exec(line)) {
				// FIXME: If options.normalize_date !== false, then noramlize date to format provided (e.g. MM/DD/YYYY or YYYY-MM-DD)
				if (options.normalize_date === true) {
					if (reDateNormalized.exec(line.trim())) {
						dy = line.trim();
					} else {
						day = new Date(line.trim());
						dy = day.getFullYear() + '-' + String("0" + (day.getMonth() + 1)).substr(-2) + '-' + String("0" + day.getDate()).substr(-2);
					}
				} else {
					dy = line.trim();
				}
				data[dy] = {};
			} else if (reTimeEntry.exec(line)) {
				tm = (reTimeEntry.exec(line))[0].trim();
				line = line.substr(tm.length).trim();
				if (tm.substr(-1) === ':' || tm.substr(-1) === ';' || tm.substr(-1) === ',') {
					tm = tm.slice(0, tm.length - 1).trim();
				}
				if (options.tags || options.hours || options.map) {
					data[dy][tm] = {};
					data[dy][tm].map = false;
					tmp = line.split(';');
					data[dy][tm].notes = line.substr(tmp[0].length + 1).trim();
					if (options.tags) {
						data[dy][tm].tags = (tmp[0]).split(',');
					}
					if (options.map !== false &&
						tmp[0] !== undefined &&
						options.map[tmp[0]] !== undefined) {
						data[dy][tm].map = options.map[tmp[0]];
					}
					hrs = tm.split(' - ');
					hrs.forEach(function (val, i, times) {
						var hr = val.split(':');
						times[i] = Number(hr[0]) + Number(hr[1] / 60);
					});
					if (hrs[0] < hrs[1]) {
						data[dy][tm].hours = (hrs[1] - hrs[0]).toString();
					} else {
						data[dy][tm].hours = (hrs[1] + (12 - hrs[0])).toString();
					}
                } else {
					data[dy][tm] = line.trim();
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
