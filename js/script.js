var menu = {
    mode: 0,
    level: 0
}

var game = {
    puzzleBank: [],
    puzzle: null,
    cards: [],
    goal: 0,
    mode: 0,
    level: 1,
    puzzleNum: 0,
    score: 0,
    time: 0,
    timeElapsed: 0,
    timer: {
        start: 0,
        time: 0,
        timeElapsed: 0,
        anim: 0
    },
    solution: null,
    solutionStep: 0,
    numClicked: -1,
    opClicked: -1,
    bonusTime: 0,
    bonusPoints: 0,
    canClick: false,
    gameOn: false,
    readyToStart: false,
    highScore: false,
    solvedAtStart: 0
}

var blankGame = "";

var records = {
    scores: {}
};

var modes = [
    {
        "id": "casual",
        "name": "Casual",
        "desc": "Solve puzzles at your own pace. No pressure.",
        "endLabel": "Total Solved",
        "endScore": function () {
            return game.puzzleNum + game.solvedAtStart;
        },
        "bestLabel": "Total Solved",
        "ranks": [30, 60, 100, 150, 200],
        "isTime": false,
        "hud": [
            {
                "label": "Solved",
                "value": function () {
                    return game.puzzleNum;
                },
                "sub": function () {
                    return "";
                }
            },
            {
                "label": "Total Solved",
                "value": function () {
                    return game.puzzleNum + game.solvedAtStart;
                },
                "sub": function () {
                    return "";
                }
            }
        ],
        "puzzlesToWin": 20,
        "timerLoseCondition": false
    },
    {
        "id": "challenge",
        "name": "Challenge",
        "desc": "Solve as many puzzles as you can within the time limit.",
        "endLabel": "Puzzles Solved",
        "endScore": function () {
            return game.puzzleNum;
        },
        "bestLabel": "Most Solved",
        "ranks": [3, 6, 10, 15, 20],
        "isTime": false,
        "hud": [
            {
                "label": "Solved",
                "value": function () {
                    return game.puzzleNum;
                },
                "sub": function () {
                    return "";
                }
            },
            {
                "label": "Time Left",
                "value": function () {
                    return formatTime(game.time, true);
                },
                "sub": function () {
                    if (game.bonusTime > 0) {
                        return "+" + game.bonusTime + " sec.";
                    }
                    return "";
                }
            }
        ],
        "puzzlesToWin": 20,
        "timerLoseCondition": true
    },
    {
        "id": "sprint",
        "name": "Sprint",
        "desc": "Solve three puzzles in a row as quickly as you can.",
        "endLabel": "Clear Time",
        "endScore": function () {
            if (game.puzzleNum == 3) {
                return game.timeElapsed;
            } else {
                return 0;
            }
        },
        "bestLabel": "Best Time",
        "ranks": [300, 240, 180, 120, 60],
        "rankBarBase": 360,
        "isTime": true,
        "hud": [
            {
                "label": "Solved",
                "value": function () {
                    return game.puzzleNum + "/3";
                },
                "sub": function () {
                    return "";
                }
            },
            {
                "label": "Time",
                "value": function () {
                    return formatTime(game.timeElapsed, true);
                },
                "sub": function () {
                    return "";
                }
            }
        ],
        "puzzlesToWin": 3,
        "timerLoseCondition": false
    },
    {
        "id": "gauntlet",
        "name": "Gauntlet",
        "desc": "The time limit's decreasing. Go for a high score!",
        "endLabel": "Final Score",
        "endScore": function () {
            return game.score;
        },
        "bestLabel": "Best Score",
        "ranks": [1000, 3000, 5000, 7000, 10000],
        "isTime": false,
        "hud": [
            {
                "label": "Score",
                "value": function () {
                    return game.score;
                },
                "sub": function () {
                    if (game.bonusPoints > 0) {
                        return "+" + game.bonusPoints + " pts.";
                    }
                    return "";
                }
            },
            {
                "label": "Time Left",
                "value": function () {
                    return formatTime(game.time, true);
                },
                "sub": function () {
                    return "";
                }
            }
        ],
        "puzzlesToWin": 20,
        "timerLoseCondition": true
    }
];

