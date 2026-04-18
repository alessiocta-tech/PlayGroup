'use client'

import { useEffect, useRef } from 'react'

// Programming characters pool
const CHARS = '01アイウエオカキクケコ{}[]()<>/\\|;:.,!?@#$%&*+=~^`"\' ABCDEFabcdef0123456789'
const KEYWORDS = ['const', 'let', 'var', 'fn', '=>', 'if', 'for', 'return', 'class', 'async', 'await', 'null', 'true', 'false', '===', '!==', '+=', '-=', '&&', '||']

const GOLD   = [240, 192,  64]   // #F0C040
const BRIGHT = [255, 240, 140]   // bright flash
const DIM    = [160, 120,  20]   // trail

const COL_W  = 16   // px per column
const SPEED_MIN = 0.4
const SPEED_MAX = 1.4

interface Drop {
  y:       number   // current y position (in rows)
  speed:   number   // rows per frame
  len:     number   // trail length
  chars:   string[] // current chars in this column
  bright:  number   // head brightness (0..1, decays)
  keyword: string | null
  kwTimer: number
}

function rchar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

function rkeyword() {
  return KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)]
}

export default function AsciiHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    let cols  = 0
    let rows  = 0
    let drops: Drop[] = []

    function initDrop(col: number): Drop {
      const len = 8 + Math.floor(Math.random() * 20)
      return {
        y:       -Math.random() * rows,
        speed:   SPEED_MIN + Math.random() * (SPEED_MAX - SPEED_MIN),
        len,
        chars:   Array.from({ length: len }, rchar),
        bright:  0,
        keyword: null,
        kwTimer: 0,
      }
    }

    function resize() {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      cols  = Math.ceil(canvas.width  / COL_W)
      rows  = Math.ceil(canvas.height / COL_W)
      drops = Array.from({ length: cols }, (_, i) => initDrop(i))
    }

    let frame = 0
    function draw() {
      // Fade previous frame
      ctx.fillStyle = 'rgba(13,13,13,0.18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${COL_W - 2}px monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'

      for (let c = 0; c < drops.length; c++) {
        const d = drops[c]
        const x = c * COL_W + COL_W / 2

        // Occasionally inject a keyword
        if (d.kwTimer <= 0 && Math.random() < 0.003) {
          d.keyword = rkeyword()
          d.kwTimer = d.keyword.length
        }

        // Draw trail (head → tail)
        for (let t = 0; t < d.len; t++) {
          const row = Math.floor(d.y) - t
          if (row < 0 || row >= rows) continue

          const py = row * COL_W

          // Mutate chars randomly
          if (Math.random() < 0.06) d.chars[t] = rchar()

          let ch = d.chars[t]
          let r: number, g: number, b: number, a: number

          if (t === 0) {
            // Head — bright flash
            ;[r, g, b] = BRIGHT
            a = 0.95
          } else {
            // Trail — fade toward dim
            const ratio = t / d.len
            r = Math.round(BRIGHT[0] * (1 - ratio) + DIM[0] * ratio)
            g = Math.round(BRIGHT[1] * (1 - ratio) + DIM[1] * ratio)
            b = Math.round(BRIGHT[2] * (1 - ratio) + DIM[2] * ratio)
            a = Math.max(0, (1 - ratio) * 0.85)
          }

          // Keyword overlay near head
          if (d.keyword && t < d.kwTimer && t < d.keyword.length) {
            ch = d.keyword[t]
            r = GOLD[0]; g = GOLD[1]; b = GOLD[2]
            a = Math.min(a + 0.2, 1)
          }

          ctx.fillStyle = `rgba(${r},${g},${b},${a.toFixed(2)})`
          ctx.fillText(ch, x, py)
        }

        // Advance drop
        d.y += d.speed
        if (d.kwTimer > 0) d.kwTimer -= d.speed

        // Reset when off screen
        if (d.y - d.len > rows) {
          drops[c] = initDrop(c)
          drops[c].y = -Math.random() * rows * 0.5 // stagger re-entry
        }
      }

      frame++
      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    return () => {
      window.removeEventListener('resize', resize)
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
