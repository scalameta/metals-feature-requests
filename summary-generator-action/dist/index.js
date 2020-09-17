require('./sourcemap-register.js');module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 5157:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.query = void 0;
var graphql_request_1 = __webpack_require__(2476);
var PathReporter_1 = __webpack_require__(2985);
var fp_ts_1 = __webpack_require__(5187);
var function_1 = __webpack_require__(6985);
var core = __webpack_require__(2186);
var githubToken = core.getInput("repo-token");
var graphqlClient = new graphql_request_1.GraphQLClient("https://api.github.com/graphql", {
    headers: {
        Authorization: "bearer " + githubToken,
    },
});
exports.query = function (query, values, responseType) {
    return function_1.pipe(fp_ts_1.taskEither.tryCatch(function () { return graphqlClient.request(query, values); }, function (e) {
        var error = JSON.stringify(e.message);
        return error;
    }), fp_ts_1.taskEither.chain(function_1.flow(responseType.decode, fp_ts_1.taskEither.fromEither, fp_ts_1.taskEither.mapLeft(function (errors) {
        var error = PathReporter_1.failure(errors).join("\n");
        return error;
    }))));
};


/***/ }),

/***/ 4822:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var graphql_1 = __webpack_require__(5157);
var models_1 = __webpack_require__(4209);
var queries_1 = __webpack_require__(775);
var fp_ts_1 = __webpack_require__(5187);
var function_1 = __webpack_require__(6985);
var core = __webpack_require__(2186);
function generateBody(issues) {
    return ("## Feature requests\n\n" +
        " 👍votes | issue |\n" +
        ":-------:|---------|\n" +
        issues
            .sort(function (a, b) { return b.reactions.totalCount - a.reactions.totalCount; })
            .map(function (issue) {
            return issue.reactions.totalCount + " | [" + issue.title + "](" + issue.url + ")";
        })
            .join("\n") +
        "\n\n<sub>last updated on " +
        new Date().toLocaleString("en-US", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
            timeZoneName: "short",
        }) +
        "</sub>");
}
function run() {
    return function_1.pipe(graphql_1.query(queries_1.openIssues, {}, models_1.IssuesResponse), fp_ts_1.taskEither.bimap(function (e) {
        core.debug(e);
        core.setFailed(e);
    }, function (_a) {
        var repository = _a.repository;
        var commentBody = generateBody(repository.issues.nodes);
        core.setOutput("comment-body", commentBody);
    }))();
}
run();
// const updateFeaturesIssue = pipe(
//   query(openIssues, {}, IssuesResponse),
//   taskEither.chain(({ repository }) =>
//     query(
//       updateIssueComment,
//       {
//         // id of first comment on scalameta/metals#707
//         commentId: "MDEyOklzc3VlQ29tbWVudDQ4ODMxMTQ2Ng==",
//         body: generateBody(repository.issues.nodes),
//       },
//       t.type({})
//     )
//   ),
//   taskEither.mapLeft((e) => console.error(e))
// );


/***/ }),

/***/ 4209:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IssuesResponse = exports.Issue = void 0;
var t = __webpack_require__(5428);
exports.Issue = t.type({
    title: t.string,
    url: t.string,
    reactions: t.type({
        totalCount: t.number
    })
}, "Issue");
exports.IssuesResponse = t.type({
    repository: t.type({
        issues: t.type({
            nodes: t.array(exports.Issue)
        })
    })
}, "IssuesResponse");


/***/ }),

/***/ 775:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.openIssues = void 0;
exports.openIssues = "query OpenIssues {\n  repository(owner: \"scalameta\", name: \"metals-feature-requests\") {\n    issues(filterBy: { states: OPEN }, first: 100) {\n      nodes {\n        title,\n        url,\n        reactions(content: THUMBS_UP) {\n          totalCount\n        }\n      }\n    }\n  }\n}\n";


/***/ }),

/***/ 7351:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__webpack_require__(2087));
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
function escapeData(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 2186:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __webpack_require__(7351);
const os = __importStar(__webpack_require__(2087));
const path = __importStar(__webpack_require__(5622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = command_1.toCommandValue(val);
    process.env[name] = convertedVal;
    command_1.issueCommand('set-env', { name }, convertedVal);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 4812:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports =
{
  parallel      : __webpack_require__(8210),
  serial        : __webpack_require__(445),
  serialOrdered : __webpack_require__(3578)
};


/***/ }),

/***/ 1700:
/***/ ((module) => {

// API
module.exports = abort;

/**
 * Aborts leftover active jobs
 *
 * @param {object} state - current state object
 */
function abort(state)
{
  Object.keys(state.jobs).forEach(clean.bind(state));

  // reset leftover jobs
  state.jobs = {};
}

/**
 * Cleans up leftover job by invoking abort function for the provided job id
 *
 * @this  state
 * @param {string|number} key - job id to abort
 */
function clean(key)
{
  if (typeof this.jobs[key] == 'function')
  {
    this.jobs[key]();
  }
}


/***/ }),

/***/ 2794:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var defer = __webpack_require__(5295);

// API
module.exports = async;

/**
 * Runs provided callback asynchronously
 * even if callback itself is not
 *
 * @param   {function} callback - callback to invoke
 * @returns {function} - augmented callback
 */
function async(callback)
{
  var isAsync = false;

  // check if async happened
  defer(function() { isAsync = true; });

  return function async_callback(err, result)
  {
    if (isAsync)
    {
      callback(err, result);
    }
    else
    {
      defer(function nextTick_callback()
      {
        callback(err, result);
      });
    }
  };
}


/***/ }),

/***/ 5295:
/***/ ((module) => {

module.exports = defer;

/**
 * Runs provided function on next iteration of the event loop
 *
 * @param {function} fn - function to run
 */
function defer(fn)
{
  var nextTick = typeof setImmediate == 'function'
    ? setImmediate
    : (
      typeof process == 'object' && typeof process.nextTick == 'function'
      ? process.nextTick
      : null
    );

  if (nextTick)
  {
    nextTick(fn);
  }
  else
  {
    setTimeout(fn, 0);
  }
}


/***/ }),

/***/ 9023:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var async = __webpack_require__(2794)
  , abort = __webpack_require__(1700)
  ;

// API
module.exports = iterate;

/**
 * Iterates over each job object
 *
 * @param {array|object} list - array or object (named list) to iterate over
 * @param {function} iterator - iterator to run
 * @param {object} state - current job status
 * @param {function} callback - invoked when all elements processed
 */
function iterate(list, iterator, state, callback)
{
  // store current index
  var key = state['keyedList'] ? state['keyedList'][state.index] : state.index;

  state.jobs[key] = runJob(iterator, key, list[key], function(error, output)
  {
    // don't repeat yourself
    // skip secondary callbacks
    if (!(key in state.jobs))
    {
      return;
    }

    // clean up jobs
    delete state.jobs[key];

    if (error)
    {
      // don't process rest of the results
      // stop still active jobs
      // and reset the list
      abort(state);
    }
    else
    {
      state.results[key] = output;
    }

    // return salvaged results
    callback(error, state.results);
  });
}

/**
 * Runs iterator over provided job element
 *
 * @param   {function} iterator - iterator to invoke
 * @param   {string|number} key - key/index of the element in the list of jobs
 * @param   {mixed} item - job description
 * @param   {function} callback - invoked after iterator is done with the job
 * @returns {function|mixed} - job abort function or something else
 */
function runJob(iterator, key, item, callback)
{
  var aborter;

  // allow shortcut if iterator expects only two arguments
  if (iterator.length == 2)
  {
    aborter = iterator(item, async(callback));
  }
  // otherwise go with full three arguments
  else
  {
    aborter = iterator(item, key, async(callback));
  }

  return aborter;
}


/***/ }),

/***/ 2474:
/***/ ((module) => {

// API
module.exports = state;

/**
 * Creates initial state object
 * for iteration over list
 *
 * @param   {array|object} list - list to iterate over
 * @param   {function|null} sortMethod - function to use for keys sort,
 *                                     or `null` to keep them as is
 * @returns {object} - initial state object
 */
function state(list, sortMethod)
{
  var isNamedList = !Array.isArray(list)
    , initState =
    {
      index    : 0,
      keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
      jobs     : {},
      results  : isNamedList ? {} : [],
      size     : isNamedList ? Object.keys(list).length : list.length
    }
    ;

  if (sortMethod)
  {
    // sort array keys based on it's values
    // sort object's keys just on own merit
    initState.keyedList.sort(isNamedList ? sortMethod : function(a, b)
    {
      return sortMethod(list[a], list[b]);
    });
  }

  return initState;
}


/***/ }),

/***/ 7942:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var abort = __webpack_require__(1700)
  , async = __webpack_require__(2794)
  ;

// API
module.exports = terminator;

/**
 * Terminates jobs in the attached state context
 *
 * @this  AsyncKitState#
 * @param {function} callback - final callback to invoke after termination
 */
function terminator(callback)
{
  if (!Object.keys(this.jobs).length)
  {
    return;
  }

  // fast forward iteration index
  this.index = this.size;

  // abort jobs
  abort(this);

  // send back results we have so far
  async(callback)(null, this.results);
}


/***/ }),

/***/ 8210:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var iterate    = __webpack_require__(9023)
  , initState  = __webpack_require__(2474)
  , terminator = __webpack_require__(7942)
  ;

// Public API
module.exports = parallel;

/**
 * Runs iterator over provided array elements in parallel
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */
function parallel(list, iterator, callback)
{
  var state = initState(list);

  while (state.index < (state['keyedList'] || list).length)
  {
    iterate(list, iterator, state, function(error, result)
    {
      if (error)
      {
        callback(error, result);
        return;
      }

      // looks like it's the last one
      if (Object.keys(state.jobs).length === 0)
      {
        callback(null, state.results);
        return;
      }
    });

    state.index++;
  }

  return terminator.bind(state, callback);
}


/***/ }),

/***/ 445:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var serialOrdered = __webpack_require__(3578);

// Public API
module.exports = serial;

/**
 * Runs iterator over provided array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */
function serial(list, iterator, callback)
{
  return serialOrdered(list, iterator, null, callback);
}


/***/ }),

/***/ 3578:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var iterate    = __webpack_require__(9023)
  , initState  = __webpack_require__(2474)
  , terminator = __webpack_require__(7942)
  ;

// Public API
module.exports = serialOrdered;
// sorting helpers
module.exports.ascending  = ascending;
module.exports.descending = descending;

/**
 * Runs iterator over provided sorted array elements in series
 *
 * @param   {array|object} list - array or object (named list) to iterate over
 * @param   {function} iterator - iterator to run
 * @param   {function} sortMethod - custom sort function
 * @param   {function} callback - invoked when all elements processed
 * @returns {function} - jobs terminator
 */
function serialOrdered(list, iterator, sortMethod, callback)
{
  var state = initState(list, sortMethod);

  iterate(list, iterator, state, function iteratorHandler(error, result)
  {
    if (error)
    {
      callback(error, result);
      return;
    }

    state.index++;

    // are we there yet?
    if (state.index < (state['keyedList'] || list).length)
    {
      iterate(list, iterator, state, iteratorHandler);
      return;
    }

    // done here
    callback(null, state.results);
  });

  return terminator.bind(state, callback);
}

/*
 * -- Sort methods
 */

/**
 * sort helper to sort array elements in ascending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */
function ascending(a, b)
{
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * sort helper to sort array elements in descending order
 *
 * @param   {mixed} a - an item to compare
 * @param   {mixed} b - an item to compare
 * @returns {number} - comparison result
 */
function descending(a, b)
{
  return -1 * ascending(a, b);
}


/***/ }),

/***/ 5443:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var util = __webpack_require__(1669);
var Stream = __webpack_require__(2413).Stream;
var DelayedStream = __webpack_require__(8611);

module.exports = CombinedStream;
function CombinedStream() {
  this.writable = false;
  this.readable = true;
  this.dataSize = 0;
  this.maxDataSize = 2 * 1024 * 1024;
  this.pauseStreams = true;

  this._released = false;
  this._streams = [];
  this._currentStream = null;
  this._insideLoop = false;
  this._pendingNext = false;
}
util.inherits(CombinedStream, Stream);

CombinedStream.create = function(options) {
  var combinedStream = new this();

  options = options || {};
  for (var option in options) {
    combinedStream[option] = options[option];
  }

  return combinedStream;
};

CombinedStream.isStreamLike = function(stream) {
  return (typeof stream !== 'function')
    && (typeof stream !== 'string')
    && (typeof stream !== 'boolean')
    && (typeof stream !== 'number')
    && (!Buffer.isBuffer(stream));
};

CombinedStream.prototype.append = function(stream) {
  var isStreamLike = CombinedStream.isStreamLike(stream);

  if (isStreamLike) {
    if (!(stream instanceof DelayedStream)) {
      var newStream = DelayedStream.create(stream, {
        maxDataSize: Infinity,
        pauseStream: this.pauseStreams,
      });
      stream.on('data', this._checkDataSize.bind(this));
      stream = newStream;
    }

    this._handleErrors(stream);

    if (this.pauseStreams) {
      stream.pause();
    }
  }

  this._streams.push(stream);
  return this;
};

CombinedStream.prototype.pipe = function(dest, options) {
  Stream.prototype.pipe.call(this, dest, options);
  this.resume();
  return dest;
};

CombinedStream.prototype._getNext = function() {
  this._currentStream = null;

  if (this._insideLoop) {
    this._pendingNext = true;
    return; // defer call
  }

  this._insideLoop = true;
  try {
    do {
      this._pendingNext = false;
      this._realGetNext();
    } while (this._pendingNext);
  } finally {
    this._insideLoop = false;
  }
};

CombinedStream.prototype._realGetNext = function() {
  var stream = this._streams.shift();


  if (typeof stream == 'undefined') {
    this.end();
    return;
  }

  if (typeof stream !== 'function') {
    this._pipeNext(stream);
    return;
  }

  var getStream = stream;
  getStream(function(stream) {
    var isStreamLike = CombinedStream.isStreamLike(stream);
    if (isStreamLike) {
      stream.on('data', this._checkDataSize.bind(this));
      this._handleErrors(stream);
    }

    this._pipeNext(stream);
  }.bind(this));
};

CombinedStream.prototype._pipeNext = function(stream) {
  this._currentStream = stream;

  var isStreamLike = CombinedStream.isStreamLike(stream);
  if (isStreamLike) {
    stream.on('end', this._getNext.bind(this));
    stream.pipe(this, {end: false});
    return;
  }

  var value = stream;
  this.write(value);
  this._getNext();
};

CombinedStream.prototype._handleErrors = function(stream) {
  var self = this;
  stream.on('error', function(err) {
    self._emitError(err);
  });
};

CombinedStream.prototype.write = function(data) {
  this.emit('data', data);
};

CombinedStream.prototype.pause = function() {
  if (!this.pauseStreams) {
    return;
  }

  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.pause) == 'function') this._currentStream.pause();
  this.emit('pause');
};

CombinedStream.prototype.resume = function() {
  if (!this._released) {
    this._released = true;
    this.writable = true;
    this._getNext();
  }

  if(this.pauseStreams && this._currentStream && typeof(this._currentStream.resume) == 'function') this._currentStream.resume();
  this.emit('resume');
};

CombinedStream.prototype.end = function() {
  this._reset();
  this.emit('end');
};

CombinedStream.prototype.destroy = function() {
  this._reset();
  this.emit('close');
};

CombinedStream.prototype._reset = function() {
  this.writable = false;
  this._streams = [];
  this._currentStream = null;
};

CombinedStream.prototype._checkDataSize = function() {
  this._updateDataSize();
  if (this.dataSize <= this.maxDataSize) {
    return;
  }

  var message =
    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.';
  this._emitError(new Error(message));
};

CombinedStream.prototype._updateDataSize = function() {
  this.dataSize = 0;

  var self = this;
  this._streams.forEach(function(stream) {
    if (!stream.dataSize) {
      return;
    }

    self.dataSize += stream.dataSize;
  });

  if (this._currentStream && this._currentStream.dataSize) {
    this.dataSize += this._currentStream.dataSize;
  }
};

CombinedStream.prototype._emitError = function(err) {
  this._reset();
  this.emit('error', err);
};


/***/ }),

/***/ 9805:
/***/ ((module, exports, __webpack_require__) => {

var nodeFetch = __webpack_require__(467)
var realFetch = nodeFetch.default || nodeFetch

var fetch = function (url, options) {
  // Support schemaless URIs on the server for parity with the browser.
  // Ex: //github.com/ -> https://github.com/
  if (/^\/\//.test(url)) {
    url = 'https:' + url
  }
  return realFetch.call(this, url, options)
}

module.exports = exports = fetch
exports.fetch = fetch
exports.Headers = nodeFetch.Headers
exports.Request = nodeFetch.Request
exports.Response = nodeFetch.Response

// Needed for TypeScript consumers without esModuleInterop.
exports.default = fetch


/***/ }),

/***/ 8611:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Stream = __webpack_require__(2413).Stream;
var util = __webpack_require__(1669);

module.exports = DelayedStream;
function DelayedStream() {
  this.source = null;
  this.dataSize = 0;
  this.maxDataSize = 1024 * 1024;
  this.pauseStream = true;

  this._maxDataSizeExceeded = false;
  this._released = false;
  this._bufferedEvents = [];
}
util.inherits(DelayedStream, Stream);

DelayedStream.create = function(source, options) {
  var delayedStream = new this();

  options = options || {};
  for (var option in options) {
    delayedStream[option] = options[option];
  }

  delayedStream.source = source;

  var realEmit = source.emit;
  source.emit = function() {
    delayedStream._handleEmit(arguments);
    return realEmit.apply(source, arguments);
  };

  source.on('error', function() {});
  if (delayedStream.pauseStream) {
    source.pause();
  }

  return delayedStream;
};

Object.defineProperty(DelayedStream.prototype, 'readable', {
  configurable: true,
  enumerable: true,
  get: function() {
    return this.source.readable;
  }
});

DelayedStream.prototype.setEncoding = function() {
  return this.source.setEncoding.apply(this.source, arguments);
};

DelayedStream.prototype.resume = function() {
  if (!this._released) {
    this.release();
  }

  this.source.resume();
};

DelayedStream.prototype.pause = function() {
  this.source.pause();
};

DelayedStream.prototype.release = function() {
  this._released = true;

  this._bufferedEvents.forEach(function(args) {
    this.emit.apply(this, args);
  }.bind(this));
  this._bufferedEvents = [];
};

DelayedStream.prototype.pipe = function() {
  var r = Stream.prototype.pipe.apply(this, arguments);
  this.resume();
  return r;
};

DelayedStream.prototype._handleEmit = function(args) {
  if (this._released) {
    this.emit.apply(this, args);
    return;
  }

  if (args[0] === 'data') {
    this.dataSize += args[1].length;
    this._checkIfMaxDataSizeExceeded();
  }

  this._bufferedEvents.push(args);
};

DelayedStream.prototype._checkIfMaxDataSizeExceeded = function() {
  if (this._maxDataSizeExceeded) {
    return;
  }

  if (this.dataSize <= this.maxDataSize) {
    return;
  }

  this._maxDataSizeExceeded = true;
  var message =
    'DelayedStream#maxDataSize of ' + this.maxDataSize + ' bytes exceeded.'
  this.emit('error', new Error(message));
};


/***/ }),

/***/ 776:
/***/ ((module) => {

"use strict";


module.exports = function ReactNativeFile(_ref) {
  var uri = _ref.uri,
    name = _ref.name,
    type = _ref.type;
  this.uri = uri;
  this.name = name;
  this.type = type;
};


/***/ }),

/***/ 5458:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var defaultIsExtractableFile = __webpack_require__(8403);

module.exports = function extractFiles(value, path, isExtractableFile) {
  if (path === void 0) {
    path = '';
  }

  if (isExtractableFile === void 0) {
    isExtractableFile = defaultIsExtractableFile;
  }

  var clone;
  var files = new Map();

  function addFile(paths, file) {
    var storedPaths = files.get(file);
    if (storedPaths) storedPaths.push.apply(storedPaths, paths);
    else files.set(file, paths);
  }

  if (isExtractableFile(value)) {
    clone = null;
    addFile([path], value);
  } else {
    var prefix = path ? path + '.' : '';
    if (typeof FileList !== 'undefined' && value instanceof FileList)
      clone = Array.prototype.map.call(value, function (file, i) {
        addFile(['' + prefix + i], file);
        return null;
      });
    else if (Array.isArray(value))
      clone = value.map(function (child, i) {
        var result = extractFiles(child, '' + prefix + i, isExtractableFile);
        result.files.forEach(addFile);
        return result.clone;
      });
    else if (value && value.constructor === Object) {
      clone = {};

      for (var i in value) {
        var result = extractFiles(value[i], '' + prefix + i, isExtractableFile);
        result.files.forEach(addFile);
        clone[i] = result.clone;
      }
    } else clone = value;
  }

  return {
    clone: clone,
    files: files,
  };
};


/***/ }),

/***/ 5498:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.ReactNativeFile = __webpack_require__(776);
exports.extractFiles = __webpack_require__(5458);
exports.isExtractableFile = __webpack_require__(8403);


/***/ }),

/***/ 8403:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var ReactNativeFile = __webpack_require__(776);

module.exports = function isExtractableFile(value) {
  return (
    (typeof File !== 'undefined' && value instanceof File) ||
    (typeof Blob !== 'undefined' && value instanceof Blob) ||
    value instanceof ReactNativeFile
  );
};


/***/ }),

/***/ 4334:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var CombinedStream = __webpack_require__(5443);
var util = __webpack_require__(1669);
var path = __webpack_require__(5622);
var http = __webpack_require__(8605);
var https = __webpack_require__(7211);
var parseUrl = __webpack_require__(8835).parse;
var fs = __webpack_require__(5747);
var mime = __webpack_require__(3583);
var asynckit = __webpack_require__(4812);
var populate = __webpack_require__(7142);

// Public API
module.exports = FormData;

// make it a Stream
util.inherits(FormData, CombinedStream);

/**
 * Create readable "multipart/form-data" streams.
 * Can be used to submit forms
 * and file uploads to other web applications.
 *
 * @constructor
 * @param {Object} options - Properties to be added/overriden for FormData and CombinedStream
 */
function FormData(options) {
  if (!(this instanceof FormData)) {
    return new FormData(options);
  }

  this._overheadLength = 0;
  this._valueLength = 0;
  this._valuesToMeasure = [];

  CombinedStream.call(this);

  options = options || {};
  for (var option in options) {
    this[option] = options[option];
  }
}

FormData.LINE_BREAK = '\r\n';
FormData.DEFAULT_CONTENT_TYPE = 'application/octet-stream';

FormData.prototype.append = function(field, value, options) {

  options = options || {};

  // allow filename as single option
  if (typeof options == 'string') {
    options = {filename: options};
  }

  var append = CombinedStream.prototype.append.bind(this);

  // all that streamy business can't handle numbers
  if (typeof value == 'number') {
    value = '' + value;
  }

  // https://github.com/felixge/node-form-data/issues/38
  if (util.isArray(value)) {
    // Please convert your array into string
    // the way web server expects it
    this._error(new Error('Arrays are not supported.'));
    return;
  }

  var header = this._multiPartHeader(field, value, options);
  var footer = this._multiPartFooter();

  append(header);
  append(value);
  append(footer);

  // pass along options.knownLength
  this._trackLength(header, value, options);
};

FormData.prototype._trackLength = function(header, value, options) {
  var valueLength = 0;

  // used w/ getLengthSync(), when length is known.
  // e.g. for streaming directly from a remote server,
  // w/ a known file a size, and not wanting to wait for
  // incoming file to finish to get its size.
  if (options.knownLength != null) {
    valueLength += +options.knownLength;
  } else if (Buffer.isBuffer(value)) {
    valueLength = value.length;
  } else if (typeof value === 'string') {
    valueLength = Buffer.byteLength(value);
  }

  this._valueLength += valueLength;

  // @check why add CRLF? does this account for custom/multiple CRLFs?
  this._overheadLength +=
    Buffer.byteLength(header) +
    FormData.LINE_BREAK.length;

  // empty or either doesn't have path or not an http response
  if (!value || ( !value.path && !(value.readable && value.hasOwnProperty('httpVersion')) )) {
    return;
  }

  // no need to bother with the length
  if (!options.knownLength) {
    this._valuesToMeasure.push(value);
  }
};

FormData.prototype._lengthRetriever = function(value, callback) {

  if (value.hasOwnProperty('fd')) {

    // take read range into a account
    // `end` = Infinity –> read file till the end
    //
    // TODO: Looks like there is bug in Node fs.createReadStream
    // it doesn't respect `end` options without `start` options
    // Fix it when node fixes it.
    // https://github.com/joyent/node/issues/7819
    if (value.end != undefined && value.end != Infinity && value.start != undefined) {

      // when end specified
      // no need to calculate range
      // inclusive, starts with 0
      callback(null, value.end + 1 - (value.start ? value.start : 0));

    // not that fast snoopy
    } else {
      // still need to fetch file size from fs
      fs.stat(value.path, function(err, stat) {

        var fileSize;

        if (err) {
          callback(err);
          return;
        }

        // update final size based on the range options
        fileSize = stat.size - (value.start ? value.start : 0);
        callback(null, fileSize);
      });
    }

  // or http response
  } else if (value.hasOwnProperty('httpVersion')) {
    callback(null, +value.headers['content-length']);

  // or request stream http://github.com/mikeal/request
  } else if (value.hasOwnProperty('httpModule')) {
    // wait till response come back
    value.on('response', function(response) {
      value.pause();
      callback(null, +response.headers['content-length']);
    });
    value.resume();

  // something else
  } else {
    callback('Unknown stream');
  }
};

FormData.prototype._multiPartHeader = function(field, value, options) {
  // custom header specified (as string)?
  // it becomes responsible for boundary
  // (e.g. to handle extra CRLFs on .NET servers)
  if (typeof options.header == 'string') {
    return options.header;
  }

  var contentDisposition = this._getContentDisposition(value, options);
  var contentType = this._getContentType(value, options);

  var contents = '';
  var headers  = {
    // add custom disposition as third element or keep it two elements if not
    'Content-Disposition': ['form-data', 'name="' + field + '"'].concat(contentDisposition || []),
    // if no content type. allow it to be empty array
    'Content-Type': [].concat(contentType || [])
  };

  // allow custom headers.
  if (typeof options.header == 'object') {
    populate(headers, options.header);
  }

  var header;
  for (var prop in headers) {
    if (!headers.hasOwnProperty(prop)) continue;
    header = headers[prop];

    // skip nullish headers.
    if (header == null) {
      continue;
    }

    // convert all headers to arrays.
    if (!Array.isArray(header)) {
      header = [header];
    }

    // add non-empty headers.
    if (header.length) {
      contents += prop + ': ' + header.join('; ') + FormData.LINE_BREAK;
    }
  }

  return '--' + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK;
};

FormData.prototype._getContentDisposition = function(value, options) {

  var filename
    , contentDisposition
    ;

  if (typeof options.filepath === 'string') {
    // custom filepath for relative paths
    filename = path.normalize(options.filepath).replace(/\\/g, '/');
  } else if (options.filename || value.name || value.path) {
    // custom filename take precedence
    // formidable and the browser add a name property
    // fs- and request- streams have path property
    filename = path.basename(options.filename || value.name || value.path);
  } else if (value.readable && value.hasOwnProperty('httpVersion')) {
    // or try http response
    filename = path.basename(value.client._httpMessage.path || '');
  }

  if (filename) {
    contentDisposition = 'filename="' + filename + '"';
  }

  return contentDisposition;
};

FormData.prototype._getContentType = function(value, options) {

  // use custom content-type above all
  var contentType = options.contentType;

  // or try `name` from formidable, browser
  if (!contentType && value.name) {
    contentType = mime.lookup(value.name);
  }

  // or try `path` from fs-, request- streams
  if (!contentType && value.path) {
    contentType = mime.lookup(value.path);
  }

  // or if it's http-reponse
  if (!contentType && value.readable && value.hasOwnProperty('httpVersion')) {
    contentType = value.headers['content-type'];
  }

  // or guess it from the filepath or filename
  if (!contentType && (options.filepath || options.filename)) {
    contentType = mime.lookup(options.filepath || options.filename);
  }

  // fallback to the default content type if `value` is not simple value
  if (!contentType && typeof value == 'object') {
    contentType = FormData.DEFAULT_CONTENT_TYPE;
  }

  return contentType;
};

FormData.prototype._multiPartFooter = function() {
  return function(next) {
    var footer = FormData.LINE_BREAK;

    var lastPart = (this._streams.length === 0);
    if (lastPart) {
      footer += this._lastBoundary();
    }

    next(footer);
  }.bind(this);
};

FormData.prototype._lastBoundary = function() {
  return '--' + this.getBoundary() + '--' + FormData.LINE_BREAK;
};

FormData.prototype.getHeaders = function(userHeaders) {
  var header;
  var formHeaders = {
    'content-type': 'multipart/form-data; boundary=' + this.getBoundary()
  };

  for (header in userHeaders) {
    if (userHeaders.hasOwnProperty(header)) {
      formHeaders[header.toLowerCase()] = userHeaders[header];
    }
  }

  return formHeaders;
};

FormData.prototype.getBoundary = function() {
  if (!this._boundary) {
    this._generateBoundary();
  }

  return this._boundary;
};

FormData.prototype.getBuffer = function() {
  var dataBuffer = new Buffer.alloc( 0 );
  var boundary = this.getBoundary();

  // Create the form content. Add Line breaks to the end of data.
  for (var i = 0, len = this._streams.length; i < len; i++) {
    if (typeof this._streams[i] !== 'function') {

      // Add content to the buffer.
      if(Buffer.isBuffer(this._streams[i])) {
        dataBuffer = Buffer.concat( [dataBuffer, this._streams[i]]);
      }else {
        dataBuffer = Buffer.concat( [dataBuffer, Buffer.from(this._streams[i])]);
      }

      // Add break after content.
      if (typeof this._streams[i] !== 'string' || this._streams[i].substring( 2, boundary.length + 2 ) !== boundary) {
        dataBuffer = Buffer.concat( [dataBuffer, Buffer.from(FormData.LINE_BREAK)] );
      }
    }
  }

  // Add the footer and return the Buffer object.
  return Buffer.concat( [dataBuffer, Buffer.from(this._lastBoundary())] );
};

FormData.prototype._generateBoundary = function() {
  // This generates a 50 character boundary similar to those used by Firefox.
  // They are optimized for boyer-moore parsing.
  var boundary = '--------------------------';
  for (var i = 0; i < 24; i++) {
    boundary += Math.floor(Math.random() * 10).toString(16);
  }

  this._boundary = boundary;
};

// Note: getLengthSync DOESN'T calculate streams length
// As workaround one can calculate file size manually
// and add it as knownLength option
FormData.prototype.getLengthSync = function() {
  var knownLength = this._overheadLength + this._valueLength;

  // Don't get confused, there are 3 "internal" streams for each keyval pair
  // so it basically checks if there is any value added to the form
  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }

  // https://github.com/form-data/form-data/issues/40
  if (!this.hasKnownLength()) {
    // Some async length retrievers are present
    // therefore synchronous length calculation is false.
    // Please use getLength(callback) to get proper length
    this._error(new Error('Cannot calculate proper length in synchronous way.'));
  }

  return knownLength;
};

// Public API to check if length of added values is known
// https://github.com/form-data/form-data/issues/196
// https://github.com/form-data/form-data/issues/262
FormData.prototype.hasKnownLength = function() {
  var hasKnownLength = true;

  if (this._valuesToMeasure.length) {
    hasKnownLength = false;
  }

  return hasKnownLength;
};

FormData.prototype.getLength = function(cb) {
  var knownLength = this._overheadLength + this._valueLength;

  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }

  if (!this._valuesToMeasure.length) {
    process.nextTick(cb.bind(this, null, knownLength));
    return;
  }

  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
    if (err) {
      cb(err);
      return;
    }

    values.forEach(function(length) {
      knownLength += length;
    });

    cb(null, knownLength);
  });
};

FormData.prototype.submit = function(params, cb) {
  var request
    , options
    , defaults = {method: 'post'}
    ;

  // parse provided url if it's string
  // or treat it as options object
  if (typeof params == 'string') {

    params = parseUrl(params);
    options = populate({
      port: params.port,
      path: params.pathname,
      host: params.hostname,
      protocol: params.protocol
    }, defaults);

  // use custom params
  } else {

    options = populate(params, defaults);
    // if no port provided use default one
    if (!options.port) {
      options.port = options.protocol == 'https:' ? 443 : 80;
    }
  }

  // put that good code in getHeaders to some use
  options.headers = this.getHeaders(params.headers);

  // https if specified, fallback to http in any other case
  if (options.protocol == 'https:') {
    request = https.request(options);
  } else {
    request = http.request(options);
  }

  // get content length and fire away
  this.getLength(function(err, length) {
    if (err) {
      this._error(err);
      return;
    }

    // add content length
    request.setHeader('Content-Length', length);

    this.pipe(request);
    if (cb) {
      var onResponse;

      var callback = function (error, responce) {
        request.removeListener('error', callback);
        request.removeListener('response', onResponse);

        return cb.call(this, error, responce);
      };

      onResponse = callback.bind(this, null);

      request.on('error', callback);
      request.on('response', onResponse);
    }
  }.bind(this));

  return request;
};

FormData.prototype._error = function(err) {
  if (!this.error) {
    this.error = err;
    this.pause();
    this.emit('error', err);
  }
};

FormData.prototype.toString = function () {
  return '[object FormData]';
};


/***/ }),

/***/ 7142:
/***/ ((module) => {

// populates missing values
module.exports = function(dst, src) {

  Object.keys(src).forEach(function(prop)
  {
    dst[prop] = dst[prop] || src[prop];
  });

  return dst;
};


/***/ }),

/***/ 7451:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 1601:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 4766:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getApplicativeComposition = void 0;
var Functor_1 = __webpack_require__(5533);
function getApplicativeComposition(F, G) {
    return {
        map: Functor_1.getFunctorComposition(F, G).map,
        of: function (a) { return F.of(G.of(a)); },
        ap: function (fgab, fga) {
            return F.ap(F.map(fgab, function (h) { return function (ga) { return G.ap(h, ga); }; }), fga);
        }
    };
}
exports.getApplicativeComposition = getApplicativeComposition;


/***/ }),

/***/ 205:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sequenceS = exports.sequenceT = void 0;
var function_1 = __webpack_require__(6985);
function curried(f, n, acc) {
    return function (x) {
        var combined = Array(acc.length + 1);
        for (var i = 0; i < acc.length; i++) {
            combined[i] = acc[i];
        }
        combined[acc.length] = x;
        return n === 0 ? f.apply(null, combined) : curried(f, n - 1, combined);
    };
}
var tupleConstructors = {
    1: function (a) { return [a]; },
    2: function (a) { return function (b) { return [a, b]; }; },
    3: function (a) { return function (b) { return function (c) { return [a, b, c]; }; }; },
    4: function (a) { return function (b) { return function (c) { return function (d) { return [a, b, c, d]; }; }; }; },
    5: function (a) { return function (b) { return function (c) { return function (d) { return function (e) { return [a, b, c, d, e]; }; }; }; }; }
};
function getTupleConstructor(len) {
    if (!tupleConstructors.hasOwnProperty(len)) {
        tupleConstructors[len] = curried(function_1.tuple, len - 1, []);
    }
    return tupleConstructors[len];
}
function sequenceT(F) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var len = args.length;
        var f = getTupleConstructor(len);
        var fas = F.map(args[0], f);
        for (var i = 1; i < len; i++) {
            fas = F.ap(fas, args[i]);
        }
        return fas;
    };
}
exports.sequenceT = sequenceT;
function getRecordConstructor(keys) {
    var len = keys.length;
    switch (len) {
        case 1:
            return function (a) {
                var _a;
                return (_a = {}, _a[keys[0]] = a, _a);
            };
        case 2:
            return function (a) { return function (b) {
                var _a;
                return (_a = {}, _a[keys[0]] = a, _a[keys[1]] = b, _a);
            }; };
        case 3:
            return function (a) { return function (b) { return function (c) {
                var _a;
                return (_a = {}, _a[keys[0]] = a, _a[keys[1]] = b, _a[keys[2]] = c, _a);
            }; }; };
        case 4:
            return function (a) { return function (b) { return function (c) { return function (d) {
                var _a;
                return (_a = {},
                    _a[keys[0]] = a,
                    _a[keys[1]] = b,
                    _a[keys[2]] = c,
                    _a[keys[3]] = d,
                    _a);
            }; }; }; };
        case 5:
            return function (a) { return function (b) { return function (c) { return function (d) { return function (e) {
                var _a;
                return (_a = {},
                    _a[keys[0]] = a,
                    _a[keys[1]] = b,
                    _a[keys[2]] = c,
                    _a[keys[3]] = d,
                    _a[keys[4]] = e,
                    _a);
            }; }; }; }; };
        default:
            return curried(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var r = {};
                for (var i = 0; i < len; i++) {
                    r[keys[i]] = args[i];
                }
                return r;
            }, len - 1, []);
    }
}
function sequenceS(F) {
    return function (r) {
        var keys = Object.keys(r);
        var len = keys.length;
        var f = getRecordConstructor(keys);
        var fr = F.map(r[keys[0]], f);
        for (var i = 1; i < len; i++) {
            fr = F.ap(fr, r[keys[i]]);
        }
        return fr;
    };
}
exports.sequenceS = sequenceS;
/* tslint:enable:readonly-array */


/***/ }),

/***/ 3834:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.bind = exports.bindTo = exports.empty = exports.unsafeDeleteAt = exports.unsafeUpdateAt = exports.unsafeInsertAt = exports.array = exports.Witherable = exports.TraversableWithIndex = exports.Traversable = exports.FoldableWithIndex = exports.Foldable = exports.FilterableWithIndex = exports.Filterable = exports.Compactable = exports.Extend = exports.Alternative = exports.Alt = exports.Unfoldable = exports.Monad = exports.Applicative = exports.FunctorWithIndex = exports.Functor = exports.URI = exports.zero = exports.unfold = exports.wilt = exports.wither = exports.traverseWithIndex = exports.sequence = exports.traverse = exports.reduceRightWithIndex = exports.reduceRight = exports.reduceWithIndex = exports.reduce = exports.foldMapWithIndex = exports.foldMap = exports.duplicate = exports.extend = exports.filterWithIndex = exports.filterMapWithIndex = exports.alt = exports.partitionMapWithIndex = exports.partitionMap = exports.partitionWithIndex = exports.partition = exports.filterMap = exports.filter = exports.separate = exports.compact = exports.mapWithIndex = exports.chainFirst = exports.chainWithIndex = exports.chain = exports.apSecond = exports.apFirst = exports.ap = exports.map = exports.of = exports.difference = exports.intersection = exports.union = exports.comprehension = exports.chunksOf = exports.splitAt = exports.chop = exports.sortBy = exports.uniq = exports.elem = exports.rotate = exports.unzip = exports.zip = exports.zipWith = exports.sort = exports.lefts = exports.rights = exports.reverse = exports.modifyAt = exports.deleteAt = exports.updateAt = exports.insertAt = exports.copy = exports.findLastIndex = exports.findLastMap = exports.findLast = exports.findFirstMap = exports.findFirst = exports.findIndex = exports.dropLeftWhile = exports.dropRight = exports.dropLeft = exports.spanLeft = exports.takeLeftWhile = exports.takeRight = exports.takeLeft = exports.init = exports.tail = exports.last = exports.head = exports.snoc = exports.cons = exports.lookup = exports.isOutOfBound = exports.isNonEmpty = exports.isEmpty = exports.scanRight = exports.scanLeft = exports.foldRight = exports.foldLeft = exports.flatten = exports.replicate = exports.range = exports.makeBy = exports.getOrd = exports.getEq = exports.getMonoid = exports.getShow = void 0;
var RA = __importStar(__webpack_require__(4234));
// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
/* tslint:disable:readonly-array */
/**
 * @category instances
 * @since 2.0.0
 */
exports.getShow = RA.getShow;
/**
 * Returns a `Monoid` for `Array<A>`
 *
 * @example
 * import { getMonoid } from 'fp-ts/Array'
 *
 * const M = getMonoid<number>()
 * assert.deepStrictEqual(M.concat([1, 2], [3, 4]), [1, 2, 3, 4])
 *
 * @category instances
 * @since 2.0.0
 */
exports.getMonoid = RA.getMonoid;
/**
 * Derives an `Eq` over the `Array` of a given element type from the `Eq` of that type. The derived `Eq` defines two
 * arrays as equal if all elements of both arrays are compared equal pairwise with the given `E`. In case of arrays of
 * different lengths, the result is non equality.
 *
 * @example
 * import { eqString } from 'fp-ts/Eq'
 * import { getEq } from 'fp-ts/Array'
 *
 * const E = getEq(eqString)
 * assert.strictEqual(E.equals(['a', 'b'], ['a', 'b']), true)
 * assert.strictEqual(E.equals(['a'], []), false)
 *
 * @category instances
 * @since 2.0.0
 */
exports.getEq = RA.getEq;
/**
 * Derives an `Ord` over the `Array` of a given element type from the `Ord` of that type. The ordering between two such
 * arrays is equal to: the first non equal comparison of each arrays elements taken pairwise in increasing order, in
 * case of equality over all the pairwise elements; the longest array is considered the greatest, if both arrays have
 * the same length, the result is equality.
 *
 * @example
 * import { getOrd } from 'fp-ts/Array'
 * import { ordString } from 'fp-ts/Ord'
 *
 * const O = getOrd(ordString)
 * assert.strictEqual(O.compare(['b'], ['a']), 1)
 * assert.strictEqual(O.compare(['a'], ['a']), 0)
 * assert.strictEqual(O.compare(['a'], ['b']), -1)
 *
 * @category instances
 * @since 2.0.0
 */
exports.getOrd = RA.getOrd;
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * Return a list of length `n` with element `i` initialized with `f(i)`
 *
 * @example
 * import { makeBy } from 'fp-ts/Array'
 *
 * const double = (n: number): number => n * 2
 * assert.deepStrictEqual(makeBy(5, double), [0, 2, 4, 6, 8])
 *
 * @category constructors
 * @since 2.0.0
 */
exports.makeBy = RA.makeBy;
/**
 * Create an array containing a range of integers, including both endpoints
 *
 * @example
 * import { range } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(range(1, 5), [1, 2, 3, 4, 5])
 *
 * @category constructors
 * @since 2.0.0
 */
exports.range = RA.range;
/**
 * Create an array containing a value repeated the specified number of times
 *
 * @example
 * import { replicate } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(replicate(3, 'a'), ['a', 'a', 'a'])
 *
 * @category constructors
 * @since 2.0.0
 */
exports.replicate = RA.replicate;
/**
 * Removes one level of nesting
 *
 * @example
 * import { flatten } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(flatten([[1], [2], [3]]), [1, 2, 3])
 *
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = RA.flatten;
/**
 * Break an array into its first element and remaining elements
 *
 * @example
 * import { foldLeft } from 'fp-ts/Array'
 *
 * const len: <A>(as: Array<A>) => number = foldLeft(() => 0, (_, tail) => 1 + len(tail))
 * assert.strictEqual(len([1, 2, 3]), 3)
 *
 * @category destructors
 * @since 2.0.0
 */
exports.foldLeft = RA.foldLeft;
/**
 * Break an array into its initial elements and the last element
 *
 * @category destructors
 * @since 2.0.0
 */
exports.foldRight = RA.foldRight;
/**
 * Same as `reduce` but it carries over the intermediate steps
 *
 * ```ts
 * import { scanLeft } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(scanLeft(10, (b, a: number) => b - a)([1, 2, 3]), [10, 9, 7, 4])
 * ```
 * @category combinators
 * @since 2.0.0
 */
exports.scanLeft = RA.scanLeft;
/**
 * Fold an array from the right, keeping all intermediate results instead of only the final result
 *
 * @example
 * import { scanRight } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(scanRight(10, (a: number, b) => b - a)([1, 2, 3]), [4, 5, 7, 10])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.scanRight = RA.scanRight;
/**
 * Test whether an array is empty
 *
 * @example
 * import { isEmpty } from 'fp-ts/Array'
 *
 * assert.strictEqual(isEmpty([]), true)
 *
 * @since 2.0.0
 */
exports.isEmpty = RA.isEmpty;
/**
 * Test whether an array is non empty narrowing down the type to `NonEmptyArray<A>`
 *
 * @category guards
 * @since 2.0.0
 */
exports.isNonEmpty = RA.isNonEmpty;
/**
 * Test whether an array contains a particular index
 *
 * @since 2.0.0
 */
exports.isOutOfBound = RA.isOutOfBound;
// TODO: remove non-curried overloading in v3
/**
 * This function provides a safe way to read a value at a particular index from an array
 *
 * @example
 * import { lookup } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2, 3], lookup(1)), some(2))
 * assert.deepStrictEqual(pipe([1, 2, 3], lookup(3)), none)
 *
 * @since 2.0.0
 */
exports.lookup = RA.lookup;
// TODO: remove non-curried overloading in v3
/**
 * Attaches an element to the front of an array, creating a new non empty array
 *
 * @example
 * import { cons } from 'fp-ts/Array'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2, 3], cons(0)), [0, 1, 2, 3])
 *
 * @category constructors
 * @since 2.0.0
 */
exports.cons = RA.cons;
// TODO: curry in v3
/**
 * Append an element to the end of an array, creating a new non empty array
 *
 * @example
 * import { snoc } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(snoc([1, 2, 3], 4), [1, 2, 3, 4])
 *
 * @category constructors
 * @since 2.0.0
 */
exports.snoc = RA.snoc;
/**
 * Get the first element in an array, or `None` if the array is empty
 *
 * @example
 * import { head } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(head([1, 2, 3]), some(1))
 * assert.deepStrictEqual(head([]), none)
 *
 * @category destructors
 * @since 2.0.0
 */
exports.head = RA.head;
/**
 * Get the last element in an array, or `None` if the array is empty
 *
 * @example
 * import { last } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(last([1, 2, 3]), some(3))
 * assert.deepStrictEqual(last([]), none)
 *
 * @category destructors
 * @since 2.0.0
 */
exports.last = RA.last;
/**
 * Get all but the first element of an array, creating a new array, or `None` if the array is empty
 *
 * @example
 * import { tail } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(tail([1, 2, 3]), some([2, 3]))
 * assert.deepStrictEqual(tail([]), none)
 *
 * @category destructors
 * @since 2.0.0
 */
exports.tail = RA.tail;
/**
 * Get all but the last element of an array, creating a new array, or `None` if the array is empty
 *
 * @example
 * import { init } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(init([1, 2, 3]), some([1, 2]))
 * assert.deepStrictEqual(init([]), none)
 *
 * @category destructors
 * @since 2.0.0
 */
exports.init = RA.init;
/**
 * Keep only a number of elements from the start of an array, creating a new array.
 * `n` must be a natural number
 *
 * @example
 * import { takeLeft } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(takeLeft(2)([1, 2, 3]), [1, 2])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.takeLeft = RA.takeLeft;
/**
 * Keep only a number of elements from the end of an array, creating a new array.
 * `n` must be a natural number
 *
 * @example
 * import { takeRight } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(takeRight(2)([1, 2, 3, 4, 5]), [4, 5])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.takeRight = RA.takeRight;
function takeLeftWhile(predicate) {
    return RA.takeLeftWhile(predicate);
}
exports.takeLeftWhile = takeLeftWhile;
function spanLeft(predicate) {
    return RA.spanLeft(predicate);
}
exports.spanLeft = spanLeft;
/* tslint:enable:readonly-keyword */
/**
 * Drop a number of elements from the start of an array, creating a new array
 *
 * @example
 * import { dropLeft } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(dropLeft(2)([1, 2, 3]), [3])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.dropLeft = RA.dropLeft;
/**
 * Drop a number of elements from the end of an array, creating a new array
 *
 * @example
 * import { dropRight } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(dropRight(2)([1, 2, 3, 4, 5]), [1, 2, 3])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.dropRight = RA.dropRight;
/**
 * Remove the longest initial subarray for which all element satisfy the specified predicate, creating a new array
 *
 * @example
 * import { dropLeftWhile } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(dropLeftWhile((n: number) => n % 2 === 1)([1, 3, 2, 4, 5]), [2, 4, 5])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.dropLeftWhile = RA.dropLeftWhile;
/**
 * Find the first index for which a predicate holds
 *
 * @example
 * import { findIndex } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([1, 2, 3]), some(1))
 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([]), none)
 *
 * @since 2.0.0
 */
exports.findIndex = RA.findIndex;
function findFirst(predicate) {
    return RA.findFirst(predicate);
}
exports.findFirst = findFirst;
/**
 * Find the first element returned by an option based selector function
 *
 * @example
 * import { findFirstMap } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 *
 * interface Person {
 *   name: string
 *   age?: number
 * }
 *
 * const persons: Array<Person> = [{ name: 'John' }, { name: 'Mary', age: 45 }, { name: 'Joey', age: 28 }]
 *
 * // returns the name of the first person that has an age
 * assert.deepStrictEqual(findFirstMap((p: Person) => (p.age === undefined ? none : some(p.name)))(persons), some('Mary'))
 *
 * @category destructors
 * @since 2.0.0
 */
exports.findFirstMap = RA.findFirstMap;
function findLast(predicate) {
    return RA.findLast(predicate);
}
exports.findLast = findLast;
/**
 * Find the last element returned by an option based selector function
 *
 * @example
 * import { findLastMap } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 *
 * interface Person {
 *   name: string
 *   age?: number
 * }
 *
 * const persons: Array<Person> = [{ name: 'John' }, { name: 'Mary', age: 45 }, { name: 'Joey', age: 28 }]
 *
 * // returns the name of the last person that has an age
 * assert.deepStrictEqual(findLastMap((p: Person) => (p.age === undefined ? none : some(p.name)))(persons), some('Joey'))
 *
 * @category destructors
 * @since 2.0.0
 */
exports.findLastMap = RA.findLastMap;
/**
 * Returns the index of the last element of the list which matches the predicate
 *
 * @example
 * import { findLastIndex } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 *
 * interface X {
 *   a: number
 *   b: number
 * }
 * const xs: Array<X> = [{ a: 1, b: 0 }, { a: 1, b: 1 }]
 * assert.deepStrictEqual(findLastIndex((x: { a: number }) => x.a === 1)(xs), some(1))
 * assert.deepStrictEqual(findLastIndex((x: { a: number }) => x.a === 4)(xs), none)
 *
 *
 * @since 2.0.0
 */
exports.findLastIndex = RA.findLastIndex;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.copy = RA.toArray;
/**
 * Insert an element at the specified index, creating a new array, or returning `None` if the index is out of bounds
 *
 * @example
 * import { insertAt } from 'fp-ts/Array'
 * import { some } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(insertAt(2, 5)([1, 2, 3, 4]), some([1, 2, 5, 3, 4]))
 *
 * @since 2.0.0
 */
exports.insertAt = RA.insertAt;
/**
 * Change the element at the specified index, creating a new array, or returning `None` if the index is out of bounds
 *
 * @example
 * import { updateAt } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(updateAt(1, 1)([1, 2, 3]), some([1, 1, 3]))
 * assert.deepStrictEqual(updateAt(1, 1)([]), none)
 *
 * @since 2.0.0
 */
exports.updateAt = RA.updateAt;
/**
 * Delete the element at the specified index, creating a new array, or returning `None` if the index is out of bounds
 *
 * @example
 * import { deleteAt } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(deleteAt(0)([1, 2, 3]), some([2, 3]))
 * assert.deepStrictEqual(deleteAt(1)([]), none)
 *
 * @since 2.0.0
 */
exports.deleteAt = RA.deleteAt;
/**
 * Apply a function to the element at the specified index, creating a new array, or returning `None` if the index is out
 * of bounds
 *
 * @example
 * import { modifyAt } from 'fp-ts/Array'
 * import { some, none } from 'fp-ts/Option'
 *
 * const double = (x: number): number => x * 2
 * assert.deepStrictEqual(modifyAt(1, double)([1, 2, 3]), some([1, 4, 3]))
 * assert.deepStrictEqual(modifyAt(1, double)([]), none)
 *
 * @since 2.0.0
 */
exports.modifyAt = RA.modifyAt;
/**
 * Reverse an array, creating a new array
 *
 * @example
 * import { reverse } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(reverse([1, 2, 3]), [3, 2, 1])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.reverse = RA.reverse;
/**
 * Extracts from an array of `Either` all the `Right` elements. All the `Right` elements are extracted in order
 *
 * @example
 * import { rights } from 'fp-ts/Array'
 * import { right, left } from 'fp-ts/Either'
 *
 * assert.deepStrictEqual(rights([right(1), left('foo'), right(2)]), [1, 2])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.rights = RA.rights;
/**
 * Extracts from an array of `Either` all the `Left` elements. All the `Left` elements are extracted in order
 *
 * @example
 * import { lefts } from 'fp-ts/Array'
 * import { left, right } from 'fp-ts/Either'
 *
 * assert.deepStrictEqual(lefts([right(1), left('foo'), right(2)]), ['foo'])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.lefts = RA.lefts;
/**
 * Sort the elements of an array in increasing order, creating a new array
 *
 * @example
 * import { sort } from 'fp-ts/Array'
 * import { ordNumber } from 'fp-ts/Ord'
 *
 * assert.deepStrictEqual(sort(ordNumber)([3, 2, 1]), [1, 2, 3])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.sort = RA.sort;
/**
 * Apply a function to pairs of elements at the same index in two arrays, collecting the results in a new array. If one
 * input array is short, excess elements of the longer array are discarded.
 *
 * @example
 * import { zipWith } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(zipWith([1, 2, 3], ['a', 'b', 'c', 'd'], (n, s) => s + n), ['a1', 'b2', 'c3'])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.zipWith = RA.zipWith;
// TODO: remove non-curried overloading in v3
/**
 * Takes two arrays and returns an array of corresponding pairs. If one input array is short, excess elements of the
 * longer array are discarded
 *
 * @example
 * import { zip } from 'fp-ts/Array'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2, 3], zip(['a', 'b', 'c', 'd'])), [[1, 'a'], [2, 'b'], [3, 'c']])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.zip = RA.zip;
/**
 * The function is reverse of `zip`. Takes an array of pairs and return two corresponding arrays
 *
 * @example
 * import { unzip } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(unzip([[1, 'a'], [2, 'b'], [3, 'c']]), [[1, 2, 3], ['a', 'b', 'c']])
 *
 * @since 2.0.0
 */
exports.unzip = RA.unzip;
/**
 * Rotate an array to the right by `n` steps
 *
 * @example
 * import { rotate } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(rotate(2)([1, 2, 3, 4, 5]), [4, 5, 1, 2, 3])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.rotate = RA.rotate;
// TODO: remove non-curried overloading in v3
/**
 * Test if a value is a member of an array. Takes a `Eq<A>` as a single
 * argument which returns the function to use to search for a value of type `A` in
 * an array of type `Array<A>`.
 *
 * @example
 * import { elem } from 'fp-ts/Array'
 * import { eqNumber } from 'fp-ts/Eq'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.strictEqual(pipe([1, 2, 3], elem(eqNumber)(2)), true)
 * assert.strictEqual(pipe([1, 2, 3], elem(eqNumber)(0)), false)
 *
 * @since 2.0.0
 */
exports.elem = RA.elem;
/**
 * Remove duplicates from an array, keeping the first occurrence of an element.
 *
 * @example
 * import { uniq } from 'fp-ts/Array'
 * import { eqNumber } from 'fp-ts/Eq'
 *
 * assert.deepStrictEqual(uniq(eqNumber)([1, 2, 1]), [1, 2])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.uniq = RA.uniq;
/**
 * Sort the elements of an array in increasing order, where elements are compared using first `ords[0]`, then `ords[1]`,
 * etc...
 *
 * @example
 * import { sortBy } from 'fp-ts/Array'
 * import { ord, ordString, ordNumber } from 'fp-ts/Ord'
 *
 * interface Person {
 *   name: string
 *   age: number
 * }
 * const byName = ord.contramap(ordString, (p: Person) => p.name)
 * const byAge = ord.contramap(ordNumber, (p: Person) => p.age)
 *
 * const sortByNameByAge = sortBy([byName, byAge])
 *
 * const persons = [{ name: 'a', age: 1 }, { name: 'b', age: 3 }, { name: 'c', age: 2 }, { name: 'b', age: 2 }]
 * assert.deepStrictEqual(sortByNameByAge(persons), [
 *   { name: 'a', age: 1 },
 *   { name: 'b', age: 2 },
 *   { name: 'b', age: 3 },
 *   { name: 'c', age: 2 }
 * ])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.sortBy = RA.sortBy;
/**
 * A useful recursion pattern for processing an array to produce a new array, often used for "chopping" up the input
 * array. Typically chop is called with some function that will consume an initial prefix of the array and produce a
 * value and the rest of the array.
 *
 * @example
 * import { Eq, eqNumber } from 'fp-ts/Eq'
 * import { chop, spanLeft } from 'fp-ts/Array'
 *
 * const group = <A>(S: Eq<A>): ((as: Array<A>) => Array<Array<A>>) => {
 *   return chop(as => {
 *     const { init, rest } = spanLeft((a: A) => S.equals(a, as[0]))(as)
 *     return [init, rest]
 *   })
 * }
 * assert.deepStrictEqual(group(eqNumber)([1, 1, 2, 3, 3, 4]), [[1, 1], [2], [3, 3], [4]])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.chop = RA.chop;
/**
 * Splits an array into two pieces, the first piece has `n` elements.
 *
 * @example
 * import { splitAt } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(splitAt(2)([1, 2, 3, 4, 5]), [[1, 2], [3, 4, 5]])
 *
 * @since 2.0.0
 */
exports.splitAt = RA.splitAt;
/**
 * Splits an array into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of
 * the array. Note that `chunksOf(n)([])` is `[]`, not `[[]]`. This is intentional, and is consistent with a recursive
 * definition of `chunksOf`; it satisfies the property that
 *
 * ```ts
 * chunksOf(n)(xs).concat(chunksOf(n)(ys)) == chunksOf(n)(xs.concat(ys)))
 * ```
 *
 * whenever `n` evenly divides the length of `xs`.
 *
 * @example
 * import { chunksOf } from 'fp-ts/Array'
 *
 * assert.deepStrictEqual(chunksOf(2)([1, 2, 3, 4, 5]), [[1, 2], [3, 4], [5]])
 *
 * @since 2.0.0
 */
exports.chunksOf = RA.chunksOf;
function comprehension(input, f, g) {
    if (g === void 0) { g = function () { return true; }; }
    return RA.comprehension(input, f, g);
}
exports.comprehension = comprehension;
// TODO: remove non-curried overloading in v3
/**
 * Creates an array of unique values, in order, from all given arrays using a `Eq` for equality comparisons
 *
 * @example
 * import { union } from 'fp-ts/Array'
 * import { eqNumber } from 'fp-ts/Eq'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2], union(eqNumber)([2, 3])), [1, 2, 3])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.union = RA.union;
// TODO: remove non-curried overloading in v3
/**
 * Creates an array of unique values that are included in all given arrays using a `Eq` for equality
 * comparisons. The order and references of result values are determined by the first array.
 *
 * @example
 * import { intersection } from 'fp-ts/Array'
 * import { eqNumber } from 'fp-ts/Eq'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2], intersection(eqNumber)([2, 3])), [2])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.intersection = RA.intersection;
// TODO: remove non-curried overloading in v3
/**
 * Creates an array of array values not included in the other given array using a `Eq` for equality
 * comparisons. The order and references of result values are determined by the first array.
 *
 * @example
 * import { difference } from 'fp-ts/Array'
 * import { eqNumber } from 'fp-ts/Eq'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe([1, 2], difference(eqNumber)([2, 3])), [1])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.difference = RA.difference;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.of = RA.of;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = RA.Monad.map;
var ap_ = RA.Monad.ap;
var chain_ = RA.Monad.chain;
var mapWithIndex_ = RA.FunctorWithIndex.mapWithIndex;
var filter_ = RA.Filterable.filter;
var filterMap_ = RA.Filterable.filterMap;
var partition_ = RA.Filterable.partition;
var partitionMap_ = RA.Filterable.partitionMap;
var filterWithIndex_ = RA.FilterableWithIndex
    .filterWithIndex;
var filterMapWithIndex_ = RA.FilterableWithIndex
    .filterMapWithIndex;
var partitionWithIndex_ = RA.FilterableWithIndex
    .partitionWithIndex;
var partitionMapWithIndex_ = RA.FilterableWithIndex
    .partitionMapWithIndex;
var reduce_ = RA.Foldable.reduce;
var foldMap_ = RA.Foldable.foldMap;
var reduceRight_ = RA.Foldable.reduceRight;
var traverse_ = RA.Traversable.traverse;
var alt_ = RA.Alternative.alt;
var reduceWithIndex_ = RA.FoldableWithIndex.reduceWithIndex;
var foldMapWithIndex_ = RA.FoldableWithIndex.foldMapWithIndex;
var reduceRightWithIndex_ = RA.FoldableWithIndex.reduceRightWithIndex;
var traverseWithIndex_ = RA.TraversableWithIndex
    .traverseWithIndex;
var extend_ = RA.Extend.extend;
var wither_ = RA.Witherable.wither;
var wilt_ = RA.Witherable.wilt;
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = RA.map;
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = RA.ap;
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = RA.apFirst;
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = RA.apSecond;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = RA.chain;
/**
 * @since 2.7.0
 */
exports.chainWithIndex = RA.chainWithIndex;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = RA.chainFirst;
/**
 * @category FunctorWithIndex
 * @since 2.0.0
 */
exports.mapWithIndex = RA.mapWithIndex;
/**
 * @category Compactable
 * @since 2.0.0
 */
exports.compact = RA.compact;
/**
 * @category Compactable
 * @since 2.0.0
 */
exports.separate = RA.separate;
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.filter = RA.filter;
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.filterMap = RA.filterMap;
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.partition = RA.partition;
/**
 * @category FilterableWithIndex
 * @since 2.0.0
 */
exports.partitionWithIndex = RA.partitionWithIndex;
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.partitionMap = RA.partitionMap;
/**
 * @category FilterableWithIndex
 * @since 2.0.0
 */
exports.partitionMapWithIndex = RA.partitionMapWithIndex;
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = RA.alt;
/**
 * @category FilterableWithIndex
 * @since 2.0.0
 */
exports.filterMapWithIndex = RA.filterMapWithIndex;
/**
 * @category FilterableWithIndex
 * @since 2.0.0
 */
exports.filterWithIndex = RA.filterWithIndex;
/**
 * @category Extend
 * @since 2.0.0
 */
exports.extend = RA.extend;
/**
 * @category Extend
 * @since 2.0.0
 */
exports.duplicate = RA.duplicate;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.foldMap = RA.foldMap;
/**
 * @category FoldableWithIndex
 * @since 2.0.0
 */
exports.foldMapWithIndex = RA.foldMapWithIndex;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduce = RA.reduce;
/**
 * @category FoldableWithIndex
 * @since 2.0.0
 */
exports.reduceWithIndex = RA.reduceWithIndex;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduceRight = RA.reduceRight;
/**
 * @category FoldableWithIndex
 * @since 2.0.0
 */
exports.reduceRightWithIndex = RA.reduceRightWithIndex;
/**
 * @category Traversable
 * @since 2.6.3
 */
exports.traverse = RA.traverse;
/**
 * @category Traversable
 * @since 2.6.3
 */
exports.sequence = RA.sequence;
/**
 * @category TraversableWithIndex
 * @since 2.6.3
 */
exports.traverseWithIndex = RA.traverseWithIndex;
/**
 * @category Witherable
 * @since 2.6.5
 */
exports.wither = RA.wither;
/**
 * @category Witherable
 * @since 2.6.5
 */
exports.wilt = RA.wilt;
/**
 * @category Unfoldable
 * @since 2.6.6
 */
exports.unfold = RA.unfold;
/**
 * @category Alternative
 * @since 2.7.0
 */
exports.zero = RA.Alternative.zero;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Array';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FunctorWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Unfoldable = {
    URI: exports.URI,
    unfold: exports.unfold
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alternative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    alt: alt_,
    zero: exports.zero
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Extend = {
    URI: exports.URI,
    map: map_,
    extend: extend_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Compactable = {
    URI: exports.URI,
    compact: exports.compact,
    separate: exports.separate
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Filterable = {
    URI: exports.URI,
    map: map_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FilterableWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    partitionMapWithIndex: partitionMapWithIndex_,
    partitionWithIndex: partitionWithIndex_,
    filterMapWithIndex: filterMapWithIndex_,
    filterWithIndex: filterWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FoldableWithIndex = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.TraversableWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    traverse: traverse_,
    sequence: exports.sequence,
    traverseWithIndex: traverseWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Witherable = {
    URI: exports.URI,
    map: map_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    wither: wither_,
    wilt: wilt_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.array = {
    URI: exports.URI,
    compact: exports.compact,
    separate: exports.separate,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    mapWithIndex: mapWithIndex_,
    partitionMapWithIndex: partitionMapWithIndex_,
    partitionWithIndex: partitionWithIndex_,
    filterMapWithIndex: filterMapWithIndex_,
    filterWithIndex: filterWithIndex_,
    alt: alt_,
    zero: exports.zero,
    unfold: exports.unfold,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    traverseWithIndex: traverseWithIndex_,
    extend: extend_,
    wither: wither_,
    wilt: wilt_
};
// -------------------------------------------------------------------------------------
// unsafe
// -------------------------------------------------------------------------------------
/**
 * @category unsafe
 * @since 2.0.0
 */
exports.unsafeInsertAt = RA.unsafeInsertAt;
/**
 * @category unsafe
 * @since 2.0.0
 */
exports.unsafeUpdateAt = RA.unsafeUpdateAt;
/**
 * @category unsafe
 * @since 2.0.0
 */
exports.unsafeDeleteAt = RA.unsafeDeleteAt;
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * An empty array
 *
 * @since 2.0.0
 */
exports.empty = [];
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = RA.bindTo;
/**
 * @since 2.8.0
 */
exports.bind = RA.bind;
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apS = RA.apS;


/***/ }),

/***/ 666:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 6428:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDualBooleanAlgebra = exports.getFunctionBooleanAlgebra = exports.booleanAlgebraVoid = exports.booleanAlgebraBoolean = void 0;
/**
 * @category instances
 * @since 2.0.0
 */
exports.booleanAlgebraBoolean = {
    meet: function (x, y) { return x && y; },
    join: function (x, y) { return x || y; },
    zero: false,
    one: true,
    implies: function (x, y) { return !x || y; },
    not: function (x) { return !x; }
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.booleanAlgebraVoid = {
    meet: function () { return undefined; },
    join: function () { return undefined; },
    zero: undefined,
    one: undefined,
    implies: function () { return undefined; },
    not: function () { return undefined; }
};
/**
 * @category instances
 * @since 2.0.0
 */
function getFunctionBooleanAlgebra(B) {
    return function () { return ({
        meet: function (x, y) { return function (a) { return B.meet(x(a), y(a)); }; },
        join: function (x, y) { return function (a) { return B.join(x(a), y(a)); }; },
        zero: function () { return B.zero; },
        one: function () { return B.one; },
        implies: function (x, y) { return function (a) { return B.implies(x(a), y(a)); }; },
        not: function (x) { return function (a) { return B.not(x(a)); }; }
    }); };
}
exports.getFunctionBooleanAlgebra = getFunctionBooleanAlgebra;
/**
 * Every boolean algebras has a dual algebra, which involves reversing one/zero as well as join/meet.
 *
 * @category combinators
 * @since 2.0.0
 */
function getDualBooleanAlgebra(B) {
    return {
        meet: function (x, y) { return B.join(x, y); },
        join: function (x, y) { return B.meet(x, y); },
        zero: B.one,
        one: B.zero,
        implies: function (x, y) { return B.join(B.not(x), y); },
        not: B.not
    };
}
exports.getDualBooleanAlgebra = getDualBooleanAlgebra;


/***/ }),

/***/ 5105:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.boundedNumber = void 0;
/**
 * The `Bounded` type class represents totally ordered types that have an upper and lower boundary.
 *
 * Instances should satisfy the following law in addition to the `Ord` laws:
 *
 * - Bounded: `bottom <= a <= top`
 *
 * @since 2.0.0
 */
var Ord_1 = __webpack_require__(6685);
/**
 * @category instances
 * @since 2.0.0
 */
exports.boundedNumber = {
    equals: Ord_1.ordNumber.equals,
    compare: Ord_1.ordNumber.compare,
    top: Infinity,
    bottom: -Infinity
};


/***/ }),

/***/ 9062:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMinMaxBoundedDistributiveLattice = void 0;
var DistributiveLattice_1 = __webpack_require__(1399);
/**
 * @category instances
 * @since 2.0.0
 */
function getMinMaxBoundedDistributiveLattice(O) {
    var L = DistributiveLattice_1.getMinMaxDistributiveLattice(O);
    return function (min, max) { return ({
        join: L.join,
        meet: L.meet,
        zero: min,
        one: max
    }); };
}
exports.getMinMaxBoundedDistributiveLattice = getMinMaxBoundedDistributiveLattice;


/***/ }),

/***/ 9744:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 5450:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 8178:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 1021:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 2372:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 5322:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.tailRec = void 0;
/**
 * @since 2.0.0
 */
function tailRec(a, f) {
    var v = f(a);
    while (v._tag === 'Left') {
        v = f(v.left);
    }
    return v.right;
}
exports.tailRec = tailRec;


/***/ }),

/***/ 3659:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fanin = exports.splitChoice = void 0;
var function_1 = __webpack_require__(6985);
function splitChoice(F) {
    return function (pab, pcd) { return F.compose(F.left(pab), F.right(pcd)); };
}
exports.splitChoice = splitChoice;
function fanin(F) {
    var splitChoiceF = splitChoice(F);
    return function (pac, pbc) {
        var join = F.promap(F.id(), function (e) { return (e._tag === 'Left' ? e.left : e.right); }, function_1.identity);
        return F.compose(join, splitChoiceF(pac, pbc));
    };
}
exports.fanin = fanin;


/***/ }),

/***/ 1665:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 729:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCompactableComposition = void 0;
var Functor_1 = __webpack_require__(5533);
var Option_1 = __webpack_require__(2569);
function getCompactableComposition(F, G) {
    var FC = Functor_1.getFunctorComposition(F, G);
    var CC = {
        map: FC.map,
        compact: function (fga) { return F.map(fga, G.compact); },
        separate: function (fge) {
            var left = CC.compact(FC.map(fge, Option_1.getLeft));
            var right = CC.compact(FC.map(fge, Option_1.getRight));
            return { left: left, right: right };
        }
    };
    return CC;
}
exports.getCompactableComposition = getCompactableComposition;


/***/ }),

/***/ 7897:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.info = exports.error = exports.warn = exports.log = void 0;
/**
 * @since 2.0.0
 */
function log(s) {
    return function () { return console.log(s); }; // tslint:disable-line:no-console
}
exports.log = log;
/**
 * @since 2.0.0
 */
function warn(s) {
    return function () { return console.warn(s); }; // tslint:disable-line:no-console
}
exports.warn = warn;
/**
 * @since 2.0.0
 */
function error(s) {
    return function () { return console.error(s); }; // tslint:disable-line:no-console
}
exports.error = error;
/**
 * @since 2.0.0
 */
function info(s) {
    return function () { return console.info(s); }; // tslint:disable-line:no-console
}
exports.info = info;


/***/ }),

/***/ 7506:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.const_ = exports.Bifunctor = exports.Contravariant = exports.Functor = exports.URI = exports.mapLeft = exports.bimap = exports.map = exports.contramap = exports.getApplicative = exports.getApply = exports.getBooleanAlgebra = exports.getHeytingAlgebra = exports.getRing = exports.getSemiring = exports.getMonoid = exports.getSemigroup = exports.getBounded = exports.getOrd = exports.getEq = exports.getShow = exports.make = void 0;
var function_1 = __webpack_require__(6985);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.make = function_1.unsafeCoerce;
/**
 * @category instances
 * @since 2.0.0
 */
function getShow(S) {
    return {
        show: function (c) { return "make(" + S.show(c) + ")"; }
    };
}
exports.getShow = getShow;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getEq = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getOrd = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getBounded = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getSemigroup = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getMonoid = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getSemiring = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getRing = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getHeytingAlgebra = function_1.identity;
/**
 * @category instances
 * @since 2.6.0
 */
exports.getBooleanAlgebra = function_1.identity;
/**
 * @category instances
 * @since 2.0.0
 */
function getApply(S) {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return exports.make(S.concat(fab, fa)); }
    };
}
exports.getApply = getApply;
/**
 * @category instances
 * @since 2.0.0
 */
function getApplicative(M) {
    var A = getApply(M);
    return {
        URI: exports.URI,
        _E: undefined,
        map: A.map,
        ap: A.ap,
        of: function () { return exports.make(M.empty); }
    };
}
exports.getApplicative = getApplicative;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var contramap_ = function (fa, f) { return function_1.pipe(fa, exports.contramap(f)); };
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return function_1.pipe(fa, exports.bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return function_1.pipe(fa, exports.mapLeft(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Contravariant
 * @since 2.0.0
 */
exports.contramap = function () { return function_1.unsafeCoerce; };
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function () { return function_1.unsafeCoerce; };
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.6.2
 */
exports.bimap = function (f) { return function (fa) {
    return exports.make(f(fa));
}; };
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.6.2
 */
exports.mapLeft = function (f) { return function (fa) { return exports.make(f(fa)); }; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Const';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Contravariant = {
    URI: exports.URI,
    contramap: contramap_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.const_ = {
    URI: exports.URI,
    map: map_,
    contramap: contramap_,
    bimap: bimap_,
    mapLeft: mapLeft_
};


/***/ }),

/***/ 7967:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 9385:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.eqYear = exports.eqMonth = exports.eqDate = exports.now = exports.create = void 0;
/**
 * Returns the current `Date`
 *
 * @category constructors
 * @since 2.0.0
 */
exports.create = function () { return new Date(); };
/**
 * Returns the number of milliseconds elapsed since January 1, 1970, 00:00:00 UTC
 *
 * @since 2.0.0
 */
exports.now = function () { return new Date().getTime(); };
/**
 * @category instances
 * @since 2.6.0
 */
exports.eqDate = {
    equals: function (x, y) { return x.getDate() === y.getDate(); }
};
/**
 * @category instances
 * @since 2.6.0
 */
exports.eqMonth = {
    equals: function (x, y) { return x.getMonth() === y.getMonth(); }
};
/**
 * @category instances
 * @since 2.6.0
 */
exports.eqYear = {
    equals: function (x, y) { return x.getFullYear() === y.getFullYear(); }
};


/***/ }),

/***/ 1399:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getMinMaxDistributiveLattice = void 0;
var Ord_1 = __webpack_require__(6685);
/**
 * @category instances
 * @since 2.0.0
 */
function getMinMaxDistributiveLattice(O) {
    return {
        meet: Ord_1.min(O),
        join: Ord_1.max(O)
    };
}
exports.getMinMaxDistributiveLattice = getMinMaxDistributiveLattice;


/***/ }),

/***/ 7534:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.apSW = exports.bind = exports.bindW = exports.bindTo = exports.exists = exports.elem = exports.toError = exports.either = exports.getValidationMonoid = exports.MonadThrow = exports.ChainRec = exports.Extend = exports.Alt = exports.Bifunctor = exports.Traversable = exports.Foldable = exports.Monad = exports.Applicative = exports.Functor = exports.getValidationSemigroup = exports.getValidation = exports.getAltValidation = exports.getApplicativeValidation = exports.getWitherable = exports.getFilterable = exports.getApplyMonoid = exports.getApplySemigroup = exports.getSemigroup = exports.getEq = exports.getShow = exports.URI = exports.throwError = exports.sequence = exports.traverse = exports.reduceRight = exports.foldMap = exports.reduce = exports.duplicate = exports.extend = exports.alt = exports.flatten = exports.chainFirst = exports.chainFirstW = exports.chain = exports.chainW = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.apW = exports.mapLeft = exports.bimap = exports.map = exports.filterOrElse = exports.orElse = exports.swap = exports.getOrElse = exports.getOrElseW = exports.fold = exports.fromPredicate = exports.fromOption = exports.stringifyJSON = exports.parseJSON = exports.tryCatch = exports.fromNullable = exports.right = exports.left = exports.isRight = exports.isLeft = void 0;
var ChainRec_1 = __webpack_require__(5322);
var function_1 = __webpack_require__(6985);
// -------------------------------------------------------------------------------------
// guards
// -------------------------------------------------------------------------------------
/**
 * Returns `true` if the either is an instance of `Left`, `false` otherwise
 *
 * @category guards
 * @since 2.0.0
 */
exports.isLeft = function (ma) { return ma._tag === 'Left'; };
/**
 * Returns `true` if the either is an instance of `Right`, `false` otherwise
 *
 * @category guards
 * @since 2.0.0
 */
exports.isRight = function (ma) { return ma._tag === 'Right'; };
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * Constructs a new `Either` holding a `Left` value. This usually represents a failure, due to the right-bias of this
 * structure
 *
 * @category constructors
 * @since 2.0.0
 */
exports.left = function (e) { return ({ _tag: 'Left', left: e }); };
/**
 * Constructs a new `Either` holding a `Right` value. This usually represents a successful value due to the right bias
 * of this structure
 *
 * @category constructors
 * @since 2.0.0
 */
exports.right = function (a) { return ({ _tag: 'Right', right: a }); };
// TODO: make lazy in v3
/**
 * Takes a default and a nullable value, if the value is not nully, turn it into a `Right`, if the value is nully use
 * the provided default as a `Left`
 *
 * @example
 * import { fromNullable, left, right } from 'fp-ts/Either'
 *
 * const parse = fromNullable('nully')
 *
 * assert.deepStrictEqual(parse(1), right(1))
 * assert.deepStrictEqual(parse(null), left('nully'))
 *
 * @category constructors
 * @since 2.0.0
 */
function fromNullable(e) {
    return function (a) { return (a == null ? exports.left(e) : exports.right(a)); };
}
exports.fromNullable = fromNullable;
// TODO: `onError => Lazy<A> => Either` in v3
/**
 * Constructs a new `Either` from a function that might throw
 *
 * @example
 * import { Either, left, right, tryCatch } from 'fp-ts/Either'
 *
 * const unsafeHead = <A>(as: Array<A>): A => {
 *   if (as.length > 0) {
 *     return as[0]
 *   } else {
 *     throw new Error('empty array')
 *   }
 * }
 *
 * const head = <A>(as: Array<A>): Either<Error, A> => {
 *   return tryCatch(() => unsafeHead(as), e => (e instanceof Error ? e : new Error('unknown error')))
 * }
 *
 * assert.deepStrictEqual(head([]), left(new Error('empty array')))
 * assert.deepStrictEqual(head([1, 2, 3]), right(1))
 *
 * @category constructors
 * @since 2.0.0
 */
function tryCatch(f, onError) {
    try {
        return exports.right(f());
    }
    catch (e) {
        return exports.left(onError(e));
    }
}
exports.tryCatch = tryCatch;
// TODO curry in v3
/**
 * Converts a JavaScript Object Notation (JSON) string into an object.
 *
 * @example
 * import { parseJSON, toError, right, left } from 'fp-ts/Either'
 *
 * assert.deepStrictEqual(parseJSON('{"a":1}', toError), right({ a: 1 }))
 * assert.deepStrictEqual(parseJSON('{"a":}', toError), left(new SyntaxError('Unexpected token } in JSON at position 5')))
 *
 * @category constructors
 * @since 2.0.0
 */
function parseJSON(s, onError) {
    return tryCatch(function () { return JSON.parse(s); }, onError);
}
exports.parseJSON = parseJSON;
// TODO curry in v3
/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
 *
 * @example
 * import * as E from 'fp-ts/Either'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(E.stringifyJSON({ a: 1 }, E.toError), E.right('{"a":1}'))
 * const circular: any = { ref: null }
 * circular.ref = circular
 * assert.deepStrictEqual(
 *   pipe(
 *     E.stringifyJSON(circular, E.toError),
 *     E.mapLeft(e => e.message.includes('Converting circular structure to JSON'))
 *   ),
 *   E.left(true)
 * )
 *
 * @category constructors
 * @since 2.0.0
 */
function stringifyJSON(u, onError) {
    return tryCatch(function () { return JSON.stringify(u); }, onError);
}
exports.stringifyJSON = stringifyJSON;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromOption = function (onNone) { return function (ma) {
    return ma._tag === 'None' ? exports.left(onNone()) : exports.right(ma.value);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); }; };
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * Takes two functions and an `Either` value, if the value is a `Left` the inner value is applied to the first function,
 * if the value is a `Right` the inner value is applied to the second function.
 *
 * @example
 * import { fold, left, right } from 'fp-ts/Either'
 * import { pipe } from 'fp-ts/function'
 *
 * function onLeft(errors: Array<string>): string {
 *   return `Errors: ${errors.join(', ')}`
 * }
 *
 * function onRight(value: number): string {
 *   return `Ok: ${value}`
 * }
 *
 * assert.strictEqual(
 *   pipe(
 *     right(1),
 *     fold(onLeft, onRight)
 *   ),
 *   'Ok: 1'
 * )
 * assert.strictEqual(
 *   pipe(
 *     left(['error 1', 'error 2']),
 *     fold(onLeft, onRight)
 *   ),
 *   'Errors: error 1, error 2'
 * )
 *
 * @category destructors
 * @since 2.0.0
 */
function fold(onLeft, onRight) {
    return function (ma) { return (exports.isLeft(ma) ? onLeft(ma.left) : onRight(ma.right)); };
}
exports.fold = fold;
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
exports.getOrElseW = function (onLeft) { return function (ma) {
    return exports.isLeft(ma) ? onLeft(ma.left) : ma.right;
}; };
/**
 * @category destructors
 * @since 2.0.0
 */
exports.getOrElse = exports.getOrElseW;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.0.0
 */
function swap(ma) {
    return exports.isLeft(ma) ? exports.right(ma.left) : exports.left(ma.right);
}
exports.swap = swap;
/**
 * @category combinators
 * @since 2.0.0
 */
function orElse(onLeft) {
    return function (ma) { return (exports.isLeft(ma) ? onLeft(ma.left) : ma); };
}
exports.orElse = orElse;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.filterOrElse = function (predicate, onFalse) {
    return exports.chain(function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); });
};
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
var ap_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var reduce_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduce(b, f)); };
/* istanbul ignore next */
var foldMap_ = function (M) { return function (fa, f) {
    var foldMapM = exports.foldMap(M);
    return function_1.pipe(fa, foldMapM(f));
}; };
/* istanbul ignore next */
var reduceRight_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduceRight(b, f)); };
var traverse_ = function (F) {
    var traverseF = exports.traverse(F);
    return function (ta, f) { return function_1.pipe(ta, traverseF(f)); };
};
var bimap_ = function (fa, f, g) { return function_1.pipe(fa, exports.bimap(f, g)); };
var mapLeft_ = function (fa, f) { return function_1.pipe(fa, exports.mapLeft(f)); };
/* istanbul ignore next */
var alt_ = function (fa, that) { return function_1.pipe(fa, exports.alt(that)); };
/* istanbul ignore next */
var extend_ = function (wa, f) { return function_1.pipe(wa, exports.extend(f)); };
var chainRec_ = function (a, f) {
    return ChainRec_1.tailRec(f(a), function (e) {
        return exports.isLeft(e) ? exports.right(exports.left(e.left)) : exports.isLeft(e.right) ? exports.left(f(e.right.left)) : exports.right(exports.right(e.right.right));
    });
};
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) {
    return exports.isLeft(fa) ? fa : exports.right(f(fa.right));
}; };
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.bimap = function (f, g) { return function (fa) { return (exports.isLeft(fa) ? exports.left(f(fa.left)) : exports.right(g(fa.right))); }; };
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.mapLeft = function (f) { return function (fa) {
    return exports.isLeft(fa) ? exports.left(f(fa.left)) : fa;
}; };
/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 2.8.0
 */
exports.apW = function (fa) { return function (fab) {
    return exports.isLeft(fab) ? fab : exports.isLeft(fa) ? fa : exports.right(fab.right(fa.right));
}; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = exports.apW;
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * @category Applicative
 * @since 2.7.0
 */
exports.of = exports.right;
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
exports.chainW = function (f) { return function (ma) {
    return exports.isLeft(ma) ? ma : f(ma.right);
}; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = exports.chainW;
/**
 * Less strict version of [`chainFirst`](#chainFirst)
 *
 * @category Monad
 * @since 2.8.0
 */
exports.chainFirstW = function (f) { return function (ma) {
    return function_1.pipe(ma, exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    }));
}; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = exports.chainFirstW;
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = function (that) { return function (fa) {
    return exports.isLeft(fa) ? that() : fa;
}; };
/**
 * @category Extend
 * @since 2.0.0
 */
exports.extend = function (f) { return function (wa) {
    return exports.isLeft(wa) ? wa : exports.right(f(wa));
}; };
/**
 * @category Extend
 * @since 2.0.0
 */
exports.duplicate = 
/*#__PURE__*/
exports.extend(function_1.identity);
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduce = function (b, f) { return function (fa) {
    return exports.isLeft(fa) ? b : f(b, fa.right);
}; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.foldMap = function (M) { return function (f) { return function (fa) {
    return exports.isLeft(fa) ? M.empty : f(fa.right);
}; }; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduceRight = function (b, f) { return function (fa) {
    return exports.isLeft(fa) ? b : f(fa.right, b);
}; };
/**
 * @category Traversable
 * @since 2.6.3
 */
exports.traverse = function (F) { return function (f) { return function (ta) { return (exports.isLeft(ta) ? F.of(exports.left(ta.left)) : F.map(f(ta.right), exports.right)); }; }; };
/**
 * @category Traversable
 * @since 2.6.3
 */
exports.sequence = function (F) { return function (ma) {
    return exports.isLeft(ma) ? F.of(exports.left(ma.left)) : F.map(ma.right, exports.right);
}; };
/**
 * @category MonadThrow
 * @since 2.6.3
 */
exports.throwError = exports.left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Either';
/**
 * @category instances
 * @since 2.0.0
 */
function getShow(SE, SA) {
    return {
        show: function (ma) { return (exports.isLeft(ma) ? "left(" + SE.show(ma.left) + ")" : "right(" + SA.show(ma.right) + ")"); }
    };
}
exports.getShow = getShow;
/**
 * @category instances
 * @since 2.0.0
 */
function getEq(EL, EA) {
    return {
        equals: function (x, y) {
            return x === y || (exports.isLeft(x) ? exports.isLeft(y) && EL.equals(x.left, y.left) : exports.isRight(y) && EA.equals(x.right, y.right));
        }
    };
}
exports.getEq = getEq;
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @example
 * import { getSemigroup, left, right } from 'fp-ts/Either'
 * import { semigroupSum } from 'fp-ts/Semigroup'
 *
 * const S = getSemigroup<string, number>(semigroupSum)
 * assert.deepStrictEqual(S.concat(left('a'), left('b')), left('a'))
 * assert.deepStrictEqual(S.concat(left('a'), right(2)), right(2))
 * assert.deepStrictEqual(S.concat(right(1), left('b')), right(1))
 * assert.deepStrictEqual(S.concat(right(1), right(2)), right(3))
 *
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return {
        concat: function (x, y) { return (exports.isLeft(y) ? x : exports.isLeft(x) ? y : exports.right(S.concat(x.right, y.right))); }
    };
}
exports.getSemigroup = getSemigroup;
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @example
 * import { getApplySemigroup, left, right } from 'fp-ts/Either'
 * import { semigroupSum } from 'fp-ts/Semigroup'
 *
 * const S = getApplySemigroup<string, number>(semigroupSum)
 * assert.deepStrictEqual(S.concat(left('a'), left('b')), left('a'))
 * assert.deepStrictEqual(S.concat(left('a'), right(2)), left('a'))
 * assert.deepStrictEqual(S.concat(right(1), left('b')), left('b'))
 * assert.deepStrictEqual(S.concat(right(1), right(2)), right(3))
 *
 * @category instances
 * @since 2.0.0
 */
function getApplySemigroup(S) {
    return {
        concat: function (x, y) { return (exports.isLeft(x) ? x : exports.isLeft(y) ? y : exports.right(S.concat(x.right, y.right))); }
    };
}
exports.getApplySemigroup = getApplySemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getApplyMonoid(M) {
    return {
        concat: getApplySemigroup(M).concat,
        empty: exports.right(M.empty)
    };
}
exports.getApplyMonoid = getApplyMonoid;
/**
 * Builds a `Filterable` instance for `Either` given `Monoid` for the left side
 *
 * @category instances
 * @since 3.0.0
 */
function getFilterable(M) {
    var empty = exports.left(M.empty);
    var compact = function (ma) {
        return exports.isLeft(ma) ? ma : ma.right._tag === 'None' ? empty : exports.right(ma.right.value);
    };
    var separate = function (ma) {
        return exports.isLeft(ma)
            ? { left: ma, right: ma }
            : exports.isLeft(ma.right)
                ? { left: exports.right(ma.right.left), right: empty }
                : { left: empty, right: exports.right(ma.right.right) };
    };
    var partitionMap = function (ma, f) {
        if (exports.isLeft(ma)) {
            return { left: ma, right: ma };
        }
        var e = f(ma.right);
        return exports.isLeft(e) ? { left: exports.right(e.left), right: empty } : { left: empty, right: exports.right(e.right) };
    };
    var partition = function (ma, p) {
        return exports.isLeft(ma)
            ? { left: ma, right: ma }
            : p(ma.right)
                ? { left: empty, right: exports.right(ma.right) }
                : { left: exports.right(ma.right), right: empty };
    };
    var filterMap = function (ma, f) {
        if (exports.isLeft(ma)) {
            return ma;
        }
        var ob = f(ma.right);
        return ob._tag === 'None' ? empty : exports.right(ob.value);
    };
    var filter = function (ma, predicate) {
        return exports.isLeft(ma) ? ma : predicate(ma.right) ? ma : empty;
    };
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        compact: compact,
        separate: separate,
        filter: filter,
        filterMap: filterMap,
        partition: partition,
        partitionMap: partitionMap
    };
}
exports.getFilterable = getFilterable;
/**
 * Builds `Witherable` instance for `Either` given `Monoid` for the left side
 *
 * @category instances
 * @since 2.0.0
 */
function getWitherable(M) {
    var F_ = getFilterable(M);
    var wither = function (F) {
        var traverseF = traverse_(F);
        return function (ma, f) { return F.map(traverseF(ma, f), F_.compact); };
    };
    var wilt = function (F) {
        var traverseF = traverse_(F);
        return function (ma, f) { return F.map(traverseF(ma, f), F_.separate); };
    };
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        compact: F_.compact,
        separate: F_.separate,
        filter: F_.filter,
        filterMap: F_.filterMap,
        partition: F_.partition,
        partitionMap: F_.partitionMap,
        traverse: traverse_,
        sequence: exports.sequence,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        wither: wither,
        wilt: wilt
    };
}
exports.getWitherable = getWitherable;
/**
 * @category instances
 * @since 2.7.0
 */
function getApplicativeValidation(SE) {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) {
            return exports.isLeft(fab)
                ? exports.isLeft(fa)
                    ? exports.left(SE.concat(fab.left, fa.left))
                    : fab
                : exports.isLeft(fa)
                    ? fa
                    : exports.right(fab.right(fa.right));
        },
        of: exports.of
    };
}
exports.getApplicativeValidation = getApplicativeValidation;
/**
 * @category instances
 * @since 2.7.0
 */
function getAltValidation(SE) {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) {
            if (exports.isRight(me)) {
                return me;
            }
            var ea = that();
            return exports.isLeft(ea) ? exports.left(SE.concat(me.left, ea.left)) : ea;
        }
    };
}
exports.getAltValidation = getAltValidation;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
function getValidation(SE) {
    var applicativeValidation = getApplicativeValidation(SE);
    var altValidation = getAltValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        of: exports.of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        reduce: reduce_,
        foldMap: foldMap_,
        reduceRight: reduceRight_,
        extend: extend_,
        traverse: traverse_,
        sequence: exports.sequence,
        chainRec: chainRec_,
        throwError: exports.throwError,
        ap: applicativeValidation.ap,
        alt: altValidation.alt
    };
}
exports.getValidation = getValidation;
/**
 * @category instances
 * @since 2.0.0
 */
function getValidationSemigroup(SE, SA) {
    return {
        concat: function (x, y) {
            return exports.isLeft(x) ? (exports.isLeft(y) ? exports.left(SE.concat(x.left, y.left)) : x) : exports.isLeft(y) ? y : exports.right(SA.concat(x.right, y.right));
        }
    };
}
exports.getValidationSemigroup = getValidationSemigroup;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Extend = {
    URI: exports.URI,
    map: map_,
    extend: extend_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ChainRec = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    chain: chain_,
    chainRec: chainRec_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.MonadThrow = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_,
    throwError: exports.throwError
};
/**
 * @category instances
 * @since 2.0.0
 */
function getValidationMonoid(SE, SA) {
    return {
        concat: getValidationSemigroup(SE, SA).concat,
        empty: exports.right(SA.empty)
    };
}
exports.getValidationMonoid = getValidationMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
exports.either = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    bimap: bimap_,
    mapLeft: mapLeft_,
    alt: alt_,
    extend: extend_,
    chainRec: chainRec_,
    throwError: exports.throwError
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * Default value for the `onError` argument of `tryCatch`
 *
 * @since 2.0.0
 */
function toError(e) {
    return e instanceof Error ? e : new Error(String(e));
}
exports.toError = toError;
/**
 * @since 2.0.0
 */
function elem(E) {
    return function (a, ma) { return (exports.isLeft(ma) ? false : E.equals(a, ma.right)); };
}
exports.elem = elem;
/**
 * Returns `false` if `Left` or returns the result of the application of the given predicate to the `Right` value.
 *
 * @example
 * import { exists, left, right } from 'fp-ts/Either'
 *
 * const gt2 = exists((n: number) => n > 2)
 *
 * assert.strictEqual(gt2(left('a')), false)
 * assert.strictEqual(gt2(right(1)), false)
 * assert.strictEqual(gt2(right(3)), true)
 *
 * @since 2.0.0
 */
function exists(predicate) {
    return function (ma) { return (exports.isLeft(ma) ? false : predicate(ma.right)); };
}
exports.exists = exists;
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) {
    return exports.map(function_1.bindTo_(name));
};
/**
 * @since 2.8.0
 */
exports.bindW = function (name, f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
/**
 * @since 2.8.0
 */
exports.bind = exports.bindW;
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apSW = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.apW(fb));
};
/**
 * @since 2.8.0
 */
exports.apS = exports.apSW;


/***/ }),

/***/ 9803:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getEitherM = void 0;
var E = __importStar(__webpack_require__(7534));
var function_1 = __webpack_require__(6985);
function getEitherM(M) {
    var ap = function (fga) { return function (fgab) {
        return M.ap(M.map(fgab, function (h) { return function (ga) { return function_1.pipe(h, E.ap(ga)); }; }), fga);
    }; };
    var of = function_1.flow(E.right, M.of);
    return {
        map: function (fa, f) { return M.map(fa, E.map(f)); },
        ap: function (fab, fa) { return function_1.pipe(fab, ap(fa)); },
        of: of,
        chain: function (ma, f) { return M.chain(ma, function (e) { return (E.isLeft(e) ? M.of(E.left(e.left)) : f(e.right)); }); },
        alt: function (fa, that) { return M.chain(fa, function (e) { return (E.isLeft(e) ? that() : of(e.right)); }); },
        bimap: function (ma, f, g) { return M.map(ma, function (e) { return function_1.pipe(e, E.bimap(f, g)); }); },
        mapLeft: function (ma, f) { return M.map(ma, function (e) { return function_1.pipe(e, E.mapLeft(f)); }); },
        fold: function (ma, onLeft, onRight) { return M.chain(ma, E.fold(onLeft, onRight)); },
        getOrElse: function (ma, onLeft) { return M.chain(ma, E.fold(onLeft, M.of)); },
        orElse: function (ma, f) {
            return M.chain(ma, E.fold(f, function (a) { return of(a); }));
        },
        swap: function (ma) { return M.map(ma, E.swap); },
        rightM: function (ma) { return M.map(ma, E.right); },
        leftM: function (ml) { return M.map(ml, E.left); },
        left: function (e) { return M.of(E.left(e)); }
    };
}
exports.getEitherM = getEitherM;


/***/ }),

/***/ 6964:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.eq = exports.Contravariant = exports.getMonoid = exports.eqDate = exports.getTupleEq = exports.getStructEq = exports.eqBoolean = exports.eqNumber = exports.eqString = exports.strictEqual = exports.eqStrict = exports.URI = exports.contramap = exports.fromEquals = void 0;
var function_1 = __webpack_require__(6985);
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
function fromEquals(equals) {
    return {
        equals: function (x, y) { return x === y || equals(x, y); }
    };
}
exports.fromEquals = fromEquals;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var contramap_ = function (fa, f) { return function_1.pipe(fa, exports.contramap(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Contravariant
 * @since 2.0.0
 */
exports.contramap = function (f) { return function (fa) {
    return fromEquals(function (x, y) { return fa.equals(f(x), f(y)); });
}; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Eq';
/**
 * @category instances
 * @since 2.5.0
 */
exports.eqStrict = {
    // tslint:disable-next-line: deprecation
    equals: strictEqual
};
/**
 * Use `eqStrict` instead
 *
 * @since 2.0.0
 * @deprecated
 */
function strictEqual(a, b) {
    return a === b;
}
exports.strictEqual = strictEqual;
/**
 * @category instances
 * @since 2.0.0
 */
exports.eqString = exports.eqStrict;
/**
 * @category instances
 * @since 2.0.0
 */
exports.eqNumber = exports.eqStrict;
/**
 * @category instances
 * @since 2.0.0
 */
exports.eqBoolean = exports.eqStrict;
/**
 * @category instances
 * @since 2.0.0
 */
function getStructEq(eqs) {
    return fromEquals(function (x, y) {
        for (var k in eqs) {
            if (!eqs[k].equals(x[k], y[k])) {
                return false;
            }
        }
        return true;
    });
}
exports.getStructEq = getStructEq;
/**
 * Given a tuple of `Eq`s returns a `Eq` for the tuple
 *
 * @example
 * import { getTupleEq, eqString, eqNumber, eqBoolean } from 'fp-ts/Eq'
 *
 * const E = getTupleEq(eqString, eqNumber, eqBoolean)
 * assert.strictEqual(E.equals(['a', 1, true], ['a', 1, true]), true)
 * assert.strictEqual(E.equals(['a', 1, true], ['b', 1, true]), false)
 * assert.strictEqual(E.equals(['a', 1, true], ['a', 2, true]), false)
 * assert.strictEqual(E.equals(['a', 1, true], ['a', 1, false]), false)
 *
 * @category instances
 * @since 2.0.0
 */
function getTupleEq() {
    var eqs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        eqs[_i] = arguments[_i];
    }
    return fromEquals(function (x, y) { return eqs.every(function (E, i) { return E.equals(x[i], y[i]); }); });
}
exports.getTupleEq = getTupleEq;
/**
 * @category instances
 * @since 2.0.0
 */
exports.eqDate = {
    equals: function (x, y) { return x.valueOf() === y.valueOf(); }
};
var empty = {
    equals: function () { return true; }
};
/**
 * @category instances
 * @since 2.6.0
 */
function getMonoid() {
    return {
        concat: function (x, y) { return fromEquals(function (a, b) { return x.equals(a, b) && y.equals(a, b); }); },
        empty: empty
    };
}
exports.getMonoid = getMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Contravariant = {
    URI: exports.URI,
    contramap: contramap_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.eq = exports.Contravariant;


/***/ }),

/***/ 5243:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 6253:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.lcm = exports.gcd = exports.fieldNumber = void 0;
/**
 * @category instances
 * @since 2.0.0
 */
exports.fieldNumber = {
    add: function (x, y) { return x + y; },
    zero: 0,
    mul: function (x, y) { return x * y; },
    one: 1,
    sub: function (x, y) { return x - y; },
    degree: function (_) { return 1; },
    div: function (x, y) { return x / y; },
    mod: function (x, y) { return x % y; }
};
/**
 * The *greatest common divisor* of two values
 *
 * @since 2.0.0
 */
function gcd(E, field) {
    var zero = field.zero;
    var f = function (x, y) { return (E.equals(y, zero) ? x : f(y, field.mod(x, y))); };
    return f;
}
exports.gcd = gcd;
/**
 * The *least common multiple* of two values
 *
 * @since 2.0.0
 */
function lcm(E, F) {
    var zero = F.zero;
    var gcdSF = gcd(E, F);
    return function (x, y) { return (E.equals(x, zero) || E.equals(y, zero) ? zero : F.div(F.mul(x, y), gcdSF(x, y))); };
}
exports.lcm = lcm;


/***/ }),

/***/ 6907:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getFilterableComposition = void 0;
/**
 * `Filterable` represents data structures which can be _partitioned_/_filtered_.
 *
 * Adapted from https://github.com/LiamGoodacre/purescript-filterable/blob/master/src/Data/Filterable.purs
 *
 * @since 2.0.0
 */
var Compactable_1 = __webpack_require__(729);
var Option_1 = __webpack_require__(2569);
function getFilterableComposition(F, G) {
    var CC = Compactable_1.getCompactableComposition(F, G);
    var FC = {
        map: CC.map,
        compact: CC.compact,
        separate: CC.separate,
        partitionMap: function (fga, f) {
            var left = FC.filterMap(fga, function (a) { return Option_1.getLeft(f(a)); });
            var right = FC.filterMap(fga, function (a) { return Option_1.getRight(f(a)); });
            return { left: left, right: right };
        },
        partition: function (fga, p) {
            var left = FC.filter(fga, function (a) { return !p(a); });
            var right = FC.filter(fga, p);
            return { left: left, right: right };
        },
        filterMap: function (fga, f) { return F.map(fga, function (ga) { return G.filterMap(ga, f); }); },
        filter: function (fga, f) { return F.map(fga, function (ga) { return G.filter(ga, f); }); }
    };
    return FC;
}
exports.getFilterableComposition = getFilterableComposition;


/***/ }),

/***/ 4699:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 791:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.traverse_ = exports.toArray = exports.intercalate = exports.reduceM = exports.foldM = exports.getFoldableComposition = void 0;
var function_1 = __webpack_require__(6985);
function getFoldableComposition(F, G) {
    return {
        reduce: function (fga, b, f) { return F.reduce(fga, b, function (b, ga) { return G.reduce(ga, b, f); }); },
        foldMap: function (M) {
            var foldMapF = F.foldMap(M);
            var foldMapG = G.foldMap(M);
            return function (fa, f) { return foldMapF(fa, function (ga) { return foldMapG(ga, f); }); };
        },
        reduceRight: function (fa, b, f) { return F.reduceRight(fa, b, function (ga, b) { return G.reduceRight(ga, b, f); }); }
    };
}
exports.getFoldableComposition = getFoldableComposition;
function foldM(M, F) {
    return function (fa, b, f) { return F.reduce(fa, M.of(b), function (mb, a) { return M.chain(mb, function (b) { return f(b, a); }); }); };
}
exports.foldM = foldM;
function reduceM(M, F) {
    return function (b, f) { return function (fa) { return F.reduce(fa, M.of(b), function (mb, a) { return M.chain(mb, function (b) { return f(b, a); }); }); }; };
}
exports.reduceM = reduceM;
function intercalate(M, F) {
    return function (sep, fm) {
        var go = function (_a, x) {
            var init = _a.init, acc = _a.acc;
            return init ? { init: false, acc: x } : { init: false, acc: M.concat(M.concat(acc, sep), x) };
        };
        return F.reduce(fm, { init: true, acc: M.empty }, go).acc;
    };
}
exports.intercalate = intercalate;
function toArray(F) {
    return function (fa) {
        // tslint:disable-next-line: readonly-array
        return F.reduce(fa, [], function (acc, a) {
            acc.push(a);
            return acc;
        });
    };
}
exports.toArray = toArray;
function traverse_(M, F) {
    var applyFirst = function (mu, mb) { return M.ap(M.map(mu, function_1.constant), mb); };
    var mu = M.of(undefined);
    return function (fa, f) { return F.reduce(fa, mu, function (mu, a) { return applyFirst(mu, f(a)); }); };
}
exports.traverse_ = traverse_;


/***/ }),

/***/ 4306:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getFoldableWithIndexComposition = void 0;
/**
 * A `Foldable` with an additional index.
 * A `FoldableWithIndex` instance must be compatible with its `Foldable` instance
 *
 * ```ts
 * reduce(fa, b, f) = reduceWithIndex(fa, b, (_, b, a) => f(b, a))
 * foldMap(M)(fa, f) = foldMapWithIndex(M)(fa, (_, a) => f(a))
 * reduceRight(fa, b, f) = reduceRightWithIndex(fa, b, (_, a, b) => f(a, b))
 * ```
 *
 * @since 2.0.0
 */
var Foldable_1 = __webpack_require__(791);
function getFoldableWithIndexComposition(F, G) {
    var FC = Foldable_1.getFoldableComposition(F, G);
    return {
        reduce: FC.reduce,
        foldMap: FC.foldMap,
        reduceRight: FC.reduceRight,
        reduceWithIndex: function (fga, b, f) {
            return F.reduceWithIndex(fga, b, function (fi, b, ga) { return G.reduceWithIndex(ga, b, function (gi, b, a) { return f([fi, gi], b, a); }); });
        },
        foldMapWithIndex: function (M) {
            var foldMapWithIndexF = F.foldMapWithIndex(M);
            var foldMapWithIndexG = G.foldMapWithIndex(M);
            return function (fga, f) { return foldMapWithIndexF(fga, function (fi, ga) { return foldMapWithIndexG(ga, function (gi, a) { return f([fi, gi], a); }); }); };
        },
        reduceRightWithIndex: function (fga, b, f) {
            return F.reduceRightWithIndex(fga, b, function (fi, ga, b) { return G.reduceRightWithIndex(ga, b, function (gi, a, b) { return f([fi, gi], a, b); }); });
        }
    };
}
exports.getFoldableWithIndexComposition = getFoldableWithIndexComposition;


/***/ }),

/***/ 5533:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getFunctorComposition = void 0;
function getFunctorComposition(F, G) {
    return {
        map: function (fa, f) { return F.map(fa, function (ga) { return G.map(ga, f); }); }
    };
}
exports.getFunctorComposition = getFunctorComposition;


/***/ }),

/***/ 1276:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getFunctorWithIndexComposition = void 0;
var Functor_1 = __webpack_require__(5533);
function getFunctorWithIndexComposition(F, G) {
    return {
        map: Functor_1.getFunctorComposition(F, G).map,
        mapWithIndex: function (fga, f) { return F.mapWithIndex(fga, function (fi, ga) { return G.mapWithIndex(ga, function (gi, a) { return f([fi, gi], a); }); }); }
    };
}
exports.getFunctorWithIndexComposition = getFunctorWithIndexComposition;


/***/ }),

/***/ 8791:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 0:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Type defunctionalization (as describe in [Lightweight higher-kinded polymorphism](https://www.cl.cam.ac.uk/~jdy22/papers/lightweight-higher-kinded-polymorphism.pdf))
 *
 * @since 2.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 140:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 3760:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.bind = exports.bindTo = exports.io = exports.ChainRec = exports.MonadIO = exports.Monad = exports.Applicative = exports.Functor = exports.getMonoid = exports.getSemigroup = exports.URI = exports.fromIO = exports.flatten = exports.chainFirst = exports.chain = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.map = void 0;
var function_1 = __webpack_require__(6985);
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (ma, f) { return function () { return f(ma()); }; };
var ap_ = function (mab, ma) { return function () { return mab()(ma()); }; };
var chain_ = function (ma, f) { return function () { return f(ma())(); }; };
var chainRec_ = function (a, f) { return function () {
    var e = f(a)();
    while (e._tag === 'Left') {
        e = f(e.left)();
    }
    return e.right;
}; };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return map_(fa, f); }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) { return ap_(fab, fa); }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * @category Applicative
 * @since 2.0.0
 */
exports.of = function (a) { return function () { return a; }; };
/**
 * @category Monad
 * @since 2.0.0
 */
exports.chain = function (f) { return function (ma) { return chain_(ma, f); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = function (f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * @category MonadIO
 * @since 2.7.0
 */
exports.fromIO = function_1.identity;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'IO';
/**
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return {
        concat: function (x, y) { return function () { return S.concat(x(), y()); }; }
    };
}
exports.getSemigroup = getSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getMonoid(M) {
    return {
        concat: getSemigroup(M).concat,
        empty: exports.of(M.empty)
    };
}
exports.getMonoid = getMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.MonadIO = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_,
    fromIO: exports.fromIO
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ChainRec = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    chain: chain_,
    chainRec: chainRec_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.io = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    fromIO: exports.fromIO,
    chainRec: chainRec_
};
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) { return exports.map(function_1.bindTo_(name)); };
/**
 * @since 2.8.0
 */
exports.bind = function (name, f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apS = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.ap(fb));
};


/***/ }),

/***/ 119:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.apSW = exports.bind = exports.bindW = exports.bindTo = exports.bracket = exports.ioEither = exports.MonadThrow = exports.MonadIO = exports.Alt = exports.Monad = exports.Applicative = exports.Bifunctor = exports.Functor = exports.getFilterable = exports.getIOValidation = exports.getAltIOValidation = exports.getApplicativeIOValidation = exports.getApplyMonoid = exports.getApplySemigroup = exports.getSemigroup = exports.URI = exports.throwError = exports.fromIO = exports.alt = exports.flatten = exports.chainFirst = exports.chainFirstW = exports.chain = exports.chainW = exports.apSecond = exports.apFirst = exports.ap = exports.apW = exports.mapLeft = exports.bimap = exports.map = exports.chainEitherK = exports.chainEitherKW = exports.fromEitherK = exports.filterOrElse = exports.swap = exports.orElse = exports.getOrElse = exports.getOrElseW = exports.fold = exports.tryCatch = exports.fromPredicate = exports.fromOption = exports.fromEither = exports.leftIO = exports.rightIO = exports.right = exports.left = void 0;
var E = __importStar(__webpack_require__(7534));
var Filterable_1 = __webpack_require__(6907);
var function_1 = __webpack_require__(6985);
var I = __importStar(__webpack_require__(3760));
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
exports.left = 
/*#__PURE__*/
function_1.flow(E.left, I.of);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.right = 
/*#__PURE__*/
function_1.flow(E.right, I.of);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightIO = 
/*#__PURE__*/
I.map(E.right);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.leftIO = 
/*#__PURE__*/
I.map(E.left);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromEither = 
/*#__PURE__*/
E.fold(exports.left, function (a) { return exports.right(a); });
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromOption = function (onNone) { return function (ma) {
    return ma._tag === 'None' ? exports.left(onNone()) : exports.right(ma.value);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); }; };
/**
 * Constructs a new `IOEither` from a function that performs a side effect and might throw
 *
 * @category constructors
 * @since 2.0.0
 */
function tryCatch(f, onError) {
    return function () { return E.tryCatch(f, onError); };
}
exports.tryCatch = tryCatch;
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.0.0
 */
exports.fold = 
/*#__PURE__*/
function_1.flow(E.fold, I.chain);
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
exports.getOrElseW = function (onLeft) { return function (ma) {
    return function_1.pipe(ma, I.chain(E.fold(onLeft, I.of)));
}; };
/**
 * @category destructors
 * @since 2.0.0
 */
exports.getOrElse = exports.getOrElseW;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.0.0
 */
exports.orElse = function (f) {
    return I.chain(E.fold(f, exports.right));
};
/**
 * @category combinators
 * @since 2.0.0
 */
exports.swap = 
/*#__PURE__*/
I.map(E.swap);
/**
 * @category combinators
 * @since 2.0.0
 */
exports.filterOrElse = function (predicate, onFalse) {
    return exports.chain(function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); });
};
/**
 * @category combinators
 * @since 2.4.0
 */
function fromEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromEither(f.apply(void 0, a));
    };
}
exports.fromEitherK = fromEitherK;
/**
 * Less strict version of [`chainEitherK`](#chainEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainEitherKW = function (f) { return exports.chainW(fromEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainEitherK = exports.chainEitherKW;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var ap_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var of = exports.right;
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return function_1.pipe(fa, exports.bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return function_1.pipe(fa, exports.mapLeft(f)); };
/* istanbul ignore next */
var alt_ = function (fa, that) { return function_1.pipe(fa, exports.alt(that)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return I.map(E.map(f)); };
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.bimap = 
/*#__PURE__*/
function_1.flow(E.bimap, I.map);
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.mapLeft = function (f) { return I.map(E.mapLeft(f)); };
/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 2.8.0
 */
exports.apW = function (fa) {
    return function_1.flow(I.map(function (gab) { return function (ga) { return E.apW(ga)(gab); }; }), I.ap(fa));
};
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = exports.apW;
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
exports.chainW = function (f) { return function (ma) {
    return function_1.pipe(ma, I.chain(E.fold(exports.left, f)));
}; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = exports.chainW;
/**
 * Less strict version of [`chainFirst`](#chainFirst).
 *
 * @category Monad
 * @since 2.8.0
 */
exports.chainFirstW = function (f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = exports.chainFirstW;
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = function (that) {
    return I.chain(E.fold(that, exports.right));
};
/**
 * @category MonadIO
 * @since 2.7.0
 */
exports.fromIO = exports.rightIO;
/**
 * @category MonadThrow
 * @since 2.7.0
 */
exports.throwError = exports.left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'IOEither';
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return I.getSemigroup(E.getSemigroup(S));
}
exports.getSemigroup = getSemigroup;
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getApplySemigroup(S) {
    return I.getSemigroup(E.getApplySemigroup(S));
}
exports.getApplySemigroup = getApplySemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getApplyMonoid(M) {
    return {
        concat: getApplySemigroup(M).concat,
        empty: exports.right(M.empty)
    };
}
exports.getApplyMonoid = getApplyMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
function getApplicativeIOValidation(SE) {
    var AV = E.getApplicativeValidation(SE);
    var ap = function (fga) {
        return function_1.flow(I.map(function (gab) { return function (ga) { return AV.ap(gab, ga); }; }), I.ap(fga));
    };
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return function_1.pipe(fab, ap(fa)); },
        of: of
    };
}
exports.getApplicativeIOValidation = getApplicativeIOValidation;
/**
 * @category instances
 * @since 2.7.0
 */
function getAltIOValidation(SE) {
    var A = E.getAltValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) { return function () { return A.alt(me(), function () { return that()(); }); }; }
    };
}
exports.getAltIOValidation = getAltIOValidation;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
function getIOValidation(SE) {
    var applicativeIOValidation = getApplicativeIOValidation(SE);
    var altIOValidation = getAltIOValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: applicativeIOValidation.ap,
        of: of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        alt: altIOValidation.alt,
        fromIO: exports.fromIO,
        throwError: exports.throwError
    };
}
exports.getIOValidation = getIOValidation;
/**
 * @category instances
 * @since 2.1.0
 */
function getFilterable(M) {
    var W = E.getWitherable(M);
    var F = Filterable_1.getFilterableComposition(I.Monad, W);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        compact: F.compact,
        separate: F.separate,
        filter: F.filter,
        filterMap: F.filterMap,
        partition: F.partition,
        partitionMap: F.partitionMap
    };
}
exports.getFilterable = getFilterable;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.MonadIO = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_,
    fromIO: exports.fromIO
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.MonadThrow = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_,
    throwError: exports.throwError
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.ioEither = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_,
    map: map_,
    of: of,
    ap: ap_,
    chain: chain_,
    alt: alt_,
    fromIO: exports.fromIO,
    throwError: exports.throwError
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * Make sure that a resource is cleaned up in the event of an exception (\*). The release action is called regardless of
 * whether the body action throws (\*) or returns.
 *
 * (\*) i.e. returns a `Left`
 *
 * @since 2.0.0
 */
exports.bracket = function (acquire, use, release) {
    return function_1.pipe(acquire, exports.chain(function (a) {
        return function_1.pipe(function_1.pipe(use(a), I.map(E.right)), exports.chain(function (e) {
            return function_1.pipe(release(a, e), exports.chain(function () { return (E.isLeft(e) ? exports.left(e.left) : of(e.right)); }));
        }));
    }));
};
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) {
    return exports.map(function_1.bindTo_(name));
};
/**
 * @since 2.8.0
 */
exports.bindW = function (name, f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
/**
 * @since 2.8.0
 */
exports.bind = exports.bindW;
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apSW = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.apW(fb));
};
/**
 * @since 2.8.0
 */
exports.apS = exports.apSW;


/***/ }),

/***/ 4449:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.newIORef = exports.IORef = void 0;
/**
 * @example
 * import { io } from 'fp-ts/IO'
 * import { newIORef } from 'fp-ts/IORef'
 *
 * assert.strictEqual(io.chain(newIORef(1), ref => io.chain(ref.write(2), () => ref.read))(), 2)
 *
 * @category model
 * @since 2.0.0
 */
var IORef = /** @class */ (function () {
    function IORef(value) {
        var _this = this;
        this.value = value;
        this.read = function () { return _this.value; };
        this.write = this.write.bind(this);
        this.modify = this.modify.bind(this);
    }
    /**
     * @since 2.0.0
     */
    IORef.prototype.write = function (a) {
        var _this = this;
        return function () {
            _this.value = a;
        };
    };
    /**
     * @since 2.0.0
     */
    IORef.prototype.modify = function (f) {
        var _this = this;
        return function () {
            _this.value = f(_this.value);
        };
    };
    return IORef;
}());
exports.IORef = IORef;
/**
 * @category constructors
 * @since 2.0.0
 */
function newIORef(a) {
    return function () { return new IORef(a); };
}
exports.newIORef = newIORef;


/***/ }),

/***/ 151:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.bind = exports.bindTo = exports.identity = exports.ChainRec = exports.Comonad = exports.Alt = exports.Traversable = exports.Foldable = exports.Monad = exports.Applicative = exports.Functor = exports.getEq = exports.getShow = exports.URI = exports.alt = exports.sequence = exports.traverse = exports.reduceRight = exports.foldMap = exports.reduce = exports.flatten = exports.duplicate = exports.extract = exports.extend = exports.chainFirst = exports.chain = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.map = void 0;
var ChainRec_1 = __webpack_require__(5322);
var function_1 = __webpack_require__(6985);
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
var ap_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var reduce_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduce(b, f)); };
/* istanbul ignore next */
var foldMap_ = function (M) { return function (fa, f) { return function_1.pipe(fa, exports.foldMap(M)(f)); }; };
/* istanbul ignore next */
var reduceRight_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduceRight(b, f)); };
var alt_ = function_1.identity;
/* istanbul ignore next */
var extend_ = function (wa, f) { return function_1.pipe(wa, exports.extend(f)); };
/* istanbul ignore next */
var traverse_ = function (F) {
    var traverseF = exports.traverse(F);
    return function (ta, f) { return function_1.pipe(ta, traverseF(f)); };
};
var chainRec_ = ChainRec_1.tailRec;
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return f(fa); }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) { return fab(fa); }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * @category Applicative
 * @since 2.0.0
 */
exports.of = function_1.identity;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = function (f) { return function (ma) { return f(ma); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = function (f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * @category Extend
 * @since 2.0.0
 */
exports.extend = function (f) { return function (wa) { return f(wa); }; };
/**
 * @category Extract
 * @since 2.6.2
 */
exports.extract = function_1.identity;
/**
 * @category Extend
 * @since 2.0.0
 */
exports.duplicate = 
/*#__PURE__*/
exports.extend(function_1.identity);
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduce = function (b, f) { return function (fa) { return f(b, fa); }; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.foldMap = function () { return function (f) { return function (fa) { return f(fa); }; }; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduceRight = function (b, f) { return function (fa) { return f(fa, b); }; };
/**
 * @since 2.6.3
 */
exports.traverse = function (F) { return function (f) { return function (ta) { return F.map(f(ta), function_1.identity); }; }; };
/**
 * @since 2.6.3
 */
exports.sequence = function (F) { return function (ta) {
    return F.map(ta, function_1.identity);
}; };
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = function (that) { return function (fa) { return alt_(fa, that); }; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Identity';
/**
 * @category instances
 * @since 2.0.0
 */
exports.getShow = function_1.identity;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getEq = function_1.identity;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Comonad = {
    URI: exports.URI,
    map: map_,
    extend: extend_,
    extract: exports.extract
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ChainRec = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    chain: chain_,
    chainRec: chainRec_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.identity = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    alt: alt_,
    extract: exports.extract,
    extend: extend_,
    chainRec: chainRec_
};
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) {
    return exports.map(function_1.bindTo_(name));
};
/**
 * @since 2.8.0
 */
exports.bind = function (name, f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apS = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.ap(fb));
};


/***/ }),

/***/ 4000:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 9753:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * A join-semilattice (or upper semilattice) is a semilattice whose operation is called `join`, and which can be thought
 * of as a least upper bound.
 *
 * A `JoinSemilattice` must satisfy the following laws:
 *
 * - Associativity: `a ∨ (b ∨ c) <-> (a ∨ b) ∨ c`
 * - Commutativity: `a ∨ b <-> b ∨ a`
 * - Idempotency:   `a ∨ a <-> a`
 *
 * @since 2.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 892:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 179:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 2748:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.map_ = exports.Filterable = exports.Compactable = exports.Functor = exports.getWitherable = exports.getFilterableWithIndex = exports.URI = exports.separate = exports.partitionMap = exports.partition = exports.mapWithIndex = exports.map = exports.filterMap = exports.filter = exports.compact = exports.fromFoldable = exports.singleton = exports.getMonoid = exports.getEq = exports.empty = exports.isSubmap = exports.lookup = exports.lookupWithKey = exports.pop = exports.modifyAt = exports.updateAt = exports.deleteAt = exports.insertAt = exports.toUnfoldable = exports.toArray = exports.collect = exports.values = exports.keys = exports.elem = exports.member = exports.isEmpty = exports.size = exports.getShow = void 0;
var RM = __importStar(__webpack_require__(1961));
/* tslint:disable:readonly-array */
/**
 * @category instances
 * @since 2.0.0
 */
exports.getShow = RM.getShow;
/**
 * Calculate the number of key/value pairs in a map
 *
 * @since 2.0.0
 */
exports.size = RM.size;
/**
 * Test whether or not a map is empty
 *
 * @since 2.0.0
 */
exports.isEmpty = RM.isEmpty;
// TODO: remove non-curried overloading in v3
/**
 * Test whether or not a key exists in a map
 *
 * @since 2.0.0
 */
exports.member = RM.member;
// TODO: remove non-curried overloading in v3
/**
 * Test whether or not a value is a member of a map
 *
 * @since 2.0.0
 */
exports.elem = RM.elem;
/**
 * Get a sorted array of the keys contained in a map
 *
 * @since 2.0.0
 */
exports.keys = RM.keys;
/**
 * Get a sorted array of the values contained in a map
 *
 * @since 2.0.0
 */
exports.values = RM.values;
/**
 * @since 2.0.0
 */
exports.collect = RM.collect;
/**
 * Get a sorted of the key/value pairs contained in a map
 *
 * @since 2.0.0
 */
exports.toArray = RM.toReadonlyArray;
function toUnfoldable(O, U) {
    return RM.toUnfoldable(O, U);
}
exports.toUnfoldable = toUnfoldable;
/**
 * Insert or replace a key/value pair in a map
 *
 * @category combinators
 * @since 2.0.0
 */
exports.insertAt = RM.insertAt;
/**
 * Delete a key and value from a map
 *
 * @category combinators
 * @since 2.0.0
 */
exports.deleteAt = RM.deleteAt;
/**
 * @since 2.0.0
 */
exports.updateAt = RM.updateAt;
/**
 * @since 2.0.0
 */
exports.modifyAt = RM.modifyAt;
/**
 * Delete a key and value from a map, returning the value as well as the subsequent map
 *
 * @since 2.0.0
 */
exports.pop = RM.pop;
// TODO: remove non-curried overloading in v3
/**
 * Lookup the value for a key in a `Map`.
 * If the result is a `Some`, the existing key is also returned.
 *
 * @since 2.0.0
 */
exports.lookupWithKey = RM.lookupWithKey;
// TODO: remove non-curried overloading in v3
/**
 * Lookup the value for a key in a `Map`.
 *
 * @since 2.0.0
 */
exports.lookup = RM.lookup;
// TODO: remove non-curried overloading in v3
/**
 * Test whether or not one `Map` contains all of the keys and values contained in another `Map`
 *
 * @since 2.0.0
 */
exports.isSubmap = RM.isSubmap;
/**
 * @since 2.0.0
 */
exports.empty = new Map();
/**
 * @category instances
 * @since 2.0.0
 */
exports.getEq = RM.getEq;
/**
 * Gets `Monoid` instance for Maps given `Semigroup` instance for their values
 *
 * @category instances
 * @since 2.0.0
 */
exports.getMonoid = RM.getMonoid;
/**
 * Create a map with one key/value pair
 *
 * @since 2.0.0
 */
exports.singleton = RM.singleton;
function fromFoldable(E, M, F) {
    return RM.fromFoldable(E, M, F);
}
exports.fromFoldable = fromFoldable;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map__ = RM.Functor.map;
var filter_ = RM.Filterable.filter;
var filterMap_ = RM.Filterable.filterMap;
var partition_ = RM.Filterable.partition;
var partitionMap_ = RM.Filterable.partitionMap;
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Compactable
 * @since 2.0.0
 */
exports.compact = RM.compact;
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.filter = RM.filter;
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.filterMap = RM.filterMap;
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = RM.map;
/**
 * @category FunctorWithIndex
 * @since 2.7.1
 */
exports.mapWithIndex = RM.mapWithIndex;
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.partition = RM.partition;
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.partitionMap = RM.partitionMap;
/**
 * @category Compactable
 * @since 2.0.0
 */
exports.separate = RM.separate;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Map';
/**
 * @category instances
 * @since 2.0.0
 */
exports.getFilterableWithIndex = RM.getFilterableWithIndex;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getWitherable = RM.getWitherable;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map__
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Compactable = {
    URI: exports.URI,
    compact: exports.compact,
    separate: exports.separate
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Filterable = {
    URI: exports.URI,
    map: map__,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.map_ = exports.Filterable;


/***/ }),

/***/ 5717:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * A meet-semilattice (or lower semilattice) is a semilattice whose operation is called `meet`, and which can be thought
 * of as a greatest lower bound.
 *
 * A `MeetSemilattice` must satisfy the following laws:
 *
 * - Associativity: `a ∧ (b ∧ c) <-> (a ∧ b) ∧ c`
 * - Commutativity: `a ∧ b <-> b ∧ a`
 * - Idempotency:   `a ∧ a <-> a`
 *
 * @since 2.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 9076:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 5558:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 1534:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 5631:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 2629:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getJoinMonoid = exports.getMeetMonoid = exports.getStructMonoid = exports.getEndomorphismMonoid = exports.getFunctionMonoid = exports.getDualMonoid = exports.getTupleMonoid = exports.fold = exports.monoidVoid = exports.monoidString = exports.monoidProduct = exports.monoidSum = exports.monoidAny = exports.monoidAll = void 0;
var function_1 = __webpack_require__(6985);
var Semigroup_1 = __webpack_require__(6339);
/**
 * Boolean monoid under conjunction
 *
 * @category instances
 * @since 2.0.0
 */
exports.monoidAll = {
    concat: Semigroup_1.semigroupAll.concat,
    empty: true
};
/**
 * Boolean monoid under disjunction
 *
 * @category instances
 * @since 2.0.0
 */
exports.monoidAny = {
    concat: Semigroup_1.semigroupAny.concat,
    empty: false
};
/**
 * Number monoid under addition
 *
 * @category instances
 * @since 2.0.0
 */
exports.monoidSum = {
    concat: Semigroup_1.semigroupSum.concat,
    empty: 0
};
/**
 * Number monoid under multiplication
 *
 * @category instances
 * @since 2.0.0
 */
exports.monoidProduct = {
    concat: Semigroup_1.semigroupProduct.concat,
    empty: 1
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.monoidString = {
    concat: Semigroup_1.semigroupString.concat,
    empty: ''
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.monoidVoid = {
    concat: Semigroup_1.semigroupVoid.concat,
    empty: undefined
};
/**
 * @since 2.0.0
 */
function fold(M) {
    var foldM = Semigroup_1.fold(M);
    return function (as) { return foldM(M.empty, as); };
}
exports.fold = fold;
/**
 * Given a tuple of monoids returns a monoid for the tuple
 *
 * @example
 * import { getTupleMonoid, monoidString, monoidSum, monoidAll } from 'fp-ts/Monoid'
 *
 * const M1 = getTupleMonoid(monoidString, monoidSum)
 * assert.deepStrictEqual(M1.concat(['a', 1], ['b', 2]), ['ab', 3])
 *
 * const M2 = getTupleMonoid(monoidString, monoidSum, monoidAll)
 * assert.deepStrictEqual(M2.concat(['a', 1, true], ['b', 2, false]), ['ab', 3, false])
 *
 * @category instances
 * @since 2.0.0
 */
function getTupleMonoid() {
    var monoids = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        monoids[_i] = arguments[_i];
    }
    return {
        concat: Semigroup_1.getTupleSemigroup.apply(void 0, monoids).concat,
        empty: monoids.map(function (m) { return m.empty; })
    };
}
exports.getTupleMonoid = getTupleMonoid;
/**
 * The dual of a `Monoid`, obtained by swapping the arguments of `concat`.
 *
 * @example
 * import { getDualMonoid, monoidString } from 'fp-ts/Monoid'
 *
 * assert.deepStrictEqual(getDualMonoid(monoidString).concat('a', 'b'), 'ba')
 *
 * @category combinators
 * @since 2.0.0
 */
function getDualMonoid(M) {
    return {
        concat: Semigroup_1.getDualSemigroup(M).concat,
        empty: M.empty
    };
}
exports.getDualMonoid = getDualMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
function getFunctionMonoid(M) {
    return function () { return ({
        concat: Semigroup_1.getFunctionSemigroup(M)().concat,
        empty: function () { return M.empty; }
    }); };
}
exports.getFunctionMonoid = getFunctionMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
function getEndomorphismMonoid() {
    return {
        concat: function (x, y) { return function (a) { return x(y(a)); }; },
        empty: function_1.identity
    };
}
exports.getEndomorphismMonoid = getEndomorphismMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
function getStructMonoid(monoids) {
    var empty = {};
    for (var _i = 0, _a = Object.keys(monoids); _i < _a.length; _i++) {
        var key = _a[_i];
        empty[key] = monoids[key].empty;
    }
    return {
        concat: Semigroup_1.getStructSemigroup(monoids).concat,
        empty: empty
    };
}
exports.getStructMonoid = getStructMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
function getMeetMonoid(B) {
    return {
        concat: Semigroup_1.getMeetSemigroup(B).concat,
        empty: B.top
    };
}
exports.getMeetMonoid = getMeetMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
function getJoinMonoid(B) {
    return {
        concat: Semigroup_1.getJoinSemigroup(B).concat,
        empty: B.bottom
    };
}
exports.getJoinMonoid = getJoinMonoid;


/***/ }),

/***/ 240:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.bind = exports.bindTo = exports.nonEmptyArray = exports.Comonad = exports.Alt = exports.TraversableWithIndex = exports.Traversable = exports.FoldableWithIndex = exports.Foldable = exports.Monad = exports.Applicative = exports.FunctorWithIndex = exports.Functor = exports.URI = exports.extract = exports.traverseWithIndex = exports.sequence = exports.traverse = exports.reduceRightWithIndex = exports.reduceRight = exports.reduceWithIndex = exports.reduce = exports.mapWithIndex = exports.map = exports.flatten = exports.extend = exports.duplicate = exports.chainFirst = exports.chain = exports.apSecond = exports.apFirst = exports.ap = exports.alt = exports.foldMap = exports.foldMapWithIndex = exports.unzip = exports.zip = exports.zipWith = exports.fold = exports.concat = exports.of = exports.filterWithIndex = exports.filter = exports.copy = exports.modifyAt = exports.updateAt = exports.insertAt = exports.sort = exports.init = exports.last = exports.groupBy = exports.groupSort = exports.group = exports.getEq = exports.getSemigroup = exports.max = exports.min = exports.reverse = exports.tail = exports.head = exports.getShow = exports.fromArray = exports.snoc = exports.cons = void 0;
var RNEA = __importStar(__webpack_require__(8630));
/* tslint:enable:readonly-keyword */
/**
 * Append an element to the front of an array, creating a new non empty array
 *
 * @example
 * import { cons } from 'fp-ts/NonEmptyArray'
 *
 * assert.deepStrictEqual(cons(1, [2, 3, 4]), [1, 2, 3, 4])
 *
 * @category constructors
 * @since 2.0.0
 */
exports.cons = RNEA.cons;
/**
 * Append an element to the end of an array, creating a new non empty array
 *
 * @example
 * import { snoc } from 'fp-ts/NonEmptyArray'
 *
 * assert.deepStrictEqual(snoc([1, 2, 3], 4), [1, 2, 3, 4])
 *
 * @category constructors
 * @since 2.0.0
 */
exports.snoc = RNEA.snoc;
/**
 * Builds a `NonEmptyArray` from an `Array` returning `none` if `as` is an empty array
 *
 * @category constructors
 * @since 2.0.0
 */
exports.fromArray = RNEA.fromArray;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getShow = RNEA.getShow;
/**
 * @since 2.0.0
 */
exports.head = RNEA.head;
/**
 * @since 2.0.0
 */
exports.tail = RNEA.tail;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.reverse = RNEA.reverse;
/**
 * @since 2.0.0
 */
exports.min = RNEA.min;
/**
 * @since 2.0.0
 */
exports.max = RNEA.max;
/**
 * Builds a `Semigroup` instance for `NonEmptyArray`
 *
 * @category instances
 * @since 2.0.0
 */
exports.getSemigroup = RNEA.getSemigroup;
/**
 * @example
 * import { getEq, cons } from 'fp-ts/NonEmptyArray'
 * import { eqNumber } from 'fp-ts/Eq'
 *
 * const E = getEq(eqNumber)
 * assert.strictEqual(E.equals(cons(1, [2]), [1, 2]), true)
 * assert.strictEqual(E.equals(cons(1, [2]), [1, 3]), false)
 *
 * @category instances
 * @since 2.0.0
 */
exports.getEq = RNEA.getEq;
function group(E) {
    return RNEA.group(E);
}
exports.group = group;
/**
 * Sort and then group the elements of an array into non empty arrays.
 *
 * @example
 * import { cons, groupSort } from 'fp-ts/NonEmptyArray'
 * import { ordNumber } from 'fp-ts/Ord'
 *
 * assert.deepStrictEqual(groupSort(ordNumber)([1, 2, 1, 1]), [cons(1, [1, 1]), cons(2, [])])
 *
 * @category combinators
 * @since 2.0.0
 */
exports.groupSort = RNEA.groupSort;
/**
 * Splits an array into sub-non-empty-arrays stored in an object, based on the result of calling a `string`-returning
 * function on each element, and grouping the results according to values returned
 *
 * @example
 * import { cons, groupBy } from 'fp-ts/NonEmptyArray'
 *
 * assert.deepStrictEqual(groupBy((s: string) => String(s.length))(['foo', 'bar', 'foobar']), {
 *   '3': cons('foo', ['bar']),
 *   '6': cons('foobar', [])
 * })
 *
 * @category constructors
 * @since 2.0.0
 */
exports.groupBy = RNEA.groupBy;
/**
 * @since 2.0.0
 */
exports.last = RNEA.last;
/**
 * Get all but the last element of a non empty array, creating a new array.
 *
 * @example
 * import { init } from 'fp-ts/NonEmptyArray'
 *
 * assert.deepStrictEqual(init([1, 2, 3]), [1, 2])
 * assert.deepStrictEqual(init([1]), [])
 *
 * @since 2.2.0
 */
exports.init = RNEA.init;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.sort = RNEA.sort;
/**
 * @since 2.0.0
 */
exports.insertAt = RNEA.insertAt;
/**
 * @since 2.0.0
 */
exports.updateAt = RNEA.updateAt;
/**
 * @since 2.0.0
 */
exports.modifyAt = RNEA.modifyAt;
/**
 * @category combinators
 * @since 2.0.0
 */
function copy(nea) {
    var l = nea.length;
    var as = Array(l);
    for (var i = 0; i < l; i++) {
        as[i] = nea[i];
    }
    return as;
}
exports.copy = copy;
function filter(predicate) {
    return RNEA.filter(predicate);
}
exports.filter = filter;
/**
 * @since 2.0.0
 */
exports.filterWithIndex = RNEA.filterWithIndex;
/**
 * @category Applicative
 * @since 2.0.0
 */
exports.of = RNEA.of;
function concat(fx, fy) {
    return RNEA.concat(fx, fy);
}
exports.concat = concat;
/**
 * @since 2.5.0
 */
exports.fold = RNEA.fold;
/**
 * @category combinators
 * @since 2.5.1
 */
exports.zipWith = RNEA.zipWith;
/**
 * @category combinators
 * @since 2.5.1
 */
exports.zip = RNEA.zip;
/**
 * @since 2.5.1
 */
exports.unzip = RNEA.unzip;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = RNEA.Functor.map;
var mapWithIndex_ = RNEA.FunctorWithIndex.mapWithIndex;
var ap_ = RNEA.Applicative.ap;
var chain_ = RNEA.Monad.chain;
var extend_ = RNEA.Comonad.extend;
var reduce_ = RNEA.Foldable.reduce;
var foldMap_ = RNEA.Foldable.foldMap;
var reduceRight_ = RNEA.Foldable.reduceRight;
var traverse_ = RNEA.Traversable.traverse;
var alt_ = RNEA.Alt.alt;
var reduceWithIndex_ = RNEA.FoldableWithIndex
    .reduceWithIndex;
var foldMapWithIndex_ = RNEA.FoldableWithIndex
    .foldMapWithIndex;
var reduceRightWithIndex_ = RNEA.FoldableWithIndex
    .reduceRightWithIndex;
var traverseWithIndex_ = RNEA.TraversableWithIndex
    .traverseWithIndex;
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category FoldableWithIndex
 * @since 2.0.0
 */
exports.foldMapWithIndex = RNEA.foldMapWithIndex;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.foldMap = RNEA.foldMap;
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.6.2
 */
exports.alt = RNEA.alt;
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = RNEA.ap;
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = RNEA.apFirst;
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = RNEA.apSecond;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = RNEA.chain;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = RNEA.chainFirst;
/**
 * @category Extend
 * @since 2.0.0
 */
exports.duplicate = RNEA.duplicate;
/**
 * @category Extend
 * @since 2.0.0
 */
exports.extend = RNEA.extend;
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = RNEA.flatten;
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = RNEA.map;
/**
 * @category FunctorWithIndex
 * @since 2.0.0
 */
exports.mapWithIndex = RNEA.mapWithIndex;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduce = RNEA.reduce;
/**
 * @category FoldableWithIndex
 * @since 2.0.0
 */
exports.reduceWithIndex = RNEA.reduceWithIndex;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduceRight = RNEA.reduceRight;
/**
 * @category FoldableWithIndex
 * @since 2.0.0
 */
exports.reduceRightWithIndex = RNEA.reduceRightWithIndex;
/**
 * @since 2.6.3
 */
exports.traverse = RNEA.traverse;
/**
 * @since 2.6.3
 */
exports.sequence = RNEA.sequence;
/**
 * @since 2.6.3
 */
exports.traverseWithIndex = RNEA.traverseWithIndex;
/**
 * @since 2.7.0
 */
exports.extract = exports.head;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'NonEmptyArray';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FunctorWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FoldableWithIndex = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.TraversableWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    traverseWithIndex: traverseWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Comonad = {
    URI: exports.URI,
    map: map_,
    extend: extend_,
    extract: exports.extract
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.nonEmptyArray = {
    URI: exports.URI,
    of: exports.of,
    map: map_,
    mapWithIndex: mapWithIndex_,
    ap: ap_,
    chain: chain_,
    extend: extend_,
    extract: exports.extract,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    traverseWithIndex: traverseWithIndex_,
    alt: alt_
};
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = RNEA.bindTo;
/**
 * @since 2.8.0
 */
exports.bind = RNEA.bind;
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apS = RNEA.apS;


/***/ }),

/***/ 2569:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.bind = exports.bindTo = exports.getRefinement = exports.exists = exports.elem = exports.option = exports.MonadThrow = exports.Witherable = exports.Traversable = exports.Filterable = exports.Compactable = exports.Extend = exports.Alternative = exports.Alt = exports.Foldable = exports.Monad = exports.Applicative = exports.Functor = exports.getMonoid = exports.getLastMonoid = exports.getFirstMonoid = exports.getApplyMonoid = exports.getApplySemigroup = exports.getOrd = exports.getEq = exports.getShow = exports.URI = exports.wilt = exports.wither = exports.sequence = exports.traverse = exports.partitionMap = exports.partition = exports.filterMap = exports.filter = exports.separate = exports.compact = exports.reduceRight = exports.foldMap = exports.reduce = exports.duplicate = exports.extend = exports.throwError = exports.zero = exports.alt = exports.flatten = exports.chainFirst = exports.chain = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.map = exports.mapNullable = exports.getOrElse = exports.getOrElseW = exports.toUndefined = exports.toNullable = exports.fold = exports.fromEither = exports.getRight = exports.getLeft = exports.tryCatch = exports.fromPredicate = exports.fromNullable = exports.some = exports.none = exports.isNone = exports.isSome = void 0;
var function_1 = __webpack_require__(6985);
// -------------------------------------------------------------------------------------
// guards
// -------------------------------------------------------------------------------------
/**
 * Returns `true` if the option is an instance of `Some`, `false` otherwise
 *
 * @example
 * import { some, none, isSome } from 'fp-ts/Option'
 *
 * assert.strictEqual(isSome(some(1)), true)
 * assert.strictEqual(isSome(none), false)
 *
 * @category guards
 * @since 2.0.0
 */
exports.isSome = function (fa) { return fa._tag === 'Some'; };
/**
 * Returns `true` if the option is `None`, `false` otherwise
 *
 * @example
 * import { some, none, isNone } from 'fp-ts/Option'
 *
 * assert.strictEqual(isNone(some(1)), false)
 * assert.strictEqual(isNone(none), true)
 *
 * @category guards
 * @since 2.0.0
 */
exports.isNone = function (fa) { return fa._tag === 'None'; };
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
exports.none = { _tag: 'None' };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.some = function (a) { return ({ _tag: 'Some', value: a }); };
/**
 * Constructs a new `Option` from a nullable type. If the value is `null` or `undefined`, returns `None`, otherwise
 * returns the value wrapped in a `Some`
 *
 * @example
 * import { none, some, fromNullable } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(fromNullable(undefined), none)
 * assert.deepStrictEqual(fromNullable(null), none)
 * assert.deepStrictEqual(fromNullable(1), some(1))
 *
 * @category constructors
 * @since 2.0.0
 */
function fromNullable(a) {
    return a == null ? exports.none : exports.some(a);
}
exports.fromNullable = fromNullable;
function fromPredicate(predicate) {
    return function (a) { return (predicate(a) ? exports.some(a) : exports.none); };
}
exports.fromPredicate = fromPredicate;
/**
 * Transforms an exception into an `Option`. If `f` throws, returns `None`, otherwise returns the output wrapped in
 * `Some`
 *
 * @example
 * import { none, some, tryCatch } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(
 *   tryCatch(() => {
 *     throw new Error()
 *   }),
 *   none
 * )
 * assert.deepStrictEqual(tryCatch(() => 1), some(1))
 *
 * @category constructors
 * @since 2.0.0
 */
function tryCatch(f) {
    try {
        return exports.some(f());
    }
    catch (e) {
        return exports.none;
    }
}
exports.tryCatch = tryCatch;
/**
 * Returns an `E` value if possible
 *
 * @category constructors
 * @since 2.0.0
 */
function getLeft(ma) {
    return ma._tag === 'Right' ? exports.none : exports.some(ma.left);
}
exports.getLeft = getLeft;
/**
 * Returns an `A` value if possible
 *
 * @category constructors
 * @since 2.0.0
 */
function getRight(ma) {
    return ma._tag === 'Left' ? exports.none : exports.some(ma.right);
}
exports.getRight = getRight;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromEither = function (ma) { return (ma._tag === 'Left' ? exports.none : exports.some(ma.right)); };
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * Takes a default value, a function, and an `Option` value, if the `Option` value is `None` the default value is
 * returned, otherwise the function is applied to the value inside the `Some` and the result is returned.
 *
 * @example
 * import { some, none, fold } from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     fold(() => 'a none', a => `a some containing ${a}`)
 *   ),
 *   'a some containing 1'
 * )
 *
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     fold(() => 'a none', a => `a some containing ${a}`)
 *   ),
 *   'a none'
 * )
 *
 * @category destructors
 * @since 2.0.0
 */
function fold(onNone, onSome) {
    return function (ma) { return (exports.isNone(ma) ? onNone() : onSome(ma.value)); };
}
exports.fold = fold;
/**
 * Extracts the value out of the structure, if it exists. Otherwise returns `null`.
 *
 * @example
 * import { some, none, toNullable } from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     toNullable
 *   ),
 *   1
 * )
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     toNullable
 *   ),
 *   null
 * )
 *
 * @category destructors
 * @since 2.0.0
 */
function toNullable(ma) {
    return exports.isNone(ma) ? null : ma.value;
}
exports.toNullable = toNullable;
/**
 * Extracts the value out of the structure, if it exists. Otherwise returns `undefined`.
 *
 * @example
 * import { some, none, toUndefined } from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     toUndefined
 *   ),
 *   1
 * )
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     toUndefined
 *   ),
 *   undefined
 * )
 *
 * @category destructors
 * @since 2.0.0
 */
function toUndefined(ma) {
    return exports.isNone(ma) ? undefined : ma.value;
}
exports.toUndefined = toUndefined;
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
exports.getOrElseW = function (onNone) { return function (ma) { return (exports.isNone(ma) ? onNone() : ma.value); }; };
/**
 * Extracts the value out of the structure, if it exists. Otherwise returns the given default value
 *
 * @example
 * import { some, none, getOrElse } from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     getOrElse(() => 0)
 *   ),
 *   1
 * )
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     getOrElse(() => 0)
 *   ),
 *   0
 * )
 *
 * @category destructors
 * @since 2.0.0
 */
exports.getOrElse = exports.getOrElseW;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * This is `chain` + `fromNullable`, useful when working with optional values
 *
 * @example
 * import { some, none, fromNullable, mapNullable } from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * interface Employee {
 *   company?: {
 *     address?: {
 *       street?: {
 *         name?: string
 *       }
 *     }
 *   }
 * }
 *
 * const employee1: Employee = { company: { address: { street: { name: 'high street' } } } }
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     fromNullable(employee1.company),
 *     mapNullable(company => company.address),
 *     mapNullable(address => address.street),
 *     mapNullable(street => street.name)
 *   ),
 *   some('high street')
 * )
 *
 * const employee2: Employee = { company: { address: { street: {} } } }
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     fromNullable(employee2.company),
 *     mapNullable(company => company.address),
 *     mapNullable(address => address.street),
 *     mapNullable(street => street.name)
 *   ),
 *   none
 * )
 *
 * @category combinators
 * @since 2.0.0
 */
function mapNullable(f) {
    return function (ma) { return (exports.isNone(ma) ? exports.none : fromNullable(f(ma.value))); };
}
exports.mapNullable = mapNullable;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return (exports.isNone(fa) ? exports.none : exports.some(f(fa.value))); };
var ap_ = function (fab, fa) { return (exports.isNone(fab) ? exports.none : exports.isNone(fa) ? exports.none : exports.some(fab.value(fa.value))); };
var chain_ = function (ma, f) { return (exports.isNone(ma) ? exports.none : f(ma.value)); };
var reduce_ = function (fa, b, f) { return (exports.isNone(fa) ? b : f(b, fa.value)); };
var foldMap_ = function (M) { return function (fa, f) { return (exports.isNone(fa) ? M.empty : f(fa.value)); }; };
var reduceRight_ = function (fa, b, f) { return (exports.isNone(fa) ? b : f(fa.value, b)); };
var traverse_ = function (F) { return function (ta, f) {
    return exports.isNone(ta) ? F.of(exports.none) : F.map(f(ta.value), exports.some);
}; };
var alt_ = function (fa, that) { return (exports.isNone(fa) ? that() : fa); };
var filter_ = function (fa, predicate) {
    return exports.isNone(fa) ? exports.none : predicate(fa.value) ? fa : exports.none;
};
var filterMap_ = function (ma, f) { return (exports.isNone(ma) ? exports.none : f(ma.value)); };
var extend_ = function (wa, f) { return (exports.isNone(wa) ? exports.none : exports.some(f(wa))); };
var partition_ = function (fa, predicate) {
    return {
        left: filter_(fa, function (a) { return !predicate(a); }),
        right: filter_(fa, predicate)
    };
};
var partitionMap_ = function (fa, f) { return exports.separate(map_(fa, f)); };
var wither_ = function (F) { return function (fa, f) {
    return exports.isNone(fa) ? F.of(exports.none) : f(fa.value);
}; };
var wilt_ = function (F) { return function (fa, f) {
    var o = map_(fa, function (a) {
        return F.map(f(a), function (e) { return ({
            left: getLeft(e),
            right: getRight(e)
        }); });
    });
    return exports.isNone(o)
        ? F.of({
            left: exports.none,
            right: exports.none
        })
        : o.value;
}; };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return map_(fa, f); }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) { return ap_(fab, fa); }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * @category Applicative
 * @since 2.7.0
 */
exports.of = exports.some;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = function (f) { return function (ma) { return chain_(ma, f); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = function (f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * In case of `Option` returns the left-most non-`None` value.
 *
 * @example
 * import * as O from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(
 *   pipe(
 *     O.some('a'),
 *     O.alt(() => O.some('b'))
 *   ),
 *   O.some('a')
 * )
 * assert.deepStrictEqual(
 *   pipe(
 *     O.none,
 *     O.alt(() => O.some('b'))
 *   ),
 *   O.some('b')
 * )
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = function (that) { return function (fa) { return alt_(fa, that); }; };
/**
 * @category Alternative
 * @since 2.7.0
 */
exports.zero = function () { return exports.none; };
/**
 * @category MonadThrow
 * @since 2.7.0
 */
exports.throwError = function () { return exports.none; };
/**
 * @category Extend
 * @since 2.0.0
 */
exports.extend = function (f) { return function (ma) { return extend_(ma, f); }; };
/**
 * @category Extend
 * @since 2.0.0
 */
exports.duplicate = 
/*#__PURE__*/
exports.extend(function_1.identity);
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduce = function (b, f) { return function (fa) { return reduce_(fa, b, f); }; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.foldMap = function (M) {
    var foldMapM = foldMap_(M);
    return function (f) { return function (fa) { return foldMapM(fa, f); }; };
};
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduceRight = function (b, f) { return function (fa) {
    return reduceRight_(fa, b, f);
}; };
/**
 * @category Compactable
 * @since 2.0.0
 */
exports.compact = exports.flatten;
var defaultSeparate = { left: exports.none, right: exports.none };
/**
 * @category Compactable
 * @since 2.0.0
 */
exports.separate = function (ma) {
    var o = map_(ma, function (e) { return ({
        left: getLeft(e),
        right: getRight(e)
    }); });
    return exports.isNone(o) ? defaultSeparate : o.value;
};
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.filter = function (predicate) { return function (fa) { return filter_(fa, predicate); }; };
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.filterMap = function (f) { return function (fa) {
    return filterMap_(fa, f);
}; };
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.partition = function (predicate) { return function (fa) { return partition_(fa, predicate); }; };
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.partitionMap = function (f) { return function (fa) { return partitionMap_(fa, f); }; };
/**
 * @category Traversable
 * @since 2.6.3
 */
exports.traverse = function (F) {
    var traverseF = traverse_(F);
    return function (f) { return function (ta) { return traverseF(ta, f); }; };
};
/**
 * @category Traversable
 * @since 2.6.3
 */
exports.sequence = function (F) { return function (ta) {
    return exports.isNone(ta) ? F.of(exports.none) : F.map(ta.value, exports.some);
}; };
/**
 * @category Witherable
 * @since 2.6.5
 */
exports.wither = function (F) {
    var witherF = wither_(F);
    return function (f) { return function (ta) { return witherF(ta, f); }; };
};
/**
 * @category Witherable
 * @since 2.6.5
 */
exports.wilt = function (F) {
    var wiltF = wilt_(F);
    return function (f) { return function (ta) { return wiltF(ta, f); }; };
};
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Option';
/**
 * @category instances
 * @since 2.0.0
 */
function getShow(S) {
    return {
        show: function (ma) { return (exports.isNone(ma) ? 'none' : "some(" + S.show(ma.value) + ")"); }
    };
}
exports.getShow = getShow;
/**
 * @example
 * import { none, some, getEq } from 'fp-ts/Option'
 * import { eqNumber } from 'fp-ts/Eq'
 *
 * const E = getEq(eqNumber)
 * assert.strictEqual(E.equals(none, none), true)
 * assert.strictEqual(E.equals(none, some(1)), false)
 * assert.strictEqual(E.equals(some(1), none), false)
 * assert.strictEqual(E.equals(some(1), some(2)), false)
 * assert.strictEqual(E.equals(some(1), some(1)), true)
 *
 * @category instances
 * @since 2.0.0
 */
function getEq(E) {
    return {
        equals: function (x, y) { return x === y || (exports.isNone(x) ? exports.isNone(y) : exports.isNone(y) ? false : E.equals(x.value, y.value)); }
    };
}
exports.getEq = getEq;
/**
 * The `Ord` instance allows `Option` values to be compared with
 * `compare`, whenever there is an `Ord` instance for
 * the type the `Option` contains.
 *
 * `None` is considered to be less than any `Some` value.
 *
 *
 * @example
 * import { none, some, getOrd } from 'fp-ts/Option'
 * import { ordNumber } from 'fp-ts/Ord'
 *
 * const O = getOrd(ordNumber)
 * assert.strictEqual(O.compare(none, none), 0)
 * assert.strictEqual(O.compare(none, some(1)), -1)
 * assert.strictEqual(O.compare(some(1), none), 1)
 * assert.strictEqual(O.compare(some(1), some(2)), -1)
 * assert.strictEqual(O.compare(some(1), some(1)), 0)
 *
 * @category instances
 * @since 2.0.0
 */
function getOrd(O) {
    return {
        equals: getEq(O).equals,
        compare: function (x, y) { return (x === y ? 0 : exports.isSome(x) ? (exports.isSome(y) ? O.compare(x.value, y.value) : 1) : -1); }
    };
}
exports.getOrd = getOrd;
/**
 * `Apply` semigroup
 *
 * | x       | y       | concat(x, y)       |
 * | ------- | ------- | ------------------ |
 * | none    | none    | none               |
 * | some(a) | none    | none               |
 * | none    | some(a) | none               |
 * | some(a) | some(b) | some(concat(a, b)) |
 *
 * @example
 * import { getApplySemigroup, some, none } from 'fp-ts/Option'
 * import { semigroupSum } from 'fp-ts/Semigroup'
 *
 * const S = getApplySemigroup(semigroupSum)
 * assert.deepStrictEqual(S.concat(none, none), none)
 * assert.deepStrictEqual(S.concat(some(1), none), none)
 * assert.deepStrictEqual(S.concat(none, some(1)), none)
 * assert.deepStrictEqual(S.concat(some(1), some(2)), some(3))
 *
 * @category instances
 * @since 2.0.0
 */
function getApplySemigroup(S) {
    return {
        concat: function (x, y) { return (exports.isSome(x) && exports.isSome(y) ? exports.some(S.concat(x.value, y.value)) : exports.none); }
    };
}
exports.getApplySemigroup = getApplySemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getApplyMonoid(M) {
    return {
        concat: getApplySemigroup(M).concat,
        empty: exports.some(M.empty)
    };
}
exports.getApplyMonoid = getApplyMonoid;
/**
 * Monoid returning the left-most non-`None` value
 *
 * | x       | y       | concat(x, y) |
 * | ------- | ------- | ------------ |
 * | none    | none    | none         |
 * | some(a) | none    | some(a)      |
 * | none    | some(a) | some(a)      |
 * | some(a) | some(b) | some(a)      |
 *
 * @example
 * import { getFirstMonoid, some, none } from 'fp-ts/Option'
 *
 * const M = getFirstMonoid<number>()
 * assert.deepStrictEqual(M.concat(none, none), none)
 * assert.deepStrictEqual(M.concat(some(1), none), some(1))
 * assert.deepStrictEqual(M.concat(none, some(1)), some(1))
 * assert.deepStrictEqual(M.concat(some(1), some(2)), some(1))
 *
 * @category instances
 * @since 2.0.0
 */
function getFirstMonoid() {
    return {
        concat: function (x, y) { return (exports.isNone(x) ? y : x); },
        empty: exports.none
    };
}
exports.getFirstMonoid = getFirstMonoid;
/**
 * Monoid returning the right-most non-`None` value
 *
 * | x       | y       | concat(x, y) |
 * | ------- | ------- | ------------ |
 * | none    | none    | none         |
 * | some(a) | none    | some(a)      |
 * | none    | some(a) | some(a)      |
 * | some(a) | some(b) | some(b)      |
 *
 * @example
 * import { getLastMonoid, some, none } from 'fp-ts/Option'
 *
 * const M = getLastMonoid<number>()
 * assert.deepStrictEqual(M.concat(none, none), none)
 * assert.deepStrictEqual(M.concat(some(1), none), some(1))
 * assert.deepStrictEqual(M.concat(none, some(1)), some(1))
 * assert.deepStrictEqual(M.concat(some(1), some(2)), some(2))
 *
 * @category instances
 * @since 2.0.0
 */
function getLastMonoid() {
    return {
        concat: function (x, y) { return (exports.isNone(y) ? x : y); },
        empty: exports.none
    };
}
exports.getLastMonoid = getLastMonoid;
/**
 * Monoid returning the left-most non-`None` value. If both operands are `Some`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * | x       | y       | concat(x, y)       |
 * | ------- | ------- | ------------------ |
 * | none    | none    | none               |
 * | some(a) | none    | some(a)            |
 * | none    | some(a) | some(a)            |
 * | some(a) | some(b) | some(concat(a, b)) |
 *
 * @example
 * import { getMonoid, some, none } from 'fp-ts/Option'
 * import { semigroupSum } from 'fp-ts/Semigroup'
 *
 * const M = getMonoid(semigroupSum)
 * assert.deepStrictEqual(M.concat(none, none), none)
 * assert.deepStrictEqual(M.concat(some(1), none), some(1))
 * assert.deepStrictEqual(M.concat(none, some(1)), some(1))
 * assert.deepStrictEqual(M.concat(some(1), some(2)), some(3))
 *
 * @category instances
 * @since 2.0.0
 */
function getMonoid(S) {
    return {
        concat: function (x, y) { return (exports.isNone(x) ? y : exports.isNone(y) ? x : exports.some(S.concat(x.value, y.value))); },
        empty: exports.none
    };
}
exports.getMonoid = getMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alternative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    alt: alt_,
    zero: exports.zero
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Extend = {
    URI: exports.URI,
    map: map_,
    extend: extend_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Compactable = {
    URI: exports.URI,
    compact: exports.compact,
    separate: exports.separate
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Filterable = {
    URI: exports.URI,
    map: map_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Witherable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    wither: wither_,
    wilt: wilt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.MonadThrow = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_,
    throwError: exports.throwError
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.option = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    zero: exports.zero,
    alt: alt_,
    extend: extend_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    wither: wither_,
    wilt: wilt_,
    throwError: exports.throwError
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * Returns `true` if `ma` contains `a`
 *
 * @example
 * import { some, none, elem } from 'fp-ts/Option'
 * import { eqNumber } from 'fp-ts/Eq'
 *
 * assert.strictEqual(elem(eqNumber)(1, some(1)), true)
 * assert.strictEqual(elem(eqNumber)(2, some(1)), false)
 * assert.strictEqual(elem(eqNumber)(1, none), false)
 *
 * @since 2.0.0
 */
function elem(E) {
    return function (a, ma) { return (exports.isNone(ma) ? false : E.equals(a, ma.value)); };
}
exports.elem = elem;
/**
 * Returns `true` if the predicate is satisfied by the wrapped value
 *
 * @example
 * import { some, none, exists } from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     exists(n => n > 0)
 *   ),
 *   true
 * )
 * assert.strictEqual(
 *   pipe(
 *     some(1),
 *     exists(n => n > 1)
 *   ),
 *   false
 * )
 * assert.strictEqual(
 *   pipe(
 *     none,
 *     exists(n => n > 0)
 *   ),
 *   false
 * )
 *
 * @since 2.0.0
 */
function exists(predicate) {
    return function (ma) { return (exports.isNone(ma) ? false : predicate(ma.value)); };
}
exports.exists = exists;
/**
 * Returns a `Refinement` (i.e. a custom type guard) from a `Option` returning function.
 * This function ensures that a custom type guard definition is type-safe.
 *
 * ```ts
 * import { some, none, getRefinement } from 'fp-ts/Option'
 *
 * type A = { type: 'A' }
 * type B = { type: 'B' }
 * type C = A | B
 *
 * const isA = (c: C): c is A => c.type === 'B' // <= typo but typescript doesn't complain
 * const isA = getRefinement<C, A>(c => (c.type === 'B' ? some(c) : none)) // static error: Type '"B"' is not assignable to type '"A"'
 * ```
 *
 * @since 2.0.0
 */
function getRefinement(getOption) {
    return function (a) { return exports.isSome(getOption(a)); };
}
exports.getRefinement = getRefinement;
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) { return exports.map(function_1.bindTo_(name)); };
/**
 * @since 2.8.0
 */
exports.bind = function (name, f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apS = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.ap(fb));
};


/***/ }),

/***/ 7777:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOptionM = void 0;
/**
 * @since 2.0.0
 */
var Applicative_1 = __webpack_require__(4766);
var Option_1 = __webpack_require__(2569);
function getOptionM(M) {
    var A = Applicative_1.getApplicativeComposition(M, Option_1.Applicative);
    var fnone = M.of(Option_1.none);
    return {
        map: A.map,
        ap: A.ap,
        of: A.of,
        chain: function (ma, f) {
            return M.chain(ma, Option_1.fold(function () { return fnone; }, f));
        },
        alt: function (fa, that) {
            return M.chain(fa, Option_1.fold(that, function (a) { return M.of(Option_1.some(a)); }));
        },
        fold: function (ma, onNone, onSome) { return M.chain(ma, Option_1.fold(onNone, onSome)); },
        getOrElse: function (ma, onNone) { return M.chain(ma, Option_1.fold(onNone, M.of)); },
        fromM: function (ma) { return M.map(ma, Option_1.some); },
        none: function () { return fnone; }
    };
}
exports.getOptionM = getOptionM;


/***/ }),

/***/ 6685:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ord = exports.Contravariant = exports.ordDate = exports.URI = exports.contramap = exports.getDualOrd = exports.getTupleOrd = exports.getMonoid = exports.getSemigroup = exports.fromCompare = exports.between = exports.clamp = exports.max = exports.min = exports.geq = exports.leq = exports.gt = exports.lt = exports.ordBoolean = exports.ordNumber = exports.ordString = void 0;
var Ordering_1 = __webpack_require__(4397);
var function_1 = __webpack_require__(6985);
// default compare for primitive types
function compare(x, y) {
    return x < y ? -1 : x > y ? 1 : 0;
}
function strictEqual(a, b) {
    return a === b;
}
/**
 * @category instances
 * @since 2.0.0
 */
exports.ordString = {
    equals: strictEqual,
    compare: compare
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.ordNumber = {
    equals: strictEqual,
    compare: compare
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.ordBoolean = {
    equals: strictEqual,
    compare: compare
};
// TODO: curry in v3
/**
 * Test whether one value is _strictly less than_ another
 *
 * @since 2.0.0
 */
function lt(O) {
    return function (x, y) { return O.compare(x, y) === -1; };
}
exports.lt = lt;
// TODO: curry in v3
/**
 * Test whether one value is _strictly greater than_ another
 *
 * @since 2.0.0
 */
function gt(O) {
    return function (x, y) { return O.compare(x, y) === 1; };
}
exports.gt = gt;
// TODO: curry in v3
/**
 * Test whether one value is _non-strictly less than_ another
 *
 * @since 2.0.0
 */
function leq(O) {
    return function (x, y) { return O.compare(x, y) !== 1; };
}
exports.leq = leq;
// TODO: curry in v3
/**
 * Test whether one value is _non-strictly greater than_ another
 *
 * @since 2.0.0
 */
function geq(O) {
    return function (x, y) { return O.compare(x, y) !== -1; };
}
exports.geq = geq;
// TODO: curry in v3
/**
 * Take the minimum of two values. If they are considered equal, the first argument is chosen
 *
 * @since 2.0.0
 */
function min(O) {
    return function (x, y) { return (O.compare(x, y) === 1 ? y : x); };
}
exports.min = min;
// TODO: curry in v3
/**
 * Take the maximum of two values. If they are considered equal, the first argument is chosen
 *
 * @since 2.0.0
 */
function max(O) {
    return function (x, y) { return (O.compare(x, y) === -1 ? y : x); };
}
exports.max = max;
/**
 * Clamp a value between a minimum and a maximum
 *
 * @since 2.0.0
 */
function clamp(O) {
    var minO = min(O);
    var maxO = max(O);
    return function (low, hi) { return function (x) { return maxO(minO(x, hi), low); }; };
}
exports.clamp = clamp;
/**
 * Test whether a value is between a minimum and a maximum (inclusive)
 *
 * @since 2.0.0
 */
function between(O) {
    var lessThanO = lt(O);
    var greaterThanO = gt(O);
    return function (low, hi) { return function (x) { return (lessThanO(x, low) || greaterThanO(x, hi) ? false : true); }; };
}
exports.between = between;
/**
 * @category constructors
 * @since 2.0.0
 */
function fromCompare(compare) {
    var optimizedCompare = function (x, y) { return (x === y ? 0 : compare(x, y)); };
    return {
        equals: function (x, y) { return optimizedCompare(x, y) === 0; },
        compare: optimizedCompare
    };
}
exports.fromCompare = fromCompare;
/**
 * Use `getMonoid` instead
 *
 * @category instances
 * @since 2.0.0
 * @deprecated
 */
function getSemigroup() {
    return {
        concat: function (x, y) { return fromCompare(function (a, b) { return Ordering_1.monoidOrdering.concat(x.compare(a, b), y.compare(a, b)); }); }
    };
}
exports.getSemigroup = getSemigroup;
/**
 * Returns a `Monoid` such that:
 *
 * - its `concat(ord1, ord2)` operation will order first by `ord1`, and then by `ord2`
 * - its `empty` value is an `Ord` that always considers compared elements equal
 *
 * @example
 * import { sort } from 'fp-ts/Array'
 * import { contramap, getDualOrd, getMonoid, ordBoolean, ordNumber, ordString } from 'fp-ts/Ord'
 * import { pipe } from 'fp-ts/function'
 * import { fold } from 'fp-ts/Monoid'
 *
 * interface User {
 *   id: number
 *   name: string
 *   age: number
 *   rememberMe: boolean
 * }
 *
 * const byName = pipe(
 *   ordString,
 *   contramap((p: User) => p.name)
 * )
 *
 * const byAge = pipe(
 *   ordNumber,
 *   contramap((p: User) => p.age)
 * )
 *
 * const byRememberMe = pipe(
 *   ordBoolean,
 *   contramap((p: User) => p.rememberMe)
 * )
 *
 * const M = getMonoid<User>()
 *
 * const users: Array<User> = [
 *   { id: 1, name: 'Guido', age: 47, rememberMe: false },
 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true }
 * ]
 *
 * // sort by name, then by age, then by `rememberMe`
 * const O1 = fold(M)([byName, byAge, byRememberMe])
 * assert.deepStrictEqual(sort(O1)(users), [
 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true },
 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
 *   { id: 1, name: 'Guido', age: 47, rememberMe: false }
 * ])
 *
 * // now `rememberMe = true` first, then by name, then by age
 * const O2 = fold(M)([getDualOrd(byRememberMe), byName, byAge])
 * assert.deepStrictEqual(sort(O2)(users), [
 *   { id: 4, name: 'Giulio', age: 44, rememberMe: true },
 *   { id: 2, name: 'Guido', age: 46, rememberMe: true },
 *   { id: 3, name: 'Giulio', age: 44, rememberMe: false },
 *   { id: 1, name: 'Guido', age: 47, rememberMe: false }
 * ])
 *
 * @category instances
 * @since 2.4.0
 */
function getMonoid() {
    return {
        // tslint:disable-next-line: deprecation
        concat: getSemigroup().concat,
        empty: fromCompare(function () { return 0; })
    };
}
exports.getMonoid = getMonoid;
/**
 * Given a tuple of `Ord`s returns an `Ord` for the tuple
 *
 * @example
 * import { getTupleOrd, ordString, ordNumber, ordBoolean } from 'fp-ts/Ord'
 *
 * const O = getTupleOrd(ordString, ordNumber, ordBoolean)
 * assert.strictEqual(O.compare(['a', 1, true], ['b', 2, true]), -1)
 * assert.strictEqual(O.compare(['a', 1, true], ['a', 2, true]), -1)
 * assert.strictEqual(O.compare(['a', 1, true], ['a', 1, false]), 1)
 *
 * @category instances
 * @since 2.0.0
 */
function getTupleOrd() {
    var ords = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        ords[_i] = arguments[_i];
    }
    var len = ords.length;
    return fromCompare(function (x, y) {
        var i = 0;
        for (; i < len - 1; i++) {
            var r = ords[i].compare(x[i], y[i]);
            if (r !== 0) {
                return r;
            }
        }
        return ords[i].compare(x[i], y[i]);
    });
}
exports.getTupleOrd = getTupleOrd;
/**
 * @category combinators
 * @since 2.0.0
 */
function getDualOrd(O) {
    return fromCompare(function (x, y) { return O.compare(y, x); });
}
exports.getDualOrd = getDualOrd;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var contramap_ = function (fa, f) { return function_1.pipe(fa, exports.contramap(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Contravariant
 * @since 2.0.0
 */
exports.contramap = function (f) { return function (fa) {
    return fromCompare(function (x, y) { return fa.compare(f(x), f(y)); });
}; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Ord';
/**
 * @category instances
 * @since 2.0.0
 */
exports.ordDate = 
/*#__PURE__*/
function_1.pipe(exports.ordNumber, exports.contramap(function (date) { return date.valueOf(); }));
/**
 * @category instances
 * @since 2.7.0
 */
exports.Contravariant = {
    URI: exports.URI,
    contramap: contramap_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.ord = exports.Contravariant;


/***/ }),

/***/ 4397:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.invert = exports.monoidOrdering = exports.semigroupOrdering = exports.eqOrdering = exports.sign = void 0;
/**
 * @since 2.0.0
 */
function sign(n) {
    return n <= -1 ? -1 : n >= 1 ? 1 : 0;
}
exports.sign = sign;
/**
 * @category instances
 * @since 2.0.0
 */
exports.eqOrdering = {
    equals: function (x, y) { return x === y; }
};
/**
 * Use `monoidOrdering` instead
 *
 * @category instances
 * @since 2.0.0
 * @deprecated
 */
exports.semigroupOrdering = {
    concat: function (x, y) { return (x !== 0 ? x : y); }
};
/**
 * @category instances
 * @since 2.4.0
 */
exports.monoidOrdering = {
    // tslint:disable-next-line: deprecation
    concat: exports.semigroupOrdering.concat,
    empty: 0
};
/**
 * @since 2.0.0
 */
function invert(O) {
    switch (O) {
        case -1:
            return 1;
        case 1:
            return -1;
        default:
            return 0;
    }
}
exports.invert = invert;


/***/ }),

/***/ 1855:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 265:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.randomBool = exports.randomRange = exports.randomInt = exports.random = void 0;
/**
 * @since 2.0.0
 */
var IO_1 = __webpack_require__(3760);
var function_1 = __webpack_require__(6985);
/**
 * Returns a random number between 0 (inclusive) and 1 (exclusive). This is a direct wrapper around JavaScript's
 * `Math.random()`.
 *
 * @since 2.0.0
 */
exports.random = function () { return Math.random(); };
/**
 * Takes a range specified by `low` (the first argument) and `high` (the second), and returns a random integer uniformly
 * distributed in the closed interval `[low, high]`. It is unspecified what happens if `low > high`, or if either of
 * `low` or `high` is not an integer.
 *
 * @since 2.0.0
 */
function randomInt(low, high) {
    return function_1.pipe(exports.random, IO_1.map(function (n) { return Math.floor((high - low + 1) * n + low); }));
}
exports.randomInt = randomInt;
/**
 * Returns a random number between a minimum value (inclusive) and a maximum value (exclusive). It is unspecified what
 * happens if `maximum < minimum`.
 *
 * @since 2.0.0
 */
function randomRange(min, max) {
    return function_1.pipe(exports.random, IO_1.map(function (n) { return (max - min) * n + min; }));
}
exports.randomRange = randomRange;
/**
 * Returns a random boolean value with an equal chance of being `true` or `false`
 *
 * @since 2.0.0
 */
exports.randomBool = 
/*#__PURE__*/
function_1.pipe(exports.random, IO_1.map(function (n) { return n < 0.5; }));


/***/ }),

/***/ 786:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.apSW = exports.bind = exports.bindW = exports.bindTo = exports.reader = exports.Choice = exports.Strong = exports.Category = exports.Profunctor = exports.Monad = exports.Applicative = exports.Functor = exports.getMonoid = exports.getSemigroup = exports.URI = exports.id = exports.promap = exports.compose = exports.flatten = exports.chainFirst = exports.chain = exports.chainW = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.apW = exports.map = exports.local = exports.asks = exports.ask = void 0;
var E = __importStar(__webpack_require__(7534));
var function_1 = __webpack_require__(6985);
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * Reads the current context
 *
 * @category constructors
 * @since 2.0.0
 */
exports.ask = function () { return function_1.identity; };
/**
 * Projects a value from the global context in a Reader
 *
 * @category constructors
 * @since 2.0.0
 */
exports.asks = function_1.identity;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * Changes the value of the local context during the execution of the action `ma` (similar to `Contravariant`'s
 * `contramap`).
 *
 * @category combinators
 * @since 2.0.0
 */
exports.local = function (f) { return function (ma) { return function (q) { return ma(f(q)); }; }; };
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var ap_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
var compose_ = function (bc, ab) { return function_1.pipe(bc, exports.compose(ab)); };
var promap_ = function (fea, f, g) { return function_1.pipe(fea, exports.promap(f, g)); };
var first_ = function (pab) { return function (_a) {
    var a = _a[0], c = _a[1];
    return [pab(a), c];
}; };
var second_ = function (pbc) { return function (_a) {
    var a = _a[0], b = _a[1];
    return [a, pbc(b)];
}; };
var left_ = function (pab) {
    return E.fold(function (a) { return E.left(pab(a)); }, E.right);
};
var right_ = function (pbc) {
    return E.fold(E.left, function (b) { return E.right(pbc(b)); });
};
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return function (r) { return f(fa(r)); }; }; };
/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 2.8.0
 */
exports.apW = function (fa) { return function (fab) { return function (r) { return fab(r)(fa(r)); }; }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = exports.apW;
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * @category Applicative
 * @since 2.0.0
 */
exports.of = function_1.constant;
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
exports.chainW = function (f) { return function (fa) { return function (r) { return f(fa(r))(r); }; }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = exports.chainW;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = function (f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * @category Semigroupoid
 * @since 2.0.0
 */
exports.compose = function (ab) { return function (bc) { return function_1.flow(ab, bc); }; };
/**
 * @category Profunctor
 * @since 2.0.0
 */
exports.promap = function (f, g) { return function (fea) { return function (a) { return g(fea(f(a))); }; }; };
/**
 * @category Category
 * @since 2.0.0
 */
exports.id = function () { return function_1.identity; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Reader';
/**
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return {
        concat: function (x, y) { return function (e) { return S.concat(x(e), y(e)); }; }
    };
}
exports.getSemigroup = getSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getMonoid(M) {
    return {
        concat: getSemigroup(M).concat,
        empty: function () { return M.empty; }
    };
}
exports.getMonoid = getMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Profunctor = {
    URI: exports.URI,
    map: map_,
    promap: promap_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Category = {
    URI: exports.URI,
    compose: compose_,
    id: exports.id
};
/**
 * @internal instances
 */
exports.Strong = {
    URI: exports.URI,
    map: map_,
    promap: promap_,
    first: first_,
    second: second_
};
/**
 * @internal instances
 */
exports.Choice = {
    URI: exports.URI,
    map: map_,
    promap: promap_,
    left: left_,
    right: right_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.reader = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    promap: promap_,
    compose: compose_,
    id: exports.id,
    first: first_,
    second: second_,
    left: left_,
    right: right_
};
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) {
    return exports.map(function_1.bindTo_(name));
};
/**
 * @since 2.8.0
 */
exports.bindW = function (name, f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
/**
 * @since 2.8.0
 */
exports.bind = exports.bindW;
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apSW = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.apW(fb));
};
/**
 * @since 2.8.0
 */
exports.apS = exports.apSW;


/***/ }),

/***/ 8882:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.apSW = exports.bind = exports.bindW = exports.bindTo = exports.readerEither = exports.MonadThrow = exports.Alt = exports.Bifunctor = exports.Monad = exports.Applicative = exports.Functor = exports.getReaderValidation = exports.getAltReaderValidation = exports.getApplicativeReaderValidation = exports.getApplyMonoid = exports.getApplySemigroup = exports.getSemigroup = exports.URI = exports.throwError = exports.alt = exports.flatten = exports.chainFirst = exports.chainFirstW = exports.chain = exports.chainW = exports.apSecond = exports.apFirst = exports.ap = exports.apW = exports.mapLeft = exports.bimap = exports.map = exports.filterOrElse = exports.chainEitherK = exports.chainEitherKW = exports.fromEitherK = exports.local = exports.swap = exports.orElse = exports.getOrElse = exports.getOrElseW = exports.fold = exports.fromPredicate = exports.fromOption = exports.fromEither = exports.asks = exports.ask = exports.leftReader = exports.rightReader = exports.right = exports.left = void 0;
var E = __importStar(__webpack_require__(7534));
var function_1 = __webpack_require__(6985);
var R = __importStar(__webpack_require__(786));
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
exports.left = 
/*#__PURE__*/
function_1.flow(E.left, R.of);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.right = 
/*#__PURE__*/
function_1.flow(E.right, R.of);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightReader = 
/*#__PURE__*/
R.map(E.right);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.leftReader = 
/*#__PURE__*/
R.map(E.left);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.ask = function () { return E.right; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.asks = function (f) { return function_1.flow(f, E.right); };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromEither = 
/*#__PURE__*/
E.fold(exports.left, function (a) { return exports.right(a); });
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromOption = function (onNone) { return function (ma) {
    return ma._tag === 'None' ? exports.left(onNone()) : exports.right(ma.value);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); }; };
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.0.0
 */
exports.fold = 
/*#__PURE__*/
function_1.flow(E.fold, R.chain);
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
exports.getOrElseW = function (onLeft) { return function (ma) { return function_1.pipe(ma, R.chain(E.fold(onLeft, R.of))); }; };
/**
 * @category destructors
 * @since 2.0.0
 */
exports.getOrElse = exports.getOrElseW;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.0.0
 */
exports.orElse = function (f) { return R.chain(E.fold(f, exports.right)); };
/**
 * @category combinators
 * @since 2.0.0
 */
exports.swap = 
/*#__PURE__*/
R.map(E.swap);
// TODO: remove in v3
/**
 * @category combinators
 * @since 2.0.0
 */
function local(f) {
    return function (ma) { return function (q) { return ma(f(q)); }; };
}
exports.local = local;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromEither(f.apply(void 0, a));
    };
}
exports.fromEitherK = fromEitherK;
/**
 * Less strict version of [`chainEitherK`](#chainEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainEitherKW = function (f) { return exports.chainW(fromEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainEitherK = exports.chainEitherKW;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.filterOrElse = function (predicate, onFalse) {
    return exports.chain(function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); });
};
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return function_1.pipe(fa, exports.bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return function_1.pipe(fa, exports.mapLeft(f)); };
/* istanbul ignore next */
var ap_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var of = exports.right;
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var alt_ = function (fa, that) { return function_1.pipe(fa, exports.alt(that)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) {
    return R.map(E.map(f));
};
/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.bimap = 
/*#__PURE__*/
function_1.flow(E.bimap, R.map);
/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.mapLeft = function (f) {
    return R.map(E.mapLeft(f));
};
/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 2.8.0
 */
exports.apW = function (fa) {
    return function_1.flow(R.map(function (gab) { return function (ga) { return E.apW(ga)(gab); }; }), R.apW(fa));
};
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = exports.apW;
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
exports.chainW = function (f) { return function (ma) { return function_1.pipe(ma, R.chain(E.fold(exports.left, f))); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = exports.chainW;
/**
 * Less strict version of [`chainFirst`](#chainFirst)
 *
 * @category Monad
 * @since 2.8.0
 */
exports.chainFirstW = function (f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = exports.chainFirstW;
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = function (that) { return R.chain(E.fold(that, exports.right)); };
/**
 * @category MonadThrow
 * @since 2.7.0
 */
exports.throwError = exports.left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'ReaderEither';
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return R.getSemigroup(E.getSemigroup(S));
}
exports.getSemigroup = getSemigroup;
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getApplySemigroup(S) {
    return R.getSemigroup(E.getApplySemigroup(S));
}
exports.getApplySemigroup = getApplySemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getApplyMonoid(M) {
    return {
        concat: getApplySemigroup(M).concat,
        empty: exports.right(M.empty)
    };
}
exports.getApplyMonoid = getApplyMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
function getApplicativeReaderValidation(SE) {
    var AV = E.getApplicativeValidation(SE);
    var ap = function (fga) {
        return function_1.flow(R.map(function (gab) { return function (ga) { return AV.ap(gab, ga); }; }), R.ap(fga));
    };
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return function_1.pipe(fab, ap(fa)); },
        of: of
    };
}
exports.getApplicativeReaderValidation = getApplicativeReaderValidation;
/**
 * @category instances
 * @since 2.7.0
 */
function getAltReaderValidation(SE) {
    var A = E.getAltValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) { return function (r) { return A.alt(me(r), function () { return that()(r); }); }; }
    };
}
exports.getAltReaderValidation = getAltReaderValidation;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.3.0
 */
function getReaderValidation(SE) {
    var applicativeReaderValidation = getApplicativeReaderValidation(SE);
    var altReaderValidation = getAltReaderValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: applicativeReaderValidation.ap,
        of: of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        alt: altReaderValidation.alt,
        throwError: exports.throwError
    };
}
exports.getReaderValidation = getReaderValidation;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.MonadThrow = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: of,
    chain: chain_,
    throwError: exports.throwError
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.readerEither = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_,
    map: map_,
    of: of,
    ap: ap_,
    chain: chain_,
    alt: alt_,
    throwError: exports.left
};
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) { return exports.map(function_1.bindTo_(name)); };
/**
 * @since 2.8.0
 */
exports.bindW = function (name, f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
/**
 * @since 2.8.0
 */
exports.bind = exports.bindW;
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apSW = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.apW(fb));
};
/**
 * @since 2.8.0
 */
exports.apS = exports.apSW;


/***/ }),

/***/ 6170:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getReaderM = void 0;
function getReaderM(M) {
    return {
        map: function (ma, f) { return function (r) { return M.map(ma(r), f); }; },
        of: function (a) { return function () { return M.of(a); }; },
        ap: function (mab, ma) { return function (r) { return M.ap(mab(r), ma(r)); }; },
        chain: function (ma, f) { return function (r) { return M.chain(ma(r), function (a) { return f(a)(r); }); }; },
        ask: function () { return M.of; },
        asks: function (f) { return function (r) { return M.map(M.of(r), f); }; },
        local: function (ma, f) { return function (q) { return ma(f(q)); }; },
        fromReader: function (ma) { return function (r) { return M.of(ma(r)); }; },
        fromM: function (ma) { return function () { return ma; }; }
    };
}
exports.getReaderM = getReaderM;


/***/ }),

/***/ 7605:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.apSW = exports.bind = exports.bindW = exports.bindTo = exports.run = exports.readerTaskSeq = exports.readerTask = exports.Monad = exports.ApplicativeSeq = exports.ApplicativePar = exports.Functor = exports.getMonoid = exports.getSemigroup = exports.URI = exports.flatten = exports.chainFirst = exports.chain = exports.chainW = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.apW = exports.map = exports.chainTaskK = exports.fromTaskK = exports.chainIOK = exports.fromIOK = exports.local = exports.asks = exports.ask = exports.fromIO = exports.fromReader = exports.fromTask = void 0;
var function_1 = __webpack_require__(6985);
var R = __importStar(__webpack_require__(786));
var T = __importStar(__webpack_require__(2664));
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.3.0
 */
exports.fromTask = 
/*#__PURE__*/
R.of;
/**
 * @category constructors
 * @since 2.3.0
 */
exports.fromReader = function (ma) { return function_1.flow(ma, T.of); };
/**
 * @category constructors
 * @since 2.3.0
 */
exports.fromIO = 
/*#__PURE__*/
function_1.flow(T.fromIO, exports.fromTask);
/**
 * @category constructors
 * @since 2.3.0
 */
exports.ask = function () { return T.of; };
/**
 * @category constructors
 * @since 2.3.0
 */
exports.asks = function (f) { return function_1.flow(T.of, T.map(f)); };
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
// TODO: remove in v3
/**
 * @category combinators
 * @since 2.3.0
 */
exports.local = R.local;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromIOK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromIO(f.apply(void 0, a));
    };
}
exports.fromIOK = fromIOK;
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainIOK = function (f) {
    return exports.chain(function (a) { return exports.fromIO(f(a)); });
};
/**
 * @category combinators
 * @since 2.4.0
 */
function fromTaskK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromTask(f.apply(void 0, a));
    };
}
exports.fromTaskK = fromTaskK;
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainTaskK = function (f) {
    return exports.chain(function (a) { return exports.fromTask(f(a)); });
};
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
var apPar_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var apSeq_ = function (fab, fa) {
    return function_1.pipe(fab, exports.chain(function (f) { return function_1.pipe(fa, exports.map(f)); }));
};
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Functor
 * @since 2.3.0
 */
exports.map = function (f) { return function (fa) {
    return function_1.flow(fa, T.map(f));
}; };
/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 2.8.0
 */
exports.apW = function (fa) { return function (fab) { return function (r) { return function_1.pipe(fab(r), T.ap(fa(r))); }; }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.3.0
 */
exports.ap = exports.apW;
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.3.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.3.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * @category Applicative
 * @since 2.3.0
 */
exports.of = function (a) { return function () { return T.of(a); }; };
/**
 * Less strict version of  [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.7
 */
exports.chainW = function (f) { return function (fa) { return function (r) {
    return function_1.pipe(fa(r), T.chain(function (a) { return f(a)(r); }));
}; }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.3.0
 */
exports.chain = exports.chainW;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.3.0
 */
exports.chainFirst = function (f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * @category Monad
 * @since 2.3.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.3.0
 */
exports.URI = 'ReaderTask';
/**
 * @category instances
 * @since 2.3.0
 */
function getSemigroup(S) {
    return R.getSemigroup(T.getSemigroup(S));
}
exports.getSemigroup = getSemigroup;
/**
 * @category instances
 * @since 2.3.0
 */
function getMonoid(M) {
    return {
        concat: getSemigroup(M).concat,
        empty: exports.of(M.empty)
    };
}
exports.getMonoid = getMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ApplicativePar = {
    URI: exports.URI,
    map: map_,
    ap: apPar_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ApplicativeSeq = {
    URI: exports.URI,
    map: map_,
    ap: apSeq_,
    of: exports.of
};
/**
 * @internal
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apPar_,
    chain: chain_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.3.0
 */
exports.readerTask = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apPar_,
    chain: chain_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask
};
// TODO: remove in v3
/**
 * Like `readerTask` but `ap` is sequential
 *
 * @category instances
 * @since 2.3.0
 */
exports.readerTaskSeq = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apSeq_,
    chain: chain_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
// TODO: remove in v3
/**
 * @since 2.4.0
 */
/* istanbul ignore next */
function run(ma, r) {
    return ma(r)();
}
exports.run = run;
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) {
    return exports.map(function_1.bindTo_(name));
};
/**
 * @since 2.8.0
 */
exports.bindW = function (name, f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
/**
 * @since 2.8.0
 */
exports.bind = exports.bindW;
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apSW = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.apW(fb));
};
/**
 * @since 2.8.0
 */
exports.apS = exports.apSW;


/***/ }),

/***/ 5043:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.apSW = exports.bind = exports.bindW = exports.bindTo = exports.bracket = exports.run = exports.readerTaskEitherSeq = exports.readerTaskEither = exports.Alt = exports.Bifunctor = exports.ApplicativeSeq = exports.ApplicativePar = exports.Functor = exports.getReaderTaskValidation = exports.getAltReaderTaskValidation = exports.getApplicativeReaderTaskValidation = exports.getApplyMonoid = exports.getApplySemigroup = exports.getSemigroup = exports.URI = exports.throwError = exports.fromTask = exports.fromIO = exports.alt = exports.flatten = exports.chainFirst = exports.chainFirstW = exports.chain = exports.chainW = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.apW = exports.mapLeft = exports.bimap = exports.map = exports.chainTaskEitherK = exports.chainTaskEitherKW = exports.fromTaskEitherK = exports.chainIOEitherK = exports.chainIOEitherKW = exports.fromIOEitherK = exports.chainEitherK = exports.chainEitherKW = exports.fromEitherK = exports.filterOrElse = exports.local = exports.swap = exports.orElse = exports.getOrElse = exports.getOrElseW = exports.fold = exports.fromPredicate = exports.fromOption = exports.fromEither = exports.asks = exports.ask = exports.leftIO = exports.rightIO = exports.fromReaderEither = exports.fromIOEither = exports.leftReaderTask = exports.rightReaderTask = exports.leftReader = exports.rightReader = exports.leftTask = exports.rightTask = exports.right = exports.left = exports.fromTaskEither = void 0;
var E = __importStar(__webpack_require__(7534));
var function_1 = __webpack_require__(6985);
var R = __importStar(__webpack_require__(786));
var T = __importStar(__webpack_require__(2664));
var TE = __importStar(__webpack_require__(437));
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromTaskEither = 
/*#__PURE__*/
R.of;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.left = 
/*#__PURE__*/
function_1.flow(TE.left, exports.fromTaskEither);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.right = 
/*#__PURE__*/
function_1.flow(TE.right, exports.fromTaskEither);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightTask = 
/*#__PURE__*/
function_1.flow(TE.rightTask, exports.fromTaskEither);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.leftTask = 
/*#__PURE__*/
function_1.flow(TE.leftTask, exports.fromTaskEither);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightReader = function (ma) {
    return function_1.flow(ma, TE.right);
};
/**
 * @category constructors
 * @since 2.0.0
 */
exports.leftReader = function (me) {
    return function_1.flow(me, TE.left);
};
/**
 * @category constructors
 * @since 2.5.0
 */
exports.rightReaderTask = function (ma) {
    return function_1.flow(ma, TE.rightTask);
};
/**
 * @category constructors
 * @since 2.5.0
 */
exports.leftReaderTask = function (me) {
    return function_1.flow(me, TE.leftTask);
};
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromIOEither = 
/*#__PURE__*/
function_1.flow(TE.fromIOEither, exports.fromTaskEither);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromReaderEither = function (ma) {
    return function_1.flow(ma, TE.fromEither);
};
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightIO = 
/*#__PURE__*/
function_1.flow(TE.rightIO, exports.fromTaskEither);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.leftIO = 
/*#__PURE__*/
function_1.flow(TE.leftIO, exports.fromTaskEither);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.ask = function () { return TE.right; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.asks = function (f) {
    return function_1.flow(TE.right, TE.map(f));
};
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromEither = 
/*#__PURE__*/
E.fold(exports.left, function (a) { return exports.right(a); });
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromOption = function (onNone) { return function (ma) { return (ma._tag === 'None' ? exports.left(onNone()) : exports.right(ma.value)); }; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); }; };
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.0.0
 */
function fold(onLeft, onRight) {
    return function (ma) { return function (r) {
        return function_1.pipe(ma(r), TE.fold(function (e) { return onLeft(e)(r); }, function (a) { return onRight(a)(r); }));
    }; };
}
exports.fold = fold;
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
exports.getOrElseW = function (onLeft) { return function (ma) { return function (r) {
    return TE.getOrElseW(function (e) { return onLeft(e)(r); })(ma(r));
}; }; };
/**
 * @category destructors
 * @since 2.0.0
 */
exports.getOrElse = exports.getOrElseW;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.0.0
 */
function orElse(onLeft) {
    return function (ma) { return function (r) { return TE.orElse(function (e) { return onLeft(e)(r); })(ma(r)); }; };
}
exports.orElse = orElse;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.swap = function (ma) { return function_1.flow(ma, TE.swap); };
// TODO: remove in v3
/**
 * @category combinators
 * @since 2.0.0
 */
exports.local = R.local;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.filterOrElse = function (predicate, onFalse) {
    return exports.chain(function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); });
};
/**
 * @category combinators
 * @since 2.4.0
 */
function fromEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromEither(f.apply(void 0, a));
    };
}
exports.fromEitherK = fromEitherK;
/**
 * Less strict version of [`chainEitherK`](#chainEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainEitherKW = function (f) { return exports.chainW(fromEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainEitherK = exports.chainEitherKW;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromIOEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromIOEither(f.apply(void 0, a));
    };
}
exports.fromIOEitherK = fromIOEitherK;
/**
 * Less strict version of [`chainIOEitherK`](#chainIOEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainIOEitherKW = function (f) { return exports.chainW(fromIOEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainIOEitherK = exports.chainIOEitherKW;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromTaskEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromTaskEither(f.apply(void 0, a));
    };
}
exports.fromTaskEitherK = fromTaskEitherK;
/**
 * Less strict version of [`chainTaskEitherK`](#chainTaskEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainTaskEitherKW = function (f) { return exports.chainW(fromTaskEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainTaskEitherK = exports.chainTaskEitherKW;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
var apPar_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var apSeq_ = function (fab, fa) {
    return function_1.pipe(fab, exports.chain(function (f) { return function_1.pipe(fa, exports.map(f)); }));
};
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var alt_ = function (fa, that) { return function_1.pipe(fa, exports.alt(that)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return function_1.pipe(fa, exports.bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return function_1.pipe(fa, exports.mapLeft(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return function_1.flow(fa, TE.map(f)); }; };
/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.bimap = function (f, g) { return function (fa) { return function (r) {
    return function_1.pipe(fa(r), TE.bimap(f, g));
}; }; };
/**
 * Map a function over the second type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.mapLeft = function (f) { return function (fa) { return function (r) { return function_1.pipe(fa(r), TE.mapLeft(f)); }; }; };
/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 2.8.0
 */
exports.apW = function (fa) { return function (fab) { return function (r) { return function_1.pipe(fab(r), TE.apW(fa(r))); }; }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = exports.apW;
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * @category Applicative
 * @since 2.7.0
 */
exports.of = exports.right;
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
exports.chainW = function (f) { return function (fa) { return function (r) {
    return function_1.pipe(fa(r), TE.chainW(function (a) { return f(a)(r); }));
}; }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = exports.chainW;
/**
 * Less strict version of [`chainFirst`](#chainFirst).
 *
 * @category Monad
 * @since 2.8.0
 */
exports.chainFirstW = function (f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = exports.chainFirstW;
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = function (that) { return function (fa) { return function (r) {
    return function_1.pipe(fa(r), TE.alt(function () { return that()(r); }));
}; }; };
/**
 * @category MonadIO
 * @since 2.0.0
 */
exports.fromIO = exports.rightIO;
/**
 * @category MonadTask
 * @since 2.0.0
 */
exports.fromTask = exports.rightTask;
/**
 * @category MonadThrow
 * @since 2.0.0
 */
exports.throwError = exports.left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'ReaderTaskEither';
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return R.getSemigroup(TE.getSemigroup(S));
}
exports.getSemigroup = getSemigroup;
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getApplySemigroup(S) {
    return R.getSemigroup(TE.getApplySemigroup(S));
}
exports.getApplySemigroup = getApplySemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getApplyMonoid(M) {
    return {
        concat: getApplySemigroup(M).concat,
        empty: exports.right(M.empty)
    };
}
exports.getApplyMonoid = getApplyMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
function getApplicativeReaderTaskValidation(A, SE) {
    var AV = TE.getApplicativeTaskValidation(A, SE);
    var ap = function (fga) {
        return function_1.flow(R.map(function (gab) { return function (ga) { return AV.ap(gab, ga); }; }), R.ap(fga));
    };
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return function_1.pipe(fab, ap(fa)); },
        of: exports.of
    };
}
exports.getApplicativeReaderTaskValidation = getApplicativeReaderTaskValidation;
/**
 * @category instances
 * @since 2.7.0
 */
function getAltReaderTaskValidation(SE) {
    var A = TE.getAltTaskValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) { return function (r) { return A.alt(me(r), function () { return that()(r); }); }; }
    };
}
exports.getAltReaderTaskValidation = getAltReaderTaskValidation;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.3.0
 */
function getReaderTaskValidation(SE) {
    var applicativeReaderTaskValidation = getApplicativeReaderTaskValidation(T.ApplicativePar, SE);
    var altReaderTaskValidation = getAltReaderTaskValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        of: exports.of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        ap: applicativeReaderTaskValidation.ap,
        alt: altReaderTaskValidation.alt,
        fromIO: exports.fromIO,
        fromTask: exports.fromTask,
        throwError: exports.throwError
    };
}
exports.getReaderTaskValidation = getReaderTaskValidation;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ApplicativePar = {
    URI: exports.URI,
    map: map_,
    ap: apPar_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ApplicativeSeq = {
    URI: exports.URI,
    map: map_,
    ap: apSeq_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.readerTaskEither = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apPar_,
    chain: chain_,
    alt: alt_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask,
    throwError: exports.throwError
};
// TODO: remove in v3
/**
 * Like `readerTaskEither` but `ap` is sequential
 *
 * @category instances
 * @since 2.0.0
 */
exports.readerTaskEitherSeq = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apSeq_,
    chain: chain_,
    alt: alt_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask,
    throwError: exports.throwError
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
// TODO: remove in v3
/**
 * @since 2.0.0
 */
/* istanbul ignore next */
function run(ma, r) {
    return ma(r)();
}
exports.run = run;
/**
 * Make sure that a resource is cleaned up in the event of an exception (\*). The release action is called regardless of
 * whether the body action throws (\*) or returns.
 *
 * (\*) i.e. returns a `Left`
 *
 * @since 2.0.4
 */
function bracket(aquire, use, release) {
    return function (r) {
        return TE.bracket(aquire(r), function (a) { return use(a)(r); }, function (a, e) { return release(a, e)(r); });
    };
}
exports.bracket = bracket;
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) { return exports.map(function_1.bindTo_(name)); };
/**
 * @since 2.8.0
 */
exports.bindW = function (name, f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
/**
 * @since 2.8.0
 */
exports.bind = exports.bindW;
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apSW = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.apW(fb));
};
/**
 * @since 2.8.0
 */
exports.apS = exports.apSW;


/***/ }),

/***/ 4234:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.bind = exports.bindTo = exports.empty = exports.unsafeDeleteAt = exports.unsafeUpdateAt = exports.unsafeInsertAt = exports.readonlyArray = exports.Witherable = exports.TraversableWithIndex = exports.Traversable = exports.FoldableWithIndex = exports.Foldable = exports.FilterableWithIndex = exports.Filterable = exports.Compactable = exports.Extend = exports.Alternative = exports.Alt = exports.Unfoldable = exports.Monad = exports.Applicative = exports.FunctorWithIndex = exports.Functor = exports.URI = exports.unfold = exports.wilt = exports.wither = exports.traverseWithIndex = exports.sequence = exports.traverse = exports.reduceRightWithIndex = exports.reduceRight = exports.reduceWithIndex = exports.foldMap = exports.reduce = exports.foldMapWithIndex = exports.duplicate = exports.extend = exports.filterWithIndex = exports.partitionMapWithIndex = exports.partitionMap = exports.partitionWithIndex = exports.partition = exports.compact = exports.filterMap = exports.filterMapWithIndex = exports.filter = exports.separate = exports.mapWithIndex = exports.map = exports.chainFirst = exports.chainWithIndex = exports.chain = exports.apSecond = exports.apFirst = exports.ap = exports.alt = exports.zero = exports.of = exports.difference = exports.intersection = exports.union = exports.comprehension = exports.chunksOf = exports.splitAt = exports.chop = exports.sortBy = exports.uniq = exports.elem = exports.rotate = exports.unzip = exports.zip = exports.zipWith = exports.sort = exports.lefts = exports.rights = exports.reverse = exports.modifyAt = exports.deleteAt = exports.updateAt = exports.insertAt = exports.findLastIndex = exports.findLastMap = exports.findLast = exports.findFirstMap = exports.findFirst = exports.findIndex = exports.dropLeftWhile = exports.dropRight = exports.dropLeft = exports.spanLeft = exports.takeLeftWhile = exports.takeRight = exports.takeLeft = exports.init = exports.tail = exports.last = exports.head = exports.snoc = exports.cons = exports.lookup = exports.isOutOfBound = exports.isNonEmpty = exports.isEmpty = exports.scanRight = exports.scanLeft = exports.foldRight = exports.foldLeft = exports.flatten = exports.replicate = exports.range = exports.makeBy = exports.getOrd = exports.getEq = exports.getMonoid = exports.getShow = exports.toArray = exports.fromArray = void 0;
var function_1 = __webpack_require__(6985);
var Option_1 = __webpack_require__(2569);
var Ord_1 = __webpack_require__(6685);
// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.5.0
 */
// tslint:disable-next-line: readonly-array
function fromArray(as) {
    var l = as.length;
    if (l === 0) {
        return exports.empty;
    }
    var ras = Array(l);
    for (var i = 0; i < l; i++) {
        ras[i] = as[i];
    }
    return ras;
}
exports.fromArray = fromArray;
/**
 * @category destructors
 * @since 2.5.0
 */
// tslint:disable-next-line: readonly-array
function toArray(ras) {
    var l = ras.length;
    var as = Array(l);
    for (var i = 0; i < l; i++) {
        as[i] = ras[i];
    }
    return as;
}
exports.toArray = toArray;
/**
 * @category instances
 * @since 2.5.0
 */
function getShow(S) {
    return {
        show: function (as) { return "[" + as.map(S.show).join(', ') + "]"; }
    };
}
exports.getShow = getShow;
var concat = function (x, y) {
    var lenx = x.length;
    if (lenx === 0) {
        return y;
    }
    var leny = y.length;
    if (leny === 0) {
        return x;
    }
    var r = Array(lenx + leny);
    for (var i = 0; i < lenx; i++) {
        r[i] = x[i];
    }
    for (var i = 0; i < leny; i++) {
        r[i + lenx] = y[i];
    }
    return r;
};
/**
 * Returns a `Monoid` for `ReadonlyArray<A>`
 *
 * @example
 * import { getMonoid } from 'fp-ts/ReadonlyArray'
 *
 * const M = getMonoid<number>()
 * assert.deepStrictEqual(M.concat([1, 2], [3, 4]), [1, 2, 3, 4])
 *
 * @category instances
 * @since 2.5.0
 */
function getMonoid() {
    return {
        concat: concat,
        empty: exports.empty
    };
}
exports.getMonoid = getMonoid;
/**
 * Derives an `Eq` over the `ReadonlyArray` of a given element type from the `Eq` of that type. The derived `Eq` defines two
 * arrays as equal if all elements of both arrays are compared equal pairwise with the given `E`. In case of arrays of
 * different lengths, the result is non equality.
 *
 * @example
 * import { eqString } from 'fp-ts/Eq'
 * import { getEq } from 'fp-ts/ReadonlyArray'
 *
 * const E = getEq(eqString)
 * assert.strictEqual(E.equals(['a', 'b'], ['a', 'b']), true)
 * assert.strictEqual(E.equals(['a'], []), false)
 *
 * @category instances
 * @since 2.5.0
 */
function getEq(E) {
    return {
        equals: function (xs, ys) { return xs === ys || (xs.length === ys.length && xs.every(function (x, i) { return E.equals(x, ys[i]); })); }
    };
}
exports.getEq = getEq;
/**
 * Derives an `Ord` over the `ReadonlyArray` of a given element type from the `Ord` of that type. The ordering between two such
 * arrays is equal to: the first non equal comparison of each arrays elements taken pairwise in increasing order, in
 * case of equality over all the pairwise elements; the longest array is considered the greatest, if both arrays have
 * the same length, the result is equality.
 *
 * @example
 * import { getOrd } from 'fp-ts/ReadonlyArray'
 * import { ordString } from 'fp-ts/Ord'
 *
 * const O = getOrd(ordString)
 * assert.strictEqual(O.compare(['b'], ['a']), 1)
 * assert.strictEqual(O.compare(['a'], ['a']), 0)
 * assert.strictEqual(O.compare(['a'], ['b']), -1)
 *
 *
 * @category instances
 * @since 2.5.0
 */
function getOrd(O) {
    return Ord_1.fromCompare(function (a, b) {
        var aLen = a.length;
        var bLen = b.length;
        var len = Math.min(aLen, bLen);
        for (var i = 0; i < len; i++) {
            var ordering = O.compare(a[i], b[i]);
            if (ordering !== 0) {
                return ordering;
            }
        }
        return Ord_1.ordNumber.compare(aLen, bLen);
    });
}
exports.getOrd = getOrd;
/**
 * Return a list of length `n` with element `i` initialized with `f(i)`
 *
 * @example
 * import { makeBy } from 'fp-ts/ReadonlyArray'
 *
 * const double = (n: number): number => n * 2
 * assert.deepStrictEqual(makeBy(5, double), [0, 2, 4, 6, 8])
 *
 * @category constructors
 * @since 2.5.0
 */
function makeBy(n, f) {
    // tslint:disable-next-line: readonly-array
    var r = [];
    for (var i = 0; i < n; i++) {
        r.push(f(i));
    }
    return r;
}
exports.makeBy = makeBy;
/**
 * Create an array containing a range of integers, including both endpoints
 *
 * @example
 * import { range } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(range(1, 5), [1, 2, 3, 4, 5])
 *
 * @category constructors
 * @since 2.5.0
 */
function range(start, end) {
    return makeBy(end - start + 1, function (i) { return start + i; });
}
exports.range = range;
/**
 * Create an array containing a value repeated the specified number of times
 *
 * @example
 * import { replicate } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(replicate(3, 'a'), ['a', 'a', 'a'])
 *
 * @category constructors
 * @since 2.5.0
 */
function replicate(n, a) {
    return makeBy(n, function () { return a; });
}
exports.replicate = replicate;
/**
 * Removes one level of nesting
 *
 * @example
 * import { flatten } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(flatten([[1], [2], [3]]), [1, 2, 3])
 *
 * @category Monad
 * @since 2.5.0
 */
function flatten(mma) {
    var rLen = 0;
    var len = mma.length;
    for (var i = 0; i < len; i++) {
        rLen += mma[i].length;
    }
    var r = Array(rLen);
    var start = 0;
    for (var i = 0; i < len; i++) {
        var arr = mma[i];
        var l = arr.length;
        for (var j = 0; j < l; j++) {
            r[j + start] = arr[j];
        }
        start += l;
    }
    return r;
}
exports.flatten = flatten;
/**
 * Break an array into its first element and remaining elements
 *
 * @example
 * import { foldLeft } from 'fp-ts/ReadonlyArray'
 *
 * const len: <A>(as: ReadonlyArray<A>) => number = foldLeft(() => 0, (_, tail) => 1 + len(tail))
 * assert.strictEqual(len([1, 2, 3]), 3)
 *
 * @category destructors
 * @since 2.5.0
 */
function foldLeft(onNil, onCons) {
    return function (as) { return (isEmpty(as) ? onNil() : onCons(as[0], as.slice(1))); };
}
exports.foldLeft = foldLeft;
/**
 * Break an array into its initial elements and the last element
 *
 * @category destructors
 * @since 2.5.0
 */
function foldRight(onNil, onCons) {
    return function (as) { return (isEmpty(as) ? onNil() : onCons(as.slice(0, as.length - 1), as[as.length - 1])); };
}
exports.foldRight = foldRight;
/**
 * Same as `reduce` but it carries over the intermediate steps
 *
 * ```ts
 * import { scanLeft } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(scanLeft(10, (b, a: number) => b - a)([1, 2, 3]), [10, 9, 7, 4])
 * ```
 *
 * @category combinators
 * @since 2.5.0
 */
function scanLeft(b, f) {
    return function (as) {
        var l = as.length;
        // tslint:disable-next-line: readonly-array
        var r = new Array(l + 1);
        r[0] = b;
        for (var i = 0; i < l; i++) {
            r[i + 1] = f(r[i], as[i]);
        }
        return r;
    };
}
exports.scanLeft = scanLeft;
/**
 * Fold an array from the right, keeping all intermediate results instead of only the final result
 *
 * @example
 * import { scanRight } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(scanRight(10, (a: number, b) => b - a)([1, 2, 3]), [4, 5, 7, 10])
 *
 * @category combinators
 * @since 2.5.0
 */
function scanRight(b, f) {
    return function (as) {
        var l = as.length;
        // tslint:disable-next-line: readonly-array
        var r = new Array(l + 1);
        r[l] = b;
        for (var i = l - 1; i >= 0; i--) {
            r[i] = f(as[i], r[i + 1]);
        }
        return r;
    };
}
exports.scanRight = scanRight;
/**
 * Test whether an array is empty
 *
 * @example
 * import { isEmpty } from 'fp-ts/ReadonlyArray'
 *
 * assert.strictEqual(isEmpty([]), true)
 *
 * @since 2.5.0
 */
function isEmpty(as) {
    return as.length === 0;
}
exports.isEmpty = isEmpty;
/**
 * Test whether an array is non empty narrowing down the type to `NonEmptyReadonlyArray<A>`
 *
 * @category guards
 * @since 2.5.0
 */
function isNonEmpty(as) {
    return as.length > 0;
}
exports.isNonEmpty = isNonEmpty;
/**
 * Test whether an array contains a particular index
 *
 * @since 2.5.0
 */
function isOutOfBound(i, as) {
    return i < 0 || i >= as.length;
}
exports.isOutOfBound = isOutOfBound;
function lookup(i, as) {
    return as === undefined ? function (as) { return lookup(i, as); } : isOutOfBound(i, as) ? Option_1.none : Option_1.some(as[i]);
}
exports.lookup = lookup;
function cons(head, tail) {
    if (tail === undefined) {
        return function (tail) { return cons(head, tail); };
    }
    var len = tail.length;
    var r = Array(len + 1);
    for (var i = 0; i < len; i++) {
        r[i + 1] = tail[i];
    }
    r[0] = head;
    return r;
}
exports.cons = cons;
// TODO: curry and make data-last in v3
/**
 * Append an element to the end of an array, creating a new non empty array
 *
 * @example
 * import { snoc } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(snoc([1, 2, 3], 4), [1, 2, 3, 4])
 *
 * @category constructors
 * @since 2.5.0
 */
function snoc(init, end) {
    var len = init.length;
    var r = Array(len + 1);
    for (var i = 0; i < len; i++) {
        r[i] = init[i];
    }
    r[len] = end;
    return r;
}
exports.snoc = snoc;
/**
 * Get the first element in an array, or `None` if the array is empty
 *
 * @example
 * import { head } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(head([1, 2, 3]), some(1))
 * assert.deepStrictEqual(head([]), none)
 *
 * @since 2.5.0
 */
function head(as) {
    return isEmpty(as) ? Option_1.none : Option_1.some(as[0]);
}
exports.head = head;
/**
 * Get the last element in an array, or `None` if the array is empty
 *
 * @example
 * import { last } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(last([1, 2, 3]), some(3))
 * assert.deepStrictEqual(last([]), none)
 *
 * @since 2.5.0
 */
function last(as) {
    return lookup(as.length - 1, as);
}
exports.last = last;
/**
 * Get all but the first element of an array, creating a new array, or `None` if the array is empty
 *
 * @example
 * import { tail } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(tail([1, 2, 3]), some([2, 3]))
 * assert.deepStrictEqual(tail([]), none)
 *
 * @since 2.5.0
 */
function tail(as) {
    return isEmpty(as) ? Option_1.none : Option_1.some(as.slice(1));
}
exports.tail = tail;
/**
 * Get all but the last element of an array, creating a new array, or `None` if the array is empty
 *
 * @example
 * import { init } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(init([1, 2, 3]), some([1, 2]))
 * assert.deepStrictEqual(init([]), none)
 *
 * @since 2.5.0
 */
function init(as) {
    var len = as.length;
    return len === 0 ? Option_1.none : Option_1.some(as.slice(0, len - 1));
}
exports.init = init;
/**
 * Keep only a number of elements from the start of an array, creating a new array.
 * `n` must be a natural number
 *
 * @example
 * import { takeLeft } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(takeLeft(2)([1, 2, 3]), [1, 2])
 *
 * @category combinators
 * @since 2.5.0
 */
function takeLeft(n) {
    return function (as) { return as.slice(0, n); };
}
exports.takeLeft = takeLeft;
/**
 * Keep only a number of elements from the end of an array, creating a new array.
 * `n` must be a natural number
 *
 * @example
 * import { takeRight } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(takeRight(2)([1, 2, 3, 4, 5]), [4, 5])
 *
 * @since 2.5.0
 */
function takeRight(n) {
    return function (as) { return (n === 0 ? exports.empty : as.slice(-n)); };
}
exports.takeRight = takeRight;
function takeLeftWhile(predicate) {
    return function (as) {
        var i = spanIndexUncurry(as, predicate);
        var init = Array(i);
        for (var j = 0; j < i; j++) {
            init[j] = as[j];
        }
        return init;
    };
}
exports.takeLeftWhile = takeLeftWhile;
var spanIndexUncurry = function (as, predicate) {
    var l = as.length;
    var i = 0;
    for (; i < l; i++) {
        if (!predicate(as[i])) {
            break;
        }
    }
    return i;
};
function spanLeft(predicate) {
    return function (as) {
        var i = spanIndexUncurry(as, predicate);
        var init = Array(i);
        for (var j = 0; j < i; j++) {
            init[j] = as[j];
        }
        var l = as.length;
        var rest = Array(l - i);
        for (var j = i; j < l; j++) {
            rest[j - i] = as[j];
        }
        return { init: init, rest: rest };
    };
}
exports.spanLeft = spanLeft;
/**
 * Drop a number of elements from the start of an array, creating a new array
 *
 * @example
 * import { dropLeft } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(dropLeft(2)([1, 2, 3]), [3])
 *
 * @category combinators
 * @since 2.5.0
 */
function dropLeft(n) {
    return function (as) { return as.slice(n, as.length); };
}
exports.dropLeft = dropLeft;
/**
 * Drop a number of elements from the end of an array, creating a new array
 *
 * @example
 * import { dropRight } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(dropRight(2)([1, 2, 3, 4, 5]), [1, 2, 3])
 *
 * @category combinators
 * @since 2.5.0
 */
function dropRight(n) {
    return function (as) { return as.slice(0, as.length - n); };
}
exports.dropRight = dropRight;
/**
 * Remove the longest initial subarray for which all element satisfy the specified predicate, creating a new array
 *
 * @example
 * import { dropLeftWhile } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(dropLeftWhile((n: number) => n % 2 === 1)([1, 3, 2, 4, 5]), [2, 4, 5])
 *
 * @category combinators
 * @since 2.5.0
 */
function dropLeftWhile(predicate) {
    return function (as) {
        var i = spanIndexUncurry(as, predicate);
        var l = as.length;
        var rest = Array(l - i);
        for (var j = i; j < l; j++) {
            rest[j - i] = as[j];
        }
        return rest;
    };
}
exports.dropLeftWhile = dropLeftWhile;
/**
 * Find the first index for which a predicate holds
 *
 * @example
 * import { findIndex } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([1, 2, 3]), some(1))
 * assert.deepStrictEqual(findIndex((n: number) => n === 2)([]), none)
 *
 * @since 2.5.0
 */
function findIndex(predicate) {
    return function (as) {
        var len = as.length;
        for (var i = 0; i < len; i++) {
            if (predicate(as[i])) {
                return Option_1.some(i);
            }
        }
        return Option_1.none;
    };
}
exports.findIndex = findIndex;
function findFirst(predicate) {
    return function (as) {
        var len = as.length;
        for (var i = 0; i < len; i++) {
            if (predicate(as[i])) {
                return Option_1.some(as[i]);
            }
        }
        return Option_1.none;
    };
}
exports.findFirst = findFirst;
/**
 * Find the first element returned by an option based selector function
 *
 * @example
 * import { findFirstMap } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * interface Person {
 *   name: string
 *   age?: number
 * }
 *
 * const persons: ReadonlyArray<Person> = [{ name: 'John' }, { name: 'Mary', age: 45 }, { name: 'Joey', age: 28 }]
 *
 * // returns the name of the first person that has an age
 * assert.deepStrictEqual(findFirstMap((p: Person) => (p.age === undefined ? none : some(p.name)))(persons), some('Mary'))
 *
 * @since 2.5.0
 */
function findFirstMap(f) {
    return function (as) {
        var len = as.length;
        for (var i = 0; i < len; i++) {
            var v = f(as[i]);
            if (Option_1.isSome(v)) {
                return v;
            }
        }
        return Option_1.none;
    };
}
exports.findFirstMap = findFirstMap;
function findLast(predicate) {
    return function (as) {
        var len = as.length;
        for (var i = len - 1; i >= 0; i--) {
            if (predicate(as[i])) {
                return Option_1.some(as[i]);
            }
        }
        return Option_1.none;
    };
}
exports.findLast = findLast;
/**
 * Find the last element returned by an option based selector function
 *
 * @example
 * import { findLastMap } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * interface Person {
 *   name: string
 *   age?: number
 * }
 *
 * const persons: ReadonlyArray<Person> = [{ name: 'John' }, { name: 'Mary', age: 45 }, { name: 'Joey', age: 28 }]
 *
 * // returns the name of the last person that has an age
 * assert.deepStrictEqual(findLastMap((p: Person) => (p.age === undefined ? none : some(p.name)))(persons), some('Joey'))
 *
 * @since 2.5.0
 */
function findLastMap(f) {
    return function (as) {
        var len = as.length;
        for (var i = len - 1; i >= 0; i--) {
            var v = f(as[i]);
            if (Option_1.isSome(v)) {
                return v;
            }
        }
        return Option_1.none;
    };
}
exports.findLastMap = findLastMap;
/**
 * Returns the index of the last element of the list which matches the predicate
 *
 * @example
 * import { findLastIndex } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * interface X {
 *   a: number
 *   b: number
 * }
 * const xs: ReadonlyArray<X> = [{ a: 1, b: 0 }, { a: 1, b: 1 }]
 * assert.deepStrictEqual(findLastIndex((x: { a: number }) => x.a === 1)(xs), some(1))
 * assert.deepStrictEqual(findLastIndex((x: { a: number }) => x.a === 4)(xs), none)
 *
 *
 * @since 2.5.0
 */
function findLastIndex(predicate) {
    return function (as) {
        var len = as.length;
        for (var i = len - 1; i >= 0; i--) {
            if (predicate(as[i])) {
                return Option_1.some(i);
            }
        }
        return Option_1.none;
    };
}
exports.findLastIndex = findLastIndex;
/**
 * Insert an element at the specified index, creating a new array, or returning `None` if the index is out of bounds
 *
 * @example
 * import { insertAt } from 'fp-ts/ReadonlyArray'
 * import { some } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(insertAt(2, 5)([1, 2, 3, 4]), some([1, 2, 5, 3, 4]))
 *
 * @since 2.5.0
 */
function insertAt(i, a) {
    return function (as) { return (i < 0 || i > as.length ? Option_1.none : Option_1.some(unsafeInsertAt(i, a, as))); };
}
exports.insertAt = insertAt;
/**
 * Change the element at the specified index, creating a new array, or returning `None` if the index is out of bounds
 *
 * @example
 * import { updateAt } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(updateAt(1, 1)([1, 2, 3]), some([1, 1, 3]))
 * assert.deepStrictEqual(updateAt(1, 1)([]), none)
 *
 * @since 2.5.0
 */
function updateAt(i, a) {
    return function (as) { return (isOutOfBound(i, as) ? Option_1.none : Option_1.some(unsafeUpdateAt(i, a, as))); };
}
exports.updateAt = updateAt;
/**
 * Delete the element at the specified index, creating a new array, or returning `None` if the index is out of bounds
 *
 * @example
 * import { deleteAt } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(deleteAt(0)([1, 2, 3]), some([2, 3]))
 * assert.deepStrictEqual(deleteAt(1)([]), none)
 *
 * @since 2.5.0
 */
function deleteAt(i) {
    return function (as) { return (isOutOfBound(i, as) ? Option_1.none : Option_1.some(unsafeDeleteAt(i, as))); };
}
exports.deleteAt = deleteAt;
/**
 * Apply a function to the element at the specified index, creating a new array, or returning `None` if the index is out
 * of bounds
 *
 * @example
 * import { modifyAt } from 'fp-ts/ReadonlyArray'
 * import { some, none } from 'fp-ts/Option'
 *
 * const double = (x: number): number => x * 2
 * assert.deepStrictEqual(modifyAt(1, double)([1, 2, 3]), some([1, 4, 3]))
 * assert.deepStrictEqual(modifyAt(1, double)([]), none)
 *
 * @since 2.5.0
 */
function modifyAt(i, f) {
    return function (as) { return (isOutOfBound(i, as) ? Option_1.none : Option_1.some(unsafeUpdateAt(i, f(as[i]), as))); };
}
exports.modifyAt = modifyAt;
/**
 * Reverse an array, creating a new array
 *
 * @example
 * import { reverse } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(reverse([1, 2, 3]), [3, 2, 1])
 *
 * @category combinators
 * @since 2.5.0
 */
function reverse(as) {
    if (isEmpty(as)) {
        return as;
    }
    return as.slice().reverse();
}
exports.reverse = reverse;
/**
 * Extracts from an array of `Either` all the `Right` elements. All the `Right` elements are extracted in order
 *
 * @example
 * import { rights } from 'fp-ts/ReadonlyArray'
 * import { right, left } from 'fp-ts/Either'
 *
 * assert.deepStrictEqual(rights([right(1), left('foo'), right(2)]), [1, 2])
 *
 * @category combinators
 * @since 2.5.0
 */
function rights(as) {
    // tslint:disable-next-line: readonly-array
    var r = [];
    var len = as.length;
    for (var i = 0; i < len; i++) {
        var a = as[i];
        if (a._tag === 'Right') {
            r.push(a.right);
        }
    }
    return r;
}
exports.rights = rights;
/**
 * Extracts from an array of `Either` all the `Left` elements. All the `Left` elements are extracted in order
 *
 * @example
 * import { lefts } from 'fp-ts/ReadonlyArray'
 * import { left, right } from 'fp-ts/Either'
 *
 * assert.deepStrictEqual(lefts([right(1), left('foo'), right(2)]), ['foo'])
 *
 * @since 2.5.0
 */
function lefts(as) {
    // tslint:disable-next-line: readonly-array
    var r = [];
    var len = as.length;
    for (var i = 0; i < len; i++) {
        var a = as[i];
        if (a._tag === 'Left') {
            r.push(a.left);
        }
    }
    return r;
}
exports.lefts = lefts;
/**
 * Sort the elements of an array in increasing order, creating a new array
 *
 * @example
 * import { sort } from 'fp-ts/ReadonlyArray'
 * import { ordNumber } from 'fp-ts/Ord'
 *
 * assert.deepStrictEqual(sort(ordNumber)([3, 2, 1]), [1, 2, 3])
 *
 * @category combinators
 * @since 2.5.0
 */
exports.sort = function (O) { return function (as) {
    return isEmpty(as) ? as : as.slice().sort(O.compare);
}; };
// TODO: curry and make data-last in v3
/**
 * Apply a function to pairs of elements at the same index in two arrays, collecting the results in a new array. If one
 * input array is short, excess elements of the longer array are discarded.
 *
 * @example
 * import { zipWith } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(zipWith([1, 2, 3], ['a', 'b', 'c', 'd'], (n, s) => s + n), ['a1', 'b2', 'c3'])
 *
 * @category combinators
 * @since 2.5.0
 */
function zipWith(fa, fb, f) {
    // tslint:disable-next-line: readonly-array
    var fc = [];
    var len = Math.min(fa.length, fb.length);
    for (var i = 0; i < len; i++) {
        fc[i] = f(fa[i], fb[i]);
    }
    return fc;
}
exports.zipWith = zipWith;
function zip(as, bs) {
    if (bs === undefined) {
        return function (bs) { return zip(bs, as); };
    }
    return zipWith(as, bs, function (a, b) { return [a, b]; });
}
exports.zip = zip;
/**
 * The function is reverse of `zip`. Takes an array of pairs and return two corresponding arrays
 *
 * @example
 * import { unzip } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(unzip([[1, 'a'], [2, 'b'], [3, 'c']]), [[1, 2, 3], ['a', 'b', 'c']])
 *
 * @since 2.5.0
 */
function unzip(as) {
    // tslint:disable-next-line: readonly-array
    var fa = [];
    // tslint:disable-next-line: readonly-array
    var fb = [];
    for (var i = 0; i < as.length; i++) {
        fa[i] = as[i][0];
        fb[i] = as[i][1];
    }
    return [fa, fb];
}
exports.unzip = unzip;
/**
 * Rotate an array to the right by `n` steps
 *
 * @example
 * import { rotate } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(rotate(2)([1, 2, 3, 4, 5]), [4, 5, 1, 2, 3])
 *
 * @category combinators
 * @since 2.5.0
 */
function rotate(n) {
    return function (as) {
        var len = as.length;
        if (n === 0 || len <= 1 || len === Math.abs(n)) {
            return as;
        }
        else if (n < 0) {
            return rotate(len + n)(as);
        }
        else {
            return as.slice(-n).concat(as.slice(0, len - n));
        }
    };
}
exports.rotate = rotate;
function elem(E) {
    return function (a, as) {
        if (as === undefined) {
            var elemE_1 = elem(E);
            return function (as) { return elemE_1(a, as); };
        }
        var predicate = function (element) { return E.equals(element, a); };
        var i = 0;
        var len = as.length;
        for (; i < len; i++) {
            if (predicate(as[i])) {
                return true;
            }
        }
        return false;
    };
}
exports.elem = elem;
/**
 * Remove duplicates from an array, keeping the first occurrence of an element.
 *
 * @example
 * import { uniq } from 'fp-ts/ReadonlyArray'
 * import { eqNumber } from 'fp-ts/Eq'
 *
 * assert.deepStrictEqual(uniq(eqNumber)([1, 2, 1]), [1, 2])
 *
 * @category combinators
 * @since 2.5.0
 */
function uniq(E) {
    var elemS = elem(E);
    return function (as) {
        // tslint:disable-next-line: readonly-array
        var r = [];
        var len = as.length;
        var i = 0;
        for (; i < len; i++) {
            var a = as[i];
            if (!elemS(a, r)) {
                r.push(a);
            }
        }
        return len === r.length ? as : r;
    };
}
exports.uniq = uniq;
/**
 * Sort the elements of an array in increasing order, where elements are compared using first `ords[0]`, then `ords[1]`,
 * etc...
 *
 * @example
 * import { sortBy } from 'fp-ts/ReadonlyArray'
 * import { ord, ordString, ordNumber } from 'fp-ts/Ord'
 *
 * interface Person {
 *   name: string
 *   age: number
 * }
 * const byName = ord.contramap(ordString, (p: Person) => p.name)
 * const byAge = ord.contramap(ordNumber, (p: Person) => p.age)
 *
 * const sortByNameByAge = sortBy([byName, byAge])
 *
 * const persons = [{ name: 'a', age: 1 }, { name: 'b', age: 3 }, { name: 'c', age: 2 }, { name: 'b', age: 2 }]
 * assert.deepStrictEqual(sortByNameByAge(persons), [
 *   { name: 'a', age: 1 },
 *   { name: 'b', age: 2 },
 *   { name: 'b', age: 3 },
 *   { name: 'c', age: 2 }
 * ])
 *
 * @category combinators
 * @since 2.5.0
 */
function sortBy(ords) {
    var M = Ord_1.getMonoid();
    return exports.sort(ords.reduce(M.concat, M.empty));
}
exports.sortBy = sortBy;
/**
 * A useful recursion pattern for processing an array to produce a new array, often used for "chopping" up the input
 * array. Typically chop is called with some function that will consume an initial prefix of the array and produce a
 * value and the rest of the array.
 *
 * @example
 * import { Eq, eqNumber } from 'fp-ts/Eq'
 * import { chop, spanLeft } from 'fp-ts/ReadonlyArray'
 *
 * const group = <A>(S: Eq<A>): ((as: ReadonlyArray<A>) => ReadonlyArray<ReadonlyArray<A>>) => {
 *   return chop(as => {
 *     const { init, rest } = spanLeft((a: A) => S.equals(a, as[0]))(as)
 *     return [init, rest]
 *   })
 * }
 * assert.deepStrictEqual(group(eqNumber)([1, 1, 2, 3, 3, 4]), [[1, 1], [2], [3, 3], [4]])
 *
 * @category combinators
 * @since 2.5.0
 */
exports.chop = function (f) { return function (as) {
    // tslint:disable-next-line: readonly-array
    var result = [];
    var cs = as;
    while (isNonEmpty(cs)) {
        var _a = f(cs), b = _a[0], c = _a[1];
        result.push(b);
        cs = c;
    }
    return result;
}; };
/**
 * Splits an array into two pieces, the first piece has `n` elements.
 *
 * @example
 * import { splitAt } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(splitAt(2)([1, 2, 3, 4, 5]), [[1, 2], [3, 4, 5]])
 *
 * @since 2.5.0
 */
function splitAt(n) {
    return function (as) { return [as.slice(0, n), as.slice(n)]; };
}
exports.splitAt = splitAt;
/**
 * Splits an array into length-`n` pieces. The last piece will be shorter if `n` does not evenly divide the length of
 * the array. Note that `chunksOf(n)([])` is `[]`, not `[[]]`. This is intentional, and is consistent with a recursive
 * definition of `chunksOf`; it satisfies the property that
 *
 * ```ts
 * chunksOf(n)(xs).concat(chunksOf(n)(ys)) == chunksOf(n)(xs.concat(ys)))
 * ```
 *
 * whenever `n` evenly divides the length of `xs`.
 *
 * @example
 * import { chunksOf } from 'fp-ts/ReadonlyArray'
 *
 * assert.deepStrictEqual(chunksOf(2)([1, 2, 3, 4, 5]), [[1, 2], [3, 4], [5]])
 *
 *
 * @since 2.5.0
 */
function chunksOf(n) {
    var f = exports.chop(splitAt(n));
    return function (as) { return (as.length === 0 ? exports.empty : isOutOfBound(n - 1, as) ? [as] : f(as)); };
}
exports.chunksOf = chunksOf;
function comprehension(input, f, g) {
    if (g === void 0) { g = function () { return true; }; }
    var go = function (scope, input) {
        if (input.length === 0) {
            return g.apply(void 0, scope) ? [f.apply(void 0, scope)] : exports.empty;
        }
        else {
            return chain_(input[0], function (x) { return go(snoc(scope, x), input.slice(1)); });
        }
    };
    return go(exports.empty, input);
}
exports.comprehension = comprehension;
function union(E) {
    var elemE = elem(E);
    return function (xs, ys) {
        if (ys === undefined) {
            var unionE_1 = union(E);
            return function (ys) { return unionE_1(ys, xs); };
        }
        return concat(xs, ys.filter(function (a) { return !elemE(a, xs); }));
    };
}
exports.union = union;
function intersection(E) {
    var elemE = elem(E);
    return function (xs, ys) {
        if (ys === undefined) {
            var intersectionE_1 = intersection(E);
            return function (ys) { return intersectionE_1(ys, xs); };
        }
        return xs.filter(function (a) { return elemE(a, ys); });
    };
}
exports.intersection = intersection;
function difference(E) {
    var elemE = elem(E);
    return function (xs, ys) {
        if (ys === undefined) {
            var differenceE_1 = difference(E);
            return function (ys) { return differenceE_1(ys, xs); };
        }
        return xs.filter(function (a) { return !elemE(a, ys); });
    };
}
exports.difference = difference;
/**
 * @category Applicative
 * @since 2.5.0
 */
exports.of = function (a) { return [a]; };
/**
 * @category Alternative
 * @since 2.7.0
 */
exports.zero = function () { return exports.empty; };
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
var mapWithIndex_ = function (fa, f) { return function_1.pipe(fa, exports.mapWithIndex(f)); };
var ap_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var chain_ = function (ma, f) {
    return function_1.pipe(ma, exports.chain(f));
};
var filter_ = function (fa, predicate) { return function_1.pipe(fa, exports.filter(predicate)); };
var filterMap_ = function (fa, f) { return function_1.pipe(fa, exports.filterMap(f)); };
var partitionWithIndex_ = function (fa, predicateWithIndex) { return function_1.pipe(fa, exports.partitionWithIndex(predicateWithIndex)); };
var partition_ = function (fa, predicate) { return function_1.pipe(fa, exports.partition(predicate)); };
var partitionMap_ = function (fa, f) { return function_1.pipe(fa, exports.partitionMap(f)); };
var partitionMapWithIndex_ = function (fa, f) { return function_1.pipe(fa, exports.partitionMapWithIndex(f)); };
var alt_ = function (fa, that) { return function_1.pipe(fa, exports.alt(that)); };
var reduce_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduce(b, f)); };
var foldMap_ = function (M) {
    var foldMapM = exports.foldMap(M);
    return function (fa, f) { return function_1.pipe(fa, foldMapM(f)); };
};
var reduceRight_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduceRight(b, f)); };
var reduceWithIndex_ = function (fa, b, f) {
    var l = fa.length;
    var r = b;
    for (var i = 0; i < l; i++) {
        r = f(i, r, fa[i]);
    }
    return r;
};
var foldMapWithIndex_ = function (M) { return function (fa, f) {
    return fa.reduce(function (b, a, i) { return M.concat(b, f(i, a)); }, M.empty);
}; };
var reduceRightWithIndex_ = function (fa, b, f) {
    return function_1.pipe(fa, exports.reduceRightWithIndex(b, f));
};
var filterMapWithIndex_ = function (fa, f) {
    return function_1.pipe(fa, exports.filterMapWithIndex(f));
};
var filterWithIndex_ = function (fa, predicateWithIndex) { return function_1.pipe(fa, exports.filterWithIndex(predicateWithIndex)); };
var extend_ = function (fa, f) { return function_1.pipe(fa, exports.extend(f)); };
var traverse_ = function (F) {
    var traverseF = exports.traverse(F);
    return function (ta, f) { return function_1.pipe(ta, traverseF(f)); };
};
/* istanbul ignore next */
var traverseWithIndex_ = function (F) {
    var traverseWithIndexF = exports.traverseWithIndex(F);
    return function (ta, f) { return function_1.pipe(ta, traverseWithIndexF(f)); };
};
/* istanbul ignore next */
var wither_ = function (F) {
    var witherF = exports.wither(F);
    return function (fa, f) { return function_1.pipe(fa, witherF(f)); };
};
/* istanbul ignore next */
var wilt_ = function (F) {
    var wiltF = exports.wilt(F);
    return function (fa, f) { return function_1.pipe(fa, wiltF(f)); };
};
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.5.0
 */
exports.alt = function (that) { return function (fa) {
    return concat(fa, that());
}; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.5.0
 */
exports.ap = function (fa) {
    return exports.chain(function (f) { return function_1.pipe(fa, exports.map(f)); });
};
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.5.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.5.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.5.0
 */
exports.chain = function (f) { return function (ma) {
    return function_1.pipe(ma, exports.chainWithIndex(function (_, a) { return f(a); }));
}; };
/**
 * @since 2.7.0
 */
exports.chainWithIndex = function (f) { return function (ma) {
    var outLen = 0;
    var l = ma.length;
    var temp = new Array(l);
    for (var i = 0; i < l; i++) {
        var e = ma[i];
        var arr = f(i, e);
        outLen += arr.length;
        temp[i] = arr;
    }
    var out = Array(outLen);
    var start = 0;
    for (var i = 0; i < l; i++) {
        var arr = temp[i];
        var l_1 = arr.length;
        for (var j = 0; j < l_1; j++) {
            out[j + start] = arr[j];
        }
        start += l_1;
    }
    return out;
}; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.5.0
 */
exports.chainFirst = function (f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.5.0
 */
exports.map = function (f) { return function (fa) {
    return fa.map(function (a) { return f(a); });
}; };
/**
 * @category FunctorWithIndex
 * @since 2.5.0
 */
exports.mapWithIndex = function (f) { return function (fa) { return fa.map(function (a, i) { return f(i, a); }); }; };
/**
 * @category Compactable
 * @since 2.5.0
 */
exports.separate = function (fa) {
    // tslint:disable-next-line: readonly-array
    var left = [];
    // tslint:disable-next-line: readonly-array
    var right = [];
    for (var _i = 0, fa_1 = fa; _i < fa_1.length; _i++) {
        var e = fa_1[_i];
        if (e._tag === 'Left') {
            left.push(e.left);
        }
        else {
            right.push(e.right);
        }
    }
    return {
        left: left,
        right: right
    };
};
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.filter = function (predicate) { return function (fa) { return fa.filter(predicate); }; };
/**
 * @category FilterableWithIndex
 * @since 2.5.0
 */
exports.filterMapWithIndex = function (f) { return function (fa) {
    // tslint:disable-next-line: readonly-array
    var result = [];
    for (var i = 0; i < fa.length; i++) {
        var optionB = f(i, fa[i]);
        if (Option_1.isSome(optionB)) {
            result.push(optionB.value);
        }
    }
    return result;
}; };
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.filterMap = function (f) {
    return exports.filterMapWithIndex(function (_, a) { return f(a); });
};
/**
 * @category Compactable
 * @since 2.5.0
 */
exports.compact = 
/*#__PURE__*/
exports.filterMap(function_1.identity);
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.partition = function (predicate) {
    return exports.partitionWithIndex(function (_, a) { return predicate(a); });
};
/**
 * @category FilterableWithIndex
 * @since 2.5.0
 */
exports.partitionWithIndex = function (predicateWithIndex) { return function (fa) {
    // tslint:disable-next-line: readonly-array
    var left = [];
    // tslint:disable-next-line: readonly-array
    var right = [];
    for (var i = 0; i < fa.length; i++) {
        var a = fa[i];
        if (predicateWithIndex(i, a)) {
            right.push(a);
        }
        else {
            left.push(a);
        }
    }
    return {
        left: left,
        right: right
    };
}; };
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.partitionMap = function (f) {
    return exports.partitionMapWithIndex(function (_, a) { return f(a); });
};
/**
 * @category FilterableWithIndex
 * @since 2.5.0
 */
exports.partitionMapWithIndex = function (f) { return function (fa) {
    // tslint:disable-next-line: readonly-array
    var left = [];
    // tslint:disable-next-line: readonly-array
    var right = [];
    for (var i = 0; i < fa.length; i++) {
        var e = f(i, fa[i]);
        if (e._tag === 'Left') {
            left.push(e.left);
        }
        else {
            right.push(e.right);
        }
    }
    return {
        left: left,
        right: right
    };
}; };
/**
 * @category FilterableWithIndex
 * @since 2.5.0
 */
exports.filterWithIndex = function (predicateWithIndex) { return function (fa) {
    return fa.filter(function (a, i) { return predicateWithIndex(i, a); });
}; };
/**
 * @category Extend
 * @since 2.5.0
 */
exports.extend = function (f) { return function (wa) { return wa.map(function (_, i, as) { return f(as.slice(i)); }); }; };
/**
 * @category Extend
 * @since 2.5.0
 */
exports.duplicate = 
/*#__PURE__*/
exports.extend(function_1.identity);
/**
 * @category FoldableWithIndex
 * @since 2.5.0
 */
exports.foldMapWithIndex = function (M) {
    var foldMapWithIndexM = foldMapWithIndex_(M);
    return function (f) { return function (fa) { return foldMapWithIndexM(fa, f); }; };
};
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.reduce = function (b, f) {
    return exports.reduceWithIndex(b, function (_, b, a) { return f(b, a); });
};
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.foldMap = function (M) {
    var foldMapWithIndexM = exports.foldMapWithIndex(M);
    return function (f) { return foldMapWithIndexM(function (_, a) { return f(a); }); };
};
/**
 * @category FoldableWithIndex
 * @since 2.5.0
 */
exports.reduceWithIndex = function (b, f) { return function (fa) { return reduceWithIndex_(fa, b, f); }; };
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.reduceRight = function (b, f) {
    return exports.reduceRightWithIndex(b, function (_, a, b) { return f(a, b); });
};
/**
 * @category FoldableWithIndex
 * @since 2.5.0
 */
exports.reduceRightWithIndex = function (b, f) { return function (fa) { return fa.reduceRight(function (b, a, i) { return f(i, a, b); }, b); }; };
/**
 * @category Traversable
 * @since 2.6.3
 */
exports.traverse = function (F) {
    var traverseWithIndexF = exports.traverseWithIndex(F);
    return function (f) { return traverseWithIndexF(function (_, a) { return f(a); }); };
};
/**
 * @category Traversable
 * @since 2.6.3
 */
exports.sequence = function (F) { return function (ta) {
    return reduce_(ta, F.of(exports.zero()), function (fas, fa) {
        return F.ap(F.map(fas, function (as) { return function (a) { return snoc(as, a); }; }), fa);
    });
}; };
/**
 * @category TraversableWithIndex
 * @since 2.6.3
 */
exports.traverseWithIndex = function (F) { return function (f) {
    return exports.reduceWithIndex(F.of(exports.zero()), function (i, fbs, a) {
        return F.ap(F.map(fbs, function (bs) { return function (b) { return snoc(bs, b); }; }), f(i, a));
    });
}; };
/**
 * @category Witherable
 * @since 2.6.5
 */
exports.wither = function (F) {
    var traverseF = exports.traverse(F);
    return function (f) { return function (fa) { return F.map(function_1.pipe(fa, traverseF(f)), exports.compact); }; };
};
/**
 * @category Witherable
 * @since 2.6.5
 */
exports.wilt = function (F) {
    var traverseF = exports.traverse(F);
    return function (f) { return function (fa) { return F.map(function_1.pipe(fa, traverseF(f)), exports.separate); }; };
};
/**
 * @category Unfoldable
 * @since 2.6.6
 */
exports.unfold = function (b, f) {
    // tslint:disable-next-line: readonly-array
    var ret = [];
    var bb = b;
    while (true) {
        var mt = f(bb);
        if (Option_1.isSome(mt)) {
            var _a = mt.value, a = _a[0], b_1 = _a[1];
            ret.push(a);
            bb = b_1;
        }
        else {
            break;
        }
    }
    return ret;
};
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.5.0
 */
exports.URI = 'ReadonlyArray';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FunctorWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Unfoldable = {
    URI: exports.URI,
    unfold: exports.unfold
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alternative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    alt: alt_,
    zero: exports.zero
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Extend = {
    URI: exports.URI,
    map: map_,
    extend: extend_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Compactable = {
    URI: exports.URI,
    compact: exports.compact,
    separate: exports.separate
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Filterable = {
    URI: exports.URI,
    map: map_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FilterableWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    partitionMapWithIndex: partitionMapWithIndex_,
    partitionWithIndex: partitionWithIndex_,
    filterMapWithIndex: filterMapWithIndex_,
    filterWithIndex: filterWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FoldableWithIndex = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.TraversableWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    traverse: traverse_,
    sequence: exports.sequence,
    traverseWithIndex: traverseWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Witherable = {
    URI: exports.URI,
    map: map_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    wither: wither_,
    wilt: wilt_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.5.0
 */
exports.readonlyArray = {
    URI: exports.URI,
    compact: exports.compact,
    separate: exports.separate,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    mapWithIndex: mapWithIndex_,
    partitionMapWithIndex: partitionMapWithIndex_,
    partitionWithIndex: partitionWithIndex_,
    filterMapWithIndex: filterMapWithIndex_,
    filterWithIndex: filterWithIndex_,
    alt: alt_,
    zero: exports.zero,
    unfold: exports.unfold,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    traverseWithIndex: traverseWithIndex_,
    extend: extend_,
    wither: wither_,
    wilt: wilt_
};
// -------------------------------------------------------------------------------------
// unsafe
// -------------------------------------------------------------------------------------
/**
 * @category unsafe
 * @since 2.5.0
 */
function unsafeInsertAt(i, a, as) {
    var xs = as.slice();
    xs.splice(i, 0, a);
    return xs;
}
exports.unsafeInsertAt = unsafeInsertAt;
/**
 * @category unsafe
 * @since 2.5.0
 */
function unsafeUpdateAt(i, a, as) {
    if (as[i] === a) {
        return as;
    }
    else {
        var xs = as.slice();
        xs[i] = a;
        return xs;
    }
}
exports.unsafeUpdateAt = unsafeUpdateAt;
/**
 * @category unsafe
 * @since 2.5.0
 */
function unsafeDeleteAt(i, as) {
    var xs = as.slice();
    xs.splice(i, 1);
    return xs;
}
exports.unsafeDeleteAt = unsafeDeleteAt;
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * An empty array
 *
 * @since 2.5.0
 */
exports.empty = [];
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) {
    return exports.map(function_1.bindTo_(name));
};
/**
 * @since 2.8.0
 */
exports.bind = function (name, f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apS = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.ap(fb));
};


/***/ }),

/***/ 1961:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.readonlyMap = exports.Filterable = exports.Compactable = exports.Functor = exports.getWitherable = exports.getFilterableWithIndex = exports.URI = exports.separate = exports.partitionMap = exports.partition = exports.mapWithIndex = exports.map = exports.filterMap = exports.filter = exports.compact = exports.fromFoldable = exports.singleton = exports.getMonoid = exports.getEq = exports.empty = exports.isSubmap = exports.lookup = exports.lookupWithKey = exports.pop = exports.modifyAt = exports.updateAt = exports.deleteAt = exports.insertAt = exports.toUnfoldable = exports.toReadonlyArray = exports.collect = exports.values = exports.keys = exports.elem = exports.member = exports.isEmpty = exports.size = exports.getShow = exports.toMap = exports.fromMap = void 0;
var Either_1 = __webpack_require__(7534);
var Eq_1 = __webpack_require__(6964);
var function_1 = __webpack_require__(6985);
var O = __importStar(__webpack_require__(2569));
/**
 * @category constructors
 * @since 2.5.0
 */
function fromMap(m) {
    return new Map(m);
}
exports.fromMap = fromMap;
/**
 * @category destructors
 * @since 2.5.0
 */
function toMap(m) {
    return new Map(m);
}
exports.toMap = toMap;
/**
 * @category instances
 * @since 2.5.0
 */
function getShow(SK, SA) {
    return {
        show: function (m) {
            var elements = '';
            m.forEach(function (a, k) {
                elements += "[" + SK.show(k) + ", " + SA.show(a) + "], ";
            });
            if (elements !== '') {
                elements = elements.substring(0, elements.length - 2);
            }
            return "new Map([" + elements + "])";
        }
    };
}
exports.getShow = getShow;
/**
 * Calculate the number of key/value pairs in a map
 *
 * @since 2.5.0
 */
function size(d) {
    return d.size;
}
exports.size = size;
/**
 * Test whether or not a map is empty
 *
 * @since 2.5.0
 */
function isEmpty(d) {
    return d.size === 0;
}
exports.isEmpty = isEmpty;
function member(E) {
    var lookupE = lookup(E);
    return function (k, m) {
        if (m === undefined) {
            var memberE_1 = member(E);
            return function (m) { return memberE_1(k, m); };
        }
        return O.isSome(lookupE(k, m));
    };
}
exports.member = member;
function elem(E) {
    return function (a, m) {
        if (m === undefined) {
            var elemE_1 = elem(E);
            return function (m) { return elemE_1(a, m); };
        }
        var values = m.values();
        var e;
        // tslint:disable-next-line: strict-boolean-expressions
        while (!(e = values.next()).done) {
            var v = e.value;
            if (E.equals(a, v)) {
                return true;
            }
        }
        return false;
    };
}
exports.elem = elem;
/**
 * Get a sorted array of the keys contained in a map
 *
 * @since 2.5.0
 */
function keys(O) {
    return function (m) { return Array.from(m.keys()).sort(O.compare); };
}
exports.keys = keys;
/**
 * Get a sorted array of the values contained in a map
 *
 * @since 2.5.0
 */
function values(O) {
    return function (m) { return Array.from(m.values()).sort(O.compare); };
}
exports.values = values;
/**
 * @since 2.5.0
 */
function collect(O) {
    var keysO = keys(O);
    return function (f) { return function (m) {
        // tslint:disable-next-line: readonly-array
        var out = [];
        var ks = keysO(m);
        for (var _i = 0, ks_1 = ks; _i < ks_1.length; _i++) {
            var key = ks_1[_i];
            out.push(f(key, m.get(key)));
        }
        return out;
    }; };
}
exports.collect = collect;
/**
 * Get a sorted of the key/value pairs contained in a map
 *
 * @category destructors
 * @since 2.5.0
 */
function toReadonlyArray(O) {
    return collect(O)(function (k, a) { return [k, a]; });
}
exports.toReadonlyArray = toReadonlyArray;
function toUnfoldable(ord, U) {
    var toArrayO = toReadonlyArray(ord);
    return function (d) {
        var arr = toArrayO(d);
        var len = arr.length;
        return U.unfold(0, function (b) { return (b < len ? O.some([arr[b], b + 1]) : O.none); });
    };
}
exports.toUnfoldable = toUnfoldable;
/**
 * Insert or replace a key/value pair in a map
 *
 * @category combinators
 * @since 2.5.0
 */
function insertAt(E) {
    var lookupWithKeyE = lookupWithKey(E);
    return function (k, a) { return function (m) {
        var found = lookupWithKeyE(k, m);
        if (O.isNone(found)) {
            var r = new Map(m);
            r.set(k, a);
            return r;
        }
        else if (found.value[1] !== a) {
            var r = new Map(m);
            r.set(found.value[0], a);
            return r;
        }
        return m;
    }; };
}
exports.insertAt = insertAt;
/**
 * Delete a key and value from a map
 *
 * @category combinators
 * @since 2.5.0
 */
function deleteAt(E) {
    var lookupWithKeyE = lookupWithKey(E);
    return function (k) { return function (m) {
        var found = lookupWithKeyE(k, m);
        if (O.isSome(found)) {
            var r = new Map(m);
            r.delete(found.value[0]);
            return r;
        }
        return m;
    }; };
}
exports.deleteAt = deleteAt;
/**
 * @since 2.5.0
 */
function updateAt(E) {
    var lookupWithKeyE = lookupWithKey(E);
    return function (k, a) { return function (m) {
        var found = lookupWithKeyE(k, m);
        if (O.isNone(found)) {
            return O.none;
        }
        var r = new Map(m);
        r.set(found.value[0], a);
        return O.some(r);
    }; };
}
exports.updateAt = updateAt;
/**
 * @since 2.5.0
 */
function modifyAt(E) {
    var lookupWithKeyE = lookupWithKey(E);
    return function (k, f) { return function (m) {
        var found = lookupWithKeyE(k, m);
        if (O.isNone(found)) {
            return O.none;
        }
        var r = new Map(m);
        r.set(found.value[0], f(found.value[1]));
        return O.some(r);
    }; };
}
exports.modifyAt = modifyAt;
/**
 * Delete a key and value from a map, returning the value as well as the subsequent map
 *
 * @since 2.5.0
 */
function pop(E) {
    var lookupE = lookup(E);
    var deleteAtE = deleteAt(E);
    return function (k) {
        var deleteAtEk = deleteAtE(k);
        return function (m) {
            return function_1.pipe(lookupE(k, m), O.map(function (a) { return [a, deleteAtEk(m)]; }));
        };
    };
}
exports.pop = pop;
function lookupWithKey(E) {
    return function (k, m) {
        if (m === undefined) {
            var lookupWithKeyE_1 = lookupWithKey(E);
            return function (m) { return lookupWithKeyE_1(k, m); };
        }
        var entries = m.entries();
        var e;
        // tslint:disable-next-line: strict-boolean-expressions
        while (!(e = entries.next()).done) {
            var _a = e.value, ka = _a[0], a = _a[1];
            if (E.equals(ka, k)) {
                return O.some([ka, a]);
            }
        }
        return O.none;
    };
}
exports.lookupWithKey = lookupWithKey;
function lookup(E) {
    var lookupWithKeyE = lookupWithKey(E);
    return function (k, m) {
        if (m === undefined) {
            var lookupE_1 = lookup(E);
            return function (m) { return lookupE_1(k, m); };
        }
        return function_1.pipe(lookupWithKeyE(k, m), O.map(function (_a) {
            var _ = _a[0], a = _a[1];
            return a;
        }));
    };
}
exports.lookup = lookup;
function isSubmap(SK, SA) {
    var lookupWithKeyS = lookupWithKey(SK);
    return function (me, that) {
        if (that === undefined) {
            var isSubmapSKSA_1 = isSubmap(SK, SA);
            return function (that) { return isSubmapSKSA_1(that, me); };
        }
        var entries = me.entries();
        var e;
        // tslint:disable-next-line: strict-boolean-expressions
        while (!(e = entries.next()).done) {
            var _a = e.value, k = _a[0], a = _a[1];
            var d2OptA = lookupWithKeyS(k, that);
            if (O.isNone(d2OptA) || !SK.equals(k, d2OptA.value[0]) || !SA.equals(a, d2OptA.value[1])) {
                return false;
            }
        }
        return true;
    };
}
exports.isSubmap = isSubmap;
/**
 * @since 2.5.0
 */
exports.empty = new Map();
/**
 * @category instances
 * @since 2.5.0
 */
function getEq(SK, SA) {
    var isSubmap_ = isSubmap(SK, SA);
    return Eq_1.fromEquals(function (x, y) { return isSubmap_(x, y) && isSubmap_(y, x); });
}
exports.getEq = getEq;
/**
 * Gets `Monoid` instance for Maps given `Semigroup` instance for their values
 *
 * @category instances
 * @since 2.5.0
 */
function getMonoid(SK, SA) {
    var lookupWithKeyS = lookupWithKey(SK);
    return {
        concat: function (mx, my) {
            if (mx === exports.empty) {
                return my;
            }
            if (my === exports.empty) {
                return mx;
            }
            var r = new Map(mx);
            var entries = my.entries();
            var e;
            // tslint:disable-next-line: strict-boolean-expressions
            while (!(e = entries.next()).done) {
                var _a = e.value, k = _a[0], a = _a[1];
                var mxOptA = lookupWithKeyS(k, mx);
                if (O.isSome(mxOptA)) {
                    r.set(mxOptA.value[0], SA.concat(mxOptA.value[1], a));
                }
                else {
                    r.set(k, a);
                }
            }
            return r;
        },
        empty: exports.empty
    };
}
exports.getMonoid = getMonoid;
/**
 * Create a map with one key/value pair
 *
 * @category constructors
 * @since 2.5.0
 */
function singleton(k, a) {
    return new Map([[k, a]]);
}
exports.singleton = singleton;
function fromFoldable(E, M, F) {
    return function (fka) {
        var lookupWithKeyE = lookupWithKey(E);
        return F.reduce(fka, new Map(), function (b, _a) {
            var k = _a[0], a = _a[1];
            var bOpt = lookupWithKeyE(k, b);
            if (O.isSome(bOpt)) {
                b.set(bOpt.value[0], M.concat(bOpt.value[1], a));
            }
            else {
                b.set(k, a);
            }
            return b;
        });
    };
}
exports.fromFoldable = fromFoldable;
var mapWithIndex_ = function (fa, f) {
    var m = new Map();
    var entries = fa.entries();
    var e;
    // tslint:disable-next-line: strict-boolean-expressions
    while (!(e = entries.next()).done) {
        var _a = e.value, key = _a[0], a = _a[1];
        m.set(key, f(key, a));
    }
    return m;
};
var partitionMapWithIndex_ = function (fa, f) {
    var left = new Map();
    var right = new Map();
    var entries = fa.entries();
    var e;
    // tslint:disable-next-line: strict-boolean-expressions
    while (!(e = entries.next()).done) {
        var _a = e.value, k = _a[0], a = _a[1];
        var ei = f(k, a);
        if (Either_1.isLeft(ei)) {
            left.set(k, ei.left);
        }
        else {
            right.set(k, ei.right);
        }
    }
    return {
        left: left,
        right: right
    };
};
var partitionWithIndex_ = function (fa, p) {
    var left = new Map();
    var right = new Map();
    var entries = fa.entries();
    var e;
    // tslint:disable-next-line: strict-boolean-expressions
    while (!(e = entries.next()).done) {
        var _a = e.value, k = _a[0], a = _a[1];
        if (p(k, a)) {
            right.set(k, a);
        }
        else {
            left.set(k, a);
        }
    }
    return {
        left: left,
        right: right
    };
};
var filterMapWithIndex_ = function (fa, f) {
    var m = new Map();
    var entries = fa.entries();
    var e;
    // tslint:disable-next-line: strict-boolean-expressions
    while (!(e = entries.next()).done) {
        var _a = e.value, k = _a[0], a = _a[1];
        var o = f(k, a);
        if (O.isSome(o)) {
            m.set(k, o.value);
        }
    }
    return m;
};
var filterWithIndex_ = function (fa, p) {
    var m = new Map();
    var entries = fa.entries();
    var e;
    // tslint:disable-next-line: strict-boolean-expressions
    while (!(e = entries.next()).done) {
        var _a = e.value, k = _a[0], a = _a[1];
        if (p(k, a)) {
            m.set(k, a);
        }
    }
    return m;
};
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return mapWithIndex_(fa, function (_, a) { return f(a); }); };
var filter_ = function (fa, p) {
    return filterWithIndex_(fa, function (_, a) { return p(a); });
};
var filterMap_ = function (fa, f) { return filterMapWithIndex_(fa, function (_, a) { return f(a); }); };
var partition_ = function (fa, predicate) { return partitionWithIndex_(fa, function (_, a) { return predicate(a); }); };
var partitionMap_ = function (fa, f) { return partitionMapWithIndex_(fa, function (_, a) { return f(a); }); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Compactable
 * @since 2.5.0
 */
exports.compact = function (fa) {
    var m = new Map();
    var entries = fa.entries();
    var e;
    // tslint:disable-next-line: strict-boolean-expressions
    while (!(e = entries.next()).done) {
        var _a = e.value, k = _a[0], oa = _a[1];
        if (O.isSome(oa)) {
            m.set(k, oa.value);
        }
    }
    return m;
};
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.filter = function (predicate) { return function (fa) { return filter_(fa, predicate); }; };
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.filterMap = function (f) { return function (fa) { return filterMap_(fa, f); }; };
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.5.0
 */
exports.map = function (f) { return function (fa) { return map_(fa, f); }; };
/**
 * @category FunctorWithIndex
 * @since 2.7.1
 */
exports.mapWithIndex = function (f) { return function (fa) { return mapWithIndex_(fa, f); }; };
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.partition = function (predicate) { return function (fa) { return partition_(fa, predicate); }; };
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.partitionMap = function (f) { return function (fa) { return partitionMap_(fa, f); }; };
/**
 * @category Compactable
 * @since 2.5.0
 */
exports.separate = function (fa) {
    var left = new Map();
    var right = new Map();
    var entries = fa.entries();
    var e;
    // tslint:disable-next-line: strict-boolean-expressions
    while (!(e = entries.next()).done) {
        var _a = e.value, k = _a[0], ei = _a[1];
        if (Either_1.isLeft(ei)) {
            left.set(k, ei.left);
        }
        else {
            right.set(k, ei.right);
        }
    }
    return {
        left: left,
        right: right
    };
};
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.5.0
 */
exports.URI = 'ReadonlyMap';
/**
 * @category instances
 * @since 2.5.0
 */
function getFilterableWithIndex() {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        mapWithIndex: mapWithIndex_,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_,
        partitionMapWithIndex: partitionMapWithIndex_,
        partitionWithIndex: partitionWithIndex_,
        filterMapWithIndex: filterMapWithIndex_,
        filterWithIndex: filterWithIndex_
    };
}
exports.getFilterableWithIndex = getFilterableWithIndex;
/**
 * @category instances
 * @since 2.5.0
 */
function getWitherable(O) {
    var keysO = keys(O);
    var reduceWithIndex = function (fa, b, f) {
        var out = b;
        var ks = keysO(fa);
        var len = ks.length;
        for (var i = 0; i < len; i++) {
            var k = ks[i];
            out = f(k, out, fa.get(k));
        }
        return out;
    };
    var foldMapWithIndex = function (M) { return function (fa, f) {
        var out = M.empty;
        var ks = keysO(fa);
        var len = ks.length;
        for (var i = 0; i < len; i++) {
            var k = ks[i];
            out = M.concat(out, f(k, fa.get(k)));
        }
        return out;
    }; };
    var reduceRightWithIndex = function (fa, b, f) {
        var out = b;
        var ks = keysO(fa);
        var len = ks.length;
        for (var i = len - 1; i >= 0; i--) {
            var k = ks[i];
            out = f(k, fa.get(k), out);
        }
        return out;
    };
    var traverseWithIndex = function (F) {
        return function (ta, f) {
            var fm = F.of(exports.empty);
            var ks = keysO(ta);
            var len = ks.length;
            var _loop_1 = function (i) {
                var key = ks[i];
                var a = ta.get(key);
                fm = F.ap(F.map(fm, function (m) { return function (b) { return new Map(m).set(key, b); }; }), f(key, a));
            };
            for (var i = 0; i < len; i++) {
                _loop_1(i);
            }
            return fm;
        };
    };
    var traverse = function (F) {
        var traverseWithIndexF = traverseWithIndex(F);
        return function (ta, f) { return traverseWithIndexF(ta, function (_, a) { return f(a); }); };
    };
    var sequence = function (F) {
        var traverseWithIndexF = traverseWithIndex(F);
        return function (ta) { return traverseWithIndexF(ta, function (_, a) { return a; }); };
    };
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        compact: exports.compact,
        separate: exports.separate,
        filter: filter_,
        filterMap: filterMap_,
        partition: partition_,
        partitionMap: partitionMap_,
        reduce: function (fa, b, f) { return reduceWithIndex(fa, b, function (_, b, a) { return f(b, a); }); },
        foldMap: function (M) {
            var foldMapWithIndexM = foldMapWithIndex(M);
            return function (fa, f) { return foldMapWithIndexM(fa, function (_, a) { return f(a); }); };
        },
        reduceRight: function (fa, b, f) { return reduceRightWithIndex(fa, b, function (_, a, b) { return f(a, b); }); },
        traverse: traverse,
        sequence: sequence,
        mapWithIndex: mapWithIndex_,
        reduceWithIndex: reduceWithIndex,
        foldMapWithIndex: foldMapWithIndex,
        reduceRightWithIndex: reduceRightWithIndex,
        traverseWithIndex: traverseWithIndex,
        wilt: function (F) {
            var traverseF = traverse(F);
            return function (wa, f) { return F.map(traverseF(wa, f), exports.separate); };
        },
        wither: function (F) {
            var traverseF = traverse(F);
            return function (wa, f) { return F.map(traverseF(wa, f), exports.compact); };
        }
    };
}
exports.getWitherable = getWitherable;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Compactable = {
    URI: exports.URI,
    compact: exports.compact,
    separate: exports.separate
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Filterable = {
    URI: exports.URI,
    map: map_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.5.0
 */
exports.readonlyMap = {
    URI: exports.URI,
    map: map_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_
};


/***/ }),

/***/ 8630:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.bind = exports.bindTo = exports.readonlyNonEmptyArray = exports.Comonad = exports.Alt = exports.TraversableWithIndex = exports.Traversable = exports.FoldableWithIndex = exports.Foldable = exports.Monad = exports.Applicative = exports.FunctorWithIndex = exports.Functor = exports.URI = exports.extract = exports.traverseWithIndex = exports.sequence = exports.traverse = exports.reduceRightWithIndex = exports.reduceRight = exports.reduceWithIndex = exports.reduce = exports.mapWithIndex = exports.map = exports.flatten = exports.extend = exports.duplicate = exports.chainFirst = exports.chain = exports.apSecond = exports.apFirst = exports.ap = exports.alt = exports.foldMap = exports.foldMapWithIndex = exports.unzip = exports.zip = exports.zipWith = exports.fold = exports.concat = exports.of = exports.filterWithIndex = exports.filter = exports.modifyAt = exports.updateAt = exports.insertAt = exports.sort = exports.init = exports.last = exports.groupBy = exports.groupSort = exports.group = exports.getEq = exports.getSemigroup = exports.max = exports.min = exports.reverse = exports.tail = exports.head = exports.getShow = exports.fromArray = exports.fromReadonlyArray = exports.snoc = exports.cons = void 0;
var function_1 = __webpack_require__(6985);
var Option_1 = __webpack_require__(2569);
var RA = __importStar(__webpack_require__(4234));
var Semigroup_1 = __webpack_require__(6339);
/**
 * Append an element to the front of an array, creating a new non empty array
 *
 * @example
 * import { cons } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(cons(1, [2, 3, 4]), [1, 2, 3, 4])
 *
 * @category constructors
 * @since 2.5.0
 */
exports.cons = RA.cons;
/**
 * Append an element to the end of an array, creating a new non empty array
 *
 * @example
 * import { snoc } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(snoc([1, 2, 3], 4), [1, 2, 3, 4])
 *
 * @category constructors
 * @since 2.5.0
 */
exports.snoc = RA.snoc;
/**
 * Builds a `ReadonlyNonEmptyArray` from an array returning `none` if `as` is an empty array
 *
 * @category constructors
 * @since 2.5.0
 */
function fromReadonlyArray(as) {
    return RA.isNonEmpty(as) ? Option_1.some(as) : Option_1.none;
}
exports.fromReadonlyArray = fromReadonlyArray;
/**
 * @category constructors
 * @since 2.5.0
 */
// tslint:disable-next-line: readonly-array
function fromArray(as) {
    return fromReadonlyArray(RA.fromArray(as));
}
exports.fromArray = fromArray;
/**
 * @category instances
 * @since 2.5.0
 */
exports.getShow = RA.getShow;
/**
 * @since 2.5.0
 */
function head(nea) {
    return nea[0];
}
exports.head = head;
/**
 * @since 2.5.0
 */
function tail(nea) {
    return nea.slice(1);
}
exports.tail = tail;
/**
 * @category combinators
 * @since 2.5.0
 */
exports.reverse = RA.reverse;
/**
 * @since 2.5.0
 */
function min(ord) {
    var S = Semigroup_1.getMeetSemigroup(ord);
    return function (nea) { return nea.reduce(S.concat); };
}
exports.min = min;
/**
 * @since 2.5.0
 */
function max(ord) {
    var S = Semigroup_1.getJoinSemigroup(ord);
    return function (nea) { return nea.reduce(S.concat); };
}
exports.max = max;
/**
 * Builds a `Semigroup` instance for `ReadonlyNonEmptyArray`
 *
 * @category instances
 * @since 2.5.0
 */
function getSemigroup() {
    return {
        concat: concat
    };
}
exports.getSemigroup = getSemigroup;
/**
 * @example
 * import { getEq, cons } from 'fp-ts/ReadonlyNonEmptyArray'
 * import { eqNumber } from 'fp-ts/Eq'
 *
 * const E = getEq(eqNumber)
 * assert.strictEqual(E.equals(cons(1, [2]), [1, 2]), true)
 * assert.strictEqual(E.equals(cons(1, [2]), [1, 3]), false)
 *
 * @category instances
 * @since 2.5.0
 */
exports.getEq = RA.getEq;
function group(E) {
    return function (as) {
        var len = as.length;
        if (len === 0) {
            return RA.empty;
        }
        // tslint:disable-next-line: readonly-array
        var r = [];
        var head = as[0];
        var nea = [head];
        for (var i = 1; i < len; i++) {
            var x = as[i];
            if (E.equals(x, head)) {
                nea.push(x);
            }
            else {
                r.push(nea);
                head = x;
                nea = [head];
            }
        }
        r.push(nea);
        return r;
    };
}
exports.group = group;
function groupSort(O) {
    var sortO = RA.sort(O);
    var groupO = group(O);
    return function (as) { return groupO(sortO(as)); };
}
exports.groupSort = groupSort;
/**
 * Splits an array into sub-non-empty-arrays stored in an object, based on the result of calling a `string`-returning
 * function on each element, and grouping the results according to values returned
 *
 * @example
 * import { cons, groupBy } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(groupBy((s: string) => String(s.length))(['foo', 'bar', 'foobar']), {
 *   '3': cons('foo', ['bar']),
 *   '6': cons('foobar', [])
 * })
 *
 * @category constructors
 * @since 2.5.0
 */
function groupBy(f) {
    return function (as) {
        var r = {};
        for (var _i = 0, as_1 = as; _i < as_1.length; _i++) {
            var a = as_1[_i];
            var k = f(a);
            if (r.hasOwnProperty(k)) {
                r[k].push(a);
            }
            else {
                r[k] = [a];
            }
        }
        return r;
    };
}
exports.groupBy = groupBy;
/**
 * @since 2.5.0
 */
function last(nea) {
    return nea[nea.length - 1];
}
exports.last = last;
/**
 * Get all but the last element of a non empty array, creating a new array.
 *
 * @example
 * import { init } from 'fp-ts/ReadonlyNonEmptyArray'
 *
 * assert.deepStrictEqual(init([1, 2, 3]), [1, 2])
 * assert.deepStrictEqual(init([1]), [])
 *
 * @since 2.5.0
 */
function init(nea) {
    return nea.slice(0, -1);
}
exports.init = init;
/**
 * @category combinators
 * @since 2.5.0
 */
function sort(O) {
    return RA.sort(O);
}
exports.sort = sort;
/**
 * @since 2.5.0
 */
function insertAt(i, a) {
    return RA.insertAt(i, a);
}
exports.insertAt = insertAt;
/**
 * @since 2.5.0
 */
function updateAt(i, a) {
    return RA.updateAt(i, a);
}
exports.updateAt = updateAt;
/**
 * @since 2.5.0
 */
function modifyAt(i, f) {
    return RA.modifyAt(i, f);
}
exports.modifyAt = modifyAt;
function filter(predicate) {
    return filterWithIndex(function (_, a) { return predicate(a); });
}
exports.filter = filter;
/**
 * @since 2.5.0
 */
function filterWithIndex(predicate) {
    return function (nea) { return fromReadonlyArray(nea.filter(function (a, i) { return predicate(i, a); })); };
}
exports.filterWithIndex = filterWithIndex;
/**
 * @category Applicative
 * @since 2.5.0
 */
exports.of = RA.of;
function concat(fx, fy) {
    return fx.concat(fy);
}
exports.concat = concat;
/**
 * @since 2.5.0
 */
function fold(S) {
    return function (fa) { return fa.reduce(S.concat); };
}
exports.fold = fold;
/**
 * @category combinators
 * @since 2.5.1
 */
exports.zipWith = RA.zipWith;
/**
 * @category combinators
 * @since 2.5.1
 */
exports.zip = RA.zip;
/**
 * @since 2.5.1
 */
exports.unzip = RA.unzip;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = RA.Functor.map;
var mapWithIndex_ = RA.FunctorWithIndex.mapWithIndex;
var ap_ = RA.Applicative.ap;
var chain_ = RA.Monad.chain;
var extend_ = RA.Extend.extend;
var reduce_ = RA.Foldable.reduce;
var foldMap_ = RA.Foldable.foldMap;
var reduceRight_ = RA.Foldable.reduceRight;
var traverse_ = RA.Traversable.traverse;
var alt_ = RA.Alt.alt;
var reduceWithIndex_ = RA.FoldableWithIndex.reduceWithIndex;
var foldMapWithIndex_ = RA.FoldableWithIndex
    .foldMapWithIndex;
var reduceRightWithIndex_ = RA.FoldableWithIndex
    .reduceRightWithIndex;
var traverseWithIndex_ = RA.TraversableWithIndex
    .traverseWithIndex;
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category FoldableWithIndex
 * @since 2.5.0
 */
exports.foldMapWithIndex = function (S) { return function (f) { return function (fa) { return fa.slice(1).reduce(function (s, a, i) { return S.concat(s, f(i + 1, a)); }, f(0, fa[0])); }; }; };
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.foldMap = function (S) { return function (f) { return function (fa) {
    return fa.slice(1).reduce(function (s, a) { return S.concat(s, f(a)); }, f(fa[0]));
}; }; };
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.6.2
 */
exports.alt = RA.alt;
/**
 * @category Apply
 * @since 2.5.0
 */
exports.ap = RA.ap;
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.5.0
 */
exports.apFirst = RA.apFirst;
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.5.0
 */
exports.apSecond = RA.apSecond;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.5.0
 */
exports.chain = RA.chain;
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.5.0
 */
exports.chainFirst = RA.chainFirst;
/**
 * @category Extend
 * @since 2.5.0
 */
exports.duplicate = RA.duplicate;
/**
 * @category Extend
 * @since 2.5.0
 */
exports.extend = RA.extend;
/**
 * @category Monad
 * @since 2.5.0
 */
exports.flatten = RA.flatten;
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.5.0
 */
exports.map = RA.map;
/**
 * @category FunctorWithIndex
 * @since 2.5.0
 */
exports.mapWithIndex = RA.mapWithIndex;
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.reduce = RA.reduce;
/**
 * @category FoldableWithIndex
 * @since 2.5.0
 */
exports.reduceWithIndex = RA.reduceWithIndex;
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.reduceRight = RA.reduceRight;
/**
 * @category FoldableWithIndex
 * @since 2.5.0
 */
exports.reduceRightWithIndex = RA.reduceRightWithIndex;
/**
 * @since 2.6.3
 */
exports.traverse = RA.traverse;
/**
 * @since 2.6.3
 */
exports.sequence = RA.sequence;
/**
 * @since 2.6.3
 */
exports.traverseWithIndex = RA.traverseWithIndex;
/**
 * @since 2.6.3
 */
exports.extract = head;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.5.0
 */
exports.URI = 'ReadonlyNonEmptyArray';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FunctorWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FoldableWithIndex = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.TraversableWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    traverseWithIndex: traverseWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Comonad = {
    URI: exports.URI,
    map: map_,
    extend: extend_,
    extract: exports.extract
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.5.0
 */
exports.readonlyNonEmptyArray = {
    URI: exports.URI,
    of: exports.of,
    map: map_,
    mapWithIndex: mapWithIndex_,
    ap: ap_,
    chain: chain_,
    extend: extend_,
    extract: exports.extract,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    traverseWithIndex: traverseWithIndex_,
    alt: alt_
};
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) { return exports.map(function_1.bindTo_(name)); };
/**
 * @since 2.8.0
 */
exports.bind = function (name, f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apS = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.ap(fb));
};


/***/ }),

/***/ 1897:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.readonlyRecord = exports.Witherable = exports.TraversableWithIndex = exports.Traversable = exports.FilterableWithIndex = exports.Filterable = exports.Compactable = exports.FoldableWithIndex = exports.Foldable = exports.FunctorWithIndex = exports.Functor = exports.URI = exports.separate = exports.compact = exports.reduceRight = exports.foldMap = exports.reduce = exports.partitionMap = exports.partition = exports.filterMap = exports.filter = exports.elem = exports.some = exports.every = exports.fromFoldableMap = exports.fromFoldable = exports.filterWithIndex = exports.filterMapWithIndex = exports.partitionWithIndex = exports.partitionMapWithIndex = exports.wilt = exports.wither = exports.sequence = exports.traverse = exports.traverseWithIndex = exports.singleton = exports.reduceRightWithIndex = exports.foldMapWithIndex = exports.reduceWithIndex = exports.map = exports.mapWithIndex = exports.empty = exports.lookup = exports.getMonoid = exports.getEq = exports.isSubrecord = exports.pop = exports.modifyAt = exports.updateAt = exports.deleteAt = exports.hasOwnProperty = exports.insertAt = exports.toUnfoldable = exports.toReadonlyArray = exports.collect = exports.keys = exports.isEmpty = exports.size = exports.getShow = exports.toRecord = exports.fromRecord = void 0;
var Eq_1 = __webpack_require__(6964);
var function_1 = __webpack_require__(6985);
var Option_1 = __webpack_require__(2569);
/**
 * @category constructors
 * @since 2.5.0
 */
function fromRecord(r) {
    return Object.assign({}, r);
}
exports.fromRecord = fromRecord;
/**
 * @category destructors
 * @since 2.5.0
 */
function toRecord(r) {
    return Object.assign({}, r);
}
exports.toRecord = toRecord;
/**
 * @category instances
 * @since 2.5.0
 */
function getShow(S) {
    return {
        show: function (r) {
            var elements = collect(function (k, a) { return JSON.stringify(k) + ": " + S.show(a); })(r).join(', ');
            return elements === '' ? '{}' : "{ " + elements + " }";
        }
    };
}
exports.getShow = getShow;
/**
 * Calculate the number of key/value pairs in a record
 *
 * @since 2.5.0
 */
function size(r) {
    return Object.keys(r).length;
}
exports.size = size;
/**
 * Test whether a record is empty
 *
 * @since 2.5.0
 */
function isEmpty(r) {
    return Object.keys(r).length === 0;
}
exports.isEmpty = isEmpty;
/**
 * @since 2.5.0
 */
function keys(r) {
    return Object.keys(r).sort();
}
exports.keys = keys;
/**
 * Map a record into an array
 *
 * @example
 * import {collect} from 'fp-ts/ReadonlyRecord'
 *
 * const x: { a: string, b: boolean } = { a: 'foo', b: false }
 * assert.deepStrictEqual(
 *   collect((key, val) => ({key: key, value: val}))(x),
 *   [{key: 'a', value: 'foo'}, {key: 'b', value: false}]
 * )
 *
 * @since 2.5.0
 */
function collect(f) {
    return function (r) {
        // tslint:disable-next-line: readonly-array
        var out = [];
        for (var _i = 0, _a = keys(r); _i < _a.length; _i++) {
            var key = _a[_i];
            out.push(f(key, r[key]));
        }
        return out;
    };
}
exports.collect = collect;
/**
 * @category destructors
 * @since 2.5.0
 */
exports.toReadonlyArray = collect(function (k, a) { return [k, a]; });
function toUnfoldable(U) {
    return function (r) {
        var arr = exports.toReadonlyArray(r);
        var len = arr.length;
        return U.unfold(0, function (b) { return (b < len ? Option_1.some([arr[b], b + 1]) : Option_1.none); });
    };
}
exports.toUnfoldable = toUnfoldable;
function insertAt(k, a) {
    return function (r) {
        if (r[k] === a) {
            return r;
        }
        var out = Object.assign({}, r);
        out[k] = a;
        return out;
    };
}
exports.insertAt = insertAt;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(k, r) {
    return _hasOwnProperty.call(r === undefined ? this : r, k);
}
exports.hasOwnProperty = hasOwnProperty;
function deleteAt(k) {
    return function (r) {
        if (!_hasOwnProperty.call(r, k)) {
            return r;
        }
        var out = Object.assign({}, r);
        delete out[k];
        return out;
    };
}
exports.deleteAt = deleteAt;
/**
 * @since 2.5.0
 */
function updateAt(k, a) {
    return function (r) {
        if (!hasOwnProperty(k, r)) {
            return Option_1.none;
        }
        if (r[k] === a) {
            return Option_1.some(r);
        }
        var out = Object.assign({}, r);
        out[k] = a;
        return Option_1.some(out);
    };
}
exports.updateAt = updateAt;
/**
 * @since 2.5.0
 */
function modifyAt(k, f) {
    return function (r) {
        if (!hasOwnProperty(k, r)) {
            return Option_1.none;
        }
        var out = Object.assign({}, r);
        out[k] = f(r[k]);
        return Option_1.some(out);
    };
}
exports.modifyAt = modifyAt;
function pop(k) {
    var deleteAtk = deleteAt(k);
    return function (r) {
        var oa = lookup(k, r);
        return Option_1.isNone(oa) ? Option_1.none : Option_1.some([oa.value, deleteAtk(r)]);
    };
}
exports.pop = pop;
function isSubrecord(E) {
    return function (me, that) {
        if (that === undefined) {
            var isSubrecordE_1 = isSubrecord(E);
            return function (that) { return isSubrecordE_1(that, me); };
        }
        for (var k in me) {
            if (!_hasOwnProperty.call(that, k) || !E.equals(me[k], that[k])) {
                return false;
            }
        }
        return true;
    };
}
exports.isSubrecord = isSubrecord;
function getEq(E) {
    var isSubrecordE = isSubrecord(E);
    return Eq_1.fromEquals(function (x, y) { return isSubrecordE(x)(y) && isSubrecordE(y)(x); });
}
exports.getEq = getEq;
function getMonoid(S) {
    return {
        concat: function (x, y) {
            if (x === exports.empty) {
                return y;
            }
            if (y === exports.empty) {
                return x;
            }
            var keys = Object.keys(y);
            var len = keys.length;
            if (len === 0) {
                return x;
            }
            var r = Object.assign({}, x);
            for (var i = 0; i < len; i++) {
                var k = keys[i];
                r[k] = _hasOwnProperty.call(x, k) ? S.concat(x[k], y[k]) : y[k];
            }
            return r;
        },
        empty: exports.empty
    };
}
exports.getMonoid = getMonoid;
function lookup(k, r) {
    if (r === undefined) {
        return function (r) { return lookup(k, r); };
    }
    return _hasOwnProperty.call(r, k) ? Option_1.some(r[k]) : Option_1.none;
}
exports.lookup = lookup;
/**
 * @since 2.5.0
 */
exports.empty = {};
function mapWithIndex(f) {
    return function (fa) {
        var out = {};
        var keys = Object.keys(fa);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            out[key] = f(key, fa[key]);
        }
        return out;
    };
}
exports.mapWithIndex = mapWithIndex;
function map(f) {
    return mapWithIndex(function (_, a) { return f(a); });
}
exports.map = map;
function reduceWithIndex(b, f) {
    return function (fa) {
        var out = b;
        var ks = keys(fa);
        var len = ks.length;
        for (var i = 0; i < len; i++) {
            var k = ks[i];
            out = f(k, out, fa[k]);
        }
        return out;
    };
}
exports.reduceWithIndex = reduceWithIndex;
function foldMapWithIndex(M) {
    return function (f) { return function (fa) {
        var out = M.empty;
        var ks = keys(fa);
        var len = ks.length;
        for (var i = 0; i < len; i++) {
            var k = ks[i];
            out = M.concat(out, f(k, fa[k]));
        }
        return out;
    }; };
}
exports.foldMapWithIndex = foldMapWithIndex;
function reduceRightWithIndex(b, f) {
    return function (fa) {
        var out = b;
        var ks = keys(fa);
        var len = ks.length;
        for (var i = len - 1; i >= 0; i--) {
            var k = ks[i];
            out = f(k, fa[k], out);
        }
        return out;
    };
}
exports.reduceRightWithIndex = reduceRightWithIndex;
/**
 * Create a record with one key/value pair
 *
 * @category constructors
 * @since 2.5.0
 */
function singleton(k, a) {
    var _a;
    return _a = {}, _a[k] = a, _a;
}
exports.singleton = singleton;
function traverseWithIndex(F) {
    return function (f) { return function (ta) {
        var ks = keys(ta);
        if (ks.length === 0) {
            return F.of(exports.empty);
        }
        var fr = F.of({});
        var _loop_1 = function (key) {
            fr = F.ap(F.map(fr, function (r) { return function (b) {
                r[key] = b;
                return r;
            }; }), f(key, ta[key]));
        };
        for (var _i = 0, ks_1 = ks; _i < ks_1.length; _i++) {
            var key = ks_1[_i];
            _loop_1(key);
        }
        return fr;
    }; };
}
exports.traverseWithIndex = traverseWithIndex;
function traverse(F) {
    var traverseWithIndexF = traverseWithIndex(F);
    return function (f) { return traverseWithIndexF(function (_, a) { return f(a); }); };
}
exports.traverse = traverse;
function sequence(F) {
    return traverseWithIndex(F)(function (_, a) { return a; });
}
exports.sequence = sequence;
/**
 * @category Witherable
 * @since 2.6.5
 */
exports.wither = function (F) {
    var traverseF = traverse(F);
    return function (f) { return function (fa) { return F.map(function_1.pipe(fa, traverseF(f)), exports.compact); }; };
};
/**
 * @category Witherable
 * @since 2.6.5
 */
exports.wilt = function (F) {
    var traverseF = traverse(F);
    return function (f) { return function (fa) { return F.map(function_1.pipe(fa, traverseF(f)), exports.separate); }; };
};
function partitionMapWithIndex(f) {
    return function (fa) {
        var left = {};
        var right = {};
        var keys = Object.keys(fa);
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            var e = f(key, fa[key]);
            switch (e._tag) {
                case 'Left':
                    left[key] = e.left;
                    break;
                case 'Right':
                    right[key] = e.right;
                    break;
            }
        }
        return {
            left: left,
            right: right
        };
    };
}
exports.partitionMapWithIndex = partitionMapWithIndex;
function partitionWithIndex(predicateWithIndex) {
    return function (fa) {
        var left = {};
        var right = {};
        var keys = Object.keys(fa);
        for (var _i = 0, keys_3 = keys; _i < keys_3.length; _i++) {
            var key = keys_3[_i];
            var a = fa[key];
            if (predicateWithIndex(key, a)) {
                right[key] = a;
            }
            else {
                left[key] = a;
            }
        }
        return {
            left: left,
            right: right
        };
    };
}
exports.partitionWithIndex = partitionWithIndex;
function filterMapWithIndex(f) {
    return function (fa) {
        var r = {};
        var keys = Object.keys(fa);
        for (var _i = 0, keys_4 = keys; _i < keys_4.length; _i++) {
            var key = keys_4[_i];
            var optionB = f(key, fa[key]);
            if (Option_1.isSome(optionB)) {
                r[key] = optionB.value;
            }
        }
        return r;
    };
}
exports.filterMapWithIndex = filterMapWithIndex;
function filterWithIndex(predicateWithIndex) {
    return function (fa) {
        var out = {};
        var changed = false;
        for (var key in fa) {
            if (_hasOwnProperty.call(fa, key)) {
                var a = fa[key];
                if (predicateWithIndex(key, a)) {
                    out[key] = a;
                }
                else {
                    changed = true;
                }
            }
        }
        return changed ? out : fa;
    };
}
exports.filterWithIndex = filterWithIndex;
function fromFoldable(M, F) {
    var fromFoldableMapM = fromFoldableMap(M, F);
    return function (fka) { return fromFoldableMapM(fka, function_1.identity); };
}
exports.fromFoldable = fromFoldable;
function fromFoldableMap(M, F) {
    return function (ta, f) {
        return F.reduce(ta, {}, function (r, a) {
            var _a = f(a), k = _a[0], b = _a[1];
            r[k] = _hasOwnProperty.call(r, k) ? M.concat(r[k], b) : b;
            return r;
        });
    };
}
exports.fromFoldableMap = fromFoldableMap;
/**
 * @since 2.5.0
 */
function every(predicate) {
    return function (r) {
        for (var k in r) {
            if (!predicate(r[k])) {
                return false;
            }
        }
        return true;
    };
}
exports.every = every;
/**
 * @since 2.5.0
 */
function some(predicate) {
    return function (r) {
        for (var k in r) {
            if (predicate(r[k])) {
                return true;
            }
        }
        return false;
    };
}
exports.some = some;
function elem(E) {
    return function (a, fa) {
        if (fa === undefined) {
            var elemE_1 = elem(E);
            return function (fa) { return elemE_1(a, fa); };
        }
        for (var k in fa) {
            if (E.equals(fa[k], a)) {
                return true;
            }
        }
        return false;
    };
}
exports.elem = elem;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, map(f)); };
/* istanbul ignore next */
var mapWithIndex_ = function (fa, f) { return function_1.pipe(fa, mapWithIndex(f)); };
/* istanbul ignore next */
var reduce_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduce(b, f)); };
/* istanbul ignore next */
var foldMap_ = function (M) {
    var foldMapM = exports.foldMap(M);
    return function (fa, f) { return function_1.pipe(fa, foldMapM(f)); };
};
/* istanbul ignore next */
var reduceRight_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduceRight(b, f)); };
/* istanbul ignore next */
var traverse_ = function (F) {
    var traverseF = traverse(F);
    return function (ta, f) { return function_1.pipe(ta, traverseF(f)); };
};
/* istanbul ignore next */
var filter_ = function (fa, predicate) {
    return function_1.pipe(fa, exports.filter(predicate));
};
/* istanbul ignore next */
var filterMap_ = function (fa, f) { return function_1.pipe(fa, exports.filterMap(f)); };
/* istanbul ignore next */
var partition_ = function (fa, predicate) { return function_1.pipe(fa, exports.partition(predicate)); };
/* istanbul ignore next */
var partitionMap_ = function (fa, f) { return function_1.pipe(fa, exports.partitionMap(f)); };
/* istanbul ignore next */
var reduceWithIndex_ = function (fa, b, f) {
    return function_1.pipe(fa, reduceWithIndex(b, f));
};
/* istanbul ignore next */
var foldMapWithIndex_ = function (M) {
    var foldMapWithIndexM = foldMapWithIndex(M);
    return function (fa, f) { return function_1.pipe(fa, foldMapWithIndexM(f)); };
};
/* istanbul ignore next */
var reduceRightWithIndex_ = function (fa, b, f) {
    return function_1.pipe(fa, reduceRightWithIndex(b, f));
};
/* istanbul ignore next */
var partitionMapWithIndex_ = function (fa, f) { return function_1.pipe(fa, partitionMapWithIndex(f)); };
/* istanbul ignore next */
var partitionWithIndex_ = function (fa, predicateWithIndex) {
    return function_1.pipe(fa, partitionWithIndex(predicateWithIndex));
};
/* istanbul ignore next */
var filterMapWithIndex_ = function (fa, f) {
    return function_1.pipe(fa, filterMapWithIndex(f));
};
/* istanbul ignore next */
var filterWithIndex_ = function (fa, predicateWithIndex) {
    return function_1.pipe(fa, filterWithIndex(predicateWithIndex));
};
/* istanbul ignore next */
var traverseWithIndex_ = function (F) {
    var traverseWithIndexF = traverseWithIndex(F);
    return function (ta, f) { return function_1.pipe(ta, traverseWithIndexF(f)); };
};
/* istanbul ignore next */
var wither_ = function (F) {
    var witherF = exports.wither(F);
    return function (fa, f) { return function_1.pipe(fa, witherF(f)); };
};
/* istanbul ignore next */
var wilt_ = function (F) {
    var wiltF = exports.wilt(F);
    return function (fa, f) { return function_1.pipe(fa, wiltF(f)); };
};
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.filter = function (predicate) {
    return filterWithIndex(function (_, a) { return predicate(a); });
};
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.filterMap = function (f) { return filterMapWithIndex(function (_, a) { return f(a); }); };
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.partition = function (predicate) {
    return partitionWithIndex(function (_, a) { return predicate(a); });
};
/**
 * @category Filterable
 * @since 2.5.0
 */
exports.partitionMap = function (f) {
    return partitionMapWithIndex(function (_, a) { return f(a); });
};
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.reduce = function (b, f) {
    return reduceWithIndex(b, function (_, b, a) { return f(b, a); });
};
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.foldMap = function (M) {
    var foldMapWithIndexM = foldMapWithIndex(M);
    return function (f) { return foldMapWithIndexM(function (_, a) { return f(a); }); };
};
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.reduceRight = function (b, f) {
    return reduceRightWithIndex(b, function (_, a, b) { return f(a, b); });
};
/**
 * @category Compactable
 * @since 2.5.0
 */
exports.compact = function (fa) {
    var r = {};
    var keys = Object.keys(fa);
    for (var _i = 0, keys_5 = keys; _i < keys_5.length; _i++) {
        var key = keys_5[_i];
        var optionA = fa[key];
        if (Option_1.isSome(optionA)) {
            r[key] = optionA.value;
        }
    }
    return r;
};
/**
 * @category Compactable
 * @since 2.5.0
 */
exports.separate = function (fa) {
    var left = {};
    var right = {};
    var keys = Object.keys(fa);
    for (var _i = 0, keys_6 = keys; _i < keys_6.length; _i++) {
        var key = keys_6[_i];
        var e = fa[key];
        switch (e._tag) {
            case 'Left':
                left[key] = e.left;
                break;
            case 'Right':
                right[key] = e.right;
                break;
        }
    }
    return {
        left: left,
        right: right
    };
};
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.5.0
 */
exports.URI = 'ReadonlyRecord';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FunctorWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FoldableWithIndex = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Compactable = {
    URI: exports.URI,
    compact: exports.compact,
    separate: exports.separate
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Filterable = {
    URI: exports.URI,
    map: map_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FilterableWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    filterMapWithIndex: filterMapWithIndex_,
    filterWithIndex: filterWithIndex_,
    partitionMapWithIndex: partitionMapWithIndex_,
    partitionWithIndex: partitionWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: sequence
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.TraversableWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    traverse: traverse_,
    sequence: sequence,
    traverseWithIndex: traverseWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Witherable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: sequence,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    wither: wither_,
    wilt: wilt_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.5.0
 */
exports.readonlyRecord = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: sequence,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    mapWithIndex: mapWithIndex_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    filterMapWithIndex: filterMapWithIndex_,
    filterWithIndex: filterWithIndex_,
    partitionMapWithIndex: partitionMapWithIndex_,
    partitionWithIndex: partitionWithIndex_,
    traverseWithIndex: traverseWithIndex_,
    wither: wither_,
    wilt: wilt_
};


/***/ }),

/***/ 815:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.filterMap = exports.separate = exports.compact = exports.fromArray = exports.remove = exports.insert = exports.singleton = exports.foldMap = exports.reduce = exports.getIntersectionSemigroup = exports.getUnionMonoid = exports.difference = exports.partitionMap = exports.intersection = exports.union = exports.elem = exports.partition = exports.filter = exports.isSubset = exports.chain = exports.every = exports.map = exports.some = exports.getEq = exports.toReadonlyArray = exports.empty = exports.getShow = exports.toSet = exports.fromSet = void 0;
var Eq_1 = __webpack_require__(6964);
var function_1 = __webpack_require__(6985);
/**
 * @category constructors
 * @since 2.5.0
 */
function fromSet(s) {
    return new Set(s);
}
exports.fromSet = fromSet;
/**
 * @category destructors
 * @since 2.5.0
 */
function toSet(s) {
    return new Set(s);
}
exports.toSet = toSet;
/**
 * @category instances
 * @since 2.5.0
 */
function getShow(S) {
    return {
        show: function (s) {
            var elements = '';
            s.forEach(function (a) {
                elements += S.show(a) + ', ';
            });
            if (elements !== '') {
                elements = elements.substring(0, elements.length - 2);
            }
            return "new Set([" + elements + "])";
        }
    };
}
exports.getShow = getShow;
/**
 * @since 2.5.0
 */
exports.empty = new Set();
/**
 * @category destructors
 * @since 2.5.0
 */
function toReadonlyArray(O) {
    return function (x) {
        // tslint:disable-next-line: readonly-array
        var r = [];
        x.forEach(function (e) { return r.push(e); });
        return r.sort(O.compare);
    };
}
exports.toReadonlyArray = toReadonlyArray;
/**
 * @category instances
 * @since 2.5.0
 */
function getEq(E) {
    var subsetE = isSubset(E);
    return Eq_1.fromEquals(function (x, y) { return subsetE(x, y) && subsetE(y, x); });
}
exports.getEq = getEq;
/**
 * @since 2.5.0
 */
function some(predicate) {
    return function (set) {
        var values = set.values();
        var e;
        var found = false;
        // tslint:disable-next-line: strict-boolean-expressions
        while (!found && !(e = values.next()).done) {
            found = predicate(e.value);
        }
        return found;
    };
}
exports.some = some;
/**
 * Projects a Set through a function
 *
 * @category combinators
 * @since 2.5.0
 */
function map(E) {
    var elemE = elem(E);
    return function (f) { return function (set) {
        var r = new Set();
        set.forEach(function (e) {
            var v = f(e);
            if (!elemE(v, r)) {
                r.add(v);
            }
        });
        return r;
    }; };
}
exports.map = map;
/**
 * @since 2.5.0
 */
function every(predicate) {
    return function_1.not(some(function_1.not(predicate)));
}
exports.every = every;
/**
 * @category combinators
 * @since 2.5.0
 */
function chain(E) {
    var elemE = elem(E);
    return function (f) { return function (set) {
        var r = new Set();
        set.forEach(function (e) {
            f(e).forEach(function (e) {
                if (!elemE(e, r)) {
                    r.add(e);
                }
            });
        });
        return r;
    }; };
}
exports.chain = chain;
function isSubset(E) {
    var elemE = elem(E);
    return function (me, that) {
        if (that === undefined) {
            var isSubsetE_1 = isSubset(E);
            return function (that) { return isSubsetE_1(that, me); };
        }
        return every(function (a) { return elemE(a, that); })(me);
    };
}
exports.isSubset = isSubset;
function filter(predicate) {
    return function (set) {
        var values = set.values();
        var e;
        var r = new Set();
        // tslint:disable-next-line: strict-boolean-expressions
        while (!(e = values.next()).done) {
            var value = e.value;
            if (predicate(value)) {
                r.add(value);
            }
        }
        return r;
    };
}
exports.filter = filter;
function partition(predicate) {
    return function (set) {
        var values = set.values();
        var e;
        var right = new Set();
        var left = new Set();
        // tslint:disable-next-line: strict-boolean-expressions
        while (!(e = values.next()).done) {
            var value = e.value;
            if (predicate(value)) {
                right.add(value);
            }
            else {
                left.add(value);
            }
        }
        return { left: left, right: right };
    };
}
exports.partition = partition;
function elem(E) {
    return function (a, set) {
        if (set === undefined) {
            var elemE_1 = elem(E);
            return function (set) { return elemE_1(a, set); };
        }
        var values = set.values();
        var e;
        var found = false;
        // tslint:disable-next-line: strict-boolean-expressions
        while (!found && !(e = values.next()).done) {
            found = E.equals(a, e.value);
        }
        return found;
    };
}
exports.elem = elem;
function union(E) {
    var elemE = elem(E);
    return function (me, that) {
        if (that === undefined) {
            var unionE_1 = union(E);
            return function (that) { return unionE_1(me, that); };
        }
        if (me === exports.empty) {
            return that;
        }
        if (that === exports.empty) {
            return me;
        }
        var r = new Set(me);
        that.forEach(function (e) {
            if (!elemE(e, r)) {
                r.add(e);
            }
        });
        return r;
    };
}
exports.union = union;
function intersection(E) {
    var elemE = elem(E);
    return function (me, that) {
        if (that === undefined) {
            var intersectionE_1 = intersection(E);
            return function (that) { return intersectionE_1(that, me); };
        }
        if (me === exports.empty || that === exports.empty) {
            return exports.empty;
        }
        var r = new Set();
        me.forEach(function (e) {
            if (elemE(e, that)) {
                r.add(e);
            }
        });
        return r;
    };
}
exports.intersection = intersection;
/**
 * @since 2.5.0
 */
function partitionMap(EB, EC) {
    return function (f) { return function (set) {
        var values = set.values();
        var e;
        var left = new Set();
        var right = new Set();
        var hasB = elem(EB);
        var hasC = elem(EC);
        // tslint:disable-next-line: strict-boolean-expressions
        while (!(e = values.next()).done) {
            var v = f(e.value);
            switch (v._tag) {
                case 'Left':
                    if (!hasB(v.left, left)) {
                        left.add(v.left);
                    }
                    break;
                case 'Right':
                    if (!hasC(v.right, right)) {
                        right.add(v.right);
                    }
                    break;
            }
        }
        return { left: left, right: right };
    }; };
}
exports.partitionMap = partitionMap;
function difference(E) {
    var elemE = elem(E);
    return function (me, that) {
        if (that === undefined) {
            var differenceE_1 = difference(E);
            return function (that) { return differenceE_1(that, me); };
        }
        return filter(function (a) { return !elemE(a, that); })(me);
    };
}
exports.difference = difference;
/**
 * @category instances
 * @since 2.5.0
 */
function getUnionMonoid(E) {
    return {
        concat: union(E),
        empty: exports.empty
    };
}
exports.getUnionMonoid = getUnionMonoid;
/**
 * @category instances
 * @since 2.5.0
 */
function getIntersectionSemigroup(E) {
    return {
        concat: intersection(E)
    };
}
exports.getIntersectionSemigroup = getIntersectionSemigroup;
/**
 * @since 2.5.0
 */
function reduce(O) {
    var toArrayO = toReadonlyArray(O);
    return function (b, f) { return function (fa) { return toArrayO(fa).reduce(f, b); }; };
}
exports.reduce = reduce;
/**
 * @since 2.5.0
 */
function foldMap(O, M) {
    var toArrayO = toReadonlyArray(O);
    return function (f) { return function (fa) { return toArrayO(fa).reduce(function (b, a) { return M.concat(b, f(a)); }, M.empty); }; };
}
exports.foldMap = foldMap;
/**
 * Create a set with one element
 *
 * @category constructors
 * @since 2.5.0
 */
function singleton(a) {
    return new Set([a]);
}
exports.singleton = singleton;
/**
 * Insert a value into a set
 *
 * @category combinators
 * @since 2.5.0
 */
function insert(E) {
    var elemE = elem(E);
    return function (a) { return function (set) {
        if (!elemE(a)(set)) {
            var r = new Set(set);
            r.add(a);
            return r;
        }
        else {
            return set;
        }
    }; };
}
exports.insert = insert;
/**
 * Delete a value from a set
 *
 * @category combinators
 * @since 2.5.0
 */
function remove(E) {
    return function (a) { return function (set) { return filter(function (ax) { return !E.equals(a, ax); })(set); }; };
}
exports.remove = remove;
/**
 * Create a set from an array
 *
 * @category constructors
 * @since 2.5.0
 */
function fromArray(E) {
    return function (as) {
        var len = as.length;
        var r = new Set();
        var has = elem(E);
        for (var i = 0; i < len; i++) {
            var a = as[i];
            if (!has(a, r)) {
                r.add(a);
            }
        }
        return r;
    };
}
exports.fromArray = fromArray;
/**
 * @category combinators
 * @since 2.5.0
 */
function compact(E) {
    return filterMap(E)(function_1.identity);
}
exports.compact = compact;
/**
 * @since 2.5.0
 */
function separate(EE, EA) {
    return function (fa) {
        var elemEE = elem(EE);
        var elemEA = elem(EA);
        var left = new Set();
        var right = new Set();
        fa.forEach(function (e) {
            switch (e._tag) {
                case 'Left':
                    if (!elemEE(e.left, left)) {
                        left.add(e.left);
                    }
                    break;
                case 'Right':
                    if (!elemEA(e.right, right)) {
                        right.add(e.right);
                    }
                    break;
            }
        });
        return { left: left, right: right };
    };
}
exports.separate = separate;
/**
 * @category combinators
 * @since 2.5.0
 */
function filterMap(E) {
    var elemE = elem(E);
    return function (f) { return function (fa) {
        var r = new Set();
        fa.forEach(function (a) {
            var ob = f(a);
            if (ob._tag === 'Some' && !elemE(ob.value, r)) {
                r.add(ob.value);
            }
        });
        return r;
    }; };
}
exports.filterMap = filterMap;


/***/ }),

/***/ 1024:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.readonlyTuple = exports.Traversable = exports.Foldable = exports.Comonad = exports.Semigroupoid = exports.Bifunctor = exports.Functor = exports.URI = exports.sequence = exports.traverse = exports.reduceRight = exports.foldMap = exports.reduce = exports.map = exports.duplicate = exports.extract = exports.extend = exports.compose = exports.mapLeft = exports.bimap = exports.getChainRec = exports.getMonad = exports.getChain = exports.getApplicative = exports.getApply = exports.swap = exports.snd = exports.fst = void 0;
var function_1 = __webpack_require__(6985);
// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.5.0
 */
function fst(sa) {
    return sa[0];
}
exports.fst = fst;
/**
 * @category destructors
 * @since 2.5.0
 */
function snd(sa) {
    return sa[1];
}
exports.snd = snd;
/**
 * @category combinators
 * @since 2.5.0
 */
function swap(sa) {
    return [snd(sa), fst(sa)];
}
exports.swap = swap;
/**
 * @category instances
 * @since 2.5.0
 */
function getApply(S) {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return [fst(fab)(fst(fa)), S.concat(snd(fab), snd(fa))]; }
    };
}
exports.getApply = getApply;
var of = function (M) { return function (a) {
    return [a, M.empty];
}; };
/**
 * @category instances
 * @since 2.5.0
 */
function getApplicative(M) {
    var A = getApply(M);
    return {
        URI: exports.URI,
        _E: undefined,
        map: A.map,
        ap: A.ap,
        of: of(M)
    };
}
exports.getApplicative = getApplicative;
/**
 * @category instances
 * @since 2.5.0
 */
function getChain(S) {
    var A = getApply(S);
    return {
        URI: exports.URI,
        _E: undefined,
        map: A.map,
        ap: A.ap,
        chain: function (fa, f) {
            var _a = f(fst(fa)), b = _a[0], s = _a[1];
            return [b, S.concat(snd(fa), s)];
        }
    };
}
exports.getChain = getChain;
/**
 * @category instances
 * @since 2.5.0
 */
function getMonad(M) {
    var C = getChain(M);
    return {
        URI: exports.URI,
        _E: undefined,
        map: C.map,
        ap: C.ap,
        chain: C.chain,
        of: of(M)
    };
}
exports.getMonad = getMonad;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.5.0
 */
function getChainRec(M) {
    var chainRec = function (a, f) {
        var result = f(a);
        var acc = M.empty;
        var s = fst(result);
        while (s._tag === 'Left') {
            acc = M.concat(acc, snd(result));
            result = f(s.left);
            s = fst(result);
        }
        return [s.right, M.concat(acc, snd(result))];
    };
    var C = getChain(M);
    return {
        URI: exports.URI,
        _E: undefined,
        map: C.map,
        ap: C.ap,
        chain: C.chain,
        chainRec: chainRec
    };
}
exports.getChainRec = getChainRec;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var compose_ = function (bc, ab) { return function_1.pipe(bc, exports.compose(ab)); };
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return function_1.pipe(fa, exports.bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return function_1.pipe(fa, exports.mapLeft(f)); };
/* istanbul ignore next */
var extend_ = function (wa, f) { return function_1.pipe(wa, exports.extend(f)); };
/* istanbul ignore next */
var reduce_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduce(b, f)); };
/* istanbul ignore next */
var foldMap_ = function (M) {
    var foldMapM = exports.foldMap(M);
    return function (fa, f) { return function_1.pipe(fa, foldMapM(f)); };
};
/* istanbul ignore next */
var reduceRight_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduceRight(b, f)); };
/* istanbul ignore next */
var traverse_ = function (F) {
    var traverseF = exports.traverse(F);
    return function (ta, f) { return function_1.pipe(ta, traverseF(f)); };
};
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.5.0
 */
exports.bimap = function (f, g) { return function (fa) { return [g(fst(fa)), f(snd(fa))]; }; };
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.5.0
 */
exports.mapLeft = function (f) { return function (fa) { return [
    fst(fa),
    f(snd(fa))
]; }; };
/**
 * @category Semigroupoid
 * @since 2.5.0
 */
exports.compose = function (ab) { return function (bc) { return [
    fst(bc),
    snd(ab)
]; }; };
/**
 * @category Extend
 * @since 2.5.0
 */
exports.extend = function (f) { return function (wa) { return [f(wa), snd(wa)]; }; };
/**
 * @category Extract
 * @since 2.6.2
 */
exports.extract = fst;
/**
 * @category Extend
 * @since 2.5.0
 */
exports.duplicate = 
/*#__PURE__*/
exports.extend(function_1.identity);
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.5.0
 */
exports.map = function (f) { return function (fa) { return [
    f(fst(fa)),
    snd(fa)
]; }; };
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.reduce = function (b, f) { return function (fa) {
    return f(b, fst(fa));
}; };
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.foldMap = function () {
    return function (f) { return function (fa) { return f(fst(fa)); }; };
};
/**
 * @category Foldable
 * @since 2.5.0
 */
exports.reduceRight = function (b, f) { return function (fa) {
    return f(fst(fa), b);
}; };
/**
 * @since 2.6.3
 */
exports.traverse = function (F) {
    return function (f) { return function (ta) { return F.map(f(fst(ta)), function (b) { return [b, snd(ta)]; }); }; };
};
/**
 * @since 2.6.3
 */
exports.sequence = function (F) { return function (fas) {
    return F.map(fst(fas), function (a) { return [a, snd(fas)]; });
}; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.5.0
 */
exports.URI = 'ReadonlyTuple';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Semigroupoid = {
    URI: exports.URI,
    compose: compose_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Comonad = {
    URI: exports.URI,
    map: map_,
    extend: extend_,
    extract: exports.extract
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.5.0
 */
exports.readonlyTuple = {
    URI: exports.URI,
    compose: compose_,
    map: map_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    extract: exports.extract,
    extend: extend_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};


/***/ }),

/***/ 2653:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.record = exports.Witherable = exports.TraversableWithIndex = exports.Traversable = exports.FilterableWithIndex = exports.Filterable = exports.Compactable = exports.FoldableWithIndex = exports.Foldable = exports.FunctorWithIndex = exports.Functor = exports.URI = exports.separate = exports.compact = exports.reduceRight = exports.reduce = exports.partitionMap = exports.partition = exports.foldMap = exports.filterMap = exports.filter = exports.elem = exports.some = exports.every = exports.fromFoldableMap = exports.fromFoldable = exports.filterWithIndex = exports.filterMapWithIndex = exports.partitionWithIndex = exports.partitionMapWithIndex = exports.wilt = exports.wither = exports.sequence = exports.traverse = exports.traverseWithIndex = exports.singleton = exports.reduceRightWithIndex = exports.foldMapWithIndex = exports.reduceWithIndex = exports.map = exports.mapWithIndex = exports.empty = exports.lookup = exports.getMonoid = exports.getEq = exports.isSubrecord = exports.pop = exports.modifyAt = exports.updateAt = exports.deleteAt = exports.hasOwnProperty = exports.insertAt = exports.toUnfoldable = exports.toArray = exports.collect = exports.keys = exports.isEmpty = exports.size = exports.getShow = void 0;
var RR = __importStar(__webpack_require__(1897));
/* tslint:disable:readonly-array */
// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
/**
 * @since 2.0.0
 */
exports.getShow = RR.getShow;
/**
 * Calculate the number of key/value pairs in a record
 *
 * @since 2.0.0
 */
exports.size = RR.size;
/**
 * Test whether a record is empty
 *
 * @since 2.0.0
 */
exports.isEmpty = RR.isEmpty;
/**
 * @since 2.0.0
 */
exports.keys = RR.keys;
/**
 * Map a record into an array
 *
 * @example
 * import {collect} from 'fp-ts/Record'
 *
 * const x: { a: string, b: boolean } = { a: 'foo', b: false }
 * assert.deepStrictEqual(
 *   collect((key, val) => ({key: key, value: val}))(x),
 *   [{key: 'a', value: 'foo'}, {key: 'b', value: false}]
 * )
 *
 * @since 2.0.0
 */
exports.collect = RR.collect;
/**
 * @since 2.0.0
 */
exports.toArray = RR.toReadonlyArray;
function toUnfoldable(U) {
    return RR.toUnfoldable(U);
}
exports.toUnfoldable = toUnfoldable;
function insertAt(k, a) {
    return RR.insertAt(k, a);
}
exports.insertAt = insertAt;
/**
 * @since 2.0.0
 */
exports.hasOwnProperty = RR.hasOwnProperty;
function deleteAt(k) {
    return RR.deleteAt(k);
}
exports.deleteAt = deleteAt;
/**
 * @since 2.0.0
 */
exports.updateAt = RR.updateAt;
/**
 * @since 2.0.0
 */
exports.modifyAt = RR.modifyAt;
function pop(k) {
    return RR.pop(k);
}
exports.pop = pop;
// TODO: remove non-curried overloading in v3
/**
 * Test whether one record contains all of the keys and values contained in another record
 *
 * @since 2.0.0
 */
exports.isSubrecord = RR.isSubrecord;
function getEq(E) {
    return RR.getEq(E);
}
exports.getEq = getEq;
function getMonoid(S) {
    return RR.getMonoid(S);
}
exports.getMonoid = getMonoid;
// TODO: remove non-curried overloading in v3
/**
 * Lookup the value for a key in a record
 *
 * @since 2.0.0
 */
exports.lookup = RR.lookup;
/**
 * @since 2.0.0
 */
exports.empty = {};
function mapWithIndex(f) {
    return RR.mapWithIndex(f);
}
exports.mapWithIndex = mapWithIndex;
function map(f) {
    return RR.map(f);
}
exports.map = map;
function reduceWithIndex(b, f) {
    return RR.reduceWithIndex(b, f);
}
exports.reduceWithIndex = reduceWithIndex;
function foldMapWithIndex(M) {
    return RR.foldMapWithIndex(M);
}
exports.foldMapWithIndex = foldMapWithIndex;
function reduceRightWithIndex(b, f) {
    return RR.reduceRightWithIndex(b, f);
}
exports.reduceRightWithIndex = reduceRightWithIndex;
/**
 * Create a record with one key/value pair
 *
 * @since 2.0.0
 */
exports.singleton = RR.singleton;
function traverseWithIndex(F) {
    return RR.traverseWithIndex(F);
}
exports.traverseWithIndex = traverseWithIndex;
function traverse(F) {
    return RR.traverse(F);
}
exports.traverse = traverse;
function sequence(F) {
    return RR.sequence(F);
}
exports.sequence = sequence;
/**
 * @category Witherable
 * @since 2.6.5
 */
exports.wither = RR.wither;
/**
 * @category Witherable
 * @since 2.6.5
 */
exports.wilt = RR.wilt;
function partitionMapWithIndex(f) {
    return RR.partitionMapWithIndex(f);
}
exports.partitionMapWithIndex = partitionMapWithIndex;
function partitionWithIndex(predicateWithIndex) {
    return RR.partitionWithIndex(predicateWithIndex);
}
exports.partitionWithIndex = partitionWithIndex;
function filterMapWithIndex(f) {
    return RR.filterMapWithIndex(f);
}
exports.filterMapWithIndex = filterMapWithIndex;
function filterWithIndex(predicateWithIndex) {
    return RR.filterWithIndex(predicateWithIndex);
}
exports.filterWithIndex = filterWithIndex;
function fromFoldable(M, F) {
    return RR.fromFoldable(M, F);
}
exports.fromFoldable = fromFoldable;
function fromFoldableMap(M, F) {
    return RR.fromFoldableMap(M, F);
}
exports.fromFoldableMap = fromFoldableMap;
/**
 * @since 2.0.0
 */
exports.every = RR.every;
/**
 * @since 2.0.0
 */
exports.some = RR.some;
// TODO: remove non-curried overloading in v3
/**
 * @since 2.0.0
 */
exports.elem = RR.elem;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = RR.Functor.map;
var mapWithIndex_ = RR.FunctorWithIndex.mapWithIndex;
var reduce_ = RR.Foldable.reduce;
var foldMap_ = RR.Foldable.foldMap;
var reduceRight_ = RR.Foldable.reduceRight;
var reduceWithIndex_ = RR.FoldableWithIndex.reduceWithIndex;
var foldMapWithIndex_ = RR.FoldableWithIndex.foldMapWithIndex;
var reduceRightWithIndex_ = RR.FoldableWithIndex.reduceRightWithIndex;
var filter_ = RR.Filterable.filter;
var filterMap_ = RR.Filterable.filterMap;
var partition_ = RR.Filterable.partition;
var partitionMap_ = RR.Filterable.partitionMap;
var filterWithIndex_ = RR.FilterableWithIndex
    .filterWithIndex;
var filterMapWithIndex_ = RR.FilterableWithIndex.filterMapWithIndex;
var partitionWithIndex_ = RR.FilterableWithIndex
    .partitionWithIndex;
var partitionMapWithIndex_ = RR.FilterableWithIndex.partitionMapWithIndex;
var traverseWithIndex_ = RR.TraversableWithIndex
    .traverseWithIndex;
var wither_ = RR.Witherable.wither;
var wilt_ = RR.Witherable.wilt;
var traverse_ = function (F) {
    var traverseF = traverse(F);
    return function (ta, f) { return traverseF(f)(ta); };
};
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.filter = RR.filter;
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.filterMap = RR.filterMap;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.foldMap = RR.foldMap;
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.partition = RR.partition;
/**
 * @category Filterable
 * @since 2.0.0
 */
exports.partitionMap = RR.partitionMap;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduce = RR.reduce;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduceRight = RR.reduceRight;
/**
 * @category Compactable
 * @since 2.0.0
 */
exports.compact = RR.compact;
/**
 * @category Compactable
 * @since 2.0.0
 */
exports.separate = RR.separate;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Record';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FunctorWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FoldableWithIndex = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Compactable = {
    URI: exports.URI,
    compact: exports.compact,
    separate: exports.separate
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Filterable = {
    URI: exports.URI,
    map: map_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.FilterableWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    filterMapWithIndex: filterMapWithIndex_,
    filterWithIndex: filterWithIndex_,
    partitionMapWithIndex: partitionMapWithIndex_,
    partitionWithIndex: partitionWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: sequence
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.TraversableWithIndex = {
    URI: exports.URI,
    map: map_,
    mapWithIndex: mapWithIndex_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    traverse: traverse_,
    sequence: sequence,
    traverseWithIndex: traverseWithIndex_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Witherable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: sequence,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    wither: wither_,
    wilt: wilt_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.record = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: sequence,
    compact: exports.compact,
    separate: exports.separate,
    filter: filter_,
    filterMap: filterMap_,
    partition: partition_,
    partitionMap: partitionMap_,
    mapWithIndex: mapWithIndex_,
    reduceWithIndex: reduceWithIndex_,
    foldMapWithIndex: foldMapWithIndex_,
    reduceRightWithIndex: reduceRightWithIndex_,
    filterMapWithIndex: filterMapWithIndex_,
    filterWithIndex: filterWithIndex_,
    partitionMapWithIndex: partitionMapWithIndex_,
    partitionWithIndex: partitionWithIndex_,
    traverseWithIndex: traverseWithIndex_,
    wither: wither_,
    wilt: wilt_
};


/***/ }),

/***/ 4845:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTupleRing = exports.negate = exports.getFunctionRing = void 0;
/**
 * The `Ring` class is for types that support addition, multiplication, and subtraction operations.
 *
 * Instances must satisfy the following law in addition to the `Semiring` laws:
 *
 * - Additive inverse: `a - a <-> (zero - a) + a <-> zero`
 *
 * Adapted from https://github.com/purescript/purescript-prelude/blob/master/src/Data/Ring.purs
 *
 * @since 2.0.0
 */
var Semiring_1 = __webpack_require__(4994);
/**
 * @category instances
 * @since 2.0.0
 */
function getFunctionRing(ring) {
    var S = Semiring_1.getFunctionSemiring(ring);
    return {
        add: S.add,
        mul: S.mul,
        one: S.one,
        zero: S.zero,
        sub: function (f, g) { return function (x) { return ring.sub(f(x), g(x)); }; }
    };
}
exports.getFunctionRing = getFunctionRing;
/**
 * `negate x` can be used as a shorthand for `zero - x`
 *
 * @since 2.0.0
 */
function negate(ring) {
    return function (a) { return ring.sub(ring.zero, a); };
}
exports.negate = negate;
/**
 * Given a tuple of `Ring`s returns a `Ring` for the tuple
 *
 * @example
 * import { getTupleRing } from 'fp-ts/Ring'
 * import { fieldNumber } from 'fp-ts/Field'
 *
 * const R = getTupleRing(fieldNumber, fieldNumber, fieldNumber)
 * assert.deepStrictEqual(R.add([1, 2, 3], [4, 5, 6]), [5, 7, 9])
 * assert.deepStrictEqual(R.mul([1, 2, 3], [4, 5, 6]), [4, 10, 18])
 * assert.deepStrictEqual(R.one, [1, 1, 1])
 * assert.deepStrictEqual(R.sub([1, 2, 3], [4, 5, 6]), [-3, -3, -3])
 * assert.deepStrictEqual(R.zero, [0, 0, 0])
 *
 * @category instances
 * @since 2.0.0
 */
function getTupleRing() {
    var rings = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        rings[_i] = arguments[_i];
    }
    return {
        add: function (x, y) { return rings.map(function (R, i) { return R.add(x[i], y[i]); }); },
        zero: rings.map(function (R) { return R.zero; }),
        mul: function (x, y) { return rings.map(function (R, i) { return R.mul(x[i], y[i]); }); },
        one: rings.map(function (R) { return R.one; }),
        sub: function (x, y) { return rings.map(function (R, i) { return R.sub(x[i], y[i]); }); }
    };
}
exports.getTupleRing = getTupleRing;


/***/ }),

/***/ 6339:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getIntercalateSemigroup = exports.semigroupVoid = exports.semigroupString = exports.semigroupProduct = exports.semigroupSum = exports.semigroupAny = exports.semigroupAll = exports.getObjectSemigroup = exports.getJoinSemigroup = exports.getMeetSemigroup = exports.getStructSemigroup = exports.getFunctionSemigroup = exports.getDualSemigroup = exports.getTupleSemigroup = exports.getLastSemigroup = exports.getFirstSemigroup = exports.fold = void 0;
/**
 * A `Semigroup` is a `Magma` where `concat` is associative, that is:
 *
 * Associativiy: `concat(concat(x, y), z) <-> concat(x, concat(y, z))`
 *
 * @since 2.0.0
 */
var function_1 = __webpack_require__(6985);
var Ord_1 = __webpack_require__(6685);
function fold(S) {
    return function (a, as) {
        if (as === undefined) {
            var foldS_1 = fold(S);
            return function (as) { return foldS_1(a, as); };
        }
        return as.reduce(S.concat, a);
    };
}
exports.fold = fold;
/**
 * @category instances
 * @since 2.0.0
 */
function getFirstSemigroup() {
    return { concat: function_1.identity };
}
exports.getFirstSemigroup = getFirstSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getLastSemigroup() {
    return { concat: function (_, y) { return y; } };
}
exports.getLastSemigroup = getLastSemigroup;
/**
 * Given a tuple of semigroups returns a semigroup for the tuple
 *
 * @example
 * import { getTupleSemigroup, semigroupString, semigroupSum, semigroupAll } from 'fp-ts/Semigroup'
 *
 * const S1 = getTupleSemigroup(semigroupString, semigroupSum)
 * assert.deepStrictEqual(S1.concat(['a', 1], ['b', 2]), ['ab', 3])
 *
 * const S2 = getTupleSemigroup(semigroupString, semigroupSum, semigroupAll)
 * assert.deepStrictEqual(S2.concat(['a', 1, true], ['b', 2, false]), ['ab', 3, false])
 *
 * @category instances
 * @since 2.0.0
 */
function getTupleSemigroup() {
    var semigroups = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        semigroups[_i] = arguments[_i];
    }
    return {
        concat: function (x, y) { return semigroups.map(function (s, i) { return s.concat(x[i], y[i]); }); }
    };
}
exports.getTupleSemigroup = getTupleSemigroup;
/**
 * The dual of a `Semigroup`, obtained by swapping the arguments of `concat`.
 *
 * @example
 * import { getDualSemigroup, semigroupString } from 'fp-ts/Semigroup'
 *
 * assert.deepStrictEqual(getDualSemigroup(semigroupString).concat('a', 'b'), 'ba')
 *
 * @category instances
 * @since 2.0.0
 */
function getDualSemigroup(S) {
    return {
        concat: function (x, y) { return S.concat(y, x); }
    };
}
exports.getDualSemigroup = getDualSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getFunctionSemigroup(S) {
    return function () { return ({
        concat: function (f, g) { return function (a) { return S.concat(f(a), g(a)); }; }
    }); };
}
exports.getFunctionSemigroup = getFunctionSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getStructSemigroup(semigroups) {
    return {
        concat: function (x, y) {
            var r = {};
            for (var _i = 0, _a = Object.keys(semigroups); _i < _a.length; _i++) {
                var key = _a[_i];
                r[key] = semigroups[key].concat(x[key], y[key]);
            }
            return r;
        }
    };
}
exports.getStructSemigroup = getStructSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getMeetSemigroup(O) {
    return {
        concat: Ord_1.min(O)
    };
}
exports.getMeetSemigroup = getMeetSemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getJoinSemigroup(O) {
    return {
        concat: Ord_1.max(O)
    };
}
exports.getJoinSemigroup = getJoinSemigroup;
/**
 * Returns a `Semigroup` instance for objects preserving their type
 *
 * @example
 * import { getObjectSemigroup } from 'fp-ts/Semigroup'
 *
 * interface Person {
 *   name: string
 *   age: number
 * }
 *
 * const S = getObjectSemigroup<Person>()
 * assert.deepStrictEqual(S.concat({ name: 'name', age: 23 }, { name: 'name', age: 24 }), { name: 'name', age: 24 })
 *
 * @category instances
 * @since 2.0.0
 */
function getObjectSemigroup() {
    return {
        concat: function (x, y) { return Object.assign({}, x, y); }
    };
}
exports.getObjectSemigroup = getObjectSemigroup;
/**
 * Boolean semigroup under conjunction
 *
 * @category instances
 * @since 2.0.0
 */
exports.semigroupAll = {
    concat: function (x, y) { return x && y; }
};
/**
 * Boolean semigroup under disjunction
 *
 * @category instances
 * @since 2.0.0
 */
exports.semigroupAny = {
    concat: function (x, y) { return x || y; }
};
/**
 * Number `Semigroup` under addition
 *
 * @category instances
 * @since 2.0.0
 */
exports.semigroupSum = {
    concat: function (x, y) { return x + y; }
};
/**
 * Number `Semigroup` under multiplication
 *
 * @category instances
 * @since 2.0.0
 */
exports.semigroupProduct = {
    concat: function (x, y) { return x * y; }
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.semigroupString = {
    concat: function (x, y) { return x + y; }
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.semigroupVoid = {
    concat: function () { return undefined; }
};
/**
 * You can glue items between and stay associative
 *
 * @example
 * import { getIntercalateSemigroup, semigroupString } from 'fp-ts/Semigroup'
 *
 * const S = getIntercalateSemigroup(' ')(semigroupString)
 *
 * assert.strictEqual(S.concat('a', 'b'), 'a b')
 * assert.strictEqual(S.concat(S.concat('a', 'b'), 'c'), S.concat('a', S.concat('b', 'c')))
 *
 * @category instances
 * @since 2.5.0
 */
function getIntercalateSemigroup(a) {
    return function (S) { return ({
        concat: function (x, y) { return S.concat(x, S.concat(a, y)); }
    }); };
}
exports.getIntercalateSemigroup = getIntercalateSemigroup;


/***/ }),

/***/ 213:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 4994:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * The `Semiring` class is for types that support an addition and multiplication operation.
 *
 * Instances must satisfy the following laws:
 *
 * - Commutative monoid under addition:
 *   - Associativity: `(a + b) + c <-> a + (b + c)`
 *   - Identity: `zero + a = a + zero <-> a`
 *   - Commutative: `a + b <-> b + a`
 * - Monoid under multiplication:
 *   - Associativity: `(a * b) * c <-> a * (b * c)`
 *   - Identity: `one * a <-> a * one <-> a`
 * - Multiplication distributes over addition:
 *   - Left distributivity: `a * (b + c) <-> (a * b) + (a * c)`
 *   - Right distributivity: `(a + b) * c <-> (a * c) + (b * c)`
 * - Annihilation: `zero * a <-> a * zero <-> zero`
 *
 * **Note:** The `number` type is not fully law abiding members of this class hierarchy due to the potential
 * for arithmetic overflows, and the presence of `NaN` and `Infinity` values. The behaviour is
 * unspecified in these cases.
 *
 * @since 2.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getFunctionSemiring = void 0;
/**
 * @category instances
 * @since 2.0.0
 */
function getFunctionSemiring(S) {
    return {
        add: function (f, g) { return function (x) { return S.add(f(x), g(x)); }; },
        zero: function () { return S.zero; },
        mul: function (f, g) { return function (x) { return S.mul(f(x), g(x)); }; },
        one: function () { return S.one; }
    };
}
exports.getFunctionSemiring = getFunctionSemiring;


/***/ }),

/***/ 2124:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.filterMap = exports.separate = exports.compact = exports.fromArray = exports.toggle = exports.remove = exports.insert = exports.singleton = exports.foldMap = exports.reduce = exports.getIntersectionSemigroup = exports.getUnionMonoid = exports.difference = exports.partitionMap = exports.intersection = exports.union = exports.elem = exports.partition = exports.filter = exports.subset = exports.chain = exports.every = exports.map = exports.some = exports.getEq = exports.toArray = exports.empty = exports.getShow = void 0;
var RS = __importStar(__webpack_require__(815));
/**
 * @category instances
 * @since 2.0.0
 */
exports.getShow = RS.getShow;
/**
 * @since 2.0.0
 */
exports.empty = new Set();
/**
 * @category constructors
 * @since 2.0.0
 */
// tslint:disable-next-line: readonly-array
exports.toArray = RS.toReadonlyArray;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getEq = RS.getEq;
/**
 * @since 2.0.0
 */
exports.some = RS.some;
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category combinators
 * @since 2.0.0
 */
exports.map = RS.map;
/**
 * @since 2.0.0
 */
exports.every = RS.every;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.chain = RS.chain;
// TODO: remove non-curried overloading in v3
/**
 * `true` if and only if every element in the first set is an element of the second set
 *
 * @since 2.0.0
 */
exports.subset = RS.isSubset;
function filter(predicate) {
    return RS.filter(predicate);
}
exports.filter = filter;
function partition(predicate) {
    return RS.partition(predicate);
}
exports.partition = partition;
// TODO: remove non-curried overloading in v3
/**
 * Test if a value is a member of a set
 *
 * @since 2.0.0
 */
exports.elem = RS.elem;
// TODO: remove non-curried overloading in v3
/**
 * Form the union of two sets
 *
 * @category combinators
 * @since 2.0.0
 */
exports.union = RS.union;
// TODO: remove non-curried overloading in v3
/**
 * The set of elements which are in both the first and second set
 *
 * @category combinators
 * @since 2.0.0
 */
exports.intersection = RS.intersection;
/**
 * @since 2.0.0
 */
exports.partitionMap = RS.partitionMap;
// TODO: remove non-curried overloading in v3
/**
 * Form the set difference (`x` - `y`)
 *
 * @example
 * import { difference } from 'fp-ts/Set'
 * import { eqNumber } from 'fp-ts/Eq'
 * import { pipe } from 'fp-ts/function'
 *
 * assert.deepStrictEqual(pipe(new Set([1, 2]), difference(eqNumber)(new Set([1, 3]))), new Set([2]))
 *
 * @category combinators
 * @since 2.0.0
 */
exports.difference = RS.difference;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getUnionMonoid = RS.getUnionMonoid;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getIntersectionSemigroup = RS.getIntersectionSemigroup;
/**
 * @since 2.0.0
 */
exports.reduce = RS.reduce;
/**
 * @since 2.0.0
 */
exports.foldMap = RS.foldMap;
/**
 * Create a set with one element
 *
 * @category constructors
 * @since 2.0.0
 */
exports.singleton = RS.singleton;
/**
 * Insert a value into a set
 *
 * @category combinators
 * @since 2.0.0
 */
exports.insert = RS.insert;
/**
 * Delete a value from a set
 *
 * @category combinators
 * @since 2.0.0
 */
exports.remove = RS.remove;
/**
 * Checks an element is a member of a set;
 * If yes, removes the value from the set
 * If no, inserts the value to the set
 *
 * @category combinators
 * @since 2.5.0
 */
function toggle(E) {
    var elemE = exports.elem(E);
    var removeE = exports.remove(E);
    var insertE = exports.insert(E);
    return function (a) { return function (set) { return (elemE(a, set) ? removeE : insertE)(a)(set); }; };
}
exports.toggle = toggle;
/**
 * Create a set from an array
 *
 * @category constructors
 * @since 2.0.0
 */
// tslint:disable-next-line: readonly-array
exports.fromArray = RS.fromArray;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.compact = RS.compact;
/**
 * @since 2.0.0
 */
exports.separate = RS.separate;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.filterMap = RS.filterMap;


/***/ }),

/***/ 2921:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTupleShow = exports.getStructShow = exports.showBoolean = exports.showNumber = exports.showString = void 0;
/**
 * @category instances
 * @since 2.0.0
 */
exports.showString = {
    show: function (a) { return JSON.stringify(a); }
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.showNumber = {
    show: function (a) { return JSON.stringify(a); }
};
/**
 * @category instances
 * @since 2.0.0
 */
exports.showBoolean = {
    show: function (a) { return JSON.stringify(a); }
};
/**
 * @category instances
 * @since 2.0.0
 */
function getStructShow(shows) {
    return {
        show: function (s) {
            return "{ " + Object.keys(shows)
                .map(function (k) { return k + ": " + shows[k].show(s[k]); })
                .join(', ') + " }";
        }
    };
}
exports.getStructShow = getStructShow;
/**
 * @category instances
 * @since 2.0.0
 */
function getTupleShow() {
    var shows = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        shows[_i] = arguments[_i];
    }
    return {
        show: function (t) { return "[" + t.map(function (a, i) { return shows[i].show(a); }).join(', ') + "]"; }
    };
}
exports.getTupleShow = getTupleShow;


/***/ }),

/***/ 2151:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.bind = exports.bindTo = exports.execute = exports.evaluate = exports.execState = exports.evalState = exports.state = exports.Monad = exports.Applicative = exports.Functor = exports.URI = exports.flatten = exports.chainFirst = exports.chain = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.map = exports.gets = exports.modify = exports.put = exports.get = void 0;
/**
 * @since 2.0.0
 */
var function_1 = __webpack_require__(6985);
/* tslint:enable:readonly-array */
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * Get the current state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.get = function () { return function (s) { return [s, s]; }; };
/**
 * Set the state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.put = function (s) { return function () { return [undefined, s]; }; };
/**
 * Modify the state by applying a function to the current state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.modify = function (f) { return function (s) { return [undefined, f(s)]; }; };
/**
 * Get a value which depends on the current state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.gets = function (f) { return function (s) { return [f(s), s]; }; };
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var ap_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return function (s1) {
    var _a = fa(s1), a = _a[0], s2 = _a[1];
    return [f(a), s2];
}; }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) { return function (s1) {
    var _a = fab(s1), f = _a[0], s2 = _a[1];
    var _b = fa(s2), a = _b[0], s3 = _b[1];
    return [f(a), s3];
}; }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * @category Applicative
 * @since 2.0.0
 */
exports.of = function (a) { return function (s) { return [a, s]; }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = function (f) { return function (ma) { return function (s1) {
    var _a = ma(s1), a = _a[0], s2 = _a[1];
    return f(a)(s2);
}; }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = function (f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'State';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.state = exports.Monad;
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * Use `evaluate` instead
 *
 * @since 2.0.0
 * @deprecated
 */
exports.evalState = function (ma, s) { return ma(s)[0]; };
/**
 * Use `execute` instead
 *
 * @since 2.0.0
 * @deprecated
 */
exports.execState = function (ma, s) { return ma(s)[1]; };
/**
 * Run a computation in the `State` monad, discarding the final state
 *
 * @since 2.8.0
 */
exports.evaluate = function (s) { return function (ma) { return ma(s)[0]; }; };
/**
 * Run a computation in the `State` monad discarding the result
 *
 * @since 2.8.0
 */
exports.execute = function (s) { return function (ma) { return ma(s)[1]; }; };
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) {
    return exports.map(function_1.bindTo_(name));
};
/**
 * @since 2.8.0
 */
exports.bind = function (name, f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apS = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.ap(fb));
};


/***/ }),

/***/ 9245:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.apSW = exports.bind = exports.bindW = exports.bindTo = exports.execute = exports.evaluate = exports.execState = exports.evalState = exports.run = exports.stateReaderTaskEitherSeq = exports.stateReaderTaskEither = exports.Alt = exports.Bifunctor = exports.Applicative = exports.Functor = exports.URI = exports.throwError = exports.fromTask = exports.fromIO = exports.alt = exports.flatten = exports.chainFirst = exports.chainFirstW = exports.chain = exports.chainW = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.apW = exports.mapLeft = exports.bimap = exports.map = exports.filterOrElse = exports.chainReaderTaskEitherK = exports.chainReaderTaskEitherKW = exports.fromReaderTaskEitherK = exports.chainTaskEitherK = exports.chainTaskEitherKW = exports.fromTaskEitherK = exports.chainIOEitherK = exports.chainIOEitherKW = exports.fromIOEitherK = exports.chainEitherK = exports.chainEitherKW = exports.fromEitherK = exports.fromPredicate = exports.fromOption = exports.fromEither = exports.gets = exports.modify = exports.put = exports.get = exports.fromReaderTaskEither = exports.leftState = exports.rightState = exports.leftIO = exports.rightIO = exports.fromReaderEither = exports.fromIOEither = exports.leftReader = exports.rightReader = exports.fromTaskEither = exports.leftTask = exports.rightTask = exports.right = exports.left = void 0;
var E = __importStar(__webpack_require__(7534));
var function_1 = __webpack_require__(6985);
var RTE = __importStar(__webpack_require__(5043));
/* tslint:enable:readonly-array */
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
exports.left = function (e) { return function () { return RTE.left(e); }; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.right = function (a) { return function (s) {
    return RTE.right([a, s]);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
function rightTask(ma) {
    return exports.fromReaderTaskEither(RTE.rightTask(ma));
}
exports.rightTask = rightTask;
/**
 * @category constructors
 * @since 2.0.0
 */
function leftTask(me) {
    return exports.fromReaderTaskEither(RTE.leftTask(me));
}
exports.leftTask = leftTask;
/**
 * @category constructors
 * @since 2.0.0
 */
function fromTaskEither(ma) {
    return exports.fromReaderTaskEither(RTE.fromTaskEither(ma));
}
exports.fromTaskEither = fromTaskEither;
/**
 * @category constructors
 * @since 2.0.0
 */
function rightReader(ma) {
    return exports.fromReaderTaskEither(RTE.rightReader(ma));
}
exports.rightReader = rightReader;
/**
 * @category constructors
 * @since 2.0.0
 */
function leftReader(me) {
    return exports.fromReaderTaskEither(RTE.leftReader(me));
}
exports.leftReader = leftReader;
/**
 * @category constructors
 * @since 2.0.0
 */
function fromIOEither(ma) {
    return exports.fromReaderTaskEither(RTE.fromIOEither(ma));
}
exports.fromIOEither = fromIOEither;
/**
 * @category constructors
 * @since 2.0.0
 */
function fromReaderEither(ma) {
    return exports.fromReaderTaskEither(RTE.fromReaderEither(ma));
}
exports.fromReaderEither = fromReaderEither;
/**
 * @category constructors
 * @since 2.0.0
 */
function rightIO(ma) {
    return exports.fromReaderTaskEither(RTE.rightIO(ma));
}
exports.rightIO = rightIO;
/**
 * @category constructors
 * @since 2.0.0
 */
function leftIO(me) {
    return exports.fromReaderTaskEither(RTE.leftIO(me));
}
exports.leftIO = leftIO;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightState = function (sa) {
    return function_1.flow(sa, RTE.right);
};
/**
 * @category constructors
 * @since 2.0.0
 */
exports.leftState = function (me) { return function (s) { return RTE.left(me(s)[0]); }; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromReaderTaskEither = function (fa) { return function (s) {
    return function_1.pipe(fa, RTE.map(function (a) { return [a, s]; }));
}; };
/**
 * Get the current state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.get = function () { return function (s) { return RTE.right([s, s]); }; };
/**
 * Set the state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.put = function (s) { return function () {
    return RTE.right([undefined, s]);
}; };
/**
 * Modify the state by applying a function to the current state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.modify = function (f) { return function (s) {
    return RTE.right([undefined, f(s)]);
}; };
/**
 * Get a value which depends on the current state
 *
 * @category constructors
 * @since 2.0.0
 */
exports.gets = function (f) { return function (s) {
    return RTE.right([f(s), s]);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromEither = 
/*#__PURE__*/
E.fold(function (e) { return exports.left(e); }, exports.right);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromOption = function (onNone) { return function (ma) { return (ma._tag === 'None' ? exports.left(onNone()) : exports.right(ma.value)); }; };
/**
 * @category constructors
 * @since 2.4.4
 */
exports.fromPredicate = function (predicate, onFalse) { return function (a) {
    return predicate(a) ? exports.right(a) : exports.left(onFalse(a));
}; };
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.4.0
 */
function fromEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromEither(f.apply(void 0, a));
    };
}
exports.fromEitherK = fromEitherK;
/**
 * Less strict version of [`chainEitherK`](#chainEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainEitherKW = function (f) { return function (ma) { return function_1.pipe(ma, exports.chainW(fromEitherK(f))); }; };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainEitherK = exports.chainEitherKW;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromIOEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return fromIOEither(f.apply(void 0, a));
    };
}
exports.fromIOEitherK = fromIOEitherK;
/**
 * Less strict version of [`chainIOEitherK`](#chainIOEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainIOEitherKW = function (f) { return function (ma) { return function_1.pipe(ma, exports.chainW(fromIOEitherK(f))); }; };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainIOEitherK = exports.chainIOEitherKW;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromTaskEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return fromTaskEither(f.apply(void 0, a));
    };
}
exports.fromTaskEitherK = fromTaskEitherK;
/**
 * Less strict version of [`chainTaskEitherK`](#chainTaskEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainTaskEitherKW = function (f) { return function (ma) { return function_1.pipe(ma, exports.chainW(fromTaskEitherK(f))); }; };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainTaskEitherK = exports.chainTaskEitherKW;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromReaderTaskEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromReaderTaskEither(f.apply(void 0, a));
    };
}
exports.fromReaderTaskEitherK = fromReaderTaskEitherK;
/**
 * Less strict version of [`chainReaderTaskEitherK`](#chainReaderTaskEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainReaderTaskEitherKW = function (f) { return function (ma) { return function_1.pipe(ma, exports.chainW(fromReaderTaskEitherK(f))); }; };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainReaderTaskEitherK = exports.chainReaderTaskEitherKW;
/**
 * @category combinators
 * @since 2.4.4
 */
exports.filterOrElse = function (predicate, onFalse) {
    return exports.chain(function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); });
};
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var ap_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var alt_ = function (fa, that) { return function (s) {
    return function_1.pipe(fa(s), RTE.alt(function () { return that()(s); }));
}; };
var bimap_ = function (fea, f, g) { return function (s) {
    return function_1.pipe(fea(s), RTE.bimap(f, function (_a) {
        var a = _a[0], s = _a[1];
        return [g(a), s];
    }));
}; };
var mapLeft_ = function (fea, f) { return function (s) { return function_1.pipe(fea(s), RTE.mapLeft(f)); }; };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return function (s1) {
    return function_1.pipe(fa(s1), RTE.map(function (_a) {
        var a = _a[0], s2 = _a[1];
        return [f(a), s2];
    }));
}; }; };
/**
 * Map a pair of functions over the two last type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.6.2
 */
exports.bimap = function (f, g) { return function (fa) {
    return bimap_(fa, f, g);
}; };
/**
 * Map a function over the third type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.6.2
 */
exports.mapLeft = function (f) { return function (fa) {
    return mapLeft_(fa, f);
}; };
/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 2.8.0
 */
exports.apW = function (fa) { return function (fab) { return function (s1) {
    return function_1.pipe(fab(s1), RTE.chainW(function (_a) {
        var f = _a[0], s2 = _a[1];
        return function_1.pipe(fa(s2), RTE.map(function (_a) {
            var a = _a[0], s3 = _a[1];
            return [f(a), s3];
        }));
    }));
}; }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = exports.apW;
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * @category Applicative
 * @since 2.7.0
 */
exports.of = exports.right;
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
exports.chainW = function (f) { return function (ma) { return function (s1) {
    return function_1.pipe(ma(s1), RTE.chainW(function (_a) {
        var a = _a[0], s2 = _a[1];
        return f(a)(s2);
    }));
}; }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = exports.chainW;
/**
 * Less strict version of [`chainFirst`](#chainFirst).
 *
 * @category Monad
 * @since 2.8.0
 */
exports.chainFirstW = function (f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = exports.chainFirstW;
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * @category Alt
 * @since 2.6.2
 */
exports.alt = function (that) { return function (fa) { return function (s) {
    return function_1.pipe(fa(s), RTE.alt(function () { return that()(s); }));
}; }; };
/**
 * @category MonadIO
 * @since 2.7.0
 */
exports.fromIO = rightIO;
/**
 * @category MonadTask
 * @since 2.7.0
 */
exports.fromTask = rightTask;
/**
 * @category MonadThrow
 * @since 2.7.0
 */
exports.throwError = exports.left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'StateReaderTaskEither';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.stateReaderTaskEither = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    alt: alt_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask,
    throwError: exports.throwError
};
// TODO: remove in v3
/**
 * Like `stateReaderTaskEither` but `ap` is sequential
 *
 * @category instances
 * @since 2.0.0
 */
exports.stateReaderTaskEitherSeq = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    alt: alt_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask,
    throwError: exports.throwError
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
// TODO: remove in v3
/* tslint:disable:readonly-array */
/**
 * @since 2.0.0
 */
/* istanbul ignore next */
function run(ma, s, r) {
    return ma(s)(r)();
}
exports.run = run;
/* tslint:enable:readonly-array */
/**
 * Use `evaluate` instead
 *
 * @since 2.0.0
 * @deprecated
 */
/* istanbul ignore next */
exports.evalState = function (fsa, s) {
    return function_1.pipe(fsa(s), RTE.map(function (_a) {
        var a = _a[0];
        return a;
    }));
};
/**
 * Use `execute` instead
 *
 * @since 2.0.0
 * @deprecated
 */
/* istanbul ignore next */
exports.execState = function (fsa, s) {
    return function_1.pipe(fsa(s), RTE.map(function (_a) {
        var _ = _a[0], s = _a[1];
        return s;
    }));
};
/**
 * Run a computation in the `StateReaderTaskEither` monad, discarding the final state
 *
 * @since 2.8.0
 */
exports.evaluate = function (s) { return function (ma) {
    return function_1.pipe(ma(s), RTE.map(function (_a) {
        var a = _a[0];
        return a;
    }));
}; };
/**
 * Run a computation in the `StateReaderTaskEither` monad discarding the result
 *
 * @since 2.8.0
 */
exports.execute = function (s) { return function (ma) {
    return function_1.pipe(ma(s), RTE.map(function (_a) {
        var _ = _a[0], s = _a[1];
        return s;
    }));
}; };
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) {
    return exports.map(function_1.bindTo_(name));
};
/**
 * @since 2.8.0
 */
exports.bindW = function (name, f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
/**
 * @since 2.8.0
 */
exports.bind = exports.bindW;
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apSW = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.apW(fb));
};
/**
 * @since 2.8.0
 */
exports.apS = exports.apSW;


/***/ }),

/***/ 6790:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getStateM = void 0;
function getStateM(M) {
    return {
        map: function (fa, f) { return function (s) { return M.map(fa(s), function (_a) {
            var a = _a[0], s1 = _a[1];
            return [f(a), s1];
        }); }; },
        of: function (a) { return function (s) { return M.of([a, s]); }; },
        ap: function (fab, fa) { return function (s) { return M.chain(fab(s), function (_a) {
            var f = _a[0], s = _a[1];
            return M.map(fa(s), function (_a) {
                var a = _a[0], s = _a[1];
                return [f(a), s];
            });
        }); }; },
        chain: function (fa, f) { return function (s) { return M.chain(fa(s), function (_a) {
            var a = _a[0], s1 = _a[1];
            return f(a)(s1);
        }); }; },
        get: function () { return function (s) { return M.of([s, s]); }; },
        put: function (s) { return function () { return M.of([undefined, s]); }; },
        modify: function (f) { return function (s) { return M.of([undefined, f(s)]); }; },
        gets: function (f) { return function (s) { return M.of([f(s), s]); }; },
        fromState: function (sa) { return function (s) { return M.of(sa(s)); }; },
        fromM: function (ma) { return function (s) { return M.map(ma, function (a) { return [a, s]; }); }; },
        evalState: function (ma, s) { return M.map(ma(s), function (_a) {
            var a = _a[0];
            return a;
        }); },
        execState: function (ma, s) { return M.map(ma(s), function (_a) {
            var _ = _a[0], s = _a[1];
            return s;
        }); }
    };
}
exports.getStateM = getStateM;


/***/ }),

/***/ 8914:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.store = exports.Comonad = exports.Functor = exports.URI = exports.map = exports.duplicate = exports.extract = exports.extend = exports.experiment = exports.peeks = exports.seeks = exports.seek = void 0;
var function_1 = __webpack_require__(6985);
/**
 * Reposition the focus at the specified position
 *
 * @since 2.0.0
 */
function seek(s) {
    return function (wa) { return ({ peek: wa.peek, pos: s }); };
}
exports.seek = seek;
/**
 * Reposition the focus at the specified position, which depends on the current position
 *
 * @since 2.0.0
 */
function seeks(f) {
    return function (wa) { return ({ peek: wa.peek, pos: f(wa.pos) }); };
}
exports.seeks = seeks;
/**
 * Extract a value from a position which depends on the current position
 *
 * @since 2.0.0
 */
function peeks(f) {
    return function (wa) { return wa.peek(f(wa.pos)); };
}
exports.peeks = peeks;
function experiment(F) {
    return function (f) { return function (wa) { return F.map(f(wa.pos), function (s) { return wa.peek(s); }); }; };
}
exports.experiment = experiment;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var extend_ = function (wa, f) { return function_1.pipe(wa, exports.extend(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * @category Extend
 * @since 2.0.0
 */
exports.extend = function (f) { return function (wa) { return ({
    peek: function (s) { return f({ peek: wa.peek, pos: s }); },
    pos: wa.pos
}); }; };
/**
 * @category Extract
 * @since 2.6.2
 */
exports.extract = function (wa) { return wa.peek(wa.pos); };
/**
 * @category Extend
 * @since 2.0.0
 */
exports.duplicate = 
/*#__PURE__*/
exports.extend(function_1.identity);
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return ({
    peek: function (s) { return f(fa.peek(s)); },
    pos: fa.pos
}); }; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Store';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Comonad = {
    URI: exports.URI,
    map: map_,
    extend: extend_,
    extract: exports.extract
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.store = exports.Comonad;


/***/ }),

/***/ 6912:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fanout = exports.splitStrong = void 0;
var function_1 = __webpack_require__(6985);
function splitStrong(F) {
    return function (pab, pcd) { return F.compose(F.first(pab), F.second(pcd)); };
}
exports.splitStrong = splitStrong;
function fanout(F) {
    var splitStrongF = splitStrong(F);
    return function (pab, pac) {
        var split = F.promap(F.id(), function_1.identity, function (a) { return [a, a]; });
        return F.compose(splitStrongF(pab, pac), split);
    };
}
exports.fanout = fanout;


/***/ }),

/***/ 2664:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.bind = exports.bindTo = exports.never = exports.taskSeq = exports.task = exports.Monad = exports.ApplicativeSeq = exports.ApplicativePar = exports.Functor = exports.getRaceMonoid = exports.getMonoid = exports.getSemigroup = exports.URI = exports.fromTask = exports.flatten = exports.chainFirst = exports.chain = exports.of = exports.apSecond = exports.apFirst = exports.ap = exports.map = exports.chainIOK = exports.fromIOK = exports.delay = exports.fromIO = void 0;
var function_1 = __webpack_require__(6985);
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromIO = function (ma) { return function () { return Promise.resolve(ma()); }; };
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * Creates a task that will complete after a time delay
 *
 * @example
 * import { sequenceT } from 'fp-ts/Apply'
 * import * as T from 'fp-ts/Task'
 *
 * async function test() {
 *   const log: Array<string> = []
 *   const append = (message: string): T.Task<void> =>
 *     T.fromIO(() => {
 *       log.push(message)
 *     })
 *   const fa = append('a')
 *   const fb = append('b')
 *   const fc = T.delay(10)(append('c'))
 *   const fd = append('d')
 *   await sequenceT(T.task)(fa, fb, fc, fd)()
 *   assert.deepStrictEqual(log, ['a', 'b', 'd', 'c'])
 * }
 *
 * test()
 *
 * @category combinators
 * @since 2.0.0
 */
function delay(millis) {
    return function (ma) { return function () {
        return new Promise(function (resolve) {
            setTimeout(function () {
                // tslint:disable-next-line: no-floating-promises
                ma().then(resolve);
            }, millis);
        });
    }; };
}
exports.delay = delay;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromIOK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromIO(f.apply(void 0, a));
    };
}
exports.fromIOK = fromIOK;
/**
 * @category combinators
 * @since 2.4.0
 */
function chainIOK(f) {
    return exports.chain(fromIOK(f));
}
exports.chainIOK = chainIOK;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
var apPar_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var apSeq_ = function (fab, fa) {
    return function_1.pipe(fab, exports.chain(function (f) { return function_1.pipe(fa, exports.map(f)); }));
};
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return function () { return fa().then(f); }; }; };
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) { return function () {
    return Promise.all([fab(), fa()]).then(function (_a) {
        var f = _a[0], a = _a[1];
        return f(a);
    });
}; }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * @category Applicative
 * @since 2.0.0
 */
exports.of = function (a) { return function () { return Promise.resolve(a); }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = function (f) { return function (ma) { return function () {
    return ma().then(function (a) { return f(a)(); });
}; }; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = function (f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * @category MonadTask
 * @since 2.7.0
 */
exports.fromTask = function_1.identity;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Task';
/**
 * Lift a semigroup into 'Task', the inner values are concatenated using the provided `Semigroup`.
 *
 * @example
 * import * as T from 'fp-ts/Task'
 * import { semigroupString } from 'fp-ts/Semigroup'
 *
 * async function test() {
 *   const S = T.getSemigroup(semigroupString)
 *   const fa = T.of('a')
 *   const fb = T.of('b')
 *   assert.deepStrictEqual(await S.concat(fa, fb)(), 'ab')
 * }
 *
 * test()
 *
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return {
        concat: function (x, y) { return function () { return x().then(function (rx) { return y().then(function (ry) { return S.concat(rx, ry); }); }); }; }
    };
}
exports.getSemigroup = getSemigroup;
/**
 * Lift a monoid into 'Task', the inner values are concatenated using the provided `Monoid`.
 *
 * @category instances
 * @since 2.0.0
 */
function getMonoid(M) {
    return {
        concat: getSemigroup(M).concat,
        empty: exports.of(M.empty)
    };
}
exports.getMonoid = getMonoid;
/**
 * Monoid returning the first completed task.
 *
 * Note: uses `Promise.race` internally.
 *
 * @example
 * import * as T from 'fp-ts/Task'
 *
 * async function test() {
 *   const S = T.getRaceMonoid<string>()
 *   const fa = T.delay(20)(T.of('a'))
 *   const fb = T.delay(10)(T.of('b'))
 *   assert.deepStrictEqual(await S.concat(fa, fb)(), 'b')
 * }
 *
 * test()
 *
 * @category instances
 * @since 2.0.0
 */
function getRaceMonoid() {
    return {
        concat: function (x, y) { return function () { return Promise.race([x(), y()]); }; },
        empty: exports.never
    };
}
exports.getRaceMonoid = getRaceMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ApplicativePar = {
    URI: exports.URI,
    map: map_,
    ap: apPar_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ApplicativeSeq = {
    URI: exports.URI,
    map: map_,
    ap: apSeq_,
    of: exports.of
};
/**
 * Used in TaskEither.getTaskValidation
 *
 * @internal
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apPar_,
    chain: chain_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.task = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apPar_,
    chain: chain_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask
};
// TODO: remove in v3
/**
 * Like `task` but `ap` is sequential
 *
 * @category instances
 * @since 2.0.0
 */
exports.taskSeq = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: apSeq_,
    chain: chain_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask
};
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * A `Task` that never completes.
 *
 * @since 2.0.0
 */
exports.never = function () { return new Promise(function (_) { return undefined; }); };
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) { return exports.map(function_1.bindTo_(name)); };
/**
 * @since 2.8.0
 */
exports.bind = function (name, f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apS = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.ap(fb));
};


/***/ }),

/***/ 437:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.apSW = exports.bind = exports.bindW = exports.bindTo = exports.bracket = exports.taskify = exports.taskEitherSeq = exports.taskEither = exports.Alt = exports.Bifunctor = exports.ApplicativeSeq = exports.ApplicativePar = exports.Functor = exports.getFilterable = exports.getTaskValidation = exports.getAltTaskValidation = exports.getApplicativeTaskValidation = exports.getApplyMonoid = exports.getApplySemigroup = exports.getSemigroup = exports.URI = exports.throwError = exports.fromTask = exports.fromIO = exports.of = exports.alt = exports.flatten = exports.chainFirst = exports.chainFirstW = exports.chain = exports.chainW = exports.apSecond = exports.apFirst = exports.ap = exports.apW = exports.mapLeft = exports.bimap = exports.map = exports.chainIOEitherK = exports.chainIOEitherKW = exports.chainEitherK = exports.chainEitherKW = exports.fromIOEitherK = exports.fromEitherK = exports.tryCatchK = exports.filterOrElse = exports.swap = exports.orElse = exports.getOrElse = exports.getOrElseW = exports.fold = exports.tryCatch = exports.fromPredicate = exports.fromOption = exports.fromEither = exports.fromIOEither = exports.leftIO = exports.rightIO = exports.leftTask = exports.rightTask = exports.right = exports.left = void 0;
var E = __importStar(__webpack_require__(7534));
var Filterable_1 = __webpack_require__(6907);
var function_1 = __webpack_require__(6985);
var T = __importStar(__webpack_require__(2664));
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @category constructors
 * @since 2.0.0
 */
exports.left = 
/*#__PURE__*/
function_1.flow(E.left, T.of);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.right = 
/*#__PURE__*/
function_1.flow(E.right, T.of);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightTask = 
/*#__PURE__*/
T.map(E.right);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.leftTask = 
/*#__PURE__*/
T.map(E.left);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.rightIO = 
/*#__PURE__*/
function_1.flow(T.fromIO, exports.rightTask);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.leftIO = 
/*#__PURE__*/
function_1.flow(T.fromIO, exports.leftTask);
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromIOEither = T.fromIO;
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromEither = 
/*#__PURE__*/
E.fold(exports.left, function (a) { return exports.right(a); });
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromOption = function (onNone) { return function (ma) {
    return ma._tag === 'None' ? exports.left(onNone()) : exports.right(ma.value);
}; };
/**
 * @category constructors
 * @since 2.0.0
 */
exports.fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); }; };
/**
 * Transforms a `Promise` that may reject to a `Promise` that never rejects and returns an `Either` instead.
 *
 * Note: `f` should never `throw` errors, they are not caught.
 *
 * @example
 * import { left, right } from 'fp-ts/Either'
 * import { tryCatch } from 'fp-ts/TaskEither'
 *
 * tryCatch(() => Promise.resolve(1), String)().then(result => {
 *   assert.deepStrictEqual(result, right(1))
 * })
 * tryCatch(() => Promise.reject('error'), String)().then(result => {
 *   assert.deepStrictEqual(result, left('error'))
 * })
 *
 * @category constructors
 * @since 2.0.0
 */
function tryCatch(f, onRejected) {
    return function () { return f().then(E.right, function (reason) { return E.left(onRejected(reason)); }); };
}
exports.tryCatch = tryCatch;
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.0.0
 */
exports.fold = 
/*#__PURE__*/
function_1.flow(E.fold, T.chain);
/**
 * Less strict version of [`getOrElse`](#getOrElse).
 *
 * @category destructors
 * @since 2.6.0
 */
exports.getOrElseW = function (onLeft) { return function (ma) {
    return function_1.pipe(ma, T.chain(E.fold(onLeft, T.of)));
}; };
/**
 * @category destructors
 * @since 2.0.0
 */
exports.getOrElse = exports.getOrElseW;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * Returns `ma` if is a `Right` or the value returned by `onLeft` otherwise.
 *
 * See also [alt](#alt).
 *
 * @example
 * import * as E from 'fp-ts/Either'
 * import { pipe } from 'fp-ts/function'
 * import * as TE from 'fp-ts/TaskEither'
 *
 * async function test() {
 *   const errorHandler = TE.orElse((error: string) => TE.right(`recovering from ${error}...`))
 *   assert.deepStrictEqual(await pipe(TE.right('ok'), errorHandler)(), E.right('ok'))
 *   assert.deepStrictEqual(await pipe(TE.left('ko'), errorHandler)(), E.right('recovering from ko...'))
 * }
 *
 * test()
 *
 * @category combinators
 * @since 2.0.0
 */
exports.orElse = function (f) { return T.chain(E.fold(f, exports.right)); };
/**
 * @category combinators
 * @since 2.0.0
 */
exports.swap = 
/*#__PURE__*/
T.map(E.swap);
/**
 * @category combinators
 * @since 2.0.0
 */
exports.filterOrElse = function (predicate, onFalse) {
    return exports.chain(function (a) { return (predicate(a) ? exports.right(a) : exports.left(onFalse(a))); });
};
/**
 * Converts a function returning a `Promise` to one returning a `TaskEither`.
 *
 * @category combinators
 * @since 2.5.0
 */
function tryCatchK(f, onRejected) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return tryCatch(function () { return f.apply(void 0, a); }, onRejected);
    };
}
exports.tryCatchK = tryCatchK;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromEither(f.apply(void 0, a));
    };
}
exports.fromEitherK = fromEitherK;
/**
 * @category combinators
 * @since 2.4.0
 */
function fromIOEitherK(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return exports.fromIOEither(f.apply(void 0, a));
    };
}
exports.fromIOEitherK = fromIOEitherK;
/**
 * Less strict version of [`chainEitherK`](#chainEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainEitherKW = function (f) { return exports.chainW(fromEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainEitherK = exports.chainEitherKW;
/**
 * Less strict version of [`chainIOEitherK`](#chainIOEitherK).
 *
 * @category combinators
 * @since 2.6.1
 */
exports.chainIOEitherKW = function (f) { return exports.chainW(fromIOEitherK(f)); };
/**
 * @category combinators
 * @since 2.4.0
 */
exports.chainIOEitherK = exports.chainIOEitherKW;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return function_1.pipe(fa, exports.bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return function_1.pipe(fa, exports.mapLeft(f)); };
var apPar_ = function (fab, fa) { return function_1.pipe(fab, exports.ap(fa)); };
var apSeq_ = function (fab, fa) {
    return function_1.pipe(fab, exports.chain(function (f) { return function_1.pipe(fa, exports.map(f)); }));
};
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var alt_ = function (fa, that) { return function_1.pipe(fa, exports.alt(that)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return T.map(E.map(f)); };
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.bimap = 
/*#__PURE__*/
function_1.flow(E.bimap, T.map);
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.mapLeft = function (f) {
    return T.map(E.mapLeft(f));
};
/**
 * Less strict version of [`ap`](#ap).
 *
 * @category Apply
 * @since 2.8.0
 */
exports.apW = function (fa) {
    return function_1.flow(T.map(function (gab) { return function (ga) { return E.apW(ga)(gab); }; }), T.ap(fa));
};
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = exports.apW;
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * Less strict version of [`chain`](#chain).
 *
 * @category Monad
 * @since 2.6.0
 */
exports.chainW = function (f) { return function (ma) {
    return function_1.pipe(ma, T.chain(E.fold(exports.left, f)));
}; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = exports.chainW;
/**
 * Less strict version of [`chainFirst`](#chainFirst).
 *
 * @category Monad
 * @since 2.8.0
 */
exports.chainFirstW = function (f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = exports.chainFirstW;
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * Identifies an associative operation on a type constructor. It is similar to `Semigroup`, except that it applies to
 * types of kind `* -> *`.
 *
 * In case of `TaskEither` returns `fa` if is a `Right` or the value returned by `that` otherwise.
 *
 * See also [orElse](#orElse).
 *
 * @example
 * import * as E from 'fp-ts/Either'
 * import { pipe } from 'fp-ts/function'
 * import * as TE from 'fp-ts/TaskEither'
 *
 * async function test() {
 *   assert.deepStrictEqual(
 *     await pipe(
 *       TE.right(1),
 *       TE.alt(() => TE.right(2))
 *     )(),
 *     E.right(1)
 *   )
 *   assert.deepStrictEqual(
 *     await pipe(
 *       TE.left('a'),
 *       TE.alt(() => TE.right(2))
 *     )(),
 *     E.right(2)
 *   )
 *   assert.deepStrictEqual(
 *     await pipe(
 *       TE.left('a'),
 *       TE.alt(() => TE.left('b'))
 *     )(),
 *     E.left('b')
 *   )
 * }
 *
 * test()
 *
 * @category Alt
 * @since 2.0.0
 */
exports.alt = function (that) {
    return T.chain(E.fold(that, exports.right));
};
/**
 * @category Applicative
 * @since 2.0.0
 */
exports.of = exports.right;
/**
 * @category MonadIO
 * @since 2.7.0
 */
exports.fromIO = exports.rightIO;
/**
 * @category MonadTask
 * @since 2.7.0
 */
exports.fromTask = exports.rightTask;
/**
 * @category MonadTask
 * @since 2.7.0
 */
exports.throwError = exports.left;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'TaskEither';
/**
 * Semigroup returning the left-most non-`Left` value. If both operands are `Right`s then the inner values are
 * concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(S) {
    return T.getSemigroup(E.getSemigroup(S));
}
exports.getSemigroup = getSemigroup;
/**
 * Semigroup returning the left-most `Left` value. If both operands are `Right`s then the inner values
 * are concatenated using the provided `Semigroup`
 *
 * @category instances
 * @since 2.0.0
 */
function getApplySemigroup(S) {
    return T.getSemigroup(E.getApplySemigroup(S));
}
exports.getApplySemigroup = getApplySemigroup;
/**
 * @category instances
 * @since 2.0.0
 */
function getApplyMonoid(M) {
    return {
        concat: getApplySemigroup(M).concat,
        empty: exports.right(M.empty)
    };
}
exports.getApplyMonoid = getApplyMonoid;
/**
 * @category instances
 * @since 2.7.0
 */
function getApplicativeTaskValidation(A, SE) {
    var AV = E.getApplicativeValidation(SE);
    var ap = function (fga) { return function (fgab) {
        return A.ap(A.map(fgab, function (h) { return function (ga) { return AV.ap(h, ga); }; }), fga);
    }; };
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return function_1.pipe(fab, ap(fa)); },
        of: exports.of
    };
}
exports.getApplicativeTaskValidation = getApplicativeTaskValidation;
/**
 * @category instances
 * @since 2.7.0
 */
function getAltTaskValidation(SE) {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        alt: function (me, that) {
            return function_1.pipe(me, T.chain(function (e1) {
                return E.isRight(e1)
                    ? T.of(e1)
                    : function_1.pipe(that(), T.map(function (e2) { return (E.isLeft(e2) ? E.left(SE.concat(e1.left, e2.left)) : e2); }));
            }));
        }
    };
}
exports.getAltTaskValidation = getAltTaskValidation;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
function getTaskValidation(SE) {
    var applicativeTaskValidation = getApplicativeTaskValidation(T.ApplicativePar, SE);
    var altTaskValidation = getAltTaskValidation(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: applicativeTaskValidation.ap,
        of: exports.of,
        chain: chain_,
        bimap: bimap_,
        mapLeft: mapLeft_,
        alt: altTaskValidation.alt,
        fromIO: exports.fromIO,
        fromTask: exports.fromTask,
        throwError: exports.throwError
    };
}
exports.getTaskValidation = getTaskValidation;
/**
 * @category instances
 * @since 2.1.0
 */
function getFilterable(M) {
    var W = E.getWitherable(M);
    var F = Filterable_1.getFilterableComposition(T.Monad, W);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        compact: F.compact,
        separate: F.separate,
        filter: F.filter,
        filterMap: F.filterMap,
        partition: F.partition,
        partitionMap: F.partitionMap
    };
}
exports.getFilterable = getFilterable;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ApplicativePar = {
    URI: exports.URI,
    map: map_,
    ap: apPar_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.ApplicativeSeq = {
    URI: exports.URI,
    map: map_,
    ap: apSeq_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Alt = {
    URI: exports.URI,
    map: map_,
    alt: alt_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.taskEither = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_,
    map: map_,
    of: exports.of,
    ap: apPar_,
    chain: chain_,
    alt: alt_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask,
    throwError: exports.throwError
};
// TODO: remove in v3
/**
 * Like `TaskEither` but `ap` is sequential
 *
 * @category instances
 * @since 2.0.0
 */
exports.taskEitherSeq = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_,
    map: map_,
    of: exports.of,
    ap: apSeq_,
    chain: chain_,
    alt: alt_,
    fromIO: exports.fromIO,
    fromTask: exports.fromTask,
    throwError: exports.throwError
};
function taskify(f) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return function () {
            return new Promise(function (resolve) {
                var cbResolver = function (e, r) { return (e != null ? resolve(E.left(e)) : resolve(E.right(r))); };
                f.apply(null, args.concat(cbResolver));
            });
        };
    };
}
exports.taskify = taskify;
/**
 * Make sure that a resource is cleaned up in the event of an exception (\*). The release action is called regardless of
 * whether the body action throws (\*) or returns.
 *
 * (\*) i.e. returns a `Left`
 *
 * @since 2.0.0
 */
exports.bracket = function (acquire, use, release) {
    return function_1.pipe(acquire, exports.chain(function (a) {
        return function_1.pipe(function_1.pipe(use(a), T.map(E.right)), exports.chain(function (e) {
            return function_1.pipe(release(a, e), exports.chain(function () { return (E.isLeft(e) ? exports.left(e.left) : exports.of(e.right)); }));
        }));
    }));
};
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) {
    return exports.map(function_1.bindTo_(name));
};
/**
 * @since 2.8.0
 */
exports.bindW = function (name, f) {
    return exports.chainW(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
/**
 * @since 2.8.0
 */
exports.bind = exports.bindW;
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apSW = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.apW(fb));
};
/**
 * @since 2.8.0
 */
exports.apS = exports.apSW;


/***/ }),

/***/ 7032:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.taskThese = exports.bifunctorTaskThese = exports.functorTaskThese = exports.getMonad = exports.getApplicative = exports.getSemigroup = exports.URI = exports.fromTask = exports.fromIO = exports.of = exports.mapLeft = exports.bimap = exports.map = exports.swap = exports.toTuple = exports.fold = exports.fromIOEither = exports.leftIO = exports.rightIO = exports.leftTask = exports.rightTask = exports.both = exports.right = exports.left = void 0;
var function_1 = __webpack_require__(6985);
var T = __importStar(__webpack_require__(2664));
var TH = __importStar(__webpack_require__(3977));
/**
 * @category constructors
 * @since 2.4.0
 */
exports.left = 
/*#__PURE__*/
function_1.flow(TH.left, T.of);
/**
 * @category constructors
 * @since 2.4.0
 */
exports.right = 
/*#__PURE__*/
function_1.flow(TH.right, T.of);
/**
 * @category constructors
 * @since 2.4.0
 */
exports.both = 
/*#__PURE__*/
function_1.flow(TH.both, T.of);
/**
 * @category constructors
 * @since 2.4.0
 */
exports.rightTask = 
/*#__PURE__*/
T.map(TH.right);
/**
 * @category constructors
 * @since 2.4.0
 */
exports.leftTask = 
/*#__PURE__*/
T.map(TH.left);
/**
 * @category constructors
 * @since 2.4.0
 */
exports.rightIO = 
/*#__PURE__*/
function_1.flow(T.fromIO, exports.rightTask);
/**
 * @category constructors
 * @since 2.4.0
 */
exports.leftIO = 
/*#__PURE__*/
function_1.flow(T.fromIO, exports.leftTask);
/**
 * @category constructors
 * @since 2.4.0
 */
exports.fromIOEither = 
/*#__PURE__*/
T.fromIO;
// -------------------------------------------------------------------------------------
// destructors
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.4.0
 */
exports.fold = 
/*#__PURE__*/
function_1.flow(TH.fold, T.chain);
// TODO: make lazy in v3
/* tslint:disable:readonly-array */
/**
 * @category destructors
 * @since 2.4.0
 */
exports.toTuple = 
/*#__PURE__*/
function_1.flow(TH.toTuple, T.map);
/* tslint:enable:readonly-array */
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category combinators
 * @since 2.4.0
 */
exports.swap = 
/*#__PURE__*/
T.map(TH.swap);
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return function_1.pipe(fa, exports.bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return function_1.pipe(fa, exports.mapLeft(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.4.0
 */
exports.map = function (f) { return T.map(TH.map(f)); };
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.4.0
 */
exports.bimap = function (f, g) {
    return T.map(TH.bimap(f, g));
};
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.4.0
 */
exports.mapLeft = function (f) {
    return T.map(TH.mapLeft(f));
};
/**
 * @category Applicative
 * @since 2.7.0
 */
exports.of = exports.right;
/**
 * @category MonadIO
 * @since 2.7.0
 */
exports.fromIO = exports.rightIO;
/**
 * @category MonadIO
 * @since 2.7.0
 */
exports.fromTask = exports.rightTask;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.4.0
 */
exports.URI = 'TaskThese';
/**
 * @category instances
 * @since 2.4.0
 */
function getSemigroup(SE, SA) {
    return T.getSemigroup(TH.getSemigroup(SE, SA));
}
exports.getSemigroup = getSemigroup;
/**
 * @category instances
 * @since 2.7.0
 */
function getApplicative(A, SE) {
    var AV = TH.getApplicative(SE);
    var ap = function (fga) { return function (fgab) {
        return A.ap(A.map(fgab, function (h) { return function (ga) { return AV.ap(h, ga); }; }), fga);
    }; };
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return function_1.pipe(fab, ap(fa)); },
        of: exports.of
    };
}
exports.getApplicative = getApplicative;
// TODO: remove in v3 in favour of a non-constrained Monad / MonadTask instance
/**
 * @category instances
 * @since 2.4.0
 */
function getMonad(SE) {
    var A = getApplicative(T.ApplicativePar, SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: A.ap,
        of: exports.of,
        chain: function (ma, f) {
            return function_1.pipe(ma, T.chain(TH.fold(exports.left, f, function (e1, a) {
                return function_1.pipe(f(a), T.map(TH.fold(function (e2) { return TH.left(SE.concat(e1, e2)); }, TH.right, function (e2, b) { return TH.both(SE.concat(e1, e2), b); })));
            })));
        },
        fromIO: exports.fromIO,
        fromTask: exports.fromTask
    };
}
exports.getMonad = getMonad;
/**
 * @category instances
 * @since 2.7.0
 */
exports.functorTaskThese = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.bifunctorTaskThese = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.4.0
 */
exports.taskThese = {
    URI: exports.URI,
    map: map_,
    bimap: bimap_,
    mapLeft: mapLeft_
};


/***/ }),

/***/ 3977:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.these = exports.Traversable = exports.Foldable = exports.Bifunctor = exports.Functor = exports.URI = exports.sequence = exports.traverse = exports.reduceRight = exports.foldMap = exports.reduce = exports.map = exports.mapLeft = exports.bimap = exports.fromOptions = exports.getRightOnly = exports.getLeftOnly = exports.rightOrBoth = exports.leftOrBoth = exports.isBoth = exports.isRight = exports.isLeft = exports.getRight = exports.getLeft = exports.toTuple = exports.getMonad = exports.getApplicative = exports.getSemigroup = exports.getEq = exports.getShow = exports.swap = exports.fold = exports.both = exports.right = exports.left = void 0;
var Eq_1 = __webpack_require__(6964);
var Option_1 = __webpack_require__(2569);
var function_1 = __webpack_require__(6985);
/**
 * @category constructors
 * @since 2.0.0
 */
function left(left) {
    return { _tag: 'Left', left: left };
}
exports.left = left;
/**
 * @category constructors
 * @since 2.0.0
 */
function right(right) {
    return { _tag: 'Right', right: right };
}
exports.right = right;
/**
 * @category constructors
 * @since 2.0.0
 */
function both(left, right) {
    return { _tag: 'Both', left: left, right: right };
}
exports.both = both;
/**
 * @category destructors
 * @since 2.0.0
 */
function fold(onLeft, onRight, onBoth) {
    return function (fa) {
        switch (fa._tag) {
            case 'Left':
                return onLeft(fa.left);
            case 'Right':
                return onRight(fa.right);
            case 'Both':
                return onBoth(fa.left, fa.right);
        }
    };
}
exports.fold = fold;
/**
 * @category combinators
 * @since 2.4.0
 */
exports.swap = fold(right, left, function (e, a) { return both(a, e); });
/**
 * @category instances
 * @since 2.0.0
 */
function getShow(SE, SA) {
    return {
        show: fold(function (l) { return "left(" + SE.show(l) + ")"; }, function (a) { return "right(" + SA.show(a) + ")"; }, function (l, a) { return "both(" + SE.show(l) + ", " + SA.show(a) + ")"; })
    };
}
exports.getShow = getShow;
/**
 * @category instances
 * @since 2.0.0
 */
function getEq(EE, EA) {
    return Eq_1.fromEquals(function (x, y) {
        return isLeft(x)
            ? isLeft(y) && EE.equals(x.left, y.left)
            : isRight(x)
                ? isRight(y) && EA.equals(x.right, y.right)
                : isBoth(y) && EE.equals(x.left, y.left) && EA.equals(x.right, y.right);
    });
}
exports.getEq = getEq;
/**
 * @category instances
 * @since 2.0.0
 */
function getSemigroup(SE, SA) {
    return {
        concat: function (x, y) {
            return isLeft(x)
                ? isLeft(y)
                    ? left(SE.concat(x.left, y.left))
                    : isRight(y)
                        ? both(x.left, y.right)
                        : both(SE.concat(x.left, y.left), y.right)
                : isRight(x)
                    ? isLeft(y)
                        ? both(y.left, x.right)
                        : isRight(y)
                            ? right(SA.concat(x.right, y.right))
                            : both(y.left, SA.concat(x.right, y.right))
                    : isLeft(y)
                        ? both(SE.concat(x.left, y.left), x.right)
                        : isRight(y)
                            ? both(x.left, SA.concat(x.right, y.right))
                            : both(SE.concat(x.left, y.left), SA.concat(x.right, y.right));
        }
    };
}
exports.getSemigroup = getSemigroup;
/**
 * @category instances
 * @since 2.7.0
 */
function getApplicative(SE) {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        of: right,
        ap: function (fab, fa) {
            return isLeft(fab)
                ? isLeft(fa)
                    ? left(SE.concat(fab.left, fa.left))
                    : isRight(fa)
                        ? left(fab.left)
                        : left(SE.concat(fab.left, fa.left))
                : isRight(fab)
                    ? isLeft(fa)
                        ? left(fa.left)
                        : isRight(fa)
                            ? right(fab.right(fa.right))
                            : both(fa.left, fab.right(fa.right))
                    : isLeft(fa)
                        ? left(SE.concat(fab.left, fa.left))
                        : isRight(fa)
                            ? both(fab.left, fab.right(fa.right))
                            : both(SE.concat(fab.left, fa.left), fab.right(fa.right));
        }
    };
}
exports.getApplicative = getApplicative;
/**
 * @category instances
 * @since 2.0.0
 */
function getMonad(SE) {
    var chain = function (ma, f) {
        if (isLeft(ma)) {
            return ma;
        }
        if (isRight(ma)) {
            return f(ma.right);
        }
        var fb = f(ma.right);
        return isLeft(fb)
            ? left(SE.concat(ma.left, fb.left))
            : isRight(fb)
                ? both(ma.left, fb.right)
                : both(SE.concat(ma.left, fb.left), fb.right);
    };
    var applicative = getApplicative(SE);
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        of: right,
        ap: applicative.ap,
        chain: chain,
        throwError: left
    };
}
exports.getMonad = getMonad;
// TODO: make lazy in v3
/* tslint:disable:readonly-array */
/**
 * @example
 * import { toTuple, left, right, both } from 'fp-ts/These'
 *
 * assert.deepStrictEqual(toTuple('a', 1)(left('b')), ['b', 1])
 * assert.deepStrictEqual(toTuple('a', 1)(right(2)), ['a', 2])
 * assert.deepStrictEqual(toTuple('a', 1)(both('b', 2)), ['b', 2])
 *
 * @category destructors
 * @since 2.0.0
 */
function toTuple(e, a) {
    return function (fa) { return (isLeft(fa) ? [fa.left, a] : isRight(fa) ? [e, fa.right] : [fa.left, fa.right]); };
}
exports.toTuple = toTuple;
/* tslint:enable:readonly-array */
/**
 * Returns an `E` value if possible
 *
 * @example
 * import { getLeft, left, right, both } from 'fp-ts/These'
 * import { none, some } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(getLeft(left('a')), some('a'))
 * assert.deepStrictEqual(getLeft(right(1)), none)
 * assert.deepStrictEqual(getLeft(both('a', 1)), some('a'))
 *
 * @category destructors
 * @since 2.0.0
 */
function getLeft(fa) {
    return isLeft(fa) ? Option_1.some(fa.left) : isRight(fa) ? Option_1.none : Option_1.some(fa.left);
}
exports.getLeft = getLeft;
/**
 * Returns an `A` value if possible
 *
 * @example
 * import { getRight, left, right, both } from 'fp-ts/These'
 * import { none, some } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(getRight(left('a')), none)
 * assert.deepStrictEqual(getRight(right(1)), some(1))
 * assert.deepStrictEqual(getRight(both('a', 1)), some(1))
 *
 * @category destructors
 * @since 2.0.0
 */
function getRight(fa) {
    return isLeft(fa) ? Option_1.none : isRight(fa) ? Option_1.some(fa.right) : Option_1.some(fa.right);
}
exports.getRight = getRight;
/**
 * Returns `true` if the these is an instance of `Left`, `false` otherwise
 *
 * @category guards
 * @since 2.0.0
 */
function isLeft(fa) {
    return fa._tag === 'Left';
}
exports.isLeft = isLeft;
/**
 * Returns `true` if the these is an instance of `Right`, `false` otherwise
 *
 * @category guards
 * @since 2.0.0
 */
function isRight(fa) {
    return fa._tag === 'Right';
}
exports.isRight = isRight;
/**
 * Returns `true` if the these is an instance of `Both`, `false` otherwise
 *
 * @category guards
 * @since 2.0.0
 */
function isBoth(fa) {
    return fa._tag === 'Both';
}
exports.isBoth = isBoth;
// TODO: make lazy in v3
/**
 * @example
 * import { leftOrBoth, left, both } from 'fp-ts/These'
 * import { none, some } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(leftOrBoth('a')(none), left('a'))
 * assert.deepStrictEqual(leftOrBoth('a')(some(1)), both('a', 1))
 *
 * @category constructors
 * @since 2.0.0
 */
function leftOrBoth(e) {
    return function (ma) { return (Option_1.isNone(ma) ? left(e) : both(e, ma.value)); };
}
exports.leftOrBoth = leftOrBoth;
// TODO: make lazy in v3
/**
 * @example
 * import { rightOrBoth, right, both } from 'fp-ts/These'
 * import { none, some } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(rightOrBoth(1)(none), right(1))
 * assert.deepStrictEqual(rightOrBoth(1)(some('a')), both('a', 1))
 *
 * @category constructors
 * @since 2.0.0
 */
function rightOrBoth(a) {
    return function (me) { return (Option_1.isNone(me) ? right(a) : both(me.value, a)); };
}
exports.rightOrBoth = rightOrBoth;
/**
 * Returns the `E` value if and only if the value is constructed with `Left`
 *
 * @example
 * import { getLeftOnly, left, right, both } from 'fp-ts/These'
 * import { none, some } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(getLeftOnly(left('a')), some('a'))
 * assert.deepStrictEqual(getLeftOnly(right(1)), none)
 * assert.deepStrictEqual(getLeftOnly(both('a', 1)), none)
 *
 * @category destructors
 * @since 2.0.0
 */
function getLeftOnly(fa) {
    return isLeft(fa) ? Option_1.some(fa.left) : Option_1.none;
}
exports.getLeftOnly = getLeftOnly;
/**
 * Returns the `A` value if and only if the value is constructed with `Right`
 *
 * @example
 * import { getRightOnly, left, right, both } from 'fp-ts/These'
 * import { none, some } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(getRightOnly(left('a')), none)
 * assert.deepStrictEqual(getRightOnly(right(1)), some(1))
 * assert.deepStrictEqual(getRightOnly(both('a', 1)), none)
 *
 * @category destructors
 * @since 2.0.0
 */
function getRightOnly(fa) {
    return isRight(fa) ? Option_1.some(fa.right) : Option_1.none;
}
exports.getRightOnly = getRightOnly;
/**
 * Takes a pair of `Option`s and attempts to create a `These` from them
 *
 * @example
 * import { fromOptions, left, right, both } from 'fp-ts/These'
 * import { none, some } from 'fp-ts/Option'
 *
 * assert.deepStrictEqual(fromOptions(none, none), none)
 * assert.deepStrictEqual(fromOptions(some('a'), none), some(left('a')))
 * assert.deepStrictEqual(fromOptions(none, some(1)), some(right(1)))
 * assert.deepStrictEqual(fromOptions(some('a'), some(1)), some(both('a', 1)))
 *
 * @category constructors
 * @since 2.0.0
 */
function fromOptions(fe, fa) {
    return Option_1.isNone(fe)
        ? Option_1.isNone(fa)
            ? Option_1.none
            : Option_1.some(right(fa.value))
        : Option_1.isNone(fa)
            ? Option_1.some(left(fe.value))
            : Option_1.some(both(fe.value, fa.value));
}
exports.fromOptions = fromOptions;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
/* istanbul ignore next */
var bimap_ = function (fa, f, g) { return function_1.pipe(fa, exports.bimap(f, g)); };
/* istanbul ignore next */
var mapLeft_ = function (fa, f) { return function_1.pipe(fa, exports.mapLeft(f)); };
/* istanbul ignore next */
var reduce_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduce(b, f)); };
/* istanbul ignore next */
var foldMap_ = function (M) {
    var foldMapM = exports.foldMap(M);
    return function (fa, f) { return function_1.pipe(fa, foldMapM(f)); };
};
/* istanbul ignore next */
var reduceRight_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduceRight(b, f)); };
/* istanbul ignore next */
var traverse_ = function (F) {
    var traverseF = exports.traverse(F);
    return function (ta, f) { return function_1.pipe(ta, traverseF(f)); };
};
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.bimap = function (f, g) { return function (fa) {
    return isLeft(fa) ? left(f(fa.left)) : isRight(fa) ? right(g(fa.right)) : both(f(fa.left), g(fa.right));
}; };
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.mapLeft = function (f) { return function (fa) {
    return isLeft(fa) ? left(f(fa.left)) : isBoth(fa) ? both(f(fa.left), fa.right) : fa;
}; };
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) {
    return isLeft(fa) ? fa : isRight(fa) ? right(f(fa.right)) : both(fa.left, f(fa.right));
}; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduce = function (b, f) { return function (fa) {
    return isLeft(fa) ? b : isRight(fa) ? f(b, fa.right) : f(b, fa.right);
}; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.foldMap = function (M) { return function (f) { return function (fa) {
    return isLeft(fa) ? M.empty : isRight(fa) ? f(fa.right) : f(fa.right);
}; }; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduceRight = function (b, f) { return function (fa) {
    return isLeft(fa) ? b : isRight(fa) ? f(fa.right, b) : f(fa.right, b);
}; };
/**
 * @since 2.6.3
 */
exports.traverse = function (F) { return function (f) { return function (ta) {
    return isLeft(ta) ? F.of(ta) : isRight(ta) ? F.map(f(ta.right), right) : F.map(f(ta.right), function (b) { return both(ta.left, b); });
}; }; };
/**
 * @since 2.6.3
 */
exports.sequence = function (F) { return function (ta) {
    return isLeft(ta) ? F.of(ta) : isRight(ta) ? F.map(ta.right, right) : F.map(ta.right, function (b) { return both(ta.left, b); });
}; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'These';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.these = {
    URI: exports.URI,
    map: map_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};


/***/ }),

/***/ 9614:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTheseM = void 0;
var These_1 = __webpack_require__(3977);
function getTheseM(M) {
    function mapT(fa, f) {
        return M.map(fa, These_1.map(f));
    }
    function of(a) {
        return M.of(These_1.right(a));
    }
    function leftT(e) {
        return M.of(These_1.left(e));
    }
    return {
        map: mapT,
        bimap: function (fa, f, g) { return M.map(fa, These_1.bimap(f, g)); },
        mapLeft: function (fa, f) { return M.map(fa, These_1.mapLeft(f)); },
        fold: function (fa, onLeft, onRight, onBoth) { return M.chain(fa, These_1.fold(onLeft, onRight, onBoth)); },
        swap: function (fa) { return M.map(fa, These_1.swap); },
        rightM: function (ma) { return M.map(ma, These_1.right); },
        leftM: function (me) { return M.map(me, These_1.left); },
        left: leftT,
        right: of,
        both: function (e, a) { return M.of(These_1.both(e, a)); },
        toTuple: function (fa, e, a) { return M.map(fa, These_1.toTuple(e, a)); },
        getMonad: function (E) {
            function chain(fa, f) {
                return M.chain(fa, These_1.fold(leftT, f, function (e1, a) {
                    return M.map(f(a), These_1.fold(function (e2) { return These_1.left(E.concat(e1, e2)); }, These_1.right, function (e2, b) { return These_1.both(E.concat(e1, e2), b); }));
                }));
            }
            return {
                _E: undefined,
                map: mapT,
                of: of,
                ap: function (mab, ma) {
                    return chain(mab, function (f) { return mapT(ma, f); });
                },
                chain: chain
            };
        }
    };
}
exports.getTheseM = getTheseM;


/***/ }),

/***/ 3353:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.traced = exports.Functor = exports.URI = exports.map = exports.getComonad = exports.censor = exports.listens = exports.listen = exports.tracks = void 0;
var function_1 = __webpack_require__(6985);
// TODO: curry in v3
/**
 * Extracts a value at a relative position which depends on the current value.
 *
 * @since 2.0.0
 */
function tracks(M, f) {
    return function (wa) { return wa(f(wa(M.empty))); };
}
exports.tracks = tracks;
// tslint:disable:readonly-array
/**
 * Get the current position
 *
 * @since 2.0.0
 */
function listen(wa) {
    return function (e) { return [wa(e), e]; };
}
exports.listen = listen;
// tslint:enable:readonly-array
// tslint:disable:readonly-array
/**
 * Get a value which depends on the current position
 *
 * @since 2.0.0
 */
function listens(f) {
    return function (wa) { return function (e) { return [wa(e), f(e)]; }; };
}
exports.listens = listens;
// tslint:enable:readonly-array
/**
 * Apply a function to the current position
 *
 * @since 2.0.0
 */
function censor(f) {
    return function (wa) { return function (e) { return wa(f(e)); }; };
}
exports.censor = censor;
/**
 * @category instances
 * @since 2.0.0
 */
function getComonad(monoid) {
    function extend(wa, f) {
        return function (p1) { return f(function (p2) { return wa(monoid.concat(p1, p2)); }); };
    }
    function extract(wa) {
        return wa(monoid.empty);
    }
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        extend: extend,
        extract: extract
    };
}
exports.getComonad = getComonad;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return function (p) { return f(fa(p)); }; }; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Traced';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.traced = exports.Functor;


/***/ }),

/***/ 157:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getTraversableComposition = void 0;
var Foldable_1 = __webpack_require__(791);
var Functor_1 = __webpack_require__(5533);
function getTraversableComposition(F, G) {
    var FC = Foldable_1.getFoldableComposition(F, G);
    return {
        map: Functor_1.getFunctorComposition(F, G).map,
        reduce: FC.reduce,
        foldMap: FC.foldMap,
        reduceRight: FC.reduceRight,
        traverse: function (H) {
            var traverseF = F.traverse(H);
            var traverseG = G.traverse(H);
            return function (fga, f) { return traverseF(fga, function (ga) { return traverseG(ga, f); }); };
        },
        sequence: function (H) {
            var sequenceF = F.sequence(H);
            var sequenceG = G.sequence(H);
            return function (fgha) { return sequenceF(F.map(fgha, sequenceG)); };
        }
    };
}
exports.getTraversableComposition = getTraversableComposition;


/***/ }),

/***/ 9458:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 8504:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.apS = exports.bind = exports.bindTo = exports.tree = exports.Comonad = exports.Traversable = exports.Foldable = exports.Monad = exports.Applicative = exports.Functor = exports.URI = exports.of = exports.sequence = exports.traverse = exports.extract = exports.reduceRight = exports.foldMap = exports.reduce = exports.map = exports.flatten = exports.duplicate = exports.extend = exports.chainFirst = exports.chain = exports.apSecond = exports.apFirst = exports.ap = exports.fold = exports.elem = exports.unfoldForestM = exports.unfoldTreeM = exports.unfoldForest = exports.unfoldTree = exports.drawTree = exports.drawForest = exports.getEq = exports.getShow = exports.make = void 0;
var A = __importStar(__webpack_require__(3834));
var Eq_1 = __webpack_require__(6964);
var function_1 = __webpack_require__(6985);
/**
 * @category constructors
 * @since 2.0.0
 */
function make(value, forest) {
    if (forest === void 0) { forest = A.empty; }
    return {
        value: value,
        forest: forest
    };
}
exports.make = make;
/**
 * @category instances
 * @since 2.0.0
 */
function getShow(S) {
    var show = function (t) {
        return t.forest === A.empty || t.forest.length === 0
            ? "make(" + S.show(t.value) + ")"
            : "make(" + S.show(t.value) + ", [" + t.forest.map(show).join(', ') + "])";
    };
    return {
        show: show
    };
}
exports.getShow = getShow;
/**
 * @category instances
 * @since 2.0.0
 */
function getEq(E) {
    var SA;
    var R = Eq_1.fromEquals(function (x, y) { return E.equals(x.value, y.value) && SA.equals(x.forest, y.forest); });
    SA = A.getEq(R);
    return R;
}
exports.getEq = getEq;
var draw = function (indentation, forest) {
    var r = '';
    var len = forest.length;
    var tree;
    for (var i = 0; i < len; i++) {
        tree = forest[i];
        var isLast = i === len - 1;
        r += indentation + (isLast ? '└' : '├') + '─ ' + tree.value;
        r += draw(indentation + (len > 1 && !isLast ? '│  ' : '   '), tree.forest);
    }
    return r;
};
/**
 * Neat 2-dimensional drawing of a forest
 *
 * @since 2.0.0
 */
function drawForest(forest) {
    return draw('\n', forest);
}
exports.drawForest = drawForest;
/**
 * Neat 2-dimensional drawing of a tree
 *
 * @example
 * import { make, drawTree, tree } from 'fp-ts/Tree'
 *
 * const fa = make('a', [
 *   tree.of('b'),
 *   tree.of('c'),
 *   make('d', [tree.of('e'), tree.of('f')])
 * ])
 *
 * assert.strictEqual(drawTree(fa), `a
 * ├─ b
 * ├─ c
 * └─ d
 *    ├─ e
 *    └─ f`)
 *
 *
 * @since 2.0.0
 */
function drawTree(tree) {
    return tree.value + drawForest(tree.forest);
}
exports.drawTree = drawTree;
/**
 * Build a tree from a seed value
 *
 * @category constructors
 * @since 2.0.0
 */
function unfoldTree(b, f) {
    var _a = f(b), a = _a[0], bs = _a[1];
    return { value: a, forest: unfoldForest(bs, f) };
}
exports.unfoldTree = unfoldTree;
/**
 * Build a tree from a seed value
 *
 * @category constructors
 * @since 2.0.0
 */
function unfoldForest(bs, f) {
    return bs.map(function (b) { return unfoldTree(b, f); });
}
exports.unfoldForest = unfoldForest;
function unfoldTreeM(M) {
    var unfoldForestMM = unfoldForestM(M);
    return function (b, f) { return M.chain(f(b), function (_a) {
        var a = _a[0], bs = _a[1];
        return M.chain(unfoldForestMM(bs, f), function (ts) { return M.of({ value: a, forest: ts }); });
    }); };
}
exports.unfoldTreeM = unfoldTreeM;
function unfoldForestM(M) {
    var traverseM = A.traverse(M);
    return function (bs, f) {
        return function_1.pipe(bs, traverseM(function (b) { return unfoldTreeM(M)(b, f); }));
    };
}
exports.unfoldForestM = unfoldForestM;
// TODO: curry in v3
/**
 * @since 2.0.0
 */
function elem(E) {
    var go = function (a, fa) {
        if (E.equals(a, fa.value)) {
            return true;
        }
        return fa.forest.some(function (tree) { return go(a, tree); });
    };
    return go;
}
exports.elem = elem;
/**
 * Fold a tree into a "summary" value in depth-first order.
 *
 * For each node in the tree, apply `f` to the `value` and the result of applying `f` to each `forest`.
 *
 * This is also known as the catamorphism on trees.
 *
 * @example
 * import { fold, make } from 'fp-ts/Tree'
 *
 * const t = make(1, [make(2), make(3)])
 *
 * const sum = (as: Array<number>) => as.reduce((a, acc) => a + acc, 0)
 *
 * // Sum the values in a tree:
 * assert.deepStrictEqual(fold((a: number, bs: Array<number>) => a + sum(bs))(t), 6)
 *
 * // Find the maximum value in the tree:
 * assert.deepStrictEqual(fold((a: number, bs: Array<number>) => bs.reduce((b, acc) => Math.max(b, acc), a))(t), 3)
 *
 * // Count the number of leaves in the tree:
 * assert.deepStrictEqual(fold((_: number, bs: Array<number>) => (bs.length === 0 ? 1 : sum(bs)))(t), 2)
 *
 * @category destructors
 * @since 2.6.0
 */
function fold(f) {
    var go = function (tree) { return f(tree.value, tree.forest.map(go)); };
    return go;
}
exports.fold = fold;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
var ap_ = function (fab, fa) {
    return function_1.pipe(fab, exports.chain(function (f) { return function_1.pipe(fa, exports.map(f)); }));
};
/* istanbul ignore next */
var chain_ = function (ma, f) { return function_1.pipe(ma, exports.chain(f)); };
/* istanbul ignore next */
var reduce_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduce(b, f)); };
/* istanbul ignore next */
var foldMap_ = function (M) {
    var foldMapM = exports.foldMap(M);
    return function (fa, f) { return function_1.pipe(fa, foldMapM(f)); };
};
/* istanbul ignore next */
var reduceRight_ = function (fa, b, f) { return function_1.pipe(fa, exports.reduceRight(b, f)); };
/* istanbul ignore next */
var extend_ = function (wa, f) { return function_1.pipe(wa, exports.extend(f)); };
/* istanbul ignore next */
var traverse_ = function (F) {
    var traverseF = exports.traverse(F);
    return function (ta, f) { return function_1.pipe(ta, traverseF(f)); };
};
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * Apply a function to an argument under a type constructor.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.ap = function (fa) { return function (fab) { return ap_(fab, fa); }; };
/**
 * Combine two effectful actions, keeping only the result of the first.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apFirst = function (fb) {
    return function_1.flow(exports.map(function (a) { return function () { return a; }; }), exports.ap(fb));
};
/**
 * Combine two effectful actions, keeping only the result of the second.
 *
 * @category Apply
 * @since 2.0.0
 */
exports.apSecond = function (fb) {
    return function_1.flow(exports.map(function () { return function (b) { return b; }; }), exports.ap(fb));
};
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chain = function (f) { return function (ma) {
    var _a = f(ma.value), value = _a.value, forest = _a.forest;
    var concat = A.getMonoid().concat;
    return {
        value: value,
        forest: concat(forest, ma.forest.map(exports.chain(f)))
    };
}; };
/**
 * Composes computations in sequence, using the return value of one computation to determine the next computation and
 * keeping only the result of the first.
 *
 * @category Monad
 * @since 2.0.0
 */
exports.chainFirst = function (f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function () { return a; }));
    });
};
/**
 * @category Extend
 * @since 2.0.0
 */
exports.extend = function (f) { return function (wa) { return ({
    value: f(wa),
    forest: wa.forest.map(exports.extend(f))
}); }; };
/**
 * @category Extend
 * @since 2.0.0
 */
exports.duplicate = 
/*#__PURE__*/
exports.extend(function_1.identity);
/**
 * @category Monad
 * @since 2.0.0
 */
exports.flatten = 
/*#__PURE__*/
exports.chain(function_1.identity);
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return ({
    value: f(fa.value),
    forest: fa.forest.map(exports.map(f))
}); }; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduce = function (b, f) { return function (fa) {
    var r = f(b, fa.value);
    var len = fa.forest.length;
    for (var i = 0; i < len; i++) {
        r = function_1.pipe(fa.forest[i], exports.reduce(r, f));
    }
    return r;
}; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.foldMap = function (M) { return function (f) {
    return exports.reduce(M.empty, function (acc, a) { return M.concat(acc, f(a)); });
}; };
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduceRight = function (b, f) { return function (fa) {
    var r = b;
    var len = fa.forest.length;
    for (var i = len - 1; i >= 0; i--) {
        r = function_1.pipe(fa.forest[i], exports.reduceRight(r, f));
    }
    return f(fa.value, r);
}; };
/**
 * @category Extract
 * @since 2.6.2
 */
exports.extract = function (wa) { return wa.value; };
/**
 * @since 2.6.3
 */
exports.traverse = function (F) {
    var traverseF = A.traverse(F);
    var out = function (f) { return function (ta) {
        return F.ap(F.map(f(ta.value), function (value) { return function (forest) { return ({
            value: value,
            forest: forest
        }); }; }), function_1.pipe(ta.forest, traverseF(out(f))));
    }; };
    return out;
};
/**
 * @since 2.6.3
 */
exports.sequence = function (F) { return exports.traverse(F)(function_1.identity); };
/**
 * @since 2.7.0
 */
exports.of = function (a) { return ({
    value: a,
    forest: A.empty
}); };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Tree';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Applicative = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Monad = {
    URI: exports.URI,
    map: map_,
    ap: ap_,
    of: exports.of,
    chain: chain_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Comonad = {
    URI: exports.URI,
    map: map_,
    extend: extend_,
    extract: exports.extract
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.tree = {
    URI: exports.URI,
    map: map_,
    of: exports.of,
    ap: ap_,
    chain: chain_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence,
    extract: exports.extract,
    extend: extend_
};
// -------------------------------------------------------------------------------------
// do notation
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.bindTo = function (name) { return exports.map(function_1.bindTo_(name)); };
/**
 * @since 2.8.0
 */
exports.bind = function (name, f) {
    return exports.chain(function (a) {
        return function_1.pipe(f(a), exports.map(function (b) { return function_1.bind_(a, name, b); }));
    });
};
// -------------------------------------------------------------------------------------
// pipeable sequence S
// -------------------------------------------------------------------------------------
/**
 * @since 2.8.0
 */
exports.apS = function (name, fb) {
    return function_1.flow(exports.map(function (a) { return function (b) { return function_1.bind_(a, name, b); }; }), exports.ap(fb));
};


/***/ }),

/***/ 4236:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.tuple = exports.Traversable = exports.Foldable = exports.Comonad = exports.Semigroupoid = exports.Bifunctor = exports.Functor = exports.URI = exports.sequence = exports.traverse = exports.reduceRight = exports.reduce = exports.map = exports.foldMap = exports.extract = exports.extend = exports.duplicate = exports.compose = exports.mapLeft = exports.bimap = exports.getChainRec = exports.getMonad = exports.getChain = exports.getApplicative = exports.getApply = exports.swap = exports.snd = exports.fst = void 0;
var RT = __importStar(__webpack_require__(1024));
// tslint:disable:readonly-array
// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------
/**
 * @category destructors
 * @since 2.0.0
 */
exports.fst = RT.fst;
/**
 * @category destructors
 * @since 2.0.0
 */
exports.snd = RT.snd;
/**
 * @category combinators
 * @since 2.0.0
 */
exports.swap = RT.swap;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getApply = RT.getApply;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getApplicative = RT.getApplicative;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getChain = RT.getChain;
/**
 * @category instances
 * @since 2.0.0
 */
exports.getMonad = RT.getMonad;
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.getChainRec = RT.getChainRec;
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
var map_ = RT.Functor.map;
var bimap_ = RT.Bifunctor.bimap;
var mapLeft_ = RT.Bifunctor.mapLeft;
var compose_ = RT.Semigroupoid.compose;
var extend_ = RT.Comonad.extend;
var reduce_ = RT.Foldable.reduce;
var foldMap_ = RT.Foldable.foldMap;
var reduceRight_ = RT.Foldable.reduceRight;
var traverse_ = RT.Traversable.traverse;
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * Map a pair of functions over the two type arguments of the bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.bimap = RT.bimap;
/**
 * Map a function over the first type argument of a bifunctor.
 *
 * @category Bifunctor
 * @since 2.0.0
 */
exports.mapLeft = RT.mapLeft;
/**
 * @category Semigroupoid
 * @since 2.0.0
 */
exports.compose = RT.compose;
/**
 * @category Extend
 * @since 2.0.0
 */
exports.duplicate = RT.duplicate;
/**
 * @category Extend
 * @since 2.0.0
 */
exports.extend = RT.extend;
/**
 * @category Extract
 * @since 2.6.2
 */
exports.extract = RT.extract;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.foldMap = RT.foldMap;
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = RT.map;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduce = RT.reduce;
/**
 * @category Foldable
 * @since 2.0.0
 */
exports.reduceRight = RT.reduceRight;
/**
 * @since 2.6.3
 */
exports.traverse = RT.traverse;
/**
 * @since 2.6.3
 */
exports.sequence = RT.sequence;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Tuple';
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Bifunctor = {
    URI: exports.URI,
    bimap: bimap_,
    mapLeft: mapLeft_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Semigroupoid = {
    URI: exports.URI,
    compose: compose_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Comonad = {
    URI: exports.URI,
    map: map_,
    extend: extend_,
    extract: exports.extract
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Foldable = {
    URI: exports.URI,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_
};
/**
 * @category instances
 * @since 2.7.0
 */
exports.Traversable = {
    URI: exports.URI,
    map: map_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.tuple = {
    URI: exports.URI,
    compose: compose_,
    map: map_,
    bimap: bimap_,
    mapLeft: mapLeft_,
    extract: exports.extract,
    extend: extend_,
    reduce: reduce_,
    foldMap: foldMap_,
    reduceRight: reduceRight_,
    traverse: traverse_,
    sequence: exports.sequence
};


/***/ }),

/***/ 3010:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 9386:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getValidationM = void 0;
/**
 * @since 2.0.0
 */
var Applicative_1 = __webpack_require__(4766);
var Either_1 = __webpack_require__(7534);
function getValidationM(S, M) {
    var A = Applicative_1.getApplicativeComposition(M, Either_1.getValidation(S));
    return {
        map: A.map,
        ap: A.ap,
        of: A.of,
        chain: /* istanbul ignore next */ function (ma, f) { return M.chain(ma, function (e) { return (Either_1.isLeft(e) ? M.of(Either_1.left(e.left)) : f(e.right)); }); },
        alt: function (me, that) {
            return M.chain(me, function (e1) {
                return Either_1.isRight(e1) ? M.of(e1) : M.map(that(), function (e2) { return (Either_1.isLeft(e2) ? Either_1.left(S.concat(e1.left, e2.left)) : e2); });
            });
        }
    };
}
exports.getValidationM = getValidationM;


/***/ }),

/***/ 4384:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ 6422:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.execute = exports.evaluate = exports.execWriter = exports.evalWriter = exports.writer = exports.Functor = exports.getMonad = exports.URI = exports.map = exports.censor = exports.listens = exports.pass = exports.listen = exports.tell = void 0;
var function_1 = __webpack_require__(6985);
// tslint:enable:readonly-array
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * Appends a value to the accumulator
 *
 * @category combinators
 * @since 2.0.0
 */
exports.tell = function (w) { return function () { return [undefined, w]; }; };
// tslint:disable:readonly-array
/**
 * Modifies the result to include the changes to the accumulator
 *
 * @category combinators
 * @since 2.0.0
 */
exports.listen = function (fa) { return function () {
    var _a = fa(), a = _a[0], w = _a[1];
    return [[a, w], w];
}; };
// tslint:enable:readonly-array
// tslint:disable:readonly-array
/**
 * Applies the returned function to the accumulator
 *
 * @category combinators
 * @since 2.0.0
 */
exports.pass = function (fa) { return function () {
    var _a = fa(), _b = _a[0], a = _b[0], f = _b[1], w = _a[1];
    return [a, f(w)];
}; };
// tslint:enable:readonly-array
// tslint:disable:readonly-array
/**
 * Projects a value from modifications made to the accumulator during an action
 *
 * @category combinators
 * @since 2.0.0
 */
exports.listens = function (f) { return function (fa) { return function () {
    var _a = fa(), a = _a[0], w = _a[1];
    return [[a, f(w)], w];
}; }; };
// tslint:enable:readonly-array
/**
 * Modify the final accumulator value by applying a function
 *
 * @category combinators
 * @since 2.0.0
 */
exports.censor = function (f) { return function (fa) { return function () {
    var _a = fa(), a = _a[0], w = _a[1];
    return [a, f(w)];
}; }; };
// -------------------------------------------------------------------------------------
// non-pipeables
// -------------------------------------------------------------------------------------
/* istanbul ignore next */
var map_ = function (fa, f) { return function_1.pipe(fa, exports.map(f)); };
// -------------------------------------------------------------------------------------
// pipeables
// -------------------------------------------------------------------------------------
/**
 * `map` can be used to turn functions `(a: A) => B` into functions `(fa: F<A>) => F<B>` whose argument and return types
 * use the type constructor `F` to represent some computational context.
 *
 * @category Functor
 * @since 2.0.0
 */
exports.map = function (f) { return function (fa) { return function () {
    var _a = fa(), a = _a[0], w = _a[1];
    return [f(a), w];
}; }; };
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @category instances
 * @since 2.0.0
 */
exports.URI = 'Writer';
/**
 * @category instances
 * @since 2.0.0
 */
function getMonad(M) {
    return {
        URI: exports.URI,
        _E: undefined,
        map: map_,
        ap: function (fab, fa) { return function () {
            var _a = fab(), f = _a[0], w1 = _a[1];
            var _b = fa(), a = _b[0], w2 = _b[1];
            return [f(a), M.concat(w1, w2)];
        }; },
        of: function (a) { return function () { return [a, M.empty]; }; },
        chain: function (fa, f) { return function () {
            var _a = fa(), a = _a[0], w1 = _a[1];
            var _b = f(a)(), b = _b[0], w2 = _b[1];
            return [b, M.concat(w1, w2)];
        }; }
    };
}
exports.getMonad = getMonad;
/**
 * @category instances
 * @since 2.7.0
 */
exports.Functor = {
    URI: exports.URI,
    map: map_
};
// TODO: remove in v3
/**
 * @category instances
 * @since 2.0.0
 */
exports.writer = exports.Functor;
// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------
/**
 * Use `evaluate` instead
 *
 * @since 2.0.0
 * @deprecated
 */
exports.evalWriter = function (fa) { return fa()[0]; };
/**
 * Use `execute` instead
 *
 * @since 2.0.0
 * @deprecated
 */
exports.execWriter = function (fa) { return fa()[1]; };
/**
 * @since 2.8.0
 */
exports.evaluate = function (fa) { return fa()[0]; };
/**
 * @since 2.8.0
 */
exports.execute = function (fa) { return fa()[1]; };


/***/ }),

/***/ 1914:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getWriterM = void 0;
function getWriterM(M) {
    var map = function (fa, f) { return function () {
        return M.map(fa(), function (_a) {
            var a = _a[0], w = _a[1];
            return [f(a), w];
        });
    }; };
    return {
        map: map,
        evalWriter: function (fa) { return M.map(fa(), function (_a) {
            var a = _a[0];
            return a;
        }); },
        execWriter: function (fa) { return M.map(fa(), function (_a) {
            var _ = _a[0], w = _a[1];
            return w;
        }); },
        tell: function (w) { return function () { return M.of([undefined, w]); }; },
        listen: function (fa) { return function () { return M.map(fa(), function (_a) {
            var a = _a[0], w = _a[1];
            return [[a, w], w];
        }); }; },
        pass: function (fa) { return function () { return M.map(fa(), function (_a) {
            var _b = _a[0], a = _b[0], f = _b[1], w = _a[1];
            return [a, f(w)];
        }); }; },
        listens: function (fa, f) { return function () { return M.map(fa(), function (_a) {
            var a = _a[0], w = _a[1];
            return [[a, f(w)], w];
        }); }; },
        censor: function (fa, f) { return function () { return M.map(fa(), function (_a) {
            var a = _a[0], w = _a[1];
            return [a, f(w)];
        }); }; },
        getMonad: function (W) {
            return {
                _E: undefined,
                map: map,
                of: function (a) { return function () { return M.of([a, W.empty]); }; },
                ap: function (mab, ma) { return function () { return M.chain(mab(), function (_a) {
                    var f = _a[0], w1 = _a[1];
                    return M.map(ma(), function (_a) {
                        var a = _a[0], w2 = _a[1];
                        return [f(a), W.concat(w1, w2)];
                    });
                }); }; },
                chain: function (ma, f) { return function () { return M.chain(ma(), function (_a) {
                    var a = _a[0], w1 = _a[1];
                    return M.map(f(a)(), function (_a) {
                        var b = _a[0], w2 = _a[1];
                        return [b, W.concat(w1, w2)];
                    });
                }); }; }
            };
        }
    };
}
exports.getWriterM = getWriterM;


/***/ }),

/***/ 3350:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * @since 2.2.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fold = void 0;
/**
 * Defines the fold over a boolean value.
 * Takes two thunks `onTrue`, `onFalse` and a `boolean` value.
 * If `value` is false, `onFalse()` is returned, otherwise `onTrue()`.
 *
 * @example
 * import { some, map } from 'fp-ts/Option'
 * import { pipe } from 'fp-ts/function'
 * import { fold } from 'fp-ts/boolean'
 *
 * assert.deepStrictEqual(
 *  pipe(
 *    some(true),
 *    map(fold(() => 'false', () => 'true'))
 *  ),
 *  some('true')
 * )
 *
 * @category destructors
 * @since 2.2.0
 */
function fold(onFalse, onTrue) {
    return function (value) { return (value ? onTrue() : onFalse()); };
}
exports.fold = fold;


/***/ }),

/***/ 6985:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * @since 2.0.0
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bindTo_ = exports.bind_ = exports.hole = exports.pipe = exports.untupled = exports.tupled = exports.absurd = exports.decrement = exports.increment = exports.tuple = exports.flow = exports.flip = exports.constVoid = exports.constUndefined = exports.constNull = exports.constFalse = exports.constTrue = exports.constant = exports.not = exports.unsafeCoerce = exports.identity = void 0;
/**
 * @since 2.0.0
 */
function identity(a) {
    return a;
}
exports.identity = identity;
/**
 * @since 2.0.0
 */
exports.unsafeCoerce = identity;
/**
 * @since 2.0.0
 */
function not(predicate) {
    return function (a) { return !predicate(a); };
}
exports.not = not;
/**
 * @since 2.0.0
 */
function constant(a) {
    return function () { return a; };
}
exports.constant = constant;
/**
 * A thunk that returns always `true`
 *
 * @since 2.0.0
 */
exports.constTrue = function () {
    return true;
};
/**
 * A thunk that returns always `false`
 *
 * @since 2.0.0
 */
exports.constFalse = function () {
    return false;
};
/**
 * A thunk that returns always `null`
 *
 * @since 2.0.0
 */
exports.constNull = function () {
    return null;
};
/**
 * A thunk that returns always `undefined`
 *
 * @since 2.0.0
 */
exports.constUndefined = function () {
    return;
};
/**
 * A thunk that returns always `void`
 *
 * @since 2.0.0
 */
exports.constVoid = function () {
    return;
};
// TODO: remove in v3
/**
 * Flips the order of the arguments of a function of two arguments.
 *
 * @since 2.0.0
 */
function flip(f) {
    return function (b, a) { return f(a, b); };
}
exports.flip = flip;
function flow(ab, bc, cd, de, ef, fg, gh, hi, ij) {
    switch (arguments.length) {
        case 1:
            return ab;
        case 2:
            return function () {
                return bc(ab.apply(this, arguments));
            };
        case 3:
            return function () {
                return cd(bc(ab.apply(this, arguments)));
            };
        case 4:
            return function () {
                return de(cd(bc(ab.apply(this, arguments))));
            };
        case 5:
            return function () {
                return ef(de(cd(bc(ab.apply(this, arguments)))));
            };
        case 6:
            return function () {
                return fg(ef(de(cd(bc(ab.apply(this, arguments))))));
            };
        case 7:
            return function () {
                return gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))));
            };
        case 8:
            return function () {
                return hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments))))))));
            };
        case 9:
            return function () {
                return ij(hi(gh(fg(ef(de(cd(bc(ab.apply(this, arguments)))))))));
            };
    }
    return;
}
exports.flow = flow;
/**
 * @since 2.0.0
 */
function tuple() {
    var t = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        t[_i] = arguments[_i];
    }
    return t;
}
exports.tuple = tuple;
/**
 * @since 2.0.0
 */
function increment(n) {
    return n + 1;
}
exports.increment = increment;
/**
 * @since 2.0.0
 */
function decrement(n) {
    return n - 1;
}
exports.decrement = decrement;
/**
 * @since 2.0.0
 */
function absurd(_) {
    throw new Error('Called `absurd` function which should be uncallable');
}
exports.absurd = absurd;
/**
 * Creates a tupled version of this function: instead of `n` arguments, it accepts a single tuple argument.
 *
 * @example
 * import { tupled } from 'fp-ts/function'
 *
 * const add = tupled((x: number, y: number): number => x + y)
 *
 * assert.strictEqual(add([1, 2]), 3)
 *
 * @since 2.4.0
 */
function tupled(f) {
    return function (a) { return f.apply(void 0, a); };
}
exports.tupled = tupled;
/**
 * Inverse function of `tupled`
 *
 * @since 2.4.0
 */
function untupled(f) {
    return function () {
        var a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            a[_i] = arguments[_i];
        }
        return f(a);
    };
}
exports.untupled = untupled;
function pipe(a, ab, bc, cd, de, ef, fg, gh, hi, ij, jk, kl, lm, mn, no, op, pq, qr, rs, st) {
    switch (arguments.length) {
        case 1:
            return a;
        case 2:
            return ab(a);
        case 3:
            return bc(ab(a));
        case 4:
            return cd(bc(ab(a)));
        case 5:
            return de(cd(bc(ab(a))));
        case 6:
            return ef(de(cd(bc(ab(a)))));
        case 7:
            return fg(ef(de(cd(bc(ab(a))))));
        case 8:
            return gh(fg(ef(de(cd(bc(ab(a)))))));
        case 9:
            return hi(gh(fg(ef(de(cd(bc(ab(a))))))));
        case 10:
            return ij(hi(gh(fg(ef(de(cd(bc(ab(a)))))))));
        case 11:
            return jk(ij(hi(gh(fg(ef(de(cd(bc(ab(a))))))))));
        case 12:
            return kl(jk(ij(hi(gh(fg(ef(de(cd(bc(ab(a)))))))))));
        case 13:
            return lm(kl(jk(ij(hi(gh(fg(ef(de(cd(bc(ab(a))))))))))));
        case 14:
            return mn(lm(kl(jk(ij(hi(gh(fg(ef(de(cd(bc(ab(a)))))))))))));
        case 15:
            return no(mn(lm(kl(jk(ij(hi(gh(fg(ef(de(cd(bc(ab(a))))))))))))));
        case 16:
            return op(no(mn(lm(kl(jk(ij(hi(gh(fg(ef(de(cd(bc(ab(a)))))))))))))));
        case 17:
            return pq(op(no(mn(lm(kl(jk(ij(hi(gh(fg(ef(de(cd(bc(ab(a))))))))))))))));
        case 18:
            return qr(pq(op(no(mn(lm(kl(jk(ij(hi(gh(fg(ef(de(cd(bc(ab(a)))))))))))))))));
        case 19:
            return rs(qr(pq(op(no(mn(lm(kl(jk(ij(hi(gh(fg(ef(de(cd(bc(ab(a))))))))))))))))));
        case 20:
            return st(rs(qr(pq(op(no(mn(lm(kl(jk(ij(hi(gh(fg(ef(de(cd(bc(ab(a)))))))))))))))))));
    }
    return;
}
exports.pipe = pipe;
/**
 * Type hole simulation
 *
 * @since 2.7.0
 */
exports.hole = absurd;
/**
 * @internal
 */
exports.bind_ = function (a, name, b) {
    var _a;
    return Object.assign({}, a, (_a = {}, _a[name] = b, _a));
};
/**
 * @internal
 */
exports.bindTo_ = function (name) { return function (b) {
    var _a;
    return (_a = {}, _a[name] = b, _a);
}; };


/***/ }),

/***/ 5187:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * @since 2.0.0
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.writerT = exports.writer = exports.witherable = exports.validationT = exports.unfoldable = exports.tuple = exports.tree = exports.traversableWithIndex = exports.traversable = exports.traced = exports.theseT = exports.these = exports.taskThese = exports.taskEither = exports.task = exports.strong = exports.store = exports.stateT = exports.stateReaderTaskEither = exports.state = exports.show = exports.eq = exports.set = exports.semiring = exports.semigroupoid = exports.semigroup = exports.ring = exports.record = exports.readerTask = exports.readonlyTuple = exports.readonlySet = exports.readonlyRecord = exports.readonlyNonEmptyArray = exports.readonlyMap = exports.readonlyArray = exports.readerTaskEither = exports.readerT = exports.readerEither = exports.reader = exports.random = exports.profunctor = exports.pipeable = exports.ordering = exports.ord = exports.optionT = exports.option = exports.nonEmptyArray = exports.monoid = exports.monadThrow = exports.monadTask = exports.monadIO = exports.monad = exports.meetSemilattice = exports.map = exports.magma = exports.lattice = exports.joinSemilattice = exports.ioRef = exports.ioEither = exports.io = exports.invariant = exports.identity = exports.hkt = exports.heytingAlgebra = exports.group = exports.functorWithIndex = exports.functor = exports.function = exports.foldableWithIndex = exports.foldable = exports.filterableWithIndex = exports.filterable = exports.field = exports.extend = exports.eitherT = exports.either = exports.distributiveLattice = exports.date = exports.contravariant = exports.const = exports.console = exports.compactable = exports.comonad = exports.choice = exports.chainRec = exports.chain = exports.category = exports.boundedMeetSemilattice = exports.boundedLattice = exports.boundedJoinSemilattice = exports.boundedDistributiveLattice = exports.bounded = exports.booleanAlgebra = exports.boolean = exports.bifunctor = exports.array = exports.apply = exports.applicative = exports.alternative = exports.alt = void 0;
var alt = __importStar(__webpack_require__(7451));
exports.alt = alt;
var alternative = __importStar(__webpack_require__(1601));
exports.alternative = alternative;
var applicative = __importStar(__webpack_require__(4766));
exports.applicative = applicative;
var apply = __importStar(__webpack_require__(205));
exports.apply = apply;
var array = __importStar(__webpack_require__(3834));
exports.array = array;
var bifunctor = __importStar(__webpack_require__(666));
exports.bifunctor = bifunctor;
var boolean = __importStar(__webpack_require__(3350));
exports.boolean = boolean;
var booleanAlgebra = __importStar(__webpack_require__(6428));
exports.booleanAlgebra = booleanAlgebra;
var bounded = __importStar(__webpack_require__(5105));
exports.bounded = bounded;
var boundedDistributiveLattice = __importStar(__webpack_require__(9062));
exports.boundedDistributiveLattice = boundedDistributiveLattice;
var boundedJoinSemilattice = __importStar(__webpack_require__(9744));
exports.boundedJoinSemilattice = boundedJoinSemilattice;
var boundedLattice = __importStar(__webpack_require__(5450));
exports.boundedLattice = boundedLattice;
var boundedMeetSemilattice = __importStar(__webpack_require__(8178));
exports.boundedMeetSemilattice = boundedMeetSemilattice;
var category = __importStar(__webpack_require__(1021));
exports.category = category;
var chain = __importStar(__webpack_require__(2372));
exports.chain = chain;
var chainRec = __importStar(__webpack_require__(5322));
exports.chainRec = chainRec;
var choice = __importStar(__webpack_require__(3659));
exports.choice = choice;
var comonad = __importStar(__webpack_require__(1665));
exports.comonad = comonad;
var compactable = __importStar(__webpack_require__(729));
exports.compactable = compactable;
var console = __importStar(__webpack_require__(7897));
exports.console = console;
var const_ = __importStar(__webpack_require__(7506));
exports.const = const_;
var contravariant = __importStar(__webpack_require__(7967));
exports.contravariant = contravariant;
var date = __importStar(__webpack_require__(9385));
exports.date = date;
var distributiveLattice = __importStar(__webpack_require__(1399));
exports.distributiveLattice = distributiveLattice;
var either = __importStar(__webpack_require__(7534));
exports.either = either;
var eitherT = __importStar(__webpack_require__(9803));
exports.eitherT = eitherT;
var eq = __importStar(__webpack_require__(6964));
exports.eq = eq;
var extend = __importStar(__webpack_require__(5243));
exports.extend = extend;
var field = __importStar(__webpack_require__(6253));
exports.field = field;
var filterable = __importStar(__webpack_require__(6907));
exports.filterable = filterable;
var filterableWithIndex = __importStar(__webpack_require__(4699));
exports.filterableWithIndex = filterableWithIndex;
var foldable = __importStar(__webpack_require__(791));
exports.foldable = foldable;
var foldableWithIndex = __importStar(__webpack_require__(4306));
exports.foldableWithIndex = foldableWithIndex;
var function_ = __importStar(__webpack_require__(6985));
exports.function = function_;
var functor = __importStar(__webpack_require__(5533));
exports.functor = functor;
var functorWithIndex = __importStar(__webpack_require__(1276));
exports.functorWithIndex = functorWithIndex;
var group = __importStar(__webpack_require__(8791));
exports.group = group;
var heytingAlgebra = __importStar(__webpack_require__(140));
exports.heytingAlgebra = heytingAlgebra;
var hkt = __importStar(__webpack_require__(0));
exports.hkt = hkt;
var identity = __importStar(__webpack_require__(151));
exports.identity = identity;
var invariant = __importStar(__webpack_require__(4000));
exports.invariant = invariant;
var io = __importStar(__webpack_require__(3760));
exports.io = io;
var ioEither = __importStar(__webpack_require__(119));
exports.ioEither = ioEither;
var ioRef = __importStar(__webpack_require__(4449));
exports.ioRef = ioRef;
var joinSemilattice = __importStar(__webpack_require__(9753));
exports.joinSemilattice = joinSemilattice;
var lattice = __importStar(__webpack_require__(892));
exports.lattice = lattice;
var magma = __importStar(__webpack_require__(179));
exports.magma = magma;
var map = __importStar(__webpack_require__(2748));
exports.map = map;
var meetSemilattice = __importStar(__webpack_require__(5717));
exports.meetSemilattice = meetSemilattice;
var monad = __importStar(__webpack_require__(9076));
exports.monad = monad;
var monadIO = __importStar(__webpack_require__(5558));
exports.monadIO = monadIO;
var monadTask = __importStar(__webpack_require__(1534));
exports.monadTask = monadTask;
var monadThrow = __importStar(__webpack_require__(5631));
exports.monadThrow = monadThrow;
var monoid = __importStar(__webpack_require__(2629));
exports.monoid = monoid;
var nonEmptyArray = __importStar(__webpack_require__(240));
exports.nonEmptyArray = nonEmptyArray;
var option = __importStar(__webpack_require__(2569));
exports.option = option;
var optionT = __importStar(__webpack_require__(7777));
exports.optionT = optionT;
var ord = __importStar(__webpack_require__(6685));
exports.ord = ord;
var ordering = __importStar(__webpack_require__(4397));
exports.ordering = ordering;
var pipeable = __importStar(__webpack_require__(6837));
exports.pipeable = pipeable;
var profunctor = __importStar(__webpack_require__(1855));
exports.profunctor = profunctor;
var random = __importStar(__webpack_require__(265));
exports.random = random;
var reader = __importStar(__webpack_require__(786));
exports.reader = reader;
var readerEither = __importStar(__webpack_require__(8882));
exports.readerEither = readerEither;
var readerT = __importStar(__webpack_require__(6170));
exports.readerT = readerT;
var readerTask = __importStar(__webpack_require__(7605));
exports.readerTask = readerTask;
var readerTaskEither = __importStar(__webpack_require__(5043));
exports.readerTaskEither = readerTaskEither;
var readonlyArray = __importStar(__webpack_require__(4234));
exports.readonlyArray = readonlyArray;
var readonlyMap = __importStar(__webpack_require__(1961));
exports.readonlyMap = readonlyMap;
var readonlyNonEmptyArray = __importStar(__webpack_require__(8630));
exports.readonlyNonEmptyArray = readonlyNonEmptyArray;
var readonlyRecord = __importStar(__webpack_require__(1897));
exports.readonlyRecord = readonlyRecord;
var readonlySet = __importStar(__webpack_require__(815));
exports.readonlySet = readonlySet;
var readonlyTuple = __importStar(__webpack_require__(1024));
exports.readonlyTuple = readonlyTuple;
var record = __importStar(__webpack_require__(2653));
exports.record = record;
var ring = __importStar(__webpack_require__(4845));
exports.ring = ring;
var semigroup = __importStar(__webpack_require__(6339));
exports.semigroup = semigroup;
var semigroupoid = __importStar(__webpack_require__(213));
exports.semigroupoid = semigroupoid;
var semiring = __importStar(__webpack_require__(4994));
exports.semiring = semiring;
var set = __importStar(__webpack_require__(2124));
exports.set = set;
var show = __importStar(__webpack_require__(2921));
exports.show = show;
var state = __importStar(__webpack_require__(2151));
exports.state = state;
var stateReaderTaskEither = __importStar(__webpack_require__(9245));
exports.stateReaderTaskEither = stateReaderTaskEither;
var stateT = __importStar(__webpack_require__(6790));
exports.stateT = stateT;
var store = __importStar(__webpack_require__(8914));
exports.store = store;
var strong = __importStar(__webpack_require__(6912));
exports.strong = strong;
var task = __importStar(__webpack_require__(2664));
exports.task = task;
var taskEither = __importStar(__webpack_require__(437));
exports.taskEither = taskEither;
var taskThese = __importStar(__webpack_require__(7032));
exports.taskThese = taskThese;
var these = __importStar(__webpack_require__(3977));
exports.these = these;
var theseT = __importStar(__webpack_require__(9614));
exports.theseT = theseT;
var traced = __importStar(__webpack_require__(3353));
exports.traced = traced;
var traversable = __importStar(__webpack_require__(157));
exports.traversable = traversable;
var traversableWithIndex = __importStar(__webpack_require__(9458));
exports.traversableWithIndex = traversableWithIndex;
var tree = __importStar(__webpack_require__(8504));
exports.tree = tree;
var tuple = __importStar(__webpack_require__(4236));
exports.tuple = tuple;
var unfoldable = __importStar(__webpack_require__(3010));
exports.unfoldable = unfoldable;
var validationT = __importStar(__webpack_require__(9386));
exports.validationT = validationT;
var witherable = __importStar(__webpack_require__(4384));
exports.witherable = witherable;
var writer = __importStar(__webpack_require__(6422));
exports.writer = writer;
var writerT = __importStar(__webpack_require__(1914));
exports.writerT = writerT;


/***/ }),

/***/ 6837:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pipeable = exports.pipe = void 0;
var function_1 = __webpack_require__(6985);
// TODO: remove module in v3
/**
 * Use [`pipe`](https://gcanti.github.io/fp-ts/modules/function.ts.html#flow) from `function` module instead.
 *
 * @since 2.0.0
 */
exports.pipe = function_1.pipe;
var isFunctor = function (I) { return typeof I.map === 'function'; };
var isContravariant = function (I) { return typeof I.contramap === 'function'; };
var isFunctorWithIndex = function (I) { return typeof I.mapWithIndex === 'function'; };
var isApply = function (I) { return typeof I.ap === 'function'; };
var isChain = function (I) { return typeof I.chain === 'function'; };
var isBifunctor = function (I) { return typeof I.bimap === 'function'; };
var isExtend = function (I) { return typeof I.extend === 'function'; };
var isFoldable = function (I) { return typeof I.reduce === 'function'; };
var isFoldableWithIndex = function (I) { return typeof I.reduceWithIndex === 'function'; };
var isAlt = function (I) { return typeof I.alt === 'function'; };
var isCompactable = function (I) { return typeof I.compact === 'function'; };
var isFilterable = function (I) { return typeof I.filter === 'function'; };
var isFilterableWithIndex = function (I) {
    return typeof I.filterWithIndex === 'function';
};
var isProfunctor = function (I) { return typeof I.promap === 'function'; };
var isSemigroupoid = function (I) { return typeof I.compose === 'function'; };
var isMonadThrow = function (I) { return typeof I.throwError === 'function'; };
function pipeable(I) {
    var r = {};
    if (isFunctor(I)) {
        var map = function (f) { return function (fa) { return I.map(fa, f); }; };
        r.map = map;
    }
    if (isContravariant(I)) {
        var contramap = function (f) { return function (fa) { return I.contramap(fa, f); }; };
        r.contramap = contramap;
    }
    if (isFunctorWithIndex(I)) {
        var mapWithIndex = function (f) { return function (fa) { return I.mapWithIndex(fa, f); }; };
        r.mapWithIndex = mapWithIndex;
    }
    if (isApply(I)) {
        var ap = function (fa) { return function (fab) { return I.ap(fab, fa); }; };
        var apFirst = function (fb) { return function (fa) {
            return I.ap(I.map(fa, function (a) { return function () { return a; }; }), fb);
        }; };
        r.ap = ap;
        r.apFirst = apFirst;
        r.apSecond = function (fb) { return function (fa) {
            return I.ap(I.map(fa, function () { return function (b) { return b; }; }), fb);
        }; };
    }
    if (isChain(I)) {
        var chain = function (f) { return function (ma) { return I.chain(ma, f); }; };
        var chainFirst = function (f) { return function (ma) { return I.chain(ma, function (a) { return I.map(f(a), function () { return a; }); }); }; };
        var flatten = function (mma) { return I.chain(mma, function_1.identity); };
        r.chain = chain;
        r.chainFirst = chainFirst;
        r.flatten = flatten;
    }
    if (isBifunctor(I)) {
        var bimap = function (f, g) { return function (fa) { return I.bimap(fa, f, g); }; };
        var mapLeft = function (f) { return function (fa) { return I.mapLeft(fa, f); }; };
        r.bimap = bimap;
        r.mapLeft = mapLeft;
    }
    if (isExtend(I)) {
        var extend = function (f) { return function (wa) { return I.extend(wa, f); }; };
        var duplicate = function (wa) { return I.extend(wa, function_1.identity); };
        r.extend = extend;
        r.duplicate = duplicate;
    }
    if (isFoldable(I)) {
        var reduce = function (b, f) { return function (fa) { return I.reduce(fa, b, f); }; };
        var foldMap = function (M) {
            var foldMapM = I.foldMap(M);
            return function (f) { return function (fa) { return foldMapM(fa, f); }; };
        };
        var reduceRight = function (b, f) { return function (fa) { return I.reduceRight(fa, b, f); }; };
        r.reduce = reduce;
        r.foldMap = foldMap;
        r.reduceRight = reduceRight;
    }
    if (isFoldableWithIndex(I)) {
        var reduceWithIndex = function (b, f) { return function (fa) {
            return I.reduceWithIndex(fa, b, f);
        }; };
        var foldMapWithIndex = function (M) {
            var foldMapM = I.foldMapWithIndex(M);
            return function (f) { return function (fa) { return foldMapM(fa, f); }; };
        };
        var reduceRightWithIndex = function (b, f) { return function (fa) {
            return I.reduceRightWithIndex(fa, b, f);
        }; };
        r.reduceWithIndex = reduceWithIndex;
        r.foldMapWithIndex = foldMapWithIndex;
        r.reduceRightWithIndex = reduceRightWithIndex;
    }
    if (isAlt(I)) {
        var alt = function (that) { return function (fa) { return I.alt(fa, that); }; };
        r.alt = alt;
    }
    if (isCompactable(I)) {
        r.compact = I.compact;
        r.separate = I.separate;
    }
    if (isFilterable(I)) {
        var filter = function (predicate) { return function (fa) {
            return I.filter(fa, predicate);
        }; };
        var filterMap = function (f) { return function (fa) { return I.filterMap(fa, f); }; };
        var partition = function (predicate) { return function (fa) {
            return I.partition(fa, predicate);
        }; };
        var partitionMap = function (f) { return function (fa) { return I.partitionMap(fa, f); }; };
        r.filter = filter;
        r.filterMap = filterMap;
        r.partition = partition;
        r.partitionMap = partitionMap;
    }
    if (isFilterableWithIndex(I)) {
        var filterWithIndex = function (predicateWithIndex) { return function (fa) { return I.filterWithIndex(fa, predicateWithIndex); }; };
        var filterMapWithIndex = function (f) { return function (fa) {
            return I.filterMapWithIndex(fa, f);
        }; };
        var partitionWithIndex = function (predicateWithIndex) { return function (fa) { return I.partitionWithIndex(fa, predicateWithIndex); }; };
        var partitionMapWithIndex = function (f) { return function (fa) {
            return I.partitionMapWithIndex(fa, f);
        }; };
        r.filterWithIndex = filterWithIndex;
        r.filterMapWithIndex = filterMapWithIndex;
        r.partitionWithIndex = partitionWithIndex;
        r.partitionMapWithIndex = partitionMapWithIndex;
    }
    if (isProfunctor(I)) {
        var promap = function (f, g) { return function (fa) { return I.promap(fa, f, g); }; };
        r.promap = promap;
    }
    if (isSemigroupoid(I)) {
        var compose = function (that) { return function (fa) { return I.compose(fa, that); }; };
        r.compose = compose;
    }
    if (isMonadThrow(I)) {
        var fromOption = function (onNone) { return function (ma) {
            return ma._tag === 'None' ? I.throwError(onNone()) : I.of(ma.value);
        }; };
        var fromEither = function (ma) {
            return ma._tag === 'Left' ? I.throwError(ma.left) : I.of(ma.right);
        };
        var fromPredicate = function (predicate, onFalse) { return function (a) { return (predicate(a) ? I.of(a) : I.throwError(onFalse(a))); }; };
        var filterOrElse = function (predicate, onFalse) { return function (ma) { return I.chain(ma, function (a) { return (predicate(a) ? I.of(a) : I.throwError(onFalse(a))); }); }; };
        r.fromOption = fromOption;
        r.fromEither = fromEither;
        r.fromPredicate = fromPredicate;
        r.filterOrElse = filterOrElse;
    }
    return r;
}
exports.pipeable = pipeable;


/***/ }),

/***/ 8119:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var extract_files_1 = __webpack_require__(5498);
var form_data_1 = __importDefault(__webpack_require__(4334));
/**
 * Duck type if NodeJS stream
 * https://github.com/sindresorhus/is-stream/blob/3750505b0727f6df54324784fe369365ef78841e/index.js#L3
 */
var isExtractableFileEnhanced = function (value) {
    return extract_files_1.isExtractableFile(value) ||
        (value !== null && typeof value === 'object' && typeof value.pipe === 'function');
};
/**
 * Returns Multipart Form if body contains files
 * (https://github.com/jaydenseric/graphql-multipart-request-spec)
 * Otherwise returns JSON
 */
function createRequestBody(query, variables) {
    var _a = extract_files_1.extractFiles({ query: query, variables: variables }, '', isExtractableFileEnhanced), clone = _a.clone, files = _a.files;
    if (files.size === 0) {
        return JSON.stringify(clone);
    }
    var Form = typeof FormData === 'undefined' ? form_data_1.default : FormData;
    var form = new Form();
    form.append('operations', JSON.stringify(clone));
    var map = {};
    var i = 0;
    files.forEach(function (paths) {
        map[++i] = paths;
    });
    form.append('map', JSON.stringify(map));
    i = 0;
    files.forEach(function (paths, file) {
        form.append("" + ++i, file);
    });
    return form;
}
exports.default = createRequestBody;
//# sourceMappingURL=createRequestBody.js.map

/***/ }),

/***/ 2476:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.gql = exports.request = exports.rawRequest = exports.GraphQLClient = exports.ClientError = void 0;
var cross_fetch_1 = __importDefault(__webpack_require__(9805));
var printer_1 = __webpack_require__(8560);
var createRequestBody_1 = __importDefault(__webpack_require__(8119));
var types_1 = __webpack_require__(1065);
var types_2 = __webpack_require__(1065);
Object.defineProperty(exports, "ClientError", ({ enumerable: true, get: function () { return types_2.ClientError; } }));
var resolveHeaders = function (headers) {
    var oHeaders = {};
    if (headers) {
        if (headers instanceof Headers) {
            oHeaders = HeadersInstanceToPlainObject(headers);
        }
        else if (headers instanceof Array) {
            headers.forEach(function (_a) {
                var name = _a[0], value = _a[1];
                oHeaders[name] = value;
            });
        }
        else {
            oHeaders = headers;
        }
    }
    return oHeaders;
};
/**
 * todo
 */
var GraphQLClient = /** @class */ (function () {
    function GraphQLClient(url, options) {
        this.url = url;
        this.options = options || {};
    }
    GraphQLClient.prototype.rawRequest = function (query, variables) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, headers, others, body, response, result, headers_1, status_1, errorResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.options, headers = _a.headers, others = __rest(_a, ["headers"]);
                        body = createRequestBody_1.default(query, variables);
                        headers = resolveHeaders(headers);
                        return [4 /*yield*/, cross_fetch_1.default(this.url, __assign({ method: 'POST', headers: __assign(__assign({}, (typeof body === 'string' ? { 'Content-Type': 'application/json' } : {})), headers), body: body }, others))];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, getResult(response)];
                    case 2:
                        result = _b.sent();
                        if (response.ok && !result.errors && result.data) {
                            headers_1 = response.headers, status_1 = response.status;
                            return [2 /*return*/, __assign(__assign({}, result), { headers: headers_1, status: status_1 })];
                        }
                        else {
                            errorResult = typeof result === 'string' ? { error: result } : result;
                            throw new types_1.ClientError(__assign(__assign({}, errorResult), { status: response.status, headers: response.headers }), { query: query, variables: variables });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send a GraphQL document to the server.
     */
    GraphQLClient.prototype.request = function (document, variables) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, headers, others, resolvedDoc, body, response, result, errorResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.options, headers = _a.headers, others = __rest(_a, ["headers"]);
                        headers = resolveHeaders(headers);
                        resolvedDoc = resolveRequestDocument(document);
                        body = createRequestBody_1.default(resolvedDoc, variables);
                        return [4 /*yield*/, cross_fetch_1.default(this.url, __assign({ method: 'POST', headers: __assign(__assign({}, (typeof body === 'string' ? { 'Content-Type': 'application/json' } : {})), headers), body: body }, others))];
                    case 1:
                        response = _b.sent();
                        return [4 /*yield*/, getResult(response)];
                    case 2:
                        result = _b.sent();
                        if (response.ok && !result.errors && result.data) {
                            return [2 /*return*/, result.data];
                        }
                        else {
                            errorResult = typeof result === 'string' ? { error: result } : result;
                            throw new types_1.ClientError(__assign(__assign({}, errorResult), { status: response.status }), { query: resolvedDoc, variables: variables });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    GraphQLClient.prototype.setHeaders = function (headers) {
        this.options.headers = headers;
        return this;
    };
    /**
     * Attach a header to the client. All subsequent requests will have this header.
     */
    GraphQLClient.prototype.setHeader = function (key, value) {
        var _a;
        var headers = this.options.headers;
        if (headers) {
            // todo what if headers is in nested array form... ?
            //@ts-ignore
            headers[key] = value;
        }
        else {
            this.options.headers = (_a = {}, _a[key] = value, _a);
        }
        return this;
    };
    return GraphQLClient;
}());
exports.GraphQLClient = GraphQLClient;
/**
 * todo
 */
function rawRequest(url, query, variables) {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            client = new GraphQLClient(url);
            return [2 /*return*/, client.rawRequest(query, variables)];
        });
    });
}
exports.rawRequest = rawRequest;
/**
 * Send a GraphQL Document to the GraphQL server for exectuion.
 *
 * @example
 *
 * ```ts
 * // You can pass a raw string
 *
 * await request('https://foo.bar/graphql', `
 *   {
 *     query {
 *       users
 *     }
 *   }
 * `)
 *
 * // You can also pass a GraphQL DocumentNode. Convenient if you
 * // are using graphql-tag package.
 *
 * import gql from 'graphql-tag'
 *
 * await request('https://foo.bar/graphql', gql`...`)
 *
 * // If you don't actually care about using DocumentNode but just
 * // want the tooling support for gql template tag like IDE syntax
 * // coloring and prettier autoformat then note you can use the
 * // passthrough gql tag shipped with graphql-request to save a bit
 * // of performance and not have to install another dep into your project.
 *
 * import { gql } from 'graphql-request'
 *
 * await request('https://foo.bar/graphql', gql`...`)
 * ```
 */
function request(url, document, variables) {
    return __awaiter(this, void 0, void 0, function () {
        var client;
        return __generator(this, function (_a) {
            client = new GraphQLClient(url);
            return [2 /*return*/, client.request(document, variables)];
        });
    });
}
exports.request = request;
exports.default = request;
/**
 * todo
 */
function getResult(response) {
    var contentType = response.headers.get('Content-Type');
    if (contentType && contentType.startsWith('application/json')) {
        return response.json();
    }
    else {
        return response.text();
    }
}
/**
 * helpers
 */
function resolveRequestDocument(document) {
    if (typeof document === 'string')
        return document;
    return printer_1.print(document);
}
/**
 * Convenience passthrough template tag to get the benefits of tooling for the gql template tag. This does not actually parse the input into a GraphQL DocumentNode like graphql-tag package does. It just returns the string with any variables given interpolated. Can save you a bit of performance and having to install another package.
 *
 * @example
 *
 * import { gql } from 'graphql-request'
 *
 * await request('https://foo.bar/graphql', gql`...`)
 *
 * @remarks
 *
 * Several tools in the Node GraphQL ecosystem are hardcoded to specially treat any template tag named "gql". For example see this prettier issue: https://github.com/prettier/prettier/issues/4360. Using this template tag has no runtime effect beyond variable interpolation.
 */
function gql(chunks) {
    var variables = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        variables[_i - 1] = arguments[_i];
    }
    return chunks.reduce(function (accumulator, chunk, index) { return "" + accumulator + chunk + (index in variables ? variables[index] : ''); }, '');
}
exports.gql = gql;
/**
 * Convert Headers instance into regular object
 */
function HeadersInstanceToPlainObject(headers) {
    var o = {};
    headers.forEach(function (v, k) {
        o[k] = v;
    });
    return o;
}
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 1065:
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientError = void 0;
var ClientError = /** @class */ (function (_super) {
    __extends(ClientError, _super);
    function ClientError(response, request) {
        var _this = this;
        var message = ClientError.extractMessage(response) + ": " + JSON.stringify({
            response: response,
            request: request,
        });
        _this = _super.call(this, message) || this;
        Object.setPrototypeOf(_this, ClientError.prototype);
        _this.response = response;
        _this.request = request;
        // this is needed as Safari doesn't support .captureStackTrace
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(_this, ClientError);
        }
        return _this;
    }
    ClientError.extractMessage = function (response) {
        try {
            return response.errors[0].message;
        }
        catch (e) {
            return "GraphQL Error (Code: " + response.status + ")";
        }
    };
    return ClientError;
}(Error));
exports.ClientError = ClientError;
//# sourceMappingURL=types.js.map

/***/ }),

/***/ 2985:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PathReporter = exports.success = exports.failure = void 0;
var _1 = __webpack_require__(5428);
var Either_1 = __webpack_require__(7534);
function stringify(v) {
    if (typeof v === 'function') {
        return _1.getFunctionName(v);
    }
    if (typeof v === 'number' && !isFinite(v)) {
        if (isNaN(v)) {
            return 'NaN';
        }
        return v > 0 ? 'Infinity' : '-Infinity';
    }
    return JSON.stringify(v);
}
function getContextPath(context) {
    return context.map(function (_a) {
        var key = _a.key, type = _a.type;
        return key + ": " + type.name;
    }).join('/');
}
function getMessage(e) {
    return e.message !== undefined
        ? e.message
        : "Invalid value " + stringify(e.value) + " supplied to " + getContextPath(e.context);
}
/**
 * @since 1.0.0
 */
function failure(es) {
    return es.map(getMessage);
}
exports.failure = failure;
/**
 * @since 1.0.0
 */
function success() {
    return ['No errors!'];
}
exports.success = success;
/**
 * @since 1.0.0
 */
exports.PathReporter = {
    report: Either_1.fold(failure, success)
};


/***/ }),

/***/ 5428:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getIndex = exports.getTags = exports.emptyTags = exports.alias = exports.clean = exports.StrictType = exports.dictionary = exports.Integer = exports.refinement = exports.object = exports.ObjectType = exports.Dictionary = exports.any = exports.AnyType = exports.never = exports.NeverType = exports.getDefaultContext = exports.getValidationError = exports.void = exports.interface = exports.Array = exports.undefined = exports.null = exports.exact = exports.ExactType = exports.taggedUnion = exports.TaggedUnionType = exports.strict = exports.readonlyArray = exports.ReadonlyArrayType = exports.readonly = exports.ReadonlyType = exports.tuple = exports.TupleType = exports.intersection = exports.IntersectionType = exports.union = exports.UnionType = exports.record = exports.getDomainKeys = exports.DictionaryType = exports.partial = exports.PartialType = exports.type = exports.InterfaceType = exports.array = exports.ArrayType = exports.recursion = exports.RecursiveType = exports.keyof = exports.KeyofType = exports.literal = exports.LiteralType = exports.Int = exports.brand = exports.RefinementType = exports.Function = exports.FunctionType = exports.UnknownRecord = exports.AnyDictionaryType = exports.UnknownArray = exports.AnyArrayType = exports.boolean = exports.BooleanType = exports.bigint = exports.BigIntType = exports.number = exports.NumberType = exports.string = exports.StringType = exports.unknown = exports.UnknownType = exports.voidType = exports.VoidType = exports.UndefinedType = exports.nullType = exports.NullType = exports.success = exports.failure = exports.failures = exports.appendContext = exports.getContextEntry = exports.getFunctionName = exports.identity = exports.Type = void 0;
/**
 * @since 1.0.0
 */
var Either_1 = __webpack_require__(7534);
/**
 * @category Model
 * @since 1.0.0
 */
var Type = /** @class */ (function () {
    function Type(
    /** a unique name for this codec */
    name, 
    /** a custom type guard */
    is, 
    /** succeeds if a value of type I can be decoded to a value of type A */
    validate, 
    /** converts a value of type A to a value of type O */
    encode) {
        this.name = name;
        this.is = is;
        this.validate = validate;
        this.encode = encode;
        this.decode = this.decode.bind(this);
    }
    /**
     * @since 1.0.0
     */
    Type.prototype.pipe = function (ab, name) {
        var _this = this;
        if (name === void 0) { name = "pipe(" + this.name + ", " + ab.name + ")"; }
        return new Type(name, ab.is, function (i, c) {
            var e = _this.validate(i, c);
            if (Either_1.isLeft(e)) {
                return e;
            }
            return ab.validate(e.right, c);
        }, this.encode === exports.identity && ab.encode === exports.identity ? exports.identity : function (b) { return _this.encode(ab.encode(b)); });
    };
    /**
     * @since 1.0.0
     */
    Type.prototype.asDecoder = function () {
        return this;
    };
    /**
     * @since 1.0.0
     */
    Type.prototype.asEncoder = function () {
        return this;
    };
    /**
     * a version of `validate` with a default context
     * @since 1.0.0
     */
    Type.prototype.decode = function (i) {
        return this.validate(i, [{ key: '', type: this, actual: i }]);
    };
    return Type;
}());
exports.Type = Type;
/**
 * @since 1.0.0
 */
exports.identity = function (a) { return a; };
/**
 * @since 1.0.0
 */
exports.getFunctionName = function (f) {
    return f.displayName || f.name || "<function" + f.length + ">";
};
/**
 * @since 1.0.0
 */
exports.getContextEntry = function (key, decoder) { return ({ key: key, type: decoder }); };
/**
 * @since 1.0.0
 */
exports.appendContext = function (c, key, decoder, actual) {
    var len = c.length;
    var r = Array(len + 1);
    for (var i = 0; i < len; i++) {
        r[i] = c[i];
    }
    r[len] = { key: key, type: decoder, actual: actual };
    return r;
};
/**
 * @since 1.0.0
 */
exports.failures = Either_1.left;
/**
 * @since 1.0.0
 */
exports.failure = function (value, context, message) {
    return exports.failures([{ value: value, context: context, message: message }]);
};
/**
 * @since 1.0.0
 */
exports.success = Either_1.right;
var pushAll = function (xs, ys) {
    var l = ys.length;
    for (var i = 0; i < l; i++) {
        xs.push(ys[i]);
    }
};
// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------
/**
 * @since 1.0.0
 */
var NullType = /** @class */ (function (_super) {
    __extends(NullType, _super);
    function NullType() {
        var _this = _super.call(this, 'null', function (u) { return u === null; }, function (u, c) { return (_this.is(u) ? exports.success(u) : exports.failure(u, c)); }, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'NullType';
        return _this;
    }
    return NullType;
}(Type));
exports.NullType = NullType;
/**
 * @category Primitives
 * @since 1.0.0
 */
exports.nullType = new NullType();
exports.null = exports.nullType;
/**
 * @since 1.0.0
 */
var UndefinedType = /** @class */ (function (_super) {
    __extends(UndefinedType, _super);
    function UndefinedType() {
        var _this = _super.call(this, 'undefined', function (u) { return u === void 0; }, function (u, c) { return (_this.is(u) ? exports.success(u) : exports.failure(u, c)); }, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'UndefinedType';
        return _this;
    }
    return UndefinedType;
}(Type));
exports.UndefinedType = UndefinedType;
var undefinedType = new UndefinedType();
exports.undefined = undefinedType;
/**
 * @since 1.2.0
 */
var VoidType = /** @class */ (function (_super) {
    __extends(VoidType, _super);
    function VoidType() {
        var _this = _super.call(this, 'void', undefinedType.is, undefinedType.validate, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'VoidType';
        return _this;
    }
    return VoidType;
}(Type));
exports.VoidType = VoidType;
/**
 * @category Primitives
 * @since 1.2.0
 */
exports.voidType = new VoidType();
exports.void = exports.voidType;
/**
 * @since 1.5.0
 */
var UnknownType = /** @class */ (function (_super) {
    __extends(UnknownType, _super);
    function UnknownType() {
        var _this = _super.call(this, 'unknown', function (_) { return true; }, exports.success, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'UnknownType';
        return _this;
    }
    return UnknownType;
}(Type));
exports.UnknownType = UnknownType;
/**
 * @category Primitives
 * @since 1.5.0
 */
exports.unknown = new UnknownType();
/**
 * @since 1.0.0
 */
var StringType = /** @class */ (function (_super) {
    __extends(StringType, _super);
    function StringType() {
        var _this = _super.call(this, 'string', function (u) { return typeof u === 'string'; }, function (u, c) { return (_this.is(u) ? exports.success(u) : exports.failure(u, c)); }, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'StringType';
        return _this;
    }
    return StringType;
}(Type));
exports.StringType = StringType;
/**
 * @category Primitives
 * @since 1.0.0
 */
exports.string = new StringType();
/**
 * @since 1.0.0
 */
var NumberType = /** @class */ (function (_super) {
    __extends(NumberType, _super);
    function NumberType() {
        var _this = _super.call(this, 'number', function (u) { return typeof u === 'number'; }, function (u, c) { return (_this.is(u) ? exports.success(u) : exports.failure(u, c)); }, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'NumberType';
        return _this;
    }
    return NumberType;
}(Type));
exports.NumberType = NumberType;
/**
 * @category Primitives
 * @since 1.0.0
 */
exports.number = new NumberType();
/**
 * @since 2.1.0
 */
var BigIntType = /** @class */ (function (_super) {
    __extends(BigIntType, _super);
    function BigIntType() {
        var _this = _super.call(this, 'bigint', 
        // tslint:disable-next-line: valid-typeof
        function (u) { return typeof u === 'bigint'; }, function (u, c) { return (_this.is(u) ? exports.success(u) : exports.failure(u, c)); }, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'BigIntType';
        return _this;
    }
    return BigIntType;
}(Type));
exports.BigIntType = BigIntType;
/**
 * @category Primitives
 * @since 2.1.0
 */
exports.bigint = new BigIntType();
/**
 * @since 1.0.0
 */
var BooleanType = /** @class */ (function (_super) {
    __extends(BooleanType, _super);
    function BooleanType() {
        var _this = _super.call(this, 'boolean', function (u) { return typeof u === 'boolean'; }, function (u, c) { return (_this.is(u) ? exports.success(u) : exports.failure(u, c)); }, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'BooleanType';
        return _this;
    }
    return BooleanType;
}(Type));
exports.BooleanType = BooleanType;
/**
 * @category Primitives
 * @since 1.0.0
 */
exports.boolean = new BooleanType();
/**
 * @since 1.0.0
 */
var AnyArrayType = /** @class */ (function (_super) {
    __extends(AnyArrayType, _super);
    function AnyArrayType() {
        var _this = _super.call(this, 'UnknownArray', Array.isArray, function (u, c) { return (_this.is(u) ? exports.success(u) : exports.failure(u, c)); }, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'AnyArrayType';
        return _this;
    }
    return AnyArrayType;
}(Type));
exports.AnyArrayType = AnyArrayType;
/**
 * @category Primitives
 * @since 1.7.1
 */
exports.UnknownArray = new AnyArrayType();
exports.Array = exports.UnknownArray;
/**
 * @since 1.0.0
 */
var AnyDictionaryType = /** @class */ (function (_super) {
    __extends(AnyDictionaryType, _super);
    function AnyDictionaryType() {
        var _this = _super.call(this, 'UnknownRecord', function (u) {
            var s = Object.prototype.toString.call(u);
            return s === '[object Object]' || s === '[object Window]';
        }, function (u, c) { return (_this.is(u) ? exports.success(u) : exports.failure(u, c)); }, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'AnyDictionaryType';
        return _this;
    }
    return AnyDictionaryType;
}(Type));
exports.AnyDictionaryType = AnyDictionaryType;
/**
 * @category Primitives
 * @since 1.7.1
 */
exports.UnknownRecord = new AnyDictionaryType();
/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
var FunctionType = /** @class */ (function (_super) {
    __extends(FunctionType, _super);
    function FunctionType() {
        var _this = _super.call(this, 'Function', 
        // tslint:disable-next-line:strict-type-predicates
        function (u) { return typeof u === 'function'; }, function (u, c) { return (_this.is(u) ? exports.success(u) : exports.failure(u, c)); }, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'FunctionType';
        return _this;
    }
    return FunctionType;
}(Type));
exports.FunctionType = FunctionType;
/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
exports.Function = new FunctionType();
/**
 * @since 1.0.0
 */
var RefinementType = /** @class */ (function (_super) {
    __extends(RefinementType, _super);
    function RefinementType(name, is, validate, encode, type, predicate) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.type = type;
        _this.predicate = predicate;
        /**
         * @since 1.0.0
         */
        _this._tag = 'RefinementType';
        return _this;
    }
    return RefinementType;
}(Type));
exports.RefinementType = RefinementType;
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @category Combinators
 * @since 1.8.1
 */
exports.brand = function (codec, predicate, name) {
    // tslint:disable-next-line: deprecation
    return refinement(codec, predicate, name);
};
/**
 * A branded codec representing an integer
 *
 * @category Primitives
 * @since 1.8.1
 */
exports.Int = exports.brand(exports.number, function (n) { return Number.isInteger(n); }, 'Int');
/**
 * @since 1.0.0
 */
var LiteralType = /** @class */ (function (_super) {
    __extends(LiteralType, _super);
    function LiteralType(name, is, validate, encode, value) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.value = value;
        /**
         * @since 1.0.0
         */
        _this._tag = 'LiteralType';
        return _this;
    }
    return LiteralType;
}(Type));
exports.LiteralType = LiteralType;
/**
 * @category Combinators
 * @since 1.0.0
 */
exports.literal = function (value, name) {
    if (name === void 0) { name = JSON.stringify(value); }
    var is = function (u) { return u === value; };
    return new LiteralType(name, is, function (u, c) { return (is(u) ? exports.success(value) : exports.failure(u, c)); }, exports.identity, value);
};
/**
 * @since 1.0.0
 */
var KeyofType = /** @class */ (function (_super) {
    __extends(KeyofType, _super);
    function KeyofType(name, is, validate, encode, keys) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.keys = keys;
        /**
         * @since 1.0.0
         */
        _this._tag = 'KeyofType';
        return _this;
    }
    return KeyofType;
}(Type));
exports.KeyofType = KeyofType;
var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * @category Combinators
 * @since 1.0.0
 */
exports.keyof = function (keys, name) {
    if (name === void 0) { name = Object.keys(keys)
        .map(function (k) { return JSON.stringify(k); })
        .join(' | '); }
    var is = function (u) { return exports.string.is(u) && hasOwnProperty.call(keys, u); };
    return new KeyofType(name, is, function (u, c) { return (is(u) ? exports.success(u) : exports.failure(u, c)); }, exports.identity, keys);
};
/**
 * @since 1.0.0
 */
var RecursiveType = /** @class */ (function (_super) {
    __extends(RecursiveType, _super);
    function RecursiveType(name, is, validate, encode, runDefinition) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.runDefinition = runDefinition;
        /**
         * @since 1.0.0
         */
        _this._tag = 'RecursiveType';
        return _this;
    }
    return RecursiveType;
}(Type));
exports.RecursiveType = RecursiveType;
Object.defineProperty(RecursiveType.prototype, 'type', {
    get: function () {
        return this.runDefinition();
    },
    enumerable: true,
    configurable: true
});
/**
 * @category Combinators
 * @since 1.0.0
 */
exports.recursion = function (name, definition) {
    var cache;
    var runDefinition = function () {
        if (!cache) {
            cache = definition(Self);
            cache.name = name;
        }
        return cache;
    };
    var Self = new RecursiveType(name, function (u) { return runDefinition().is(u); }, function (u, c) { return runDefinition().validate(u, c); }, function (a) { return runDefinition().encode(a); }, runDefinition);
    return Self;
};
/**
 * @since 1.0.0
 */
var ArrayType = /** @class */ (function (_super) {
    __extends(ArrayType, _super);
    function ArrayType(name, is, validate, encode, type) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.type = type;
        /**
         * @since 1.0.0
         */
        _this._tag = 'ArrayType';
        return _this;
    }
    return ArrayType;
}(Type));
exports.ArrayType = ArrayType;
/**
 * @category Combinators
 * @since 1.0.0
 */
exports.array = function (item, name) {
    if (name === void 0) { name = "Array<" + item.name + ">"; }
    return new ArrayType(name, function (u) { return exports.UnknownArray.is(u) && u.every(item.is); }, function (u, c) {
        var e = exports.UnknownArray.validate(u, c);
        if (Either_1.isLeft(e)) {
            return e;
        }
        var us = e.right;
        var len = us.length;
        var as = us;
        var errors = [];
        for (var i = 0; i < len; i++) {
            var ui = us[i];
            var result = item.validate(ui, exports.appendContext(c, String(i), item, ui));
            if (Either_1.isLeft(result)) {
                pushAll(errors, result.left);
            }
            else {
                var ai = result.right;
                if (ai !== ui) {
                    if (as === us) {
                        as = us.slice();
                    }
                    as[i] = ai;
                }
            }
        }
        return errors.length > 0 ? exports.failures(errors) : exports.success(as);
    }, item.encode === exports.identity ? exports.identity : function (a) { return a.map(item.encode); }, item);
};
/**
 * @since 1.0.0
 */
var InterfaceType = /** @class */ (function (_super) {
    __extends(InterfaceType, _super);
    function InterfaceType(name, is, validate, encode, props) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.props = props;
        /**
         * @since 1.0.0
         */
        _this._tag = 'InterfaceType';
        return _this;
    }
    return InterfaceType;
}(Type));
exports.InterfaceType = InterfaceType;
var getNameFromProps = function (props) {
    return Object.keys(props)
        .map(function (k) { return k + ": " + props[k].name; })
        .join(', ');
};
var useIdentity = function (codecs) {
    for (var i = 0; i < codecs.length; i++) {
        if (codecs[i].encode !== exports.identity) {
            return false;
        }
    }
    return true;
};
var getInterfaceTypeName = function (props) {
    return "{ " + getNameFromProps(props) + " }";
};
/**
 * @category Combinators
 * @since 1.0.0
 */
exports.type = function (props, name) {
    if (name === void 0) { name = getInterfaceTypeName(props); }
    var keys = Object.keys(props);
    var types = keys.map(function (key) { return props[key]; });
    var len = keys.length;
    return new InterfaceType(name, function (u) {
        if (exports.UnknownRecord.is(u)) {
            for (var i = 0; i < len; i++) {
                var k = keys[i];
                var uk = u[k];
                if ((uk === undefined && !hasOwnProperty.call(u, k)) || !types[i].is(uk)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }, function (u, c) {
        var e = exports.UnknownRecord.validate(u, c);
        if (Either_1.isLeft(e)) {
            return e;
        }
        var o = e.right;
        var a = o;
        var errors = [];
        for (var i = 0; i < len; i++) {
            var k = keys[i];
            var ak = a[k];
            var type_1 = types[i];
            var result = type_1.validate(ak, exports.appendContext(c, k, type_1, ak));
            if (Either_1.isLeft(result)) {
                pushAll(errors, result.left);
            }
            else {
                var vak = result.right;
                if (vak !== ak || (vak === undefined && !hasOwnProperty.call(a, k))) {
                    /* istanbul ignore next */
                    if (a === o) {
                        a = __assign({}, o);
                    }
                    a[k] = vak;
                }
            }
        }
        return errors.length > 0 ? exports.failures(errors) : exports.success(a);
    }, useIdentity(types)
        ? exports.identity
        : function (a) {
            var s = __assign({}, a);
            for (var i = 0; i < len; i++) {
                var k = keys[i];
                var encode = types[i].encode;
                if (encode !== exports.identity) {
                    s[k] = encode(a[k]);
                }
            }
            return s;
        }, props);
};
exports.interface = exports.type;
/**
 * @since 1.0.0
 */
var PartialType = /** @class */ (function (_super) {
    __extends(PartialType, _super);
    function PartialType(name, is, validate, encode, props) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.props = props;
        /**
         * @since 1.0.0
         */
        _this._tag = 'PartialType';
        return _this;
    }
    return PartialType;
}(Type));
exports.PartialType = PartialType;
var getPartialTypeName = function (inner) {
    return "Partial<" + inner + ">";
};
/**
 * @category Combinators
 * @since 1.0.0
 */
exports.partial = function (props, name) {
    if (name === void 0) { name = getPartialTypeName(getInterfaceTypeName(props)); }
    var keys = Object.keys(props);
    var types = keys.map(function (key) { return props[key]; });
    var len = keys.length;
    return new PartialType(name, function (u) {
        if (exports.UnknownRecord.is(u)) {
            for (var i = 0; i < len; i++) {
                var k = keys[i];
                var uk = u[k];
                if (uk !== undefined && !props[k].is(uk)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }, function (u, c) {
        var e = exports.UnknownRecord.validate(u, c);
        if (Either_1.isLeft(e)) {
            return e;
        }
        var o = e.right;
        var a = o;
        var errors = [];
        for (var i = 0; i < len; i++) {
            var k = keys[i];
            var ak = a[k];
            var type_2 = props[k];
            var result = type_2.validate(ak, exports.appendContext(c, k, type_2, ak));
            if (Either_1.isLeft(result)) {
                if (ak !== undefined) {
                    pushAll(errors, result.left);
                }
            }
            else {
                var vak = result.right;
                if (vak !== ak) {
                    /* istanbul ignore next */
                    if (a === o) {
                        a = __assign({}, o);
                    }
                    a[k] = vak;
                }
            }
        }
        return errors.length > 0 ? exports.failures(errors) : exports.success(a);
    }, useIdentity(types)
        ? exports.identity
        : function (a) {
            var s = __assign({}, a);
            for (var i = 0; i < len; i++) {
                var k = keys[i];
                var ak = a[k];
                if (ak !== undefined) {
                    s[k] = types[i].encode(ak);
                }
            }
            return s;
        }, props);
};
/**
 * @since 1.0.0
 */
var DictionaryType = /** @class */ (function (_super) {
    __extends(DictionaryType, _super);
    function DictionaryType(name, is, validate, encode, domain, codomain) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.domain = domain;
        _this.codomain = codomain;
        /**
         * @since 1.0.0
         */
        _this._tag = 'DictionaryType';
        return _this;
    }
    return DictionaryType;
}(Type));
exports.DictionaryType = DictionaryType;
function enumerableRecord(keys, domain, codomain, name) {
    if (name === void 0) { name = "{ [K in " + domain.name + "]: " + codomain.name + " }"; }
    var len = keys.length;
    return new DictionaryType(name, function (u) { return exports.UnknownRecord.is(u) && keys.every(function (k) { return codomain.is(u[k]); }); }, function (u, c) {
        var e = exports.UnknownRecord.validate(u, c);
        if (Either_1.isLeft(e)) {
            return e;
        }
        var o = e.right;
        var a = {};
        var errors = [];
        var changed = false;
        for (var i = 0; i < len; i++) {
            var k = keys[i];
            var ok = o[k];
            var codomainResult = codomain.validate(ok, exports.appendContext(c, k, codomain, ok));
            if (Either_1.isLeft(codomainResult)) {
                pushAll(errors, codomainResult.left);
            }
            else {
                var vok = codomainResult.right;
                changed = changed || vok !== ok;
                a[k] = vok;
            }
        }
        return errors.length > 0 ? exports.failures(errors) : exports.success((changed || Object.keys(o).length !== len ? a : o));
    }, codomain.encode === exports.identity
        ? exports.identity
        : function (a) {
            var s = {};
            for (var i = 0; i < len; i++) {
                var k = keys[i];
                s[k] = codomain.encode(a[k]);
            }
            return s;
        }, domain, codomain);
}
/**
 * @internal
 */
function getDomainKeys(domain) {
    var _a;
    if (isLiteralC(domain)) {
        var literal_1 = domain.value;
        if (exports.string.is(literal_1)) {
            return _a = {}, _a[literal_1] = null, _a;
        }
    }
    else if (isKeyofC(domain)) {
        return domain.keys;
    }
    else if (isUnionC(domain)) {
        var keys = domain.types.map(function (type) { return getDomainKeys(type); });
        return keys.some(undefinedType.is) ? undefined : Object.assign.apply(Object, __spreadArrays([{}], keys));
    }
    return undefined;
}
exports.getDomainKeys = getDomainKeys;
function nonEnumerableRecord(domain, codomain, name) {
    if (name === void 0) { name = "{ [K in " + domain.name + "]: " + codomain.name + " }"; }
    return new DictionaryType(name, function (u) {
        if (exports.UnknownRecord.is(u)) {
            return Object.keys(u).every(function (k) { return domain.is(k) && codomain.is(u[k]); });
        }
        return isAnyC(codomain) && Array.isArray(u);
    }, function (u, c) {
        if (exports.UnknownRecord.is(u)) {
            var a = {};
            var errors = [];
            var keys = Object.keys(u);
            var len = keys.length;
            var changed = false;
            for (var i = 0; i < len; i++) {
                var k = keys[i];
                var ok = u[k];
                var domainResult = domain.validate(k, exports.appendContext(c, k, domain, k));
                if (Either_1.isLeft(domainResult)) {
                    pushAll(errors, domainResult.left);
                }
                else {
                    var vk = domainResult.right;
                    changed = changed || vk !== k;
                    k = vk;
                    var codomainResult = codomain.validate(ok, exports.appendContext(c, k, codomain, ok));
                    if (Either_1.isLeft(codomainResult)) {
                        pushAll(errors, codomainResult.left);
                    }
                    else {
                        var vok = codomainResult.right;
                        changed = changed || vok !== ok;
                        a[k] = vok;
                    }
                }
            }
            return errors.length > 0 ? exports.failures(errors) : exports.success((changed ? a : u));
        }
        if (isAnyC(codomain) && Array.isArray(u)) {
            return exports.success(u);
        }
        return exports.failure(u, c);
    }, domain.encode === exports.identity && codomain.encode === exports.identity
        ? exports.identity
        : function (a) {
            var s = {};
            var keys = Object.keys(a);
            var len = keys.length;
            for (var i = 0; i < len; i++) {
                var k = keys[i];
                s[String(domain.encode(k))] = codomain.encode(a[k]);
            }
            return s;
        }, domain, codomain);
}
/**
 * @category Combinators
 * @since 1.7.1
 */
function record(domain, codomain, name) {
    var keys = getDomainKeys(domain);
    return keys
        ? enumerableRecord(Object.keys(keys), domain, codomain, name)
        : nonEnumerableRecord(domain, codomain, name);
}
exports.record = record;
/**
 * @since 1.0.0
 */
var UnionType = /** @class */ (function (_super) {
    __extends(UnionType, _super);
    function UnionType(name, is, validate, encode, types) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.types = types;
        /**
         * @since 1.0.0
         */
        _this._tag = 'UnionType';
        return _this;
    }
    return UnionType;
}(Type));
exports.UnionType = UnionType;
var getUnionName = function (codecs) {
    return '(' + codecs.map(function (type) { return type.name; }).join(' | ') + ')';
};
/**
 * @category Combinators
 * @since 1.0.0
 */
exports.union = function (codecs, name) {
    if (name === void 0) { name = getUnionName(codecs); }
    var index = getIndex(codecs);
    if (index !== undefined && codecs.length > 0) {
        var tag_1 = index[0], groups_1 = index[1];
        var len_1 = groups_1.length;
        var find_1 = function (value) {
            for (var i = 0; i < len_1; i++) {
                if (groups_1[i].indexOf(value) !== -1) {
                    return i;
                }
            }
            return undefined;
        };
        // tslint:disable-next-line: deprecation
        return new TaggedUnionType(name, function (u) {
            if (exports.UnknownRecord.is(u)) {
                var i = find_1(u[tag_1]);
                return i !== undefined ? codecs[i].is(u) : false;
            }
            return false;
        }, function (u, c) {
            var e = exports.UnknownRecord.validate(u, c);
            if (Either_1.isLeft(e)) {
                return e;
            }
            var r = e.right;
            var i = find_1(r[tag_1]);
            if (i === undefined) {
                return exports.failure(u, c);
            }
            var codec = codecs[i];
            return codec.validate(r, exports.appendContext(c, String(i), codec, r));
        }, useIdentity(codecs)
            ? exports.identity
            : function (a) {
                var i = find_1(a[tag_1]);
                if (i === undefined) {
                    // https://github.com/gcanti/io-ts/pull/305
                    throw new Error("no codec found to encode value in union codec " + name);
                }
                else {
                    return codecs[i].encode(a);
                }
            }, codecs, tag_1);
    }
    else {
        return new UnionType(name, function (u) { return codecs.some(function (type) { return type.is(u); }); }, function (u, c) {
            var errors = [];
            for (var i = 0; i < codecs.length; i++) {
                var codec = codecs[i];
                var result = codec.validate(u, exports.appendContext(c, String(i), codec, u));
                if (Either_1.isLeft(result)) {
                    pushAll(errors, result.left);
                }
                else {
                    return exports.success(result.right);
                }
            }
            return exports.failures(errors);
        }, useIdentity(codecs)
            ? exports.identity
            : function (a) {
                for (var _i = 0, codecs_1 = codecs; _i < codecs_1.length; _i++) {
                    var codec = codecs_1[_i];
                    if (codec.is(a)) {
                        return codec.encode(a);
                    }
                }
                // https://github.com/gcanti/io-ts/pull/305
                throw new Error("no codec found to encode value in union type " + name);
            }, codecs);
    }
};
/**
 * @since 1.0.0
 */
var IntersectionType = /** @class */ (function (_super) {
    __extends(IntersectionType, _super);
    function IntersectionType(name, is, validate, encode, types) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.types = types;
        /**
         * @since 1.0.0
         */
        _this._tag = 'IntersectionType';
        return _this;
    }
    return IntersectionType;
}(Type));
exports.IntersectionType = IntersectionType;
var mergeAll = function (base, us) {
    var equal = true;
    var primitive = true;
    for (var _i = 0, us_1 = us; _i < us_1.length; _i++) {
        var u = us_1[_i];
        if (u !== base) {
            equal = false;
        }
        if (exports.UnknownRecord.is(u)) {
            primitive = false;
        }
    }
    if (equal) {
        return base;
    }
    else if (primitive) {
        return us[us.length - 1];
    }
    var r = {};
    for (var _a = 0, us_2 = us; _a < us_2.length; _a++) {
        var u = us_2[_a];
        for (var k in u) {
            if (u[k] !== base[k] || !r.hasOwnProperty(k)) {
                r[k] = u[k];
            }
        }
    }
    return r;
};
function intersection(codecs, name) {
    if (name === void 0) { name = "(" + codecs.map(function (type) { return type.name; }).join(' & ') + ")"; }
    var len = codecs.length;
    return new IntersectionType(name, function (u) { return codecs.every(function (type) { return type.is(u); }); }, codecs.length === 0
        ? exports.success
        : function (u, c) {
            var us = [];
            var errors = [];
            for (var i = 0; i < len; i++) {
                var codec = codecs[i];
                var result = codec.validate(u, exports.appendContext(c, String(i), codec, u));
                if (Either_1.isLeft(result)) {
                    pushAll(errors, result.left);
                }
                else {
                    us.push(result.right);
                }
            }
            return errors.length > 0 ? exports.failures(errors) : exports.success(mergeAll(u, us));
        }, codecs.length === 0
        ? exports.identity
        : function (a) {
            return mergeAll(a, codecs.map(function (codec) { return codec.encode(a); }));
        }, codecs);
}
exports.intersection = intersection;
/**
 * @since 1.0.0
 */
var TupleType = /** @class */ (function (_super) {
    __extends(TupleType, _super);
    function TupleType(name, is, validate, encode, types) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.types = types;
        /**
         * @since 1.0.0
         */
        _this._tag = 'TupleType';
        return _this;
    }
    return TupleType;
}(Type));
exports.TupleType = TupleType;
function tuple(codecs, name) {
    if (name === void 0) { name = "[" + codecs.map(function (type) { return type.name; }).join(', ') + "]"; }
    var len = codecs.length;
    return new TupleType(name, function (u) { return exports.UnknownArray.is(u) && u.length === len && codecs.every(function (type, i) { return type.is(u[i]); }); }, function (u, c) {
        var e = exports.UnknownArray.validate(u, c);
        if (Either_1.isLeft(e)) {
            return e;
        }
        var us = e.right;
        var as = us.length > len ? us.slice(0, len) : us; // strip additional components
        var errors = [];
        for (var i = 0; i < len; i++) {
            var a = us[i];
            var type_3 = codecs[i];
            var result = type_3.validate(a, exports.appendContext(c, String(i), type_3, a));
            if (Either_1.isLeft(result)) {
                pushAll(errors, result.left);
            }
            else {
                var va = result.right;
                if (va !== a) {
                    /* istanbul ignore next */
                    if (as === us) {
                        as = us.slice();
                    }
                    as[i] = va;
                }
            }
        }
        return errors.length > 0 ? exports.failures(errors) : exports.success(as);
    }, useIdentity(codecs) ? exports.identity : function (a) { return codecs.map(function (type, i) { return type.encode(a[i]); }); }, codecs);
}
exports.tuple = tuple;
/**
 * @since 1.0.0
 */
var ReadonlyType = /** @class */ (function (_super) {
    __extends(ReadonlyType, _super);
    function ReadonlyType(name, is, validate, encode, type) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.type = type;
        /**
         * @since 1.0.0
         */
        _this._tag = 'ReadonlyType';
        return _this;
    }
    return ReadonlyType;
}(Type));
exports.ReadonlyType = ReadonlyType;
/**
 * @category Combinators
 * @since 1.0.0
 */
exports.readonly = function (codec, name) {
    if (name === void 0) { name = "Readonly<" + codec.name + ">"; }
    return new ReadonlyType(name, codec.is, codec.validate, codec.encode, codec);
};
/**
 * @since 1.0.0
 */
var ReadonlyArrayType = /** @class */ (function (_super) {
    __extends(ReadonlyArrayType, _super);
    function ReadonlyArrayType(name, is, validate, encode, type) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.type = type;
        /**
         * @since 1.0.0
         */
        _this._tag = 'ReadonlyArrayType';
        return _this;
    }
    return ReadonlyArrayType;
}(Type));
exports.ReadonlyArrayType = ReadonlyArrayType;
/**
 * @category Combinators
 * @since 1.0.0
 */
exports.readonlyArray = function (item, name) {
    if (name === void 0) { name = "ReadonlyArray<" + item.name + ">"; }
    var codec = exports.array(item);
    return new ReadonlyArrayType(name, codec.is, codec.validate, codec.encode, item);
};
/**
 * Strips additional properties
 *
 * @category Combinators
 * @since 1.0.0
 */
exports.strict = function (props, name) {
    return exports.exact(exports.type(props), name);
};
/**
 * @category deprecated
 * @since 1.3.0
 * @deprecated
 */
var TaggedUnionType = /** @class */ (function (_super) {
    __extends(TaggedUnionType, _super);
    function TaggedUnionType(name, 
    // tslint:disable-next-line: deprecation
    is, 
    // tslint:disable-next-line: deprecation
    validate, 
    // tslint:disable-next-line: deprecation
    encode, codecs, tag) {
        var _this = _super.call(this, name, is, validate, encode, codecs) /* istanbul ignore next */ // <= workaround for https://github.com/Microsoft/TypeScript/issues/13455
         || this;
        _this.tag = tag;
        return _this;
    }
    return TaggedUnionType;
}(UnionType));
exports.TaggedUnionType = TaggedUnionType;
/**
 * Use `union` instead
 *
 * @category deprecated
 * @since 1.3.0
 * @deprecated
 */
exports.taggedUnion = function (tag, codecs, name
// tslint:disable-next-line: deprecation
) {
    if (name === void 0) { name = getUnionName(codecs); }
    var U = exports.union(codecs, name);
    // tslint:disable-next-line: deprecation
    if (U instanceof TaggedUnionType) {
        return U;
    }
    else {
        console.warn("[io-ts] Cannot build a tagged union for " + name + ", returning a de-optimized union");
        // tslint:disable-next-line: deprecation
        return new TaggedUnionType(name, U.is, U.validate, U.encode, codecs, tag);
    }
};
/**
 * @since 1.1.0
 */
var ExactType = /** @class */ (function (_super) {
    __extends(ExactType, _super);
    function ExactType(name, is, validate, encode, type) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.type = type;
        /**
         * @since 1.0.0
         */
        _this._tag = 'ExactType';
        return _this;
    }
    return ExactType;
}(Type));
exports.ExactType = ExactType;
var getProps = function (codec) {
    switch (codec._tag) {
        case 'RefinementType':
        case 'ReadonlyType':
            return getProps(codec.type);
        case 'InterfaceType':
        case 'StrictType':
        case 'PartialType':
            return codec.props;
        case 'IntersectionType':
            return codec.types.reduce(function (props, type) { return Object.assign(props, getProps(type)); }, {});
    }
};
var stripKeys = function (o, props) {
    var keys = Object.getOwnPropertyNames(o);
    var shouldStrip = false;
    var r = {};
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!hasOwnProperty.call(props, key)) {
            shouldStrip = true;
        }
        else {
            r[key] = o[key];
        }
    }
    return shouldStrip ? r : o;
};
var getExactTypeName = function (codec) {
    if (isTypeC(codec)) {
        return "{| " + getNameFromProps(codec.props) + " |}";
    }
    else if (isPartialC(codec)) {
        return getPartialTypeName("{| " + getNameFromProps(codec.props) + " |}");
    }
    return "Exact<" + codec.name + ">";
};
/**
 * Strips additional properties
 * @since 1.1.0
 */
exports.exact = function (codec, name) {
    if (name === void 0) { name = getExactTypeName(codec); }
    var props = getProps(codec);
    return new ExactType(name, codec.is, function (u, c) {
        var e = exports.UnknownRecord.validate(u, c);
        if (Either_1.isLeft(e)) {
            return e;
        }
        var ce = codec.validate(u, c);
        if (Either_1.isLeft(ce)) {
            return ce;
        }
        return Either_1.right(stripKeys(ce.right, props));
    }, function (a) { return codec.encode(stripKeys(a, props)); }, codec);
};
/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
exports.getValidationError /* istanbul ignore next */ = function (value, context) { return ({
    value: value,
    context: context
}); };
/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
exports.getDefaultContext /* istanbul ignore next */ = function (decoder) { return [
    { key: '', type: decoder }
]; };
/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
var NeverType = /** @class */ (function (_super) {
    __extends(NeverType, _super);
    function NeverType() {
        var _this = _super.call(this, 'never', function (_) { return false; }, function (u, c) { return exports.failure(u, c); }, 
        /* istanbul ignore next */
        function () {
            throw new Error('cannot encode never');
        }) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'NeverType';
        return _this;
    }
    return NeverType;
}(Type));
exports.NeverType = NeverType;
/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
exports.never = new NeverType();
/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
var AnyType = /** @class */ (function (_super) {
    __extends(AnyType, _super);
    function AnyType() {
        var _this = _super.call(this, 'any', function (_) { return true; }, exports.success, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'AnyType';
        return _this;
    }
    return AnyType;
}(Type));
exports.AnyType = AnyType;
/**
 * Use `unknown` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
exports.any = new AnyType();
/**
 * Use `UnknownRecord` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
exports.Dictionary = exports.UnknownRecord;
/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
var ObjectType = /** @class */ (function (_super) {
    __extends(ObjectType, _super);
    function ObjectType() {
        var _this = _super.call(this, 'object', function (u) { return u !== null && typeof u === 'object'; }, function (u, c) { return (_this.is(u) ? exports.success(u) : exports.failure(u, c)); }, exports.identity) || this;
        /**
         * @since 1.0.0
         */
        _this._tag = 'ObjectType';
        return _this;
    }
    return ObjectType;
}(Type));
exports.ObjectType = ObjectType;
/**
 * Use `UnknownRecord` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
exports.object = new ObjectType();
/**
 * Use `brand` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
function refinement(codec, predicate, name) {
    if (name === void 0) { name = "(" + codec.name + " | " + exports.getFunctionName(predicate) + ")"; }
    return new RefinementType(name, function (u) { return codec.is(u) && predicate(u); }, function (i, c) {
        var e = codec.validate(i, c);
        if (Either_1.isLeft(e)) {
            return e;
        }
        var a = e.right;
        return predicate(a) ? exports.success(a) : exports.failure(a, c);
    }, codec.encode, codec, predicate);
}
exports.refinement = refinement;
/**
 * Use `Int` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
exports.Integer = refinement(exports.number, Number.isInteger, 'Integer');
/**
 * Use `record` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
exports.dictionary = record;
/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
var StrictType = /** @class */ (function (_super) {
    __extends(StrictType, _super);
    function StrictType(name, 
    // tslint:disable-next-line: deprecation
    is, 
    // tslint:disable-next-line: deprecation
    validate, 
    // tslint:disable-next-line: deprecation
    encode, props) {
        var _this = _super.call(this, name, is, validate, encode) || this;
        _this.props = props;
        /**
         * @since 1.0.0
         */
        _this._tag = 'StrictType';
        return _this;
    }
    return StrictType;
}(Type));
exports.StrictType = StrictType;
/**
 * Drops the codec "kind"
 *
 * @category deprecated
 * @since 1.1.0
 * @deprecated
 */
function clean(codec) {
    return codec;
}
exports.clean = clean;
function alias(codec) {
    return function () { return codec; };
}
exports.alias = alias;
var isNonEmpty = function (as) { return as.length > 0; };
/**
 * @internal
 */
exports.emptyTags = {};
function intersect(a, b) {
    var r = [];
    for (var _i = 0, a_1 = a; _i < a_1.length; _i++) {
        var v = a_1[_i];
        if (b.indexOf(v) !== -1) {
            r.push(v);
        }
    }
    return r;
}
function mergeTags(a, b) {
    if (a === exports.emptyTags) {
        return b;
    }
    if (b === exports.emptyTags) {
        return a;
    }
    var r = Object.assign({}, a);
    for (var k in b) {
        if (a.hasOwnProperty(k)) {
            var intersection_1 = intersect(a[k], b[k]);
            if (isNonEmpty(intersection_1)) {
                r[k] = intersection_1;
            }
            else {
                r = exports.emptyTags;
                break;
            }
        }
        else {
            r[k] = b[k];
        }
    }
    return r;
}
function intersectTags(a, b) {
    if (a === exports.emptyTags || b === exports.emptyTags) {
        return exports.emptyTags;
    }
    var r = exports.emptyTags;
    for (var k in a) {
        if (b.hasOwnProperty(k)) {
            var intersection_2 = intersect(a[k], b[k]);
            if (intersection_2.length === 0) {
                if (r === exports.emptyTags) {
                    r = {};
                }
                r[k] = a[k].concat(b[k]);
            }
        }
    }
    return r;
}
// tslint:disable-next-line: deprecation
function isAnyC(codec) {
    return codec._tag === 'AnyType';
}
function isLiteralC(codec) {
    return codec._tag === 'LiteralType';
}
function isKeyofC(codec) {
    return codec._tag === 'KeyofType';
}
function isTypeC(codec) {
    return codec._tag === 'InterfaceType';
}
function isPartialC(codec) {
    return codec._tag === 'PartialType';
}
// tslint:disable-next-line: deprecation
function isStrictC(codec) {
    return codec._tag === 'StrictType';
}
function isExactC(codec) {
    return codec._tag === 'ExactType';
}
// tslint:disable-next-line: deprecation
function isRefinementC(codec) {
    return codec._tag === 'RefinementType';
}
function isIntersectionC(codec) {
    return codec._tag === 'IntersectionType';
}
function isUnionC(codec) {
    return codec._tag === 'UnionType';
}
function isRecursiveC(codec) {
    return codec._tag === 'RecursiveType';
}
var lazyCodecs = [];
/**
 * @internal
 */
function getTags(codec) {
    if (lazyCodecs.indexOf(codec) !== -1) {
        return exports.emptyTags;
    }
    if (isTypeC(codec) || isStrictC(codec)) {
        var index = exports.emptyTags;
        // tslint:disable-next-line: forin
        for (var k in codec.props) {
            var prop = codec.props[k];
            if (isLiteralC(prop)) {
                if (index === exports.emptyTags) {
                    index = {};
                }
                index[k] = [prop.value];
            }
        }
        return index;
    }
    else if (isExactC(codec) || isRefinementC(codec)) {
        return getTags(codec.type);
    }
    else if (isIntersectionC(codec)) {
        return codec.types.reduce(function (tags, codec) { return mergeTags(tags, getTags(codec)); }, exports.emptyTags);
    }
    else if (isUnionC(codec)) {
        return codec.types.slice(1).reduce(function (tags, codec) { return intersectTags(tags, getTags(codec)); }, getTags(codec.types[0]));
    }
    else if (isRecursiveC(codec)) {
        lazyCodecs.push(codec);
        var tags = getTags(codec.type);
        lazyCodecs.pop();
        return tags;
    }
    return exports.emptyTags;
}
exports.getTags = getTags;
/**
 * @internal
 */
function getIndex(codecs) {
    var tags = getTags(codecs[0]);
    var keys = Object.keys(tags);
    var len = codecs.length;
    var _loop_1 = function (k) {
        var all = tags[k].slice();
        var index = [tags[k]];
        for (var i = 1; i < len; i++) {
            var codec = codecs[i];
            var ctags = getTags(codec);
            var values = ctags[k];
            // tslint:disable-next-line: strict-type-predicates
            if (values === undefined) {
                return "continue-keys";
            }
            else {
                if (values.some(function (v) { return all.indexOf(v) !== -1; })) {
                    return "continue-keys";
                }
                else {
                    all.push.apply(all, values);
                    index.push(values);
                }
            }
        }
        return { value: [k, index] };
    };
    keys: for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var k = keys_1[_i];
        var state_1 = _loop_1(k);
        if (typeof state_1 === "object")
            return state_1.value;
        switch (state_1) {
            case "continue-keys": continue keys;
        }
    }
    return undefined;
}
exports.getIndex = getIndex;


/***/ }),

/***/ 7426:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * MIT Licensed
 */

/**
 * Module exports.
 */

module.exports = __webpack_require__(3313)


/***/ }),

/***/ 3583:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*!
 * mime-types
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module dependencies.
 * @private
 */

var db = __webpack_require__(7426)
var extname = __webpack_require__(5622).extname

/**
 * Module variables.
 * @private
 */

var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/
var TEXT_TYPE_REGEXP = /^text\//i

/**
 * Module exports.
 * @public
 */

exports.charset = charset
exports.charsets = { lookup: charset }
exports.contentType = contentType
exports.extension = extension
exports.extensions = Object.create(null)
exports.lookup = lookup
exports.types = Object.create(null)

// Populate the extensions/types maps
populateMaps(exports.extensions, exports.types)

/**
 * Get the default charset for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

function charset (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type)
  var mime = match && db[match[1].toLowerCase()]

  if (mime && mime.charset) {
    return mime.charset
  }

  // default text/* to utf-8
  if (match && TEXT_TYPE_REGEXP.test(match[1])) {
    return 'UTF-8'
  }

  return false
}

/**
 * Create a full Content-Type header given a MIME type or extension.
 *
 * @param {string} str
 * @return {boolean|string}
 */

function contentType (str) {
  // TODO: should this even be in this module?
  if (!str || typeof str !== 'string') {
    return false
  }

  var mime = str.indexOf('/') === -1
    ? exports.lookup(str)
    : str

  if (!mime) {
    return false
  }

  // TODO: use content-type or other module
  if (mime.indexOf('charset') === -1) {
    var charset = exports.charset(mime)
    if (charset) mime += '; charset=' + charset.toLowerCase()
  }

  return mime
}

/**
 * Get the default extension for a MIME type.
 *
 * @param {string} type
 * @return {boolean|string}
 */

function extension (type) {
  if (!type || typeof type !== 'string') {
    return false
  }

  // TODO: use media-typer
  var match = EXTRACT_TYPE_REGEXP.exec(type)

  // get extensions
  var exts = match && exports.extensions[match[1].toLowerCase()]

  if (!exts || !exts.length) {
    return false
  }

  return exts[0]
}

/**
 * Lookup the MIME type for a file path/extension.
 *
 * @param {string} path
 * @return {boolean|string}
 */

function lookup (path) {
  if (!path || typeof path !== 'string') {
    return false
  }

  // get the extension ("ext" or ".ext" or full path)
  var extension = extname('x.' + path)
    .toLowerCase()
    .substr(1)

  if (!extension) {
    return false
  }

  return exports.types[extension] || false
}

/**
 * Populate the extensions and types maps.
 * @private
 */

function populateMaps (extensions, types) {
  // source preference (least -> most)
  var preference = ['nginx', 'apache', undefined, 'iana']

  Object.keys(db).forEach(function forEachMimeType (type) {
    var mime = db[type]
    var exts = mime.extensions

    if (!exts || !exts.length) {
      return
    }

    // mime -> extensions
    extensions[type] = exts

    // extension -> mime
    for (var i = 0; i < exts.length; i++) {
      var extension = exts[i]

      if (types[extension]) {
        var from = preference.indexOf(db[types[extension]].source)
        var to = preference.indexOf(mime.source)

        if (types[extension] !== 'application/octet-stream' &&
          (from > to || (from === to && types[extension].substr(0, 12) === 'application/'))) {
          // skip the remapping
          continue
        }
      }

      // set the extension -> mime
      types[extension] = type
    }
  })
}


/***/ }),

/***/ 467:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(__webpack_require__(2413));
var http = _interopDefault(__webpack_require__(8605));
var Url = _interopDefault(__webpack_require__(8835));
var https = _interopDefault(__webpack_require__(7211));
var zlib = _interopDefault(__webpack_require__(8761));

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = __webpack_require__(2877).convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

module.exports = exports = fetch;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = exports;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;


/***/ }),

/***/ 2877:
/***/ ((module) => {

module.exports = eval("require")("encoding");


/***/ }),

/***/ 8560:
/***/ ((module) => {

module.exports = eval("require")("graphql/language/printer");


/***/ }),

/***/ 3313:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse("{\"application/1d-interleaved-parityfec\":{\"source\":\"iana\"},\"application/3gpdash-qoe-report+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/3gpp-ims+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/a2l\":{\"source\":\"iana\"},\"application/activemessage\":{\"source\":\"iana\"},\"application/activity+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-costmap+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-costmapfilter+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-directory+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-endpointcost+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-endpointcostparams+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-endpointprop+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-endpointpropparams+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-error+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-networkmap+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-networkmapfilter+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-updatestreamcontrol+json\":{\"source\":\"iana\",\"compressible\":true},\"application/alto-updatestreamparams+json\":{\"source\":\"iana\",\"compressible\":true},\"application/aml\":{\"source\":\"iana\"},\"application/andrew-inset\":{\"source\":\"iana\",\"extensions\":[\"ez\"]},\"application/applefile\":{\"source\":\"iana\"},\"application/applixware\":{\"source\":\"apache\",\"extensions\":[\"aw\"]},\"application/atf\":{\"source\":\"iana\"},\"application/atfx\":{\"source\":\"iana\"},\"application/atom+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"atom\"]},\"application/atomcat+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"atomcat\"]},\"application/atomdeleted+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"atomdeleted\"]},\"application/atomicmail\":{\"source\":\"iana\"},\"application/atomsvc+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"atomsvc\"]},\"application/atsc-dwd+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"dwd\"]},\"application/atsc-dynamic-event-message\":{\"source\":\"iana\"},\"application/atsc-held+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"held\"]},\"application/atsc-rdt+json\":{\"source\":\"iana\",\"compressible\":true},\"application/atsc-rsat+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rsat\"]},\"application/atxml\":{\"source\":\"iana\"},\"application/auth-policy+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/bacnet-xdd+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/batch-smtp\":{\"source\":\"iana\"},\"application/bdoc\":{\"compressible\":false,\"extensions\":[\"bdoc\"]},\"application/beep+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/calendar+json\":{\"source\":\"iana\",\"compressible\":true},\"application/calendar+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xcs\"]},\"application/call-completion\":{\"source\":\"iana\"},\"application/cals-1840\":{\"source\":\"iana\"},\"application/cap+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/cbor\":{\"source\":\"iana\"},\"application/cbor-seq\":{\"source\":\"iana\"},\"application/cccex\":{\"source\":\"iana\"},\"application/ccmp+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/ccxml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"ccxml\"]},\"application/cdfx+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"cdfx\"]},\"application/cdmi-capability\":{\"source\":\"iana\",\"extensions\":[\"cdmia\"]},\"application/cdmi-container\":{\"source\":\"iana\",\"extensions\":[\"cdmic\"]},\"application/cdmi-domain\":{\"source\":\"iana\",\"extensions\":[\"cdmid\"]},\"application/cdmi-object\":{\"source\":\"iana\",\"extensions\":[\"cdmio\"]},\"application/cdmi-queue\":{\"source\":\"iana\",\"extensions\":[\"cdmiq\"]},\"application/cdni\":{\"source\":\"iana\"},\"application/cea\":{\"source\":\"iana\"},\"application/cea-2018+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/cellml+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/cfw\":{\"source\":\"iana\"},\"application/clue+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/clue_info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/cms\":{\"source\":\"iana\"},\"application/cnrp+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/coap-group+json\":{\"source\":\"iana\",\"compressible\":true},\"application/coap-payload\":{\"source\":\"iana\"},\"application/commonground\":{\"source\":\"iana\"},\"application/conference-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/cose\":{\"source\":\"iana\"},\"application/cose-key\":{\"source\":\"iana\"},\"application/cose-key-set\":{\"source\":\"iana\"},\"application/cpl+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/csrattrs\":{\"source\":\"iana\"},\"application/csta+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/cstadata+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/csvm+json\":{\"source\":\"iana\",\"compressible\":true},\"application/cu-seeme\":{\"source\":\"apache\",\"extensions\":[\"cu\"]},\"application/cwt\":{\"source\":\"iana\"},\"application/cybercash\":{\"source\":\"iana\"},\"application/dart\":{\"compressible\":true},\"application/dash+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"mpd\"]},\"application/dashdelta\":{\"source\":\"iana\"},\"application/davmount+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"davmount\"]},\"application/dca-rft\":{\"source\":\"iana\"},\"application/dcd\":{\"source\":\"iana\"},\"application/dec-dx\":{\"source\":\"iana\"},\"application/dialog-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/dicom\":{\"source\":\"iana\"},\"application/dicom+json\":{\"source\":\"iana\",\"compressible\":true},\"application/dicom+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/dii\":{\"source\":\"iana\"},\"application/dit\":{\"source\":\"iana\"},\"application/dns\":{\"source\":\"iana\"},\"application/dns+json\":{\"source\":\"iana\",\"compressible\":true},\"application/dns-message\":{\"source\":\"iana\"},\"application/docbook+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"dbk\"]},\"application/dots+cbor\":{\"source\":\"iana\"},\"application/dskpp+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/dssc+der\":{\"source\":\"iana\",\"extensions\":[\"dssc\"]},\"application/dssc+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xdssc\"]},\"application/dvcs\":{\"source\":\"iana\"},\"application/ecmascript\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"ecma\",\"es\"]},\"application/edi-consent\":{\"source\":\"iana\"},\"application/edi-x12\":{\"source\":\"iana\",\"compressible\":false},\"application/edifact\":{\"source\":\"iana\",\"compressible\":false},\"application/efi\":{\"source\":\"iana\"},\"application/emergencycalldata.comment+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/emergencycalldata.control+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/emergencycalldata.deviceinfo+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/emergencycalldata.ecall.msd\":{\"source\":\"iana\"},\"application/emergencycalldata.providerinfo+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/emergencycalldata.serviceinfo+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/emergencycalldata.subscriberinfo+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/emergencycalldata.veds+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/emma+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"emma\"]},\"application/emotionml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"emotionml\"]},\"application/encaprtp\":{\"source\":\"iana\"},\"application/epp+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/epub+zip\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"epub\"]},\"application/eshop\":{\"source\":\"iana\"},\"application/exi\":{\"source\":\"iana\",\"extensions\":[\"exi\"]},\"application/expect-ct-report+json\":{\"source\":\"iana\",\"compressible\":true},\"application/fastinfoset\":{\"source\":\"iana\"},\"application/fastsoap\":{\"source\":\"iana\"},\"application/fdt+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"fdt\"]},\"application/fhir+json\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/fhir+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/fido.trusted-apps+json\":{\"compressible\":true},\"application/fits\":{\"source\":\"iana\"},\"application/flexfec\":{\"source\":\"iana\"},\"application/font-sfnt\":{\"source\":\"iana\"},\"application/font-tdpfr\":{\"source\":\"iana\",\"extensions\":[\"pfr\"]},\"application/font-woff\":{\"source\":\"iana\",\"compressible\":false},\"application/framework-attributes+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/geo+json\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"geojson\"]},\"application/geo+json-seq\":{\"source\":\"iana\"},\"application/geopackage+sqlite3\":{\"source\":\"iana\"},\"application/geoxacml+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/gltf-buffer\":{\"source\":\"iana\"},\"application/gml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"gml\"]},\"application/gpx+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"gpx\"]},\"application/gxf\":{\"source\":\"apache\",\"extensions\":[\"gxf\"]},\"application/gzip\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"gz\"]},\"application/h224\":{\"source\":\"iana\"},\"application/held+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/hjson\":{\"extensions\":[\"hjson\"]},\"application/http\":{\"source\":\"iana\"},\"application/hyperstudio\":{\"source\":\"iana\",\"extensions\":[\"stk\"]},\"application/ibe-key-request+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/ibe-pkg-reply+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/ibe-pp-data\":{\"source\":\"iana\"},\"application/iges\":{\"source\":\"iana\"},\"application/im-iscomposing+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/index\":{\"source\":\"iana\"},\"application/index.cmd\":{\"source\":\"iana\"},\"application/index.obj\":{\"source\":\"iana\"},\"application/index.response\":{\"source\":\"iana\"},\"application/index.vnd\":{\"source\":\"iana\"},\"application/inkml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"ink\",\"inkml\"]},\"application/iotp\":{\"source\":\"iana\"},\"application/ipfix\":{\"source\":\"iana\",\"extensions\":[\"ipfix\"]},\"application/ipp\":{\"source\":\"iana\"},\"application/isup\":{\"source\":\"iana\"},\"application/its+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"its\"]},\"application/java-archive\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"jar\",\"war\",\"ear\"]},\"application/java-serialized-object\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"ser\"]},\"application/java-vm\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"class\"]},\"application/javascript\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true,\"extensions\":[\"js\",\"mjs\"]},\"application/jf2feed+json\":{\"source\":\"iana\",\"compressible\":true},\"application/jose\":{\"source\":\"iana\"},\"application/jose+json\":{\"source\":\"iana\",\"compressible\":true},\"application/jrd+json\":{\"source\":\"iana\",\"compressible\":true},\"application/json\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true,\"extensions\":[\"json\",\"map\"]},\"application/json-patch+json\":{\"source\":\"iana\",\"compressible\":true},\"application/json-seq\":{\"source\":\"iana\"},\"application/json5\":{\"extensions\":[\"json5\"]},\"application/jsonml+json\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"jsonml\"]},\"application/jwk+json\":{\"source\":\"iana\",\"compressible\":true},\"application/jwk-set+json\":{\"source\":\"iana\",\"compressible\":true},\"application/jwt\":{\"source\":\"iana\"},\"application/kpml-request+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/kpml-response+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/ld+json\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"jsonld\"]},\"application/lgr+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"lgr\"]},\"application/link-format\":{\"source\":\"iana\"},\"application/load-control+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/lost+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"lostxml\"]},\"application/lostsync+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/lpf+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/lxf\":{\"source\":\"iana\"},\"application/mac-binhex40\":{\"source\":\"iana\",\"extensions\":[\"hqx\"]},\"application/mac-compactpro\":{\"source\":\"apache\",\"extensions\":[\"cpt\"]},\"application/macwriteii\":{\"source\":\"iana\"},\"application/mads+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"mads\"]},\"application/manifest+json\":{\"charset\":\"UTF-8\",\"compressible\":true,\"extensions\":[\"webmanifest\"]},\"application/marc\":{\"source\":\"iana\",\"extensions\":[\"mrc\"]},\"application/marcxml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"mrcx\"]},\"application/mathematica\":{\"source\":\"iana\",\"extensions\":[\"ma\",\"nb\",\"mb\"]},\"application/mathml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"mathml\"]},\"application/mathml-content+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mathml-presentation+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbms-associated-procedure-description+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbms-deregister+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbms-envelope+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbms-msk+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbms-msk-response+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbms-protection-description+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbms-reception-report+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbms-register+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbms-register-response+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbms-schedule+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbms-user-service-description+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mbox\":{\"source\":\"iana\",\"extensions\":[\"mbox\"]},\"application/media-policy-dataset+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/media_control+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/mediaservercontrol+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"mscml\"]},\"application/merge-patch+json\":{\"source\":\"iana\",\"compressible\":true},\"application/metalink+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"metalink\"]},\"application/metalink4+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"meta4\"]},\"application/mets+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"mets\"]},\"application/mf4\":{\"source\":\"iana\"},\"application/mikey\":{\"source\":\"iana\"},\"application/mipc\":{\"source\":\"iana\"},\"application/mmt-aei+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"maei\"]},\"application/mmt-usd+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"musd\"]},\"application/mods+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"mods\"]},\"application/moss-keys\":{\"source\":\"iana\"},\"application/moss-signature\":{\"source\":\"iana\"},\"application/mosskey-data\":{\"source\":\"iana\"},\"application/mosskey-request\":{\"source\":\"iana\"},\"application/mp21\":{\"source\":\"iana\",\"extensions\":[\"m21\",\"mp21\"]},\"application/mp4\":{\"source\":\"iana\",\"extensions\":[\"mp4s\",\"m4p\"]},\"application/mpeg4-generic\":{\"source\":\"iana\"},\"application/mpeg4-iod\":{\"source\":\"iana\"},\"application/mpeg4-iod-xmt\":{\"source\":\"iana\"},\"application/mrb-consumer+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xdf\"]},\"application/mrb-publish+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xdf\"]},\"application/msc-ivr+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/msc-mixer+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/msword\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"doc\",\"dot\"]},\"application/mud+json\":{\"source\":\"iana\",\"compressible\":true},\"application/multipart-core\":{\"source\":\"iana\"},\"application/mxf\":{\"source\":\"iana\",\"extensions\":[\"mxf\"]},\"application/n-quads\":{\"source\":\"iana\",\"extensions\":[\"nq\"]},\"application/n-triples\":{\"source\":\"iana\",\"extensions\":[\"nt\"]},\"application/nasdata\":{\"source\":\"iana\"},\"application/news-checkgroups\":{\"source\":\"iana\",\"charset\":\"US-ASCII\"},\"application/news-groupinfo\":{\"source\":\"iana\",\"charset\":\"US-ASCII\"},\"application/news-transmission\":{\"source\":\"iana\"},\"application/nlsml+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/node\":{\"source\":\"iana\",\"extensions\":[\"cjs\"]},\"application/nss\":{\"source\":\"iana\"},\"application/ocsp-request\":{\"source\":\"iana\"},\"application/ocsp-response\":{\"source\":\"iana\"},\"application/octet-stream\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"bin\",\"dms\",\"lrf\",\"mar\",\"so\",\"dist\",\"distz\",\"pkg\",\"bpk\",\"dump\",\"elc\",\"deploy\",\"exe\",\"dll\",\"deb\",\"dmg\",\"iso\",\"img\",\"msi\",\"msp\",\"msm\",\"buffer\"]},\"application/oda\":{\"source\":\"iana\",\"extensions\":[\"oda\"]},\"application/odm+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/odx\":{\"source\":\"iana\"},\"application/oebps-package+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"opf\"]},\"application/ogg\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"ogx\"]},\"application/omdoc+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"omdoc\"]},\"application/onenote\":{\"source\":\"apache\",\"extensions\":[\"onetoc\",\"onetoc2\",\"onetmp\",\"onepkg\"]},\"application/oscore\":{\"source\":\"iana\"},\"application/oxps\":{\"source\":\"iana\",\"extensions\":[\"oxps\"]},\"application/p2p-overlay+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"relo\"]},\"application/parityfec\":{\"source\":\"iana\"},\"application/passport\":{\"source\":\"iana\"},\"application/patch-ops-error+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xer\"]},\"application/pdf\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"pdf\"]},\"application/pdx\":{\"source\":\"iana\"},\"application/pem-certificate-chain\":{\"source\":\"iana\"},\"application/pgp-encrypted\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"pgp\"]},\"application/pgp-keys\":{\"source\":\"iana\"},\"application/pgp-signature\":{\"source\":\"iana\",\"extensions\":[\"asc\",\"sig\"]},\"application/pics-rules\":{\"source\":\"apache\",\"extensions\":[\"prf\"]},\"application/pidf+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/pidf-diff+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/pkcs10\":{\"source\":\"iana\",\"extensions\":[\"p10\"]},\"application/pkcs12\":{\"source\":\"iana\"},\"application/pkcs7-mime\":{\"source\":\"iana\",\"extensions\":[\"p7m\",\"p7c\"]},\"application/pkcs7-signature\":{\"source\":\"iana\",\"extensions\":[\"p7s\"]},\"application/pkcs8\":{\"source\":\"iana\",\"extensions\":[\"p8\"]},\"application/pkcs8-encrypted\":{\"source\":\"iana\"},\"application/pkix-attr-cert\":{\"source\":\"iana\",\"extensions\":[\"ac\"]},\"application/pkix-cert\":{\"source\":\"iana\",\"extensions\":[\"cer\"]},\"application/pkix-crl\":{\"source\":\"iana\",\"extensions\":[\"crl\"]},\"application/pkix-pkipath\":{\"source\":\"iana\",\"extensions\":[\"pkipath\"]},\"application/pkixcmp\":{\"source\":\"iana\",\"extensions\":[\"pki\"]},\"application/pls+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"pls\"]},\"application/poc-settings+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/postscript\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"ai\",\"eps\",\"ps\"]},\"application/ppsp-tracker+json\":{\"source\":\"iana\",\"compressible\":true},\"application/problem+json\":{\"source\":\"iana\",\"compressible\":true},\"application/problem+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/provenance+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"provx\"]},\"application/prs.alvestrand.titrax-sheet\":{\"source\":\"iana\"},\"application/prs.cww\":{\"source\":\"iana\",\"extensions\":[\"cww\"]},\"application/prs.hpub+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/prs.nprend\":{\"source\":\"iana\"},\"application/prs.plucker\":{\"source\":\"iana\"},\"application/prs.rdf-xml-crypt\":{\"source\":\"iana\"},\"application/prs.xsf+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/pskc+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"pskcxml\"]},\"application/pvd+json\":{\"source\":\"iana\",\"compressible\":true},\"application/qsig\":{\"source\":\"iana\"},\"application/raml+yaml\":{\"compressible\":true,\"extensions\":[\"raml\"]},\"application/raptorfec\":{\"source\":\"iana\"},\"application/rdap+json\":{\"source\":\"iana\",\"compressible\":true},\"application/rdf+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rdf\",\"owl\"]},\"application/reginfo+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rif\"]},\"application/relax-ng-compact-syntax\":{\"source\":\"iana\",\"extensions\":[\"rnc\"]},\"application/remote-printing\":{\"source\":\"iana\"},\"application/reputon+json\":{\"source\":\"iana\",\"compressible\":true},\"application/resource-lists+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rl\"]},\"application/resource-lists-diff+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rld\"]},\"application/rfc+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/riscos\":{\"source\":\"iana\"},\"application/rlmi+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/rls-services+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rs\"]},\"application/route-apd+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rapd\"]},\"application/route-s-tsid+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"sls\"]},\"application/route-usd+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rusd\"]},\"application/rpki-ghostbusters\":{\"source\":\"iana\",\"extensions\":[\"gbr\"]},\"application/rpki-manifest\":{\"source\":\"iana\",\"extensions\":[\"mft\"]},\"application/rpki-publication\":{\"source\":\"iana\"},\"application/rpki-roa\":{\"source\":\"iana\",\"extensions\":[\"roa\"]},\"application/rpki-updown\":{\"source\":\"iana\"},\"application/rsd+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"rsd\"]},\"application/rss+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"rss\"]},\"application/rtf\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rtf\"]},\"application/rtploopback\":{\"source\":\"iana\"},\"application/rtx\":{\"source\":\"iana\"},\"application/samlassertion+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/samlmetadata+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/sbe\":{\"source\":\"iana\"},\"application/sbml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"sbml\"]},\"application/scaip+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/scim+json\":{\"source\":\"iana\",\"compressible\":true},\"application/scvp-cv-request\":{\"source\":\"iana\",\"extensions\":[\"scq\"]},\"application/scvp-cv-response\":{\"source\":\"iana\",\"extensions\":[\"scs\"]},\"application/scvp-vp-request\":{\"source\":\"iana\",\"extensions\":[\"spq\"]},\"application/scvp-vp-response\":{\"source\":\"iana\",\"extensions\":[\"spp\"]},\"application/sdp\":{\"source\":\"iana\",\"extensions\":[\"sdp\"]},\"application/secevent+jwt\":{\"source\":\"iana\"},\"application/senml+cbor\":{\"source\":\"iana\"},\"application/senml+json\":{\"source\":\"iana\",\"compressible\":true},\"application/senml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"senmlx\"]},\"application/senml-etch+cbor\":{\"source\":\"iana\"},\"application/senml-etch+json\":{\"source\":\"iana\",\"compressible\":true},\"application/senml-exi\":{\"source\":\"iana\"},\"application/sensml+cbor\":{\"source\":\"iana\"},\"application/sensml+json\":{\"source\":\"iana\",\"compressible\":true},\"application/sensml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"sensmlx\"]},\"application/sensml-exi\":{\"source\":\"iana\"},\"application/sep+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/sep-exi\":{\"source\":\"iana\"},\"application/session-info\":{\"source\":\"iana\"},\"application/set-payment\":{\"source\":\"iana\"},\"application/set-payment-initiation\":{\"source\":\"iana\",\"extensions\":[\"setpay\"]},\"application/set-registration\":{\"source\":\"iana\"},\"application/set-registration-initiation\":{\"source\":\"iana\",\"extensions\":[\"setreg\"]},\"application/sgml\":{\"source\":\"iana\"},\"application/sgml-open-catalog\":{\"source\":\"iana\"},\"application/shf+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"shf\"]},\"application/sieve\":{\"source\":\"iana\",\"extensions\":[\"siv\",\"sieve\"]},\"application/simple-filter+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/simple-message-summary\":{\"source\":\"iana\"},\"application/simplesymbolcontainer\":{\"source\":\"iana\"},\"application/sipc\":{\"source\":\"iana\"},\"application/slate\":{\"source\":\"iana\"},\"application/smil\":{\"source\":\"iana\"},\"application/smil+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"smi\",\"smil\"]},\"application/smpte336m\":{\"source\":\"iana\"},\"application/soap+fastinfoset\":{\"source\":\"iana\"},\"application/soap+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/sparql-query\":{\"source\":\"iana\",\"extensions\":[\"rq\"]},\"application/sparql-results+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"srx\"]},\"application/spirits-event+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/sql\":{\"source\":\"iana\"},\"application/srgs\":{\"source\":\"iana\",\"extensions\":[\"gram\"]},\"application/srgs+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"grxml\"]},\"application/sru+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"sru\"]},\"application/ssdl+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"ssdl\"]},\"application/ssml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"ssml\"]},\"application/stix+json\":{\"source\":\"iana\",\"compressible\":true},\"application/swid+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"swidtag\"]},\"application/tamp-apex-update\":{\"source\":\"iana\"},\"application/tamp-apex-update-confirm\":{\"source\":\"iana\"},\"application/tamp-community-update\":{\"source\":\"iana\"},\"application/tamp-community-update-confirm\":{\"source\":\"iana\"},\"application/tamp-error\":{\"source\":\"iana\"},\"application/tamp-sequence-adjust\":{\"source\":\"iana\"},\"application/tamp-sequence-adjust-confirm\":{\"source\":\"iana\"},\"application/tamp-status-query\":{\"source\":\"iana\"},\"application/tamp-status-response\":{\"source\":\"iana\"},\"application/tamp-update\":{\"source\":\"iana\"},\"application/tamp-update-confirm\":{\"source\":\"iana\"},\"application/tar\":{\"compressible\":true},\"application/taxii+json\":{\"source\":\"iana\",\"compressible\":true},\"application/td+json\":{\"source\":\"iana\",\"compressible\":true},\"application/tei+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"tei\",\"teicorpus\"]},\"application/tetra_isi\":{\"source\":\"iana\"},\"application/thraud+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"tfi\"]},\"application/timestamp-query\":{\"source\":\"iana\"},\"application/timestamp-reply\":{\"source\":\"iana\"},\"application/timestamped-data\":{\"source\":\"iana\",\"extensions\":[\"tsd\"]},\"application/tlsrpt+gzip\":{\"source\":\"iana\"},\"application/tlsrpt+json\":{\"source\":\"iana\",\"compressible\":true},\"application/tnauthlist\":{\"source\":\"iana\"},\"application/toml\":{\"compressible\":true,\"extensions\":[\"toml\"]},\"application/trickle-ice-sdpfrag\":{\"source\":\"iana\"},\"application/trig\":{\"source\":\"iana\"},\"application/ttml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"ttml\"]},\"application/tve-trigger\":{\"source\":\"iana\"},\"application/tzif\":{\"source\":\"iana\"},\"application/tzif-leap\":{\"source\":\"iana\"},\"application/ulpfec\":{\"source\":\"iana\"},\"application/urc-grpsheet+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/urc-ressheet+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rsheet\"]},\"application/urc-targetdesc+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/urc-uisocketdesc+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vcard+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vcard+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vemmi\":{\"source\":\"iana\"},\"application/vividence.scriptfile\":{\"source\":\"apache\"},\"application/vnd.1000minds.decision-model+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"1km\"]},\"application/vnd.3gpp-prose+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp-prose-pc3ch+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp-v2x-local-service-information\":{\"source\":\"iana\"},\"application/vnd.3gpp.access-transfer-events+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.bsf+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.gmop+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mc-signalling-ear\":{\"source\":\"iana\"},\"application/vnd.3gpp.mcdata-affiliation-command+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcdata-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcdata-payload\":{\"source\":\"iana\"},\"application/vnd.3gpp.mcdata-service-config+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcdata-signalling\":{\"source\":\"iana\"},\"application/vnd.3gpp.mcdata-ue-config+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcdata-user-profile+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcptt-affiliation-command+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcptt-floor-request+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcptt-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcptt-location-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcptt-mbms-usage-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcptt-service-config+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcptt-signed+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcptt-ue-config+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcptt-ue-init-config+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcptt-user-profile+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcvideo-affiliation-command+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcvideo-affiliation-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcvideo-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcvideo-location-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcvideo-mbms-usage-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcvideo-service-config+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcvideo-transmission-request+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcvideo-ue-config+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mcvideo-user-profile+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.mid-call+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.pic-bw-large\":{\"source\":\"iana\",\"extensions\":[\"plb\"]},\"application/vnd.3gpp.pic-bw-small\":{\"source\":\"iana\",\"extensions\":[\"psb\"]},\"application/vnd.3gpp.pic-bw-var\":{\"source\":\"iana\",\"extensions\":[\"pvb\"]},\"application/vnd.3gpp.sms\":{\"source\":\"iana\"},\"application/vnd.3gpp.sms+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.srvcc-ext+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.srvcc-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.state-and-event-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp.ussd+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp2.bcmcsinfo+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.3gpp2.sms\":{\"source\":\"iana\"},\"application/vnd.3gpp2.tcap\":{\"source\":\"iana\",\"extensions\":[\"tcap\"]},\"application/vnd.3lightssoftware.imagescal\":{\"source\":\"iana\"},\"application/vnd.3m.post-it-notes\":{\"source\":\"iana\",\"extensions\":[\"pwn\"]},\"application/vnd.accpac.simply.aso\":{\"source\":\"iana\",\"extensions\":[\"aso\"]},\"application/vnd.accpac.simply.imp\":{\"source\":\"iana\",\"extensions\":[\"imp\"]},\"application/vnd.acucobol\":{\"source\":\"iana\",\"extensions\":[\"acu\"]},\"application/vnd.acucorp\":{\"source\":\"iana\",\"extensions\":[\"atc\",\"acutc\"]},\"application/vnd.adobe.air-application-installer-package+zip\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"air\"]},\"application/vnd.adobe.flash.movie\":{\"source\":\"iana\"},\"application/vnd.adobe.formscentral.fcdt\":{\"source\":\"iana\",\"extensions\":[\"fcdt\"]},\"application/vnd.adobe.fxp\":{\"source\":\"iana\",\"extensions\":[\"fxp\",\"fxpl\"]},\"application/vnd.adobe.partial-upload\":{\"source\":\"iana\"},\"application/vnd.adobe.xdp+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xdp\"]},\"application/vnd.adobe.xfdf\":{\"source\":\"iana\",\"extensions\":[\"xfdf\"]},\"application/vnd.aether.imp\":{\"source\":\"iana\"},\"application/vnd.afpc.afplinedata\":{\"source\":\"iana\"},\"application/vnd.afpc.afplinedata-pagedef\":{\"source\":\"iana\"},\"application/vnd.afpc.foca-charset\":{\"source\":\"iana\"},\"application/vnd.afpc.foca-codedfont\":{\"source\":\"iana\"},\"application/vnd.afpc.foca-codepage\":{\"source\":\"iana\"},\"application/vnd.afpc.modca\":{\"source\":\"iana\"},\"application/vnd.afpc.modca-formdef\":{\"source\":\"iana\"},\"application/vnd.afpc.modca-mediummap\":{\"source\":\"iana\"},\"application/vnd.afpc.modca-objectcontainer\":{\"source\":\"iana\"},\"application/vnd.afpc.modca-overlay\":{\"source\":\"iana\"},\"application/vnd.afpc.modca-pagesegment\":{\"source\":\"iana\"},\"application/vnd.ah-barcode\":{\"source\":\"iana\"},\"application/vnd.ahead.space\":{\"source\":\"iana\",\"extensions\":[\"ahead\"]},\"application/vnd.airzip.filesecure.azf\":{\"source\":\"iana\",\"extensions\":[\"azf\"]},\"application/vnd.airzip.filesecure.azs\":{\"source\":\"iana\",\"extensions\":[\"azs\"]},\"application/vnd.amadeus+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.amazon.ebook\":{\"source\":\"apache\",\"extensions\":[\"azw\"]},\"application/vnd.amazon.mobi8-ebook\":{\"source\":\"iana\"},\"application/vnd.americandynamics.acc\":{\"source\":\"iana\",\"extensions\":[\"acc\"]},\"application/vnd.amiga.ami\":{\"source\":\"iana\",\"extensions\":[\"ami\"]},\"application/vnd.amundsen.maze+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.android.ota\":{\"source\":\"iana\"},\"application/vnd.android.package-archive\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"apk\"]},\"application/vnd.anki\":{\"source\":\"iana\"},\"application/vnd.anser-web-certificate-issue-initiation\":{\"source\":\"iana\",\"extensions\":[\"cii\"]},\"application/vnd.anser-web-funds-transfer-initiation\":{\"source\":\"apache\",\"extensions\":[\"fti\"]},\"application/vnd.antix.game-component\":{\"source\":\"iana\",\"extensions\":[\"atx\"]},\"application/vnd.apache.thrift.binary\":{\"source\":\"iana\"},\"application/vnd.apache.thrift.compact\":{\"source\":\"iana\"},\"application/vnd.apache.thrift.json\":{\"source\":\"iana\"},\"application/vnd.api+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.aplextor.warrp+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.apothekende.reservation+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.apple.installer+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"mpkg\"]},\"application/vnd.apple.keynote\":{\"source\":\"iana\",\"extensions\":[\"keynote\"]},\"application/vnd.apple.mpegurl\":{\"source\":\"iana\",\"extensions\":[\"m3u8\"]},\"application/vnd.apple.numbers\":{\"source\":\"iana\",\"extensions\":[\"numbers\"]},\"application/vnd.apple.pages\":{\"source\":\"iana\",\"extensions\":[\"pages\"]},\"application/vnd.apple.pkpass\":{\"compressible\":false,\"extensions\":[\"pkpass\"]},\"application/vnd.arastra.swi\":{\"source\":\"iana\"},\"application/vnd.aristanetworks.swi\":{\"source\":\"iana\",\"extensions\":[\"swi\"]},\"application/vnd.artisan+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.artsquare\":{\"source\":\"iana\"},\"application/vnd.astraea-software.iota\":{\"source\":\"iana\",\"extensions\":[\"iota\"]},\"application/vnd.audiograph\":{\"source\":\"iana\",\"extensions\":[\"aep\"]},\"application/vnd.autopackage\":{\"source\":\"iana\"},\"application/vnd.avalon+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.avistar+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.balsamiq.bmml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"bmml\"]},\"application/vnd.balsamiq.bmpr\":{\"source\":\"iana\"},\"application/vnd.banana-accounting\":{\"source\":\"iana\"},\"application/vnd.bbf.usp.error\":{\"source\":\"iana\"},\"application/vnd.bbf.usp.msg\":{\"source\":\"iana\"},\"application/vnd.bbf.usp.msg+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.bekitzur-stech+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.bint.med-content\":{\"source\":\"iana\"},\"application/vnd.biopax.rdf+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.blink-idb-value-wrapper\":{\"source\":\"iana\"},\"application/vnd.blueice.multipass\":{\"source\":\"iana\",\"extensions\":[\"mpm\"]},\"application/vnd.bluetooth.ep.oob\":{\"source\":\"iana\"},\"application/vnd.bluetooth.le.oob\":{\"source\":\"iana\"},\"application/vnd.bmi\":{\"source\":\"iana\",\"extensions\":[\"bmi\"]},\"application/vnd.bpf\":{\"source\":\"iana\"},\"application/vnd.bpf3\":{\"source\":\"iana\"},\"application/vnd.businessobjects\":{\"source\":\"iana\",\"extensions\":[\"rep\"]},\"application/vnd.byu.uapi+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.cab-jscript\":{\"source\":\"iana\"},\"application/vnd.canon-cpdl\":{\"source\":\"iana\"},\"application/vnd.canon-lips\":{\"source\":\"iana\"},\"application/vnd.capasystems-pg+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.cendio.thinlinc.clientconf\":{\"source\":\"iana\"},\"application/vnd.century-systems.tcp_stream\":{\"source\":\"iana\"},\"application/vnd.chemdraw+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"cdxml\"]},\"application/vnd.chess-pgn\":{\"source\":\"iana\"},\"application/vnd.chipnuts.karaoke-mmd\":{\"source\":\"iana\",\"extensions\":[\"mmd\"]},\"application/vnd.ciedi\":{\"source\":\"iana\"},\"application/vnd.cinderella\":{\"source\":\"iana\",\"extensions\":[\"cdy\"]},\"application/vnd.cirpack.isdn-ext\":{\"source\":\"iana\"},\"application/vnd.citationstyles.style+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"csl\"]},\"application/vnd.claymore\":{\"source\":\"iana\",\"extensions\":[\"cla\"]},\"application/vnd.cloanto.rp9\":{\"source\":\"iana\",\"extensions\":[\"rp9\"]},\"application/vnd.clonk.c4group\":{\"source\":\"iana\",\"extensions\":[\"c4g\",\"c4d\",\"c4f\",\"c4p\",\"c4u\"]},\"application/vnd.cluetrust.cartomobile-config\":{\"source\":\"iana\",\"extensions\":[\"c11amc\"]},\"application/vnd.cluetrust.cartomobile-config-pkg\":{\"source\":\"iana\",\"extensions\":[\"c11amz\"]},\"application/vnd.coffeescript\":{\"source\":\"iana\"},\"application/vnd.collabio.xodocuments.document\":{\"source\":\"iana\"},\"application/vnd.collabio.xodocuments.document-template\":{\"source\":\"iana\"},\"application/vnd.collabio.xodocuments.presentation\":{\"source\":\"iana\"},\"application/vnd.collabio.xodocuments.presentation-template\":{\"source\":\"iana\"},\"application/vnd.collabio.xodocuments.spreadsheet\":{\"source\":\"iana\"},\"application/vnd.collabio.xodocuments.spreadsheet-template\":{\"source\":\"iana\"},\"application/vnd.collection+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.collection.doc+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.collection.next+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.comicbook+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.comicbook-rar\":{\"source\":\"iana\"},\"application/vnd.commerce-battelle\":{\"source\":\"iana\"},\"application/vnd.commonspace\":{\"source\":\"iana\",\"extensions\":[\"csp\"]},\"application/vnd.contact.cmsg\":{\"source\":\"iana\",\"extensions\":[\"cdbcmsg\"]},\"application/vnd.coreos.ignition+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.cosmocaller\":{\"source\":\"iana\",\"extensions\":[\"cmc\"]},\"application/vnd.crick.clicker\":{\"source\":\"iana\",\"extensions\":[\"clkx\"]},\"application/vnd.crick.clicker.keyboard\":{\"source\":\"iana\",\"extensions\":[\"clkk\"]},\"application/vnd.crick.clicker.palette\":{\"source\":\"iana\",\"extensions\":[\"clkp\"]},\"application/vnd.crick.clicker.template\":{\"source\":\"iana\",\"extensions\":[\"clkt\"]},\"application/vnd.crick.clicker.wordbank\":{\"source\":\"iana\",\"extensions\":[\"clkw\"]},\"application/vnd.criticaltools.wbs+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"wbs\"]},\"application/vnd.cryptii.pipe+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.crypto-shade-file\":{\"source\":\"iana\"},\"application/vnd.ctc-posml\":{\"source\":\"iana\",\"extensions\":[\"pml\"]},\"application/vnd.ctct.ws+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.cups-pdf\":{\"source\":\"iana\"},\"application/vnd.cups-postscript\":{\"source\":\"iana\"},\"application/vnd.cups-ppd\":{\"source\":\"iana\",\"extensions\":[\"ppd\"]},\"application/vnd.cups-raster\":{\"source\":\"iana\"},\"application/vnd.cups-raw\":{\"source\":\"iana\"},\"application/vnd.curl\":{\"source\":\"iana\"},\"application/vnd.curl.car\":{\"source\":\"apache\",\"extensions\":[\"car\"]},\"application/vnd.curl.pcurl\":{\"source\":\"apache\",\"extensions\":[\"pcurl\"]},\"application/vnd.cyan.dean.root+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.cybank\":{\"source\":\"iana\"},\"application/vnd.d2l.coursepackage1p0+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.dart\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"dart\"]},\"application/vnd.data-vision.rdz\":{\"source\":\"iana\",\"extensions\":[\"rdz\"]},\"application/vnd.datapackage+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dataresource+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dbf\":{\"source\":\"iana\"},\"application/vnd.debian.binary-package\":{\"source\":\"iana\"},\"application/vnd.dece.data\":{\"source\":\"iana\",\"extensions\":[\"uvf\",\"uvvf\",\"uvd\",\"uvvd\"]},\"application/vnd.dece.ttml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"uvt\",\"uvvt\"]},\"application/vnd.dece.unspecified\":{\"source\":\"iana\",\"extensions\":[\"uvx\",\"uvvx\"]},\"application/vnd.dece.zip\":{\"source\":\"iana\",\"extensions\":[\"uvz\",\"uvvz\"]},\"application/vnd.denovo.fcselayout-link\":{\"source\":\"iana\",\"extensions\":[\"fe_launch\"]},\"application/vnd.desmume.movie\":{\"source\":\"iana\"},\"application/vnd.dir-bi.plate-dl-nosuffix\":{\"source\":\"iana\"},\"application/vnd.dm.delegation+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dna\":{\"source\":\"iana\",\"extensions\":[\"dna\"]},\"application/vnd.document+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dolby.mlp\":{\"source\":\"apache\",\"extensions\":[\"mlp\"]},\"application/vnd.dolby.mobile.1\":{\"source\":\"iana\"},\"application/vnd.dolby.mobile.2\":{\"source\":\"iana\"},\"application/vnd.doremir.scorecloud-binary-document\":{\"source\":\"iana\"},\"application/vnd.dpgraph\":{\"source\":\"iana\",\"extensions\":[\"dpg\"]},\"application/vnd.dreamfactory\":{\"source\":\"iana\",\"extensions\":[\"dfac\"]},\"application/vnd.drive+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.ds-keypoint\":{\"source\":\"apache\",\"extensions\":[\"kpxx\"]},\"application/vnd.dtg.local\":{\"source\":\"iana\"},\"application/vnd.dtg.local.flash\":{\"source\":\"iana\"},\"application/vnd.dtg.local.html\":{\"source\":\"iana\"},\"application/vnd.dvb.ait\":{\"source\":\"iana\",\"extensions\":[\"ait\"]},\"application/vnd.dvb.dvbisl+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dvb.dvbj\":{\"source\":\"iana\"},\"application/vnd.dvb.esgcontainer\":{\"source\":\"iana\"},\"application/vnd.dvb.ipdcdftnotifaccess\":{\"source\":\"iana\"},\"application/vnd.dvb.ipdcesgaccess\":{\"source\":\"iana\"},\"application/vnd.dvb.ipdcesgaccess2\":{\"source\":\"iana\"},\"application/vnd.dvb.ipdcesgpdd\":{\"source\":\"iana\"},\"application/vnd.dvb.ipdcroaming\":{\"source\":\"iana\"},\"application/vnd.dvb.iptv.alfec-base\":{\"source\":\"iana\"},\"application/vnd.dvb.iptv.alfec-enhancement\":{\"source\":\"iana\"},\"application/vnd.dvb.notif-aggregate-root+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dvb.notif-container+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dvb.notif-generic+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dvb.notif-ia-msglist+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dvb.notif-ia-registration-request+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dvb.notif-ia-registration-response+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dvb.notif-init+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.dvb.pfr\":{\"source\":\"iana\"},\"application/vnd.dvb.service\":{\"source\":\"iana\",\"extensions\":[\"svc\"]},\"application/vnd.dxr\":{\"source\":\"iana\"},\"application/vnd.dynageo\":{\"source\":\"iana\",\"extensions\":[\"geo\"]},\"application/vnd.dzr\":{\"source\":\"iana\"},\"application/vnd.easykaraoke.cdgdownload\":{\"source\":\"iana\"},\"application/vnd.ecdis-update\":{\"source\":\"iana\"},\"application/vnd.ecip.rlp\":{\"source\":\"iana\"},\"application/vnd.ecowin.chart\":{\"source\":\"iana\",\"extensions\":[\"mag\"]},\"application/vnd.ecowin.filerequest\":{\"source\":\"iana\"},\"application/vnd.ecowin.fileupdate\":{\"source\":\"iana\"},\"application/vnd.ecowin.series\":{\"source\":\"iana\"},\"application/vnd.ecowin.seriesrequest\":{\"source\":\"iana\"},\"application/vnd.ecowin.seriesupdate\":{\"source\":\"iana\"},\"application/vnd.efi.img\":{\"source\":\"iana\"},\"application/vnd.efi.iso\":{\"source\":\"iana\"},\"application/vnd.emclient.accessrequest+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.enliven\":{\"source\":\"iana\",\"extensions\":[\"nml\"]},\"application/vnd.enphase.envoy\":{\"source\":\"iana\"},\"application/vnd.eprints.data+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.epson.esf\":{\"source\":\"iana\",\"extensions\":[\"esf\"]},\"application/vnd.epson.msf\":{\"source\":\"iana\",\"extensions\":[\"msf\"]},\"application/vnd.epson.quickanime\":{\"source\":\"iana\",\"extensions\":[\"qam\"]},\"application/vnd.epson.salt\":{\"source\":\"iana\",\"extensions\":[\"slt\"]},\"application/vnd.epson.ssf\":{\"source\":\"iana\",\"extensions\":[\"ssf\"]},\"application/vnd.ericsson.quickcall\":{\"source\":\"iana\"},\"application/vnd.espass-espass+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.eszigno3+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"es3\",\"et3\"]},\"application/vnd.etsi.aoc+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.asic-e+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.etsi.asic-s+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.etsi.cug+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.iptvcommand+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.iptvdiscovery+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.iptvprofile+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.iptvsad-bc+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.iptvsad-cod+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.iptvsad-npvr+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.iptvservice+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.iptvsync+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.iptvueprofile+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.mcid+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.mheg5\":{\"source\":\"iana\"},\"application/vnd.etsi.overload-control-policy-dataset+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.pstn+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.sci+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.simservs+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.timestamp-token\":{\"source\":\"iana\"},\"application/vnd.etsi.tsl+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.etsi.tsl.der\":{\"source\":\"iana\"},\"application/vnd.eudora.data\":{\"source\":\"iana\"},\"application/vnd.evolv.ecig.profile\":{\"source\":\"iana\"},\"application/vnd.evolv.ecig.settings\":{\"source\":\"iana\"},\"application/vnd.evolv.ecig.theme\":{\"source\":\"iana\"},\"application/vnd.exstream-empower+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.exstream-package\":{\"source\":\"iana\"},\"application/vnd.ezpix-album\":{\"source\":\"iana\",\"extensions\":[\"ez2\"]},\"application/vnd.ezpix-package\":{\"source\":\"iana\",\"extensions\":[\"ez3\"]},\"application/vnd.f-secure.mobile\":{\"source\":\"iana\"},\"application/vnd.fastcopy-disk-image\":{\"source\":\"iana\"},\"application/vnd.fdf\":{\"source\":\"iana\",\"extensions\":[\"fdf\"]},\"application/vnd.fdsn.mseed\":{\"source\":\"iana\",\"extensions\":[\"mseed\"]},\"application/vnd.fdsn.seed\":{\"source\":\"iana\",\"extensions\":[\"seed\",\"dataless\"]},\"application/vnd.ffsns\":{\"source\":\"iana\"},\"application/vnd.ficlab.flb+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.filmit.zfc\":{\"source\":\"iana\"},\"application/vnd.fints\":{\"source\":\"iana\"},\"application/vnd.firemonkeys.cloudcell\":{\"source\":\"iana\"},\"application/vnd.flographit\":{\"source\":\"iana\",\"extensions\":[\"gph\"]},\"application/vnd.fluxtime.clip\":{\"source\":\"iana\",\"extensions\":[\"ftc\"]},\"application/vnd.font-fontforge-sfd\":{\"source\":\"iana\"},\"application/vnd.framemaker\":{\"source\":\"iana\",\"extensions\":[\"fm\",\"frame\",\"maker\",\"book\"]},\"application/vnd.frogans.fnc\":{\"source\":\"iana\",\"extensions\":[\"fnc\"]},\"application/vnd.frogans.ltf\":{\"source\":\"iana\",\"extensions\":[\"ltf\"]},\"application/vnd.fsc.weblaunch\":{\"source\":\"iana\",\"extensions\":[\"fsc\"]},\"application/vnd.fujitsu.oasys\":{\"source\":\"iana\",\"extensions\":[\"oas\"]},\"application/vnd.fujitsu.oasys2\":{\"source\":\"iana\",\"extensions\":[\"oa2\"]},\"application/vnd.fujitsu.oasys3\":{\"source\":\"iana\",\"extensions\":[\"oa3\"]},\"application/vnd.fujitsu.oasysgp\":{\"source\":\"iana\",\"extensions\":[\"fg5\"]},\"application/vnd.fujitsu.oasysprs\":{\"source\":\"iana\",\"extensions\":[\"bh2\"]},\"application/vnd.fujixerox.art-ex\":{\"source\":\"iana\"},\"application/vnd.fujixerox.art4\":{\"source\":\"iana\"},\"application/vnd.fujixerox.ddd\":{\"source\":\"iana\",\"extensions\":[\"ddd\"]},\"application/vnd.fujixerox.docuworks\":{\"source\":\"iana\",\"extensions\":[\"xdw\"]},\"application/vnd.fujixerox.docuworks.binder\":{\"source\":\"iana\",\"extensions\":[\"xbd\"]},\"application/vnd.fujixerox.docuworks.container\":{\"source\":\"iana\"},\"application/vnd.fujixerox.hbpl\":{\"source\":\"iana\"},\"application/vnd.fut-misnet\":{\"source\":\"iana\"},\"application/vnd.futoin+cbor\":{\"source\":\"iana\"},\"application/vnd.futoin+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.fuzzysheet\":{\"source\":\"iana\",\"extensions\":[\"fzs\"]},\"application/vnd.genomatix.tuxedo\":{\"source\":\"iana\",\"extensions\":[\"txd\"]},\"application/vnd.gentics.grd+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.geo+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.geocube+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.geogebra.file\":{\"source\":\"iana\",\"extensions\":[\"ggb\"]},\"application/vnd.geogebra.tool\":{\"source\":\"iana\",\"extensions\":[\"ggt\"]},\"application/vnd.geometry-explorer\":{\"source\":\"iana\",\"extensions\":[\"gex\",\"gre\"]},\"application/vnd.geonext\":{\"source\":\"iana\",\"extensions\":[\"gxt\"]},\"application/vnd.geoplan\":{\"source\":\"iana\",\"extensions\":[\"g2w\"]},\"application/vnd.geospace\":{\"source\":\"iana\",\"extensions\":[\"g3w\"]},\"application/vnd.gerber\":{\"source\":\"iana\"},\"application/vnd.globalplatform.card-content-mgt\":{\"source\":\"iana\"},\"application/vnd.globalplatform.card-content-mgt-response\":{\"source\":\"iana\"},\"application/vnd.gmx\":{\"source\":\"iana\",\"extensions\":[\"gmx\"]},\"application/vnd.google-apps.document\":{\"compressible\":false,\"extensions\":[\"gdoc\"]},\"application/vnd.google-apps.presentation\":{\"compressible\":false,\"extensions\":[\"gslides\"]},\"application/vnd.google-apps.spreadsheet\":{\"compressible\":false,\"extensions\":[\"gsheet\"]},\"application/vnd.google-earth.kml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"kml\"]},\"application/vnd.google-earth.kmz\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"kmz\"]},\"application/vnd.gov.sk.e-form+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.gov.sk.e-form+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.gov.sk.xmldatacontainer+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.grafeq\":{\"source\":\"iana\",\"extensions\":[\"gqf\",\"gqs\"]},\"application/vnd.gridmp\":{\"source\":\"iana\"},\"application/vnd.groove-account\":{\"source\":\"iana\",\"extensions\":[\"gac\"]},\"application/vnd.groove-help\":{\"source\":\"iana\",\"extensions\":[\"ghf\"]},\"application/vnd.groove-identity-message\":{\"source\":\"iana\",\"extensions\":[\"gim\"]},\"application/vnd.groove-injector\":{\"source\":\"iana\",\"extensions\":[\"grv\"]},\"application/vnd.groove-tool-message\":{\"source\":\"iana\",\"extensions\":[\"gtm\"]},\"application/vnd.groove-tool-template\":{\"source\":\"iana\",\"extensions\":[\"tpl\"]},\"application/vnd.groove-vcard\":{\"source\":\"iana\",\"extensions\":[\"vcg\"]},\"application/vnd.hal+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.hal+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"hal\"]},\"application/vnd.handheld-entertainment+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"zmm\"]},\"application/vnd.hbci\":{\"source\":\"iana\",\"extensions\":[\"hbci\"]},\"application/vnd.hc+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.hcl-bireports\":{\"source\":\"iana\"},\"application/vnd.hdt\":{\"source\":\"iana\"},\"application/vnd.heroku+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.hhe.lesson-player\":{\"source\":\"iana\",\"extensions\":[\"les\"]},\"application/vnd.hp-hpgl\":{\"source\":\"iana\",\"extensions\":[\"hpgl\"]},\"application/vnd.hp-hpid\":{\"source\":\"iana\",\"extensions\":[\"hpid\"]},\"application/vnd.hp-hps\":{\"source\":\"iana\",\"extensions\":[\"hps\"]},\"application/vnd.hp-jlyt\":{\"source\":\"iana\",\"extensions\":[\"jlt\"]},\"application/vnd.hp-pcl\":{\"source\":\"iana\",\"extensions\":[\"pcl\"]},\"application/vnd.hp-pclxl\":{\"source\":\"iana\",\"extensions\":[\"pclxl\"]},\"application/vnd.httphone\":{\"source\":\"iana\"},\"application/vnd.hydrostatix.sof-data\":{\"source\":\"iana\",\"extensions\":[\"sfd-hdstx\"]},\"application/vnd.hyper+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.hyper-item+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.hyperdrive+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.hzn-3d-crossword\":{\"source\":\"iana\"},\"application/vnd.ibm.afplinedata\":{\"source\":\"iana\"},\"application/vnd.ibm.electronic-media\":{\"source\":\"iana\"},\"application/vnd.ibm.minipay\":{\"source\":\"iana\",\"extensions\":[\"mpy\"]},\"application/vnd.ibm.modcap\":{\"source\":\"iana\",\"extensions\":[\"afp\",\"listafp\",\"list3820\"]},\"application/vnd.ibm.rights-management\":{\"source\":\"iana\",\"extensions\":[\"irm\"]},\"application/vnd.ibm.secure-container\":{\"source\":\"iana\",\"extensions\":[\"sc\"]},\"application/vnd.iccprofile\":{\"source\":\"iana\",\"extensions\":[\"icc\",\"icm\"]},\"application/vnd.ieee.1905\":{\"source\":\"iana\"},\"application/vnd.igloader\":{\"source\":\"iana\",\"extensions\":[\"igl\"]},\"application/vnd.imagemeter.folder+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.imagemeter.image+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.immervision-ivp\":{\"source\":\"iana\",\"extensions\":[\"ivp\"]},\"application/vnd.immervision-ivu\":{\"source\":\"iana\",\"extensions\":[\"ivu\"]},\"application/vnd.ims.imsccv1p1\":{\"source\":\"iana\"},\"application/vnd.ims.imsccv1p2\":{\"source\":\"iana\"},\"application/vnd.ims.imsccv1p3\":{\"source\":\"iana\"},\"application/vnd.ims.lis.v2.result+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.ims.lti.v2.toolconsumerprofile+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.ims.lti.v2.toolproxy+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.ims.lti.v2.toolproxy.id+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.ims.lti.v2.toolsettings+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.ims.lti.v2.toolsettings.simple+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.informedcontrol.rms+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.informix-visionary\":{\"source\":\"iana\"},\"application/vnd.infotech.project\":{\"source\":\"iana\"},\"application/vnd.infotech.project+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.innopath.wamp.notification\":{\"source\":\"iana\"},\"application/vnd.insors.igm\":{\"source\":\"iana\",\"extensions\":[\"igm\"]},\"application/vnd.intercon.formnet\":{\"source\":\"iana\",\"extensions\":[\"xpw\",\"xpx\"]},\"application/vnd.intergeo\":{\"source\":\"iana\",\"extensions\":[\"i2g\"]},\"application/vnd.intertrust.digibox\":{\"source\":\"iana\"},\"application/vnd.intertrust.nncp\":{\"source\":\"iana\"},\"application/vnd.intu.qbo\":{\"source\":\"iana\",\"extensions\":[\"qbo\"]},\"application/vnd.intu.qfx\":{\"source\":\"iana\",\"extensions\":[\"qfx\"]},\"application/vnd.iptc.g2.catalogitem+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.iptc.g2.conceptitem+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.iptc.g2.knowledgeitem+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.iptc.g2.newsitem+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.iptc.g2.newsmessage+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.iptc.g2.packageitem+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.iptc.g2.planningitem+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.ipunplugged.rcprofile\":{\"source\":\"iana\",\"extensions\":[\"rcprofile\"]},\"application/vnd.irepository.package+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"irp\"]},\"application/vnd.is-xpr\":{\"source\":\"iana\",\"extensions\":[\"xpr\"]},\"application/vnd.isac.fcs\":{\"source\":\"iana\",\"extensions\":[\"fcs\"]},\"application/vnd.iso11783-10+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.jam\":{\"source\":\"iana\",\"extensions\":[\"jam\"]},\"application/vnd.japannet-directory-service\":{\"source\":\"iana\"},\"application/vnd.japannet-jpnstore-wakeup\":{\"source\":\"iana\"},\"application/vnd.japannet-payment-wakeup\":{\"source\":\"iana\"},\"application/vnd.japannet-registration\":{\"source\":\"iana\"},\"application/vnd.japannet-registration-wakeup\":{\"source\":\"iana\"},\"application/vnd.japannet-setstore-wakeup\":{\"source\":\"iana\"},\"application/vnd.japannet-verification\":{\"source\":\"iana\"},\"application/vnd.japannet-verification-wakeup\":{\"source\":\"iana\"},\"application/vnd.jcp.javame.midlet-rms\":{\"source\":\"iana\",\"extensions\":[\"rms\"]},\"application/vnd.jisp\":{\"source\":\"iana\",\"extensions\":[\"jisp\"]},\"application/vnd.joost.joda-archive\":{\"source\":\"iana\",\"extensions\":[\"joda\"]},\"application/vnd.jsk.isdn-ngn\":{\"source\":\"iana\"},\"application/vnd.kahootz\":{\"source\":\"iana\",\"extensions\":[\"ktz\",\"ktr\"]},\"application/vnd.kde.karbon\":{\"source\":\"iana\",\"extensions\":[\"karbon\"]},\"application/vnd.kde.kchart\":{\"source\":\"iana\",\"extensions\":[\"chrt\"]},\"application/vnd.kde.kformula\":{\"source\":\"iana\",\"extensions\":[\"kfo\"]},\"application/vnd.kde.kivio\":{\"source\":\"iana\",\"extensions\":[\"flw\"]},\"application/vnd.kde.kontour\":{\"source\":\"iana\",\"extensions\":[\"kon\"]},\"application/vnd.kde.kpresenter\":{\"source\":\"iana\",\"extensions\":[\"kpr\",\"kpt\"]},\"application/vnd.kde.kspread\":{\"source\":\"iana\",\"extensions\":[\"ksp\"]},\"application/vnd.kde.kword\":{\"source\":\"iana\",\"extensions\":[\"kwd\",\"kwt\"]},\"application/vnd.kenameaapp\":{\"source\":\"iana\",\"extensions\":[\"htke\"]},\"application/vnd.kidspiration\":{\"source\":\"iana\",\"extensions\":[\"kia\"]},\"application/vnd.kinar\":{\"source\":\"iana\",\"extensions\":[\"kne\",\"knp\"]},\"application/vnd.koan\":{\"source\":\"iana\",\"extensions\":[\"skp\",\"skd\",\"skt\",\"skm\"]},\"application/vnd.kodak-descriptor\":{\"source\":\"iana\",\"extensions\":[\"sse\"]},\"application/vnd.las\":{\"source\":\"iana\"},\"application/vnd.las.las+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.las.las+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"lasxml\"]},\"application/vnd.laszip\":{\"source\":\"iana\"},\"application/vnd.leap+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.liberty-request+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.llamagraphics.life-balance.desktop\":{\"source\":\"iana\",\"extensions\":[\"lbd\"]},\"application/vnd.llamagraphics.life-balance.exchange+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"lbe\"]},\"application/vnd.logipipe.circuit+zip\":{\"source\":\"iana\",\"compressible\":false},\"application/vnd.loom\":{\"source\":\"iana\"},\"application/vnd.lotus-1-2-3\":{\"source\":\"iana\",\"extensions\":[\"123\"]},\"application/vnd.lotus-approach\":{\"source\":\"iana\",\"extensions\":[\"apr\"]},\"application/vnd.lotus-freelance\":{\"source\":\"iana\",\"extensions\":[\"pre\"]},\"application/vnd.lotus-notes\":{\"source\":\"iana\",\"extensions\":[\"nsf\"]},\"application/vnd.lotus-organizer\":{\"source\":\"iana\",\"extensions\":[\"org\"]},\"application/vnd.lotus-screencam\":{\"source\":\"iana\",\"extensions\":[\"scm\"]},\"application/vnd.lotus-wordpro\":{\"source\":\"iana\",\"extensions\":[\"lwp\"]},\"application/vnd.macports.portpkg\":{\"source\":\"iana\",\"extensions\":[\"portpkg\"]},\"application/vnd.mapbox-vector-tile\":{\"source\":\"iana\"},\"application/vnd.marlin.drm.actiontoken+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.marlin.drm.conftoken+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.marlin.drm.license+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.marlin.drm.mdcf\":{\"source\":\"iana\"},\"application/vnd.mason+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.maxmind.maxmind-db\":{\"source\":\"iana\"},\"application/vnd.mcd\":{\"source\":\"iana\",\"extensions\":[\"mcd\"]},\"application/vnd.medcalcdata\":{\"source\":\"iana\",\"extensions\":[\"mc1\"]},\"application/vnd.mediastation.cdkey\":{\"source\":\"iana\",\"extensions\":[\"cdkey\"]},\"application/vnd.meridian-slingshot\":{\"source\":\"iana\"},\"application/vnd.mfer\":{\"source\":\"iana\",\"extensions\":[\"mwf\"]},\"application/vnd.mfmp\":{\"source\":\"iana\",\"extensions\":[\"mfm\"]},\"application/vnd.micro+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.micrografx.flo\":{\"source\":\"iana\",\"extensions\":[\"flo\"]},\"application/vnd.micrografx.igx\":{\"source\":\"iana\",\"extensions\":[\"igx\"]},\"application/vnd.microsoft.portable-executable\":{\"source\":\"iana\"},\"application/vnd.microsoft.windows.thumbnail-cache\":{\"source\":\"iana\"},\"application/vnd.miele+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.mif\":{\"source\":\"iana\",\"extensions\":[\"mif\"]},\"application/vnd.minisoft-hp3000-save\":{\"source\":\"iana\"},\"application/vnd.mitsubishi.misty-guard.trustweb\":{\"source\":\"iana\"},\"application/vnd.mobius.daf\":{\"source\":\"iana\",\"extensions\":[\"daf\"]},\"application/vnd.mobius.dis\":{\"source\":\"iana\",\"extensions\":[\"dis\"]},\"application/vnd.mobius.mbk\":{\"source\":\"iana\",\"extensions\":[\"mbk\"]},\"application/vnd.mobius.mqy\":{\"source\":\"iana\",\"extensions\":[\"mqy\"]},\"application/vnd.mobius.msl\":{\"source\":\"iana\",\"extensions\":[\"msl\"]},\"application/vnd.mobius.plc\":{\"source\":\"iana\",\"extensions\":[\"plc\"]},\"application/vnd.mobius.txf\":{\"source\":\"iana\",\"extensions\":[\"txf\"]},\"application/vnd.mophun.application\":{\"source\":\"iana\",\"extensions\":[\"mpn\"]},\"application/vnd.mophun.certificate\":{\"source\":\"iana\",\"extensions\":[\"mpc\"]},\"application/vnd.motorola.flexsuite\":{\"source\":\"iana\"},\"application/vnd.motorola.flexsuite.adsi\":{\"source\":\"iana\"},\"application/vnd.motorola.flexsuite.fis\":{\"source\":\"iana\"},\"application/vnd.motorola.flexsuite.gotap\":{\"source\":\"iana\"},\"application/vnd.motorola.flexsuite.kmr\":{\"source\":\"iana\"},\"application/vnd.motorola.flexsuite.ttc\":{\"source\":\"iana\"},\"application/vnd.motorola.flexsuite.wem\":{\"source\":\"iana\"},\"application/vnd.motorola.iprm\":{\"source\":\"iana\"},\"application/vnd.mozilla.xul+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xul\"]},\"application/vnd.ms-3mfdocument\":{\"source\":\"iana\"},\"application/vnd.ms-artgalry\":{\"source\":\"iana\",\"extensions\":[\"cil\"]},\"application/vnd.ms-asf\":{\"source\":\"iana\"},\"application/vnd.ms-cab-compressed\":{\"source\":\"iana\",\"extensions\":[\"cab\"]},\"application/vnd.ms-color.iccprofile\":{\"source\":\"apache\"},\"application/vnd.ms-excel\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"xls\",\"xlm\",\"xla\",\"xlc\",\"xlt\",\"xlw\"]},\"application/vnd.ms-excel.addin.macroenabled.12\":{\"source\":\"iana\",\"extensions\":[\"xlam\"]},\"application/vnd.ms-excel.sheet.binary.macroenabled.12\":{\"source\":\"iana\",\"extensions\":[\"xlsb\"]},\"application/vnd.ms-excel.sheet.macroenabled.12\":{\"source\":\"iana\",\"extensions\":[\"xlsm\"]},\"application/vnd.ms-excel.template.macroenabled.12\":{\"source\":\"iana\",\"extensions\":[\"xltm\"]},\"application/vnd.ms-fontobject\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"eot\"]},\"application/vnd.ms-htmlhelp\":{\"source\":\"iana\",\"extensions\":[\"chm\"]},\"application/vnd.ms-ims\":{\"source\":\"iana\",\"extensions\":[\"ims\"]},\"application/vnd.ms-lrm\":{\"source\":\"iana\",\"extensions\":[\"lrm\"]},\"application/vnd.ms-office.activex+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.ms-officetheme\":{\"source\":\"iana\",\"extensions\":[\"thmx\"]},\"application/vnd.ms-opentype\":{\"source\":\"apache\",\"compressible\":true},\"application/vnd.ms-outlook\":{\"compressible\":false,\"extensions\":[\"msg\"]},\"application/vnd.ms-package.obfuscated-opentype\":{\"source\":\"apache\"},\"application/vnd.ms-pki.seccat\":{\"source\":\"apache\",\"extensions\":[\"cat\"]},\"application/vnd.ms-pki.stl\":{\"source\":\"apache\",\"extensions\":[\"stl\"]},\"application/vnd.ms-playready.initiator+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.ms-powerpoint\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"ppt\",\"pps\",\"pot\"]},\"application/vnd.ms-powerpoint.addin.macroenabled.12\":{\"source\":\"iana\",\"extensions\":[\"ppam\"]},\"application/vnd.ms-powerpoint.presentation.macroenabled.12\":{\"source\":\"iana\",\"extensions\":[\"pptm\"]},\"application/vnd.ms-powerpoint.slide.macroenabled.12\":{\"source\":\"iana\",\"extensions\":[\"sldm\"]},\"application/vnd.ms-powerpoint.slideshow.macroenabled.12\":{\"source\":\"iana\",\"extensions\":[\"ppsm\"]},\"application/vnd.ms-powerpoint.template.macroenabled.12\":{\"source\":\"iana\",\"extensions\":[\"potm\"]},\"application/vnd.ms-printdevicecapabilities+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.ms-printing.printticket+xml\":{\"source\":\"apache\",\"compressible\":true},\"application/vnd.ms-printschematicket+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.ms-project\":{\"source\":\"iana\",\"extensions\":[\"mpp\",\"mpt\"]},\"application/vnd.ms-tnef\":{\"source\":\"iana\"},\"application/vnd.ms-windows.devicepairing\":{\"source\":\"iana\"},\"application/vnd.ms-windows.nwprinting.oob\":{\"source\":\"iana\"},\"application/vnd.ms-windows.printerpairing\":{\"source\":\"iana\"},\"application/vnd.ms-windows.wsd.oob\":{\"source\":\"iana\"},\"application/vnd.ms-wmdrm.lic-chlg-req\":{\"source\":\"iana\"},\"application/vnd.ms-wmdrm.lic-resp\":{\"source\":\"iana\"},\"application/vnd.ms-wmdrm.meter-chlg-req\":{\"source\":\"iana\"},\"application/vnd.ms-wmdrm.meter-resp\":{\"source\":\"iana\"},\"application/vnd.ms-word.document.macroenabled.12\":{\"source\":\"iana\",\"extensions\":[\"docm\"]},\"application/vnd.ms-word.template.macroenabled.12\":{\"source\":\"iana\",\"extensions\":[\"dotm\"]},\"application/vnd.ms-works\":{\"source\":\"iana\",\"extensions\":[\"wps\",\"wks\",\"wcm\",\"wdb\"]},\"application/vnd.ms-wpl\":{\"source\":\"iana\",\"extensions\":[\"wpl\"]},\"application/vnd.ms-xpsdocument\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"xps\"]},\"application/vnd.msa-disk-image\":{\"source\":\"iana\"},\"application/vnd.mseq\":{\"source\":\"iana\",\"extensions\":[\"mseq\"]},\"application/vnd.msign\":{\"source\":\"iana\"},\"application/vnd.multiad.creator\":{\"source\":\"iana\"},\"application/vnd.multiad.creator.cif\":{\"source\":\"iana\"},\"application/vnd.music-niff\":{\"source\":\"iana\"},\"application/vnd.musician\":{\"source\":\"iana\",\"extensions\":[\"mus\"]},\"application/vnd.muvee.style\":{\"source\":\"iana\",\"extensions\":[\"msty\"]},\"application/vnd.mynfc\":{\"source\":\"iana\",\"extensions\":[\"taglet\"]},\"application/vnd.ncd.control\":{\"source\":\"iana\"},\"application/vnd.ncd.reference\":{\"source\":\"iana\"},\"application/vnd.nearst.inv+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.nervana\":{\"source\":\"iana\"},\"application/vnd.netfpx\":{\"source\":\"iana\"},\"application/vnd.neurolanguage.nlu\":{\"source\":\"iana\",\"extensions\":[\"nlu\"]},\"application/vnd.nimn\":{\"source\":\"iana\"},\"application/vnd.nintendo.nitro.rom\":{\"source\":\"iana\"},\"application/vnd.nintendo.snes.rom\":{\"source\":\"iana\"},\"application/vnd.nitf\":{\"source\":\"iana\",\"extensions\":[\"ntf\",\"nitf\"]},\"application/vnd.noblenet-directory\":{\"source\":\"iana\",\"extensions\":[\"nnd\"]},\"application/vnd.noblenet-sealer\":{\"source\":\"iana\",\"extensions\":[\"nns\"]},\"application/vnd.noblenet-web\":{\"source\":\"iana\",\"extensions\":[\"nnw\"]},\"application/vnd.nokia.catalogs\":{\"source\":\"iana\"},\"application/vnd.nokia.conml+wbxml\":{\"source\":\"iana\"},\"application/vnd.nokia.conml+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.nokia.iptv.config+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.nokia.isds-radio-presets\":{\"source\":\"iana\"},\"application/vnd.nokia.landmark+wbxml\":{\"source\":\"iana\"},\"application/vnd.nokia.landmark+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.nokia.landmarkcollection+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.nokia.n-gage.ac+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"ac\"]},\"application/vnd.nokia.n-gage.data\":{\"source\":\"iana\",\"extensions\":[\"ngdat\"]},\"application/vnd.nokia.n-gage.symbian.install\":{\"source\":\"iana\",\"extensions\":[\"n-gage\"]},\"application/vnd.nokia.ncd\":{\"source\":\"iana\"},\"application/vnd.nokia.pcd+wbxml\":{\"source\":\"iana\"},\"application/vnd.nokia.pcd+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.nokia.radio-preset\":{\"source\":\"iana\",\"extensions\":[\"rpst\"]},\"application/vnd.nokia.radio-presets\":{\"source\":\"iana\",\"extensions\":[\"rpss\"]},\"application/vnd.novadigm.edm\":{\"source\":\"iana\",\"extensions\":[\"edm\"]},\"application/vnd.novadigm.edx\":{\"source\":\"iana\",\"extensions\":[\"edx\"]},\"application/vnd.novadigm.ext\":{\"source\":\"iana\",\"extensions\":[\"ext\"]},\"application/vnd.ntt-local.content-share\":{\"source\":\"iana\"},\"application/vnd.ntt-local.file-transfer\":{\"source\":\"iana\"},\"application/vnd.ntt-local.ogw_remote-access\":{\"source\":\"iana\"},\"application/vnd.ntt-local.sip-ta_remote\":{\"source\":\"iana\"},\"application/vnd.ntt-local.sip-ta_tcp_stream\":{\"source\":\"iana\"},\"application/vnd.oasis.opendocument.chart\":{\"source\":\"iana\",\"extensions\":[\"odc\"]},\"application/vnd.oasis.opendocument.chart-template\":{\"source\":\"iana\",\"extensions\":[\"otc\"]},\"application/vnd.oasis.opendocument.database\":{\"source\":\"iana\",\"extensions\":[\"odb\"]},\"application/vnd.oasis.opendocument.formula\":{\"source\":\"iana\",\"extensions\":[\"odf\"]},\"application/vnd.oasis.opendocument.formula-template\":{\"source\":\"iana\",\"extensions\":[\"odft\"]},\"application/vnd.oasis.opendocument.graphics\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"odg\"]},\"application/vnd.oasis.opendocument.graphics-template\":{\"source\":\"iana\",\"extensions\":[\"otg\"]},\"application/vnd.oasis.opendocument.image\":{\"source\":\"iana\",\"extensions\":[\"odi\"]},\"application/vnd.oasis.opendocument.image-template\":{\"source\":\"iana\",\"extensions\":[\"oti\"]},\"application/vnd.oasis.opendocument.presentation\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"odp\"]},\"application/vnd.oasis.opendocument.presentation-template\":{\"source\":\"iana\",\"extensions\":[\"otp\"]},\"application/vnd.oasis.opendocument.spreadsheet\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"ods\"]},\"application/vnd.oasis.opendocument.spreadsheet-template\":{\"source\":\"iana\",\"extensions\":[\"ots\"]},\"application/vnd.oasis.opendocument.text\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"odt\"]},\"application/vnd.oasis.opendocument.text-master\":{\"source\":\"iana\",\"extensions\":[\"odm\"]},\"application/vnd.oasis.opendocument.text-template\":{\"source\":\"iana\",\"extensions\":[\"ott\"]},\"application/vnd.oasis.opendocument.text-web\":{\"source\":\"iana\",\"extensions\":[\"oth\"]},\"application/vnd.obn\":{\"source\":\"iana\"},\"application/vnd.ocf+cbor\":{\"source\":\"iana\"},\"application/vnd.oci.image.manifest.v1+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oftn.l10n+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oipf.contentaccessdownload+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oipf.contentaccessstreaming+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oipf.cspg-hexbinary\":{\"source\":\"iana\"},\"application/vnd.oipf.dae.svg+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oipf.dae.xhtml+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oipf.mippvcontrolmessage+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oipf.pae.gem\":{\"source\":\"iana\"},\"application/vnd.oipf.spdiscovery+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oipf.spdlist+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oipf.ueprofile+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oipf.userprofile+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.olpc-sugar\":{\"source\":\"iana\",\"extensions\":[\"xo\"]},\"application/vnd.oma-scws-config\":{\"source\":\"iana\"},\"application/vnd.oma-scws-http-request\":{\"source\":\"iana\"},\"application/vnd.oma-scws-http-response\":{\"source\":\"iana\"},\"application/vnd.oma.bcast.associated-procedure-parameter+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.bcast.drm-trigger+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.bcast.imd+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.bcast.ltkm\":{\"source\":\"iana\"},\"application/vnd.oma.bcast.notification+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.bcast.provisioningtrigger\":{\"source\":\"iana\"},\"application/vnd.oma.bcast.sgboot\":{\"source\":\"iana\"},\"application/vnd.oma.bcast.sgdd+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.bcast.sgdu\":{\"source\":\"iana\"},\"application/vnd.oma.bcast.simple-symbol-container\":{\"source\":\"iana\"},\"application/vnd.oma.bcast.smartcard-trigger+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.bcast.sprov+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.bcast.stkm\":{\"source\":\"iana\"},\"application/vnd.oma.cab-address-book+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.cab-feature-handler+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.cab-pcc+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.cab-subs-invite+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.cab-user-prefs+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.dcd\":{\"source\":\"iana\"},\"application/vnd.oma.dcdc\":{\"source\":\"iana\"},\"application/vnd.oma.dd2+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"dd2\"]},\"application/vnd.oma.drm.risd+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.group-usage-list+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.lwm2m+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.lwm2m+tlv\":{\"source\":\"iana\"},\"application/vnd.oma.pal+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.poc.detailed-progress-report+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.poc.final-report+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.poc.groups+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.poc.invocation-descriptor+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.poc.optimized-progress-report+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.push\":{\"source\":\"iana\"},\"application/vnd.oma.scidm.messages+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oma.xcap-directory+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.omads-email+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/vnd.omads-file+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/vnd.omads-folder+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/vnd.omaloc-supl-init\":{\"source\":\"iana\"},\"application/vnd.onepager\":{\"source\":\"iana\"},\"application/vnd.onepagertamp\":{\"source\":\"iana\"},\"application/vnd.onepagertamx\":{\"source\":\"iana\"},\"application/vnd.onepagertat\":{\"source\":\"iana\"},\"application/vnd.onepagertatp\":{\"source\":\"iana\"},\"application/vnd.onepagertatx\":{\"source\":\"iana\"},\"application/vnd.openblox.game+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"obgx\"]},\"application/vnd.openblox.game-binary\":{\"source\":\"iana\"},\"application/vnd.openeye.oeb\":{\"source\":\"iana\"},\"application/vnd.openofficeorg.extension\":{\"source\":\"apache\",\"extensions\":[\"oxt\"]},\"application/vnd.openstreetmap.data+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"osm\"]},\"application/vnd.openxmlformats-officedocument.custom-properties+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.customxmlproperties+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.drawing+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.drawingml.chart+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.extended-properties+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.comments+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.presentation\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"pptx\"]},\"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.slide\":{\"source\":\"iana\",\"extensions\":[\"sldx\"]},\"application/vnd.openxmlformats-officedocument.presentationml.slide+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.slideshow\":{\"source\":\"iana\",\"extensions\":[\"ppsx\"]},\"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.tags+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.template\":{\"source\":\"iana\",\"extensions\":[\"potx\"]},\"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"xlsx\"]},\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.template\":{\"source\":\"iana\",\"extensions\":[\"xltx\"]},\"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.theme+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.themeoverride+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.vmldrawing\":{\"source\":\"iana\"},\"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"docx\"]},\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.wordprocessingml.template\":{\"source\":\"iana\",\"extensions\":[\"dotx\"]},\"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-package.core-properties+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.openxmlformats-package.relationships+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oracle.resource+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.orange.indata\":{\"source\":\"iana\"},\"application/vnd.osa.netdeploy\":{\"source\":\"iana\"},\"application/vnd.osgeo.mapguide.package\":{\"source\":\"iana\",\"extensions\":[\"mgp\"]},\"application/vnd.osgi.bundle\":{\"source\":\"iana\"},\"application/vnd.osgi.dp\":{\"source\":\"iana\",\"extensions\":[\"dp\"]},\"application/vnd.osgi.subsystem\":{\"source\":\"iana\",\"extensions\":[\"esa\"]},\"application/vnd.otps.ct-kip+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.oxli.countgraph\":{\"source\":\"iana\"},\"application/vnd.pagerduty+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.palm\":{\"source\":\"iana\",\"extensions\":[\"pdb\",\"pqa\",\"oprc\"]},\"application/vnd.panoply\":{\"source\":\"iana\"},\"application/vnd.paos.xml\":{\"source\":\"iana\"},\"application/vnd.patentdive\":{\"source\":\"iana\"},\"application/vnd.patientecommsdoc\":{\"source\":\"iana\"},\"application/vnd.pawaafile\":{\"source\":\"iana\",\"extensions\":[\"paw\"]},\"application/vnd.pcos\":{\"source\":\"iana\"},\"application/vnd.pg.format\":{\"source\":\"iana\",\"extensions\":[\"str\"]},\"application/vnd.pg.osasli\":{\"source\":\"iana\",\"extensions\":[\"ei6\"]},\"application/vnd.piaccess.application-licence\":{\"source\":\"iana\"},\"application/vnd.picsel\":{\"source\":\"iana\",\"extensions\":[\"efif\"]},\"application/vnd.pmi.widget\":{\"source\":\"iana\",\"extensions\":[\"wg\"]},\"application/vnd.poc.group-advertisement+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.pocketlearn\":{\"source\":\"iana\",\"extensions\":[\"plf\"]},\"application/vnd.powerbuilder6\":{\"source\":\"iana\",\"extensions\":[\"pbd\"]},\"application/vnd.powerbuilder6-s\":{\"source\":\"iana\"},\"application/vnd.powerbuilder7\":{\"source\":\"iana\"},\"application/vnd.powerbuilder7-s\":{\"source\":\"iana\"},\"application/vnd.powerbuilder75\":{\"source\":\"iana\"},\"application/vnd.powerbuilder75-s\":{\"source\":\"iana\"},\"application/vnd.preminet\":{\"source\":\"iana\"},\"application/vnd.previewsystems.box\":{\"source\":\"iana\",\"extensions\":[\"box\"]},\"application/vnd.proteus.magazine\":{\"source\":\"iana\",\"extensions\":[\"mgz\"]},\"application/vnd.psfs\":{\"source\":\"iana\"},\"application/vnd.publishare-delta-tree\":{\"source\":\"iana\",\"extensions\":[\"qps\"]},\"application/vnd.pvi.ptid1\":{\"source\":\"iana\",\"extensions\":[\"ptid\"]},\"application/vnd.pwg-multiplexed\":{\"source\":\"iana\"},\"application/vnd.pwg-xhtml-print+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.qualcomm.brew-app-res\":{\"source\":\"iana\"},\"application/vnd.quarantainenet\":{\"source\":\"iana\"},\"application/vnd.quark.quarkxpress\":{\"source\":\"iana\",\"extensions\":[\"qxd\",\"qxt\",\"qwd\",\"qwt\",\"qxl\",\"qxb\"]},\"application/vnd.quobject-quoxdocument\":{\"source\":\"iana\"},\"application/vnd.radisys.moml+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-audit+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-audit-conf+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-audit-conn+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-audit-dialog+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-audit-stream+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-conf+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-dialog+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-dialog-base+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-dialog-fax-detect+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-dialog-fax-sendrecv+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-dialog-group+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-dialog-speech+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.radisys.msml-dialog-transform+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.rainstor.data\":{\"source\":\"iana\"},\"application/vnd.rapid\":{\"source\":\"iana\"},\"application/vnd.rar\":{\"source\":\"iana\"},\"application/vnd.realvnc.bed\":{\"source\":\"iana\",\"extensions\":[\"bed\"]},\"application/vnd.recordare.musicxml\":{\"source\":\"iana\",\"extensions\":[\"mxl\"]},\"application/vnd.recordare.musicxml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"musicxml\"]},\"application/vnd.renlearn.rlprint\":{\"source\":\"iana\"},\"application/vnd.restful+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.rig.cryptonote\":{\"source\":\"iana\",\"extensions\":[\"cryptonote\"]},\"application/vnd.rim.cod\":{\"source\":\"apache\",\"extensions\":[\"cod\"]},\"application/vnd.rn-realmedia\":{\"source\":\"apache\",\"extensions\":[\"rm\"]},\"application/vnd.rn-realmedia-vbr\":{\"source\":\"apache\",\"extensions\":[\"rmvb\"]},\"application/vnd.route66.link66+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"link66\"]},\"application/vnd.rs-274x\":{\"source\":\"iana\"},\"application/vnd.ruckus.download\":{\"source\":\"iana\"},\"application/vnd.s3sms\":{\"source\":\"iana\"},\"application/vnd.sailingtracker.track\":{\"source\":\"iana\",\"extensions\":[\"st\"]},\"application/vnd.sar\":{\"source\":\"iana\"},\"application/vnd.sbm.cid\":{\"source\":\"iana\"},\"application/vnd.sbm.mid2\":{\"source\":\"iana\"},\"application/vnd.scribus\":{\"source\":\"iana\"},\"application/vnd.sealed.3df\":{\"source\":\"iana\"},\"application/vnd.sealed.csf\":{\"source\":\"iana\"},\"application/vnd.sealed.doc\":{\"source\":\"iana\"},\"application/vnd.sealed.eml\":{\"source\":\"iana\"},\"application/vnd.sealed.mht\":{\"source\":\"iana\"},\"application/vnd.sealed.net\":{\"source\":\"iana\"},\"application/vnd.sealed.ppt\":{\"source\":\"iana\"},\"application/vnd.sealed.tiff\":{\"source\":\"iana\"},\"application/vnd.sealed.xls\":{\"source\":\"iana\"},\"application/vnd.sealedmedia.softseal.html\":{\"source\":\"iana\"},\"application/vnd.sealedmedia.softseal.pdf\":{\"source\":\"iana\"},\"application/vnd.seemail\":{\"source\":\"iana\",\"extensions\":[\"see\"]},\"application/vnd.sema\":{\"source\":\"iana\",\"extensions\":[\"sema\"]},\"application/vnd.semd\":{\"source\":\"iana\",\"extensions\":[\"semd\"]},\"application/vnd.semf\":{\"source\":\"iana\",\"extensions\":[\"semf\"]},\"application/vnd.shade-save-file\":{\"source\":\"iana\"},\"application/vnd.shana.informed.formdata\":{\"source\":\"iana\",\"extensions\":[\"ifm\"]},\"application/vnd.shana.informed.formtemplate\":{\"source\":\"iana\",\"extensions\":[\"itp\"]},\"application/vnd.shana.informed.interchange\":{\"source\":\"iana\",\"extensions\":[\"iif\"]},\"application/vnd.shana.informed.package\":{\"source\":\"iana\",\"extensions\":[\"ipk\"]},\"application/vnd.shootproof+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.shopkick+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.shp\":{\"source\":\"iana\"},\"application/vnd.shx\":{\"source\":\"iana\"},\"application/vnd.sigrok.session\":{\"source\":\"iana\"},\"application/vnd.simtech-mindmapper\":{\"source\":\"iana\",\"extensions\":[\"twd\",\"twds\"]},\"application/vnd.siren+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.smaf\":{\"source\":\"iana\",\"extensions\":[\"mmf\"]},\"application/vnd.smart.notebook\":{\"source\":\"iana\"},\"application/vnd.smart.teacher\":{\"source\":\"iana\",\"extensions\":[\"teacher\"]},\"application/vnd.snesdev-page-table\":{\"source\":\"iana\"},\"application/vnd.software602.filler.form+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"fo\"]},\"application/vnd.software602.filler.form-xml-zip\":{\"source\":\"iana\"},\"application/vnd.solent.sdkm+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"sdkm\",\"sdkd\"]},\"application/vnd.spotfire.dxp\":{\"source\":\"iana\",\"extensions\":[\"dxp\"]},\"application/vnd.spotfire.sfs\":{\"source\":\"iana\",\"extensions\":[\"sfs\"]},\"application/vnd.sqlite3\":{\"source\":\"iana\"},\"application/vnd.sss-cod\":{\"source\":\"iana\"},\"application/vnd.sss-dtf\":{\"source\":\"iana\"},\"application/vnd.sss-ntf\":{\"source\":\"iana\"},\"application/vnd.stardivision.calc\":{\"source\":\"apache\",\"extensions\":[\"sdc\"]},\"application/vnd.stardivision.draw\":{\"source\":\"apache\",\"extensions\":[\"sda\"]},\"application/vnd.stardivision.impress\":{\"source\":\"apache\",\"extensions\":[\"sdd\"]},\"application/vnd.stardivision.math\":{\"source\":\"apache\",\"extensions\":[\"smf\"]},\"application/vnd.stardivision.writer\":{\"source\":\"apache\",\"extensions\":[\"sdw\",\"vor\"]},\"application/vnd.stardivision.writer-global\":{\"source\":\"apache\",\"extensions\":[\"sgl\"]},\"application/vnd.stepmania.package\":{\"source\":\"iana\",\"extensions\":[\"smzip\"]},\"application/vnd.stepmania.stepchart\":{\"source\":\"iana\",\"extensions\":[\"sm\"]},\"application/vnd.street-stream\":{\"source\":\"iana\"},\"application/vnd.sun.wadl+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"wadl\"]},\"application/vnd.sun.xml.calc\":{\"source\":\"apache\",\"extensions\":[\"sxc\"]},\"application/vnd.sun.xml.calc.template\":{\"source\":\"apache\",\"extensions\":[\"stc\"]},\"application/vnd.sun.xml.draw\":{\"source\":\"apache\",\"extensions\":[\"sxd\"]},\"application/vnd.sun.xml.draw.template\":{\"source\":\"apache\",\"extensions\":[\"std\"]},\"application/vnd.sun.xml.impress\":{\"source\":\"apache\",\"extensions\":[\"sxi\"]},\"application/vnd.sun.xml.impress.template\":{\"source\":\"apache\",\"extensions\":[\"sti\"]},\"application/vnd.sun.xml.math\":{\"source\":\"apache\",\"extensions\":[\"sxm\"]},\"application/vnd.sun.xml.writer\":{\"source\":\"apache\",\"extensions\":[\"sxw\"]},\"application/vnd.sun.xml.writer.global\":{\"source\":\"apache\",\"extensions\":[\"sxg\"]},\"application/vnd.sun.xml.writer.template\":{\"source\":\"apache\",\"extensions\":[\"stw\"]},\"application/vnd.sus-calendar\":{\"source\":\"iana\",\"extensions\":[\"sus\",\"susp\"]},\"application/vnd.svd\":{\"source\":\"iana\",\"extensions\":[\"svd\"]},\"application/vnd.swiftview-ics\":{\"source\":\"iana\"},\"application/vnd.symbian.install\":{\"source\":\"apache\",\"extensions\":[\"sis\",\"sisx\"]},\"application/vnd.syncml+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true,\"extensions\":[\"xsm\"]},\"application/vnd.syncml.dm+wbxml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"extensions\":[\"bdm\"]},\"application/vnd.syncml.dm+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true,\"extensions\":[\"xdm\"]},\"application/vnd.syncml.dm.notification\":{\"source\":\"iana\"},\"application/vnd.syncml.dmddf+wbxml\":{\"source\":\"iana\"},\"application/vnd.syncml.dmddf+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true,\"extensions\":[\"ddf\"]},\"application/vnd.syncml.dmtnds+wbxml\":{\"source\":\"iana\"},\"application/vnd.syncml.dmtnds+xml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true},\"application/vnd.syncml.ds.notification\":{\"source\":\"iana\"},\"application/vnd.tableschema+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.tao.intent-module-archive\":{\"source\":\"iana\",\"extensions\":[\"tao\"]},\"application/vnd.tcpdump.pcap\":{\"source\":\"iana\",\"extensions\":[\"pcap\",\"cap\",\"dmp\"]},\"application/vnd.think-cell.ppttc+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.tmd.mediaflex.api+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.tml\":{\"source\":\"iana\"},\"application/vnd.tmobile-livetv\":{\"source\":\"iana\",\"extensions\":[\"tmo\"]},\"application/vnd.tri.onesource\":{\"source\":\"iana\"},\"application/vnd.trid.tpt\":{\"source\":\"iana\",\"extensions\":[\"tpt\"]},\"application/vnd.triscape.mxs\":{\"source\":\"iana\",\"extensions\":[\"mxs\"]},\"application/vnd.trueapp\":{\"source\":\"iana\",\"extensions\":[\"tra\"]},\"application/vnd.truedoc\":{\"source\":\"iana\"},\"application/vnd.ubisoft.webplayer\":{\"source\":\"iana\"},\"application/vnd.ufdl\":{\"source\":\"iana\",\"extensions\":[\"ufd\",\"ufdl\"]},\"application/vnd.uiq.theme\":{\"source\":\"iana\",\"extensions\":[\"utz\"]},\"application/vnd.umajin\":{\"source\":\"iana\",\"extensions\":[\"umj\"]},\"application/vnd.unity\":{\"source\":\"iana\",\"extensions\":[\"unityweb\"]},\"application/vnd.uoml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"uoml\"]},\"application/vnd.uplanet.alert\":{\"source\":\"iana\"},\"application/vnd.uplanet.alert-wbxml\":{\"source\":\"iana\"},\"application/vnd.uplanet.bearer-choice\":{\"source\":\"iana\"},\"application/vnd.uplanet.bearer-choice-wbxml\":{\"source\":\"iana\"},\"application/vnd.uplanet.cacheop\":{\"source\":\"iana\"},\"application/vnd.uplanet.cacheop-wbxml\":{\"source\":\"iana\"},\"application/vnd.uplanet.channel\":{\"source\":\"iana\"},\"application/vnd.uplanet.channel-wbxml\":{\"source\":\"iana\"},\"application/vnd.uplanet.list\":{\"source\":\"iana\"},\"application/vnd.uplanet.list-wbxml\":{\"source\":\"iana\"},\"application/vnd.uplanet.listcmd\":{\"source\":\"iana\"},\"application/vnd.uplanet.listcmd-wbxml\":{\"source\":\"iana\"},\"application/vnd.uplanet.signal\":{\"source\":\"iana\"},\"application/vnd.uri-map\":{\"source\":\"iana\"},\"application/vnd.valve.source.material\":{\"source\":\"iana\"},\"application/vnd.vcx\":{\"source\":\"iana\",\"extensions\":[\"vcx\"]},\"application/vnd.vd-study\":{\"source\":\"iana\"},\"application/vnd.vectorworks\":{\"source\":\"iana\"},\"application/vnd.vel+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.verimatrix.vcas\":{\"source\":\"iana\"},\"application/vnd.veryant.thin\":{\"source\":\"iana\"},\"application/vnd.ves.encrypted\":{\"source\":\"iana\"},\"application/vnd.vidsoft.vidconference\":{\"source\":\"iana\"},\"application/vnd.visio\":{\"source\":\"iana\",\"extensions\":[\"vsd\",\"vst\",\"vss\",\"vsw\"]},\"application/vnd.visionary\":{\"source\":\"iana\",\"extensions\":[\"vis\"]},\"application/vnd.vividence.scriptfile\":{\"source\":\"iana\"},\"application/vnd.vsf\":{\"source\":\"iana\",\"extensions\":[\"vsf\"]},\"application/vnd.wap.sic\":{\"source\":\"iana\"},\"application/vnd.wap.slc\":{\"source\":\"iana\"},\"application/vnd.wap.wbxml\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"extensions\":[\"wbxml\"]},\"application/vnd.wap.wmlc\":{\"source\":\"iana\",\"extensions\":[\"wmlc\"]},\"application/vnd.wap.wmlscriptc\":{\"source\":\"iana\",\"extensions\":[\"wmlsc\"]},\"application/vnd.webturbo\":{\"source\":\"iana\",\"extensions\":[\"wtb\"]},\"application/vnd.wfa.p2p\":{\"source\":\"iana\"},\"application/vnd.wfa.wsc\":{\"source\":\"iana\"},\"application/vnd.windows.devicepairing\":{\"source\":\"iana\"},\"application/vnd.wmc\":{\"source\":\"iana\"},\"application/vnd.wmf.bootstrap\":{\"source\":\"iana\"},\"application/vnd.wolfram.mathematica\":{\"source\":\"iana\"},\"application/vnd.wolfram.mathematica.package\":{\"source\":\"iana\"},\"application/vnd.wolfram.player\":{\"source\":\"iana\",\"extensions\":[\"nbp\"]},\"application/vnd.wordperfect\":{\"source\":\"iana\",\"extensions\":[\"wpd\"]},\"application/vnd.wqd\":{\"source\":\"iana\",\"extensions\":[\"wqd\"]},\"application/vnd.wrq-hp3000-labelled\":{\"source\":\"iana\"},\"application/vnd.wt.stf\":{\"source\":\"iana\",\"extensions\":[\"stf\"]},\"application/vnd.wv.csp+wbxml\":{\"source\":\"iana\"},\"application/vnd.wv.csp+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.wv.ssp+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.xacml+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.xara\":{\"source\":\"iana\",\"extensions\":[\"xar\"]},\"application/vnd.xfdl\":{\"source\":\"iana\",\"extensions\":[\"xfdl\"]},\"application/vnd.xfdl.webform\":{\"source\":\"iana\"},\"application/vnd.xmi+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/vnd.xmpie.cpkg\":{\"source\":\"iana\"},\"application/vnd.xmpie.dpkg\":{\"source\":\"iana\"},\"application/vnd.xmpie.plan\":{\"source\":\"iana\"},\"application/vnd.xmpie.ppkg\":{\"source\":\"iana\"},\"application/vnd.xmpie.xlim\":{\"source\":\"iana\"},\"application/vnd.yamaha.hv-dic\":{\"source\":\"iana\",\"extensions\":[\"hvd\"]},\"application/vnd.yamaha.hv-script\":{\"source\":\"iana\",\"extensions\":[\"hvs\"]},\"application/vnd.yamaha.hv-voice\":{\"source\":\"iana\",\"extensions\":[\"hvp\"]},\"application/vnd.yamaha.openscoreformat\":{\"source\":\"iana\",\"extensions\":[\"osf\"]},\"application/vnd.yamaha.openscoreformat.osfpvg+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"osfpvg\"]},\"application/vnd.yamaha.remote-setup\":{\"source\":\"iana\"},\"application/vnd.yamaha.smaf-audio\":{\"source\":\"iana\",\"extensions\":[\"saf\"]},\"application/vnd.yamaha.smaf-phrase\":{\"source\":\"iana\",\"extensions\":[\"spf\"]},\"application/vnd.yamaha.through-ngn\":{\"source\":\"iana\"},\"application/vnd.yamaha.tunnel-udpencap\":{\"source\":\"iana\"},\"application/vnd.yaoweme\":{\"source\":\"iana\"},\"application/vnd.yellowriver-custom-menu\":{\"source\":\"iana\",\"extensions\":[\"cmp\"]},\"application/vnd.youtube.yt\":{\"source\":\"iana\"},\"application/vnd.zul\":{\"source\":\"iana\",\"extensions\":[\"zir\",\"zirz\"]},\"application/vnd.zzazz.deck+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"zaz\"]},\"application/voicexml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"vxml\"]},\"application/voucher-cms+json\":{\"source\":\"iana\",\"compressible\":true},\"application/vq-rtcpxr\":{\"source\":\"iana\"},\"application/wasm\":{\"compressible\":true,\"extensions\":[\"wasm\"]},\"application/watcherinfo+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/webpush-options+json\":{\"source\":\"iana\",\"compressible\":true},\"application/whoispp-query\":{\"source\":\"iana\"},\"application/whoispp-response\":{\"source\":\"iana\"},\"application/widget\":{\"source\":\"iana\",\"extensions\":[\"wgt\"]},\"application/winhlp\":{\"source\":\"apache\",\"extensions\":[\"hlp\"]},\"application/wita\":{\"source\":\"iana\"},\"application/wordperfect5.1\":{\"source\":\"iana\"},\"application/wsdl+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"wsdl\"]},\"application/wspolicy+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"wspolicy\"]},\"application/x-7z-compressed\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"7z\"]},\"application/x-abiword\":{\"source\":\"apache\",\"extensions\":[\"abw\"]},\"application/x-ace-compressed\":{\"source\":\"apache\",\"extensions\":[\"ace\"]},\"application/x-amf\":{\"source\":\"apache\"},\"application/x-apple-diskimage\":{\"source\":\"apache\",\"extensions\":[\"dmg\"]},\"application/x-arj\":{\"compressible\":false,\"extensions\":[\"arj\"]},\"application/x-authorware-bin\":{\"source\":\"apache\",\"extensions\":[\"aab\",\"x32\",\"u32\",\"vox\"]},\"application/x-authorware-map\":{\"source\":\"apache\",\"extensions\":[\"aam\"]},\"application/x-authorware-seg\":{\"source\":\"apache\",\"extensions\":[\"aas\"]},\"application/x-bcpio\":{\"source\":\"apache\",\"extensions\":[\"bcpio\"]},\"application/x-bdoc\":{\"compressible\":false,\"extensions\":[\"bdoc\"]},\"application/x-bittorrent\":{\"source\":\"apache\",\"extensions\":[\"torrent\"]},\"application/x-blorb\":{\"source\":\"apache\",\"extensions\":[\"blb\",\"blorb\"]},\"application/x-bzip\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"bz\"]},\"application/x-bzip2\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"bz2\",\"boz\"]},\"application/x-cbr\":{\"source\":\"apache\",\"extensions\":[\"cbr\",\"cba\",\"cbt\",\"cbz\",\"cb7\"]},\"application/x-cdlink\":{\"source\":\"apache\",\"extensions\":[\"vcd\"]},\"application/x-cfs-compressed\":{\"source\":\"apache\",\"extensions\":[\"cfs\"]},\"application/x-chat\":{\"source\":\"apache\",\"extensions\":[\"chat\"]},\"application/x-chess-pgn\":{\"source\":\"apache\",\"extensions\":[\"pgn\"]},\"application/x-chrome-extension\":{\"extensions\":[\"crx\"]},\"application/x-cocoa\":{\"source\":\"nginx\",\"extensions\":[\"cco\"]},\"application/x-compress\":{\"source\":\"apache\"},\"application/x-conference\":{\"source\":\"apache\",\"extensions\":[\"nsc\"]},\"application/x-cpio\":{\"source\":\"apache\",\"extensions\":[\"cpio\"]},\"application/x-csh\":{\"source\":\"apache\",\"extensions\":[\"csh\"]},\"application/x-deb\":{\"compressible\":false},\"application/x-debian-package\":{\"source\":\"apache\",\"extensions\":[\"deb\",\"udeb\"]},\"application/x-dgc-compressed\":{\"source\":\"apache\",\"extensions\":[\"dgc\"]},\"application/x-director\":{\"source\":\"apache\",\"extensions\":[\"dir\",\"dcr\",\"dxr\",\"cst\",\"cct\",\"cxt\",\"w3d\",\"fgd\",\"swa\"]},\"application/x-doom\":{\"source\":\"apache\",\"extensions\":[\"wad\"]},\"application/x-dtbncx+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"ncx\"]},\"application/x-dtbook+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"dtb\"]},\"application/x-dtbresource+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"res\"]},\"application/x-dvi\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"dvi\"]},\"application/x-envoy\":{\"source\":\"apache\",\"extensions\":[\"evy\"]},\"application/x-eva\":{\"source\":\"apache\",\"extensions\":[\"eva\"]},\"application/x-font-bdf\":{\"source\":\"apache\",\"extensions\":[\"bdf\"]},\"application/x-font-dos\":{\"source\":\"apache\"},\"application/x-font-framemaker\":{\"source\":\"apache\"},\"application/x-font-ghostscript\":{\"source\":\"apache\",\"extensions\":[\"gsf\"]},\"application/x-font-libgrx\":{\"source\":\"apache\"},\"application/x-font-linux-psf\":{\"source\":\"apache\",\"extensions\":[\"psf\"]},\"application/x-font-pcf\":{\"source\":\"apache\",\"extensions\":[\"pcf\"]},\"application/x-font-snf\":{\"source\":\"apache\",\"extensions\":[\"snf\"]},\"application/x-font-speedo\":{\"source\":\"apache\"},\"application/x-font-sunos-news\":{\"source\":\"apache\"},\"application/x-font-type1\":{\"source\":\"apache\",\"extensions\":[\"pfa\",\"pfb\",\"pfm\",\"afm\"]},\"application/x-font-vfont\":{\"source\":\"apache\"},\"application/x-freearc\":{\"source\":\"apache\",\"extensions\":[\"arc\"]},\"application/x-futuresplash\":{\"source\":\"apache\",\"extensions\":[\"spl\"]},\"application/x-gca-compressed\":{\"source\":\"apache\",\"extensions\":[\"gca\"]},\"application/x-glulx\":{\"source\":\"apache\",\"extensions\":[\"ulx\"]},\"application/x-gnumeric\":{\"source\":\"apache\",\"extensions\":[\"gnumeric\"]},\"application/x-gramps-xml\":{\"source\":\"apache\",\"extensions\":[\"gramps\"]},\"application/x-gtar\":{\"source\":\"apache\",\"extensions\":[\"gtar\"]},\"application/x-gzip\":{\"source\":\"apache\"},\"application/x-hdf\":{\"source\":\"apache\",\"extensions\":[\"hdf\"]},\"application/x-httpd-php\":{\"compressible\":true,\"extensions\":[\"php\"]},\"application/x-install-instructions\":{\"source\":\"apache\",\"extensions\":[\"install\"]},\"application/x-iso9660-image\":{\"source\":\"apache\",\"extensions\":[\"iso\"]},\"application/x-java-archive-diff\":{\"source\":\"nginx\",\"extensions\":[\"jardiff\"]},\"application/x-java-jnlp-file\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"jnlp\"]},\"application/x-javascript\":{\"compressible\":true},\"application/x-keepass2\":{\"extensions\":[\"kdbx\"]},\"application/x-latex\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"latex\"]},\"application/x-lua-bytecode\":{\"extensions\":[\"luac\"]},\"application/x-lzh-compressed\":{\"source\":\"apache\",\"extensions\":[\"lzh\",\"lha\"]},\"application/x-makeself\":{\"source\":\"nginx\",\"extensions\":[\"run\"]},\"application/x-mie\":{\"source\":\"apache\",\"extensions\":[\"mie\"]},\"application/x-mobipocket-ebook\":{\"source\":\"apache\",\"extensions\":[\"prc\",\"mobi\"]},\"application/x-mpegurl\":{\"compressible\":false},\"application/x-ms-application\":{\"source\":\"apache\",\"extensions\":[\"application\"]},\"application/x-ms-shortcut\":{\"source\":\"apache\",\"extensions\":[\"lnk\"]},\"application/x-ms-wmd\":{\"source\":\"apache\",\"extensions\":[\"wmd\"]},\"application/x-ms-wmz\":{\"source\":\"apache\",\"extensions\":[\"wmz\"]},\"application/x-ms-xbap\":{\"source\":\"apache\",\"extensions\":[\"xbap\"]},\"application/x-msaccess\":{\"source\":\"apache\",\"extensions\":[\"mdb\"]},\"application/x-msbinder\":{\"source\":\"apache\",\"extensions\":[\"obd\"]},\"application/x-mscardfile\":{\"source\":\"apache\",\"extensions\":[\"crd\"]},\"application/x-msclip\":{\"source\":\"apache\",\"extensions\":[\"clp\"]},\"application/x-msdos-program\":{\"extensions\":[\"exe\"]},\"application/x-msdownload\":{\"source\":\"apache\",\"extensions\":[\"exe\",\"dll\",\"com\",\"bat\",\"msi\"]},\"application/x-msmediaview\":{\"source\":\"apache\",\"extensions\":[\"mvb\",\"m13\",\"m14\"]},\"application/x-msmetafile\":{\"source\":\"apache\",\"extensions\":[\"wmf\",\"wmz\",\"emf\",\"emz\"]},\"application/x-msmoney\":{\"source\":\"apache\",\"extensions\":[\"mny\"]},\"application/x-mspublisher\":{\"source\":\"apache\",\"extensions\":[\"pub\"]},\"application/x-msschedule\":{\"source\":\"apache\",\"extensions\":[\"scd\"]},\"application/x-msterminal\":{\"source\":\"apache\",\"extensions\":[\"trm\"]},\"application/x-mswrite\":{\"source\":\"apache\",\"extensions\":[\"wri\"]},\"application/x-netcdf\":{\"source\":\"apache\",\"extensions\":[\"nc\",\"cdf\"]},\"application/x-ns-proxy-autoconfig\":{\"compressible\":true,\"extensions\":[\"pac\"]},\"application/x-nzb\":{\"source\":\"apache\",\"extensions\":[\"nzb\"]},\"application/x-perl\":{\"source\":\"nginx\",\"extensions\":[\"pl\",\"pm\"]},\"application/x-pilot\":{\"source\":\"nginx\",\"extensions\":[\"prc\",\"pdb\"]},\"application/x-pkcs12\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"p12\",\"pfx\"]},\"application/x-pkcs7-certificates\":{\"source\":\"apache\",\"extensions\":[\"p7b\",\"spc\"]},\"application/x-pkcs7-certreqresp\":{\"source\":\"apache\",\"extensions\":[\"p7r\"]},\"application/x-pki-message\":{\"source\":\"iana\"},\"application/x-rar-compressed\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"rar\"]},\"application/x-redhat-package-manager\":{\"source\":\"nginx\",\"extensions\":[\"rpm\"]},\"application/x-research-info-systems\":{\"source\":\"apache\",\"extensions\":[\"ris\"]},\"application/x-sea\":{\"source\":\"nginx\",\"extensions\":[\"sea\"]},\"application/x-sh\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"sh\"]},\"application/x-shar\":{\"source\":\"apache\",\"extensions\":[\"shar\"]},\"application/x-shockwave-flash\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"swf\"]},\"application/x-silverlight-app\":{\"source\":\"apache\",\"extensions\":[\"xap\"]},\"application/x-sql\":{\"source\":\"apache\",\"extensions\":[\"sql\"]},\"application/x-stuffit\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"sit\"]},\"application/x-stuffitx\":{\"source\":\"apache\",\"extensions\":[\"sitx\"]},\"application/x-subrip\":{\"source\":\"apache\",\"extensions\":[\"srt\"]},\"application/x-sv4cpio\":{\"source\":\"apache\",\"extensions\":[\"sv4cpio\"]},\"application/x-sv4crc\":{\"source\":\"apache\",\"extensions\":[\"sv4crc\"]},\"application/x-t3vm-image\":{\"source\":\"apache\",\"extensions\":[\"t3\"]},\"application/x-tads\":{\"source\":\"apache\",\"extensions\":[\"gam\"]},\"application/x-tar\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"tar\"]},\"application/x-tcl\":{\"source\":\"apache\",\"extensions\":[\"tcl\",\"tk\"]},\"application/x-tex\":{\"source\":\"apache\",\"extensions\":[\"tex\"]},\"application/x-tex-tfm\":{\"source\":\"apache\",\"extensions\":[\"tfm\"]},\"application/x-texinfo\":{\"source\":\"apache\",\"extensions\":[\"texinfo\",\"texi\"]},\"application/x-tgif\":{\"source\":\"apache\",\"extensions\":[\"obj\"]},\"application/x-ustar\":{\"source\":\"apache\",\"extensions\":[\"ustar\"]},\"application/x-virtualbox-hdd\":{\"compressible\":true,\"extensions\":[\"hdd\"]},\"application/x-virtualbox-ova\":{\"compressible\":true,\"extensions\":[\"ova\"]},\"application/x-virtualbox-ovf\":{\"compressible\":true,\"extensions\":[\"ovf\"]},\"application/x-virtualbox-vbox\":{\"compressible\":true,\"extensions\":[\"vbox\"]},\"application/x-virtualbox-vbox-extpack\":{\"compressible\":false,\"extensions\":[\"vbox-extpack\"]},\"application/x-virtualbox-vdi\":{\"compressible\":true,\"extensions\":[\"vdi\"]},\"application/x-virtualbox-vhd\":{\"compressible\":true,\"extensions\":[\"vhd\"]},\"application/x-virtualbox-vmdk\":{\"compressible\":true,\"extensions\":[\"vmdk\"]},\"application/x-wais-source\":{\"source\":\"apache\",\"extensions\":[\"src\"]},\"application/x-web-app-manifest+json\":{\"compressible\":true,\"extensions\":[\"webapp\"]},\"application/x-www-form-urlencoded\":{\"source\":\"iana\",\"compressible\":true},\"application/x-x509-ca-cert\":{\"source\":\"iana\",\"extensions\":[\"der\",\"crt\",\"pem\"]},\"application/x-x509-ca-ra-cert\":{\"source\":\"iana\"},\"application/x-x509-next-ca-cert\":{\"source\":\"iana\"},\"application/x-xfig\":{\"source\":\"apache\",\"extensions\":[\"fig\"]},\"application/x-xliff+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"xlf\"]},\"application/x-xpinstall\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"xpi\"]},\"application/x-xz\":{\"source\":\"apache\",\"extensions\":[\"xz\"]},\"application/x-zmachine\":{\"source\":\"apache\",\"extensions\":[\"z1\",\"z2\",\"z3\",\"z4\",\"z5\",\"z6\",\"z7\",\"z8\"]},\"application/x400-bp\":{\"source\":\"iana\"},\"application/xacml+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/xaml+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"xaml\"]},\"application/xcap-att+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xav\"]},\"application/xcap-caps+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xca\"]},\"application/xcap-diff+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xdf\"]},\"application/xcap-el+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xel\"]},\"application/xcap-error+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xer\"]},\"application/xcap-ns+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xns\"]},\"application/xcon-conference-info+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/xcon-conference-info-diff+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/xenc+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xenc\"]},\"application/xhtml+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xhtml\",\"xht\"]},\"application/xhtml-voice+xml\":{\"source\":\"apache\",\"compressible\":true},\"application/xliff+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xlf\"]},\"application/xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xml\",\"xsl\",\"xsd\",\"rng\"]},\"application/xml-dtd\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"dtd\"]},\"application/xml-external-parsed-entity\":{\"source\":\"iana\"},\"application/xml-patch+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/xmpp+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/xop+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xop\"]},\"application/xproc+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"xpl\"]},\"application/xslt+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xslt\"]},\"application/xspf+xml\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"xspf\"]},\"application/xv+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"mxml\",\"xhvml\",\"xvml\",\"xvm\"]},\"application/yang\":{\"source\":\"iana\",\"extensions\":[\"yang\"]},\"application/yang-data+json\":{\"source\":\"iana\",\"compressible\":true},\"application/yang-data+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/yang-patch+json\":{\"source\":\"iana\",\"compressible\":true},\"application/yang-patch+xml\":{\"source\":\"iana\",\"compressible\":true},\"application/yin+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"yin\"]},\"application/zip\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"zip\"]},\"application/zlib\":{\"source\":\"iana\"},\"application/zstd\":{\"source\":\"iana\"},\"audio/1d-interleaved-parityfec\":{\"source\":\"iana\"},\"audio/32kadpcm\":{\"source\":\"iana\"},\"audio/3gpp\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"3gpp\"]},\"audio/3gpp2\":{\"source\":\"iana\"},\"audio/aac\":{\"source\":\"iana\"},\"audio/ac3\":{\"source\":\"iana\"},\"audio/adpcm\":{\"source\":\"apache\",\"extensions\":[\"adp\"]},\"audio/amr\":{\"source\":\"iana\"},\"audio/amr-wb\":{\"source\":\"iana\"},\"audio/amr-wb+\":{\"source\":\"iana\"},\"audio/aptx\":{\"source\":\"iana\"},\"audio/asc\":{\"source\":\"iana\"},\"audio/atrac-advanced-lossless\":{\"source\":\"iana\"},\"audio/atrac-x\":{\"source\":\"iana\"},\"audio/atrac3\":{\"source\":\"iana\"},\"audio/basic\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"au\",\"snd\"]},\"audio/bv16\":{\"source\":\"iana\"},\"audio/bv32\":{\"source\":\"iana\"},\"audio/clearmode\":{\"source\":\"iana\"},\"audio/cn\":{\"source\":\"iana\"},\"audio/dat12\":{\"source\":\"iana\"},\"audio/dls\":{\"source\":\"iana\"},\"audio/dsr-es201108\":{\"source\":\"iana\"},\"audio/dsr-es202050\":{\"source\":\"iana\"},\"audio/dsr-es202211\":{\"source\":\"iana\"},\"audio/dsr-es202212\":{\"source\":\"iana\"},\"audio/dv\":{\"source\":\"iana\"},\"audio/dvi4\":{\"source\":\"iana\"},\"audio/eac3\":{\"source\":\"iana\"},\"audio/encaprtp\":{\"source\":\"iana\"},\"audio/evrc\":{\"source\":\"iana\"},\"audio/evrc-qcp\":{\"source\":\"iana\"},\"audio/evrc0\":{\"source\":\"iana\"},\"audio/evrc1\":{\"source\":\"iana\"},\"audio/evrcb\":{\"source\":\"iana\"},\"audio/evrcb0\":{\"source\":\"iana\"},\"audio/evrcb1\":{\"source\":\"iana\"},\"audio/evrcnw\":{\"source\":\"iana\"},\"audio/evrcnw0\":{\"source\":\"iana\"},\"audio/evrcnw1\":{\"source\":\"iana\"},\"audio/evrcwb\":{\"source\":\"iana\"},\"audio/evrcwb0\":{\"source\":\"iana\"},\"audio/evrcwb1\":{\"source\":\"iana\"},\"audio/evs\":{\"source\":\"iana\"},\"audio/flexfec\":{\"source\":\"iana\"},\"audio/fwdred\":{\"source\":\"iana\"},\"audio/g711-0\":{\"source\":\"iana\"},\"audio/g719\":{\"source\":\"iana\"},\"audio/g722\":{\"source\":\"iana\"},\"audio/g7221\":{\"source\":\"iana\"},\"audio/g723\":{\"source\":\"iana\"},\"audio/g726-16\":{\"source\":\"iana\"},\"audio/g726-24\":{\"source\":\"iana\"},\"audio/g726-32\":{\"source\":\"iana\"},\"audio/g726-40\":{\"source\":\"iana\"},\"audio/g728\":{\"source\":\"iana\"},\"audio/g729\":{\"source\":\"iana\"},\"audio/g7291\":{\"source\":\"iana\"},\"audio/g729d\":{\"source\":\"iana\"},\"audio/g729e\":{\"source\":\"iana\"},\"audio/gsm\":{\"source\":\"iana\"},\"audio/gsm-efr\":{\"source\":\"iana\"},\"audio/gsm-hr-08\":{\"source\":\"iana\"},\"audio/ilbc\":{\"source\":\"iana\"},\"audio/ip-mr_v2.5\":{\"source\":\"iana\"},\"audio/isac\":{\"source\":\"apache\"},\"audio/l16\":{\"source\":\"iana\"},\"audio/l20\":{\"source\":\"iana\"},\"audio/l24\":{\"source\":\"iana\",\"compressible\":false},\"audio/l8\":{\"source\":\"iana\"},\"audio/lpc\":{\"source\":\"iana\"},\"audio/melp\":{\"source\":\"iana\"},\"audio/melp1200\":{\"source\":\"iana\"},\"audio/melp2400\":{\"source\":\"iana\"},\"audio/melp600\":{\"source\":\"iana\"},\"audio/mhas\":{\"source\":\"iana\"},\"audio/midi\":{\"source\":\"apache\",\"extensions\":[\"mid\",\"midi\",\"kar\",\"rmi\"]},\"audio/mobile-xmf\":{\"source\":\"iana\",\"extensions\":[\"mxmf\"]},\"audio/mp3\":{\"compressible\":false,\"extensions\":[\"mp3\"]},\"audio/mp4\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"m4a\",\"mp4a\"]},\"audio/mp4a-latm\":{\"source\":\"iana\"},\"audio/mpa\":{\"source\":\"iana\"},\"audio/mpa-robust\":{\"source\":\"iana\"},\"audio/mpeg\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"mpga\",\"mp2\",\"mp2a\",\"mp3\",\"m2a\",\"m3a\"]},\"audio/mpeg4-generic\":{\"source\":\"iana\"},\"audio/musepack\":{\"source\":\"apache\"},\"audio/ogg\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"oga\",\"ogg\",\"spx\"]},\"audio/opus\":{\"source\":\"iana\"},\"audio/parityfec\":{\"source\":\"iana\"},\"audio/pcma\":{\"source\":\"iana\"},\"audio/pcma-wb\":{\"source\":\"iana\"},\"audio/pcmu\":{\"source\":\"iana\"},\"audio/pcmu-wb\":{\"source\":\"iana\"},\"audio/prs.sid\":{\"source\":\"iana\"},\"audio/qcelp\":{\"source\":\"iana\"},\"audio/raptorfec\":{\"source\":\"iana\"},\"audio/red\":{\"source\":\"iana\"},\"audio/rtp-enc-aescm128\":{\"source\":\"iana\"},\"audio/rtp-midi\":{\"source\":\"iana\"},\"audio/rtploopback\":{\"source\":\"iana\"},\"audio/rtx\":{\"source\":\"iana\"},\"audio/s3m\":{\"source\":\"apache\",\"extensions\":[\"s3m\"]},\"audio/silk\":{\"source\":\"apache\",\"extensions\":[\"sil\"]},\"audio/smv\":{\"source\":\"iana\"},\"audio/smv-qcp\":{\"source\":\"iana\"},\"audio/smv0\":{\"source\":\"iana\"},\"audio/sp-midi\":{\"source\":\"iana\"},\"audio/speex\":{\"source\":\"iana\"},\"audio/t140c\":{\"source\":\"iana\"},\"audio/t38\":{\"source\":\"iana\"},\"audio/telephone-event\":{\"source\":\"iana\"},\"audio/tetra_acelp\":{\"source\":\"iana\"},\"audio/tetra_acelp_bb\":{\"source\":\"iana\"},\"audio/tone\":{\"source\":\"iana\"},\"audio/uemclip\":{\"source\":\"iana\"},\"audio/ulpfec\":{\"source\":\"iana\"},\"audio/usac\":{\"source\":\"iana\"},\"audio/vdvi\":{\"source\":\"iana\"},\"audio/vmr-wb\":{\"source\":\"iana\"},\"audio/vnd.3gpp.iufp\":{\"source\":\"iana\"},\"audio/vnd.4sb\":{\"source\":\"iana\"},\"audio/vnd.audiokoz\":{\"source\":\"iana\"},\"audio/vnd.celp\":{\"source\":\"iana\"},\"audio/vnd.cisco.nse\":{\"source\":\"iana\"},\"audio/vnd.cmles.radio-events\":{\"source\":\"iana\"},\"audio/vnd.cns.anp1\":{\"source\":\"iana\"},\"audio/vnd.cns.inf1\":{\"source\":\"iana\"},\"audio/vnd.dece.audio\":{\"source\":\"iana\",\"extensions\":[\"uva\",\"uvva\"]},\"audio/vnd.digital-winds\":{\"source\":\"iana\",\"extensions\":[\"eol\"]},\"audio/vnd.dlna.adts\":{\"source\":\"iana\"},\"audio/vnd.dolby.heaac.1\":{\"source\":\"iana\"},\"audio/vnd.dolby.heaac.2\":{\"source\":\"iana\"},\"audio/vnd.dolby.mlp\":{\"source\":\"iana\"},\"audio/vnd.dolby.mps\":{\"source\":\"iana\"},\"audio/vnd.dolby.pl2\":{\"source\":\"iana\"},\"audio/vnd.dolby.pl2x\":{\"source\":\"iana\"},\"audio/vnd.dolby.pl2z\":{\"source\":\"iana\"},\"audio/vnd.dolby.pulse.1\":{\"source\":\"iana\"},\"audio/vnd.dra\":{\"source\":\"iana\",\"extensions\":[\"dra\"]},\"audio/vnd.dts\":{\"source\":\"iana\",\"extensions\":[\"dts\"]},\"audio/vnd.dts.hd\":{\"source\":\"iana\",\"extensions\":[\"dtshd\"]},\"audio/vnd.dts.uhd\":{\"source\":\"iana\"},\"audio/vnd.dvb.file\":{\"source\":\"iana\"},\"audio/vnd.everad.plj\":{\"source\":\"iana\"},\"audio/vnd.hns.audio\":{\"source\":\"iana\"},\"audio/vnd.lucent.voice\":{\"source\":\"iana\",\"extensions\":[\"lvp\"]},\"audio/vnd.ms-playready.media.pya\":{\"source\":\"iana\",\"extensions\":[\"pya\"]},\"audio/vnd.nokia.mobile-xmf\":{\"source\":\"iana\"},\"audio/vnd.nortel.vbk\":{\"source\":\"iana\"},\"audio/vnd.nuera.ecelp4800\":{\"source\":\"iana\",\"extensions\":[\"ecelp4800\"]},\"audio/vnd.nuera.ecelp7470\":{\"source\":\"iana\",\"extensions\":[\"ecelp7470\"]},\"audio/vnd.nuera.ecelp9600\":{\"source\":\"iana\",\"extensions\":[\"ecelp9600\"]},\"audio/vnd.octel.sbc\":{\"source\":\"iana\"},\"audio/vnd.presonus.multitrack\":{\"source\":\"iana\"},\"audio/vnd.qcelp\":{\"source\":\"iana\"},\"audio/vnd.rhetorex.32kadpcm\":{\"source\":\"iana\"},\"audio/vnd.rip\":{\"source\":\"iana\",\"extensions\":[\"rip\"]},\"audio/vnd.rn-realaudio\":{\"compressible\":false},\"audio/vnd.sealedmedia.softseal.mpeg\":{\"source\":\"iana\"},\"audio/vnd.vmx.cvsd\":{\"source\":\"iana\"},\"audio/vnd.wave\":{\"compressible\":false},\"audio/vorbis\":{\"source\":\"iana\",\"compressible\":false},\"audio/vorbis-config\":{\"source\":\"iana\"},\"audio/wav\":{\"compressible\":false,\"extensions\":[\"wav\"]},\"audio/wave\":{\"compressible\":false,\"extensions\":[\"wav\"]},\"audio/webm\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"weba\"]},\"audio/x-aac\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"aac\"]},\"audio/x-aiff\":{\"source\":\"apache\",\"extensions\":[\"aif\",\"aiff\",\"aifc\"]},\"audio/x-caf\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"caf\"]},\"audio/x-flac\":{\"source\":\"apache\",\"extensions\":[\"flac\"]},\"audio/x-m4a\":{\"source\":\"nginx\",\"extensions\":[\"m4a\"]},\"audio/x-matroska\":{\"source\":\"apache\",\"extensions\":[\"mka\"]},\"audio/x-mpegurl\":{\"source\":\"apache\",\"extensions\":[\"m3u\"]},\"audio/x-ms-wax\":{\"source\":\"apache\",\"extensions\":[\"wax\"]},\"audio/x-ms-wma\":{\"source\":\"apache\",\"extensions\":[\"wma\"]},\"audio/x-pn-realaudio\":{\"source\":\"apache\",\"extensions\":[\"ram\",\"ra\"]},\"audio/x-pn-realaudio-plugin\":{\"source\":\"apache\",\"extensions\":[\"rmp\"]},\"audio/x-realaudio\":{\"source\":\"nginx\",\"extensions\":[\"ra\"]},\"audio/x-tta\":{\"source\":\"apache\"},\"audio/x-wav\":{\"source\":\"apache\",\"extensions\":[\"wav\"]},\"audio/xm\":{\"source\":\"apache\",\"extensions\":[\"xm\"]},\"chemical/x-cdx\":{\"source\":\"apache\",\"extensions\":[\"cdx\"]},\"chemical/x-cif\":{\"source\":\"apache\",\"extensions\":[\"cif\"]},\"chemical/x-cmdf\":{\"source\":\"apache\",\"extensions\":[\"cmdf\"]},\"chemical/x-cml\":{\"source\":\"apache\",\"extensions\":[\"cml\"]},\"chemical/x-csml\":{\"source\":\"apache\",\"extensions\":[\"csml\"]},\"chemical/x-pdb\":{\"source\":\"apache\"},\"chemical/x-xyz\":{\"source\":\"apache\",\"extensions\":[\"xyz\"]},\"font/collection\":{\"source\":\"iana\",\"extensions\":[\"ttc\"]},\"font/otf\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"otf\"]},\"font/sfnt\":{\"source\":\"iana\"},\"font/ttf\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"ttf\"]},\"font/woff\":{\"source\":\"iana\",\"extensions\":[\"woff\"]},\"font/woff2\":{\"source\":\"iana\",\"extensions\":[\"woff2\"]},\"image/aces\":{\"source\":\"iana\",\"extensions\":[\"exr\"]},\"image/apng\":{\"compressible\":false,\"extensions\":[\"apng\"]},\"image/avci\":{\"source\":\"iana\"},\"image/avcs\":{\"source\":\"iana\"},\"image/bmp\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"bmp\"]},\"image/cgm\":{\"source\":\"iana\",\"extensions\":[\"cgm\"]},\"image/dicom-rle\":{\"source\":\"iana\",\"extensions\":[\"drle\"]},\"image/emf\":{\"source\":\"iana\",\"extensions\":[\"emf\"]},\"image/fits\":{\"source\":\"iana\",\"extensions\":[\"fits\"]},\"image/g3fax\":{\"source\":\"iana\",\"extensions\":[\"g3\"]},\"image/gif\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"gif\"]},\"image/heic\":{\"source\":\"iana\",\"extensions\":[\"heic\"]},\"image/heic-sequence\":{\"source\":\"iana\",\"extensions\":[\"heics\"]},\"image/heif\":{\"source\":\"iana\",\"extensions\":[\"heif\"]},\"image/heif-sequence\":{\"source\":\"iana\",\"extensions\":[\"heifs\"]},\"image/hej2k\":{\"source\":\"iana\",\"extensions\":[\"hej2\"]},\"image/hsj2\":{\"source\":\"iana\",\"extensions\":[\"hsj2\"]},\"image/ief\":{\"source\":\"iana\",\"extensions\":[\"ief\"]},\"image/jls\":{\"source\":\"iana\",\"extensions\":[\"jls\"]},\"image/jp2\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"jp2\",\"jpg2\"]},\"image/jpeg\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"jpeg\",\"jpg\",\"jpe\"]},\"image/jph\":{\"source\":\"iana\",\"extensions\":[\"jph\"]},\"image/jphc\":{\"source\":\"iana\",\"extensions\":[\"jhc\"]},\"image/jpm\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"jpm\"]},\"image/jpx\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"jpx\",\"jpf\"]},\"image/jxr\":{\"source\":\"iana\",\"extensions\":[\"jxr\"]},\"image/jxra\":{\"source\":\"iana\",\"extensions\":[\"jxra\"]},\"image/jxrs\":{\"source\":\"iana\",\"extensions\":[\"jxrs\"]},\"image/jxs\":{\"source\":\"iana\",\"extensions\":[\"jxs\"]},\"image/jxsc\":{\"source\":\"iana\",\"extensions\":[\"jxsc\"]},\"image/jxsi\":{\"source\":\"iana\",\"extensions\":[\"jxsi\"]},\"image/jxss\":{\"source\":\"iana\",\"extensions\":[\"jxss\"]},\"image/ktx\":{\"source\":\"iana\",\"extensions\":[\"ktx\"]},\"image/naplps\":{\"source\":\"iana\"},\"image/pjpeg\":{\"compressible\":false},\"image/png\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"png\"]},\"image/prs.btif\":{\"source\":\"iana\",\"extensions\":[\"btif\"]},\"image/prs.pti\":{\"source\":\"iana\",\"extensions\":[\"pti\"]},\"image/pwg-raster\":{\"source\":\"iana\"},\"image/sgi\":{\"source\":\"apache\",\"extensions\":[\"sgi\"]},\"image/svg+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"svg\",\"svgz\"]},\"image/t38\":{\"source\":\"iana\",\"extensions\":[\"t38\"]},\"image/tiff\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"tif\",\"tiff\"]},\"image/tiff-fx\":{\"source\":\"iana\",\"extensions\":[\"tfx\"]},\"image/vnd.adobe.photoshop\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"psd\"]},\"image/vnd.airzip.accelerator.azv\":{\"source\":\"iana\",\"extensions\":[\"azv\"]},\"image/vnd.cns.inf2\":{\"source\":\"iana\"},\"image/vnd.dece.graphic\":{\"source\":\"iana\",\"extensions\":[\"uvi\",\"uvvi\",\"uvg\",\"uvvg\"]},\"image/vnd.djvu\":{\"source\":\"iana\",\"extensions\":[\"djvu\",\"djv\"]},\"image/vnd.dvb.subtitle\":{\"source\":\"iana\",\"extensions\":[\"sub\"]},\"image/vnd.dwg\":{\"source\":\"iana\",\"extensions\":[\"dwg\"]},\"image/vnd.dxf\":{\"source\":\"iana\",\"extensions\":[\"dxf\"]},\"image/vnd.fastbidsheet\":{\"source\":\"iana\",\"extensions\":[\"fbs\"]},\"image/vnd.fpx\":{\"source\":\"iana\",\"extensions\":[\"fpx\"]},\"image/vnd.fst\":{\"source\":\"iana\",\"extensions\":[\"fst\"]},\"image/vnd.fujixerox.edmics-mmr\":{\"source\":\"iana\",\"extensions\":[\"mmr\"]},\"image/vnd.fujixerox.edmics-rlc\":{\"source\":\"iana\",\"extensions\":[\"rlc\"]},\"image/vnd.globalgraphics.pgb\":{\"source\":\"iana\"},\"image/vnd.microsoft.icon\":{\"source\":\"iana\",\"extensions\":[\"ico\"]},\"image/vnd.mix\":{\"source\":\"iana\"},\"image/vnd.mozilla.apng\":{\"source\":\"iana\"},\"image/vnd.ms-dds\":{\"extensions\":[\"dds\"]},\"image/vnd.ms-modi\":{\"source\":\"iana\",\"extensions\":[\"mdi\"]},\"image/vnd.ms-photo\":{\"source\":\"apache\",\"extensions\":[\"wdp\"]},\"image/vnd.net-fpx\":{\"source\":\"iana\",\"extensions\":[\"npx\"]},\"image/vnd.radiance\":{\"source\":\"iana\"},\"image/vnd.sealed.png\":{\"source\":\"iana\"},\"image/vnd.sealedmedia.softseal.gif\":{\"source\":\"iana\"},\"image/vnd.sealedmedia.softseal.jpg\":{\"source\":\"iana\"},\"image/vnd.svf\":{\"source\":\"iana\"},\"image/vnd.tencent.tap\":{\"source\":\"iana\",\"extensions\":[\"tap\"]},\"image/vnd.valve.source.texture\":{\"source\":\"iana\",\"extensions\":[\"vtf\"]},\"image/vnd.wap.wbmp\":{\"source\":\"iana\",\"extensions\":[\"wbmp\"]},\"image/vnd.xiff\":{\"source\":\"iana\",\"extensions\":[\"xif\"]},\"image/vnd.zbrush.pcx\":{\"source\":\"iana\",\"extensions\":[\"pcx\"]},\"image/webp\":{\"source\":\"apache\",\"extensions\":[\"webp\"]},\"image/wmf\":{\"source\":\"iana\",\"extensions\":[\"wmf\"]},\"image/x-3ds\":{\"source\":\"apache\",\"extensions\":[\"3ds\"]},\"image/x-cmu-raster\":{\"source\":\"apache\",\"extensions\":[\"ras\"]},\"image/x-cmx\":{\"source\":\"apache\",\"extensions\":[\"cmx\"]},\"image/x-freehand\":{\"source\":\"apache\",\"extensions\":[\"fh\",\"fhc\",\"fh4\",\"fh5\",\"fh7\"]},\"image/x-icon\":{\"source\":\"apache\",\"compressible\":true,\"extensions\":[\"ico\"]},\"image/x-jng\":{\"source\":\"nginx\",\"extensions\":[\"jng\"]},\"image/x-mrsid-image\":{\"source\":\"apache\",\"extensions\":[\"sid\"]},\"image/x-ms-bmp\":{\"source\":\"nginx\",\"compressible\":true,\"extensions\":[\"bmp\"]},\"image/x-pcx\":{\"source\":\"apache\",\"extensions\":[\"pcx\"]},\"image/x-pict\":{\"source\":\"apache\",\"extensions\":[\"pic\",\"pct\"]},\"image/x-portable-anymap\":{\"source\":\"apache\",\"extensions\":[\"pnm\"]},\"image/x-portable-bitmap\":{\"source\":\"apache\",\"extensions\":[\"pbm\"]},\"image/x-portable-graymap\":{\"source\":\"apache\",\"extensions\":[\"pgm\"]},\"image/x-portable-pixmap\":{\"source\":\"apache\",\"extensions\":[\"ppm\"]},\"image/x-rgb\":{\"source\":\"apache\",\"extensions\":[\"rgb\"]},\"image/x-tga\":{\"source\":\"apache\",\"extensions\":[\"tga\"]},\"image/x-xbitmap\":{\"source\":\"apache\",\"extensions\":[\"xbm\"]},\"image/x-xcf\":{\"compressible\":false},\"image/x-xpixmap\":{\"source\":\"apache\",\"extensions\":[\"xpm\"]},\"image/x-xwindowdump\":{\"source\":\"apache\",\"extensions\":[\"xwd\"]},\"message/cpim\":{\"source\":\"iana\"},\"message/delivery-status\":{\"source\":\"iana\"},\"message/disposition-notification\":{\"source\":\"iana\",\"extensions\":[\"disposition-notification\"]},\"message/external-body\":{\"source\":\"iana\"},\"message/feedback-report\":{\"source\":\"iana\"},\"message/global\":{\"source\":\"iana\",\"extensions\":[\"u8msg\"]},\"message/global-delivery-status\":{\"source\":\"iana\",\"extensions\":[\"u8dsn\"]},\"message/global-disposition-notification\":{\"source\":\"iana\",\"extensions\":[\"u8mdn\"]},\"message/global-headers\":{\"source\":\"iana\",\"extensions\":[\"u8hdr\"]},\"message/http\":{\"source\":\"iana\",\"compressible\":false},\"message/imdn+xml\":{\"source\":\"iana\",\"compressible\":true},\"message/news\":{\"source\":\"iana\"},\"message/partial\":{\"source\":\"iana\",\"compressible\":false},\"message/rfc822\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"eml\",\"mime\"]},\"message/s-http\":{\"source\":\"iana\"},\"message/sip\":{\"source\":\"iana\"},\"message/sipfrag\":{\"source\":\"iana\"},\"message/tracking-status\":{\"source\":\"iana\"},\"message/vnd.si.simp\":{\"source\":\"iana\"},\"message/vnd.wfa.wsc\":{\"source\":\"iana\",\"extensions\":[\"wsc\"]},\"model/3mf\":{\"source\":\"iana\",\"extensions\":[\"3mf\"]},\"model/gltf+json\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"gltf\"]},\"model/gltf-binary\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"glb\"]},\"model/iges\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"igs\",\"iges\"]},\"model/mesh\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"msh\",\"mesh\",\"silo\"]},\"model/mtl\":{\"source\":\"iana\",\"extensions\":[\"mtl\"]},\"model/obj\":{\"source\":\"iana\",\"extensions\":[\"obj\"]},\"model/stl\":{\"source\":\"iana\",\"extensions\":[\"stl\"]},\"model/vnd.collada+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"dae\"]},\"model/vnd.dwf\":{\"source\":\"iana\",\"extensions\":[\"dwf\"]},\"model/vnd.flatland.3dml\":{\"source\":\"iana\"},\"model/vnd.gdl\":{\"source\":\"iana\",\"extensions\":[\"gdl\"]},\"model/vnd.gs-gdl\":{\"source\":\"apache\"},\"model/vnd.gs.gdl\":{\"source\":\"iana\"},\"model/vnd.gtw\":{\"source\":\"iana\",\"extensions\":[\"gtw\"]},\"model/vnd.moml+xml\":{\"source\":\"iana\",\"compressible\":true},\"model/vnd.mts\":{\"source\":\"iana\",\"extensions\":[\"mts\"]},\"model/vnd.opengex\":{\"source\":\"iana\",\"extensions\":[\"ogex\"]},\"model/vnd.parasolid.transmit.binary\":{\"source\":\"iana\",\"extensions\":[\"x_b\"]},\"model/vnd.parasolid.transmit.text\":{\"source\":\"iana\",\"extensions\":[\"x_t\"]},\"model/vnd.rosette.annotated-data-model\":{\"source\":\"iana\"},\"model/vnd.usdz+zip\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"usdz\"]},\"model/vnd.valve.source.compiled-map\":{\"source\":\"iana\",\"extensions\":[\"bsp\"]},\"model/vnd.vtu\":{\"source\":\"iana\",\"extensions\":[\"vtu\"]},\"model/vrml\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"wrl\",\"vrml\"]},\"model/x3d+binary\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"x3db\",\"x3dbz\"]},\"model/x3d+fastinfoset\":{\"source\":\"iana\",\"extensions\":[\"x3db\"]},\"model/x3d+vrml\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"x3dv\",\"x3dvz\"]},\"model/x3d+xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"x3d\",\"x3dz\"]},\"model/x3d-vrml\":{\"source\":\"iana\",\"extensions\":[\"x3dv\"]},\"multipart/alternative\":{\"source\":\"iana\",\"compressible\":false},\"multipart/appledouble\":{\"source\":\"iana\"},\"multipart/byteranges\":{\"source\":\"iana\"},\"multipart/digest\":{\"source\":\"iana\"},\"multipart/encrypted\":{\"source\":\"iana\",\"compressible\":false},\"multipart/form-data\":{\"source\":\"iana\",\"compressible\":false},\"multipart/header-set\":{\"source\":\"iana\"},\"multipart/mixed\":{\"source\":\"iana\"},\"multipart/multilingual\":{\"source\":\"iana\"},\"multipart/parallel\":{\"source\":\"iana\"},\"multipart/related\":{\"source\":\"iana\",\"compressible\":false},\"multipart/report\":{\"source\":\"iana\"},\"multipart/signed\":{\"source\":\"iana\",\"compressible\":false},\"multipart/vnd.bint.med-plus\":{\"source\":\"iana\"},\"multipart/voice-message\":{\"source\":\"iana\"},\"multipart/x-mixed-replace\":{\"source\":\"iana\"},\"text/1d-interleaved-parityfec\":{\"source\":\"iana\"},\"text/cache-manifest\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"appcache\",\"manifest\"]},\"text/calendar\":{\"source\":\"iana\",\"extensions\":[\"ics\",\"ifb\"]},\"text/calender\":{\"compressible\":true},\"text/cmd\":{\"compressible\":true},\"text/coffeescript\":{\"extensions\":[\"coffee\",\"litcoffee\"]},\"text/css\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true,\"extensions\":[\"css\"]},\"text/csv\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"csv\"]},\"text/csv-schema\":{\"source\":\"iana\"},\"text/directory\":{\"source\":\"iana\"},\"text/dns\":{\"source\":\"iana\"},\"text/ecmascript\":{\"source\":\"iana\"},\"text/encaprtp\":{\"source\":\"iana\"},\"text/enriched\":{\"source\":\"iana\"},\"text/flexfec\":{\"source\":\"iana\"},\"text/fwdred\":{\"source\":\"iana\"},\"text/grammar-ref-list\":{\"source\":\"iana\"},\"text/html\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"html\",\"htm\",\"shtml\"]},\"text/jade\":{\"extensions\":[\"jade\"]},\"text/javascript\":{\"source\":\"iana\",\"compressible\":true},\"text/jcr-cnd\":{\"source\":\"iana\"},\"text/jsx\":{\"compressible\":true,\"extensions\":[\"jsx\"]},\"text/less\":{\"compressible\":true,\"extensions\":[\"less\"]},\"text/markdown\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"markdown\",\"md\"]},\"text/mathml\":{\"source\":\"nginx\",\"extensions\":[\"mml\"]},\"text/mdx\":{\"compressible\":true,\"extensions\":[\"mdx\"]},\"text/mizar\":{\"source\":\"iana\"},\"text/n3\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true,\"extensions\":[\"n3\"]},\"text/parameters\":{\"source\":\"iana\",\"charset\":\"UTF-8\"},\"text/parityfec\":{\"source\":\"iana\"},\"text/plain\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"txt\",\"text\",\"conf\",\"def\",\"list\",\"log\",\"in\",\"ini\"]},\"text/provenance-notation\":{\"source\":\"iana\",\"charset\":\"UTF-8\"},\"text/prs.fallenstein.rst\":{\"source\":\"iana\"},\"text/prs.lines.tag\":{\"source\":\"iana\",\"extensions\":[\"dsc\"]},\"text/prs.prop.logic\":{\"source\":\"iana\"},\"text/raptorfec\":{\"source\":\"iana\"},\"text/red\":{\"source\":\"iana\"},\"text/rfc822-headers\":{\"source\":\"iana\"},\"text/richtext\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rtx\"]},\"text/rtf\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"rtf\"]},\"text/rtp-enc-aescm128\":{\"source\":\"iana\"},\"text/rtploopback\":{\"source\":\"iana\"},\"text/rtx\":{\"source\":\"iana\"},\"text/sgml\":{\"source\":\"iana\",\"extensions\":[\"sgml\",\"sgm\"]},\"text/shex\":{\"extensions\":[\"shex\"]},\"text/slim\":{\"extensions\":[\"slim\",\"slm\"]},\"text/strings\":{\"source\":\"iana\"},\"text/stylus\":{\"extensions\":[\"stylus\",\"styl\"]},\"text/t140\":{\"source\":\"iana\"},\"text/tab-separated-values\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"tsv\"]},\"text/troff\":{\"source\":\"iana\",\"extensions\":[\"t\",\"tr\",\"roff\",\"man\",\"me\",\"ms\"]},\"text/turtle\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"extensions\":[\"ttl\"]},\"text/ulpfec\":{\"source\":\"iana\"},\"text/uri-list\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"uri\",\"uris\",\"urls\"]},\"text/vcard\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"vcard\"]},\"text/vnd.a\":{\"source\":\"iana\"},\"text/vnd.abc\":{\"source\":\"iana\"},\"text/vnd.ascii-art\":{\"source\":\"iana\"},\"text/vnd.curl\":{\"source\":\"iana\",\"extensions\":[\"curl\"]},\"text/vnd.curl.dcurl\":{\"source\":\"apache\",\"extensions\":[\"dcurl\"]},\"text/vnd.curl.mcurl\":{\"source\":\"apache\",\"extensions\":[\"mcurl\"]},\"text/vnd.curl.scurl\":{\"source\":\"apache\",\"extensions\":[\"scurl\"]},\"text/vnd.debian.copyright\":{\"source\":\"iana\",\"charset\":\"UTF-8\"},\"text/vnd.dmclientscript\":{\"source\":\"iana\"},\"text/vnd.dvb.subtitle\":{\"source\":\"iana\",\"extensions\":[\"sub\"]},\"text/vnd.esmertec.theme-descriptor\":{\"source\":\"iana\",\"charset\":\"UTF-8\"},\"text/vnd.ficlab.flt\":{\"source\":\"iana\"},\"text/vnd.fly\":{\"source\":\"iana\",\"extensions\":[\"fly\"]},\"text/vnd.fmi.flexstor\":{\"source\":\"iana\",\"extensions\":[\"flx\"]},\"text/vnd.gml\":{\"source\":\"iana\"},\"text/vnd.graphviz\":{\"source\":\"iana\",\"extensions\":[\"gv\"]},\"text/vnd.hgl\":{\"source\":\"iana\"},\"text/vnd.in3d.3dml\":{\"source\":\"iana\",\"extensions\":[\"3dml\"]},\"text/vnd.in3d.spot\":{\"source\":\"iana\",\"extensions\":[\"spot\"]},\"text/vnd.iptc.newsml\":{\"source\":\"iana\"},\"text/vnd.iptc.nitf\":{\"source\":\"iana\"},\"text/vnd.latex-z\":{\"source\":\"iana\"},\"text/vnd.motorola.reflex\":{\"source\":\"iana\"},\"text/vnd.ms-mediapackage\":{\"source\":\"iana\"},\"text/vnd.net2phone.commcenter.command\":{\"source\":\"iana\"},\"text/vnd.radisys.msml-basic-layout\":{\"source\":\"iana\"},\"text/vnd.senx.warpscript\":{\"source\":\"iana\"},\"text/vnd.si.uricatalogue\":{\"source\":\"iana\"},\"text/vnd.sosi\":{\"source\":\"iana\"},\"text/vnd.sun.j2me.app-descriptor\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"extensions\":[\"jad\"]},\"text/vnd.trolltech.linguist\":{\"source\":\"iana\",\"charset\":\"UTF-8\"},\"text/vnd.wap.si\":{\"source\":\"iana\"},\"text/vnd.wap.sl\":{\"source\":\"iana\"},\"text/vnd.wap.wml\":{\"source\":\"iana\",\"extensions\":[\"wml\"]},\"text/vnd.wap.wmlscript\":{\"source\":\"iana\",\"extensions\":[\"wmls\"]},\"text/vtt\":{\"source\":\"iana\",\"charset\":\"UTF-8\",\"compressible\":true,\"extensions\":[\"vtt\"]},\"text/x-asm\":{\"source\":\"apache\",\"extensions\":[\"s\",\"asm\"]},\"text/x-c\":{\"source\":\"apache\",\"extensions\":[\"c\",\"cc\",\"cxx\",\"cpp\",\"h\",\"hh\",\"dic\"]},\"text/x-component\":{\"source\":\"nginx\",\"extensions\":[\"htc\"]},\"text/x-fortran\":{\"source\":\"apache\",\"extensions\":[\"f\",\"for\",\"f77\",\"f90\"]},\"text/x-gwt-rpc\":{\"compressible\":true},\"text/x-handlebars-template\":{\"extensions\":[\"hbs\"]},\"text/x-java-source\":{\"source\":\"apache\",\"extensions\":[\"java\"]},\"text/x-jquery-tmpl\":{\"compressible\":true},\"text/x-lua\":{\"extensions\":[\"lua\"]},\"text/x-markdown\":{\"compressible\":true,\"extensions\":[\"mkd\"]},\"text/x-nfo\":{\"source\":\"apache\",\"extensions\":[\"nfo\"]},\"text/x-opml\":{\"source\":\"apache\",\"extensions\":[\"opml\"]},\"text/x-org\":{\"compressible\":true,\"extensions\":[\"org\"]},\"text/x-pascal\":{\"source\":\"apache\",\"extensions\":[\"p\",\"pas\"]},\"text/x-processing\":{\"compressible\":true,\"extensions\":[\"pde\"]},\"text/x-sass\":{\"extensions\":[\"sass\"]},\"text/x-scss\":{\"extensions\":[\"scss\"]},\"text/x-setext\":{\"source\":\"apache\",\"extensions\":[\"etx\"]},\"text/x-sfv\":{\"source\":\"apache\",\"extensions\":[\"sfv\"]},\"text/x-suse-ymp\":{\"compressible\":true,\"extensions\":[\"ymp\"]},\"text/x-uuencode\":{\"source\":\"apache\",\"extensions\":[\"uu\"]},\"text/x-vcalendar\":{\"source\":\"apache\",\"extensions\":[\"vcs\"]},\"text/x-vcard\":{\"source\":\"apache\",\"extensions\":[\"vcf\"]},\"text/xml\":{\"source\":\"iana\",\"compressible\":true,\"extensions\":[\"xml\"]},\"text/xml-external-parsed-entity\":{\"source\":\"iana\"},\"text/yaml\":{\"extensions\":[\"yaml\",\"yml\"]},\"video/1d-interleaved-parityfec\":{\"source\":\"iana\"},\"video/3gpp\":{\"source\":\"iana\",\"extensions\":[\"3gp\",\"3gpp\"]},\"video/3gpp-tt\":{\"source\":\"iana\"},\"video/3gpp2\":{\"source\":\"iana\",\"extensions\":[\"3g2\"]},\"video/bmpeg\":{\"source\":\"iana\"},\"video/bt656\":{\"source\":\"iana\"},\"video/celb\":{\"source\":\"iana\"},\"video/dv\":{\"source\":\"iana\"},\"video/encaprtp\":{\"source\":\"iana\"},\"video/flexfec\":{\"source\":\"iana\"},\"video/h261\":{\"source\":\"iana\",\"extensions\":[\"h261\"]},\"video/h263\":{\"source\":\"iana\",\"extensions\":[\"h263\"]},\"video/h263-1998\":{\"source\":\"iana\"},\"video/h263-2000\":{\"source\":\"iana\"},\"video/h264\":{\"source\":\"iana\",\"extensions\":[\"h264\"]},\"video/h264-rcdo\":{\"source\":\"iana\"},\"video/h264-svc\":{\"source\":\"iana\"},\"video/h265\":{\"source\":\"iana\"},\"video/iso.segment\":{\"source\":\"iana\"},\"video/jpeg\":{\"source\":\"iana\",\"extensions\":[\"jpgv\"]},\"video/jpeg2000\":{\"source\":\"iana\"},\"video/jpm\":{\"source\":\"apache\",\"extensions\":[\"jpm\",\"jpgm\"]},\"video/mj2\":{\"source\":\"iana\",\"extensions\":[\"mj2\",\"mjp2\"]},\"video/mp1s\":{\"source\":\"iana\"},\"video/mp2p\":{\"source\":\"iana\"},\"video/mp2t\":{\"source\":\"iana\",\"extensions\":[\"ts\"]},\"video/mp4\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"mp4\",\"mp4v\",\"mpg4\"]},\"video/mp4v-es\":{\"source\":\"iana\"},\"video/mpeg\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"mpeg\",\"mpg\",\"mpe\",\"m1v\",\"m2v\"]},\"video/mpeg4-generic\":{\"source\":\"iana\"},\"video/mpv\":{\"source\":\"iana\"},\"video/nv\":{\"source\":\"iana\"},\"video/ogg\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"ogv\"]},\"video/parityfec\":{\"source\":\"iana\"},\"video/pointer\":{\"source\":\"iana\"},\"video/quicktime\":{\"source\":\"iana\",\"compressible\":false,\"extensions\":[\"qt\",\"mov\"]},\"video/raptorfec\":{\"source\":\"iana\"},\"video/raw\":{\"source\":\"iana\"},\"video/rtp-enc-aescm128\":{\"source\":\"iana\"},\"video/rtploopback\":{\"source\":\"iana\"},\"video/rtx\":{\"source\":\"iana\"},\"video/smpte291\":{\"source\":\"iana\"},\"video/smpte292m\":{\"source\":\"iana\"},\"video/ulpfec\":{\"source\":\"iana\"},\"video/vc1\":{\"source\":\"iana\"},\"video/vc2\":{\"source\":\"iana\"},\"video/vnd.cctv\":{\"source\":\"iana\"},\"video/vnd.dece.hd\":{\"source\":\"iana\",\"extensions\":[\"uvh\",\"uvvh\"]},\"video/vnd.dece.mobile\":{\"source\":\"iana\",\"extensions\":[\"uvm\",\"uvvm\"]},\"video/vnd.dece.mp4\":{\"source\":\"iana\"},\"video/vnd.dece.pd\":{\"source\":\"iana\",\"extensions\":[\"uvp\",\"uvvp\"]},\"video/vnd.dece.sd\":{\"source\":\"iana\",\"extensions\":[\"uvs\",\"uvvs\"]},\"video/vnd.dece.video\":{\"source\":\"iana\",\"extensions\":[\"uvv\",\"uvvv\"]},\"video/vnd.directv.mpeg\":{\"source\":\"iana\"},\"video/vnd.directv.mpeg-tts\":{\"source\":\"iana\"},\"video/vnd.dlna.mpeg-tts\":{\"source\":\"iana\"},\"video/vnd.dvb.file\":{\"source\":\"iana\",\"extensions\":[\"dvb\"]},\"video/vnd.fvt\":{\"source\":\"iana\",\"extensions\":[\"fvt\"]},\"video/vnd.hns.video\":{\"source\":\"iana\"},\"video/vnd.iptvforum.1dparityfec-1010\":{\"source\":\"iana\"},\"video/vnd.iptvforum.1dparityfec-2005\":{\"source\":\"iana\"},\"video/vnd.iptvforum.2dparityfec-1010\":{\"source\":\"iana\"},\"video/vnd.iptvforum.2dparityfec-2005\":{\"source\":\"iana\"},\"video/vnd.iptvforum.ttsavc\":{\"source\":\"iana\"},\"video/vnd.iptvforum.ttsmpeg2\":{\"source\":\"iana\"},\"video/vnd.motorola.video\":{\"source\":\"iana\"},\"video/vnd.motorola.videop\":{\"source\":\"iana\"},\"video/vnd.mpegurl\":{\"source\":\"iana\",\"extensions\":[\"mxu\",\"m4u\"]},\"video/vnd.ms-playready.media.pyv\":{\"source\":\"iana\",\"extensions\":[\"pyv\"]},\"video/vnd.nokia.interleaved-multimedia\":{\"source\":\"iana\"},\"video/vnd.nokia.mp4vr\":{\"source\":\"iana\"},\"video/vnd.nokia.videovoip\":{\"source\":\"iana\"},\"video/vnd.objectvideo\":{\"source\":\"iana\"},\"video/vnd.radgamettools.bink\":{\"source\":\"iana\"},\"video/vnd.radgamettools.smacker\":{\"source\":\"iana\"},\"video/vnd.sealed.mpeg1\":{\"source\":\"iana\"},\"video/vnd.sealed.mpeg4\":{\"source\":\"iana\"},\"video/vnd.sealed.swf\":{\"source\":\"iana\"},\"video/vnd.sealedmedia.softseal.mov\":{\"source\":\"iana\"},\"video/vnd.uvvu.mp4\":{\"source\":\"iana\",\"extensions\":[\"uvu\",\"uvvu\"]},\"video/vnd.vivo\":{\"source\":\"iana\",\"extensions\":[\"viv\"]},\"video/vnd.youtube.yt\":{\"source\":\"iana\"},\"video/vp8\":{\"source\":\"iana\"},\"video/webm\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"webm\"]},\"video/x-f4v\":{\"source\":\"apache\",\"extensions\":[\"f4v\"]},\"video/x-fli\":{\"source\":\"apache\",\"extensions\":[\"fli\"]},\"video/x-flv\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"flv\"]},\"video/x-m4v\":{\"source\":\"apache\",\"extensions\":[\"m4v\"]},\"video/x-matroska\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"mkv\",\"mk3d\",\"mks\"]},\"video/x-mng\":{\"source\":\"apache\",\"extensions\":[\"mng\"]},\"video/x-ms-asf\":{\"source\":\"apache\",\"extensions\":[\"asf\",\"asx\"]},\"video/x-ms-vob\":{\"source\":\"apache\",\"extensions\":[\"vob\"]},\"video/x-ms-wm\":{\"source\":\"apache\",\"extensions\":[\"wm\"]},\"video/x-ms-wmv\":{\"source\":\"apache\",\"compressible\":false,\"extensions\":[\"wmv\"]},\"video/x-ms-wmx\":{\"source\":\"apache\",\"extensions\":[\"wmx\"]},\"video/x-ms-wvx\":{\"source\":\"apache\",\"extensions\":[\"wvx\"]},\"video/x-msvideo\":{\"source\":\"apache\",\"extensions\":[\"avi\"]},\"video/x-sgi-movie\":{\"source\":\"apache\",\"extensions\":[\"movie\"]},\"video/x-smv\":{\"source\":\"apache\",\"extensions\":[\"smv\"]},\"x-conference/x-cooltalk\":{\"source\":\"apache\",\"extensions\":[\"ice\"]},\"x-shader/x-fragment\":{\"compressible\":true},\"x-shader/x-vertex\":{\"compressible\":true}}");

/***/ }),

/***/ 5747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 8605:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 7211:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 2087:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 5622:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 2413:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 8835:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 1669:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 8761:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(4822);
/******/ })()
;
//# sourceMappingURL=index.js.map