var levels = [
    {
        "name": "Easy",
        "desc": "Uses the numbers 1-10. Suitable for new players.",
        "cardMin": 1,
        "cardMax": 10,
        "dampen": 1,
        "diff": .2
    },
    {
        "name": "Normal",
        "desc": "Uses the numbers 1-25. Standard Krypto puzzles.",
        "cardMin": 1,
        "cardMax": 25,
        "dampen": .5,
        "diff": .4
    },
    {
        "name": "Hard",
        "desc": "Uses the numbers 1-25. Harder than Normal.",
        "cardMin": 1,
        "cardMax": 25,
        "dampen": 1,
        "diff": .6
    },
    {
        "name": "Expert",
        "desc": "Uses the numbers 1-50. Difficult puzzles.",
        "cardMin": 1,
        "cardMax": 50,
        "dampen": .5,
        "diff": .8
    },
    {
        "name": "Master",
        "desc": "Uses the numbers 1-50. Absurdly difficult puzzles.",
        "cardMin": 1,
        "cardMax": 50,
        "dampen": 1,
        "diff": 1
    }
];

var niceSymbols = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷"
};

$(function () {
    initButtons();
    initSolution();
    initResults();
    initClicks();
    initBlankGame();
    initRecords();
    loadRecords();
    showScreen("menuScreen");
    updateMenu();
    resizeWindow();
});

function initButtons() {
    $("#numButtons").empty();
    for (var i = 0; i < 5; i++) {
        var newButton = $('<div id="numButton' + i + '" class="numButton"></div>');
        newButton.append('<div class="numButtonNumber"></div>');
        var gridPos = 2 * i;
        var x = gridPos % 3;
        var y = Math.floor(gridPos / 3);
        newButton.css({
            "left": (4.5 * x + 1) + "rem",
            "top": (4.5 * y + 3.5) + "rem"
        })
        $("#numButtons").append(newButton);
        initNumClick(i);
    }
    for (var i = 0; i < 4; i++) {
        var ops = ["+", "−", "×", "÷"]
        var newButton = $('<div id="opButton' + i + '" class="opButton"></div>');
        newButton.append('<div class="opButtonText">' + ops[i] + '</div>');
        var gridPos = 2 * i + 1;
        var x = gridPos % 3;
        var y = Math.floor(gridPos / 3);
        newButton.css({
            "left": (4.5 * x + 1) + "rem",
            "top": (4.5 * y + 3.5) + "rem"
        })
        $("#numButtons").append(newButton);
        initOpClick(i);
    }
}

function initNumClick(n) {
    $("#numButton" + n).click(function () {
        if (game.canClick) {
            numClick(n);
        }
    });
}

function numClick(n) {
    if (game.cards[n] > -1) {
        if (game.numClicked == -1) {
            // Number not selected, so select this number
            game.numClicked = n;
        } else if (game.numClicked == n) {
            // Selected number clicked, so deselect it
            game.numClicked = -1;
            game.opClicked = -1;
        } else if (game.opClicked != -1) {
            // Execute operation
            var a = game.cards[game.numClicked];
            var b = game.cards[n];
            var result = -1;
            if (game.opClicked == 0) {
                result = a + b;
            } else if (game.opClicked == 1) {
                if (a - b >= 0) {
                    result = a - b;
                }
            } else if (game.opClicked == 2) {
                result = a * b;
            } else if (game.opClicked == 3) {
                if (b != 0 && (a >= b || a == 0) && a % b == 0) {
                    result = a / b;
                }
            }
            if (result >= 0) {
                game.cards[game.numClicked] = -1;
                game.cards[n] = result;
                game.numClicked = n;
                game.opClicked = -1;
                checkWin();
            } else {
                game.numClicked = -1;
                game.opClicked = -1;
            }
        } else {
            game.numClicked = n;
        }
    }
    updateBoard();
}

