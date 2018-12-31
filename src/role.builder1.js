const common = require('creep.common');

// CONSTANTS
// ---------------------------------------------------------
const ROLE_NAME = 'builder1';
const BODY_COMPOSITION = [WORK, CARRY, MOVE];

const STATE_COLLECT   = 0;
const STATE_BUILD     = 1;
const STATE_REINFORCE = 2;
const STATE_RETURN    = 3;


// FUNCTIONS
// ---------------------------------------------------------
const run = function(creep)
{
    const homeRoom = Game.getObjectById(creep.memory.home.id).room;
    const constrSites = homeRoom.find(FIND_MY_CONSTRUCTION_SITES);
    checkStateTransitionConditions(creep, constrSites);

    switch (creep.memory.state) {
    case STATE_COLLECT:
        collectEnergy(creep);
        break;
    case STATE_BUILD:
        build(creep);
        break;
    case STATE_REINFORCE:
        reinforce(creep);
        break;
    case STATE_RETURN:
        returnAndRecycle(creep);
        break;

    default:
        stateErrorPrint(creep);
        console.log('Recycling ' + creep.name);
        creep.memory.state = STATE_RETURN;
        returnAndRecycle(creep);
    }
};

const checkStateTransitionConditions = function(creep, constrSites)
{
    preprocessStateTransitions(creep, constrSites);

    switch (creep.memory.state) {
    case STATE_COLLECT:
        if (creep.carry.energy == creep.carryCapacity) {
            delete creep.memory.closestSource;

            if (creep.memory.reinforceSite != undefined)
                creep.memory.state = STATE_REINFORCE;
            else
                creep.memory.state = STATE_BUILD;
        }
        break;

    case STATE_BUILD:
        if (creep.carry.energy == 0)
            creep.memory.state = STATE_COLLECT;
        break;

    case STATE_REINFORCE:
        const reinforceSite = Game.getObjectById(creep.memory.reinforceSite.id);
        if (reinforceSite == null
            || reinforceSite.hits > Math.min(0.05*reinforceSite.hitsMax, 15e3))
        {
            delete creep.memory.reinforceSite;
            creep.memory.state = STATE_BUILD;
        }
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
        console.error('State-transition error:');
        stateErrorPrint(creep);
    }
};

const preprocessStateTransitions = function(creep, constrSites)
{
    if (constrSites.length == 0
        && creep.memory.reinforceLocation == undefined
        && creep.memory.reinforceSite == undefined)
    {
        creep.memory.state = STATE_RETURN;
        delete creep.memory.constrSite;
        delete creep.memory.closestSource;
    }
    else if (creep.memory.constrSite == undefined
             || Game.getObjectById(creep.memory.constrSite.id) == null)
    {
        delete creep.memory.constrSite;
        delete creep.memory.closestSource;

        if (creep.memory.reinforceSite == undefined
            && creep.memory.reinforceLocation != undefined)
        {
            const reinforceSiteList = Game.rooms[creep.memory.reinforceLocation.roomName].find(
                FIND_STRUCTURES,
                { filter: (s) => {
                    return (shouldBeReinforced(s.structureType)
                            && (s.pos.x == creep.memory.reinforceLocation.x
                                && s.pos.y == creep.memory.reinforceLocation.y));
                }});
            if (reinforceSiteList.length > 0) {
                creep.memory.reinforceSite = reinforceSiteList[0];
                creep.memory.state = STATE_REINFORCE;
            }
            delete creep.memory.reinforceLocation;
        }
        else if (constrSites.length > 0) {
            const constrSite = chooseConstructionSite(creep, constrSites);
            creep.memory.constrSite = constrSite;
            if (shouldBeReinforced(constrSite.structureType))
                creep.memory.reinforceLocation = constrSite.pos;
        }
    }
};

const shouldBeReinforced = function(structureType)
{
    return (structureType == STRUCTURE_RAMPART
            || structureType == STRUCTURE_WALL);
}

const collectEnergy = function(creep)
{
    if (creep.memory.closestSource == undefined) {
        let workSiteId = "";
        if (creep.memory.reinforceSite != undefined)
            workSiteId = creep.memory.reinforceSite.id;
        else if (creep.memory.constrSite != undefined)
            workSiteId = creep.memory.constrSite.id;
        const workSite = Game.getObjectById(workSiteId);
        const workLocation = (workSite != null) ? workSite.pos : creep.pos;
        creep.memory.closestSource = findClosestSourceFrom(workLocation);
    }
    const closestSource = Game.getObjectById(creep.memory.closestSource.id);
    common.harvestEnergy(creep, closestSource);
};

const findClosestSourceFrom = function(pos)
{
    let closestSource = pos.findClosestByPath(FIND_SOURCES);
    if (closestSource == null)
        closestSource = pos.findClosestByRange(FIND_SOURCES);
    return closestSource;
};

const build = function(creep)
{
    if (creep.memory.constrSite == undefined)
        return;
    const constructionTarget = Game.getObjectById(creep.memory.constrSite.id);
    if (creep.build(constructionTarget) == ERR_NOT_IN_RANGE) {
        common.pheromoveTo(constructionTarget, creep);
        // Might be in range now, try to build again
        creep.build(constructionTarget);
    }
};

const reinforce = function(creep)
{
    const reinforceTarget = Game.getObjectById(creep.memory.reinforceSite.id);
    if (creep.repair(reinforceTarget) == ERR_NOT_IN_RANGE) {
        common.pheromoveTo(reinforceTarget, creep);
        // Might be in range now, try to repair again
        creep.repair(reinforceTarget);
    }
};

const returnAndRecycle = function(creep)
{
    const spawner = Game.getObjectById(creep.memory.home.id);
    if ((creep.carry.energy > 0
         && creep.transfer(spawner, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
        || spawner.recycleCreep(creep) == ERR_NOT_IN_RANGE)
    {
        common.pheromoveTo(spawner, creep);
    }
};

const spawn = function(spawner)
{
    return spawner.spawnCreep(BODY_COMPOSITION, ROLE_NAME+'-'+Game.time, {
        memory: {
            role:  ROLE_NAME,
            state: STATE_COLLECT,
            home:  spawner
        }
    });
};

const chooseConstructionSite = function(creep, constrSites)
{
    return constrSites[0]; // TODO
};

const stateErrorPrint = function(creep)
{
    console.error('[STATE ERROR]: missing state for ' + ROLE_NAME + '. '
                  + 'creep: ' + creep.name
                  + ', state: ' + creep.memory.state);
};


module.exports = { run: run,
                   spawn: spawn };
