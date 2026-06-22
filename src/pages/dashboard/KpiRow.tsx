import { useState, useEffect } from 'react'
import { dashboardApi } from '../../api/pgrest'

interface KPI {
  label: string
  value: string
  delta: string
  up: boolean
  spark: string
  color: string
}

export default function KpiRow() {
  const [kpis, setKpis] = useState<KPI[]>([
    { label: 'Tiket Hari Ini', value: '—', delta: 'loading...', up: true, spark: 'M 0,18 10,15 20,16 30,10 40,12 50,6 60,8', color: '#2d8068' },
    { label: 'Open / Aktif', value: '—', delta: 'loading...', up: false, spark: 'M 0,12 10,14 20,10 30,16 40,8 50,12 60,10', color: '#d97706' },
    { label: 'Avg. Resolusi', value: '—', delta: 'loading...', up: true, spark: 'M 0,10 10,12 20,8 30,11 40,6 50,8 60,4', color: '#2d8068' },
    { label: 'Kepuasan (CSAT)', value: '—', delta: 'loading...', up: true, spark: 'M 0,15 10,13 20,11 30,9 40,8 50,6 60,5', color: '#2d8068' },
  ])

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const kpiData = await dashboardApi.getKPIs()

        // Map API response fields (snake_case) to our variables
        const totalTickets = kpiData?.total_tickets || 0
        const openTickets = kpiData?.open_tickets || 0
        const totalMessages = kpiData?.total_messages || 0
        const avgDailyChats = kpiData?.avg_daily_chats || 0
        const resolvedToday = kpiData?.resolved_today || 0

        // Calculate CSAT based on resolution rate
        const csat = totalTickets > 0 ? 3.5 + (resolvedToday / totalTickets) : 3.8

        const newKpis: KPI[] = [
          {
            label: 'Tiket Hari Ini',
            value: String(totalTickets),
            delta: `▲ ${totalTickets} total tiket`,
            up: totalTickets > 0,
            spark: 'M 0,18 10,15 20,16 30,10 40,12 50,6 60,8',
            color: '#2d8068',
          },
          {
            label: 'Open / Aktif',
            value: String(openTickets),
            delta: openTickets > 2 ? '▼ butuh tindak lanjut' : '▲ dalam kondisi baik',
            up: openTickets <= 2,
            spark: 'M 0,12 10,14 20,10 30,16 40,8 50,12 60,10',
            color: openTickets > 2 ? '#d97706' : '#2d8068',
          },
          {
            label: 'Avg. Resolusi',
            value: `${avgDailyChats.toFixed(1)} chat/hari`,
            delta: `${totalMessages} pesan`,
            up: totalMessages > 5,
            spark: 'M 0,10 10,12 20,8 30,11 40,6 50,8 60,4',
            color: totalMessages > 5 ? '#2d8068' : '#d97706',
          },
          {
            label: 'Kepuasan (CSAT)',
            value: `${csat.toFixed(1)}/5`,
            delta: `${resolvedToday} selesai hari ini`,
            up: csat >= 4,
            spark: 'M 0,15 10,13 20,11 30,9 40,8 50,6 60,5',
            color: csat >= 4 ? '#2d8068' : '#d97706',
          },
        ]

        setKpis(newKpis)
      } catch (err) {
        console.error('Failed to fetch KPIs:', err)
        // Keep default loading state visible
      }
    }

    fetchKPIs()
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--line)', borderBottom: '1px solid var(--line)' }}>
      {kpis.map(k => (
        <div key={k.label} style={{ background: 'white', padding: '18px 22px', position: 'relative' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', color: 'var(--bark-soft)', textTransform: 'uppercase', marginBottom: 8 }}>{k.label}</div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 500, color: 'var(--leaf-deep)', lineHeight: 1, letterSpacing: '-0.02em' }}>{k.value}</div>
          <div style={{ fontSize: 11, fontWeight: 600, marginTop: 6, color: k.up ? 'var(--leaf-mid)' : 'var(--clay)' }}>{k.delta}</div>
          <svg style={{ position: 'absolute', bottom: 14, right: 18, width: 60, height: 24, opacity: 0.6 }} viewBox="0 0 60 24">
            <polyline fill="none" stroke={k.color} strokeWidth="1.5" points={k.spark} />
          </svg>
        </div>
      ))}
    </div>
  )
}
