'use strict'

var gBoard

const BOMB_IMG = '🎇'
const FLAG = '🚩'
const SMILE_WIN = '😎'
const SMILE = '🙂'
const SMILE_PLAY = '😮'

// board[i][j] = { minesAroundCount: null,
//      isShown: false,
//       isMine: false, 
//       isMarked: true }



var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function onInit() {
    gBoard = buildBoard(4)
    console.table(gBoard)
    renderBoard(gBoard)
    onCellMarked()
}

function buildBoard(size) {
    const board = []
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = { minesAroundCount: null, isShown: false, isMine: false, isMarked: false }
            var randInt = Math.random()
            if (randInt > 0.7) board[i][j].isMine = true
        }
    }
    // board[2][2].isMine = true   //// to delete
    // board[1][1].isMine = true
    setMinesNegsCount(board)
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < 4; j++) {
            // const currCell = board[i][j]
            // var cell = ''
            var cellClass = getClassName({ i: i, j: j }) // 'cell-3-4'
            strHTML += `\t<td oncontextmenu="onCellClicked(this, ${i}, ${j},event)"
                              onclick="onCellClicked(this, ${i}, ${j},event)"
                          class="cell ${cellClass}"> </td>\n`
        }
        strHTML += '</tr>\n'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function getClassName(position) {
    const cellClass = `cell-${position.i}-${position.j}`
    return cellClass
}

// function resetGame() {
//need to be set up for the button smily
// }

// function setMinesNegsCount(board) {
// }
// function checkGameOver() {
// }
// function expandShown(board, elCell, i, j) {
// }


function onCellMarked() {
    var allCelss = document.querySelectorAll('.cell')
    for (var i = 0; i < allCelss.length; i++) {
        var currCell = allCelss[i]
        currCell.addEventListener("contextmenu", (e) => {
            e.preventDefault()
        })
    }
}

function handleMouseDown(event) {
    var isClicked
    if (event.button === 2) {
        isClicked = true
    } else if (event.button === 0) {
        isClicked = false

    }
    return isClicked
}


function onCellClicked(elCell, idxI, idxJ, event) {
    var clickButnCheck = handleMouseDown(event)    //false regular-true to rightclick
    var currCell = gBoard[idxI][idxJ]

    if (!clickButnCheck) {
        if (currCell.isMine) {
            elCell.classList.add('shown')
            elCell.innerText = BOMB_IMG
            return
            // gameover()
        }
        if (currCell.isShown || currCell.isMarked) return
        else {
            elCell.classList.add('shown')
            currCell.isShown = true
            elCell.innerText = currCell.minesAroundCount
            if (currCell.minesAroundCount === 0) elCell.innerText = ""
        }
    } else {
        if (currCell.isShown) return
        if (!currCell.isMarked) {
            currCell.isMarked = true
            elCell.innerText = FLAG
        } else {
            currCell.isMarked = false
            elCell.innerText = ""
        }
    }

    // if (clickButnCheck) {
    //     if (elCell.classList.contains('flag')) {
    //         elCell.classList.remove('flag')
    //         elCell.classList.add('cover')
    //     } else {
    //         elCell.classList.remove('cover')
    //         elCell.classList.add('flag')
    //     }
    // } else {
    //     elCell.classList.remove('cover')
    //     var currentCell = gBoard[idxI][idxJ]
    //     elCell.innerText = currentCell.minesAroundCount
    // }

    // if (gBoard[idxI][idxJ].isMine) elCell.innerText = BOMB_IMG   //should be game over

}







function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var negsCount = countNegs(i, j, board)
            var currCell = board[i][j]
            if (currCell.isMine) continue

            currCell.minesAroundCount = negsCount
        }

    }

}

function countNegs(rowIdx, colIdx, mat) {
    var negsCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (currCell === BOMB_IMG) continue
            if (j < 0 || j >= mat[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            var currCell = mat[i][j]
            if (currCell.isMine) negsCount++

        }
    }
    return negsCount
}