function initOpClick(n) {
    $("#opButton" + n).click(function () {
        if (game.canClick) {
            opClick(n);
        }
    });
}

function opClick(n) {
    if (game.numClicked != -1) {
        // Number has been selected, so operation can be selected
        if (game.opClicked == -1) {
            // Operation not selected, so select this one
            game.opClicked = n;
        } else if (game.opClicked == n) {
            // Deselect selected operation
            game.opClicked = -1;
        } else {
            // Select new operation
            game.opClicked = n;
        }
    }
    updateBoard();
}

function initSolution() {
    $("#solNums").empty();
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5 - i; j++) {
            var num = $('<div id="solNum' + i + '-' + j + '" class="solNum solNum' + i + '"></div>');
            num.append('<div class="solNumText"></div>');
            var x = j + .5 * i;
            var y = i;
            num.css({
                'left': (3 * x + .5) + "rem",
                'top': (3 * y + 3) + "rem"
            });
            $("#solNums").append(num);
        }
    }
    $("#solOps").empty();
    for (var i = 0; i < 4; i++) {
        var op = $('<div id="solOp' + i + '" class="solOp"></div>');
        op.append('<div class="solOpText"></div>');
        var x = .5 * i;
        var y = i;
        op.css({
            'left': (3 * x + .375) + "rem",
            'top': (3 * y + 2.875) + "rem"
        })
        $("#solOps").append(op);
    }
}

function initResults() {
    $("#resultsBarLines").empty();
    var rankLetters = ["C", "B", "A", "S", "S+"];
    for (var i = 0; i < 5; i++) {
        var newBar = $('<div id="resultsBarLine' + i + '" class="resultsBarLine"></div>');
        newBar.append('<div class="resultsBarRank">' + rankLetters[i] + '</div>');
        newBar.append('<div class="resultsBarScore"></div>');
        if (i == 4) {
            newBar.css('height', "1.5rem");
        }
        $("#resultsBarLines").append(newBar);
    }
}

function initClicks() {
    // Game screen: click to start
    $("#banner").click(function () {
        if (game.readyToStart) {
            newPuzzle();
        }
    });
    // Game screen: reset puzzle
    $("#resetButton").click(function () {
        if (game.canClick) {
            resetPuzzle();
        }
    });
    // Game screen: concede puzzle
    $("#concedeButton").click(function () {
        if (game.canClick) {
            concedePuzzle();
        }
    });
    // Solution screen: advance game
    $("#solutionScreen").click(function () {
        if (game.solutionStep < 4) {
            game.solutionStep++;
            setSolutionStep(game.solutionStep);
        } else {
            viewResults();
        }
    });
    $("#menuPlayModeLeft").click(function () {
        if (menu.mode > 0) {
            menu.mode--;
            updateMenu();
        }
    });
    $("#menuPlayModeRight").click(function () {
        if (menu.mode < modes.length - 1) {
            menu.mode++;
            updateMenu();
        }
    });
    $("#menuPlayLevelLeft").click(function () {
        if (menu.level > 0) {
            menu.level--;
            updateMenu();
        }
    });
    $("#menuPlayLevelRight").click(function () {
        if (menu.level < levels.length - 1) {
            menu.level++;
            updateMenu();
        }
    });
    $("#menuStartButton").click(function () {
        loadGame();
    });
    $("#menuHelpButton").click(function () {
        showScreen("rulesScreen");
    });
    $("#menuRecordsButton").click(function () {
        updateRecords();
        showScreen("recordsScreen");
    });
    $("#rulesScreen").click(function() {
        showScreen("menuScreen");
    });
    $("#recordsBackButton").click(function() {
        showScreen("menuScreen");
    });
    $("#resultsScreen").click(function () {
        updateMenu();
        showScreen("menuScreen");
    });
}

