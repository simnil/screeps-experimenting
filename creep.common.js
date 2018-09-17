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
        creep.moveTo(source);
};


module.exports = { stateErrorPrint: stateErrorPrint,
                   harvestEnergy: harvestEnergy };
