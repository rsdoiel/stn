var fs = require('fs'), 
	util = require('util'),
	stn = require('./stn');

text = fs.readFileSync('test-samples/timesheet-1.txt');
results = stn.parse(text, {normalize_date:true, hours: true, tags: true});
console.log(util.inspect(results));
