import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'

const ModelViewer = ({ onClose, src = '/model.stl' }) => {
  const mount = useRef(null)

  useEffect(() => {
    const width = mount.current.clientWidth
    const height = mount.current.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    mount.current.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xeeeeee)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 0, 100)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1))

    const loader = new STLLoader()
    let mesh
    loader.load(src, geometry => {
      const material = new THREE.MeshStandardMaterial({ color: 0xbababa, metalness: 0.3, roughness: 0.6 })
      mesh = new THREE.Mesh(geometry, material)
      mesh.rotation.x = -Math.PI / 2
      scene.add(mesh)
    })

    const handleResize = () => {
      const w = mount.current.clientWidth
      const h = mount.current.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', handleResize)

    let frame
    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      if (mesh) mesh.geometry.dispose()
      mount.current.removeChild(renderer.domElement)
    }
  }, [src])

  return (
    <div className="anatomy-modal">
      <div className="anatomy-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="anatomy-canvas" ref={mount}></div>
      </div>
    </div>
  )
}

export default ModelViewer
