// MODULES, PARAMETERS, CONSTANTS AND SETS
// ---------------------------------------------------------
var utils = require('utils');
var roles = { harvester1: require('role.harvester1'),
              upgrader1: require('role.upgrader1') };

var rolePriorityOrder = ['harvester1', 'upgrader1'];
var minCreeps = { harvester1: 2,
                  upgrader1: 2 };


// MAIN LOOP
// ---------------------------------------------------------
var main = function(spawner) {
    if (spawner.memory.cumulativeSourceDistribution == undefined)
        utils.computeSourceDistribution(spawner);

    if (!spawner.spawning
        && !maintainMinimumCreepCount(spawner))
        spawnExtraCreeps(spawner);
};


// FUNCTIONS
// ---------------------------------------------------------
var maintainMinimumCreepCount = function(spawner) {
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

var spawnExtraCreeps = function(spawner) {
    if (spawner.room.energyAvailable > 0.9*spawner.room.energyCapacityAvailable) {
        let status = roles['upgrader1'].spawn(spawner);
        if (status == OK)
            console.log('Spawning extra upgrader1');
    }
};


module.exports = { main: main };
