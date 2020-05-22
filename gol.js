var grid = document.getElementById('life-grid');
var height = grid.height;
var width = grid.width;

var resolution = 10;

var cols = width / resolution;
var rows = height / resolution;

var life; // globabl variable for current state of life
var timer;
let populationHistory = [];

var isEmpty = true;
var isRunning = false;

function initialise(cols, rows) {
    // drawGrid(cols, rows);
    life = emptyState(cols, rows)
    displayCurrentState(life);
    populationHistory = [];
    populationGraph.update();
}

function initRandom() {
    // drawGrid(cols, rows); // redraw blank grid
    life = randomState(cols, rows);
    displayCurrentState(life);    
    isEmpty = false;
}

function make2DArray(cols, rows) {
    let arr = new Array(cols)
    
    for (let i = 0; i < cols; i++) {
        arr[i] = new Array(rows)
    }
    return arr
}

function emptyState(cols, rows) {
    var state = make2DArray(cols, rows);
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            state[i][j] = 0;
        }
    }
    isEmpty = true;
    return state;
}

function randomState(cols, rows) {
    var state = make2DArray(cols, rows)

    if (document.getElementById('low').checked) {
        var cutoff = 0.9;
    }
    else if (document.getElementById('high').checked) {
        var cutoff = 0.5;
    }
    else {
        var cutoff = 0.7;
    }

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (Math.random() < cutoff) {
                state[i][j] = 0;
            }
            else {
                state[i][j] = 1;
            }
        }
    }

    populationHistory = [];
    recordPopulation(state)

    return state;
}

function displayCurrentState(state) {
    var cont = grid.getContext("2d")
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let x = i * resolution;
            let y = j * resolution;
            if (state[i][j] == 1) {
                cont.fillStyle = "#478A47";
                cont.fillRect(x, y, resolution, resolution);
                cont.strokeStyle = "lightgray";
                cont.strokeRect(x, y, resolution, resolution)
            }
            else {
                cont.fillStyle = "white";
                cont.fillRect(x, y, resolution, resolution);
                cont.strokeStyle = "lightgray";
                cont.strokeRect(x, y, resolution, resolution);
            }
        }
    }
}

/*function drawGrid(cols, rows) {
    var cont = grid.getContext("2d")
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            var x = i * resolution;
            var y = j * resolution;            
            cont.fillStyle = "white";
            cont.fillRect(x, y, resolution, resolution);
            cont.strokeStyle = "lightgray";
            cont.strokeRect(x, y, resolution, resolution);
        }
    }
} */

function doLife() {

    if (isEmpty) {

    }
    else if (isRunning) {
        let n = 0;
        let iterations = 10000;

        timer = setInterval(function() {
            if (n >= iterations) {
                clearInterval(timer);
            }
            else {
                life = updateLife(life);
                displayCurrentState(life);
                n++;
            }
        }, 100)
    }

}

function updateLife(currentState) {

    let newState = make2DArray(cols, rows)
    
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            sumNeighbours = countNeighbours(currentState, i, j);
            newState[i][j] = rulesForLife(currentState[i][j], sumNeighbours)
        }
        
    }

    recordPopulation(newState);

    return newState;

}

