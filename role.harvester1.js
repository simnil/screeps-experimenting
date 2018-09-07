var utils = require('utils');

// CONSTANTS
// ---------------------------------------------------------
var ROLE_NAME = 'harvester1';
var BODY_COMPOSITION = [WORK, CARRY, MOVE];

var STATE_HARVEST = 0;
var STATE_DELIVER = 1;


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
        creep.memory.state = STATE_DELIVER;
        let targets = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return (s.structureType == STRUCTURE_EXTENSION
                        || s.structureType == STRUCTURE_SPAWN
                        || s.structureType == STRUCTURE_TOWER)
                    && s.energy < s.energyCapacity;
            }
        });
        if (targets.length > 0) {
            if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        }
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
            state: 0,
            home:  spawner,
            designatedSource: utils.chooseHarvestSource(spawner)
        }});
};


module.exports = { run: run,
                   spawn: spawn };
