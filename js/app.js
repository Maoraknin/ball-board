'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const CANDY = 'CANDY'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const CANDY_IMG = '<img src="img/candy.png">'


// Model:
var gBoard
var gGamerPos
var gEmptyCells
var gCandyInterval
var gBallInterval
var gScoreCount
var gIsOnCandy
var gCandyLocation
var gBallCount

function onInitGame() {
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    gScoreCount = 0
    gIsOnCandy = false
    gBallCount = 3
    renderBoard(gBoard)
    emptyCellsUpdate()
    enterRandBall()
    enterCandy()

}

function restart() {
    var elBtn = document.querySelector('button')
    elBtn.classList.add('hidden')
    onInitGame()
}

function enterCandy() {
    var clearCandy
    gCandyInterval = setInterval(() => {
        // if (isGameOver()) return
        getRandomInt(0, gEmptyCells.length)
        shuffle(gEmptyCells)
        gCandyLocation = gEmptyCells.pop()
        gBoard[gCandyLocation.i][gCandyLocation.j].gameElement = CANDY
        renderCell(gCandyLocation, CANDY_IMG)
        clearCandy = setTimeout(() => {
            if (gBoard[gCandyLocation.i][gCandyLocation.j].gameElement === GAMER){
                console.log('here:')
                clearTimeout(clearCandy)
                return
            }
            gBoard[gCandyLocation.i][gCandyLocation.j].gameElement = null
            renderCell(gCandyLocation, '')
            clearTimeout(clearCandy)
        }, 3000)


    }, 5000)
}

function enterRandBall() {
    // isGameOver()
    gBallInterval = setInterval(() => {
        emptyCellsUpdate()
        // if (isGameOver()) return
        getRandomInt(0, gEmptyCells.length)
        shuffle(gEmptyCells)
        const randCell = gEmptyCells.pop()
        gBoard[randCell.i][randCell.j].gameElement = BALL
        renderCell(randCell, BALL_IMG)
        // countNeighbors(randCell.i, randCell.j, gBoard)
        gBallCount++
    }, 3000)
}

function gameOver() {
    clearInterval(gBallInterval)
    clearInterval(gCandyInterval)
    var elBtn = document.querySelector('button')
    elBtn.classList.remove('hidden')

}


function emptyCellsUpdate() {
    gEmptyCells = []
    var ballCount = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.type === WALL) continue
            else if (!currCell.gameElement) gEmptyCells.push({ i, j })
        }
    }


}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                board[i][j].type = WALL
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    board[7][2].gameElement = BALL
    board[2][2].gameElement = BALL
    board[0][board.length / 2].type = FLOOR
    board[board.length / 2][0].type = FLOOR
    board[board.length / 2][board[0].length - 1].type = FLOOR
    board[board.length - 1][board.length / 2].type = FLOOR


    console.log(board)
    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    elBoard.innerHTML = strHTML
}


// Move the player to a specific location
function moveTo(i, j) {
    if (gIsOnCandy) return
    emptyCellsUpdate()
    countNeighbors(i, j, gBoard)
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)
    if (i === -1 && j === gBoard.length / 2) {
        i = gBoard.length - 1
    }
    if (i === gBoard.length && j === gBoard.length / 2) {
        i = 0
    }
    if (i === gBoard.length / 2 && j === gBoard[0].length) {
        j = 0
    }
    if (i === gBoard.length / 2 && j === -1) {
        j = gBoard[0].length - 1
    }

    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return

    // Calculate distance to make sure we are moving to a neighbor cell


    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || iAbsDiff === gBoard.length - 1 || jAbsDiff === gBoard[0].length - 1) {
        // if (i === -1 && j === gBoard.length / 2) {
        //     i = gBoard.length - 1
        // }

        if (targetCell.gameElement === BALL) {
            console.log('Collecting!')
            playBallSound()
            gScoreCount++
            gBallCount--
            if (gBallCount === 0) gameOver()
            const elH2Count = document.querySelector('h2 span')
            elH2Count.innerText = gScoreCount
        } else if (targetCell.gameElement === CANDY) {
            gIsOnCandy = true
            playCandySound()
            setTimeout(() => {
                gIsOnCandy = false

            }, 3000)

        }
        gamerMove(i, j)

        // DONE: Move the gamer
        // REMOVING FROM
        // update Model

        // update DOM


        // ADD TO
        // update Model

        // update DOM


    }

}

function gamerMove(i, j) {
    const nextCell = gBoard[i][j]
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
    renderCell(gGamerPos, '')
    nextCell.gameElement = GAMER
    gGamerPos = { i, j }
    renderCell(gGamerPos, GAMER_IMG)
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value

}

// Move the player by keyboard arrows
function onHandleKey(event) {

    const i = gGamerPos.i
    const j = gGamerPos.j
    console.log('event.key:', event.key)

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue

            if (mat[i][j].gameElement === BALL) neighborsCount++
        }
    }
    const elH2Count = document.querySelector('.neighbors span')
    elH2Count.innerText = neighborsCount
    return neighborsCount
}


// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function playBallSound() {
    const sound = new Audio('sound/collect.mp3')
    sound.play()
}

function playCandySound() {
    const sound = new Audio('sound/eating.mp3')
    sound.play()
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(items) {
    var randIdx, keep;
    for (var i = items.length - 1; i > 0; i--) {
        randIdx = getRandomInt(0, items.length);
        keep = items[i];
        items[i] = items[randIdx];
        items[randIdx] = keep;
    }
    return items;
}