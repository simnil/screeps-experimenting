var utils = require('utils');

// CONSTANTS
// ---------------------------------------------------------
var ROLE_NAME = 'upgrader1'
var BODY_COMPOSITION = [WORK, CARRY, MOVE];

var STATE_HARVEST = 0;
var STATE_UPGRADE = 1;


// FUNCTIONS
// ---------------------------------------------------------
var run = function(creep) {
    if (creep.memory.state == STATE_HARVEST
        && creep.carry.energy < creep.carryCapacity) {
        let source = Game.getObjectById(creep.memory.designatedSource.id);
        if (creep.harvest(source) == ERR_NOT_IN_RANGE)
            creep.moveTo(source);
    }
    else {
        creep.memory.state = STATE_UPGRADE;
        let controller = creep.room.controller;
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE)
            creep.moveTo(controller);
    }

    if (creep.carry.energy == 0)
        creep.memory.state = STATE_HARVEST;
};


var spawn = function(spawner) {
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
