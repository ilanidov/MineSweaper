'use strict'

var gElHint
var gBoard
var gIntervalID
var gDarkMode = false

const BOMB_IMG = '🎇'
const FLAG = '🚩'
const SMILE_WIN = '😎'
const SMILE = '🙂'
const SMILE_PLAY = '😮'

var gLevel = {
    SIZE: 8,
    MINES: null
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    mineCount: 0,
    timer: 0,
    lives: 3,
    isHint: false,
    safeClickCount: 3
}

function onInit() {
    gBoard = buildBoard(gLevel.SIZE)
    renderBoard(gBoard)
    cancelContextMenue()
    lifeCounter()
    hintBtnRestart()
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
}

function rightClickCase(elCell, idxI, idxJ) {

    var currCell = gBoard[idxI][idxJ]

    if (elCell.innerText === BOMB_IMG) return
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
    if (gGame.isHint === true) {
        hintCaseClicked(idxI, idxJ, gElHint)
        return
    }

    if (gGame.shownCount === 0) setMinesAndNgsCount(idxI, idxJ)
    else {
        var currCell = gBoard[idxI][idxJ]
        if (currCell.isShown || currCell.isMarked || elCell.innerText === BOMB_IMG) return

        else {
            if (currCell.isMine) {
                gGame.lives--
                lifeCounter()
                elCell.innerText = BOMB_IMG
                if (gGame.lives === 0) {
                    revealAllBombCells(idxI, idxJ)
                    gameLose(elCell)
                }
            } else {
                elCell.classList.add('shown')
                currCell.isShown = true
                elCell.innerText = currCell.minesAroundCount
                console.log(gGame.shownCount)

                if (currCell.minesAroundCount === 0) {
                    elCell.innerText = ""
                    emptyNgsReveal(idxI, idxJ)
                }
                checkGameOver()
            }
        }
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
            var randInt = Math.random()
            if (randInt > 0.8) {
                gBoard[i][j].isMine = true
                gGame.mineCount++
            }
        }
    }
    bombsCounter()
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
            var currCell = gBoard[i][j]
            if (currCell.isMarked) continue
            if (currCell.isMine) continue

            var cellClass = `.cell-${i}-${j}`
            var currElCell = document.querySelector(cellClass)

            gBoard[rowIdx][colIdx].minesAroundCount = ''

            if (currCell.minesAroundCount === 0) {
                currCell.minesAroundCount = ''
                emptyNgsReveal(i, j)
            }

            currElCell.classList.add('shown')
            currCell.isShown = true
            currElCell.innerText = currCell.minesAroundCount
        }
    }
    checkGameOver()
}

function emptyNgsReveal(idxI, idxJ) {
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === idxI && j === idxJ) continue
            var currCell = gBoard[i][j]
            var cellClass = `.cell-${i}-${j}`
            var currElCell = document.querySelector(cellClass)

            var iAbsDiff = Math.abs(idxI - i)
            var jAbsDiff = Math.abs(idxJ - j)
            if ((iAbsDiff === 1) && (jAbsDiff === 1)) continue
            if (currCell.isMarked || currCell.isMine || (currCell.isShown)) continue

            currElCell.classList.add('shown')
            currCell.isShown = true

            if (currCell.minesAroundCount === 0) {
                currCell.minesAroundCount = ''
                emptyNgsReveal(i, j)
            }
            currElCell.innerText = currCell.minesAroundCount
        }
    }
}

function gameLose(elCell) {
    elCell.style.backgroundColor = 'red'
    elCell.innerText = BOMB_IMG
    gGame.isOn = false
    var elBtn = document.querySelector('.restart')
    elBtn.innerText = "😮"
    clearInterval(gIntervalID)
}

