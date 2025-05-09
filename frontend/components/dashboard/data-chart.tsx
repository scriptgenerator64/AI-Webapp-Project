"use client"

import { useEffect, useRef } from "react"

export default function DataChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Mock chart rendering
    const width = canvasRef.current.width
    const height = canvasRef.current.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0"
    ctx.moveTo(40, 10)
    ctx.lineTo(40, height - 30)
    ctx.lineTo(width - 10, height - 30)
    ctx.stroke()

    // Draw mock data points
    const dataPoints = [
      { x: 60, y: 100 },
      { x: 100, y: 80 },
      { x: 140, y: 120 },
      { x: 180, y: 70 },
      { x: 220, y: 90 },
      { x: 260, y: 60 },
      { x: 300, y: 110 },
      { x: 340, y: 50 },
      { x: 380, y: 85 },
      { x: 420, y: 40 },
      { x: 460, y: 95 },
      { x: 500, y: 30 },
    ]

    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = "#3b82f6"
    ctx.lineWidth = 2
    dataPoints.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, height - 30 - point.y)
      } else {
        ctx.lineTo(point.x, height - 30 - point.y)
      }
    })
    ctx.stroke()

    // Draw points
    dataPoints.forEach((point) => {
      ctx.beginPath()
      ctx.fillStyle = "#3b82f6"
      ctx.arc(point.x, height - 30 - point.y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = "#64748b"
    ctx.font = "10px sans-serif"

    // X-axis labels
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    months.forEach((month, index) => {
      const x = 60 + index * 40
      ctx.fillText(month, x - 10, height - 10)
    })

    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const y = height - 30 - i * 30
      ctx.fillText(`${i * 20}`, 20, y + 5)
    }

    /* 
      TODO: Replace this canvas implementation with a proper chart library
      Recommended libraries:
      - Chart.js
      - Recharts
      - D3.js
      
      Implementation steps:
      1. Install your preferred chart library
      2. Create chart components for different visualization types
      3. Connect to real data sources
      4. Add interactivity (tooltips, zooming, etc.)
      5. Implement responsive behavior
    */
  }, [])

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <canvas ref={canvasRef} width={550} height={300} className="w-full h-full" />
    </div>
  )
}