function initBlankGame() {
    blankGame = JSON.stringify(game);
}

function initRecords() {
    $("#recordsDrapes").empty();
    for (var i = 0; i < modes.length; i++) {
        var newDrape = $('<div id="recordsDrape' + i + '" class="recordsDrape"></div>');
        newDrape.css({
            'left': (3.75 * i + .375) + "rem",
            'background-image': 'url(img/menuStripe' + i + '.svg)'
        });
        newDrape.append('<div class="recordsDrapeHeader"><div class="recordsDrapeHeaderText">' + modes[i].name + '</div></div>');
        for (var j = 0; j < levels.length; j++) {
            var newDot = $('<div class="recordsDot recordsDot' + j + '"></div>');
            newDot.append('<div class="recordsDotLevel">' + levels[j].name + '</div>');
            newDot.append('<div class="recordsDotRank"></div>');
            newDot.append('<div class="recordsDotScore"></div>');
            newDot.css('top', (3 * j + 1.75) + "rem");
            newDrape.append(newDot);
        }
        $("#recordsDrapes").append(newDrape);
    }
}

function makeRecords() {
    records = {
        scores: {}
    };
    for (var i = 0; i < modes.length; i++) {
        var newArray = [];
        for (var j = 0; j < levels.length; j++) {
            newArray.push(0);
        }
        records.scores[modes[i].id] = newArray;
    }
}

function updateMenu() {
    // Game mode
    var mode = modes[menu.mode];
    $("#menuPlayModeText").text(mode.name);
    $("#menuPlayModeDescText").text(mode.desc);
    $("#menuBestLabel").text(mode.bestLabel);
    var bestScore = records.scores[modes[menu.mode].id][menu.level];
    if (modes[menu.mode].isTime) {
        if (bestScore == 0) {
            bestScore = "--:--.--";
        } else {
            bestScore = formatTime(bestScore, true);
        }
    }
    $("#menuBestText").text(bestScore);
    $("#menuPlayBox").css("background-image", "url(img/menuStripe" + menu.mode + ".svg)");
    if (menu.mode == 0) {
        $("#menuPlayModeLeft").removeClass("anim_arrowButtonOn");
        $("#menuPlayModeLeft").addClass("anim_arrowButtonOff");
    } else {
        $("#menuPlayModeLeft").removeClass("anim_arrowButtonOff");
        $("#menuPlayModeLeft").addClass("anim_arrowButtonOn");
    }
    if (menu.mode == modes.length - 1) {
        $("#menuPlayModeRight").removeClass("anim_arrowButtonOn");
        $("#menuPlayModeRight").addClass("anim_arrowButtonOff");
    } else {
        $("#menuPlayModeRight").removeClass("anim_arrowButtonOff");
        $("#menuPlayModeRight").addClass("anim_arrowButtonOn");
    }
    // Difficulty level
    var level = levels[menu.level];
    $("#menuPlayLevelText").text(level.name);
    $("#menuPlayLevelDescText").text(level.desc);
    if (menu.level == 0) {
        $("#menuPlayLevelLeft").removeClass("anim_arrowButtonOn");
        $("#menuPlayLevelLeft").addClass("anim_arrowButtonOff");
    } else {
        $("#menuPlayLevelLeft").removeClass("anim_arrowButtonOff");
        $("#menuPlayLevelLeft").addClass("anim_arrowButtonOn");
    }
    if (menu.level == levels.length - 1) {
        $("#menuPlayLevelRight").removeClass("anim_arrowButtonOn");
        $("#menuPlayLevelRight").addClass("anim_arrowButtonOff");
    } else {
        $("#menuPlayLevelRight").removeClass("anim_arrowButtonOff");
        $("#menuPlayLevelRight").addClass("anim_arrowButtonOn");
    }
}

function loadGame() {
    showScreen("loadScreen");
    setTimeout(function () {
        startGame();
        showScreen("gameScreen");
    }, 500);
}

