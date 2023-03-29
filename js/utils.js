'use strict'

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j }) // 'cell-3-4'
            strHTML += `\t<td onClick="onCellClicked(this,${i},${j}) class="cell ${cellClass}></td>\n`
        }
        strHTML += '</tr>\n'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function getClassName(position) { // {i:2 , j:5}
    const cellClass = `cell-${position.i}-${position.j}` // 'cell-2-5'
    return cellClass
}