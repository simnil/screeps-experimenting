// CONSTANTS
// ---------------------------------------------------------
const ROOM_SIZE = 50;


// FUNCTIONS
// ---------------------------------------------------------
const computeSourceDistribution = function(spawner)
{
    let cumulativeSourceGains = []; // Gain = 1 / movement cost
    let totalGain = 0;
    let sources = spawner.room.find(FIND_SOURCES);

    for (let i = 0; i < sources.length; i++) {
        let sourceGain = 1.0 / PathFinder.search(
            spawner.pos, {
                pos: sources[i].pos,
                range: 1 }
        ).cost;
        totalGain += sourceGain;
        cumulativeSourceGains.push(totalGain);
    }

    for (let i = 0; i < cumulativeSourceGains.length; i++)
        cumulativeSourceGains[i] /= totalGain;

    spawner.memory.cumulativeSourceDistribution = cumulativeSourceGains;
};

const chooseHarvestSource = function(spawner)
{
    const sources = spawner.room.find(FIND_SOURCES);
    if (spawner.memory.cumulativeSourceDistribution != undefined) {
        const r = Math.random();
        const cumSrcDist = spawner.memory.cumulativeSourceDistribution;
        for (let i = 0; i < cumSrcDist.length; ++i)
            if (r < cumSrcDist[i])
                return sources[i];
    }
    else return sources[0];
};

const pos2int = function(roomPos)
{
    return ROOM_SIZE * roomPos.y + roomPos.x;
};

const int2pos = function(roomName, i)
{
    const x = i % ROOM_SIZE;
    const y = Math.floor(i / ROOM_SIZE);
    return Game.rooms[roomName].getPositionAt(x, y);
};

const countCreepType = function(role)
{
    return _.sum(Game.creeps, (c) => c.memory.role == role);
};

const distanceSquared = function(pos1, pos2)
{
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return dx*dx + dy*dy;
};

const directionBetween = function(pos1, pos2)
{
    const angle = Math.atan2(pos1.y - pos2.y, // positive y-direction is downward
                             pos2.x - pos1.x);
    const PI_OVER_EIGHT = Math.PI / 8.0;

    if (angle >= -PI_OVER_EIGHT && angle < PI_OVER_EIGHT)
        return RIGHT;
    else if (angle >= PI_OVER_EIGHT && angle < 3*PI_OVER_EIGHT)
        return TOP_RIGHT;
    else if (angle >= 3*PI_OVER_EIGHT && angle < 5*PI_OVER_EIGHT)
        return TOP;
    else if (angle >= 5*PI_OVER_EIGHT && angle < 7*PI_OVER_EIGHT)
        return TOP_LEFT;
    else if (angle >= 7*PI_OVER_EIGHT || angle < -7*PI_OVER_EIGHT)
        return LEFT;
    else if (angle >= -7*PI_OVER_EIGHT && angle < -5*PI_OVER_EIGHT)
        return BOTTOM_LEFT;
    else if (angle >= -5*PI_OVER_EIGHT && angle < -3*PI_OVER_EIGHT)
        return BOTTOM;
    else if (angle >= -3*PI_OVER_EIGHT && angle < -PI_OVER_EIGHT)
        return BOTTOM_RIGHT;
    else {
        console.error('[utils::directionBetween] ERROR: uncaught case');
        return RIGHT;
    }

}


module.exports = { chooseHarvestSource: chooseHarvestSource,
                   computeSourceDistribution: computeSourceDistribution,
                   countCreepType: countCreepType,
                   directionBetween: directionBetween,
                   distanceSquared: distanceSquared,
                   int2pos: int2pos,
                   pos2int: pos2int,
                 };
