[![build status](https://secure.travis-ci.org/rsdoiel/opt.png)](http://travis-ci.org/rsdoiel/opt)
stn - Simple Timesheet Notation
===============================


# Overview

I've often found it necessary to keep track of time spent on projects or activities.  Every "tracking system" I've used has worked for me at some level accept one. I always forget to use them. I forget because they break the workflow.  I work with allot of text files so the system that works for me is a text file log. Over time I have simplified that format which has made it easy to enter, read or parsing in a program. This module is an implementation of my current practice of writing a simple timesheet notation.

Here's the summary view of the notation. Dates go in a single line by themselves and are applied to all following time entries; time entries take up a single line and start with a time range;  Time ranges can be followed by "tags" which are terminated by a semi-colon if present;  the end of line terminates the entry description that will be submitted to the time system.  Text which is not part of a date or time entry is ignored by the parser and assumed to be extraneous notes. This allows me to have working notes as well as time information in the same file.


# Notation details

## Dates of entries

A line which contains only a numerically formatted a date (.e.g. MM/DD/YYYYY or YYYY-MM-DD format) indicates the start of a log entries for a particular day.  It is typed only once.  If I'm entering time for November 3, 2011 I would note it one a single line as 

	11/03/2011

or

	2011-11-03

Any following entries would then refer to that date until a new date was encountered.


## Time entries

An entry is a line which indicates an activity to be tracked. An entry line begins with a start time, a single dash and an end time followed by a space or semi-colon. It would be in the form of "HH:MM - HH:MM" or "HH:MM - now" where the word "now" is short hand for insert current time here.  It can be used to calculate the amount of time spent. The time range entry is followed by an optional keyword project/task string and a description of the activity.  

I usually follow this with a semi-colon to visually separate the time range from my notes about the project reference and activity description. After the time range until the next semi-colon is a keyword or project name I will use to associate the activity with. Finally the rest of the line training after the semi-colon is my note about the activity I was doing.  If I was debugging code on a project call "timesheet" from 8:30 AM until 1:00 PM (i.e. 13:00) I would note it as

	8:30 - 1:00; timesheet; debugging parsing code.

If could also look like this

	8:30 - 1:00 timesheet; debugging parsing code.

Any paragraphs of text that appear after the new line will be ignored until another time range or new date is encountered.

# Example timesheet notation

In the following example is time entries for November 19, 2011 working on simple timesheet parsing project.

	11/19/2011
	
	8:30 - 11:00; timesheet notation; Writing a README.md describing my simple timesheet notation.
	
	11:00 - 12:00; timesheet notation; Drafting a NodeJS example parser for the notation.
	
	1:00 - 3:00; timesheet notation; debugging parser, realizing I can simplify my notation further and drop the first semi-colon.

	Realized I need to keep some backward compatibility for my parse so I don't have to rewrite/edit my ascii timesheet file.


In the last entry starting with "Realized" is skipped in parsing because it is neither a date or time entry.

## Rational

Over the years I've use various ASCII notation systems to produce web pages for projects and the nice thing about Simple Timesheet Notation is that is very limited in it's assumptions. It is limited enough to be quickly to typed while being easy to read.  It doesn't conflict with the ASCII notation system de-jour. E.g. This notation can co-exist in a Markdown or Textile format document.

# output of notation

In recent years I've found outputting data structures in JSON convenient regardless of programming language I'm working in. It seems like a good idea then to focus this module on generating JSON structures from the parsing process. Then wiring up the connection between a time tracking system (e.g. Basecamp, Harvest) is reasonably easy to do and maintain. The simplest useful JSON object generated from the previous example could look like

	{
		"11/19/2011": {		
			"8:30 - 11:00": "timesheet notation; Writing a README.md describing my simple timesheet notation.",
			"11:00 - 12:00": "timesheet notation; Drafting a NodeJS example parser for the notation.",
			"1:00 - 3:00": [
				"timesheet notation; debugging parser, realizing I can simplify my notation further and drop the first semi-colon.",
				"Realized I need to keep some backward compatibility for my parse so I don't have to rewrite/edit my ascii timesheet file."
			]
		}
	}

This is find if I want to generate a summary for my own reading.  To be useful to a time tracking system I often need more. An alternative representation might look like

	{
		"11/19/2011": {		
				"8:30 - 11:00": {
					"project":"timesheet notation",
					"notes": "Writing a README.md describing my simple timesheet notation.", "hours":"2.5","tags":["stn project"] },
				"11:00 - 12:00": {
					"project":"timesheet notation",
					"notes": "Drafting a NodeJS example parser for the notation.", "hours":"1", "tags":["stn project"]},
				"1:00 - 3:00": {
					"project":"timesheet notation",
					"notes":"debugging parser, realizing I can simplify my notation further and drop the first semi-colon.",
                    "hours":"2",
                    "tags":["stn project"]}
			}
	}

From either of these it is a simple process to derive specific forms needed by specific systems. Early versions of harvest used a structure similar to

	{
		"notes":"description of activity ...",
		"hours":"3.00",
		"project_id":"#####","task_id":"###",
		"spent_at":"SOME_DATE_HERE"
	} 

posted to their API for adding a daily entry. A simple keyword(s) set can map to a numeric project and task id.  Dates are gathered along with times so hours can be calculated as spent_at can be derived too.

# Misc notes

## 12 hour versus 24 hour time notation

If you not using a twelve hour clock it is assume the first time before the dash is the start time and the second entry is the end time.  Calculating hours then evolves looking at the relationship of those two times to each other.  If the start time is smaller then the end time then simple subtraction of the start from the end calculates hours spent.  If that is not the case (i.e. you have crossed the noon boundary) then you will need to normalize the values before subtracting the start from end time.

# Examples

Parsing a text file containing timesheet notation name test-samples/timesheet-1.txt

	var fs = require('fs'), 
		util = require('util'),
		stn = require('./stn');
	
	text = fs.readFileSync('test-samples/timesheet-1.txt');
	results = stn.parse(text, {normalize_date:true, hours: true, tags: true});
	console.log(util.inspect(results));

Results would be a json object looking like test-samples/timesheet-1b.json.  You could then take this JSON blob and send it to a time system.

