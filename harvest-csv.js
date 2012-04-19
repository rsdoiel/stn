//
// harvest-csv.js - generate a CSV file suitable to import into Harvest.
//
// author: R. S. Doiel, <rsdoiel@gmail.com>
//
// copyright (c) 2011
//
// Released under New the BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
// revision: 0.0.2
//
//

var fs = require('fs'),
	opt = require("opt"),
    stn = require('stn');

var today = new Date(),
	config, defaults = {
        client:'ACME Web Productions, Inc.',
        project_name: 'General',
	    task_name: 'Misc',
        first_name: 'John',
        last_name: 'Doe',
        start : today.getFullYear() + '-01-01',
	    end : today.getFullYear() + '-' + 
			String("0" + (today.getMonth() + 1)).substr(-2) + '-' +
			String("0" + today.getDate()).substr(-2),
        timesheet : false
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

var USAGE = function () {
	return "\n\n node harvest-timesheet.js -- process a simple timesheet log and send to Harvest.\n\n SYNOPSIS\n\n\t\tnode harvest-timesheet.js\t--first-name=john --last-name=doe \\ \n\t\t\t--start=\"2011-01-01\" --end=\"now\" --timesheet=timesheet.txt\n\n Processes the file called timesheet.txt in the current directory and sends to Harvest.";
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

opt.set(['-f', '--first-name'], function (first_name) {
	config.first_name = first_name;
}, "Set the first name column contents. E.g. John");

opt.set(['-l', '--last-name'], function (last_name) {
    config.last_name = last_name;
}, "Set the last name column contents. E.g. Doe");

opt.set(['-c', '--client-name'], function (client_name) {
    config.client_name = client_name;
}, "Set the last name column contents. E.g. ACME Web Products, inc.");

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

opt.set('--timesheet', function (timesheet) {
	config.timesheet = timesheet;
}, "Set the name/path to the timesheet file to read. Defaults to ./Time_Sheet.txt");

opt.set(['-p', '--project-name'], function (project_name) {
	config.project_name = project_name;
}, "Set the default project name to use.");

opt.set(['-t', '--task-name'], function (task_name) {
	config.task_name = task_name;
}, "Set the default task name to use.");

var in_range = function(config, dy) {
	var start = Number(config.start.replace(/-/g,'')),
		end = Number(config.end.replace(/-/g,'')),
		cur = Number(dy.replace(/-/g,''));
	if (cur >= start && cur <= end) {
		return true;
	}
	return false;
};

var run_csv = function(config) {
	if (! config.timesheet) {
		console.error("\n WARNING: Missing timesheet file." + USAGE());
		process.exit(1);
	}
	


	fs.readFile(config.timesheet, function (err, timesheet) {
		if (err) throw err;
		
		var results = stn.parse(timesheet,
                {normalize_date:true, hours:true,tags:true});
        /* Eight columns for CSV file

            Date (YYYY-MM-DD or M/D/YYYY formats. For example: 2008-08-25 or 8/25/2008)
            Client
            Project
            Task
            Note
            Hours (in decimal form, without any stray characters. For example: 7.5, 3, 9.9)
            First name
            Last name
        */

        console.log('"date","client","project","task","note","hours","first name","last name"');
		Object.keys(results).forEach(function(dy) {
			Object.keys(results[dy]).forEach(function (hr) {
				if (in_range(config, dy)) {
					console.log('"' + [dy, config.client_name, config.project_name, config.task_name, String([results[dy][hr].tags.join(', ') + " " + results[dy][hr].notes].join(' ')).replace(/"/g,'&quot;').trim(), results[dy][hr].hours,config.first_name,config.last_name ].join('","') + '"'); 
				}
			});
		});
	});
};


// Main Logic
(function (argv) {
	opt.parse(argv);
	run_csv(config);
}(process.argv));

