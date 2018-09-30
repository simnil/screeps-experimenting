// MODULES, PARAMETERS, CONSTANTS AND SETS
// ---------------------------------------------------------
var utils = require('utils');
var roles = { harvester1: require('role.harvester1'),
              upgrader1: require('role.upgrader1'),
              builder1: require('role.builder1') };
var rolePriorityOrder = ['harvester1', 'upgrader1'];
var minCreeps = { harvester1: 3,
                  upgrader1: 3,
                  builder1: 3 };
var maxCreeps = { harvester1: 4,
                  upgrader1: 6,
                  builder1: 6 };


// MAIN LOOP
// ---------------------------------------------------------
var main = function(spawner)
{
    if (spawner.memory.cumulativeSourceDistribution == undefined)
        utils.computeSourceDistribution(spawner);

    if (!spawner.spawning
        && !maintainCriticalCreepCount(spawner)
        && !maintainMinimumBuilderCount(spawner))
        spawnExtraCreeps(spawner);
};


// FUNCTIONS
// ---------------------------------------------------------
var maintainCriticalCreepCount = function(spawner)
{
    for (var i = 0; i < rolePriorityOrder.length; i++) {
        let role = rolePriorityOrder[i];
        let numCreepsWithRole = utils.countCreepType(role);

        if (numCreepsWithRole < minCreeps[role]) {
            let status = roles[role].spawn(spawner);
            if (status == OK)
                console.log('Spawning creep type: ' + role);
            return true;
        }
    }
    return false;
};

var maintainMinimumBuilderCount = function(spawner)
{
    if (spawner.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0
        && utils.countCreepType('builder1') < minCreeps['builder1'])
    {
        let status = roles['builder1'].spawn(spawner);
        if (status == OK) {
            console.log('Spawning creep type: builder1');
            return true;
        }
    }
    return false;
}

var spawnExtraCreeps = function(spawner)
{
    let numHarvesters = utils.countCreepType('harvester1');
    let numUpgraders = utils.countCreepType('upgrader1');
    let numBuilders =
        (spawner.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0) ?
        utils.countCreepType('builder1') : Number.MAX_SAFE_INTEGER;

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

    if (creepRole != null) {
        let status = roles[creepRole].spawn(spawner);
        if (status == OK) {
            console.log('Spawning extra ' + creepRole);
            return true;
        }
    }
    return false;
};


module.exports = { main: main };
