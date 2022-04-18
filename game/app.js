import Grid from "./Grid.js"
import Tile from "./Tile.js"

let xDown = null;
let yDown = null;

let xDownM = null;
let yDownM = null;

let timeS = 0;
let timeM = 0;

let score = 0

let tabs = []
let item = {}



const gameBoard = document.querySelector(".game-board")
const timeEl = document.querySelector(".timer")

let time

let grid = new Grid(gameBoard)

alertGame("start")

let statisticList = document.querySelector(".statistic__list")
let columTime = document.querySelector(".statistic__colum-time")
let columPosition = document.querySelector(".statistic__colum-position")
let columName = document.querySelector(".statistic__colum-name")



document.querySelector(".ststistic__button").addEventListener("click", async () => {

    if (statisticList.classList.contains("hide")) {
        const records = await request('/api/v1/record/')
        printStatistic(records)
        statisticList.classList.remove("hide")
        statisticList.classList.add("show")
    }
})
document.querySelector(".satistic__close").addEventListener("click", () => {
    if (statisticList.classList.contains("show")) {
        columName.innerHTML = ""
        columTime.innerHTML = ""
        columPosition.innerHTML = ""
        tabs = []
        statisticList.classList.remove("show")
        statisticList.classList.add("hide")
    }
})

function setupInput() {
    window.addEventListener("keydown", handleInput, { once: true })
}

async function handleInput(e) {
    if (e.key === "ArrowUp") {
        if (!canMoveUp()) {
            setupInput()
            return
        }
        await moveUp()
    } else if (e.key === "ArrowDown") {
        if (!canMoveDown()) {
            setupInput()
            return
        }
        await moveDown()
    } else if (e.key === "ArrowLeft") {
        if (!canMoveLeft()) {
            setupInput()
            return
        }
        await moveLeft()
    } else if (e.key === "ArrowRight") {
        if (!canMoveRight()) {
            setupInput()
            return
        }
        await moveRight()
    } else {
        setupInput()
        return
    }
    
    grid.cells.forEach(cell => cell.mergeTiles())

    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
        newTile.waitForTransition(true).then(() => {
            clearInterval(time)
            alertGame("lose")
        })
    }

    setupInput()
    newTile.waitForTransition(true).then(() => {
        checkWin()
        setsScore()
    })
}

function handleMouseStart(e) {
    xDownM = e.clientX
    yDownM = e.clientY
}

async function handleMouseMove(e,) {

    let x = e.clientX
    let y = e.clientY

    let xDiff = xDownM - x;
    let yDiff = yDownM - y;

    if (xDiff !== 0 && yDiff !== 0) {
        if (Math.abs(xDiff) > Math.abs(yDiff)) {

            if (xDiff > 0) {
                if (!canMoveLeft()) {
                    return
                }
                await moveLeft()
            } else {
                if (!canMoveRight()) {
                    return
                }
                await moveRight()
            }
        } else {
            if (yDiff > 0) {
                if (!canMoveUp()) {
                    return
                }
                await moveUp()
            } else {
                if (!canMoveDown()) {
                    return
                }
                await moveDown()
            }
        }

        xDownM = null;
        yDownM = null;

        grid.cells.forEach(cell => cell.mergeTiles())

        const newTile = new Tile(gameBoard)
        grid.randomEmptyCell().tile = newTile

        if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
            newTile.waitForTransition(true).then(() => {
                clearInterval(time)
                alertGame("lose")
            })
        }

        newTile.waitForTransition(true).then(() => {
            checkWin()
            setsScore()
        })
    }
}

function getTouches(e) {
    return e.touches
}

function handleTouchStart(e) {
    const firstTouch = getTouches(e)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

async function handleTouchMove(e) {
    e.preventDefault()
    if (!xDown || !yDown) {
        return
    }

    let xUp = e.changedTouches[0].clientX;
    let yUp = e.changedTouches[0].clientY;

    let xDiff = xDown - xUp;
    let yDiff = yDown - yUp;

    e.preventDefault()

    if (yDiff !== 0 && xDiff !== 0) {
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                if (!canMoveLeft()) {
                    return
                }
                await moveLeft()
                e.preventDefault()
            } else {
                if (!canMoveRight()) {
                    return
                }
                await moveRight()
                e.preventDefault()
            }
        } else {
            if (yDiff > 0) {
                if (!canMoveUp()) {
                    return
                }
                await moveUp()
                e.preventDefault()
            } else {
                if (!canMoveDown()) {
                    return
                }
                await moveDown()
                e.preventDefault()
            }
        }

        xDown = null;
        yDown = null;

        grid.cells.forEach(cell => cell.mergeTiles())

        const newTile = new Tile(gameBoard)
        grid.randomEmptyCell().tile = newTile

        if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
            newTile.waitForTransition(true).then(() => {
                clearInterval(time)
                alertGame("lose")
            })
        }

        newTile.waitForTransition(true).then(() => {
            checkWin()
            setsScore()
        })
        e.preventDefault()
    }

};

function moveUp() {
    return slideTiles(grid.cellsByColumn)
}

