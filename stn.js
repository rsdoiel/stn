//
// stn.js - a JavaScript module for processing plain text in 
// Simple Timesheet Notation
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2011 all rights reserved
//
// Released under the Simplified BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

(function (global, exports) {
	// Format a date as YYYY-MM-DD
	// @param Date object
	// @return string in YYYY-MM-DD format
	var YYYYMMDD = function (d, use_UTC) {
		if (typeof d === "string") {
			if (d.match(/[0-9][0-9][0-9][0-9][\s]*-[0-1][0-9]-[\s]*[0-3][0-9]/)) {
				return d.replace(/\s+/, "");
			}
			d = new Date(d);
		} else if (typeof d === "number") {
			d = new Date(d);
		} else if (typeof d !== "object" &&
				typeof d.getFullYear !== "function") {
			throw "Expecting type: " + String(d) + " --> " + typeof d;
		}
		if (!use_UTC) {
			return [
				d.getFullYear(),
				String("0" + (d.getMonth() + 1)).substr(-2),
				String("0" + d.getDate()).substr(-2)
			].join("-");
		}
		return [
			d.getUTCFullYear(),
			String("0" + (d.getUTCMonth() + 1)).substr(-2),
			String("0" + d.getUTCDate()).substr(-2)
		].join("-");
	};

	// Fromat time as HH:MM
	// @param Date object
	// @return string in HH:MM format
	var HHMM = function (t, use_UTC) {
		if (!use_UTC) {
			return [
				String("0" + t.getHours()).substr(-2),
				String("0" + t.getMinutes()).substr(-2)
			].join(":");
		}
		return [
			String("0" + t.getUTCHours()).substr(-2),
			String("0" + t.getUTCMinutes()).substr(-2)
		].join(":");
	};

	// reset - clear the parse tree
	// sets save_parse to true,
	// sets normalize_date to true
	// sets tags to true
	// sets map ot false
	// @param options - a set of options to override the defaults with
	// on reset.
	var reset = function (options) {
		var ky;

		this.defaults = {};
		this.defaults.normalize_date = true;
		this.defaults.save_parse = true;
		this.defaults.tags = true;
		this.map = false;
		this.parse_tree = {};
		this.msgs = [];
		for (ky in options) {
			if (options.hasOwnProperty(ky)) {
				this.defaults[ky] = options[ky];
			}
		}
	};


	var Stn = function (parse_tree, options) {
		var ky, day, dy;

		this.msgs = [];
		this.defaults = {
	        normalize_date: false,
			hours: false,
			tags: false,
			map: false,
			save_parse: false
		};

		if (typeof parse_tree === "undefined") {
			this.parse_tree = {};
		} else {
			this.parse_tree = parse_tree;
		}

		// Copy in the options overwriting the defaults.
		for (ky in options) {
			if (options.hasOwnProperty(ky)) {
				this.defaults[ky] = options[ky];
			}
		}

		this.save_parse = this.defaults.save_parse;
		day = new Date();
		dy = YYYYMMDD(day);
		this.working_date = dy;

		return this;
	};

	/**
	 * error - collect parse errors into the msgs array.
	 * @param msg - the message to the collection of messages.
	 * @return true on successful add, false otherwise
	 */
	var	error = function (msg) {
		var i = this.msgs.length;

		this.msgs.push('ERROR: ' + msg);
		if ((i + 1) !== this.msgs.length) {
			return false;
		}
		return true;
	};

	/**
	 * errorCount - number of error messages collected.
	 * @return number of error messages.
	 */
	var	errorCount = function () {
		if (this.msgs === undefined) {
			return 0;
		}
		return this.msgs.length;
	};


	/**
	 * messages - return the msgs array as a single string delimited
	 * by new lines.
	 * @param no_clear (optional, defaults to false)
	 * @return string representing in messages
	 */
	var messages = function (no_clear) {
		var result = this.msgs.join("\n");

		// set optional default i needed
		if (no_clear !== undefined) {
			no_clear = false;
		}

		if (no_clear === true) {
			return result;
		}

		// Clear the messages
		this.msgs = [];
		return result;
	};

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
	var parse = function (text, callback, options) {
		var lines,
			ky,
			data = {},
			dy = this.working_date,
			tm,
			reDateEntry,
			reTimeEntry,
			reTime,
			reDateNormalized;

		if (typeof this.defaults === "undefined" ||
				typeof this.msgs === "undefined" ||
				typeof this.parse_tree === "undefined") {
			this.reset({
				normalize_date: false,
				hours: false,
				tags: false,
				map: false,
				save_parse: false
			});
		}
		
		if (typeof options === "undefined") {
			options = this.defaults;
		} else {
			for (ky in this.defaults) {
				if (this.defaults.hasOwnProperty(ky)) {
					if (typeof options[ky] === "undefined") {
						options[ky] = this.defaults[ky];
					}
				}
			}
		}
		if (typeof callback === 'object') {
			// options arg was folded over callback
			Object.keys(callback).forEach(function (ky) {
				options[ky] = callback[ky];
			});
		}

		// If we're doing an incremental parse using the existing tree.
		if (options.save_parse === true) {
			data = this.parse_tree;
		}

		lines = String(text).replace(/\r/g, '').split("\n");
		reDateEntry = /([0-1][0-9]\/[0-3][0-9]\/[0-9][0-9][0-9][0-9]|[0-9][0-9][0-9][0-9][\s]*-[0-1][0-9]-[\s]*[0-3][0-9])$/;
		reDateNormalized = /[0-9][0-9][0-9][0-9][\s]*-[0-1][0-9]-[\s]*[0-3][0-9]/;
		reTimeEntry = /^[0-9]+:[0-5][0-9][\s]*\-([\s]*[0-9]+:[0-5][0-9]|now)[:,;\,\ ]*/;
		reTime = /[0-9]+:[0-5][0-9]/;

		// Read through the text line, by line and create a new JSON
		// blob
		lines.forEach(function (line, i) {
			var day, hrs, tmp, dt, tm;

			line = line.trim();
			if (reDateEntry.exec(line)) {
				if (options.normalize_date === true) {
					if (reDateNormalized.exec(line.trim())) {
						dy = line.trim();
					} else {
						day = new Date(line.trim());
						dy = YYYYMMDD(day);
					}
				} else {
					dy = line.trim();
				}
				// Keep track of the last date working.
				if (typeof data[dy] === "undefined") {
					data[dy] = {};
				}
				this.working_date = dy;
			} else if (reTimeEntry.exec(line)) {
				tm = (reTimeEntry.exec(line))[0].trim();
				line = line.substr(tm.length).trim();
				if (tm.substr(-1) === ':' || tm.substr(-1) === ';' || tm.substr(-1) === ',') {
					tm = tm.slice(0, tm.length - 1).trim();
				}
				if (options.tags || options.hours || options.map) {
					if (typeof data[dy] === "undefined") {
						data[dy] = {};
					}
					data[dy][tm] = {};
					data[dy][tm].map = false;
					tmp = line.split(';');
					data[dy][tm].notes = line.substr(tmp[0].length + 1).trim();
					if (options.tags) {
						data[dy][tm].tags = (tmp[0]).split(',');
					}
					if (options.map !== undefined && options.map !== false &&
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
			if (errorCount() === 0) {
				callback(null, data, options);
			} else {
				callback(this.messages(), data, options);
			}
		}

		if (errorCount() > 0) {
			return false;
		}
		this.working_date = dy;
		return data;
	};

	// Return the current parse tree state.
	var valueOf = function () {
		return this.parse_tree;
	};

	// toJSON - render the current parse tree to JSON format.
	var toJSON = function () {
		return JSON.stringify(this.parse_tree);
	};

	// Render parse tree as string.
	var toString = function () {
		var self = this,
			dates = Object.keys(this.parse_tree),
			lines = [];
		
		dates.sort();
		dates.forEach(function (dy, i) {
			var times = Object.keys(self.parse_tree[dy]);
			lines.push(dy);
			times.sort();
			times.forEach(function (tm) {
				var tags = "", maps = "", notes = "", rec;
				
				rec = self.parse_tree[dy][tm];
				if (typeof rec === "string") {
					notes = rec;
				} else {
					if (typeof rec.map !== "undefined" &&
							rec.map !== false) {
						maps = [
							rec.map.project_name,
							rec.map.task
						].join(", ") + "; ";
					}
					if (typeof rec.tags !== "undefined" &&
							rec.tags !== false) {
						tags = rec.tags.join(", ") + "; ";
					}
					if (typeof rec.notes !== "undefined") {
						notes = rec.notes;
					}
				}

				lines.push([
					tm,
					"; ",
					tags,
					maps,
					notes
				].join(""));
			});
		});
		
		return lines.join("\n\n");
	};

	// addEntry - a new entry to the existing parse tree
	// e.g. {date: "2012-11-03", start: "09:00:00", end: "11:45:00", 
	// notes: "This is a demo", tags:["demo"]}
	// @param entry - an object with properties of date, start, end, notes and tags
	// or a string to run through the parser.
	// 
	var addEntry = function (entry, callback, options) {
		var result, day, dy, tm, time_range;

		day = new Date();
		dy = YYYYMMDD(day);
		tm = HHMM(day);

		this.defaults.save_parse = true;
		
		if (typeof entry === "string") {
			if (entry.trim().match(/([0-1][0-9]\/[0-3][0-9]\/[0-9][0-9][0-9][0-9]|[0-9][0-9][0-9][0-9][\s]*-[0-1][0-9]-[\s]*[0-3][0-9])$/)) {
				this.working_date = YYYYMMDD(entry.trim());
			} else {
				result = this.parse(entry, callback, options);
			}
		} else if (typeof entry === "object") {
			// Make sure we have all the fields.
			switch (typeof entry.date) {
			case 'object':
				if (typeof entry.date === "object" &&
						typeof entry.date.getFullYear === "function") {
					day = entry.date;
					entry.date = YYYYMMDD(day);
					this.working_date = entry.date;
				}
				break;
			case 'number':
				day = new Date(entry.date);
				entry.date = YYYYMMDD(day);
				break;
			case 'undefined':
				entry.date = dy;
				break;
			}
			
			switch (typeof entry.start) {
			case 'object':
				if (typeof entry.start === "object" &&
						typeof entry.start.getHours === "function") {
					day = entry.start;
					entry.start = HHMM(day);
				}
				break;
			case 'number':
				day = new Date(entry.start);
				entry.start = HHMM(day);
				break;
			case 'undefined':
				entry.start = tm;
				break;
			}

			switch (typeof entry.end) {
			case 'object':
				if (typeof entry.end === "object" &&
						typeof entry.end.getHours === "function") {
					day = entry.end;
					entry.end = [
						String("0" + day.getHours()).substr(-2),
						String("0" + day.getMinutes()).substr(-2)
					].join(":");
				}
				break;
			case 'number':
				day = new Date(entry.end);
				entry.end = [
					String("0" + day.getHours()).substr(-2),
					String("0" + day.getMinutes()).substr(-2)
				].join(":");
				break;
			case 'undefined':
				entry.end = tm;
				break;
			}

			if (typeof entry.notes === "undefined") {
				entry.notes = "";
			}
			if (typeof entry.map === "undefined") {
				entry.map = false;
			}
			if (typeof entry.tags === "undefined") {
				entry.tags = [];
			}
			
			if (typeof this.parse_tree[entry.date] === "undefined") {
				this.parse_tree[entry.date] = {};
			}
			time_range = [
				entry.start,
				entry.end
			].join(" - ");
			if (typeof this.parse_tree[entry.date][time_range] ===
					"undefined") {
				this.parse_tree[entry.date][time_range] = {};
			}
			this.parse_tree[entry.date][time_range].map = entry.map;
			this.parse_tree[entry.date][time_range].notes = entry.notes;
			this.parse_tree[entry.date][time_range].tags = entry.tags;
			result = this.parse_tree[entry.date][time_range];
		} else {
			throw "Don't know how to process type: " + typeof entry;
		}
		return result;
	};


	Stn.prototype.valueOf = valueOf;
	Stn.prototype.toString = toString;
	Stn.prototype.toJSON = toJSON;
	Stn.prototype.YYYYMMDD = YYYYMMDD;
	Stn.prototype.HHMM = HHMM;
	Stn.prototype.reset = reset;
	Stn.prototype.parse = parse;
	Stn.prototype.error = error;
	Stn.prototype.errorCount = errorCount;
	Stn.prototype.messages = messages;
	Stn.prototype.addEntry = addEntry;
	
	global.Stn = Stn;
	global.Stn = Stn;
	global.toString = toString;
	global.toJSON = toJSON;
	global.YYYYMMDD = YYYYMMDD;
	global.HHMM = HHMM;
	global.reset = reset;
	global.parse = parse;
	global.error = error;
	global.errorCount = errorCount;
	global.messages = messages;
	global.addEntry = addEntry;

	if (exports !== undefined) {
		exports.Stn = Stn;
		exports.toString = toString;
		exports.toJSON = toJSON;
		exports.YYYYMMDD = YYYYMMDD;
		exports.HHMM = HHMM;
		exports.reset = reset;
		exports.parse = parse;
		exports.error = error;
		exports.errorCount = errorCount;
		exports.messages = messages;
		exports.addEntry = addEntry;
	}
}(this, exports));
