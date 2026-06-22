import { useState } from 'react'
import type { Ticket } from '../../types'

type MapStyle = 'markers' | 'heatmap' | 'cluster'

interface MarkerData {
  id?: string; title?: string; meta?: string
  cx: number; cy: number; r: number; fill: string; pulse?: boolean
}

// Map real Indonesia coordinates to SVG viewBox (simple linear approximation)
// Indonesia bounding box: lat [-11, 6], lng [95, 141]
// SVG viewBox: [0, 0, 1000, 460]
function coordToSVG(lat?: number, lng?: number): { cx: number; cy: number } | null {
  if (lat === undefined || lng === undefined) return null
  // Approximate linear mapping
  const cx = Math.round(((lng - 95) / (141 - 95)) * 1000)
  const cy = Math.round(((6 - lat) / (6 - (-11))) * 460)
  // Only return if within reasonable bounds
  if (cx >= 0 && cx <= 1000 && cy >= 0 && cy <= 460) {
    return { cx, cy }
  }
  return null
}

const MARKERS: MarkerData[] = [
  { id: 'KLH-PCM-2026-0428', title: 'Pencemaran Sungai Citarum', meta: 'Karawang · PPKL · In Progress', cx: 445, cy: 355, r: 6, fill: '#d97706', pulse: true },
  { id: 'KLH-KHL-2026-0424', title: 'Titik api Pelalawan', meta: 'Riau · Gakkum · In Progress', cx: 180, cy: 245, r: 6, fill: '#c97050', pulse: true },
  { id: 'KLH-KHL-2026-0419', title: 'Karhutla Palangkaraya', meta: 'Kalteng · Gakkum · Open', cx: 500, cy: 245, r: 6, fill: '#c97050', pulse: true },
  { cx: 430, cy: 350, r: 5, fill: '#d97706' }, { cx: 385, cy: 352, r: 5, fill: '#d97706' },
  { cx: 498, cy: 353, r: 5, fill: '#d97706' }, { cx: 550, cy: 353, r: 5, fill: '#d97706' },
  { cx: 572, cy: 350, r: 5, fill: '#d97706' }, { cx: 375, cy: 348, r: 4, fill: '#059669' },
  { cx: 408, cy: 348, r: 5, fill: '#d97706' }, { cx: 415, cy: 350, r: 4, fill: '#d97706' },
  { cx: 395, cy: 350, r: 4, fill: '#d97706' }, { cx: 478, cy: 352, r: 4, fill: '#d97706' },
  { cx: 155, cy: 260, r: 5, fill: '#d97706' }, { cx: 140, cy: 240, r: 4, fill: '#d97706' },
  { cx: 200, cy: 290, r: 4, fill: '#d97706' }, { cx: 220, cy: 310, r: 5, fill: '#d97706' },
  { cx: 170, cy: 270, r: 5, fill: '#c97050' }, { cx: 135, cy: 285, r: 4, fill: '#c97050' },
  { cx: 160, cy: 225, r: 5, fill: '#c97050' }, { cx: 475, cy: 195, r: 4, fill: '#c97050' },
  { cx: 510, cy: 210, r: 4, fill: '#c97050' }, { cx: 540, cy: 225, r: 5, fill: '#c97050' },
  { cx: 568, cy: 245, r: 4, fill: '#c97050' },
  { id: 'KLH-KSV-2026-0422', title: 'Perdagangan satwa dilindungi', meta: 'Anonim · KSDAE · Resolved', cx: 687, cy: 195, r: 4, fill: '#059669' },
  { cx: 700, cy: 220, r: 4, fill: '#2d8068' }, { cx: 676, cy: 180, r: 5, fill: '#2d8068' },
  { cx: 908, cy: 225, r: 5, fill: '#2d8068' }, { cx: 930, cy: 250, r: 4, fill: '#2d8068' },
  { cx: 660, cy: 358, r: 3, fill: '#2d8068' },
  { id: 'KLH-CRB-2026-0427', title: 'Carbon credit gambut', meta: 'Riau · PPI · Open', cx: 178, cy: 252, r: 5, fill: '#7c3aed' },
  { cx: 455, cy: 218, r: 4, fill: '#7c3aed' }, { cx: 510, cy: 230, r: 4, fill: '#7c3aed' },
  { cx: 430, cy: 345, r: 4, fill: '#0891b2' }, { cx: 525, cy: 350, r: 4, fill: '#0891b2' },
  { cx: 590, cy: 352, r: 3, fill: '#0891b2' }, { cx: 710, cy: 298, r: 4, fill: '#e8b341' },
  { cx: 880, cy: 240, r: 4, fill: '#e8b341' }, { cx: 785, cy: 355, r: 3, fill: '#e8b341' },
]