function moveDown() {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft() {
    return slideTiles(grid.cellsByRow)
}

function moveRight() {
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells) {
    return Promise.all(
        cells.flatMap(group => {
            const promises = []
            for (let i = 1; i < group.length; i++) {
                const cell = group[i]
                if (cell.tile == null) continue
                let lastValidCell
                for (let j = i - 1; j >= 0; j--) {
                    const moveToCell = group[j]
                    if (!moveToCell.canAccept(cell.tile)) break
                    lastValidCell = moveToCell
                }
                if (lastValidCell != null) {
                    promises.push(cell.tile.waitForTransition())
                    if (lastValidCell.tile != null) {
                        lastValidCell.mergeTile = cell.tile
                        score += cell.tile.value * 2
                    } else {
                        lastValidCell.tile = cell.tile
                    }
                    cell.tile = null
                }
            }
            return promises
        }))
}

function canMoveUp() {
    return canMove(grid.cellsByColumn)
}

function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft() {
    return canMove(grid.cellsByRow)
}

function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells) {
    return cells.some(group => {
        return group.some((cell, index) => {
            if (index === 0) return false
            if (cell.tile == null) return false
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile)
        })
    })
}

function decreaseTime() {
    let current = ++timeS

    if (current < 10) {
        current = `0${current}`
    }
    if (current === 60) {
        timeS = 0
        current = 0
        ++timeM
    }
    if (current === 0) {
        current = `00`
    }
    setTime(current)
    return current
}

function setTime(value) {
    timeEl.innerHTML = `${timeM}:${value}`
}

function checkWin() {
    let count = 0;
    for (let i = 0; i < grid.cells.length; i++) {
        if (grid.cells[i].tile) {
            count += grid.cells[i].tile.value
            if (grid.cells[i].tile.value === 2048) {
                clearInterval(time)
                alertGame("win")
            }
        }
    }
    setupInput()
}

function setsScore() {
    document.querySelector(".score").innerHTML = score
}

function alertGame(text) {
    let newRecord = {}
    let alert = document.querySelector(".alert-game")
    let alertText = document.querySelector(".alert-game__text")
    let alertButton = document.querySelector(".alert-game__button")
    let inputName = document.querySelector(".user-name-input")
    alert.classList.remove("hide")
    alert.classList.add("show")

    let seconds = timeS
    let minutes = timeM
    if (seconds < 10) {
        seconds = `0${seconds}`
    }

    if (text === "win") {
        let record = {}
        alertText.innerHTML = `Вы выйграли <br> время: ${timeM}:${seconds} <br> счет: ${score}`
        alertButton.innerHTML = "ЗАНОВО"
        inputName.classList.remove("hide")
        inputName.classList.add("show")
        alertButton.addEventListener("click", async () => {
            newRecord = { username: inputName.value, time: `${minutes}:${seconds}` }
            await request('/api/v1/record/', "POST", newRecord)
        })
    } else if (text === "lose") {
        alertText.innerHTML = `Вы проиграли <br> время: ${minutes}:${seconds} <br> счет: ${score}`
        alertButton.innerHTML = "ЗАНОВО"

    } else if (text === "start") {
        alertText.innerHTML = "Наберите 2048"

    }
    alertButton.addEventListener("click", () => {
        alert.classList.remove("show")
        alert.classList.add("hide")
        inputName.classList.remove("show")
        inputName.classList.add("hide")
        startGame()
    })
}

function startGame() {
    clearInterval(time)
    score = 0
    setsScore()
    timeM = 0
    timeS = 0
    while (gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild);
    }

    gameBoard.innerHTML = `<div class="touch-panel"></div>`
    document.querySelector(".touch-panel").addEventListener('touchstart', handleTouchStart, false);
    document.querySelector(".touch-panel").addEventListener('touchend', handleTouchMove, false);
    document.querySelector(".touch-panel").addEventListener('touchmove', (e) => { e.preventDefault() }, false);


    document.querySelector(".touch-panel").addEventListener('mousedown', handleMouseStart, false);
    document.querySelector(".touch-panel").addEventListener('mouseup', handleMouseMove, false);

    grid = new Grid(gameBoard)
    grid.randomEmptyCell().tile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = new Tile(gameBoard)

    time = setInterval(decreaseTime, 1000)
    setupInput()
}

async function printStatistic(records) {


    for (const item of records) {
        let second = Number(item.time.split(':')[1])
        if (second < 10) {
            second = `0${second}`
        }
        tabs.push({ min: Number(item.time.split(':')[0]), sec: second, name: item.username })
    }

    if (timeS < 10) {
        timeS = `0${timeS}`
    }

    tabs.sort(function (x1, x2) {
        if (x1.min < x2.min) return -1;
        if (x1.min > x2.min) return 1;
        if (x1.sec < x2.sec) return -1;
        if (x1.sec > x2.sec) return 1;
        return 0;
    });
    while (columName.firstChild) {
        columName.removeChild(columName.firstChild);
    }
    while (columTime.firstChild) {
        columTime.removeChild(columTime.firstChild);
    }
    while (columPosition.firstChild) {
        columPosition.removeChild(columPosition.firstChild);
    }
    columName.innerHTML += `<div class="ststistic__name">Имя</div>`
    columTime.innerHTML += `<div class="ststistic__time">Время</div>`
    columPosition.innerHTML += `<div class="ststistic__position">Позиция</div>`
    for (let i = 0; i < tabs.length; i++) {
        columName.innerHTML += `<div class="ststistic__name">${tabs[i].name}</div>`
        columTime.innerHTML += `<div class="ststistic__time">${tabs[i].min}:${tabs[i].sec}</div>`
        columPosition.innerHTML += `<div class="ststistic__position">${i + 1}.</div>`
    }
}

async function request(url, method = 'GET', data = null) {
    try {

        const headers = {}
        let body

        if (data) {
            headers['Content-Type'] = 'application/json'
            body = JSON.stringify(data)
        }

        const response = await fetch(url, {
            method,
            headers,
            body
        })
        return await response.json()
    } catch (error) {
        console.warn('error', error.message)
    }
}
