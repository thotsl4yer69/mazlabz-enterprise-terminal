import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const createModel = () => {
  const group = new THREE.Group()
  const skin = new THREE.MeshStandardMaterial({ color: 0xc5a894, roughness: 0.8, metalness: 0.1 })
  const glansMat = skin.clone();
  glansMat.color.set(0xdc9a88)

  const shaftPts = [
    { x: 1.0, y: 0 },
    { x: 1.1, y: -1 },
    { x: 1.05, y: -5 },
    { x: 0.95, y: -6 }
  ]
  const shaft = new THREE.LatheGeometry(shaftPts.map(p => new THREE.Vector2(p.x, p.y)), 64)
  group.add(new THREE.Mesh(shaft, skin))

  const glansPts = [
    { x: 0.01, y: -5.9 },
    { x: 0.9, y: -6.0 },
    { x: 1.1, y: -6.7 },
    { x: 0.9, y: -7.5 },
    { x: 0.4, y: -7.7 },
    { x: 0.01, y: -7.6 }
  ]
  const glans = new THREE.LatheGeometry(glansPts.map(p => new THREE.Vector2(p.x, p.y)), 64)
  group.add(new THREE.Mesh(glans, glansMat))

  const foreskinPts = [
    { x: 0.95, y: -5.5 },
    { x: 1.1, y: -6.0 },
    { x: 1.2, y: -7.0 },
    { x: 1.0, y: -8.2 },
    { x: 0.5, y: -8.5 },
    { x: 0.2, y: -8.3 }
  ]
  const foreskin = new THREE.LatheGeometry(foreskinPts.map(p => new THREE.Vector2(p.x, p.y)), 64)
  group.add(new THREE.Mesh(foreskin, skin))

  const scrotum = new THREE.SphereGeometry(2.2, 64, 64)
  const scrot = new THREE.Mesh(scrotum, skin)
  scrot.position.y = -1.8
  group.add(scrot)

  return group
}

const AnatomyDemo = ({ onClose }) => {
  const mount = useRef(null)

  useEffect(() => {
    const width = mount.current.clientWidth
    const height = mount.current.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    mount.current.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x222228)
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100)
    camera.position.set(0, 0, 25)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.target.set(0, -2, 0)

    scene.add(new THREE.DirectionalLight(0xffffff, 2).position.set(10, 10, 10))
    scene.add(new THREE.DirectionalLight(0xffe0d0, 0.7).position.set(-10, 5, 5))
    scene.add(new THREE.DirectionalLight(0xd0e0ff, 1.5).position.set(0, 5, -15))
    scene.add(new THREE.HemisphereLight(0x404060, 0x202030, 1))

    const model = createModel()
    scene.add(model)

    const onResize = () => {
      const w = mount.current.clientWidth
      const h = mount.current.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    let frame
    const animate = () => {
      controls.update()
      model.rotation.y += 0.001
      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      mount.current.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className="anatomy-modal">
      <div className="anatomy-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="anatomy-canvas" ref={mount}></div>
      </div>
    </div>
  )
}

export default AnatomyDemo