function startGame() {
    game = JSON.parse(blankGame);
    game.mode = menu.mode;
    game.level = menu.level;
    var level = levels[game.level];
    var numPuzzles = modes[game.mode].puzzlesToWin;
    game.puzzleBank = getPuzzles(level.cardMin, level.cardMax, level.dampen, level.diff, numPuzzles);
    $("#bannerText").text("Ready?");
    $("#banner").attr("class", "");
    $("#banner").addClass("anim_bannerBig");
    $(".stripedBox").css("background-image", "url(img/menuStripe" + game.mode + ".svg)");
    game.gameOn = false;
    game.readyToStart = true;
    game.highScore = false;
    if (modes[game.mode].id == "challenge") {
        game.time = 180;
    } else if (modes[game.mode].id == "gauntlet") {
        game.time = 120;
    } else {
        game.time = 0;
    }
    if (modes[game.mode].id == "casual") {
        game.solvedAtStart = records.scores["casual"][game.level];
    }
    updateBoard();
}

function newPuzzle() {
    var level = levels[game.level];
    game.puzzle = game.puzzleBank[game.puzzleNum];
    game.cards = game.puzzle.cards.slice();
    game.goal = game.puzzle.goal;
    game.solutionStep = 0;
    game.numClicked = -1;
    game.opClicked = -1;
    game.canClick = true;
    game.readyToStart = false;
    var bestSol = simplestSolution(game.puzzle.sols);
    game.solution = game.puzzle.sols[bestSol];
    $("#banner").attr("class", "");
    $("#banner").addClass("anim_bannerOut");
    timerStart();
    updateBoard();
    updateSolution();
    setSolutionStep(0);
}

function resetPuzzle() {
    game.cards = game.puzzle.cards.slice();
    game.numClicked = -1;
    game.opClicked = -1;
    $("#resetButton").removeClass("anim_resetFlash");
    updateBoard();
}

function timerStart() {
    game.timer.start = new Date().getTime();
    game.timer.time = game.time;
    game.timer.timeElapsed = game.timeElapsed;
    game.timer.anim = requestAnimationFrame(updateTimer);
}

function updateTimer() {
    var currentTime = new Date().getTime();
    var timeSinceStart = (currentTime - game.timer.start) / 1000;
    game.time = game.timer.time - timeSinceStart;
    game.timeElapsed = game.timer.timeElapsed + timeSinceStart;
    if (modes[game.mode].timerLoseCondition && game.time <= 0) {
        game.time = 0;
        timerStop();
        losePuzzle();
    } else {
        game.timer.anim = requestAnimationFrame(updateTimer);
    }
    updateHud();
}

function timerStop() {
    cancelAnimationFrame(game.timer.anim);
    var currentTime = new Date().getTime();
    var timeSinceStart = (currentTime - game.timer.start) / 1000;
    game.time = game.timer.time - timeSinceStart;
    if (game.time < 0) {
        game.time = 0;
    }
    game.timeElapsed = game.timer.timeElapsed + timeSinceStart;
    updateHud();
}

