import dungeons from './dungeons/index'

export default class Map {
  constructor (params) {
    this.scene = params.scene
    this.scale = params.scale
    this.width = params.width
    let TS = this.scale * this.width //tileSize
    this.rows = 0
    this.cols = 0

    this.grid = this.scene.add.graphics(0,0)
    this.grid.lineStyle(1, 0x220022, 0.01)
    this.grid.fillStyle(0x220022, 0.01)
    for (var j = 0; j < 50; j++) {
      for (var i = 0; i < 50; i++) {
        //this.grid.fillRect(i*SCALE*WIDTH + 1 - SCALE*WIDTH/2, j*SCALE*WIDTH + 1 - SCALE*WIDTH/2, SCALE*WIDTH - 2, SCALE*WIDTH - 2)
        this.grid.strokeRect(i*TS, j*TS, TS, TS)
      }
    }

  }

  getDungeon () {
    let options = dungeons.level1
    return options[~~(Math.random()*options.length)]
  }

  loadMap () {
    let level = this.getDungeon()
    this.availableSpots = JSON.parse(JSON.stringify(level.spots))
    this.tiles = level.tiles.split('\n').map(row => row.split(',').map(tile => parseInt(tile)))

    this.xOffset = this.tiles[0].length
    this.yOffset = this.tiles.length
    if (this.xOffset < 20) {
      this.xOffset = (20 - this.xOffset)*16 + 16
    } else {
      this.xOffset = 16
    }

    if (this.yOffset < 12) {
      this.yOffset = (12 - this.yOffset)*16 + 16
    } else {
      this.yOffset = 16
    }
    

    for (var j = 0; j < this.tiles.length; j++) {
      let row = this.tiles[j]
      for (var i = 0; i < row.length; i++) {
        row[i] = new Tile({
          scene: this.scene,
          tile: row[i],
          i: i,
          j: j,
          xOffset: this.xOffset,
          yOffset: this.yOffset,
          width: this.width,
          scale: this.scale
        })
      }
    }
    this.rows = this.tiles.length
    this.cols = this.tiles[0].length
    this.regenerateSpots()
  }

  getMapSurrondings (indexI, indexJ, range) {
    let map = []
    let row = -1
    for (var j = indexJ - range; j <= indexJ + range; j++) {
      map.push((new Array(range * 2 + 1)).fill(undefined))
      let col = -1
      row++
      if(j < 0 || j >= this.rows) continue
      for (var i = indexI - range; i <= indexI + range; i++) {
        col++
        if(i < 0 || i >= this.cols) continue
        map[row][col] = this.tiles[j][i].properties
      }
    }
    return map
  }

  getElementInMap (i, j) {
    return this.tiles[j][i].getElement()
  }

  setElement (i, j, element) {
    this.tiles[j][i].setElement(element)
  }

  removeElement (i, j, element) {
    this.tiles[j][i].removeElement(element)
  }

  addElement (i, j, element) {
    this.tiles[j][i].addElement(element)
  }

  updateCharacterLocation (character) {
    if (!character.changedPosition()) return
    let current = character.position
    let future = character.futurePosition
    this.removeElement(current.i, current.j, character)
    this.addElement(future.i, future.j, character)
  }

  getNextAvailableSpot () {
    let index = ~~(Math.random()*this.availableSpots.length)
    let value = this.availableSpots[index]
    this.availableSpots.splice(index, 1)
    return {i:value[0], j:value[1]}
  }

  emptyElements () {
    for (var j = 0; j < this.rows; j++) {
      for (var i = 0; i < this.cols; i++) {
        this.tiles[j][i].elements = []
        this.tiles[j][i].destroy()
      }
    }
  }

  regenerateSpots () {
  }
}

class Tile {
  constructor (params) {
    this.tile = params.tile
    this.i = params.i
    this.j = params.j
    this.xOffset = params.xOffset
    this.yOffset = params.yOffset
    this.scale = params.scale
    this.width = params.width
    let TS = this.scale * this.width
    this.x = this.xOffset + this.i * TS
    this.y = this.yOffset + this.j * TS

    let invert = (this.tile < 0)?-1:1
    if(this.tile !== 3) {
      this.sprite = params.scene.add.tileSprite(
        this.x,
        this.y,
        this.width,
        this.width,
        'platforms',
        this.tile * invert
      ).setScale(invert * this.scale, this.scale
      ).setDepth(-1)
    }

    this.properties = tileProperties[this.tile]
    this.element = undefined
    this.elements = []
  }

  getElement () {
    let type = this.element?this.element.type:'tile'
    let element =  this.element || this.properties
    return {type, element}
  }

  getElement () {
    if (this.elements.length === 0) {
      return {
        type: 'tile',
        element: this.properties
      }
    }
    let firstElement = this.elements[0]
    return {
      type: firstElement.type,
      element: firstElement
    }
  }

  setElement (element) {
    this.element = element
  }

  addElement (element) {
    let index = this.elements.indexOf(element)
    if (index!=-1) {
      return
    }
    this.elements.push(element)
  }

  removeElement (element) {
    let index = this.elements.indexOf(element)
    if (index === -1) {
      return
    }
    this.elements.splice(index, 1)
  }

  destroy () {
    if(this.sprite) this.sprite.destroy()
  }
  
}


let tileProperties = {
  '0': {
    rigid: true,
    traspasable: false,
  },
  '1': {
    rigid: true,
    traspasable: true
  },
  '2': {
    rigid: true,
    traspasable: false
  },
  '3': {
    rigid: false,
    traspasable: true
  }
}

let basicMap = 
`0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,0,0,3,3,0,0,0,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,0,0,3,3,0,0
0,0,3,3,3,3,0,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,0,0,0,3,3,3,3,0,3,3,3,0,0
0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0
0,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0
0,1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1,0
0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0
0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0
0,0,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,0,0
0,3,3,3,3,3,3,3,3,3,0,0,3,3,3,3,3,3,3,3,3,3,0,0,3,3,3,3,3,3,3,3,3,3,0
0,1,3,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,3,1,0
0,1,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,3,3,3,3,3,3,3,3,3,3,3,3,1,0
0,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0
0,1,3,3,3,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,0,0,3,3,3,1,0
0,1,1,0,0,0,0,0,0,1,1,3,3,3,3,3,0,0,3,3,3,3,3,3,1,1,0,0,0,0,0,0,1,1,0
0,1,3,3,3,0,0,3,3,3,3,3,3,3,3,0,0,0,0,3,3,3,3,3,3,3,3,3,0,0,3,3,3,1,0
0,1,3,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,3,1,0
0,1,3,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,3,1,0
0,1,3,3,3,3,3,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,3,3,3,3,3,1,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0`

let basicMap2 = 
`0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
0,3,3,3,3,3,3,3,3,3,3,3,3,3,0
0,3,3,3,3,3,3,3,3,3,3,3,3,3,0
0,3,3,3,3,3,3,3,3,3,3,3,3,3,0
0,3,3,3,3,3,3,3,3,3,3,3,3,3,0
0,0,0,0,0,1,1,3,1,1,0,0,0,0,0
0,0,0,0,0,0,3,3,3,0,0,0,0,0,0
0,0,0,0,0,0,0,0,0,0,0,0,0,0,0`