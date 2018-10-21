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

var harvestEnergy = function(creep, designatedSource = null)
{
    if (designatedSource == null)
        designatedSource = Game.getObjectById(creep.memory.designatedSource.id);
    const closestDroppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
    if (closestDroppedEnergy != null
        && (utils.distanceSquared(creep.pos, closestDroppedEnergy.pos)
            < utils.distanceSquared(creep.pos, designatedSource.pos)))
    {
        if (creep.pickup(closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
            pheromoveTo(closestDroppedEnergy, creep);
            // Might be in range now, so try to pick up again
            creep.pickup(closestDroppedEnergy);
        }
    }
    else {
        const harvestStatus = creep.harvest(designatedSource);
        if (harvestStatus == ERR_NOT_IN_RANGE) {
            pheromoveTo(designatedSource, creep);
            // Might be in range now, so try to harvest again
            creep.harvest(designatedSource);
        }
        else if (harvestStatus == OK)
            // (Naively) move out of the way so others can harvest
            creep.move(utils.directionBetween(designatedSource.pos,
                                              creep.pos));
    }
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
