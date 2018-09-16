// MODULES, PARAMETERS, CONSTANTS AND SETS
// ---------------------------------------------------------
var utils = require('utils');
var colonies = { initial: require('colony.initial'),
                 basic: require('colony.basic') };

var roles = { harvester1: require('role.harvester1'),
              upgrader1: require('role.upgrader1'),
              builder1: require('role.builder1') };
var MAX_NUM_PLANNED_PATHS = 10;


// MAIN LOOP
// ---------------------------------------------------------
var main = function()
{
    clearDeadCreepsFromMemory();
    initializePheromoneTrails();

    for (let spawnerName in Game.spawns) {
        let spawner = Game.spawns[spawnerName];
        let controllerLevel = spawner.room.controller.level;
        if (controllerLevel == 1)
            colonies['initial'].main(spawner);
        else // @incomplete: only 2 stages of a colony
            colonies['basic'].main(spawner);
    }

    updateCreeps();
    dissipatePheromones();
    if (numberOfPlannedPaths() < MAX_NUM_PLANNED_PATHS)
        createPaths();
};


// FUNCTIONS
// ---------------------------------------------------------
var clearDeadCreepsFromMemory = function()
{
    for (let name in Memory.creeps)
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory: ' + name)
        }
};

var initializePheromoneTrails = function()
{
    if (Memory.pheromoneTrails == undefined)
        Memory.pheromoneTrails = {};

    for (let c in Game.creeps) {
        let creep = Game.creeps[c];
        if (Memory.pheromoneTrails[creep.room.name] == undefined)
            Memory.pheromoneTrails[creep.room.name] = {};
    }
};

var numberOfPlannedPaths = function()
{
    let roads = Game.spawns['Spawn1'].room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: { structureType: STRUCTURE_ROAD }
    });
    return roads.length;
};

var updateCreeps = function()
{
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        roles[creep.memory.role].run(creep);
        depositPheromones(creep);
    }
};

var depositPheromones = function(creep)
{
    Memory.pheromoneTrails[creep.room.name][utils.pos2int(creep.pos)] += 1.0;
};

var dissipatePheromones = function()
{
    let dissipationRate = 0.05;
    for (let room in Memory.pheromoneTrails) {
        for (let posint in Memory.pheromoneTrails[room]) {
            Memory.pheromoneTrails[room][posint] *= 1 - dissipationRate;

            if (Memory.pheromoneTrails[room][posint] < 0.1
                || Memory.pheromoneTrails[room][posint] == null)
                delete Memory.pheromoneTrails[room][posint];
        }
    }
};

var createPaths = function()
{
    let pheromoneThreshold = 3.5;
    for (let room in Memory.pheromoneTrails)
        for (let posint in Memory.pheromoneTrails[room])
            if (Memory.pheromoneTrails[room][posint] > pheromoneThreshold) {
                let pos = utils.int2pos(room, posint);
                let status = Game.rooms[room].createConstructionSite(
                    pos.x, pos.y, STRUCTURE_ROAD);
                if (status == OK)
                    delete Memory.pheromoneTrails[room][posint];
            }
};


module.exports = { loop: main };