function updateBoard() {
    updateHud();
    // Difficulty
    var starString = "";
    for (var i = 0; i < game.level + 1; i++) {
        starString += "★";
    }
    for (var i = 0; i < 4 - game.level; i++) {
        starString += "☆";
    }
    $("#difficultyText").text(starString);
    $("#difficultySubtext").text(levels[game.level].name);
    if (game.puzzle != null) {
        // Card numbers
        for (var i = 0; i < game.cards.length; i++) {
            var num = game.cards[i] + "";
            $("#numButton" + i + ">.numButtonNumber").text(num);
            $("#numButton" + i + ">.numButtonNumber").css("font-size", Math.min(2.5, (6 / num.length)) + "rem");
        }
        // Goal number
        $("#goalBoxBodyText").text(game.goal);
        // Buttons on/off
        for (var i = 0; i < 5; i++) {
            if (game.numClicked == i) {
                $("#numButton" + i).addClass("anim_numButtonSelected");
            } else {
                $("#numButton" + i).removeClass("anim_numButtonSelected");
            }
            if (game.cards[i] > -1) {
                $("#numButton" + i).css("opacity", 1);
            } else {
                $("#numButton" + i).css("opacity", 0);
            }
        }
        for (var i = 0; i < 4; i++) {
            if (game.opClicked == i) {
                $("#opButton" + i).addClass("anim_opButtonSelected");
            } else {
                $("#opButton" + i).removeClass("anim_opButtonSelected");
            }
        }
    } else {
        // Card numbers
        for (var i = 0; i < 5; i++) {
            $("#numButton" + i + ">.numButtonNumber").text("?");
            $("#numButton" + i + ">.numButtonNumber").css("font-size", "2.5rem");
        }
        // Goal number
        $("#goalBoxBodyText").text("?");
    }
}

function updateHud() {
    // Score
    var hud = modes[game.mode].hud;
    for (var i = 0; i < 2; i++) {
        $("#hudLabel" + i).text(hud[i].label);
        $("#hudNum" + i).text(hud[i].value());
        $("#hudSub" + i).text(hud[i].sub());
    }
}

function checkWin() {
    var activeCards = [];
    for (var i = 0; i < game.cards.length; i++) {
        if (game.cards[i] >= 0) {
            activeCards.push(game.cards[i]);
        }
    }
    if (activeCards.length == 1) {
        if (activeCards[0] == game.goal) {
            winPuzzle();
        } else {
            $("#resetButton").addClass("anim_resetFlash");
        }
    }
}

function winPuzzle() {
    timerStop();
    // Disable clicks
    game.canClick = false;
    var delay = 0;
    var modeID = modes[game.mode].id;
    // Casual mode: wait 2 seconds
    if (modeID == "casual") {
        delay = 1500;
    }
    // Challenge mode: gain additional time after each level
    else if (modeID == "challenge") {
        // Add bonus time
        game.bonusTime = 0;
        if (game.puzzleNum < 10) {
            game.bonusTime = 60 - 5 * game.puzzleNum;
        } else if (game.puzzleNum < 20) {
            game.bonusTime = 5;
        }
        delay = 1000 + 20 * game.bonusTime;
        for (var i = 0; i < game.bonusTime; i++) {
            setTimeout(function () {
                game.bonusTime--;
                game.time++;
                updateHud();
            }, 1000 + 20 * i);
        }
    }
    // Sprint mode: wait 2 seconds
    else if (modeID == "sprint") {
        delay = 1500;
    }
    // Gauntlet mode: set time to a certain amount and also watch the score tick up
    else if (modeID == "gauntlet") {
        // Score points
        var baseScore = 25 + 50 * game.puzzleNum;
        var maxTime = gauntletTime(game.puzzleNum);
        var multiplier = 1 + (game.time / maxTime);
        game.bonusPoints = Math.ceil(baseScore * multiplier);
        var ticks = Math.ceil(game.bonusPoints / 20);
        delay = 1000 + 20 * ticks;
        for (var i = 0; i < ticks; i++) {
            setTimeout(function () {
                var toSub = Math.min(20, game.bonusPoints);
                game.bonusPoints -= toSub;
                game.score += toSub;
                updateHud();
            }, 1000 + 20 * i);
        }
        if (game.puzzleNum < 20) {
            game.time = gauntletTime(game.puzzleNum + 1);
        }

        function gauntletTime(round) {
            if (round <= 6) {
                return 120 - 10 * round;
            } else if (round <= 9) {
                return 90 - 5 * round;
            } else if (round <= 19) {
                return 65 - 5 * Math.floor(round / 2);
            }
        }
    }
    // Show banner
    $("#banner").attr("class", "");
    $("#bannerText").text("Correct");
    $("#banner").addClass("anim_bannerIn");
    // Increment puzzle number
    game.puzzleNum++;
    // Check to see if the game is over
    var gameWon = game.puzzleNum >= modes[game.mode].puzzlesToWin;
    updateBoard();
    if (!gameWon) {
        // Not yet won
        // After some delay, show the "Ready?" screen
        setTimeout(function () {
            $("#banner").attr("class", "");
            $("#bannerText").text("Ready?");
            $("#banner").addClass("anim_bannerBig");
            game.readyToStart = true;
        }, delay);
    } else {
        // Won the game
        // After some delay, show the victory screen
        checkHighScores();
        setTimeout(function () {
            $("#banner").attr("class", "");
            $("#bannerText").text("Victory!");
            $("#banner").addClass("anim_bannerBig");
        }, delay);
        setTimeout(function () {
            viewResults();
        }, delay + 2000);
    }
}

