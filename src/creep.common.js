var utils = require('utils');

// CONSTANTS
// ---------------------------------------------------------


// FUNCTIONS
// ---------------------------------------------------------
var stateErrorPrint = function(creep)
{
    console.log('State Error: missing state for ' + ROLE_NAME + '. '
                + 'creep: ' + creep.name
                + ', state: ' + creep.memory.state);
};

var harvestEnergy = function(creep)
{
    let source = Game.getObjectById(creep.memory.designatedSource.id);
    if (creep.harvest(source) == ERR_NOT_IN_RANGE)
        pheromoveTo(source, creep);
};

var pheromoveTo = function(target, creep)
{
    const moveStatus = creep.moveTo(target);
    if (moveStatus == OK || moveStatus == ERR_TIRED)
        depositPheromones(creep);
}

var depositPheromones = function(creep)
{
    if (Memory.pheromoneTrails[creep.room.name] == undefined)
        Memory.pheromoneTrails[creep.room.name] = {};
    Memory.pheromoneTrails[creep.room.name][utils.pos2int(creep.pos)] += 1.0;
}

module.exports = { stateErrorPrint: stateErrorPrint,
                   harvestEnergy: harvestEnergy,
                   pheromoveTo: pheromoveTo,
                   depositPheromones: depositPheromones };
