'use client'
import { useEffect, useState } from 'react'

const COLORS = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']

interface Piece {
  id: number
  x: number
  color: string
  size: number
  delay: number
  duration: number
  shape: 'circle' | 'square' | 'triangle'
}

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    if (!active) { setPieces([]); return }
    const newPieces = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 10 + 6,
      delay: Math.random() * 2,
      duration: Math.random() * 2 + 2,
      shape: (['circle', 'square', 'triangle'] as const)[Math.floor(Math.random() * 3)],
    }))
    setPieces(newPieces)
  }, [active])

  if (!active || pieces.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.shape !== 'triangle' ? piece.color : 'transparent',
            borderRadius: piece.shape === 'circle' ? '50%' : '2px',
            borderLeft: piece.shape === 'triangle' ? `${piece.size / 2}px solid transparent` : undefined,
            borderRight: piece.shape === 'triangle' ? `${piece.size / 2}px solid transparent` : undefined,
            borderBottom: piece.shape === 'triangle' ? `${piece.size}px solid ${piece.color}` : undefined,
            animation: `confetti-fall ${piece.duration}s ${piece.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}
