[![build status](https://secure.travis-ci.org/rsdoiel/stn.png)](http://travis-ci.org/rsdoiel/stn)
stn - Simple Time Notation
===============================


# Overview

I've often found it necessary to keep track of time spent on projects or 
activities.  Every "tracking system" I've used has worked for me at some level
accept one. I always forget to use them. I forget because they break my 
workflow. I work with allot of text files so the system that works for me
is a text file log. Over time I have simplified that format which has made it 
easy to enter, read or parsing in a program. This module is an implementation 
of my current practice of writing a simple time notation. It was inspired
by other simple formats like Textile and markdown but rather than focus
on rendering to HTML this library's focus is to render to a JSON structure.

Here's the summary view of the notation. Dates go in a single line by 
themselves. Dates are in the YYYY-MM-DD format (e.g. November 10, 2012 would be
typed 2012-11-10) and are applied to all following time entries until another
date is encountered.  The assumed date is always today. Time entries take up 
a single line and start with a time range. Time ranges are in the form of 
HH:MM and do not assume 24hr or 12hr representation.  The start time and end
time are separated by a hyphen. The range itself is terminated by a semi-colon.
The time range can be followed by "tags". Tags are a comma separated list of words. The tag list is terminated by a semi-colon.  A tag list is optional. 
The the last semi-colon to the end of the line is the time entry.  Here's
and example of a recording of travel and a meeting on November 6, 2012 -

```shell
	2012-11-06
	
	7:45 - 8:30; travel; train to meeting
	
	8:30 - 12:00; meeting; Met with standing committee for secret project of world domination by miniature sentient petunias.
```


# Notation details

## Dates of entries

A line which contains only a numerically formatted a date (e.g. YYYY-MM-DD 
format) indicates the start of a log entries for a particular day.  It is 
typed only once. All time entries after that are affiliated with that day.


E..g Say I'm entering time for November 3, 2011. I would note it one a single 
line as-

```
	2011-11-03
```

Any following entries would then refer to that date until a new date was encountered.


## Time entries

An entry is a line which indicates an activity to be tracked. An entry line 
begins with a start time, a single dash and an end time followed by a space or 
semi-colon. It would be in the form of "HH:MM - HH:MM" or "HH:MM - now" where 
the word "now" is short hand for insert current time here. It can be used to 
calculate the amount of time spent. The time range entry is followed by an 
optional keyword project/task string and a description of the activity.  

I usually follow this with a semi-colon to visually separate the time range 
from my notes about the project reference and activity description. After the 
time range until the next semi-colon is a keyword or project name I will use to 
associate the activity with. Finally the rest of the line training after the 
semi-colon is my note about the activity I was doing.  If I was debugging code 
on a project call "timesheet" from 8:30 AM until 1:00 PM (i.e. 13:00) I would 
note it as

```
	8:30 - 1:00; timesheet; debugging parsing code.
```

If could also look like this

```
	8:30 - 13:00 timesheet; debugging parsing code.
```

The second nation is better. With the first notation the parser will see that
the hour 8 is greater than the hour 1 and assume you ment to add 12 to the 1. The problem comes when you try to record something like 6:00 - 7:00 where 7:00
really is 7:00pm. The parser will mistakenly assume you intended one hour duration and not 13.

Any paragraphs of text that appear after the new line will be ignored until 
another time range or new date is encountered.

# Embedding JSON

Sometimes you need to track extra things (e.g. weight, height, sleep). You can
add extra data by typing in JSON blobs. These blobs need to be on a single line and must start and end with a curly bracket (e.g. {lbs: 100, meters: 3.1}).  The parse tree will not include a entry for that preceding date
or time called meta. In this way you can quickly note simple things without
having to extend the parser.

# Example timesheet notation

In the following example is time entries for November 19, 2011 working on 
simple timesheet parsing project.


```text
	2012-11-19

	// A meta entry which records pounds and meters associated with date
	// Nov. 19, 2011
	{lbs: 175.0, meters: 2.9}
	
	8:30 - 11:00; timesheet notation; Writing a README.md describing my simple timesheet notation.
	
	11:00 - 12:00; timesheet notation; Drafting a NodeJS example parser for the notation.
	
	1:00 - 3:00; timesheet notation; debugging parser, realizing I can simplify my notation further and drop the first semi-colon.

	Realized I need to keep some backward compatibility for my parse so I don't have to rewrite/edit my ascii timesheet file.
```

In the last entry starting with "Realized" is skipped in parsing because it is neither a date, time range or JSON blob


## Rational

Over the years I've use various ASCII notation systems to produce web pages for 
projects and the nice thing about Simple Timesheet Notation is that is very 
limited in it's assumptions. It is limited enough to be quickly to typed while 
being easy to read.  It doesn't conflict with the ASCII notation system
de-jour. E.g. This notation can co-exist in a Markdown or Textile format 
document.

# output of notation

In recent years I've found outputting data structures in JSON convenient 
regardless of programming language I'm working in. It seems like a good idea 
then to focus this module on generating JSON structures from the parsing 
process. Then wiring up the connection between a time tracking system (e.g.
Basecamp, Harvest) is reasonably easy to do and maintain. The simplest useful 
JSON object generated from the previous example could look like

```JavaScript
	{
		"2011-11-19": {
			"meta": {lbs: 175.0, meters: 2.9},
			"8:30 - 11:00": "timesheet notation; Writing a README.md describing my simple timesheet notation.",
			"11:00 - 12:00": "timesheet notation; Drafting a NodeJS example parser for the notation.",
			"1:00 - 3:00": [
				"timesheet notation; debugging parser, realizing I can simplify my notation further and drop the first semi-colon.",
				"Realized I need to keep some backward compatibility for my parse so I don't have to rewrite/edit my ascii timesheet file."
			]
		}
	}
```

This is fine if I want to generate a summary for my own reading.  To be useful 
to a time tracking system I often need more. An alternative representation 
might look like

```JavaScript
	{
		"2011-11-19": {
				"meta": {lbs: 175.0, meters: 2.9},
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
```

From either of these it is a simple process to derive specific forms needed by 
specific systems. Early versions of harvest used a structure similar to

```JavaScript
	{
		"notes":"description of activity ...",
		"hours":"3.00",
		"project_id":"#####","task_id":"###",
		"spent_at":"SOME_DATE_HERE"
	} 
```

posted to their API for adding a daily entry. A simple keyword(s) set can map 
to a numeric project and task id.  Dates are gathered along with times so hours 
can be calculated as spent_at can be derived too.

# Misc notes

## 12 hour versus 24 hour time notation

If you not using a twelve hour clock it is assume the first time before the 
dash is the start time and the second entry is the end time.  Calculating hours 
then evolves looking at the relationship of those two times to each other.  If 
the start time is smaller then the end time then simple subtraction of the
start from the end calculates hours spent.  If that is not the case (i.e. you 
have crossed the noon boundary) then you will need to normalize the values 
before subtracting the start from end time.

# Examples

## notation to JSON blob

Parsing a text file containing timesheet notation name like 
_test-samples/timesheet-1.txt_

```JavaScript
	var fs = require('fs'), 
		stn = require('./stn');
	
	text = fs.readFileSync('test-samples/timesheet-1.txt');
	results = stn.parse(text, {normalize_date:true, hours: true, tags: true});
	console.log(JSON.stringify(results));
```

Results would be a json object looking like test-samples/timesheet-1b.json.  
You could then take this JSON blob and send it to a time keeping system.

## Incremental parsing

Let's say you were parsing incoming text a line at a time. How would you
do that with stn?

```JavaScript
	var fs = require("fs"),
		// Engine is a module that listens for input
		// and services 'data' and 'end' events.
		engine = require("./engine"),
		stn = require("stn"),
		timesheet = new stn.Stn();
		
	// First setup for incremental parsing.
	timesheet.reset();
	
	// You'd create your listen service here. I'm calling it
	// engine for this example and assume that is supports 
	// events called 'data' and 'end'
	engine.createServer(function(req, res) {
		req.on("data", function (err, buf) {
			var text;
			if (err) {
				throw err;
			}
			timesheet.addEntry(buf.toString());
		}).on("end", function (err) {
			fs.writeFile("timesheet.txt", timesheet.toString(),
			function (err) {
				if (err) {
					throw err;
				}
				console.log("Wrote timesheet to disc.");
			});
			
		});
		// We could also echo out the full parse tree too
		res.writeHead({"Content-Type", "application/json"});
		res.end(timesheet.toJSON());
	}).listen(9000);	
```

# But what about persistence?

If you're in a NodeJS environment you can use stnfs.js in the extra's folder. This extends
the basic stn.js adding readFile(), readFileSync(), writeFile(), and writeFileSync() based
on the NodeJS fs module. See tests/stnfs_test.js for examples of this in action.

```shell
	node tests/stnfs_test.js
```

# tag and project relationship

Tag and project relationships can be passed in at the time a the parser
is initialized (e.g. see extras/harvest-csv.js).  Sometimes you don't know
what that relationship is ahead of time or want to change that relationship
mid parse stream.  To allow for that stn.parse() will recognize some
simple directives. Directives begin with an at sign (i.e. "@").  Two 
directives will be supported as of version 0.0.9.

* @tag-default TAG
* @tag TAG; PROJECT_NAME; CLIENT_NAME;

Where @tag-default designates a default tag to apply when processing entries
containing only a time range and description and @tag is a semi-column separated list consisting of a tag, a project name and client name. 

Here's an example setting up these tag relationships -

```shell
	@tag travel; World Domination; Dr. Evil
	@tag meeting; World Domination; Dr. Evil
	@tag-default meeting
	
	2012-11-06
	
	7:45 - 8:30; travel; train to meeting
	
	8:30 - 12:00; meeting; Met with standing committee for secret project of world domination by miniature sentient petunias.
```




