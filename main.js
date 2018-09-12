// MODULES, PARAMETERS, CONSTANTS AND SETS
// ---------------------------------------------------------
var colonies = { initial: require('colony.initial'),
                 basic: require('colony.basic') };

var roles = { harvester1: require('role.harvester1'),
              upgrader1: require('role.upgrader1'),
              builder1: require('role.builder1') };


// MAIN LOOP
// ---------------------------------------------------------
var main = function() {

    clearDeadCreepsFromMemory();

    for (let spawnerName in Game.spawns) {
        let spawner = Game.spawns[spawnerName];

        let controllerLevel = spawner.room.controller.level;
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
    for (let name in Memory.creeps)
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory: ' + name)
        }
};

var updateCreeps = function() {
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        roles[creep.memory.role].run(creep);
    }
};


module.exports = { loop: main };
