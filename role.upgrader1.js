var ROLE_NAME = 'upgrader1'

var STATE_HARVEST = 0;
var STATE_UPGRADE = 1;


var run = function(creep) {
    if (creep.memory.state == STATE_HARVEST
        && creep.carry.energy < creep.carryCapacity) {
        // TODO move harvesting target to memory, set when spawned
        var sources = creep.room.find(FIND_SOURCES);
        if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE)
            creep.moveTo(sources[0]);
    }
    else {
        creep.memory.state = STATE_UPGRADE;
        var controller = creep.room.controller;
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE)
            creep.moveTo(controller);
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
