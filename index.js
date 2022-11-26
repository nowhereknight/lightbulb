const fs = require('fs');
const prompt = require('prompt-sync')({ sigint: true });


matrix = []
DELAY_IN_SECONDS = 2

/**
 * Function to provide a sleep
 * @param  {Number} ms The miliseconds the terminal will sleep
 */
const delay = ms => new Promise(res => setTimeout(res, ms));


/**
 * Function to provide the select file UI
 */
function selectFile() {
    options = []
    fs.readdirSync('./').forEach(file => {
        if (file.endsWith('.txt')) {
            options.push(file)
        }
    });
    console.log("Please select the file where the matrix is located")
    for (var i = 0; i < options.length; i++) {
        console.log(`${i+1}) ${options[i]}`);
    }
    const answer = prompt('Enter an option: ');
    if (answer >= 1 && answer <= options.length) {
        return options[answer - 1]
    } else {
        console.log("Enter a valid option")
        return selectFile()
    }
}


/**
 * Function to load the contents of a file to the global variable 'matrix'
 * @param  {[type]} file Name of the file to be loaded
 * @todo Add validations to the contents of the file as it works mostly with the happy path for now
 */
function loadMatrix(file) {
    matrix = []
    const allFileContents = fs.readFileSync(file, 'utf-8');
    allFileContents.split(/\r?\n/).forEach(line => {
        line = line.split(',')
        matrix.push(line)
    });
}


/**
 * Function to display the contents of the global variable 'matrix' to the stdout
 */
function printMatrix() {
    string = "    "
    for (var i = 0; i < matrix[0].length; i++) {
        string += `${i} `
    }
    string += "\n    " + "_".repeat(matrix[0].length * 2) + "\n"
    for (var i = 0; i < matrix.length; i++) {
        if (i < 10) {
            string += ` ${i} |`
        } else {
            string += `${i} |`
        }
        for (var j = 0; j < matrix[i].length; j++) {
            string += matrix[i][j] + " "
        }
        string += "\n"
    }
    console.log(string)
}


/**
 * Syncronous function that returns the neighbours on the left side of a cell
 * @param  {Number} i The row index
 * @param  {Number} j The column index
 * @return {Number}      amt of neighbours
 */
function checkLeft(i, j) {
    return new Promise((resolve) => {
        let currentOffNeighbours = 0
        let k = j - 1
        while (k >= 0 && matrix[i][k] != "1") {
            if (matrix[i][k] == "0") {
                currentOffNeighbours += 1
            }
            k -= 1
        }
        resolve(currentOffNeighbours)
    })
}


/**
 * Syncronous function that returns the neighbours on the right side of a cell
 * @param  {Number} i The row index
 * @param  {Number} j The column index
 * @return {Number}      amt of neighbours
 */
function checkRight(i, j) {
    return new Promise((resolve) => {
        let currentOffNeighbours = 0
        let k = j + 1
        while (k < matrix[i].length && matrix[i][k] != "1") {
            if (matrix[i][k] == "0") {
                currentOffNeighbours += 1
            }
            k += 1
        }
        resolve(currentOffNeighbours)
    })
}


/**
 * Syncronous function that returns the neighbours on the up side of a cell
 * @param  {Number} i The row index
 * @param  {Number} j The column index
 * @return {Number}      amt of neighbours
 */
function checkUp(i, j) {
    return new Promise((resolve) => {
        let currentOffNeighbours = 0
        let k = i - 1
        while (k >= 0 && matrix[k][j] != "1") {
            if (matrix[k][j] == "0") {
                currentOffNeighbours += 1
            }
            k -= 1
        }
        resolve(currentOffNeighbours)
    })
}


/**
 * Syncronous function that returns the neighbours on the down side of a cell
 * @param  {Number} i The row index
 * @param  {Number} j The column index
 * @return {Number}      amt of neighbours
 */
function checkDown(i, j) {
    return new Promise((resolve) => {

        let currentOffNeighbours = 0
        let k = i + 1
        while (k < matrix.length && matrix[k][j] != "1") {
            if (matrix[k][j] == "0") {
                currentOffNeighbours += 1
            }
            k += 1
        }
        resolve(currentOffNeighbours)
    })
}


/**
 * Function that returns the cell with the most amt of off neighbours
 * @return {{Number, Number}}    Object with row and column of cell. 
 *                               {i: null, j: null} if no off cell left is available
 */
async function getNextProspect() {
    return new Promise(async(resolve) => {
        maxOffNeighbours = -1
        nextProspect = { i: null, j: null }
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[i].length; j++) {
                currentOffNeighbours = 0
                if (matrix[i][j] == "0") {
                    currentOffNeighbours += await checkLeft(i, j)
                    currentOffNeighbours += await checkRight(i, j)
                    currentOffNeighbours += await checkUp(i, j)
                    currentOffNeighbours += await checkDown(i, j)
                    if (currentOffNeighbours > maxOffNeighbours) {
                        maxOffNeighbours = currentOffNeighbours
                        nextProspect = { i, j }
                    }
                }
            }
        }
        resolve(nextProspect)
    })

}

/**
 * Function that turns a cell on and lits all neighbours to the side and up and down
 * @param  {Number} i The row index
 * @param  {Number} j The column index
 */
function turnOn(i, j) {
    console.log(i, j)
    matrix[i][j] = "*"

    // Go left
    k = j - 1
    while (k >= 0 && matrix[i][k] != "1") {
        matrix[i][k] = "+"
        k -= 1
    }

    // Go right
    k = j + 1
    while (k < matrix[i].length && matrix[i][k] != "1") {
        matrix[i][k] = "+"
        k += 1
    }

    // Go up
    k = i - 1
    while (k >= 0 && matrix[k][j] != "1") {
        matrix[k][j] = "+"
        k -= 1
    }

    // Go down
    k = i + 1
    while (k < matrix.length && matrix[k][j] != "1") {
        matrix[k][j] = "+"
        k += 1
    }
}


/**
 * Function that manages the main UI
 */
async function main() {
    console.log("These are the possible options")
    console.log("1) Load file")
    console.log("2) Lit up room")
    const answer = prompt('Enter an option (Ctrl + C to exit): ');
    if (answer == "1") {
        file = selectFile()
        loadMatrix(file)
        console.log("Initial matrix")
        printMatrix()
        main()
    } else if (answer == "2") {
        var { i, j } = await getNextProspect()
        onLights = 0
        while (i != null) {
            await delay(DELAY_IN_SECONDS * 1000);
            console.clear()
            console.log(`${onLights} lights up until now`)
            console.log(`Turning on ${i}:${j} light`)
            turnOn(i, j)
            printMatrix()
            var { i, j } = await getNextProspect()
            onLights += 1
        }
        console.log(`All cells lit up. ${onLights} light bulbs on`)
        main()
    }
}


main()