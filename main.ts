const ID_EMPTY = 0
const ID_BOMB = 1
const ID_VISITED = 2
const ID_CURRENT = 4
const ID_LED_HIGH = 255
const ID_LED_LOW = 0
const ID_LED_VISITED = 32
const N_COLUMNS = 5
const N_ROWS = 5
const N_BOMBS = 3

input.onButtonPressed(Button.B, function () {
    isIdle = false
    if (map.getCurrentStatus(ID_BOMB)) {
        basic.showString("X")
        basic.pause(1000)
        map.showSolution()
        return
    }
    basic.showNumber(map.countBombs())
    basic.pause(1000)
    map.setCurrentStatus(ID_VISITED)
    if (map.countTrials() == N_COLUMNS * N_ROWS - N_BOMBS) {
        basic.showIcon(IconNames.Yes)
        basic.pause(1000)
        map.showSolution()
        return
    }
    map.paint()
    isIdle = true
})

input.onGesture(Gesture.TiltLeft, function () {
    if (!isIdle) return
    map.move(-1, 0)
})
input.onGesture(Gesture.TiltRight, function () {
    if (!isIdle) return
    map.move(1, 0)
})

input.onGesture(Gesture.LogoDown, function () {
    if (!isIdle) return
    map.move(0, -1)
})

input.onGesture(Gesture.LogoUp, function () {
    if (!isIdle) return
    map.move(0, 1)
})

class Field {
    x: number
    y: number
    status: number
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.status = ID_EMPTY
    }
    show(blink: boolean) {
        let brightness = ID_LED_LOW
        if (this.getStatus(ID_CURRENT)) {
            if (blink) brightness = ID_LED_HIGH
        }
        else {
            if (this.getStatus(ID_VISITED)) {
                brightness = ID_LED_VISITED
            }
        }
        led.plotBrightness(this.x, this.y, brightness)
    }
    showSolution() {
        led.plotBrightness(this.x, this.y, this.getStatus(ID_BOMB) ? 255 : 0)
    }
    getStatus(statusID: number): number {
        return this.status & statusID
    }
    setStatus(statusID: number) {
        this.status |= statusID
    }
    deleteStatus(statusID: number) {
        this.status ^= statusID
    }
}

class Map {
    currentX: number
    currentY: number
    fields: Field[][]
    constructor() {
        this.fields = []
        for (let i = 0; i < N_COLUMNS; i++) {
            this.fields[i] = []
            for (let j = 0; j < N_ROWS; j++) {
                this.fields[i][j] = new Field(i, j)
            }
        }
        this.scatterBombs(N_BOMBS)
        this.fields[this.currentX = 0][this.currentY = 0].setStatus(ID_CURRENT)
    }
    scatterBombs(n: number) {
        for (let i = 0; i < n; i++) {
            let f = Math.randomRange(0, N_COLUMNS * N_ROWS)
            let x = Math.floor(f / N_COLUMNS)
            let y = f - x * N_COLUMNS
            this.fields[x][y].setStatus(ID_BOMB)
        }
    }
    getCurrentStatus(statusID: number): number {
        return this.fields[this.currentX][this.currentY].getStatus(statusID)
    }
    setCurrentStatus(statusID: number) {
        this.fields[this.currentX][this.currentY].setStatus(statusID)
    }
    delettCurrentStatus(statusID: number) {
        this.fields[this.currentX][this.currentY].deleteStatus(statusID)
    }
    countBombs(): number {
        let n = 0
        for (let i = this.currentX - 1; i < this.currentX + 2; i++) {
            if ((i < 0) || (i > N_COLUMNS - 1)) continue
            for (let j = this.currentY - 1; j < this.currentY + 2; j++) {
                if ((i == this.currentX) && (j == this.currentY)) continue
                if ((j < 0) || (j > N_ROWS - 1)) continue
                n += this.fields[i][j].getStatus(ID_BOMB)
            }
        }
        return n
    }
    countTrials() {
        let n = 0
        for (let i = 0; i < N_COLUMNS; i++) {
            for (let j = 0; j < N_ROWS; j++) {
                if (this.fields[i][j].getStatus(ID_VISITED)) n++
            }
        }
        return n
    }
    move(dx: number, dy: number) {
        this.step(this.currentX + dx, this.currentY + dy)
    }
    step(x: number, y: number) {
        if ((x < 0) || (x > N_COLUMNS - 1)) return
        if ((y < 0) || (y > N_ROWS - 1)) return
        this.fields[this.currentX][this.currentY].deleteStatus(ID_CURRENT)
        this.fields[this.currentX = x][this.currentY = y].setStatus(ID_CURRENT)
        this.paint()
    }
    paint() {
        let blink = (counter % 2) == 0
        for (let i = 0; i < N_COLUMNS; i++) {
            for (let j = 0; j < N_ROWS; j++) {
                this.fields[i][j].show(blink)
            }
        }
    }
    showSolution() {
        let blink = (counter % 2) == 0
        for (let i = 0; i < N_COLUMNS; i++) {
            for (let j = 0; j < N_ROWS; j++) {
                this.fields[i][j].showSolution()
            }
        }
    }
}

let counter = 0
let map = new Map()
let isIdle = true

basic.forever(function () {
    basic.pause(500)
    if (isIdle) {
        counter++
        map.paint()
    }
})