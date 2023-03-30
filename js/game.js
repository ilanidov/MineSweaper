'use strict'

var gBoard

const BOMB_IMG = '🎇'
const FLAG = '🚩'
const SMILE_WIN = '😎'
const SMILE = '🙂'
const SMILE_PLAY = '😮'

var gLevel = {
    SIZE: 4,
    MINES: null
}


var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    mineCount: 0,
    timer: 0
}

function onInit() {                            //works like crap, to fix setting up every click
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard)
    cancelContextMenue()
    gGame.isOn = true
}

function onCellClicked(elCell, idxI, idxJ, event) {



    if (gGame.isOn) {
        var clickButnCheck = isRightClickMouse(event)    //false:regular-------true:rightclick
        if (!clickButnCheck) leftClickCase(elCell, idxI, idxJ)
        else rightClickCase(elCell, idxI, idxJ)

        if (gGame.timer === 0) {
            setTimer()
            gGame.timer++
        }
    }
    // else return
    // console.log('shown', gGame.shownCount)
    // console.log('marked', gGame.markedCount)
    // console.log('mines', gGame.mineCount)
}

function rightClickCase(elCell, idxI, idxJ) {

    var currCell = gBoard[idxI][idxJ]
    if (currCell.isShown) return
    if (!currCell.isMarked) {
        currCell.isMarked = true
        elCell.innerText = FLAG
        gGame.markedCount++
    } else {
        currCell.isMarked = false
        elCell.innerText = ""
        gGame.markedCount--
    }
}

function leftClickCase(elCell, idxI, idxJ) {

    if (gGame.shownCount === 0) {
        setMinesAndNgsCount(idxI, idxJ)
    }

    var currCell = gBoard[idxI][idxJ]
    if (currCell.isShown || currCell.isMarked) return
    else {
        elCell.classList.add('shown')
        currCell.isShown = true
        elCell.innerText = currCell.minesAroundCount


        if (currCell.minesAroundCount === 0) {
            elCell.innerText = ""
            firstClickNgsReveal(idxI, idxJ)
        }

        gGame.shownCount++
        checkGameOver()
    }
    if (currCell.isMine) {
        revealAllBombCells(idxI, idxJ)
        gameLose(elCell)
    }
}

function setMinesAndNgsCount(idxI, idxJ) {
    var ngs = getNgsPoss(idxI, idxJ, gBoard)
    gBoard[idxI][idxJ].minesAroundCount = 'current'
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            for (var p = 0; p < ngs.length; p++) {
                if (gBoard[i][j] === gBoard[ngs[p].i][ngs[p].j])
                    gBoard[i][j].minesAroundCount = 'not'
            }
        }
    }
    bombPlacer(idxI, idxJ)
}

function bombPlacer(idxI, idxJ) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.minesAroundCount === 'not' || currCell.minesAroundCount === 'current') continue
            // if (currCell.minesAroundCount === 'current') continue
            var randInt = Math.random()
            if (randInt > 0.7) {
                gBoard[i][j].isMine = true
                gGame.mineCount++
            }
        }
    }
    setNgsNums(idxI, idxJ)
}

function setNgsNums(idxI, idxJ) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) continue
            if (currCell.minesAroundCount === 'current') continue

            var negsCount = countNegs(i, j, gBoard)
            gBoard[i][j].minesAroundCount = negsCount

        }
    }
    firstClickNgsReveal(idxI, idxJ)
}

function firstClickNgsReveal(rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === rowIdx && j === colIdx) continue

            var currCell = gBoard[i][j]

            if (currCell.isMine) continue
            if (currCell.isMarked) continue
            if (currCell.isShown) continue


            var cellClass = `cell-${i}-${j}`
            cellClass = '.' + cellClass

            var currElCell = document.querySelector(cellClass)
            currCell.isShown = true
            gBoard[rowIdx][colIdx].minesAroundCount = ''
            if (currCell.minesAroundCount === 0) currCell.minesAroundCount = ''
            currElCell.innerText = currCell.minesAroundCount
            currElCell.classList.add('shown')
            gGame.shownCount++

        }
    }
}

function gameLose(elCell) {
    elCell.style.backgroundColor = 'red'
    elCell.innerText = BOMB_IMG
    gGame.isOn = false
    var elBtn = document.querySelector('.restart')
    elBtn.innerText = "😮"
}

function checkGameOver() {
    if (gGame.mineCount === (gLevel.SIZE ** 2) - gGame.shownCount && gGame.markedCount === gGame.mineCount) {
        gGame.isOn = false
        var elBtn = document.querySelector('.restart')
        elBtn.innerText = "😎"
    }
}

function revealAllBombCells(idxI, idxJ) {
    var bombCellsPoss = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            var cell = gBoard[i][j]
            if (cell === gBoard[idxI][idxJ]) continue
            if (cell.isMine) bombCellsPoss.push({ i, j })
        }
    }
    for (var i = 0; i < bombCellsPoss.length; i++) {
        var currClass = getClassName(bombCellsPoss[i])
        currClass = "." + currClass
        var elCell = document.querySelector(currClass)
        elCell.classList.add('shown')
        elCell.innerText = BOMB_IMG
    }
}

function getNgsPoss(rowIdx, colIdx, mat) {
    var negsPoss = []
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= mat[i].length) continue
            if (i === rowIdx && j === colIdx) continue
            negsPoss.push({ i, j })
        }
    }
    return negsPoss
}

function diffSelect(num) {
    gLevel.SIZE = num
    resetGame()
}

function resetGame() {
    var elBtn = document.querySelector('.restart')
    elBtn.innerText = "🙂"
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.mineCount = 0
    gGame.secsPassed = 0
    onInit(gLevel.SIZE)
}

function setTimer() {
    var minutesLabel = document.querySelector(".seconds")
    var secondsLabel = document.querySelector(".minutes")
    var totalSeconds = 0
    intervalID = setInterval(setTime, 1000)
    function setTime() {
        ++totalSeconds
        minutesLabel.innerHTML = pad(totalSeconds % 60)
        secondsLabel.innerHTML = pad(parseInt(totalSeconds / 60))
    }
    function pad(val) {
        var valString = val + ""
        if (valString.length < 2) return "0" + valString
        else return valString
    }
}
