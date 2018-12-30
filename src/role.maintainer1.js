const common = require('creep.common');
const utils = require('utils');

// CONSTANTS
// ---------------------------------------------------------
const ROLE_NAME = 'maintainer1';
const BODY_COMPOSITION = [WORK, CARRY, MOVE];

const STATE_COLLECT = 0;
const STATE_REPAIR = 1;
const STATE_RETURN = 2;


// FUNCTIONS
// ---------------------------------------------------------
var run = function(creep)
{
    const homeRoom = Game.getObjectById(creep.memory.home.id).room;
    // TODO create structure priorities or prioritise structures based on health
    // percentage or something
    let repairSites = homeRoom.find(FIND_MY_STRUCTURES, {
        filter: (s) => {
            if (s.structureType == STRUCTURE_RAMPART)
                return s.hits < 30000;
            return ((s.structureType != STRUCTURE_ROAD
                     && s.structureType != STRUCTURE_WALL)
                    && s.hits < s.hitsMax);
        }});
    checkStateTransitionConditions(creep, repairSites);

    switch (creep.memory.state) {
    case STATE_COLLECT:
        collectEnergy(creep);
        break;
    case STATE_REPAIR:
        repair(creep);
        break;
    case STATE_RETURN:
        returnAndWait(creep);
        break;

    default:
        stateErrorPrint(creep);
        console.log('Recycling ' + creep.name);
        creep.memory.state = STATE_RETURN;
        returnAndRecycle(creep);
    }
};

var checkStateTransitionConditions = function(creep, repairSites)
{
    preprocessStateTransitions(creep, repairSites);

    switch (creep.memory.state) {
    case STATE_COLLECT:
        if (creep.carry.energy == creep.carryCapacity) {
            creep.memory.state = STATE_REPAIR;
            delete creep.memory.closestSource;
        }
        break;
    case STATE_REPAIR:
        if (creep.carry.energy == 0)
            creep.memory.state = STATE_COLLECT;
        break;
    case STATE_RETURN:
        if (repairSites.length > 0) {
            if (creep.carry.energy < 0.5 * creep.carryCapacity)
                creep.memory.state = STATE_COLLECT;
            else
                creep.memory.state = STATE_REPAIR;
        }
        break;

    default:
        console.error('State-transition error:');
        stateErrorPrint(creep);
    }
};

var preprocessStateTransitions = function(creep, repairSites)
{
    if (creep.memory.repairSite != null) {
        const repairSite = Game.getObjectById(creep.memory.repairSite.id);
        if (repairSite != null
            && ((repairSite.structureType == STRUCTURE_RAMPART && repairSite.hits >= 50000)
                || repairSite.hits == repairSite.hitsMax))
        {
            delete creep.memory.repairSite;
            delete creep.memory.closestSource;
        }
    }

    if (repairSites.length == 0
        && creep.memory.repairSite == undefined)
    {
        if (creep.carry.energy < creep.carryCapacity) {
            creep.memory.state = STATE_COLLECT;
            creep.memory.closestSource = findClosestSourceFrom(creep.pos);
        }
        else {
            creep.memory.state = STATE_RETURN;
            delete creep.memory.closestSource;
        }
    }
    else if (creep.memory.repairSite == undefined
             || Game.getObjectById(creep.memory.repairSite.id) == null)
    {
        creep.memory.repairSite = chooseRepairSite(creep, repairSites);
        delete creep.memory.closestSource;
    }
};

var collectEnergy = function(creep)
{
    if (creep.memory.closestSource == undefined) {
        let repairLocation = Game.getObjectById(creep.memory.repairSite.id).pos;
        creep.memory.closestSource = findClosestSourceFrom(repairLocation);
    }
    let closestSource = Game.getObjectById(creep.memory.closestSource.id);
    common.harvestEnergy(creep, closestSource);
};

var findClosestSourceFrom = function(pos)
{
    let closestSource = pos.findClosestByPath(FIND_SOURCES);
    if (closestSource == null)
        closestSource = pos.findClosestByRange(FIND_SOURCES);
    return closestSource;
};

var repair = function(creep)
{
    const repairSite = Game.getObjectById(creep.memory.repairSite.id);
    if (repairSite != null
        && creep.repair(repairSite) == ERR_NOT_IN_RANGE)
    {
        creep.moveTo(repairSite);
        // Might be in range now, try to repair again
        creep.repair(repairSite);
    }
};

var returnAndWait = function(creep)
{
    const spawner = Game.getObjectById(creep.memory.home.id);
    if (utils.distanceSquared(spawner.pos, creep.pos) > 1.0)
        common.pheromoveTo(spawner, creep);
};

var spawn = function(spawner)
{
    return spawner.spawnCreep(BODY_COMPOSITION, ROLE_NAME+'-'+Game.time, {
        memory: {
            role:  ROLE_NAME,
            state: STATE_COLLECT,
            home:  spawner
        }
    });
};

var chooseRepairSite = function(creep, repairSites)
{
    return repairSites[0]; // TODO
};

var stateErrorPrint = function(creep)
{
    console.error('[STATE ERROR]: missing state for ' + ROLE_NAME + '. '
                  + 'creep: ' + creep.name
                  + ', state: ' + creep.memory.state);
};


module.exports = { run: run,
                   spawn: spawn };
