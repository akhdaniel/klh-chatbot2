import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ministerApi } from '../../api/pgrest'
import type { Agenda } from '../../types/agenda'

const PRIORITY_COLOR: Record<string, { bg: string; text: string; border: string; label: string }> = {
  critical: { bg: '#dc2626', text: 'white', border: '#dc2626', label: 'Kritis' },
  high:     { bg: '#f97316', text: 'white', border: '#f97316', label: 'Tinggi' },
  medium:   { bg: 'var(--sun)', text: 'var(--ink)', border: 'var(--sun)', label: 'Sedang' },
  low:      { bg: 'var(--line)', text: 'var(--bark)', border: 'var(--line)', label: 'Rendah' },
}

const CATEGORY_COLOR: Record<string, { bar: string; label: string }> = {
  kenegaraan:   { bar: '#f59e0b', label: 'Kenegaraan' },
  internasional:{ bar: '#3b82f6', label: 'Internasional' },
  koordinasi:   { bar: '#8b5cf6', label: 'Koordinasi Antar-K/L' },
  publik:       { bar: '#22c55e', label: 'Publik & Peresmian' },
  protokoler:   { bar: '#ec4899', label: 'Protokoler' },
  internal:     { bar: '#6b7280', label: 'Internal Kementerian' },
}

const KPI_WEIGHT: Record<string, number> = {
  kenegaraan:    95,
  internasional: 90,
  publik:        80,
  koordinasi:    70,
  protokoler:    55,
  internal:      30,
}

const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  return {
    start: mon,
    end: sun,
    label: `${mon.getDate()}–${sun.getDate()} ${MONTHS_ID[sun.getMonth()]} ${sun.getFullYear()}`,
  }
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return { day: d.getDate(), dow: DAYS_ID[d.getDay()] }
}

interface AgendaCardProps {
  agenda: Agenda
  canManage: boolean
  onEdit: (a: Agenda) => void
  onDelete: (id: number) => void
}

