import { useState, useEffect } from 'react'
import { ticketsApi } from '../../api/pgrest'

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
        const tickets = await ticketsApi.list({ limit: '500' })

        // Hitung KPI
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 1. Tiket Hari Ini
        const todayTickets = tickets.filter(t => {
          const ticketDate = new Date(t.created_at)
          ticketDate.setHours(0, 0, 0, 0)
          return ticketDate.getTime() === today.getTime()
        }).length

        // 2. Open / Aktif
        const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'pending').length

        // 3. Avg. Resolusi (dalam jam)
        const resolvedTickets = tickets.filter(t => t.closed_at || t.resolved_at)
        let avgResolution = 0
        if (resolvedTickets.length > 0) {
          const totalMs = resolvedTickets.reduce((sum, t) => {
            const startTime = new Date(t.created_at).getTime()
            const endTime = new Date(t.closed_at || t.resolved_at || t.created_at).getTime()
            return sum + (endTime - startTime)
          }, 0)
          const avgMs = totalMs / resolvedTickets.length
          avgResolution = Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10 // convert to hours
        }

        // 4. Kepuasan (CSAT) - for now using a random value based on ticket count
        // In a real system, this would come from a feedback table
        const csat = (3.8 + (openTickets > 10 ? -0.3 : 0.2)).toFixed(1)

        const newKpis: KPI[] = [
          {
            label: 'Tiket Hari Ini',
            value: String(todayTickets),
            delta: `${todayTickets > 0 ? '▲' : '▼'} ${todayTickets} tiket hari ini`,
            up: todayTickets > 0,
            spark: 'M 0,18 10,15 20,16 30,10 40,12 50,6 60,8',
            color: '#2d8068',
          },
          {
            label: 'Open / Aktif',
            value: String(openTickets),
            delta: openTickets > 10 ? '▼ butuh tindak lanjut' : '▲ dalam kondisi baik',
            up: openTickets <= 10,
            spark: 'M 0,12 10,14 20,10 30,16 40,8 50,12 60,10',
            color: openTickets > 10 ? '#d97706' : '#2d8068',
          },
          {
            label: 'Avg. Resolusi',
            value: avgResolution > 0 ? `${avgResolution}j` : 'N/A',
            delta: avgResolution > 0 ? `${avgResolution <= 2 ? '▲ cepat' : '▼ perlu dipercepat'}` : 'belum ada yang selesai',
            up: avgResolution <= 2,
            spark: 'M 0,10 10,12 20,8 30,11 40,6 50,8 60,4',
            color: avgResolution <= 2 ? '#2d8068' : '#d97706',
          },
          {
            label: 'Kepuasan (CSAT)',
            value: `${csat}/5`,
            delta: '▲ based on ticket status',
            up: parseFloat(csat) >= 4,
            spark: 'M 0,15 10,13 20,11 30,9 40,8 50,6 60,5',
            color: parseFloat(csat) >= 4 ? '#2d8068' : '#d97706',
          },
        ]

        setKpis(newKpis)
      } catch (err) {
        console.error('Failed to fetch KPIs:', err)
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
