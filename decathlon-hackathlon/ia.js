/**
 * Grab the ball and try to throw it through the opponent's goal!
 * Move towards the ball and use your team id to determine where you need to throw it.
 **/

var myTeamId = parseInt(readline()); // if 0 you need to score on the right of the map, if 1 you need to score on the left

var rightGoal = {
    poleTop: {
        center: {x: 16000, y: 1750},
        target: {x: 16000, y: 2650}
    },
    center: {x: 16000, y: 3750},
    poleBottom: {
        center: {x: 16000, y: 5750},
        target: {x: 16000, y: 4850}
    }
};

var leftGoal = {
    poleTop: {
        center: {x: 0, y: 1750},
        target: {x: 0, y: 2650}
    },
    center: {x: 0, y: 3750},
    poleBottom: {
        center: {x: 0, y: 5750},
        target: {x: 0, y: 4850}
    }
};

if (myTeamId === 0) {
    var myGoal = leftGoal;
    var opponentGoal = rightGoal;
    var teamIndex = 0;
    var direction = 1;
} else {
    var myGoal = rightGoal;
    var opponentGoal = leftGoal;
    var teamIndex = 4;
    var direction = -1;
}

var attackerPlayer = {
    id: 3,
    x: null,
    y: null,
    base: {x: 8000 + direction * 4000, y: 3750},
    delta: {x: 2000}
};
var centerPlayer = {
    id: 1,
    x: null,
    y: null,
    base: null,
    delta: {x: 3000}
};

var ballFirstCoord = null;
var myShootStatus = {playerId : null, canShoot : false};

// game loop
while (true) {
    var entities = parseInt(readline()); // number of entities still in game
    var opponents = [
        {x: opponentGoal.poleTop.center.x, y: opponentGoal.poleTop.center.y},
        {x: opponentGoal.poleBottom.center.x, y: opponentGoal.poleBottom.center.y}
    ];
    var footballers = [];
    myShootStatus.canShoot = false;

    for (var i = 0; i < entities; i++) {
        var inputs = readline().split(' ');
        var entityId = parseInt(inputs[0]); // entity identifier
        var entityType = inputs[1]; // "FOOTBALLER", "OPPONENT" or "BALL"
        var x = parseInt(inputs[2]); // position
        var y = parseInt(inputs[3]); // position
        var vx = parseInt(inputs[4]); // velocity
        var vy = parseInt(inputs[5]); // velocity
        var state = parseInt(inputs[6]); // 1 if the footballer is holding the ball, 0 otherwise

        if (entityType === "BALL") {
            centerPlayer.base = centerPlayer.base === null ? {x: x, y: y} : centerPlayer.base;
            var ball = {x: x, y: y, vx: vx, vy: vy};
        } else if (entityType === "FOOTBALLER") {
            if (state) {
                myShootStatus.playerId = entityId - teamIndex;
                myShootStatus.canShoot = true;
            }
            if (entityId - teamIndex === attackerPlayer.id) {
                attackerPlayer.x = x;
                attackerPlayer.y = y;
            } else if (entityId - teamIndex === centerPlayer.id) {
                centerPlayer.x = x;
                centerPlayer.y = y;
            }
            footballers[entityId - teamIndex] = {x:x, y:y};
        } else if (entityType === "OPPONENT") {
            opponents.push({x:x, y:y});
        }
    }
    for (var i = 0; i < 4; i++) {
        // Write an action using print()
        // To debug: printErr('Debug messages...');

        // Edit this line to indicate the action for each footballer (0 <= thrust <= 150, 0 <= power <= 500)
        // i.e.: "MOVE x y thrust" or "THROW x y power"

        var player = footballers[i];

        if (i === myShootStatus.playerId && myShootStatus.canShoot) {
            myShootStatus.canShoot = false;

            if (direction * ball.y >= direction * (attackerPlayer.y - (direction * 2000))) {
                var goalTargetTop = {x: opponentGoal.poleTop.target.x, y: opponentGoal.poleTop.target.y};
                var goalTargetCenter = {x: opponentGoal.center.x, y: opponentGoal.center.y};
                var goalTargetBottom = {x: opponentGoal.poleBottom.target.x, y: opponentGoal.poleBottom.target.y};
                var targets = [goalTargetTop, goalTargetCenter, goalTArgetBottom].concat(footballers);

                var target = getTarget(targets, player, opponents, direction);

                throwBall(target, 500);
            } else {
                throwBall(attackerPlayer, 150);
            }
        } else if (i === centerPlayer.id) {
            if (ball.x > centerPlayer.base.x - centerPlayer.delta.x
                && ball.x < centerPlayer.base.x + centerPlayer.delta.x)
            {
                movePlayer(ball);
            } else {
                movePlayer(centerPlayer.base);
            }
        } else if (i === attackerPlayer.id) {
            if (direction * ball.x > direction * (attackerPlayer.base.x - (direction * attackerPlayer.delta.x)))
            {
                movePlayer(ball);
            } else {
                movePlayer(attackerPlayer.base);
            }
        } else {
            movePlayer(ball);
        }
    }
}