function AgendaCard({ agenda, canManage, onEdit, onDelete }: AgendaCardProps) {
  const p = PRIORITY_COLOR[agenda.priority] || PRIORITY_COLOR.low
  const { day, dow } = fmtDate(agenda.date)
  const cat = CATEGORY_COLOR[agenda.category]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '64px 1fr auto',
      gap: 0,
      background: 'white',
      border: '1px solid var(--line)',
      borderLeft: `4px solid ${p.border}`,
      borderRadius: '0 6px 6px 0',
      overflow: 'hidden',
    }}>
      {/* Date column */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '16px 8px', borderRight: '1px solid var(--line)',
        background: 'var(--paper)',
      }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{day}</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', color: 'var(--bark-soft)', textTransform: 'uppercase', marginTop: 2 }}>{dow}</div>
        {agenda.time && (
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--bark)', marginTop: 6, fontWeight: 600 }}>{agenda.time}</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          {cat && (
            <span style={{
              fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 700, padding: '3px 8px', borderRadius: 3,
              background: cat.bar + '22', color: cat.bar, border: `1px solid ${cat.bar}55`,
            }}>{cat.label}</span>
          )}
          {agenda.status === 'delegated' && (
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, padding: '3px 8px', borderRadius: 3, background: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' }}>
              Delegasi
            </span>
          )}
        </div>

        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 8 }}>
          {agenda.title}
        </div>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--bark-soft)' }}>
          {agenda.location && <span>📍 {agenda.location}</span>}
          {agenda.description && <span style={{ color: 'var(--bark-soft)' }}>· {agenda.description}</span>}
        </div>
      </div>

      {/* Right: score + priority badge + actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', padding: '14px 16px', minWidth: 120 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {agenda.is_kpi && agenda.kpi_score != null && agenda.kpi_score > 0 && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{agenda.kpi_score}</span>
              <span style={{ fontSize: 11, color: 'var(--bark-soft)' }}>/100</span>
            </div>
          )}
          <span style={{
            fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em',
            textTransform: 'uppercase', fontWeight: 700, padding: '4px 10px', borderRadius: 3,
            background: p.bg, color: p.text,
          }}>{p.label}</span>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {agenda.status !== 'delegated' && (
            <button style={{ fontSize: 10, fontWeight: 700, padding: '5px 10px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
              Hadir
            </button>
          )}
          <button style={{ fontSize: 10, fontWeight: 700, padding: '5px 10px', background: 'white', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 3, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
            Brief
          </button>
          {canManage && (
            <>
              <button onClick={() => onEdit(agenda)} style={{ fontSize: 10, padding: '5px 8px', background: 'white', color: 'var(--leaf-deep)', border: '1px solid var(--leaf-mid)', borderRadius: 3, cursor: 'pointer' }}>✎</button>
              <button onClick={() => onDelete(agenda.id)} style={{ fontSize: 10, padding: '5px 8px', background: 'white', color: 'var(--clay)', border: '1px solid var(--clay)', borderRadius: 3, cursor: 'pointer' }}>✕</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function AiAnalysisPanel({ agendas }: { agendas: Agenda[] }) {
  const attend = agendas.filter(a => a.priority === 'critical' || (a.priority === 'high' && a.is_kpi))
  const delegate = agendas.filter(a => a.priority === 'low' || a.status === 'delegated' || (!a.is_kpi && a.priority === 'medium'))

  if (agendas.length === 0) return null

  return (
    <div style={{
      border: '1.5px solid var(--ink)',
      borderRadius: 6,
      marginBottom: 20,
      overflow: 'hidden',
    }}>
      <div style={{ background: 'var(--ink)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--sun)', textTransform: 'uppercase' }}>AI</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Analisis & Saran Prioritas — minggu ini</span>
      </div>
      <div style={{ padding: '16px 18px', background: 'white' }}>
        <p style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 14, lineHeight: 1.6 }}>
          Dari <strong>{agendas.length} agenda</strong>, AI menganalisis kepadatan jadwal, urgensi politik, dampak strategis, dan tujuan ESG. Rekomendasi: Bapak Menteri prioritaskan{' '}
          <strong>{attend.length} agenda kritis</strong> dan delegasikan sisanya ke Eselon I atau Wamen.
        </p>
        {attend.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
            <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
              <strong>Hadiri:</strong>{' '}
              {attend.map(a => a.title).join(' · ')} — dampak nasional & strategis tinggi
            </div>
          </div>
        )}
        {delegate.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🔶</span>
            <div style={{ fontSize: 13, color: 'var(--bark)', lineHeight: 1.5 }}>
              <strong>Delegasikan:</strong>{' '}
              {delegate.map(a => a.title).join(' · Dirjen · ')} → Eselon II
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryStatsPanel({ agendas }: { agendas: Agenda[] }) {
  const counts: Record<string, number> = {}
  agendas.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1 })
  const max = Math.max(...Object.values(counts), 1)
  const total = agendas.length

  return (
    <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 6, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--bark-soft)', marginBottom: 2 }}>
        Kategori Agenda · Bulan Ini
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--sun)', fontWeight: 700, marginBottom: 14, letterSpacing: '0.1em' }}>
        {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(CATEGORY_COLOR).map(([key, cat], i) => {
          const count = counts[key] || 0
          const pct = total > 0 ? (count / max) * 100 : 0
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--bark-soft)', fontWeight: 600, width: 16 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{cat.label}</span>
                </div>
                <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{count}</span>
              </div>
              <div style={{ height: 4, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: cat.bar, borderRadius: 2, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KpiWeightsPanel({ agendas }: { agendas: Agenda[] }) {
  const catAvg: Record<string, number[]> = {}
  agendas.forEach(a => {
    if (a.is_kpi && a.kpi_score) {
      if (!catAvg[a.category]) catAvg[a.category] = []
      catAvg[a.category].push(a.kpi_score)
    }
  })

  return (
    <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 6, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--bark-soft)', marginBottom: 14 }}>
        Bobot KPI per Kategori
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(KPI_WEIGHT).map(([key, weight]) => {
          const cat = CATEGORY_COLOR[key]
          const scores = catAvg[key] || []
          const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : weight
          return (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--ink)' }}>{cat?.label || key}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: 'var(--clay)' }}>
                {avg} <span style={{ color: 'var(--bark-soft)', fontWeight: 400 }}>/ 100</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function NewsLinksPanel() {
  const LINKS = [
    { type: 'Berita', title: 'Kunjungi Situs Resmi KLH', url: 'https://www.menlhk.go.id', icon: '🌐' },
    { type: 'Press', title: 'Siaran Pers Terkini', url: 'https://www.menlhk.go.id/site/post', icon: '📰' },
    { type: 'Dokumen', title: 'Portal Data Lingkungan', url: 'https://data.menlhk.go.id', icon: '📄' },
  ]
  return (
    <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 6, padding: '16px 18px' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--bark-soft)', marginBottom: 14 }}>
        Tautan Berita · Press Release · Dokumen
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LINKS.map(link => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 4, textDecoration: 'none', background: 'var(--paper)', transition: 'border-color 0.2s' }}
          >
            <span style={{ fontSize: 16 }}>{link.icon}</span>
            <div>
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--bark-soft)', marginBottom: 2 }}>{link.type}</div>
              <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>{link.title}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default function AgendaPanel() {
  const { user } = useAuth()
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAgenda, setEditingAgenda] = useState<Agenda | undefined>()
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const canManage = user?.role === 'admin'
  const week = getWeekRange()
  const confirmed = agendas.filter(a => a.status === 'confirmed').length

  useEffect(() => { fetchAgendas() }, [])

  const fetchAgendas = async () => {
    try {
      setLoading(true)
      const response = await ministerApi.getAgendas({ limit: 50 })
      const data = Array.isArray(response) ? response : (response as any).data || []
      setAgendas(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch agendas:', err)
      setError('Gagal memuat agenda')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus agenda ini?')) return
    try {
      await ministerApi.deleteAgenda(id)
      await fetchAgendas()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Gagal menghapus agenda')
    }
  }

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--bark-soft)' }}>Memuat agenda...</div>
  }

  return (
    <div>
      {/* Week header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
            Agenda Pekan Ini <em style={{ fontStyle: 'italic', color: 'var(--clay)', fontWeight: 400 }}>· {week.label}</em>
          </h3>
          <div style={{ fontSize: 12, color: 'var(--bark-soft)', marginTop: 4 }}>
            {agendas.length} agenda masuk · {confirmed} sudah dijadwalkan
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {canManage && (
            <button
              onClick={() => { setEditingAgenda(undefined); setShowForm(true) }}
              style={{ fontSize: 11, fontWeight: 700, padding: '10px 18px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}
            >
              + Tambah Agenda
            </button>
          )}
          <button style={{ fontSize: 11, fontWeight: 700, padding: '10px 18px', background: 'var(--sun)', color: 'var(--ink)', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            ≡ Ajukan Undangan Menteri
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee', color: 'var(--clay)', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 12 }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        {/* Main column */}
        <div>
          <AiAnalysisPanel agendas={agendas} />

          {agendas.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--bark-soft)', border: '1px dashed var(--line)', borderRadius: 6 }}>
              Belum ada agenda minggu ini
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {agendas.map(agenda => (
                <AgendaCard
                  key={agenda.id}
                  agenda={agenda}
                  canManage={canManage}
                  onEdit={(a) => { setEditingAgenda(a); setShowForm(true) }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div>
          <CategoryStatsPanel agendas={agendas} />
          <KpiWeightsPanel agendas={agendas} />
          <NewsLinksPanel />
        </div>
      </div>

      {/* Inline form for admin */}
      {showForm && canManage && (
        <AgendaFormModal
          agenda={editingAgenda}
          saving={saving}
          onClose={() => { setShowForm(false); setEditingAgenda(undefined) }}
          onSave={async (data) => {
            try {
              setSaving(true)
              if (editingAgenda) {
                await ministerApi.updateAgenda(editingAgenda.id, data)
              } else {
                await ministerApi.createAgenda(data)
              }
              await fetchAgendas()
              setShowForm(false)
              setEditingAgenda(undefined)
            } catch (err) {
              console.error('Save failed:', err)
              alert('Gagal menyimpan agenda')
            } finally {
              setSaving(false)
            }
          }}
        />
      )}
    </div>
  )
}

interface AgendaFormModalProps {
  agenda?: Agenda
  saving: boolean
  onClose: () => void
  onSave: (data: Partial<Agenda>) => Promise<void>
}

function AgendaFormModal({ agenda, saving, onClose, onSave }: AgendaFormModalProps) {
  const [title, setTitle] = useState(agenda?.title || '')
  const [description, setDescription] = useState(agenda?.description || '')
  const [date, setDate] = useState(agenda?.date || '')
  const [time, setTime] = useState(agenda?.time || '')
  const [location, setLocation] = useState(agenda?.location || '')
  const [priority, setPriority] = useState<Agenda['priority']>(agenda?.priority || 'medium')
  const [status, setStatus] = useState<Agenda['status']>(agenda?.status || 'scheduled')
  const [category, setCategory] = useState<Agenda['category']>(agenda?.category || 'kenegaraan')
  const [kpiScore, setKpiScore] = useState(String(agenda?.kpi_score || ''))
  const [isKpi, setIsKpi] = useState(agenda?.is_kpi ?? false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title.trim()) { setError('Judul diperlukan'); return }
    if (!date) { setError('Tanggal diperlukan'); return }
    await onSave({ title, description, date, time, location, priority, status, category, kpi_score: kpiScore ? Number(kpiScore) : undefined, is_kpi: isKpi })
  }

  const inputStyle = { width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid var(--line)', borderRadius: 4, fontFamily: 'inherit', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase' as const }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 8, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1.5px solid var(--ink)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, color: 'var(--leaf-deep)', margin: 0 }}>
            {agenda ? 'Edit Agenda' : 'Tambah Agenda'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--bark-soft)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: '#fee', border: '1px solid #fcc', padding: '10px 12px', borderRadius: 4, fontSize: 12, color: 'var(--clay)' }}>{error}</div>}

          <div><label style={labelStyle}>Judul</label><input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><label style={labelStyle}>Deskripsi</label><textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} /></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={labelStyle}>Tanggal</label><input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} required /></div>
            <div><label style={labelStyle}>Waktu</label><input type="time" style={inputStyle} value={time} onChange={e => setTime(e.target.value)} /></div>
          </div>

          <div><label style={labelStyle}>Lokasi</label><input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} /></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Prioritas</label>
              <select style={inputStyle} value={priority} onChange={e => setPriority(e.target.value as Agenda['priority'])}>
                <option value="critical">Kritis</option>
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={status} onChange={e => setStatus(e.target.value as Agenda['status'])}>
                <option value="scheduled">Dijadwalkan</option>
                <option value="confirmed">Dikonfirmasi</option>
                <option value="delegated">Delegasi</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Batal</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Kategori</label>
              <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value as Agenda['category'])}>
                <option value="kenegaraan">Kenegaraan</option>
                <option value="internasional">Internasional</option>
                <option value="koordinasi">Koordinasi</option>
                <option value="publik">Publik</option>
                <option value="protokoler">Protokoler</option>
                <option value="internal">Internal</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
            <div><label style={labelStyle}>KPI Score (0–100)</label><input type="number" min="0" max="100" style={inputStyle} value={kpiScore} onChange={e => setKpiScore(e.target.value)} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 2 }}>
              <input type="checkbox" id="isKpi" checked={isKpi} onChange={e => setIsKpi(e.target.checked)} style={{ width: 16, height: 16 }} />
              <label htmlFor="isKpi" style={{ fontSize: 12, color: 'var(--ink)', cursor: 'pointer' }}>Termasuk KPI</label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid var(--line)', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 16px', fontSize: 12, fontWeight: 600, background: 'white', color: 'var(--bark)', border: '1px solid var(--line)', borderRadius: 4, cursor: 'pointer' }}>Batal</button>
            <button type="submit" disabled={saving} style={{ padding: '9px 16px', fontSize: 12, fontWeight: 600, background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 4, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
