//
// Timesheet service demo using stn and
// Felixge's dirty DB
//
// @author: R. S. Doiel, <rsdoiel@gmail.com>
// copyright (c) 2012 all rights reserved
// Released under the Simplified BSD License
// See: http://opensource.org/licenses/bsd-license.php
//
var http = require("http"),
    url = require("url"),
    path = require("path"),
    // Options parser and RESTful request dispatcher
    opt = require("opt"),
    // TBone a HTML generation library
    TBone = require("tbone"),
    // Simple Timesheet Notation Parser
    stn = require("../stn"),
    // A JS based key/value store
    dirty = require("dirty");

var config = {
       host: "localhost",
       port: "9001",
       db_name: "timesheets.dirty"
    },
    op = new opt.Opt();

// Pickup environment variables for running on services like
// Nodejitsu
if (typeof process.env.PORT !== "undefined") {
    config.port = process.env.PORT;
}

// Look for a configuration file on disc
// and load it.
config = op.configSync(config, [
    "./timesheet.json",
    path.join(process.env.HOME, ".timesheetrc"),
    "/usr/local/etc/timesheet.json",
    "/etc/timesheet.json"
]);

// Pickup a port number from the environment when running under
// Cloud 9 or Nodejitsu.
if (typeof process.env.PORT !== "undefined") {
	config.port = process.env.PORT;
}

// Setup the help message parts
op.optionHelp("USAGE: node " + path.basename(process.argv[1]),
    "SYNOPSIS: A simple timesheet processing service\n\t" +
        "node " + path.basename(process.argv[1]) +
        " --config=service.json\n\n",
    "copyright (c) 2012 all rights reserved\n" +
        " Released under the Simplified BSD License.\n" +
        " See: http://opensource.org/licenses/bsd-license.php\n"
);

// Define some command line options
op.consume(true);
op.option(["-c", "--config"], function (param) {
   var new_config, ky;
   if (typeof param === "undefined") {
      op.usage("Must include a configuration filename", 1);
   }
   // This blocks but that's OK since
   // we're still in the service intialization phase.
   new_config = JSON.parse(fs.readFileSync(param).toString());
   if (!new_config) {
      op.usage("Problem parsing " + param, 1);
   }
   // override default configuration
   for (ky in new_config) {
      if (new_config.hasOwnProperty(ky)) {
          config[ky] = new_config[ky];
      }
   }
   op.consume(param);
}, "Use a specific configuration file.");

op.option(["-h", "--help"], function () {
   op.usage();
}, "This help page.");

// Process argv and make sure we have the 
// minimum configuration needed to run.
op.optionWith(process.argv);

if (config.db_name === undefined) {
  op.usage("Configuration missing db_name property", 1);
}
if (config.port === undefined) {
  op.usage("Configuration missing port property", 1);
}
if (config.host === undefined) {
   op.usage("Configuration missing host property", 1);
}

// Now define some routes and how your service will work
// using opt's rest* methods.

// A general sign in page definition since it may be
// used at several points
var signin_page = function (request, response, redirect_to) {
};

// The SPA - single page app providing a view to 
// interact with the time sheet service.
var index_page = function (request, response) {
};

// Define a home page/start page. Everything else
// beyond signin, singout is an API call.
op.rest("get", /|index|index.*/i,
    index_page,
    "Display the main page, setup the SPA to interact with timesheet content");

// sign in with Browser ID
op.rest("get", /^signin/,
function (request, response) {
   var redirect_to = "/index.html";

   if (isAuthenticated(request) === false) {
      // If not authenticated
      signing_page(request, response, "/signin");
   } else {
      // if ?redirect= not provided send to index page
      // Authenticate via Browser ID
      // Setup a session for this authenticated user
   }
   
}, "Sign into timesheet system");

// Process sign in request (e.g. a post)
op.rest("post", /^signin/i,
function (request, response) {
    // Evaluate Browser ID sign on,
    // if failure then redirect to signin page
    // if successful send to ?redirect=*
}, "Process signin request");

op.rest("get", /^signout/, function (request, response) {
   // Remove the session and sign out user from system
   // Redirect to index
}, "Sign out of the timesheet system");

// Define getting a single users's current state.
op.rest("get", /^\w+/i, function (request, response) {
    // fetch record from dirty and display current state
}, "Get your timesheet");

// Update a user's timesheet
op.rest("post", /^w+/i, function (request, response) {
    // Validate the user is signed in and properly
    // authenticated to update their time sheet. 
    // Otherwise redirect to the signin page

    // Validate post requested
    // Get current parse tree from dirty
    // Add additional content in simple time sheet notation
    // Update dirty's record and return
    // New state.
}, "Update your time sheet");

// Finally define the default rule (usually 404)
var status404 = function (req, res) {
            res.writeHead(404, {"content-type": "text/plain"});
            res.end("File not found. " + req.url);
};
op.rest("get", new RegExp("^/*"), status404);


// connect to database resource, etc.
db = dirty(config.db_name);

// Fire up the database and start the web server/service
db.on("load", function () {
   // Now we should be ready to start up the service
   http.createServer(function (request, response) {
      op.restWith(request, response);
   }).listen(config.port, config.host);
   console.log("Listening for http service on ", config.host, config.port);
});
