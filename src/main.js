// MODULES, PARAMETERS, CONSTANTS AND SETS
// ---------------------------------------------------------
const utils = require('utils');
const colonies = { initial: require('colony.initial'),
                   basic: require('colony.basic') };

const roles = { harvester1: require('role.harvester1'),
                upgrader1: require('role.upgrader1'),
                builder1: require('role.builder1'),
                maintainer1: require('role.maintainer1') };
const MAX_NUM_PLANNED_PATHS = 10;
const MIN_NUM_PLANNED_PATHS = 5;


// MAIN LOOP
// ---------------------------------------------------------
const main = function()
{
    clearDeadCreepsFromMemory();
    initializePheromoneTrails();

    for (let spawnerName in Game.spawns) {
        const spawner = Game.spawns[spawnerName];
        const controllerLevel = spawner.room.controller.level;
        if (controllerLevel == 1)
            colonies['initial'].main(spawner);
        else // @incomplete: only 2 stages of a colony
            colonies['basic'].main(spawner);
    }

    updateCreeps();
    evaporatePheromones();

    const numPlannedPaths = numberOfPlannedPathsByRoom();
    for (let room in numPlannedPaths)
        if (numPlannedPaths[room] < MIN_NUM_PLANNED_PATHS)
            createPaths(room, MAX_NUM_PLANNED_PATHS - numPlannedPaths[room]);
};


// FUNCTIONS
// ---------------------------------------------------------
const clearDeadCreepsFromMemory = function()
{
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory: ' + name)
        }
    }
};

const initializePheromoneTrails = function()
{
    if (Memory.pheromoneTrails == undefined)
        Memory.pheromoneTrails = {};

    for (let s in Game.spawns) {
        const spawn = Game.spawns[s];
        if (Memory.pheromoneTrails[spawn.room.name] == undefined)
            Memory.pheromoneTrails[spawn.room.name] = {};
    }
    for (let c in Game.creeps) {
        const creep = Game.creeps[c];
        if (Memory.pheromoneTrails[creep.room.name] == undefined)
            Memory.pheromoneTrails[creep.room.name] = {};
    }
};

const numberOfPlannedPathsByRoom = function()
{
    let plannedPathsInRoom = {};
    // All rooms containing creeps will have pheromone trails and it's unlikely
    // that a room without any pheromones will contain a (useful) planned road,
    // so it will be ignored
    for (let roomName in Memory.pheromoneTrails) {
        // Can only access rooms with creeps in, so previously visible rooms
        // might not be visible this tick
        if (Game.rooms[roomName] == undefined) continue;
        const roads = Game.rooms[roomName].find(FIND_MY_CONSTRUCTION_SITES, {
            filter: { structureType: STRUCTURE_ROAD }
        });
        plannedPathsInRoom[roomName] = roads.length;
    }
    return plannedPathsInRoom;
};

const updateCreeps = function()
{
    for (let name in Game.creeps) {
        const creep = Game.creeps[name];
        roles[creep.memory.role].run(creep);
    }
};

const evaporatePheromones = function()
{
    const evaporationRate = 0.012;
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

const createPaths = function(roomName, maxNumberOfNewPaths)
{
    const pheromoneThreshold = 3.0;
    for (let posint in Memory.pheromoneTrails[roomName]) {
        if (maxNumberOfNewPaths == 0)
            break;
        if (Memory.pheromoneTrails[roomName][posint] > pheromoneThreshold) {
            const pos = utils.int2pos(roomName, posint);
            const status = Game.rooms[roomName].createConstructionSite(
                pos.x, pos.y, STRUCTURE_ROAD);
            if (status == OK) {
                maxNumberOfNewPaths -= 1;
                delete Memory.pheromoneTrails[roomName][posint];
            }
        }
    }
};


module.exports = { loop: main };
