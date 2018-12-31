// MODULES, PARAMETERS, CONSTANTS AND SETS
// ---------------------------------------------------------
const utils = require('utils');
const roles = { harvester1: require('role.harvester1'),
                upgrader1: require('role.upgrader1'),
                builder1: require('role.builder1'),
                maintainer1: require('role.maintainer1') };
const rolePriorityOrder = ['harvester1', 'upgrader1'];
const minCreeps = { harvester1: 3,
                    upgrader1: 3,
                    builder1: 3,
                    maintainer1: 1 };
const maxCreeps = { harvester1: 3,
                    upgrader1: 4,
                    builder1: 4,
                    maintainer1: 2 };

const maintenanceFilter = {
    filter: (s) => {
        if (s.structureType == STRUCTURE_RAMPART)
            return s.hits < 25000;
        return ((s.structureType != STRUCTURE_ROAD
                 && s.structureType != STRUCTURE_WALL)
                && s.hits < 0.9*s.hitsMax);
    }
};


// MAIN LOOP
// ---------------------------------------------------------
const main = function(spawner)
{
    if (spawner.memory.cumulativeSourceDistribution == undefined)
        utils.computeSourceDistribution(spawner);

    if (!spawner.spawning
        && !maintainCriticalCreepCount(spawner)
        && !maintainMinimumMaintainerCount(spawner)
        && !maintainMinimumBuilderCount(spawner))
    {
        spawnExtraCreeps(spawner);
    }
};


// FUNCTIONS
// ---------------------------------------------------------
const maintainCriticalCreepCount = function(spawner)
{
    for (let i = 0; i < rolePriorityOrder.length; ++i) {
        const role = rolePriorityOrder[i];
        const numCreepsWithRole = utils.countCreepType(role);

        if (numCreepsWithRole < minCreeps[role]) {
            const status = roles[role].spawn(spawner);
            if (status == OK)
                console.log('Spawning creep type: ' + role);
            return true;
        }
    }
    return false;
};

const maintainMinimumBuilderCount = function(spawner)
{
    if (spawner.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0
        && utils.countCreepType('builder1') < minCreeps['builder1'])
    {
        const status = roles['builder1'].spawn(spawner);
        if (status == OK) {
            console.log('Spawning creep type: builder1');
            return true;
        }
    }
    return false;
};

const maintainMinimumMaintainerCount = function(spawner)
{
    const repairSites = spawner.room.find(FIND_MY_STRUCTURES, maintenanceFilter);
    if (repairSites.length > 0
        && utils.countCreepType('maintainer1') < minCreeps['maintainer1'])
    {
        const status = roles['maintainer1'].spawn(spawner);
        if (status == OK) {
            console.log('Spawning creep type: maintainer1');
            return true;
        }
    }
    return false;
};

const spawnExtraCreeps = function(spawner)
{
    const numHarvesters = utils.countCreepType('harvester1');
    const numUpgraders = utils.countCreepType('upgrader1');
    const numBuilders =
          (spawner.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) ?
          utils.countCreepType('builder1') : Number.MAX_SAFE_INTEGER;
    const numMaintainers =
          (spawner.room.find(FIND_MY_STRUCTURES, maintenanceFilter).length > 0) ?
          utils.countCreepType('maintainer1') : Number.MAX_SAFE_INTEGER;

    let creepRole = null;
    if (numHarvesters < maxCreeps['harvester1']
        && numHarvesters <= numUpgraders
        && numHarvesters <= numBuilders)
        creepRole = 'harvester1';
    else if (numUpgraders < maxCreeps['upgrader1']
             && numUpgraders <= numBuilders)
        creepRole = 'upgrader1';
    else if (numBuilders < maxCreeps['builder1'])
        creepRole = 'builder1';
    else if (numMaintainers < maxCreeps['maintainer1'])
        creepRole = 'maintainer1';

    if (creepRole != null) {
        const status = roles[creepRole].spawn(spawner);
        if (status == OK) {
            console.log('Spawning extra ' + creepRole);
            return true;
        }
    }
    return false;
};


module.exports = { main: main };
