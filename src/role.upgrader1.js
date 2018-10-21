const utils = require('utils');
const common = require('creep.common');

// CONSTANTS
// ---------------------------------------------------------
const ROLE_NAME = 'upgrader1'
const BODY_COMPOSITION = [WORK, CARRY, MOVE];

const STATE_HARVEST = 0;
const STATE_UPGRADE = 1;


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
        common.pheromoveTo(controller, creep);
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
