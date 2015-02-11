#!/usr/bin/env node
//
// stn-rpt.js - generate a markdown friendly time report.
//
// author: R. S. Doiel, <rsdoiel@gmail.com>
//
// copyright (c) 2013
//
// Released under the Simplified BSD License.
// See: http://opensource.org/licenses/bsd-license.php
//
/*jslint devel: true, node: true, maxerr: 50, indent: 4,  vars: true, sloppy: true */

var fs = require("fs"),
    path = require("path"),
    opt = require("opt").create(),
    fmt = require("fmttxt"),
    stn = require('stn');

var today = new Date(),
    config = {
        client: 'ACME Web Productions, Inc.',
        project_name: 'General',
        task_name: 'Misc',
        first_name: 'John',
        last_name: 'Doe',
        start : today.getFullYear() + '-01-01',
        end : today.getFullYear() + '-' +
            String("0" + (today.getMonth() + 1)).substr(-2) + '-' +
            String("0" + today.getDate()).substr(-2),
        timesheet : false,
        map_name: false
    };

// Use a default configuration file called config.json if available
opt.config(config, [
    "harvest.cnf",
    path.join(process.env.HOME, "harvest.cnf"),
    path.join(process.env.HOME, "Dropbox", "harvest.cnf")
]);

opt.optionHelp("USAGE node " + path.basename(process.argv[1]),
    "SYNOPSIS: process a simple timesheet log and send to Harvest.\n\n EXAMPLE\n\n\t\tnode " +
        path.basename(process.argv[1]),
    "OPTIONS",
    " copyright 2011 all rights reserved\n" +
    " Released under the Simplified BSD License\n" +
    " See: http://opensource.org/licenses/bsd-license.php\n");