function countNeighbours(currentState, i, j) {

    let arr = currentState.slice() // make copy of current state so I can pop out values
    let neighbourhood = new Array(3);

    // account for cells around edges
    // first column
    if (i == 0) {
        if (j == 0) { //top left cell
            neighbourhood[0] = [ arr[arr.length-1][arr[0].length-1], arr[arr.length-1][j], arr[arr.length-1][j+1] ]
            neighbourhood[1] = [ arr[i][arr[0].length-1], arr[i][j], arr[i][j+1] ]
            neighbourhood[2] = [ arr[i+1][arr[0].length-1], arr[i+1][j], arr[i+1][j+1] ]
        }
        else if (j == arr[i].length-1) { // bottom left cell
            neighbourhood[0] = [ arr[arr.length-1][j-1], arr[arr.length-1][arr[0].length-1], arr[arr.length-1][0] ]
            neighbourhood[1] = [ arr[i][j-1], arr[i][j], arr[i][0] ]
            neighbourhood[2] = [ arr[i+1][j-1], arr[i+1][j], arr[i+1][0] ]        
        }
        else { // all other left side edge cells
            neighbourhood[0] = arr[arr.length-1].slice(j-1, j+2);
            neighbourhood[1] = arr[i].slice(j-1, j+2);
            neighbourhood[2] = arr[i+1].slice(j-1, j+2);
        }
    }
    // last column
    else if (i == arr.length-1) {
        if (j == 0) { // top right cell
            neighbourhood[0] = [ arr[i-1][arr[0].length-1], arr[i-1][j], arr[i-1][j+1] ]
            neighbourhood[1] = [ arr[i][arr[0].length-1], arr[i][j], arr[i][j+1] ]
            neighbourhood[2] = [ arr[0][arr[0].length-1], arr[0][j], arr[0][j+1] ]
        }
        else if (j == arr[i].length-1) { // bottom right cell
            neighbourhood[0] = [ arr[i-1][j-1], arr[i-1][j], arr[i-1][0] ]
            neighbourhood[1] = [ arr[i][j-1], arr[i][j], arr[i][0] ]
            neighbourhood[2] = [ arr[0][j-1], arr[0][j], arr[0][0] ]
        }
        else { // all other right side edge cell
            neighbourhood[0] = arr[i-1].slice(j-1, j+2);
            neighbourhood[1] = arr[i].slice(j-1, j+2);
            neighbourhood[2] = arr[0].slice(j-1, j+2);
        }
    }
    // middle columns
    else {
        if (j == 0) { // top edge row
            neighbourhood[0] = [ arr[i-1][arr[0].length-1], arr[i-1][j], arr[i-1][j+1] ]
            neighbourhood[1] = [ arr[i][arr[0].length-1], arr[i][j], arr[i][j+1] ]
            neighbourhood[2] = [ arr[i+1][arr[0].length-1], arr[i+1][j], arr[i+1][j+1] ]
        }
        else if (j == arr[i].length-1) { // bottom edge row
            neighbourhood[0] = [ arr[i-1][j-1], arr[i-1][j], arr[i-1][0] ]
            neighbourhood[1] = [ arr[i][j-1], arr[i][j], arr[i][0] ]
            neighbourhood[2] = [ arr[i+1][j-1], arr[i+1][j], arr[i+1][0] ]
        }
        else { // all middle cells
            neighbourhood[0] = arr[i-1].slice(j-1, j+2);
            neighbourhood[1] = arr[i].slice(j-1, j+2);
            neighbourhood[2] = arr[i+1].slice(j-1, j+2);
        }
        
    }

    let sum = -arr[i][j] // subtract the centre cell (the cell whose neighbours we're counting)
    for (let n = 0; n < 3; n++) {
        sum += neighbourhood[n].reduce((a,b) => a + b, 0)
    }
    
    if (sum < 0 || sum > 8) {
        console.log("sum error");
    }

    return sum
}

function rulesForLife(oldState, neighbours) {
    
    let newState

    if (oldState == 1) { // if cell is alive
        if (neighbours < 2) { newState = 0 } // death by underpopulation
        else if (neighbours > 3) { newState = 0 } // death by overpopulation
        else { newState = 1 } // stable population
    }
    else if (oldState == 0) { // if cell is not alive
        if (neighbours == 3) { newState = 1 } // reproduction
        else { newState = 0 } // no reproduction
    }
    else {
        //console.log("rules error");
    }

    
    return newState
}

function start() {
    if (isRunning) {

    }
    else {
        isRunning = true
        doLife()
    }
}

function reset() {
    clearInterval(timer);
    initialise(cols, rows);
    isRunning = false;
}

function stop() {
    clearInterval(timer);
    isRunning = false;
}

function oneStep() {
    life = updateLife(life);
    displayCurrentState(life);
}

function recordPopulation(newState) {
    var populationSize = 0;
    for (let m = 0; m < newState.length; m++) {
        populationSize += newState[m].reduce((a,b) => a + b, 0);
    }

    populationHistory.push({x: populationHistory.length+1, y: populationSize})

    populationGraph.data.datasets[0].data = populationHistory;
    populationGraph.update();
    console.log(populationSize);
}

var graphCtx = document.getElementById("pop-graph");
var populationGraph = new Chart(graphCtx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: "population",
            data: populationHistory,
            type: 'line',
            borderColor: '#478A47',
            fill: false,
            lineTension: 0,
            radius: 0
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Population'
        },
        legend: {
            display: false
        },
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom',
                gridLines: {
                    display: true
                }
            }],
            yAxes: [{
                gridLines: {
                    display: true
                },
                ticks: {
                    maxTicksLimit: 6,
                    beginAtZero: true
                }
            }]
        },
        events: [],
        maintainAspectRatio: true,
        responsive: true,
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        },
        animation: false
    }
});

initialise(cols, rows);
