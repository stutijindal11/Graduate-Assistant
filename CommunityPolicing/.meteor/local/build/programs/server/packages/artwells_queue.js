(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;
var CollectionHooks = Package['matb33:collection-hooks'].CollectionHooks;

/* Package-scope variables */
var Queue, command, interval, handle, id;

(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/artwells_queue/queue.js                                                                                  //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Queue = {};
if (typeof Queue.loglevel === "undefined") {
    Queue.loglevel = 3; /* 3 only includes lock conflicts.  2,3 includes successes */
}
if (typeof Queue.logLife === "undefined") {
    Queue.logLife = 30; /* days to keep logfiles */
}
if (typeof Queue.ephemeralLogLife === "undefined") {
    Queue.ephemeralLogLife = 1800000; /* milliseconds to keep ephemeral log statuses */
}
if (typeof Queue.ephemeralLogStatuses === "undefined") {
    Queue.ephemeralLogStatuses = ['lockfailed','success']; /* statuses to purge from logs quickly */
}

if (typeof Queue.defaultPriority === "undefined") {
    Queue.defaultPriority = 5;/* 1 is highest */
}
if (typeof Queue.defaultStatus === "undefined") {
    Queue.defaultStatus = "pending";/* by changing this to some other new word, you can make sure queue items are "blessed" in "pending" through another process. */
}
if (typeof Queue.keepsuccess === "undefined") {
    Queue.keepsuccess = true; /* keep successful in queue as record */
}
if (typeof Queue.lockLife === "undefined") {
    Queue.lockLife = 30; /* minutes to keep lockfiles */
}
if (typeof Queue.completedLife === "undefined") {
    Queue.completedLife = 30; /* days to keep completed tasks */
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/artwells_queue/lib/model.js                                                                              //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/**
* queue schema
*
*{
*    "_id" : ObjectId,
*    "status" : string,
*    "priority" : int, // 1s first
*    "command" : string,
*    "execute_after" : ISODate,
*    "lock_name" : string, //only allow one task of this name to be queued
*    "history" : {
*   },
*    "reattempt" :  int //number of minutes to requeue
*    "log_success" : boolean
*    "created_at": ISODate,
*    "updated_at": ISODate
*}
*
*/


/**
*  queuelog schema
*
*  "_id" : ObjectId,
*   "status" : string, // lockfailed
*   "created_at" : ISODate
*   "command" : string,
*   "parent_id": string
*  "data": {
*     results
*  }
*
*/

/**
*  queuereadrun schema
*
*  "_id" : ObjectId
*   "created_at" : ISODate
*   "command" : string,
*   "name" : string,
*   "permission" : int //notimplemented yet
*   "enabled" : boolean
*
*/


/**
* queueinterval schema
* "_id" : ObjectId
* "name" : string,
* "created_at" : ISODate
* "updated_at" : ISODate
* "deleted_at" : ISODate
* "last_run": ISODate
* "command": string
* "enabled ": boolean
* "locked": boolean
* "handle":{
*   [interval handle] 
*}
* 
*/

Queue.entries = new Mongo.Collection("queue");
Queue.log = new Mongo.Collection("queuelog");
//Queue.readyrun = new Mongo.Collection("queuereadyrun");
Queue.queueintervals = new Meteor.Collection("queueintervals"); // matb33:collection-hooks needs a Meteor collection
Queue.intervalhandles = [];

if (Meteor.isServer) {
    Queue.entries._ensureIndex({ lock_name: 1 }, { unique: true, sparse: true });
//    Queue.readyrun._ensureIndex({ name: 1 }, { unique: true, sparse: true });
    Queue.queueintervals._ensureIndex({ name: 1 }, { unique: true, sparse: true });
    /*just until Meteor bring findAndModify */
    if (typeof Queue.entries.findAndModify === "undefined") {
        Queue.entries.findAndModify = function (query, sort, mod) {
            sort.reactive = false;
            var results = Queue.entries.find(query, sort, {reactive: true}).fetch();
            var modified = Queue.entries.update(query, mod, {multi: true});
            if (modified) {
                return results;
            }
        };
    }
    /* end fake findAndModify */
}

Queue.queueintervals.before.update(function (userId, doc, fieldNames, modifier, options) {
    Meteor.clearInterval(Queue.intervalhandles[doc._id]); 
    command = doc.command;   
    if (modifier.$set.command){
        command = modifier.$set.command;
    }
    interval = doc.interval;
    if (modifier.$set.interval){
        interval = modifier.$set.interval;
    }
    handle = Meteor.setInterval(function(){eval(command)}, interval);
    /* reassign the handle */
    Queue.intervalhandles[doc._id] = handle;
    modifier.$set.updated_at = new Date();
});



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/artwells_queue/lib/server/server.js                                                                      //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
Queue.purgeOldLogs = function () {
    var before = new Date();
    before.setDate(before.getDate() - Queue.logLife);
    Queue.log.remove({created_at: {$lte: before}});

    /* remove more ephemeral statuses */
    var ephemeral = new Date();
    ephemeral.setTime(ephemeral.getTime() - Queue.ephemeralLogLife )
    Queue.log.remove({created_at: {$lte: ephemeral},  status: {$in: Queue.ephemeralLogStatuses}});

};

Queue.purgeOldLocks = function (before) {
    if (typeof before === "undefined" || before === null) {
        before = new Date();
        before.setMinutes(before.getMinutes() - Queue.lockLife);
    }
   Queue.entries.remove({created_at: {$lte: before}, lock_name: {$exists: true}});
};

Queue.purgeCompletedTasks = function (before) {
    if (typeof before === "undefined" || before === null) {
        before = new Date();
        before.setDate(before.getDate() - Queue.completedLife);
    }
    Queue.entries.remove({updated_at: {$lte: before}, status: 'completed'});
};

Queue.add = function (entry) {
    var res = false;
    /*command, name,  priority, execute_after, reattempt, lock_name, logsuccesses*/
    var entryarray = [];
    if (typeof entry !== "object" || entry === null) {
        return false;
    }
    if (typeof entry.command !== "string") {
        return false;
    }
    entryarray.command = entry.command;

    if (typeof entry.execute_after === "undefined" || entry.execute_after === null) {
        entry.execute_after = new Date();
    }
    entryarray.execute_after = entry.execute_after;
    /* force default state through this method */
    entryarray.status = Queue.defaultStatus;


    entryarray.priority = Queue.defaultPriority; /* default to mediocre default*/

    if (typeof entry.priority === "number") {
        entryarray.priority = entry.priority;
    }

    if (typeof entry.name === "string") {
        entryarray.name = entry.name;
    }

    if (typeof entry.lock_name === "string") {
        entryarray.lock_name = entry.lock_name;
    }

    if (typeof entry.execute_after === "object") {
        entryarray.execute_after = entry.execute_after;
    }

    if (typeof entry.log_success === "boolean") {
        entryarray.log_success = entry.log_success;
    }

    if (typeof entry.reattempt === "number") {
        entryarray.reattempt = entry.reattempt;
    }
    if (typeof entry.created_at !== "undefined") {
        entryarray.created_at = new Date(entry.created_at);
    }
    else{
        entryarray.created_at = new Date();
    }

    entryarray.updated_at = new Date();

    try {
        res = Queue.entries.insert(entryarray);
    } catch (e) {
        /* lock errors are expected and should be logged only if verbose */
        if (e.err !== 'undefined' && e.err.indexOf('E11000') === 0 &&
            Queue.loglevel > 2) {
            Queue.log.insert({command: 'Queue.add failed ' + entryarray.lock_name, status: 'lockfailed', data: e.err, created_at: new Date()});
    } else if (Queue.loglevel > 0) {
        /* otherwise include the whole stack */
        Queue.log.insert({command: 'Queue.add failed ' + entryarray.lock_name, status: 'lockfailed', data: e, created_at: new Date()});
    }
}
return res;
};

/* not much now, but might need to be complicated in the future */
Queue.remove = function (entryId) {
    return Queue.entries.remove({_id: entryId});
};

/* sets all found entries as 'locked'
* @TODO by-priority
*/
Queue.get = function (args) {
    /* defaults status: pending,execute_after:now, */
    var getstatus = "pending"; /* default retrieval status */
    var execute_after = new Date();
    /* do NOT use Queue.defaultStatus for getstatus, as you want to allow defaultStatus to serve an optional other purpose */
    if (typeof args.execute_after !== "undefined" || args.execute_after === null) {
        execute_after = args.execute_after;
    }

    if (typeof args.status === "string") {
        getstatus = args.status;
    }

    return Queue.entries.findAndModify({execute_after: {$lte: execute_after}, status: getstatus}, {sort: {priority: 1}},
        {$set: {status: 'locked'}}
        );

};

/* just used for testing but will be helpful for "blessed" level*/
Queue.changeStatus = function (id, status) {
    var modified = Queue.entries.update({_id: id}, {$set: {status: status}});
    if (modified === 1) {
        return true;
    }
    return false;
};

/* @TODO: add some sanity checks */
Queue.process = function (entry) {
    var result = false;
    var message = 'failed';
    var history = null;
    try {
        result = new Function(entry.command)();
    } catch (e) {
        result = false;
        message = e.err;
    }
    if (result !== false) {
        if (entry.log_success ||  Queue.loglevel > 1) {
            Queue.log.insert({command: entry.command, parent_id: entry._id, status: 'success', data: result, created_at: new Date()});
        }
        if (Queue.keepsuccess) {
            if (typeof entry.history !== "undefined") {
                history = entry.history + ' command returned true (' + new Date() + ');';
            } else {
                history = 'command returned true (' + new Date() + ');';
            }
            var modified = Queue.entries.update({_id: entry._id}, {$set: {status: 'completed', history: history, updated_at: new Date()}});
            if (modified !== 1 && Queue.loglevel > 0) {
                Queue.log.insert({command: 'update on succes', parent_id: entry._id, status: 'exception', data: 'unable to update entry', created_at: new Date()});
            }
        }
        return true;
    }

    if (Queue.loglevel > 0) {
        Queue.log.insert({command: entry.command, parent_id: entry._id, status: 'exception', data: message, created_at: new Date()});
    }

    if (entry.reattempt > 0) {
        var execdate = new Date();
        execdate.setMinutes(execdate.getMinutes() + entry.reattempt);
        var reattemptmodified = Queue.entries.update({_id: entry._id}, {$set: {status: 'pending', execute_after: execdate}});
        if (reattemptmodified !== 1 && Queue.loglevel > 0) {
            Queue.log.insert({command: entry.command, parent_id: entry._id, status: 'exception', data: 'unable to requeue command', created_at: new Date()});
        }
    } else {
        if (typeof entry.history !== "undefined") {
            history = entry.history + ' command returned false (' + new Date() + ');';
        } else {
            history = ' command returned false (' + new Date() + ');';
        }
        var historymodified = Queue.entries.update({_id: entry._id}, {$set: {status: 'failed', history: history, updated_at: new Date()}});
        if (historymodified !== 1 && Queue.loglevel > 0) {
            Queue.log.insert({command: entry.command, parent_id: entry._id, status: 'exception', data: 'unable to requeue command', created_at: new Date()});
        }
    }
    return false;
};


Queue.run = function (args) {
    /* hacky locking with entry table */
    if (typeof args === "undefined") {
        args = [];
    }
    var entry = [];
    var future = new Date();
    var getargs = [];
    future.setDate(future.getDate() + 600); /* put it out there so it doesn't execute */
    entry.command = 'return true;';
    entry.lock_name = 'query.run';
    entry.execute_after = future;
    var lock = Queue.add(entry);
    if (lock === false) {
        if (Queue.loglevel > 0) {
            Queue.log.insert({command: 'Queue.run failed due to locking ' + entry.lock_name, status: 'lockfailed', created_at: new Date()});
        }
        return false;
    }

    /* lock obtained */
    if (typeof args.execute_after === "undefined" || args.execute_after === null) {
        args.execute_after = new Date();
    }
    getargs.execute_after = args.execute_after;
    /* @TODO: add args for status and execute_after */
    var all = Queue.get(getargs);
    _.each(all, function (entry) {
        Queue.process(entry);
    });
    /* lock */
    Queue.remove(lock);
    return true;
};
/* @TODO decide if readyrun is really needed */
/*
Queue.addReadyRun = function(args){
    /* name, command, enabled, created_at * /
    var ready = [];
    if (typeof args !== "object" || args === null) {
        return false;
    }
    if (typeof args.command !== "string") {
        return false;
    }
    if (typeof args.name !== "string") {
        return false;
    }

    ready.created_at = new Date();
    if (typeof args.enabled === "undefined") {
        ready.enabled = true;
    }
    else{
        ready.enabled = entryenabled;
    }
    ready.name = args.name;
    ready.command = args.command;

    try {
        res = Queue.readyrun.insert(ready);
        if (Queue.loglevel > 1) {
            Queue.log.insert({command: 'Queue.addREadyFunction success for' + ready.name, parent_id: entry._id, status: 'success', data: res, created_at: new Date()});
        }
    } catch (e) {
        if (Queue.loglevel > 0) {
            Queue.log.insert({command: 'Queue.addREadyFunction failed for' + ready.name, status: 'exception', data: e, created_at: new Date()});
        }
    }
    return res;
}
*/

Queue.setInterval = function(name, command, interval){
    
    var res = false;
    /*command, name,  priority, execute_after, reattempt, lock_name, logsuccesses*/
    var entryarray = [];
    if (typeof name !== "string") {
        return false;
    }
    entryarray.name = name;
    
    if (typeof command !== "string")  {
        return false;
    }
    entryarray.command = command;

    if ( typeof interval !== "number"){
        return false;
    }
    entryarray.interval = interval;

    entryarray.enabled = true;
    entryarray.locked = false;

    entryarray.updated_at = new Date();
    entryarray.created_at = new Date();

    handle = Meteor.setInterval(function(){eval(command)}, interval);
    Queue.queueintervals.remove({name:name},function(){});
    
    try {
        id = Queue.queueintervals.insert(entryarray);
        Queue.intervalhandles[id] = handle;
        if (Queue.loglevel > 2) {
                Queue.log.insert({command: 'Queue.interval added: ' + entryarray.name + ', id:' + id, status: 'success', data: 'handle:' + entryarray.handle, created_at: new Date()});
        }
    } catch (e) {
        if (Queue.loglevel > 0) {
            /* otherwise include the whole stack */
            Queue.log.insert({command: 'Queue.interval failed ' + entryarray.name, status: 'exception', data: e, created_at: new Date()});
        }
    }
    return id;
}


Queue.clearInterval = function(id) {
    Meteor.clearInterval(Queue.intervalhandles[id]);
    delete Queue.intervalhandles[id];
    return Queue.queueintervals.remove({_id:id});
}



if (typeof Houston !== "undefined"){
    Meteor.startup(function () {
        Meteor.methods({
            addQueueRunNow : function() { 
            try{
                    Houston.methods("queue", {
                        "Run Now": function (queue) {
                            Queue.process(queue);
                            return queue.command + " completed.";
                        }
                    });
                }
                catch(e){
                //    console.log(e);
                }
            },
            
            addQueueStopInterval: function() { 
                try{
                    Houston.methods("queueintervals", {
                        "Stop": function (queueinterval) {

                               Queue.clearInterval(queueinterval._id);
                            return queueinterval._id + " completed.";
                        }
                    });
                }
                catch(e){
                //    console.log(e);
                }
            }
     });

    });
}

Queue.changeMainInterval = function(interval){
    Meteor.clearInterval(Queue.intervalhandles[Queue.manIntervalId]); 
    Queue.manIntervalId = Queue.setInterval('Main -- DONT STOP', 'Queue.run()', interval);
}



Queue.manIntervalId = Queue.setInterval('Main -- DONT STOP', 'Queue.run()', 5000); /* once every five seconds */



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['artwells:queue'] = {}, {
  Queue: Queue
});

})();

//# sourceMappingURL=artwells_queue.js.map
