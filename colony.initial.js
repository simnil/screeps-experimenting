// MODULES, PARAMETERS, CONSTANTS AND SETS
// ---------------------------------------------------------
var roles = { harvester1: require('role.harvester1'),
              upgrader1: require('role.upgrader1') };

var rolePriorityOrder = ['harvester1', 'upgrader1'];
var minCreeps = { harvester1: 2,
                  upgrader1: 2 };


// MAIN LOOP
// ---------------------------------------------------------
var main = function(spawner) {

    if (!spawner.spawning
        && !maintainMinimumCreepCount(spawner))
        spawnExtraCreeps(spawner);
};


// FUNCTIONS
// ---------------------------------------------------------
var maintainMinimumCreepCount = function(spawner) {
    for (var i = 0; i < rolePriorityOrder.length; i++) {
        var role = rolePriorityOrder[i];
        var numCreepsWithRole = _.sum(Game.creeps, (c) => c.memory.role == role);

        if (numCreepsWithRole < minCreeps[role] && !spawner.spawning) {
            // TODO provide custom spawn function in role module
            var status = roles[role].spawn(spawner);
            if (status == OK)
                console.log('Spawning creep type: ' + role);
            return true;
        }
    }
    return false;
};

var spawnExtraCreeps = function(spawner) {
    if (spawner.room.energyAvailable > 0.9*spawner.room.energyCapacityAvailable) {
        // TODO put spawner function in role module
        var role = 'upgrader1';
        var name = role + Game.time;
        var status = spawner.spawnCreep([WORK, CARRY, MOVE], name, {
            memory: { role: role }});
        if (status == OK)
            console.log('Spawning extra ' + role + ': ' + name);
    }
};

var updateCreeps = function() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        roles[creep.memory.role].run(creep);
    }
};


module.exports = { main: main };