function checkHighScores() {
    // High score?
    var score = modes[game.mode].endScore();
    var highScore = records.scores[modes[game.mode].id][game.level];
    if (modes[game.mode].isTime) {
        if (highScore == 0 || score < highScore) {
            game.highScore = true;
            records.scores[modes[game.mode].id][game.level] = score;
        }
    } else {
        if (score > highScore) {
            game.highScore = true;
            records.scores[modes[game.mode].id][game.level] = score;
        }
    }
    saveRecords();
}

function concedePuzzle() {
    timerStop();
    // Disable clicks
    game.canClick = false;
    updateBoard();
    checkHighScores();
    $("#banner").attr("class", "");
    $("#bannerText").text("Conceded...");
    $("#banner").addClass("anim_bannerIn");
    setTimeout(function () {
        showScreen("solutionScreen");
    }, 2000);
}

function losePuzzle() {
    // Disable clicks
    game.canClick = false;
    updateBoard();
    checkHighScores();
    $("#banner").attr("class", "");
    $("#bannerText").text("Out of Time");
    $("#banner").addClass("anim_bannerIn");
    setTimeout(function () {
        showScreen("solutionScreen");
    }, 2000);
}

function viewResults() {
    updateResults();
    showScreen("resultsScreen");
}

function updateResults() {
    // Mode and level
    $("#resultsModeText").text(modes[game.mode].name + " / " + levels[game.level].name);
    // Score label
    $("#resultsScoreLabel").text(modes[game.mode].endLabel);
    // Score
    var score = modes[game.mode].endScore();
    var rawScore = score;
    if (modes[game.mode].isTime) {
        if (score != 0) {
            score = formatTime(score, true);
        } else {
            score = "--:--.--";
        }
    }
    $("#resultsScoreText").text(score);
    // New high score?
    var highScore = records.scores[modes[game.mode].id][game.level];
    if (game.highScore) {
        $("#resultsScoreRecord").text("New high score!");
    } else if (highScore > 0) {
        if (modes[game.mode].isTime) {
            highScore = formatTime(highScore, true);
        }
        $("#resultsScoreRecord").text(modes[game.mode].bestLabel + ": " + highScore);
    } else {
        $("#resultsScoreRecord").text("");
    }
    // Rank text
    var rankText = getRank(rawScore, game.mode);
    $("#resultsRankText").text(rankText);
    // Rank bar
    var ranks = modes[game.mode].ranks;
    for (var i = 0; i < 5; i++) {
        var pct = 0;
        if (modes[game.mode].isTime) {
            var barMin = modes[game.mode].rankBarBase;
            var barMax = ranks[4];
            pct = (ranks[i] - barMin) / (barMax - barMin) * 100;
            $("#resultsBarLine" + i + ">.resultsBarScore").text(formatTime(ranks[i]), false);
        } else {
            pct = ranks[i] / ranks[4] * 100;
            $("#resultsBarLine" + i + ">.resultsBarScore").text(ranks[i]);
        }
        $("#resultsBarLine" + i).css("left", pct + "%");
    }
    var scorePct = 0;
    if (modes[game.mode].isTime) {
        var barMin = modes[game.mode].rankBarBase;
        var barMax = ranks[4];
        scorePct = (rawScore - barMin) / (barMax - barMin) * 100;
    } else {
        scorePct = rawScore / ranks[4] * 100;
    }
    if (scorePct < 0) {
        scorePct = 0;
    }
    if (scorePct > 100) {
        scorePct = 100;
    }
    $("#resultsBarFill").css("width", scorePct + "%");
}

