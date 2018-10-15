// MODULES, PARAMETERS, CONSTANTS AND SETS
// ---------------------------------------------------------
var utils = require('utils');
var colonies = { initial: require('colony.initial'),
                 basic: require('colony.basic') };

var roles = { harvester1: require('role.harvester1'),
              upgrader1: require('role.upgrader1'),
              builder1: require('role.builder1') };
var MAX_NUM_PLANNED_PATHS = 10;
var MIN_NUM_PLANNED_PATHS = 5;


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
    evaporatePheromones();

    let numPlannedPaths = numberOfPlannedPathsByRoom();
    for (let room in numPlannedPaths)
        if (numPlannedPaths[room] < MIN_NUM_PLANNED_PATHS)
            createPaths(room, MAX_NUM_PLANNED_PATHS - numPlannedPaths[room]);
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

    for (let s in Game.spawns) {
        let spawn = Game.spawns[s];
        if (Memory.pheromoneTrails[spawn.room.name] == undefined)
            Memory.pheromoneTrails[spawn.room.name] = {};
    }
    for (let c in Game.creeps) {
        let creep = Game.creeps[c];
        if (Memory.pheromoneTrails[creep.room.name] == undefined)
            Memory.pheromoneTrails[creep.room.name] = {};
    }
};

var numberOfPlannedPathsByRoom = function()
{
    let plannedPathsInRoom = {};
    // All rooms containing creeps will have pheromone trails and it's unlikely
    // that a room without any pheromones will contain a (useful) planned road,
    // so it will be ignored
    for (let roomName in Memory.pheromoneTrails) {
        // Can only access rooms with creeps in, so previously visible rooms
        // might not be visible this tick
        if (Game.rooms[roomName] == undefined) continue;
        let roads = Game.rooms[roomName].find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_ROAD }
        });
        plannedPathsInRoom[roomName] = roads.length;
    }
    return plannedPathsInRoom;
};

var updateCreeps = function()
{
    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        roles[creep.memory.role].run(creep);
    }
};

var evaporatePheromones = function()
{
    let evaporationRate = 0.012;
    for (let room in Memory.pheromoneTrails) {
        for (let posint in Memory.pheromoneTrails[room]) {
            Memory.pheromoneTrails[room][posint] *= 1 - evaporationRate;

            if (Memory.pheromoneTrails[room][posint] < 0.1
                || Memory.pheromoneTrails[room][posint] == null)
                delete Memory.pheromoneTrails[room][posint];
        }
        if (_.keys(Memory.pheromoneTrails[room]).length == 0)
            delete Memory.pheromoneTrails[room];
    }
};

var createPaths = function(roomName, maxNumberOfNewPaths)
{
    let pheromoneThreshold = 3.0;
    for (let posint in Memory.pheromoneTrails[roomName]) {
        if (maxNumberOfNewPaths == 0)
            break;
        if (Memory.pheromoneTrails[roomName][posint] > pheromoneThreshold) {
            let pos = utils.int2pos(roomName, posint);
            let status = Game.rooms[roomName].createConstructionSite(
                pos.x, pos.y, STRUCTURE_ROAD);
            if (status == OK) {
                maxNumberOfNewPaths -= 1;
                delete Memory.pheromoneTrails[roomName][posint];
            }
        }
    }
};


module.exports = { loop: main };