function throwBall(target, power) {
    print("THROW " + target.x + " " + target.y + " " + power);
}

function movePlayer(target) {
    print("MOVE " + target.x + " " + target.y + " " + 150);
}

function pointInCircle(centerX, centerY, rayon, pointX, pointY) {
    return Math.pow(pointX - centerX, 2) + Math.pow(pointY - centerY, 2) < Math.pow(rayon, 2);
}

function getDistance(a, b) {
    return  Math.pow(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2), 0.5);
}

function playerInDanger(player, opponents) {
    for (var i = 0; i < opponents.length; i++) {
        var op = opponents[i];
        if (pointInCircle(player.x, player.y, 1500, op.x, op.y)) {
            return true;
        }
    }
    return false;
}

// Instersecting points between a circle and a line
// line.a line.b centre.x centre.y cercle.radius
function getIntersectingPoints(a, b, cx, cy, r)
{
    var list = [];

    var A = 1 + a*a;
    var B = 2 * (-cx + a * b - a * cy);
    var C = cx * cx + cy * cy + b * b - 2 * b * cy - r * r;
    var delta = B * B - 4 * A * C;

    if (delta > 0)
    {
        var x = (-B - Math.sqrt(delta)) / (2 * A);
        var y = a * x + b;
        list.push({x:x, y:y});

        x = (-B + Math.sqrt(delta)) / (2 * A);
        y = a * x + b;
        list.push({x:x, y:y});
    }
    else if (Math.round(delta) === 0)
    {
        var x = -B / (2 * A);
        var y = a * x + b;
        list.push({x:x, y:y});
    }

    return list;
}

function getTarget(targets, player, opponents, direction)
{
    var filteredOpponents = opponents.filter(function(elem) {
        return direction * elem.x > direction * player.x;
    });

    var filteredTargets = targets.filter(function(elem) {
        return direction * elem.x > direction * player.x;
    });

    var closestTargets = filteredTargets.sort(function (a, b) {
        var distA = getDistance(player, a);
        var distB = getDistance(player, b);
        return distA - distB;
    });

    for (var i = 0; i < closestTargets.length; i++) {
        var target = closestTargets[i];
        var line = getLineCoefs(player, target);
        var intersectionsCount = 0;

        for (var j = 0; j < filteredOpponents.length; j++) {
            var opp = filteredOpponents[j];
            var intersections = getIntersectingPoints(line.a, line.b, opp.x, opp.y, 400);

            if (intersections.length !== 0) {
                intersectionsCount ++;
                break;
            }
        }

        if (intersectionsCount === 0) {
            return target;
        }
    }

    return closestTargets[0];
}

// y = Ax + B
function getLineCoefs(a, b)
{
    var A = (b.y - a.y) / (b.x - a.x);
    var B = a.y - A * a.x;

    return {a:A, b:B};

}
