'use client'

import { useEffect, useRef } from 'react'

// Characters from sparse (dark) → dense (bright)
const RAMP = ' ·.:;/|+?*xX$#@'
// Scramble pool — "bits" effect like good-fella.com
const SCRAMBLE = '01アイウエオ@#$%&*+=!?|[]{}ABCDEFabcdef<>/\\'

const MOUSE_RADIUS = 110  // px
const SCRAMBLE_SPEED = 0.06  // decay per frame

function rchar(pool: string) {
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function AsciiHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>()
  const mouseRef  = useRef({ x: -9999, y: -9999 })
  const stateRef  = useRef<{
    cols: number; rows: number; cw: number; rh: number
    src:  number[][]   // brightness 0..1 per cell
    scr:  number[][]   // scramble intensity 0..1 per cell
  } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    // ── helpers ────────────────────────────────────────────────────────────
    function buildSource() {
      const { cols, rows, cw, rh } = stateRef.current!
      const W = canvas.width, H = canvas.height

      const off = document.createElement('canvas')
      off.width = W; off.height = H
      const o = off.getContext('2d')!
      o.fillStyle = '#000'
      o.fillRect(0, 0, W, H)
      o.fillStyle = '#fff'
      o.textAlign = 'center'
      o.textBaseline = 'middle'

      // Render large "PLAY" + "GROUP" → source image
      const bigSize = Math.floor(H * 0.28)
      o.font = `900 ${bigSize}px 'DM Sans', sans-serif`
      o.fillText('PLAY', W / 2, H * 0.35)
      o.font = `900 ${Math.floor(bigSize * 0.88)}px 'DM Sans', sans-serif`
      o.fillText('GROUP', W / 2, H * 0.67)

      const img = o.getImageData(0, 0, W, H)
      const src: number[][] = []
      for (let r = 0; r < rows; r++) {
        src[r] = []
        for (let c = 0; c < cols; c++) {
          const px = Math.floor(c * cw + cw * 0.5)
          const py = Math.floor(r * rh + rh * 0.5)
          const i = (py * W + px) * 4
          src[r][c] = img.data[i] / 255
        }
      }
      stateRef.current!.src = src
      stateRef.current!.scr = src.map(row => row.map(() => 0))
    }

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      ctx.font = `${14}px monospace`
      const cw = ctx.measureText('M').width
      const rh = 14 * 1.25
      stateRef.current = {
        cols: Math.ceil(canvas.width  / cw),
        rows: Math.ceil(canvas.height / rh),
        cw, rh, src: [], scr: [],
      }
      // Wait for fonts before sampling
      document.fonts.ready.then(buildSource)
    }

    // ── events ─────────────────────────────────────────────────────────────
    function onMove(e: MouseEvent | TouchEvent) {
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY
      mouseRef.current = { x, y }

      const s = stateRef.current
      if (!s || !s.scr.length) return
      const { cols, rows, cw, rh, scr } = s
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dist = Math.hypot(c * cw + cw / 2 - x, r * rh + rh / 2 - y)
          if (dist < MOUSE_RADIUS) {
            scr[r][c] = Math.max(scr[r][c], 1 - dist / MOUSE_RADIUS)
          }
        }
      }
    }

    // ── render loop ────────────────────────────────────────────────────────
    let frame = 0
    function draw() {
      const s = stateRef.current
      if (!s || !s.src.length) { rafRef.current = requestAnimationFrame(draw); return }

      const { cols, rows, cw, rh, src, scr } = s
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${14}px monospace`
      ctx.textBaseline = 'top'

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const brightness = src[r]?.[c] ?? 0
          const scramble   = scr[r]?.[c] ?? 0

          let ch: string
          let alpha: number
          let color: string

          if (scramble > 0.04) {
            // ── scrambling: yellow bits ─────────────────────────────────
            ch    = rchar(SCRAMBLE)
            alpha = 0.25 + scramble * 0.75
            color = `rgba(240,192,64,${alpha.toFixed(2)})`
            scr[r][c] = Math.max(0, scramble - SCRAMBLE_SPEED)
          } else if (brightness > 0.55) {
            // ── bright area (inside letters): white ─────────────────────
            const idx = Math.min(RAMP.length - 1, Math.floor(brightness * RAMP.length))
            ch    = RAMP[idx]
            alpha = 0.3 + brightness * 0.65
            color = `rgba(255,255,255,${alpha.toFixed(2)})`
          } else if (brightness > 0.08) {
            // ── edge/mid: dimmer ────────────────────────────────────────
            const idx = Math.floor(brightness * RAMP.length * 0.7)
            ch    = RAMP[Math.max(0, idx)]
            alpha = brightness * 0.45
            color = `rgba(180,180,180,${alpha.toFixed(2)})`
          } else {
            // ── background: sparse, very dim, occasional flicker ────────
            if (frame % 4 === (c % 4) && Math.random() > 0.985) {
              ch    = rchar('·.01')
              color = 'rgba(100,100,100,0.12)'
            } else {
              ch    = Math.random() > 0.93 ? rchar('·. ') : ' '
              color = 'rgba(80,80,80,0.07)'
            }
          }

          if (!ch || ch === ' ') continue
          ctx.fillStyle = color
          ctx.fillText(ch, c * cw, r * rh)
        }
      }

      frame++
      rafRef.current = requestAnimationFrame(draw)
    }

    // ── init ────────────────────────────────────────────────────────────────
    resize()
    draw()

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  )
}
