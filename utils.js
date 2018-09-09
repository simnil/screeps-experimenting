var computeSourceDistribution = function(spawner) {
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

var chooseHarvestSource = function(spawner) {
    var sources = spawner.room.find(FIND_SOURCES);
    if (spawner.memory.cumulativeSourceDistribution != undefined) {
        let r = Math.random();
        let cumSrcDist = spawner.memory.cumulativeSourceDistribution;
        for (let i = 0; i < cumSrcDist.length; i++)
            if (r < cumSrcDist[i])
                return sources[i];
    }
    else return sources[0];
};


module.exports = {
    computeSourceDistribution: computeSourceDistribution,
    chooseHarvestSource: chooseHarvestSource
};