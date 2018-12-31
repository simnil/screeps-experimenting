const utils = require('utils');
const common = require('creep.common');

// CONSTANTS
// ---------------------------------------------------------
const ROLE_NAME = 'harvester1';
const BODY_COMPOSITION = [WORK, CARRY, MOVE];

const STATE_HARVEST = 0;
const STATE_DELIVER = 1;


// FUNCTIONS
// ---------------------------------------------------------
const run = function(creep)
{
    checkStateTransitionConditions(creep);
    switch (creep.memory.state) {
    case STATE_HARVEST:
        common.harvestEnergy(creep);
        break;
    case STATE_DELIVER:
        deliverEnergy(creep);
        break;

    default:
        common.stateErrorPrint(creep);
    }

};

const checkStateTransitionConditions = function(creep)
{
    if (creep.carry.energy == creep.carryCapacity)
        creep.memory.state = STATE_DELIVER;
    else if (creep.carry.energy == 0)
        creep.memory.state = STATE_HARVEST;
};

const deliverEnergy = function(creep)
{
    let targets = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => {
            return (s.structureType == STRUCTURE_EXTENSION
                    || s.structureType == STRUCTURE_SPAWN
                    || s.structureType == STRUCTURE_TOWER)
                && s.energy < s.energyCapacity;
        }
    });
    if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
            common.pheromoveTo(targets[0], creep);
    }
    else common.pheromoveTo(Game.getObjectById(creep.memory.home.id), creep);

};

const spawn = function(spawner)
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
