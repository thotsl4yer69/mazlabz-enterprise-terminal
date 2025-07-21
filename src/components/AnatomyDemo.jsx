import React, { useEffect, useRef } from 'react'

const WIDTH = 80
const HEIGHT = 40
const ASPECT = WIDTH / HEIGHT
const CHARS = Array.from(' .:-=+*#%@')
const DEPTH = 20
const K = 15

const rotationMatrix = (axis, theta) => {
  const [x, y, z] = axis
  const n = Math.hypot(x, y, z)
  const [u, v, w] = [x / n, y / n, z / n]
  const cos = Math.cos(theta / 2)
  const sin = Math.sin(theta / 2)
  const b = -u * sin
  const c = -v * sin
  const d = -w * sin
  const aa = cos * cos
  const bb = b * b
  const cc = c * c
  const dd = d * d
  const bc = b * c
  const ad = cos * d
  const ac = cos * c
  const ab = cos * b
  const bd = b * d
  const cd = c * d
  return [
    [aa + bb - cc - dd, 2 * (bc + ad), 2 * (bd - ac)],
    [2 * (bc - ad), aa + cc - bb - dd, 2 * (cd + ab)],
    [2 * (bd + ac), 2 * (cd - ab), aa + dd - bb - cc]
  ]
}

const makeAnatomicalModel = (segments = 40, rings = 20) => {
  const length = 6
  const radius = 1
  const verts = []
  for (let i = 0; i < segments; i++) {
    const z = (length / (segments - 1)) * i
    const taper = 0.8 + 0.2 * Math.cos((z / length) * Math.PI)
    const r = radius * taper
    const curve = 0.2 * Math.sin((z / length) * Math.PI)
    for (let j = 0; j < rings; j++) {
      const t = (2 * Math.PI * j) / rings
      verts.push([
        r * Math.cos(t),
        r * Math.sin(t) + curve,
        z - length / 2
      ])
    }
  }
  return verts
}

const project = pts => {
  const x = []
  const y = []
  const zvals = []
  for (const p of pts) {
    const z = p[2] + DEPTH
    const f = K / z
    x.push(Math.floor(p[0] * f * ASPECT + WIDTH / 2))
    y.push(Math.floor(p[1] * f + HEIGHT / 2))
    zvals.push(z)
  }
  return [x, y, zvals]
}

const renderFrame = (vertices, angle) => {
  const R = rotationMatrix([0, 1, 0], angle)
  const rotated = vertices.map(v => [
    R[0][0] * v[0] + R[0][1] * v[1] + R[0][2] * v[2],
    R[1][0] * v[0] + R[1][1] * v[1] + R[1][2] * v[2],
    R[2][0] * v[0] + R[2][1] * v[1] + R[2][2] * v[2]
  ])
  const [xs, ys, zs] = project(rotated)
  const buf = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(' '))
  const zbuf = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(Infinity))
  for (let i = 0; i < xs.length; i++) {
    const xi = xs[i]
    const yi = ys[i]
    const zi = zs[i]
    if (xi < 0 || xi >= WIDTH || yi < 0 || yi >= HEIGHT) continue
    if (zi < zbuf[yi][xi]) {
      zbuf[yi][xi] = zi
      const shade = Math.max(0, Math.min(0.999, 1 - (zi - DEPTH) / 6))
      const idx = Math.floor(shade * (CHARS.length - 1))
      buf[yi][xi] = CHARS[idx]
    }
  }
  return buf.map(row => row.join('')).join('\n')
}

const AnatomyDemo = ({ onClose }) => {
  const ref = useRef(null)

  useEffect(() => {
    const verts = makeAnatomicalModel()
    let angle = 0
    const id = setInterval(() => {
      if (ref.current) ref.current.textContent = renderFrame(verts, angle)
      angle += 0.1
    }, 33)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="anatomy-modal">
      <div className="anatomy-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <pre className="ascii-display" ref={ref}></pre>
      </div>
    </div>
  )
}

export default AnatomyDemo
