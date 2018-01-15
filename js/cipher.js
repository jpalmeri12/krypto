// Fades to a particular div with the given name.
function showScreen(scr) {
    $(".screenBox.anim_fadeIn").removeClass("anim_fadeIn").addClass("anim_fadeOut");
    setTimeout(function () {
        $("#" + scr).removeClass("anim_fadeOut").addClass("anim_fadeIn");
    }, 250);
}

// Shuffles an array.
function shuffle(array) {
    var m = array.length,
        t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

// Finds the gcd of two numbers.
var gcd = function (a, b) {
    if (!b) {
        return a;
    }

    return gcd(b, a % b);
};

var swap = function (array, pos1, pos2) {
    var temp = array[pos1];
    array[pos1] = array[pos2];
    array[pos2] = temp;
};

var heapsPermute = function (array, output, n) {
    n = n || array.length; // set n default to array.length
    if (n === 1) {
        output(array);
    } else {
        for (var i = 1; i <= n; i += 1) {
            heapsPermute(array, output, n - 1);
            if (n % 2) {
                var j = 1;
            } else {
                var j = i;
            }
            swap(array, j - 1, n - 1); // -1 to account for javascript zero-indexing
        }
    }
};

// Returns a time formatted string.
function formatTime(sec, useMs) {
    var hours = Math.floor(sec / 3600);
    var minutes = Math.floor((sec - (hours * 3600)) / 60);
    var seconds = sec - (hours * 3600) - (minutes * 60);
    seconds = Math.floor(100 * seconds) / 100;
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10 && hours > 0) {
        minutes = "0" + minutes;
    }
    if (useMs) {
        seconds = "" + seconds;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        if (seconds.length == 2) {
            seconds += ".";
        }
        while (seconds.length < 5) {
            seconds += "0";
        }
    } else {
        seconds = Math.ceil(seconds);
        seconds = "" + seconds;
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
    }
    return (hours > 0 ? hours + ':' : "") + minutes + ':' + seconds;
}

var recordsKey = "kryptochallenge";

function loadRecords() {
    var oldRecords = localStorage.getItem(recordsKey);
    if (oldRecords == null) {
        makeRecords();
    } else {
        records = JSON.parse(oldRecords);
    }
}

function saveRecords() {
    var newRecords = JSON.stringify(records);
    localStorage.setItem(recordsKey, newRecords);
}

function clearRecords() {
    makeRecords();
    saveRecords();
}

function checkReload() {
    //check for navigation time API support
    if (window.performance) {
        console.info("window.performance work's fine on this browser");
    }
    if (window.performance.navigation.type == 1) {
        window.location.reload(true);
    } else {
        console.info("This page is not reloaded");
    }
}