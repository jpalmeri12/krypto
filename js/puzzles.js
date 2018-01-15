// All puzzle-related code goes here

// Returns all solutions to the given puzzle
function solvePuzzle(nums, goal) {
    var cards = [];
    var solutions = [];
    for (var i = 0; i < nums.length; i++) {
        cards.push({
            value: nums[i],
            from: [],
            op: ""
        });
    }
    solveFrom(cards, goal);
    return solutions;
    // Helper function
    function solveFrom(cards, goal) {
        // If there is more than one card in the array, keep going
        if (cards.length > 1) {
            for (var i = 0; i < cards.length; i++) {
                for (var j = i + 1; j < cards.length; j++) {
                    var ops = ["+", "-", "*", "/"];
                    for (var k = 0; k < ops.length; k++) {
                        var result = -1;
                        var pushFirst = -1;
                        if (ops[k] == "+") {
                            result = cards[i].value + cards[j].value;
                            pushFirst = 0;
                        } else if (ops[k] == "-") {
                            result = Math.abs(cards[i].value - cards[j].value);
                            pushFirst = (cards[i].value > cards[j].value ? 0 : 1);
                        } else if (ops[k] == "*") {
                            result = cards[i].value * cards[j].value;
                            pushFirst = 0;
                        } else if (ops[k] == "/") {
                            var max = Math.max(cards[i].value, cards[j].value);
                            var min = Math.min(cards[i].value, cards[j].value);
                            if (min == 0) {
                                result = 0;
                                pushFirst = (cards[i].value == 0 ? 0 : 1);
                            } else if (max != 0) {
                                var res = max / min;
                                if (res == Math.round(res)) {
                                    result = res;
                                    pushFirst = (cards[i].value > cards[j].value ? 0 : 1);
                                }
                            }
                        }
                        if (result != -1) {
                            var newCard = {
                                value: result,
                                from: [],
                                op: ops[k]
                            };
                            if (pushFirst == 0) {
                                newCard.from.push(cards[i]);
                                newCard.from.push(cards[j]);
                            } else if (pushFirst == 1) {
                                newCard.from.push(cards[j]);
                                newCard.from.push(cards[i]);
                            }
                            var newCards = [];
                            for (var l = 0; l < cards.length; l++) {
                                if (l != i && l != j) {
                                    newCards.push(cards[l]);
                                }
                            }
                            newCards.push(newCard);
                            solveFrom(newCards, goal);
                        }
                    }
                }
            }
        }
        // Else, check to see if the solution has been made
        else {
            var finalResult = cards[0].value;
            if (finalResult == goal) {
                solutions.push(cards[0]);
            }
        }
    }
}

function printSolutions(sols) {
    var out = [];
    for (var i = 0; i < sols.length; i++) {
        out.push(printSolution(sols[i]));
    }
    return out;
}

function printSolution(sol) {
    return printSol(sol.from[0]) + sol.op + printSol(sol.from[1]);

    function printSol(sol) {
        if (sol.from.length == 0) {
            return sol.value;
        } else {
            return "(" + printSol(sol.from[0]) + sol.op + printSol(sol.from[1]) + ")";
        }
    }
}

function getRandomPuzzle(cardMin, cardMax, goalMin, goalMax, dampen) {
    var puzzle = {
        cards: [],
        goal: 0,
        sols: [],
        printSols: []
    }
    for (var i = 0; i < 5; i++) {
        var card = cardMin + Math.floor((cardMax - cardMin + 1) * Math.random());
        card = Math.ceil(card * (dampen + ((1 - dampen) * Math.random())));
        puzzle.cards.push(card);
    }
    puzzle.goal = goalMin + Math.floor((goalMax - goalMin + 1) * Math.random());
    puzzle.sols = solvePuzzle(puzzle.cards, puzzle.goal);
    puzzle.printSols = printSolutions(puzzle.sols);
    return puzzle;
}

function getSolvablePuzzle(cardMin, cardMax, goalMin, goalMax) {
    var puzzle = getRandomPuzzle(cardMin, cardMax, goalMin, goalMax, 1);
    while (puzzle.sols.length == 0) {
        puzzle = getRandomPuzzle(cardMin, cardMax, goalMin, goalMax, 1);
    }
    return puzzle;
}

function getPuzzle(cardMin, cardMax, dampen, diff) {
    var puzzles = [];
    while (puzzles.length < 20) {
        var puzzle = getRandomPuzzle(cardMin, cardMax, cardMin, cardMax, dampen);
        if (puzzle.sols.length > 0) {
            puzzles.push(puzzle);
        }
    }
    puzzles.sort(function (a, b) {
        return b.sols.length - a.sols.length;
    });
    var index = Math.round(diff * 19);
    return puzzles[index];
}

function getPuzzles(cardMin, cardMax, dampen, diff, numPuzzles) {
    var puzzles = [];
    while (puzzles.length < 10 * numPuzzles) {
        var puzzle = getRandomPuzzle(cardMin, cardMax, cardMin, cardMax, dampen);
        if (puzzle.sols.length > 0) {
            puzzles.push(puzzle);
        }
    }
    puzzles.sort(function (a, b) {
        return b.sols.length - a.sols.length;
    });
    var startIndex = Math.floor((diff - .1) * 10 * numPuzzles);
    return puzzles.slice(startIndex, startIndex + numPuzzles);
}

function maxSolNumber(sol) {
    var max = 0;
    if (sol.op == "") {
        return sol.value;
    } else {
        return Math.max(Math.max(maxSolNumber(sol.from[0]), maxSolNumber(sol.from[1])), sol.value);
    }
}

function simplestSolution(sols) {
    var min = -1;
    var minIndex = -1;
    for (var i = 0; i < sols.length; i++) {
        var val = maxSolNumber(sols[i]);
        if (minIndex == -1 || val < min) {
            min = val;
            minIndex = i;
        }
    }
    return minIndex;
}