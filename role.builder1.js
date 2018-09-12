// CONSTANTS
// ---------------------------------------------------------
var ROLE_NAME = 'builder1';
var BODY_COMPOSITION = [WORK, CARRY, MOVE];

var STATE_COLLECT = 0;
var STATE_BUILD   = 1;
var STATE_RETURN  = 2;


// FUNCTIONS
// ---------------------------------------------------------
var run = function(creep) {
    let constrSites = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
    checkStateTransitionConditions(creep, constrSites);

    switch (creep.memory.state) {
    case STATE_COLLECT:
        collectEnergy(creep);
        break;
    case STATE_BUILD:
        build(creep);
        break;
    case STATE_RETURN:
        returnAndRecycle(creep);
        break;

    default:
        stateErrorPrint(creep);
        console.log('Recycling ' + creep.name);
        creep.memory.state = STATE_RETURN;
        returnAndRecycle(creep);
        break;
    }
};

var checkStateTransitionConditions = function(creep, constrSites) {
    if (constrSites.length == 0) {
        creep.memory.state = STATE_RETURN;
        delete creep.memory.constrSite;
        delete creep.memory.closestSource;
    }
    else if (creep.memory.constrSite == undefined
             || Game.getObjectById(creep.memory.constrSite.id) == undefined) {
        creep.memory.constrSite = chooseConstructionSite(creep, constrSites);
        delete creep.memory.closestSource;
    }

    switch (creep.memory.state) {
    case STATE_COLLECT:
        if (creep.carry.energy == creep.carryCapacity) {
            creep.memory.state = STATE_BUILD;
            delete creep.memory.closestSource;
        }
        break;
    case STATE_BUILD:
        if (creep.carry.energy == 0)
            creep.memory.state = STATE_COLLECT;
        break;
    case STATE_RETURN:
        if (constrSites.length > 0) {
            if (creep.carry.energy < 0.5 * creep.carryCapacity)
                creep.memory.state = STATE_COLLECT;
            else
                creep.memory.state = STATE_BUILD;
        }
        break;

    default:
        console.log('State-transition Error');
        stateErrorPrint(creep);
    }
};

var collectEnergy = function(creep) {
    if (creep.memory.closestSource == undefined) {
        let constructionLocation = Game.getObjectById(creep.memory.constrSite.id).pos;
        creep.memory.closestSource = constructionLocation.findClosestByPath(FIND_SOURCES);
    }
    let closestSource = Game.getObjectById(creep.memory.closestSource.id);
    if (creep.harvest(closestSource) == ERR_NOT_IN_RANGE)
        creep.moveTo(closestSource);
};

var build = function(creep) {
    let constructionTarget = Game.getObjectById(creep.memory.constrSite.id);
    if (creep.build(constructionTarget) == ERR_NOT_IN_RANGE)
        creep.moveTo(constructionTarget);
};

var returnAndRecycle = function(creep) {
    let spawner = Game.getObjectById(creep.memory.home.id);
    if ((creep.carryCapacity > 0
         && creep.transfer(spawner, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        || spawner.recycleCreep(creep) == ERR_NOT_IN_RANGE)
        creep.moveTo(spawner);
};

var spawn = function(spawner) {
    let testStatus = spawner.spawnCreep(BODY_COMPOSITION, 'dummy',
                                        { dryRun: true });
    if (testStatus != OK) return testStatus;

    return spawner.spawnCreep(BODY_COMPOSITION, ROLE_NAME+'-'+Game.time, {
        memory: {
            role:  ROLE_NAME,
            state: STATE_COLLECT,
            home:  spawner
        }
    });
};

var chooseConstructionSite = function(creep, constrSites) {
    return constrSites[0]; // TODO
};

var stateErrorPrint = function(creep) {
    console.log('State Error: missing state for ' + ROLE_NAME + '. '
                + 'creep: ' + creep.name
                + ', state: ' + creep.memory.state);
};


module.exports = { run: run,
                   spawn: spawn };
