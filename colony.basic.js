// MODULES, PARAMETERS, CONSTANTS AND SETS
// ---------------------------------------------------------
var utils = require('utils');
var roles = { harvester1: require('role.harvester1'),
              upgrader1: require('role.upgrader1'),
              builder1: require('role.builder1') };
var rolePriorityOrder = ['harvester1', 'upgrader1'];
var minCreeps = { harvester1: 3,
                  upgrader1: 3,
                  builder1: 0 };
var maxCreeps = { harvester1: 4,
                  upgrader1: 4,
                  builder1: 6 };


// MAIN LOOP
// ---------------------------------------------------------
var main = function(spawner)
{
    if (spawner.memory.cumulativeSourceDistribution == undefined)
        utils.computeSourceDistribution(spawner);

    if (!spawner.spawning
        && !maintainMinimumCreepCount(spawner)) {
        let numBuilders = _.sum(Game.creeps, (c) => c.memory.role == 'builder1');
        if (spawner.room.find(FIND_MY_CONSTRUCTION_SITES).length > 0
            && numBuilders < maxCreeps['builder1']) {
            let status = roles['builder1'].spawn(spawner);
            if (status == OK)
                console.log('Spawning builder1');
        }
    }
};


// FUNCTIONS
// ---------------------------------------------------------
var maintainMinimumCreepCount = function(spawner)
{
    for (var i = 0; i < rolePriorityOrder.length; i++) {
        let role = rolePriorityOrder[i];
        let numCreepsWithRole = _.sum(Game.creeps, (c) => c.memory.role == role);

        if (numCreepsWithRole < minCreeps[role]) {
            let status = roles[role].spawn(spawner);
            if (status == OK)
                console.log('Spawning creep type: ' + role);
            return true;
        }
    }
    return false;
};


module.exports = { main: main };
