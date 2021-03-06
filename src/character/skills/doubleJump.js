import {ORDER_CODES} from '../../scenes/boot'
import Skill from './skill'

export default class DoubleJump extends Skill {
  constructor (params) {
    super(params)
    this.maxCharges = 1
    this.charges = 1
  }

  activate () {
    this.character.attrs.setProperty('high', Infinity)
    this.charges--
    console.log('DoubleJump!!!')
  }

  trigger (order, cells) {
    let center = this.character.actionRange
    let e = cells[center + 1][center]
    e = e && e.rigid
    if (e) {
      this.charges = this.maxCharges
      return false
    }
    if (this.charges === 0) return false

    let jumpOrder = order.code === ORDER_CODES.JUMP ||
                    order.code === ORDER_CODES.JUMP_RIGHT ||
                    order.code === ORDER_CODES.JUMP_LEFT
    
    return this.character.attrs.getProperty('high') <= 0 && jumpOrder
  }
}