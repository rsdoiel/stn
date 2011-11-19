Simple Timesheet Notation
=========================
revision 0.0.1-alpha
--------------------

# Overview

Over the years of working I have found it necessary for various reasons to keep track of time spent on projects or activities.  Most recently these have been for billing and management purposes where I work. Every "tracking system" I've used has worked for me at some level accept one.  That is a simple ASCII log
short hand I used to know what to enter in the "official systems" I've used.  The notation system that I have evolve maybe overly simple for many people but it is easy for me to read and easy to type while not making demands on me for calculations.

The system has evolved to leverage three things about my notes to myself

* Must time systems need to know the date something happens and I also normally know what the current date is
* I can train myself to note the starting time when I'm working (or can figure it out easy enough in the moment of completing my work)
* I can remember to use "now" as a place holder for the finish time and when I start the next task I usually can remember to replace "now" with the time of the task switch
* I normally work less significantly less then twelve hours in a contiguous stretch of work so I can notate time in 12 hour format rather then 24 hour notation which always slows me down in typing after noon as pasted
* I can use sort of short keyword(s) to know which project/activity the task is related to
* I can keep short notes about the activity to help me later when I forgot what I was doing
* Knowing when I started something and finished was more helpful then trying to member the number of hours and minutes I spent doing something
* If you're passing the midnight boundary then you would create a new entry for a new day continuing your activity

In free form this is problematic and labor intensive to re-input into most time tracking systems so I've evolved a short hand notation.

# the simple timesheet notation

## Finding the date that I did something

A line which contains only a numerically formatted a date (.e.g. MM/DD/YYYYY or YYYY-MM-DD format) starts indicates the start of a log record for a particular day.  It is typed only once.  If I'm entering time for November 3, 2011 I would note it one a single line as 

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

# Example notation

In the following example is time entries for November 19, 2011 working on simple timesheet parsing project.

	11/19/2011
	
	8:30 - 11:00; timesheet notation; Writing a README.md describing my simple timesheet notation.
	
	11:00 - 12:00; timesheet notation; Drafting a NodeJS example parser for the notation.
	
	1:00 - 3:00; timesheet notation; debugging parser, realizing I can simplify my notation further and drop the first semi-colon.

	Realized I need to keep some backward compatibility for my parse so I don't have to rewrite/edit my ascii timesheet file.


In the last entry starting with "Realized" the parse could either associate that entry with the 1:00 until 3:00 time range or just ignore it.  In my current job's time system they want only a short description so I just ignore it but it's in my log for my own benefits.

## notes on keeping it simple

Over the years I use various ASCII notation systems to produce web pages for projects and the nice thing about Simple Timesheet Notation is that is very limited in it's assumption. It is limited enough to be quickly to typed while being easy to read.  It doesn't conflict with the ASCII notation system de-jour. E.g. This notation can co-exist in a Markdown or Textile format document.

# output of notation

In recent years I've found outputting data structure in JSON convenient regardless of programming language I'm working in. It seems like a good idea then to focus this document on what data structure would be produce rather then how to send this data into another system (that will very of course on the system being integrated, e.g. Harvest, Basecamp). The simplest useful JSON object generated from the previous example could look like

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

An alternative representation might look like

	{
		"11/19/2011": {		
				"8:30 - 11:00": {
					"project":"timesheet notation",
					"notes": "Writing a README.md describing my simple timesheet notation." },
				"11:00 - 12:00": {
					"project":"timesheet notation",
					"notes": "Drafting a NodeJS example parser for the notation."},
				"1:00 - 3:00": {
					"project":"timesheet notation",
					"notes":[
						"debugging parser, realizing I can simplify my notation further and drop the first semi-colon.",
						"Realized I need to keep some backward compatibility for my parse so I don't have to rewrite/edit my ascii timesheet file."
					]
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







