(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var _ = Package.underscore._;
var meteorInstall = Package['modules-runtime'].meteorInstall;

/* Package-scope variables */
var Buffer, process, exports;

var require = meteorInstall({"node_modules":{"meteor":{"modules":{"server.js":["./install-packages.js","./buffer.js","./process.js","reify/lib/runtime",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/modules/server.js                                                                                     //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
require("./install-packages.js");
require("./buffer.js");
require("./process.js");
require("reify/lib/runtime").enable(module.constructor);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"buffer.js":["buffer",function(require){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/modules/buffer.js                                                                                     //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
try {
  Buffer = global.Buffer || require("buffer").Buffer;
} catch (noBuffer) {}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"install-packages.js":function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/modules/install-packages.js                                                                           //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
function install(name, mainModule) {
  var meteorDir = {};

  // Given a package name <name>, install a stub module in the
  // /node_modules/meteor directory called <name>.js, so that
  // require.resolve("meteor/<name>") will always return
  // /node_modules/meteor/<name>.js instead of something like
  // /node_modules/meteor/<name>/index.js, in the rare but possible event
  // that the package contains a file called index.js (#6590).

  if (mainModule) {
    meteorDir[name + ".js"] = [mainModule, function (require, e, module) {
      module.exports = require(mainModule);
    }];
  } else {
    // back compat with old Meteor packages
    meteorDir[name + ".js"] = function (r, e, module) {
      module.exports = Package[name];
    };
  }

  meteorInstall({
    node_modules: {
      meteor: meteorDir
    }
  });
}

// This file will be modified during computeJsOutputFilesMap to include
// install(<name>) calls for every Meteor package.

install("underscore");
install("meteor");
install("insecure");
install("bdunnette:leaflet-draw");
install("twbs:bootstrap");
install("npm-mongo");
install("modules-runtime");
install("modules", "meteor/modules/server.js");
install("promise", "meteor/promise/server.js");
install("ecmascript-runtime", "meteor/ecmascript-runtime/runtime.js");
install("babel-compiler");
install("ecmascript");
install("base64");
install("ejson");
install("id-map");
install("ordered-dict");
install("tracker");
install("babel-runtime");
install("random");
install("mongo-id");
install("diff-sequence");
install("geojson-utils", "meteor/geojson-utils/main.js");
install("minimongo");
install("check", "meteor/check/match.js");
install("retry");
install("ddp-common");
install("ddp-client");
install("rate-limit");
install("ddp-rate-limiter");
install("logging");
install("routepolicy");
install("deps");
install("htmljs");
install("html-tools");
install("blaze-tools");
install("spacebars-compiler");
install("observe-sequence");
install("jquery");
install("reactive-var");
install("blaze");
install("spacebars");
install("ui");
install("boilerplate-generator");
install("webapp-hashing");
install("webapp");
install("callback-hook");
install("ddp-server");
install("ddp");
install("allow-deny");
install("binary-heap");
install("mongo");
install("accounts-base", "meteor/accounts-base/server_main.js");
install("matb33:collection-hooks");
install("artwells:queue");
install("zhenya:forkme");
install("meteor-base");
install("mobile-experience");
install("blaze-html-templates");
install("session");
install("reload");
install("bevanhunt:leaflet");
install("brylie:leaflet-heat");
install("templating-compiler");
install("templating-runtime");
install("templating");
install("juliancwirko:s-alert");
install("coffeescript");
install("npm-bcrypt", "meteor/npm-bcrypt/wrapper.js");
install("sha");
install("srp");
install("email");
install("accounts-password");
install("simple:json-routes");
install("nimble:restivus");
install("amplify");
install("reactive-dict");
install("u2622:persistent-session");
install("postrednik:meteor-rangeslider");
install("momentjs:moment");
install("herrhelms:meteor-leaflet-markercluster");
install("shell-server", "meteor/shell-server/main.js");
install("juliancwirko:postcss");
install("aslagle:reactive-table");
install("anbuselvan:meteor-toggle-switch", "meteor/anbuselvan:meteor-toggle-switch/meteor-toggle-switch.js");
install("iron:core");
install("iron:dynamic-template");
install("iron:layout");
install("iron:url");
install("iron:middleware-stack");
install("iron:location");
install("iron:controller");
install("iron:router");
install("d3js:d3");
install("stylus");
install("tsega:bootstrap3-datetimepicker");
install("accounts-ui");
install("livedata");
install("hot-code-push");
install("launch-screen");
install("autoupdate");
install("service-configuration");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"process.js":["process",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/modules/process.js                                                                                    //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
try {
  // The application can run `npm install process` to provide its own
  // process stub; otherwise this module will provide a partial stub.
  process = global.process || require("process");
} catch (noProcess) {
  process = {};
}

if (Meteor.isServer) {
  // Make require("process") work on the server in all versions of Node.
  meteorInstall({
    node_modules: {
      "process.js": function (r, e, module) {
        module.exports = process;
      }
    }
  });
} else {
  process.platform = "browser";
  process.nextTick = process.nextTick || Meteor._setImmediate;
}

if (typeof process.env !== "object") {
  process.env = {};
}

_.extend(process.env, meteorEnv);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"node_modules":{"reify":{"lib":{"runtime.js":["./entry.js","./utils.js",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// node_modules/meteor/modules/node_modules/reify/lib/runtime.js                                                  //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var Entry = require("./entry.js").Entry;
var utils = require("./utils.js");

exports.enable = function (Module) {
  var Mp = Module.prototype;

  if (typeof Mp.import === "function" &&
      typeof Mp.export === "function") {
    // If the Mp.{import,export} methods have already been
    // defined, abandon reification immediately.
    return Module;
  }

  // Platform-specific code should implement this method however
  // appropriate. Module.prototype.resolve(id) should return an absolute
  // version of the given module identifier, like require.resolve.
  Mp.resolve = Mp.resolve || function resolve(id) {
    throw new Error("Module.prototype.resolve not implemented");
  };

  // Platform-specific code should find a way to call this method whenever
  // the module system is about to return module.exports from require. This
  // might happen more than once per module, in case of dependency cycles,
  // so we want Module.prototype.runModuleSetters to run each time.
  Mp.runModuleSetters = function runModuleSetters(valueToPassThrough) {
    var entry = Entry.get(this.id);
    if (entry) {
      entry.runModuleSetters(this);
    }

    // Assignments to exported local variables get wrapped with calls to
    // module.runModuleSetters, so module.runModuleSetters returns the
    // valueToPassThrough parameter to allow the value of the original
    // expression to pass through. For example,
    //
    //   export var a = 1;
    //   console.log(a += 3);
    //
    // becomes
    //
    //   module.export("a", () => a);
    //   var a = 1;
    //   console.log(module.runModuleSetters(a += 3));
    //
    // This ensures module.runModuleSetters runs immediately after the
    // assignment, and does not interfere with the larger computation.
    return valueToPassThrough;
  };

  function setESModule(module) {
    var exports = module.exports;
    if (exports && typeof exports === "object") {
      exports.__esModule = true;
    }
  }

  Mp.import = function (id, setters) {
    var module = this;
    setESModule(module);

    var absoluteId = module.resolve(id);

    if (setters && typeof setters === "object") {
      var entry = Entry.getOrCreate(absoluteId);
      entry.addSetters(module, setters);
    }

    var countBefore = entry && entry.runCount;
    var exports = typeof module.require === "function"
      ? module.require(absoluteId)
      : require(absoluteId);

    if (entry && entry.runCount === countBefore) {
      // If require(absoluteId) didn't run any setters for this entry,
      // perhaps because it's not the first time this module has been
      // required, run the setters now using an object that passes as the
      // real module object.
      entry.runModuleSetters({
        id: absoluteId,
        exports: exports,
        getExportByName: Mp.getExportByName
      });
    }
  };

  // Register getter functions for local variables in the scope of an
  // export statement. The keys of the getters object are exported names,
  // and the values are functions that return local values.
  Mp.export = function (getters) {
    var module = this;
    setESModule(module);

    if (utils.isPlainObject(getters)) {
      Entry.getOrCreate(module.id).addGetters(getters);
    }

    if (module.loaded) {
      // If the module has already been evaluated, then we need to trigger
      // another round of entry.runModuleSetters calls, which begins by
      // calling entry.runModuleGetters(module).
      module.runModuleSetters();
    }
  };

  // This method can be overridden by client code to implement custom export
  // naming logic. The current implementation works well with Babel's
  // __esModule convention.
  Mp.getExportByName = function (name) {
    var exports = this.exports;

    if (name === "*") {
      return exports;
    }

    if (name === "default" &&
        ! (exports &&
           typeof exports === "object" &&
           exports.__esModule &&
           "default" in exports)) {
      return exports;
    }

    return exports && exports[name];
  };

  return Module;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"entry.js":["./utils.js",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// node_modules/meteor/modules/node_modules/reify/lib/entry.js                                                    //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var hasOwn = Object.prototype.hasOwnProperty;
var entryMap = Object.create(null);
var utils = require("./utils.js");

function Entry(id) {
  // Same as module.id for this module.
  this.id = id;
  // The number of times this.runModuleSetters has been called.
  this.runCount = 0;
  // Setters for assigning to local variables in parent modules.
  this.setters = Object.create(null);
  // Getters for local variables exported from this module.
  this.getters = Object.create(null);
}

var Ep = Entry.prototype;

Entry.get = function (id) {
  return entryMap[id] || null;
};

Entry.getOrCreate = function (id) {
  return entryMap[id] = entryMap[id] || new Entry(id);
};

Ep.addSetters = function (parent, setters) {
  var entry = this;

  Object.keys(setters).forEach(function (name) {
    var setter = setters[name];
    if (typeof setter === "function" &&
        // Ignore any requests for the exports.__esModule property."
        name !== "__esModule") {
      setter.parent = parent;
      (entry.setters[name] =
       entry.setters[name] || []
      ).push(setter);
    }
  });
};

Ep.addGetters = function (getters) {
  var entry = this;
  Object.keys(getters).forEach(function (name) {
    var getter = getters[name];
    if (typeof getter === "function" &&
        // Ignore any requests for the exports.__esModule property."
        name !== "__esModule") {
      // Should this throw if hasOwn.call(this.getters, name)?
      entry.getters[name] = getter;
    }
  });
};

function runModuleSetters(module) {
  var entry = entryMap[module.id];
  if (entry) {
    entry.runModuleSetters(module);
  }
}

function runModuleGetters(module) {
  var entry = entryMap[module.id];
  return entry ? entry.runModuleGetters(module) : 0;
}

Ep.runModuleGetters = function (module) {
  var entry = this;
  var changeCount = 0;

  Object.keys(entry.getters).forEach(function (name) {
    if (entry.runGetter(module, name)) {
      ++changeCount;
    }
  });

  return changeCount;
};

// Returns true iff the getter updated module.exports with a new value.
Ep.runGetter = function (module, name) {
  if (! hasOwn.call(this.getters, name)) {
    return false;
  }

  var getter = this.getters[name];
  try {
    var value = getter.call(module);
  } catch (e) {}
  var exports = module.exports;

  if (! hasOwn.call(exports, name) ||
      exports[name] !== value) {
    // We update module.exports[name] with the current value so that
    // CommonJS require calls remain consistent with module.import.
    exports[name] = value;
    return true;
  }

  return false;
};

// Called whenever module.exports might have changed, to trigger any
// setters associated with the newly exported values.
Ep.runModuleSetters = function (module) {
  var entry = this;
  var names = Object.keys(entry.setters);

  // Make sure module.exports is up to date before we call
  // module.getExportByName(name).
  entry.runModuleGetters(module);

  // Invoke the given callback once for every (setter, value, name) triple
  // that needs to be called. Note that forEachSetter does not call any
  // setters itself, only the given callback.
  function forEachSetter(callback, context) {
    names.forEach(function (name) {
      entry.setters[name].forEach(function (setter) {
        var value = module.getExportByName(name);
        if (name === "*") {
          Object.keys(value).forEach(function (name) {
            call(setter, value[name], name);
          });
        } else {
          call(setter, value, name);
        }
      });
    });

    function call(setter, value, name) {
      if (name === "__esModule") {
        // Ignore setters asking for module.exports.__esModule.
        return;
      }

      setter.last = setter.last || Object.create(null);

      if (! hasOwn.call(setter.last, name) ||
          setter.last[name] !== value) {
        // Only invoke the callback if we have not called this setter
        // (with a value of this name) before, or the current value is
        // different from the last value we passed to this setter.
        return callback.apply(context, arguments);
      }
    }
  }

  // Every three elements of this list form a (setter, value, name) triple
  // that needs to be invoked.
  var settersToCall = [];

  // Lazily-initialized objects mapping parent module identifiers to
  // relevant parent module objects and snapshots of their exports.
  var relevantParents;
  var parentSnapshots;

  // Take snapshots of setter.parent.exports for any setters that we are
  // planning to call, so that we can later determine if calling the
  // setters modified any of those exports objects.
  forEachSetter(function (setter, value, name) {
    var parent = setter.parent;
    parentSnapshots = parentSnapshots || Object.create(null);
    if (! hasOwn.call(parentSnapshots, parent.id)) {
      relevantParents = relevantParents || Object.create(null);
      relevantParents[parent.id] = parent;
      if (utils.isPlainObject(parent.exports)) {
        // If parent.exports is an object, make a shallow clone of it so
        // that we can see if it changes as a result of calling setters.
        parentSnapshots[parent.id] = utils.assign({}, parent.exports);
      } else {
        // If parent.exports is not an object, the "snapshot" is just the
        // value of parent.exports.
        parentSnapshots[parent.id] = parent.exports;
      }
    }

    // Push three elements at a time to avoid creating wrapper arrays for
    // each (setter, value, name) triple. Note the i += 3 below.
    settersToCall.push(setter, value, name);
  });

  // Now call all the setters that we decided we need to call.
  for (var i = 0; i < settersToCall.length; i += 3) {
    var setter = settersToCall[i];
    var value = settersToCall[i + 1];
    var name = settersToCall[i + 2];
    setter.call(module, setter.last[name] = value, name);
  }

  ++entry.runCount;

  if (! relevantParents) {
    // If we never called takeSnapshot, then we can avoid checking
    // relevantParents and parentSnapshots below.
    return;
  }

  // If any of the setters updated the module.exports of a parent module,
  // or updated local variables that are exported by that parent module,
  // then we must re-run any setters registered by that parent module.
  Object.keys(relevantParents).forEach(function (id) {
    var parent = relevantParents[id];

    if (runModuleGetters(parent) > 0) {
      return runModuleSetters(parent);
    }

    var exports = parent.exports;
    var snapshot = parentSnapshots[parent.id];
    if (utils.shallowObjEqual(exports, snapshot)) {
      // If parent.exports have not changed since we took the snapshot,
      // then we do not need to run the parent's setters.
      return;
    }

    runModuleSetters(parent);
  });
};

exports.Entry = Entry;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}],"utils.js":function(require,exports){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// node_modules/meteor/modules/node_modules/reify/lib/utils.js                                                    //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
var hasOwn = Object.prototype.hasOwnProperty;
var objToStr = Object.prototype.toString;
var objStr = objToStr.call({});

function isPlainObject(value) {
  return objToStr.call(value) === objStr;
}
exports.isPlainObject = isPlainObject;

exports.assign = Object.assign || function (obj) {
  var argc = arguments.length;
  for (var i = 1; i < argc; ++i) {
    var arg = arguments[i];
    if (arg && typeof arg === "object") {
      var keys = Object.keys(arg);
      for (var k = 0; k < keys.length; ++k) {
        var key = keys[k];
        obj[key] = arg[key];
      }
    }
  }
  return obj;
};

exports.shallowObjEqual = function(a, b) {
  if (a === b) {
    return true;
  }

  if (! isPlainObject(a) ||
      ! isPlainObject(b)) {
    return false;
  }

  var aKeys = Object.keys(a);
  var bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  return aKeys.every(function (key) {
    return hasOwn.call(b, key) &&
      a[key] === b[key];
  });
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},"bcrypt":{"package.json":function(require,exports){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// node_modules/bcrypt/package.json                                                                               //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
exports.name = "bcrypt";
exports.version = "0.8.7";
exports.main = "./bcrypt";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"bcrypt.js":["bindings","crypto",function(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// node_modules/bcrypt/bcrypt.js                                                                                  //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
'use strict';

var bindings = require('bindings')('bcrypt_lib');
var crypto = require('crypto');

/// generate a salt (sync)
/// @param {Number} [rounds] number of rounds (default 10)
/// @return {String} salt
module.exports.genSaltSync = function(rounds) {
    // default 10 rounds
    if (!rounds) {
        rounds = 10;
    } else if (typeof rounds !== 'number') {
        throw new Error('rounds must be a number');
    }

    return bindings.gen_salt_sync(rounds, crypto.randomBytes(16));
};

/// generate a salt
/// @param {Number} [rounds] number of rounds (default 10)
/// @param {Function} cb callback(err, salt)
module.exports.genSalt = function(rounds, ignore, cb) {
    // if callback is first argument, then use defaults for others
    if (typeof arguments[0] === 'function') {
        // have to set callback first otherwise arguments are overriden
        cb = arguments[0];
        rounds = 10;
    // callback is second argument
    } else if (typeof arguments[1] === 'function') {
        // have to set callback first otherwise arguments are overriden
        cb = arguments[1];
    }

    // default 10 rounds
    if (!rounds) {
        rounds = 10;
    } else if (typeof rounds !== 'number') {
        // callback error asynchronously
        return process.nextTick(function() {
            cb(new Error('rounds must be a number'));
        });
    }

    if (!cb) {
        return;
    }

    crypto.randomBytes(16, function(error, randomBytes) {
        if (error) {
            cb(error);
            return;
        }

        bindings.gen_salt(rounds, randomBytes, cb);
    });
};

/// hash data using a salt
/// @param {String} data the data to encrypt
/// @param {String} salt the salt to use when hashing
/// @return {String} hash
module.exports.hashSync = function(data, salt) {
    if (data == null || salt == null) {
        throw new Error('data and salt arguments required');
    }

    if (typeof data !== 'string' || (typeof salt !== 'string' && typeof salt !== 'number')) {
        throw new Error('data must be a string and salt must either be a salt string or a number of rounds');
    }

    if (typeof salt === 'number') {
        salt = module.exports.genSaltSync(salt);
    }

    return bindings.encrypt_sync(data, salt);
};

/// hash data using a salt
/// @param {String} data the data to encrypt
/// @param {String} salt the salt to use when hashing
/// @param {Function} cb callback(err, hash)
module.exports.hash = function(data, salt, cb) {
    if (typeof data === 'function') {
        return process.nextTick(function() {
            data(new Error('data must be a string and salt must either be a salt string or a number of rounds'));
        });
    }

    if (typeof salt === 'function') {
        return process.nextTick(function() {
            salt(new Error('data must be a string and salt must either be a salt string or a number of rounds'));
        });
    }

    if (data == null || salt == null) {
        return process.nextTick(function() {
            cb(new Error('data and salt arguments required'));
        });
    }

    if (typeof data !== 'string' || (typeof salt !== 'string' && typeof salt !== 'number')) {
        return process.nextTick(function() {
            cb(new Error('data must be a string and salt must either be a salt string or a number of rounds'));
        });
    }

    if (!cb || typeof cb !== 'function') {
        return;
    }

    if (typeof salt === 'number') {
        return module.exports.genSalt(salt, function(err, salt) {
            return bindings.encrypt(data, salt, cb);
        });
    }

    return bindings.encrypt(data, salt, cb);
};

/// compare raw data to hash
/// @param {String} data the data to hash and compare
/// @param {String} hash expected hash
/// @return {bool} true if hashed data matches hash
module.exports.compareSync = function(data, hash) {
    if (data == null || hash == null) {
        throw new Error('data and hash arguments required');
    }

    if (typeof data !== 'string' || typeof hash !== 'string') {
        throw new Error('data and hash must be strings');
    }

    return bindings.compare_sync(data, hash);
};

/// compare raw data to hash
/// @param {String} data the data to hash and compare
/// @param {String} hash expected hash
/// @param {Function} cb callback(err, matched) - matched is true if hashed data matches hash
module.exports.compare = function(data, hash, cb) {
    if (data == null || hash == null) {
        return process.nextTick(function() {
            cb(new Error('data and hash arguments required'));
        });
    }

    if (typeof data !== 'string' || typeof hash !== 'string') {
        return process.nextTick(function() {
            cb(new Error('data and hash must be strings'));
        });
    }

    if (!cb || typeof cb !== 'function') {
        return;
    }

    return bindings.compare(data, hash, cb);
};

/// @param {String} hash extract rounds from this hash
/// @return {Number} the number of rounds used to encrypt a given hash
module.exports.getRounds = function(hash) {
    if (hash == null) {
        throw new Error('hash argument required');
    }

    if (typeof hash !== 'string') {
        throw new Error('hash must be a string');
    }

    return bindings.get_rounds(hash);
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]},"bindings":{"package.json":function(require,exports){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// node_modules/bindings/package.json                                                                             //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
exports.name = "bindings";
exports.version = "1.2.1";
exports.main = "./bindings.js";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"bindings.js":["fs","path",function(require,exports,module,__filename){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// node_modules/bindings/bindings.js                                                                              //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //

/**
 * Module dependencies.
 */

var fs = require('fs')
  , path = require('path')
  , join = path.join
  , dirname = path.dirname
  , exists = fs.existsSync || path.existsSync
  , defaults = {
        arrow: process.env.NODE_BINDINGS_ARROW || ' → '
      , compiled: process.env.NODE_BINDINGS_COMPILED_DIR || 'compiled'
      , platform: process.platform
      , arch: process.arch
      , version: process.versions.node
      , bindings: 'bindings.node'
      , try: [
          // node-gyp's linked version in the "build" dir
          [ 'module_root', 'build', 'bindings' ]
          // node-waf and gyp_addon (a.k.a node-gyp)
        , [ 'module_root', 'build', 'Debug', 'bindings' ]
        , [ 'module_root', 'build', 'Release', 'bindings' ]
          // Debug files, for development (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Debug', 'bindings' ]
        , [ 'module_root', 'Debug', 'bindings' ]
          // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        , [ 'module_root', 'out', 'Release', 'bindings' ]
        , [ 'module_root', 'Release', 'bindings' ]
          // Legacy from node-waf, node <= 0.4.x
        , [ 'module_root', 'build', 'default', 'bindings' ]
          // Production "Release" buildtype binary (meh...)
        , [ 'module_root', 'compiled', 'version', 'platform', 'arch', 'bindings' ]
        ]
    }

/**
 * The main `bindings()` function loads the compiled bindings for a given module.
 * It uses V8's Error API to determine the parent filename that this function is
 * being invoked from, which is then used to find the root directory.
 */

function bindings (opts) {

  // Argument surgery
  if (typeof opts == 'string') {
    opts = { bindings: opts }
  } else if (!opts) {
    opts = {}
  }
  opts.__proto__ = defaults

  // Get the module root
  if (!opts.module_root) {
    opts.module_root = exports.getRoot(exports.getFileName())
  }

  // Ensure the given bindings name ends with .node
  if (path.extname(opts.bindings) != '.node') {
    opts.bindings += '.node'
  }

  var tries = []
    , i = 0
    , l = opts.try.length
    , n
    , b
    , err

  for (; i<l; i++) {
    n = join.apply(null, opts.try[i].map(function (p) {
      return opts[p] || p
    }))
    tries.push(n)
    try {
      b = opts.path ? require.resolve(n) : require(n)
      if (!opts.path) {
        b.path = n
      }
      return b
    } catch (e) {
      if (!/not find/i.test(e.message)) {
        throw e
      }
    }
  }

  err = new Error('Could not locate the bindings file. Tried:\n'
    + tries.map(function (a) { return opts.arrow + a }).join('\n'))
  err.tries = tries
  throw err
}
module.exports = exports = bindings


/**
 * Gets the filename of the JavaScript file that invokes this function.
 * Used to help find the root directory of a module.
 * Optionally accepts an filename argument to skip when searching for the invoking filename
 */

exports.getFileName = function getFileName (calling_file) {
  var origPST = Error.prepareStackTrace
    , origSTL = Error.stackTraceLimit
    , dummy = {}
    , fileName

  Error.stackTraceLimit = 10

  Error.prepareStackTrace = function (e, st) {
    for (var i=0, l=st.length; i<l; i++) {
      fileName = st[i].getFileName()
      if (fileName !== __filename) {
        if (calling_file) {
            if (fileName !== calling_file) {
              return
            }
        } else {
          return
        }
      }
    }
  }

  // run the 'prepareStackTrace' function above
  Error.captureStackTrace(dummy)
  dummy.stack

  // cleanup
  Error.prepareStackTrace = origPST
  Error.stackTraceLimit = origSTL

  return fileName
}

/**
 * Gets the root directory of a module, given an arbitrary filename
 * somewhere in the module tree. The "root directory" is the directory
 * containing the `package.json` file.
 *
 *   In:  /home/nate/node-native-module/lib/index.js
 *   Out: /home/nate/node-native-module
 */

exports.getRoot = function getRoot (file) {
  var dir = dirname(file)
    , prev
  while (true) {
    if (dir === '.') {
      // Avoids an infinite loop in rare cases, like the REPL
      dir = process.cwd()
    }
    if (exists(join(dir, 'package.json')) || exists(join(dir, 'node_modules'))) {
      // Found the 'package.json' file or 'node_modules' dir; we're done
      return dir
    }
    if (prev === dir) {
      // Got to the top
      throw new Error('Could not find module root given file: "' + file
                    + '". Do you have a `package.json` file? ')
    }
    // Try the parent dir next
    prev = dir
    dir = join(dir, '..')
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}}},{"extensions":[".js",".json"]});
var exports = require("./node_modules/meteor/modules/server.js");

/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package.modules = exports, {
  meteorInstall: meteorInstall,
  Buffer: Buffer,
  process: process
});

})();

//# sourceMappingURL=modules.js.map
