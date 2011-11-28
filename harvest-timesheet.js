//
// harvest-timesheet.js - a command line NodeJS program to process a 
// simple ASCII timesheet formatted file prepare a bash script to
// submit it to the Harvest APIs.
//
// author: R. S. Doiel, <rsdoiel@gmail.com>
//
// copyright (c) 2011
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.2-prototype
//
//

var		util = require('util'),
		crypto = require('crypto'),
		fs = require('fs'),
		md5 = function (data) {
                return crypto.createHash("md5").update(data).digest("hex");
        },
        opt = require("./options"),
        stn = require('./stn');

var today = new Date(),
	config, defaults = {
	user : "johndoe@example.com",
	password : "something-very-secret"	,
	start : today.getFullYear() + '-01-01',
	end : today.getFullYear() + '-' + 
			String("0" + (today.getMonth() + 1)).substr(-2) + '-' +
			String("0" + today.getDate()).substr(-2),
	url : "https://www.harvestapp.com",
	timesheet : "./timesheet.txt"
};

// Use a default configuration file called config.js if available
try {
	config = require("./config");
} catch(err) {
	config = defaults;
}

Object.keys(defaults).forEach(function(ky) {
	if (config[ky] === undefined) {
		config[ky] = defaults[ky];
	}
});

USAGE = function () {
	return "\n\n node harvest-timesheet.js -- process a simple timesheet log and send to Harvest.\n\n SYNOPSIS\n\n\t\tnode harvest-timesheet.js\t--user=johndoe@example.com --password=something-very-secret \\ \n\t\t\t--start=\"2011-01-01\" --end=\"now\" --timesheet=timesheet.txt\n\n Processes the file called timesheet.txt in the current directory and sends to Harvest.";
};

opt.set(['-h','--help'], function () {
	var help = opt.help(), ky;

	console.log(USAGE() + "\n\n OPTIONS\n");
	for (ky in help) {
		console.log("\t" + ky + "\t\t" + help[ky]);	
	}
	console.log("\n\n");
	process.exit(0);
}, "This help document.");

opt.set(['-u', '--user'], function (user) {
	config.user = user;
}, "Set the username for connecting to Harvest. E.g. john.doe@example.com");

opt.set(['-p','--password'], function(password) {
	config.password = password; //md5(password);
}, "Set the password to send when connecting to Harvest.");

opt.set(['-s','--start'], function(start_date) {
	config.start = start_date;
}, "Set the start date for reporting in YYYY-MM-DD format.");

opt.set(['-e','--end'], function(end_date) {
	if (end_date.length == 10 &&
		end_date.match(/20[0-2][0-9]-[0-3][0-9]-[0-3][0-9]/)) {
		config.end = end_date;
	} else {
		config.end = today.getFullYear() + '-' + 
			String("0" + (today.getMonth() + 1)).substr(-2) + '-' +
			String("0" + (today.getDate())).substr(-2);
	}
}, "Set the last date for reporting.  Usually a date in YYYY-MM-DD format or 'now'.");

opt.set('--url', function (url) {
	config.url = url;
}, "\tSet the URL to use for the Harvest API. Default is https://usc.harvestapp.com");

opt.set('--timesheet', function (timesheet) {
	config.timesheet = timesheet;
}, "Set the name/path to the timesheet file to read. Defaults to ./Time_Sheet.txt");


var push_event = function (config, msg, payload) {
	console.log([
		"# " + msg,
		"curl " + config.url + "/daily/add \\",
		"\t-H 'Accept: application/json' \\",
		"\t-H 'Content-Type: application/json' \\",
		"\t-u " + config.user + ':' + config.password + " \\",
		"\t-d '" + JSON.stringify(payload) + "'"
	].join("\n") + "\n");
};
var format_dt = function (ymd) {
	var dt = new Date(), tmp;
	dt.setDate(ymd.substr(-2));
	dt.setMonth(Number(ymd.substr(5,2) - 1));
	dt.setYear(ymd.substr(0,4));
	tmp = dt.toDateString().split(' ');
	return tmp[0] + ', ' + tmp[2] + ' ' + tmp[1] + ' ' + tmp[3];
};

var in_range = function(config, dy) {
	var start = Number(config.start.replace(/-/g,'')),
		end = Number(config.end.replace(/-/g,'')),
		cur = Number(dy.replace(/-/g,''));
	if (cur >= start && cur <= end) {
		return true;
	}
	return false;
};

var run = function (config, msg) {
	console.log([
		"#!/bin/bash\n#",
		"# Running with " + msg + "\n",
		"# Get signin to use API",
		"curl " + config.url + "/account/who_am_i \\",
		"\t-H 'Accept: application/json' \\",
		"\t-H 'Content-Type: application/json' \\",
		"\t-u " + config.user + ':' + config.password
		].join("\n") + "\n");

	fs.readFile(config.timesheet, function (err, timesheet) {
		if (err) throw err;
		
		var results = stn.parse(timesheet, {normalize_date:true, hours:true,tags:true}),
			sum = 0;
		
		Object.keys(results).forEach(function(dy) {
			Object.keys(results[dy]).forEach(function (hr) {
				if (in_range(config, dy)) {
					sum += 1;
					push_event(config, sum + ": " + dy + ", " + hr, {
						notes: ([results[dy][hr].tags.join(', '), results[dy][hr].notes].join('; ')), hours:results[dy][hr].hours, 
						project_id:"1409928", task_id:"87282",
						spent_at: format_dt(dy)
					}); 
				}
			});
		});
console.log("# DEBUG config.start:" + config.start);
console.log("# DEBUG config.end:" + config.end);
	});
};


// Main Logic
(function (argv) {
	opt.parse(argv);
	msg = "";
	Object.keys(config).forEach(function (ky) {
		switch(ky) {
			case 'password':
				break;
			case 'start':
			case 'end':
				msg += "\n#\t" + ky + ": " + config[ky];
				break;
			default:
				msg += "\n#\t" + ky + ": " + config[ky];
				break;
		}
	});
	run(config, msg);
}(process.argv));




