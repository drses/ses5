// To start SES under nodejs
// Adapted from https://gist.github.com/3669482

// Running the following command in a directory with the SES sources
//    $ node ses-usage.js
// Should print something like
//     Max Severity: Safe spec violation(1).
//     414 Apparently fine
//     24 Deleted
//     1 Skipped
//     Max Severity: Safe spec violation(1).
//     initSES succeeded.
//    hi

var FS = require("fs");
var VM = require("vm");

var prelude = `
var ses = ses || {};
// This severity is too high for any use other than development.
ses.maxAcceptableSeverityName = 'NEW_SYMPTOM';

(${function() {
  "use strict";
  console.log('a ', global === (1,eval)('this'));
}}());
`;

var testCases = `
(${function() {
  "use strict";
  try {
    Object.prototype.hasOwnProperty = 7;
  } catch (er) {
    console.log(er);
  }
  console.log(Object.prototype.hasOwnProperty);
}}());

(${function() {
  "use strict";
  console.log(cajaVM.confine('x + y', {x: 3, y: 4}));
}}());

cajaVM.confine
`;

var sesFiles = [
    "logger.js",
    "repair-framework.js",
    "repairES5.js",
    "WeakMap.js",
    "StringMap.js",
    "whitelist.js",
    "atLeastFreeVarNames.js",
    "startSES.js",
    "hookupSES.js",
];

var sesPlusFiles = [
    "logger.js",
    "repair-framework.js",
    "repairES5.js",
    "WeakMap.js",
    "debug.js",
    "StringMap.js",
    "whitelist.js",
    "atLeastFreeVarNames.js",
    "startSES.js",
    "ejectorsGuardsTrademarks.js",
    "hookupSESPlus.js",
];

var initSES = prelude + sesPlusFiles.map(function (path) {
    return FS.readFileSync(path, 'utf8');
}).join('\n') + testCases;

var global = {};
global.console = console;
global.global = global;
var context = VM.createContext(global);
var ret = VM.runInContext(initSES, context);
console.log('ret: ', ret);
