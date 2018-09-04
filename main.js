// MODULES, PARAMETERS, CONSTANTS AND SETS
// ---------------------------------------------------------
var colonies = { initial: require('colony.initial'),
                 basic: require('colony.initial') }; // @incomplete: temporarily does the same thing

var roles = { harvester1: require('role.harvester1'),
              upgrader1: require('role.upgrader1') };


// MAIN LOOP
// ---------------------------------------------------------
var main = function() {

    clearDeadCreepsFromMemory();

    for (var spawnerName in Game.spawns) {
        var spawner = Game.spawns[spawnerName];

        var controllerLevel = spawner.room.controller.level;
        if (controllerLevel == 1)
            colonies['initial'].main(spawner);
        else // @incomplete: only 2 stages of a colony
            colonies['basic'].main(spawner);
    }

    updateCreeps();
};


// FUNCTIONS
// ---------------------------------------------------------
var clearDeadCreepsFromMemory = function() {
    for (var name in Memory.creeps)
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory: ' + name)
        }
};

var updateCreeps = function() {
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        roles[creep.memory.role].run(creep);
    }
};


module.exports = { loop: main };
