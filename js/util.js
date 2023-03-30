'use strict'


function buildBoard(size) {
    const board = []
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = { minesAroundCount: null, isShown: false, isMine: false, isMarked: false }
        }
    }

    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board.length; j++) {
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

function cancelContextMenue() {
    var allCelss = document.querySelectorAll('.cell')
    for (var i = 0; i < allCelss.length; i++) {
        var currCell = allCelss[i]
        currCell.addEventListener("contextmenu", (e) => {
            e.preventDefault()
        })
    }
}

function isRightClickMouse(event) {
    var isClicked
    if (event.button === 2) {
        isClicked = true
    } else if (event.button === 0) {
        isClicked = false
    }
    return isClicked
}

function getClassName(position) {
    const cellClass = `cell-${position.i}-${position.j}`

    return cellClass
}