opt.on("ready", function (config) {
    opt.option(['-f', '--first-name'], function (first_name) {
        config.first_name = first_name;
    }, "Set the first name column contents. E.g. John");
    
    opt.option(['-l', '--last-name'], function (last_name) {
        config.last_name = last_name;
    }, "Set the last name column contents. E.g. Doe");
    
    opt.option(['-c', '--client-name'], function (client_name) {
        config.client_name = client_name;
    }, "Set the last name column contents. E.g. ACME Web Products, inc.");
    
    opt.option(['-s', '--start'], function (start_date) {
        config.start = start_date;
    }, "Set the start date for reporting in YYYY-MM-DD format.");
    
    opt.option(['-e', '--end'], function (end_date) {
        if (end_date.length === 10 &&
                end_date.match(/20[0-2][0-9]-[0-3][0-9]-[0-3][0-9]/)) {
            config.end = end_date;
        } else {
            config.end = today.getFullYear() + '-' +
                String("0" + (today.getMonth() + 1)).substr(-2) + '-' +
                String("0" + (today.getDate())).substr(-2);
        }
    }, "Set the last date for reporting.  Usually a date in YYYY-MM-DD format or 'now'.");
    
    opt.option(['--timesheet'], function (timesheet) {
        config.timesheet = timesheet;
    }, "Set the name/path to the timesheet file to read. Defaults to ./Time_Sheet.txt");
    
    opt.option(['-p', '--project-name'], function (project_name) {
        config.project_name = project_name;
    }, "Set the default project name to use.");
    
    opt.option(['-t', '--task-name'], function (task_name) {
        config.task_name = task_name;
    }, "Set the default task name to use.");
    
    opt.option(['-m', '--map'], function (map_name) {
        config.map_name = map_name;
    }, "Lookup the entry's tags in map and set client_name, task and project_name if found.");
    
    
    opt.option(["-g", "--generate"], function (param) {
        if (param) {
            fs.writeFile(param, JSON.stringify(config), function (err) {
                if (err) {
                    console.error(param, err);
                    process.exit(1);
                }
                process.exit(0);
            });
        } else {
            console.log(JSON.stringify(config));
            process.exit(0);
        }
    }, "Generate a configuration file.\n\n");
    
    
    opt.option(['-h', '--help'], function () {
        opt.usage();
    }, "This help document.");
    
    
    var in_range = function (config, dy) {
        var start = Number(config.start.replace(/-/g, '')),
            end = Number(config.end.replace(/-/g, '')),
            cur = Number(dy.replace(/-/g, ''));
        if (cur >= start && cur <= end) {
            return true;
        }
        return false;
    };
    
    var run_rpt = function (config) {
        var total_hours = 0.0;
        if (!config.timesheet) {
            console.error("\n WARNING: Missing timesheet file." + opt.usage());
            process.exit(1);
        }
        
        config.map = false;
        if (config.map_name !== false) {
            config.map = JSON.parse(fs.readFileSync(config.map_name).toString());
        }
    
        fs.readFile(config.timesheet, function (err, timesheet) {
            if (err) {
                console.error("ERROR:", err);
                throw err;
            }
            var results = stn.parse(timesheet,
                    {normalize_date: true, hours: true, tags: true, map: config.map});
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
    
            
            console.log('|',
                [
                    fmt.center("date", 10, " "),
                    fmt.center("hours", 6, " "),
                    fmt.center("client", 10, " "),
                    fmt.center("project", 10, " "),
                    fmt.center("task", 10, " "),
                    fmt.center("note", 24, " "),
                    fmt.center("first name", 12, " "),
                    fmt.center("last name", 12, " ")
                ].join(" | "),
                '|');
            console.log('+-' +
                [
                    fmt.center("-", 10, "-"),
                    fmt.center("-", 6, "-"),
                    fmt.center("-", 10, "-"),
                    fmt.center("-", 10, "-"),
                    fmt.center("-", 10, "-"),
                    fmt.center("-", 24, "-"),
                    fmt.center("-", 12, "-"),
                    fmt.center("-", 12, "-")
                ].join("-+-") +
                "-+");

            Object.keys(results).forEach(function (dy) {
                Object.keys(results[dy]).forEach(function (hr) {
                    if (in_range(config, dy)) {
                        // Track the toral hours
                        if (Number(results[dy][hr].hours)) {
                            total_hours += Number(results[dy][hr].hours);
                        }
                        if (results[dy][hr].map !== false) {
                            console.log('| ' + [
                                fmt.center(dy, 10, " "),
                                fmt.left(results[dy][hr].hours, 6, " "),
                                fmt.left(results[dy][hr].map.client_name, 10, " "),
                                fmt.left(results[dy][hr].map.project_name, 10, " "),
                                fmt.left(results[dy][hr].map.task, 10, " "),
                                fmt.left(results[dy][hr].notes, 24, " "),
								fmt.left(config.first_name, 12, " "),
								fmt.left(config.last_name, 12, " ")
							].join(' | ') + ' |');
						} else {
							console.log('| ' + [
								fmt.center(dy, 10, " "),
								fmt.left(results[dy][hr].hours, 6, " "),
								fmt.left(config.client_name || "", 10, " "),
								fmt.left(config.project_name || "", 10, " "),
								fmt.left(config.task_name || "", 10, " "),
                                fmt.left(results[dy][hr].notes, 24, " "),
								fmt.left(config.first_name, 12, " "),
								fmt.left(config.last_name, 12, " ")
							].join(' | ') + ' |');
						}
					}
				});
			});
            console.log('+-' +
                [
                    fmt.center("-", 10, "-"),
                    fmt.center("-", 6, "-"),
                    fmt.center("-", 10, "-"),
                    fmt.center("-", 10, "-"),
                    fmt.center("-", 10, "-"),
                    fmt.center("-", 24, "-"),
                    fmt.center("-", 12, "-"),
                    fmt.center("-", 12, "-")
                ].join("-+-") +
                "-+");

            console.log("Total Hours:", total_hours);
		});
	};
	
	// Main Logic
	(function (argv, config) {
		opt.optionWith(argv);
		run_rpt(config);
	}(process.argv, config));
});

