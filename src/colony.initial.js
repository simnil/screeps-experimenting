// MODULES, PARAMETERS, CONSTANTS AND SETS
// ---------------------------------------------------------
const utils = require('utils');
const roles = { harvester1: require('role.harvester1'),
                upgrader1: require('role.upgrader1') };

const rolePriorityOrder = ['harvester1', 'upgrader1'];
const minCreeps = { harvester1: 2,
                    upgrader1: 2 };


// MAIN LOOP
// ---------------------------------------------------------
const main = function(spawner)
{
    if (spawner.memory.cumulativeSourceDistribution == undefined)
        utils.computeSourceDistribution(spawner);

    if (!spawner.spawning
        && !maintainMinimumCreepCount(spawner))
        spawnExtraCreeps(spawner);
};


// FUNCTIONS
// ---------------------------------------------------------
const maintainMinimumCreepCount = function(spawner)
{
    for (let i = 0; i < rolePriorityOrder.length; i++) {
        const role = rolePriorityOrder[i];
        const numCreepsWithRole = utils.countCreepType(role);

        if (numCreepsWithRole < minCreeps[role]) {
            let status = roles[role].spawn(spawner);
            if (status == OK)
                console.log('Spawning creep type: ' + role);
            return true;
        }
    }
    return false;
};

const spawnExtraCreeps = function(spawner)
{
    if (spawner.room.energyAvailable > 0.9*spawner.room.energyCapacityAvailable) {
        const status = roles['upgrader1'].spawn(spawner);
        if (status == OK)
            console.log('Spawning extra upgrader1');
    }
};


module.exports = { main: main };
