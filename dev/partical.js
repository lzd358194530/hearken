import Hearken from '../src'
import { get } from '../test/xhr'

export default function Partical (props) {
  props.play = play
  props.stop = stop
  props.start = start
  props.pause = pause
  props.getMusic = getMusic
  props.change = change

  return (
    `<div>
      <input value="永夜" id="musicName"/>
      <button @click="play">播放</button>
      <button @click="pause">暂停</button>
      <button @click="start">开始</button>
      <button @click="stop">停止</button>
      <button @click="getMusic">getMusic</button>
      <audio controls="true"></audio>
      <input type=range value='0' id="one" />
      <input type=range value='50' id="two" @change=change />
    </div>`
  )
}

function change (e) {
  const val = e.target.value - 50
  window.aa.panner.setChannel(val / 10)
}

function play () {
  window.h.play()
}

function stop () {
  window.aa.stop()
}

function start () {
  window.aa.start()
}

function pause () {
  window.h.pause()
}

let h
let time
let i = 0
let val = 1
let instance

window.h = h = new Hearken({
  loop: true,
  filter: 'default',
  hertz: 'default',
  mime: 'audio/mpeg',
  volume: 0.5,
})

function toogle (h) {
  val = -val
  h.panner.setChannel(val)
  setTimeout(() => toogle(h), 5000)
}

function progress (instance) {
  if (time) return
  time = setInterval(() => {
    const node = document.getElementById('one')
    const p = instance.getCurrentTime(true) / instance.getDuration(true) * instance.options.rate
    node.value = p * 100
  }, 500)
}

function getEffect (name) {
  get('http://localhost:3000/getMusic?name=convoler/' + name, buffer => {
    const instance = window.aa
    if (instance) {
      const style = name.split('.')[0]
      instance.convolver.appendBuffer(style, buffer).then(() => {
        instance.convolver.setStyle(style)
        console.log(style)
      })
    }
  })
}
window.eff = getEffect

function getMusic () {
  let name = '毒苹果'
  if (i % 2 === 0) name = 'airplanes'

  get('http://localhost:3000/getMusic?name=' + name, buffer => {
    instance
      ? instance.replaceBuffer(buffer)
      : instance = h.create(buffer)

    window.aa = instance
    // instance.setRate(1.5)
    // instance.setDelay(3)
    getEffect('irHall.ogg')
    instance.on('start', () => {
      instance.resumeState()
      // toogle(instance)
    })
    
    h.ready().then(() => {
      instance.start(10)
      progress(instance)
    })
  })
  i++
}