function getRank(score, mode, returnNum) {
    var ranks = ["D", "C", "B", "A", "S", "S+"];
    var rank = 0;
    for (var i = 0; i < 5; i++) {
        if (modes[mode].isTime) {
            if (score > 0 && score <= modes[mode].ranks[i]) {
                rank = i + 1;
            }
        } else {
            if (score >= modes[mode].ranks[i]) {
                rank = i + 1;
            }
        }
    }
    if (returnNum) {
        return rank;
    }
    return ranks[rank];
}

function updateSolution() {
    var sol = [];
    var steps = [];
    var ops = [];
    sol.push(JSON.parse(JSON.stringify(game.solution)));
    var step = [];
    step.push(sol[0].value);
    steps.push(step);
    for (var i = 0; i < 4; i++) {
        var canSplit = [];
        for (var j = 0; j < sol.length; j++) {
            if (sol[j].op != "") {
                canSplit.push(j);
            }
        }
        var split = canSplit[Math.floor(canSplit.length * Math.random())];
        var newSol = [];
        for (var j = 0; j < sol.length; j++) {
            if (j == split) {
                newSol.push(sol[j].from[0]);
                newSol.push(sol[j].from[1]);
                ops.unshift({
                    op: sol[j].op,
                    pos: j
                });
            } else {
                newSol.push(sol[j]);
            }
        }
        step = [];
        for (var j = 0; j < newSol.length; j++) {
            step.push(newSol[j].value);
        }
        steps.unshift(step);
        sol = newSol;
    }
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 5 - i; j++) {
            var text = steps[i][j] + "";
            $("#solNum" + i + "-" + j + ">.solNumText").text(text);
            $("#solNum" + i + "-" + j + ">.solNumText").css('font-size', Math.min(1.25, (2.5 / text.length)) + "rem");
        }
    }
    for (var i = 0; i < 4; i++) {
        $("#solOp" + i + ">.solOpText").text(niceSymbols[ops[i].op]);
        var x = .5 * i + ops[i].pos;
        $("#solOp" + i).css("left", (3 * x + .375) + "rem")
    }
    $("#solGoalText").text(game.goal);
}

function setSolutionStep(n) {
    for (var i = 0; i < 5; i++) {
        if (i <= n) {
            $(".solNum" + i).addClass("anim_solNumIn");
        } else {
            $(".solNum" + i).removeClass("anim_solNumIn");
        }
    }
    for (var i = 0; i < 4; i++) {
        if (i < n) {
            $("#solOp" + i).addClass("anim_solOpIn");
        } else {
            $("#solOp" + i).removeClass("anim_solOpIn");
        }
    }
}

function updateRecords() {
    var rating = 0;
    for (var i = 0; i < modes.length; i++) {
        for (var j = 0; j < levels.length; j++) {
            var dot = "#recordsDrape" + i + ">.recordsDot" + j;
            console.log(records);
            var score = records.scores[modes[i].id][j];
            var rank = getRank(score, i);
            var numRank = getRank(score, i, true);
            rating += numRank;
            if (modes[i].isTime) {
                if (score > 0) {
                    score = formatTime(score, true);
                }
                else {
                    score = "--:--.--";
                }
            }
            $(dot + ">.recordsDotScore").text(score);
            $(dot + ">.recordsDotRank").text(rank);
        }
    }
    $("#recordsRatingText").text(rating + "%");
}