const CLUSTERS = [
  { cx: 450, cy: 355, r: 34, count: 487, label: 'JAWA' },
  { cx: 160, cy: 260, r: 28, count: 312, label: 'SUMATRA' },
  { cx: 495, cy: 225, r: 25, count: 241, label: 'KALIMANTAN' },
  { cx: 695, cy: 240, r: 20, count: 156, label: 'SULAWESI' },
  { cx: 745, cy: 358, r: 16, count: 98, label: 'NUSRA' },
  { cx: 908, cy: 240, r: 14, count: 67, label: 'PAPUA' },
]

export default function IndonesiaMap({ mapStyle, onStyleChange, tickets }: { mapStyle: MapStyle; onStyleChange: (s: MapStyle) => void; tickets: Ticket[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; id?: string; title?: string; meta?: string } | null>(null)

  // Generate markers from real tickets
  const dynamicMarkers = tickets
    .filter((t): t is Ticket & { location_lat: number; location_lng: number } =>
      t.location_lat !== undefined && t.location_lat !== null && t.location_lng !== undefined && t.location_lng !== null
    )
    .map(t => {
      const coords = coordToSVG(t.location_lat, t.location_lng)
      if (!coords) return null
      const statusColor: Record<string, string> = {
        pending: '#d97706',
        in_progress: '#0891b2',
        resolved: '#059669',
        closed: '#6b7280',
      }
      const pulse = t.status === 'pending' || t.status === 'in_progress'
      return {
        id: String(t.id),
        title: t.title || `Tiket ${t.ticket_number}`,
        meta: `${t.location_name || 'Unknown'} · ${t.status}`,
        cx: coords.cx,
        cy: coords.cy,
        r: 6,
        fill: statusColor[t.status] || '#d97706',
        pulse,
      } as MarkerData
    })
    .filter((m): m is MarkerData => m !== null)
    .slice(0, 50) // Limit to 50 markers for performance

  // Combine with static markers for visual balance
  const displayMarkers = dynamicMarkers.length > 0 ? dynamicMarkers : MARKERS

  return (
    <div style={{ position: 'relative', background: 'linear-gradient(180deg, #d4e4f0 0%, #c8dfd8 100%)', overflow: 'hidden' }}>
      {/* Search bar */}
      <div style={{ position: 'absolute', top: 16, left: 16, background: 'white', border: '1px solid var(--ink)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--bark-soft)', minWidth: 260, zIndex: 10 }}>
        🔍 <span>Cari lokasi, provinsi, kabupaten…</span>
      </div>

      {/* Map controls */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 10 }}>
        <div style={{ background: 'white', border: '1px solid var(--ink)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {['+', '−'].map(btn => (
            <button key={btn} style={{ width: 36, height: 36, background: 'white', border: 'none', borderBottom: btn === '+' ? '1px solid var(--line-soft)' : 'none', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{btn}</button>
          ))}
        </div>
        <div style={{ background: 'white', border: '1px solid var(--ink)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {['⌂', '▦'].map(btn => (
            <button key={btn} style={{ width: 36, height: 36, background: 'white', border: 'none', borderBottom: btn === '⌂' ? '1px solid var(--line-soft)' : 'none', cursor: 'pointer', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{btn}</button>
          ))}
        </div>
      </div>

      {/* Style toggle */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', background: 'white', border: '1px solid var(--ink)', zIndex: 10 }}>
        {(['markers', 'heatmap', 'cluster'] as const).map(s => (
          <button key={s} onClick={() => onStyleChange(s)} style={{ background: mapStyle === s ? 'var(--leaf-deep)' : 'transparent', color: mapStyle === s ? 'white' : 'var(--bark-soft)', border: 'none', padding: '7px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600, borderRight: s !== 'cluster' ? '1px solid var(--line-soft)' : 'none' }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{ position: 'absolute', top: tooltip.y - 80, left: tooltip.x - 20, background: 'var(--ink)', color: 'var(--paper)', padding: '10px 14px', borderRadius: 4, fontSize: 12, pointerEvents: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.3)', zIndex: 20, maxWidth: 240 }}>
          {tooltip.id && <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--sun)', marginBottom: 4 }}>{tooltip.id}</div>}
          {tooltip.title && <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 13.5, marginBottom: 4 }}>{tooltip.title}</div>}
          {tooltip.meta && <div style={{ fontSize: 11, opacity: 0.8 }}>{tooltip.meta}</div>}
        </div>
      )}

      <svg width="100%" height="100%" viewBox="0 0 1000 460" preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setTooltip(null)}>
        <defs>
          <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4e4f0"/><stop offset="100%" stopColor="#b8d4e0"/>
          </linearGradient>
          <pattern id="dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.7" fill="#a8c4d0" opacity="0.4"/>
          </pattern>
          <filter id="softShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
            <feOffset dx="0" dy="1"/>
            <feComponentTransfer><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
            <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <radialGradient id="heatRed" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.7"/><stop offset="100%" stopColor="#dc2626" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="heatOrange" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0.6"/><stop offset="100%" stopColor="#ea580c" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="heatYellow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0.5"/><stop offset="100%" stopColor="#facc15" stopOpacity="0"/>
          </radialGradient>
        </defs>

        <rect width="1000" height="460" fill="url(#ocean)"/>
        <rect width="1000" height="460" fill="url(#dots)"/>

        {/* Indonesia landmass */}
        <g fill="#e8e3d4" stroke="#a89a7c" strokeWidth="0.8" filter="url(#softShadow)">
          <path d="M 50,180 Q 60,160 80,155 L 110,150 Q 140,145 165,155 L 200,170 Q 225,185 240,210 L 255,240 Q 265,265 260,290 L 250,320 Q 235,340 215,345 L 185,340 Q 160,330 145,310 L 125,285 Q 105,260 90,235 L 70,210 Q 55,195 50,180 Z"/>
          <path d="M 280,340 Q 310,332 350,335 L 410,338 Q 460,340 510,338 L 560,335 Q 600,332 620,340 Q 625,348 615,355 L 575,360 Q 540,365 500,362 L 450,360 Q 400,358 350,360 L 305,358 Q 285,352 280,345 Z"/>
          <path d="M 638,350 Q 648,346 658,350 L 668,353 Q 672,358 665,361 L 650,360 Q 640,357 638,350 Z"/>
          <path d="M 680,348 Q 695,344 715,348 L 735,352 Q 745,358 735,362 L 710,360 Q 690,357 680,352 Z"/>
          <path d="M 755,346 Q 775,342 795,346 L 815,350 Q 822,355 815,360 L 790,358 Q 770,355 755,350 Z"/>
          <path d="M 380,160 Q 400,140 430,135 L 470,132 Q 510,130 545,140 L 580,155 Q 605,175 615,205 L 620,240 Q 615,275 595,295 L 565,310 Q 530,318 495,315 L 455,310 Q 420,300 400,275 L 380,245 Q 365,215 370,185 Q 372,170 380,160 Z"/>
          <path d="M 660,160 Q 680,150 695,165 L 705,185 Q 710,205 705,220 L 720,225 Q 740,228 745,245 L 740,265 Q 730,280 718,275 L 705,260 Q 698,250 700,240 L 685,245 Q 670,250 668,265 L 670,285 Q 675,300 668,310 L 655,308 Q 650,295 652,278 L 655,255 Q 660,235 670,225 L 658,215 Q 648,200 652,185 Q 655,170 660,160 Z"/>
          <path d="M 800,200 Q 815,196 825,205 L 830,220 Q 828,232 818,232 Q 805,228 802,215 Z"/>
          <path d="M 815,250 Q 830,245 840,255 L 842,270 Q 838,280 828,278 Q 815,272 815,260 Z"/>
          <path d="M 870,180 Q 895,170 930,175 L 960,185 Q 980,200 985,225 L 980,255 Q 970,280 950,295 L 920,305 Q 890,310 870,300 L 855,285 Q 850,265 855,245 L 860,220 Q 865,200 870,180 Z"/>
        </g>

        <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#6b6657" letterSpacing="1" textAnchor="middle">
          <text x="155" y="245">SUMATRA</text>
          <text x="450" y="372">JAWA</text>
          <text x="495" y="220">KALIMANTAN</text>
          <text x="695" y="245">SULAWESI</text>
          <text x="920" y="240">PAPUA</text>
          <text x="745" y="378" fontSize="8">NUSA TENGGARA</text>
        </g>

        {/* Heatmap */}
        {mapStyle === 'heatmap' && (
          <g style={{ mixBlendMode: 'multiply' }}>
            <circle cx="450" cy="355" r="70" fill="url(#heatRed)"/>
            <circle cx="420" cy="350" r="60" fill="url(#heatRed)"/>
            <circle cx="155" cy="260" r="50" fill="url(#heatOrange)"/>
            <circle cx="180" cy="280" r="55" fill="url(#heatRed)"/>
            <circle cx="490" cy="220" r="55" fill="url(#heatOrange)"/>
            <circle cx="695" cy="240" r="35" fill="url(#heatYellow)"/>
            <circle cx="910" cy="240" r="40" fill="url(#heatYellow)"/>
          </g>
        )}

        {/* Clusters */}
        {mapStyle === 'cluster' && CLUSTERS.map(c => (
          <g key={c.label} transform={`translate(${c.cx},${c.cy})`}>
            <circle r={c.r} fill="#0d3b2e" opacity="0.85"/>
            <text textAnchor="middle" dy="2" fontFamily="Fraunces, serif" fontSize={Math.max(10, c.r * 0.55)} fontWeight="600" fill="white">{c.count}</text>
            <text textAnchor="middle" dy={c.r * 0.5 + 2} fontFamily="JetBrains Mono, monospace" fontSize="7" fill="rgba(255,255,255,0.8)">{c.label}</text>
          </g>
        ))}

        {/* Markers */}
        {mapStyle === 'markers' && displayMarkers.map((m, i) => (
          <g key={i}
            onMouseEnter={(e) => {
              const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect()
              if (rect && (m.id || m.title)) {
                const svgEl = (e.target as SVGElement).closest('svg')!
                const pt = svgEl.createSVGPoint()
                pt.x = e.clientX; pt.y = e.clientY
                const svgP = pt.matrixTransform(svgEl.getScreenCTM()!.inverse())
                setTooltip({ x: svgP.x, y: svgP.y, id: m.id, title: m.title, meta: m.meta })
              }
            }}
            style={{ cursor: m.id ? 'pointer' : 'default' }}
          >
            {m.pulse && (
              <>
                <circle cx={m.cx} cy={m.cy} r="14" fill={m.fill} opacity="0" style={{ animation: 'markerPulse 2s ease-out infinite' }}/>
                <circle cx={m.cx} cy={m.cy} r="10" fill={m.fill} opacity="0.2"/>
              </>
            )}
            <circle cx={m.cx} cy={m.cy} r={m.r} fill={m.fill} stroke="white" strokeWidth="1.5"/>
          </g>
        ))}

        <text x="980" y="455" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.7)" textAnchor="end">⬢ KLH Console · 2026</text>
      </svg>
    </div>
  )
}
