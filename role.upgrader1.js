var utils = require('utils');
var common = require('creep.common');

// CONSTANTS
// ---------------------------------------------------------
var ROLE_NAME = 'upgrader1'
var BODY_COMPOSITION = [WORK, CARRY, MOVE];

var STATE_HARVEST = 0;
var STATE_UPGRADE = 1;


// FUNCTIONS
// ---------------------------------------------------------
var run = function(creep)
{
    checkStateTransitionConditions(creep);
    switch(creep.memory.state) {
    case STATE_HARVEST:
        common.harvestEnergy(creep);
        break
    case STATE_UPGRADE:
        upgradeController(creep);
        break;

    default:
        common.stateErrorPrint(creep);
    }
};

var checkStateTransitionConditions = function(creep)
{
    if (creep.carry.energy == creep.carryCapacity)
        creep.memory.state = STATE_UPGRADE;
    else if (creep.carry.energy == 0)
        creep.memory.state = STATE_HARVEST;
};

var upgradeController = function(creep)
{
    let controller = creep.room.controller;
    if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE)
        creep.moveTo(controller);
};

var spawn = function(spawner)
{
    let testStatus = spawner.spawnCreep(BODY_COMPOSITION, 'dummy',
                                        { dryRun: true });
    if (testStatus != OK) return testStatus;

    return spawner.spawnCreep(BODY_COMPOSITION, ROLE_NAME+'-'+Game.time, {
        memory: {
            role:  ROLE_NAME,
            state: STATE_HARVEST,
            home:  spawner,
            designatedSource: utils.chooseHarvestSource(spawner)
        }});
};


module.exports = { run: run,
                   spawn: spawn };
