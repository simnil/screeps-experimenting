var ROLE_NAME = 'harvester1';

var STATE_HARVEST = 0;
var STATE_DELIVER = 1;


var run = function(creep) {
    if (!(creep.memory.state == STATE_DELIVER)
        && creep.carry.energy < creep.carryCapacity) {
        // TODO move harvest target to memory, set when spawned
        var sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE)
            creep.moveTo(sources[0]);
    }
    else {
        creep.memory.state = STATE_DELIVER;
        var targets = creep.room.find(FIND_STRUCTURES, {
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
    return spawner.spawnCreep([WORK, CARRY, MOVE], ROLE_NAME+'-'+Game.time, {
        memory: {
            role:  ROLE_NAME,
            state: 0,
            home:  spawner
        }});
};


module.exports = { run: run,
                   spawn: spawn };
