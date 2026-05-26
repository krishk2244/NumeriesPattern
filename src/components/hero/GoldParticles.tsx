'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  drift: number
}

const PARTICLE_COUNT = 36

export function GoldParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    let width = canvas.offsetWidth
    let height = canvas.offsetHeight

    const sizeCanvas = () => {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    sizeCanvas()

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.7 + Math.random() * 1.6,
      speed: 0.12 + Math.random() * 0.35,
      opacity: 0.18 + Math.random() * 0.42,
      drift: (Math.random() - 0.5) * 0.18,
    }))

    let frameId = 0
    const render = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.shadowColor = 'rgba(0, 99, 65, 0.55)'
      ctx.shadowBlur = 6

      for (const p of particles) {
        p.y -= p.speed
        p.x += p.drift

        if (p.y < -8) {
          p.y = height + 8
          p.x = Math.random() * width
        }
        if (p.x < -8) p.x = width + 8
        else if (p.x > width + 8) p.x = -8

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 99, 65, ${p.opacity})`
        ctx.fill()
      }

      frameId = requestAnimationFrame(render)
    }
    render()

    const handleResize = () => sizeCanvas()
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}