function checkGameOver() {
    shownCounter()
    if (gGame.mineCount === (gLevel.SIZE ** 2) - gGame.shownCount) {
        gGame.isOn = false
        var elBtn = document.querySelector('.restart')
        elBtn.innerText = "😎"
        clearInterval(gIntervalID)
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

function resetGame() {
    var elBtn = document.querySelector('.restart')
    elBtn.innerText = "🙂"
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.mineCount = 0
    gGame.secsPassed = 0
    gGame.timer = 0
    gGame.lives = 3
    gGame.safeClickCount = 3
    gGame.mineCount = 0
    var elBombCounter = document.querySelector('.bombsi')
    elBombCounter.innerHTML = gGame.mineCount
    var elSafeBtn = document.querySelector('.safec')
    elSafeBtn.innerText = gGame.safeClickCount
    clearInterval(gIntervalID)
    clearTimer()
    onInit(gLevel.SIZE)
}

function lifeCounter() {
    var elDiv = document.querySelector('.lives')
    if (gGame.lives === 3) elDiv.innerText = '🤠🤠🤠'
    if (gGame.lives === 2) elDiv.innerText = '🤠🤠'
    if (gGame.lives === 1) elDiv.innerText = '🤠'
    if (gGame.lives === 0) elDiv.innerText = ''
}

function hintsCounter(elBtn) {
    if (gGame.isHint === false) {
        elBtn.innerText = '📌'
        gGame.isHint = true
    } else {
        elBtn.innerText = '💡'
        gGame.isHint = false
    }
    gElHint = elBtn
}

function hintCaseClicked(idxI, idxJ, elBtn) {
    gGame.isHint = false
    var revealedCells = []
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            var currCell = gBoard[i][j]
            if (currCell.isShown) continue
            revealedCells.push({ i, j })

            var cellClass = `.cell-${i}-${j}`
            var currElCell = document.querySelector(cellClass)
            currElCell.classList.add('shown')

            if (currCell.minesAroundCount === 0) currCell.minesAroundCount = ''
            currElCell.innerText = currCell.minesAroundCount
            if (currCell.isMine) currElCell.innerText = BOMB_IMG
            console.log(revealedCells)
        }
    }
    elBtn.style.display = 'none'
    function coverCellsBack(cells) {
        for (var i = 0; i < cells.length; i++) {
            var currCellToCover = cells[i]
            var cellClass = `.cell-${currCellToCover.i}-${currCellToCover.j}`
            var currElCell = document.querySelector(cellClass)
            currElCell.classList.remove('shown')
            currElCell.innerText = ''
        }
    }

    setTimeout(coverCellsBack, 2000, revealedCells)
}

function hintBtnRestart() {
    var btns = document.querySelectorAll('.hint')
    for (var i = 0; i < btns.length; i++) {
        var currBtn = btns[i]
        currBtn.style.display = 'inline'
        currBtn.innerText = '💡'
    }
}

function shownCounter() {
    var shownCount = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isShown) shownCount++
        }
    }
    gGame.shownCount = shownCount
}

function darkMode() {
    var elToDark = document.querySelectorAll('.dark')
    for (var i = 0; i < elToDark.length; i++) {
        var currEl = elToDark[i]
        currEl.classList.toggle('bodyDark')
    }

    elToDark = document.querySelectorAll('.darkDiv')
    for (var i = 0; i < elToDark.length; i++) {
        var currEl = elToDark[i]
        currEl.classList.toggle('darkModeDiv')
    }

    elToDark = document.querySelector('.on')
    if (elToDark.innerText === 'ON') elToDark.innerText = 'OFF'
    else (elToDark.innerText = 'ON')

    var elToDarkImg = document.querySelector('body')
    if (elToDark.innerText === 'ON') elToDarkImg.style.backgroundImage = ' url(img/4.jpg)';
    else elToDarkImg.style.backgroundImage = ' url(img/2.jpg)';
}

function safeClick() {
    if (gGame.safeClickCount === 0) return
    if (gGame.isOn === false) return
    gGame.safeClickCount--
    var safeCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine || currCell.isShown || currCell.isMarked) continue
            safeCells.push({ i, j })
        }
    }
    if (safeCells.length === 0) return

    var randIdx = getRandomIntExclu(0, safeCells.length)
    var safeCell = safeCells[randIdx]

    var cellClass = `.cell-${safeCell.i}-${safeCell.j}`
    var currElCell = document.querySelector(cellClass)

    currElCell.classList.add('shown')
    currElCell.innerText = gBoard[safeCell.i][safeCell.j].minesAroundCount
    if (gBoard[safeCell.i][safeCell.j].minesAroundCount === 0) currElCell.innerText = ''

    var elSafeBtn = document.querySelector('.safec')
    elSafeBtn.innerText = gGame.safeClickCount

    function reverseSafeCell(elCell) {
        elCell.classList.remove('shown')
        elCell.innerText = ''
    }
    setTimeout(reverseSafeCell, 1000, currElCell)
}

function bombsCounter() {
    var elBombCounter = document.querySelector('.bombsi')
    elBombCounter.innerHTML = gGame.mineCount

}



