import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ministerApi } from '../../api/pgrest'
import type { MinisterLink, MinisterInvitation, MinisterKpiWeight } from '../../api/pgrest'
import type { Agenda } from '../../types/agenda'

// Hook untuk cek mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface AiAnalysis {
  week_label?: string
  total_incoming?: number
  total_scheduled?: number
  summary?: string
  attend?: { agenda_id: number; title: string; reason: string }[]
  delegate?: { agenda_id: number; title: string; delegate_to?: string; reason: string }[]
}

interface CategoryCount {
  category: string
  count: number
}

interface AgendaResponse {
  data: Agenda[]
  ai_analysis?: AiAnalysis
  stats?: {
    total?: number
    confirmed?: number
    category_counts?: CategoryCount[]
    kpi_weights?: MinisterKpiWeight[]
  }
  links?: MinisterLink[]
  incoming_today?: MinisterInvitation[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PRIORITY_COLOR: Record<string, { bg: string; text: string; border: string; label: string }> = {
  critical: { bg: '#dc2626', text: 'white', border: '#dc2626', label: 'Kritis' },
  high:     { bg: '#f97316', text: 'white', border: '#f97316', label: 'Tinggi' },
  medium:   { bg: 'var(--sun)', text: 'var(--ink)', border: 'var(--sun)', label: 'Sedang' },
  low:      { bg: 'var(--line)', text: 'var(--bark)', border: 'var(--line)', label: 'Rendah' },
}

const CATEGORY_META: Record<string, { bar: string; label: string }> = {
  kenegaraan:    { bar: '#f59e0b', label: 'Kenegaraan' },
  internasional: { bar: '#3b82f6', label: 'Internasional' },
  koordinasi:    { bar: '#8b5cf6', label: 'Koordinasi Antar-K/L' },
  publik:        { bar: '#22c55e', label: 'Publik & Peresmian' },
  protokoler:    { bar: '#ec4899', label: 'Protokoler' },
  internal:      { bar: '#6b7280', label: 'Internal Kementerian' },
}


const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

function getWeekLabel() {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  return `${mon.getDate()}–${sun.getDate()} ${MONTHS_ID[sun.getMonth()]} ${sun.getFullYear()}`
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return { day: d.getDate(), dow: DAYS_ID[d.getDay()] }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AgendaCard({ agenda, canManage, onEdit, onDelete }: {
  agenda: Agenda
  canManage: boolean
  onEdit: (a: Agenda) => void
  onDelete: (id: number) => void
}) {
  const p = PRIORITY_COLOR[agenda.priority] || PRIORITY_COLOR.low
  
  // Use pre-formatted date from API if available, otherwise calculate
  const day = agenda.date_formatted?.day_number ?? fmtDate(agenda.date || agenda.agenda_date || '').day
  const dow = agenda.date_formatted?.day_name ?? fmtDate(agenda.date || agenda.agenda_date || '').dow
  const cat = CATEGORY_META[agenda.category]

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 0,
      background: 'white', border: '1px solid var(--line)',
      borderLeft: `4px solid ${p.border}`, borderRadius: '0 6px 6px 0', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 8px', borderRight: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{day}</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.1em', color: 'var(--bark-soft)', textTransform: 'uppercase', marginTop: 2 }}>{dow}</div>
        {agenda.time && <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--bark)', marginTop: 6, fontWeight: 600 }}>{agenda.time}</div>}
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          {cat && (
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '3px 8px', borderRadius: 3, background: cat.bar + '22', color: cat.bar, border: `1px solid ${cat.bar}55` }}>
              {cat.label}
            </span>
          )}
          {agenda.status === 'delegated' && (
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, padding: '3px 8px', borderRadius: 3, background: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' }}>
              Delegasi {agenda.delegation_to ? `→ ${agenda.delegation_to}` : ''}
            </span>
          )}
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 8 }}>{agenda.title}</div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--bark-soft)' }}>
          {agenda.location && <span>📍 {agenda.location}</span>}
          {agenda.description && <span>· {agenda.description}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', padding: '14px 16px', minWidth: 120 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {agenda.is_kpi && agenda.kpi_score != null && agenda.kpi_score > 0 && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{agenda.kpi_score}</span>
              <span style={{ fontSize: 11, color: 'var(--bark-soft)' }}>/100</span>
            </div>
          )}
          <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, padding: '4px 10px', borderRadius: 3, background: p.bg, color: p.text }}>{p.label}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {agenda.status !== 'delegated' && (
            <button style={{ fontSize: 10, fontWeight: 700, padding: '5px 10px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>Hadir</button>
          )}
          <button style={{ fontSize: 10, fontWeight: 700, padding: '5px 10px', background: 'white', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 3, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>Brief</button>
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

function AiAnalysisPanel({ ai, agendas }: { ai?: AiAnalysis; agendas: Agenda[] }) {
  // Fallback: compute from data if BFF doesn't send ai_analysis yet
  const attend = ai?.attend ?? agendas
    .filter(a => a.priority === 'critical' || (a.priority === 'high' && a.is_kpi))
    .map(a => ({ agenda_id: a.id, title: a.title, reason: 'dampak strategis tinggi' }))

  const delegate = ai?.delegate ?? agendas
    .filter(a => a.priority === 'low' || a.status === 'delegated' || (!a.is_kpi && a.priority === 'medium'))
    .map(a => ({ agenda_id: a.id, title: a.title, delegate_to: a.delegation_to ?? 'Eselon II', reason: 'dapat diwakilkan' }))

  const total = ai?.total_incoming ?? agendas.length
  const summary = ai?.summary ?? `Dari ${total} agenda, AI menganalisis kepadatan jadwal, urgensi politik, dampak strategis, dan tujuan ESG. Rekomendasi: Bapak Menteri prioritaskan ${attend.length} agenda kritis dan delegasikan sisanya ke Eselon I atau Wamen.`

  if (agendas.length === 0 && !ai) return null

  return (
    <div style={{ border: '1.5px solid var(--ink)', borderRadius: 6, marginBottom: 20, overflow: 'hidden' }}>
      <div style={{ background: 'var(--ink)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--sun)', textTransform: 'uppercase' }}>AI</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Analisis & Saran Prioritas — minggu ini</span>
      </div>
      <div style={{ padding: '16px 18px', background: 'white' }}>
        <p style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 14, lineHeight: 1.6 }}>{summary}</p>
        {attend.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>✅</span>
            <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
              <strong>Hadiri:</strong>{' '}
              {attend.map((a, i) => (
                <span key={a.agenda_id}>{a.title}{a.reason ? ` (${a.reason})` : ''}{i < attend.length - 1 ? ' · ' : ''}</span>
              ))}
            </div>
          </div>
        )}
        {delegate.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>🔶</span>
            <div style={{ fontSize: 13, color: 'var(--bark)', lineHeight: 1.5 }}>
              <strong>Delegasikan:</strong>{' '}
              {delegate.map((a, i) => (
                <span key={a.agenda_id}>{a.title}{a.delegate_to ? ` → ${a.delegate_to}` : ''}{i < delegate.length - 1 ? ' · ' : ''}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryStatsPanel({ counts, agendas }: { counts?: CategoryCount[]; agendas: Agenda[] }) {
  // Fallback: compute from agendas if BFF doesn't send stats.category_counts yet
  const resolvedCounts: Record<string, number> = {}
  if (counts && counts.length > 0) {
    counts.forEach(c => { resolvedCounts[c.category] = c.count })
  } else {
    agendas.forEach(a => { resolvedCounts[a.category] = (resolvedCounts[a.category] || 0) + 1 })
  }

  const max = Math.max(...Object.values(resolvedCounts), 1)

  return (
    <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 6, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--bark-soft)', marginBottom: 2 }}>
        Kategori Agenda · Bulan Ini
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--sun)', fontWeight: 700, marginBottom: 14, letterSpacing: '0.1em' }}>
        {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase()}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(CATEGORY_META).map(([key, cat], i) => {
          const count = resolvedCounts[key] || 0
          const pct = (count / max) * 100
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'var(--bark-soft)', fontWeight: 600, width: 16 }}>{String(i + 1).padStart(2, '0')}</span>
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

function KpiWeightsPanel({ weights, agendas, canManage }: { weights?: MinisterKpiWeight[]; agendas: Agenda[]; canManage: boolean }) {
  const defaults: Record<string, number> = { kenegaraan: 95, internasional: 90, publik: 80, koordinasi: 70, protokoler: 55, internal: 30 }
  const init: Record<string, number> = { ...defaults }
  if (weights && weights.length > 0) weights.forEach(w => { init[w.category] = w.weight })
  else {
    const catScores: Record<string, number[]> = {}
    agendas.forEach(a => { if (a.is_kpi && a.kpi_score) { if (!catScores[a.category]) catScores[a.category] = []; catScores[a.category].push(a.kpi_score) } })
    Object.entries(catScores).forEach(([k, scores]) => { init[k] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) })
  }

  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState<Record<string, number>>(init)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (weights && weights.length > 0) {
      const next = { ...defaults }
      weights.forEach(w => { next[w.category] = w.weight })
      setValues(next)
    }
  }, [weights])

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all(
        Object.entries(values).map(([cat, w]) => ministerApi.updateKpiWeight(cat, w))
      )
      setEditing(false)
    } catch (err) { console.error('Save KPI weights failed:', err) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 6, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--bark-soft)' }}>
          Bobot KPI per Kategori
        </div>
        {canManage && !editing && (
          <button onClick={() => setEditing(true)} style={{ fontSize: 10, padding: '3px 8px', background: 'white', color: 'var(--leaf-deep)', border: '1px solid var(--leaf-mid)', borderRadius: 3, cursor: 'pointer' }}>Edit</button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(CATEGORY_META).map(([key, cat]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--ink)' }}>{cat.label}</span>
            {editing ? (
              <input
                type="number" min="0" max="100"
                value={values[key] ?? 0}
                onChange={e => setValues(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                style={{ width: 56, padding: '3px 6px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 3, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--clay)' }}
              />
            ) : (
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: 'var(--clay)' }}>
                {values[key] ?? '—'} <span style={{ color: 'var(--bark-soft)', fontWeight: 400 }}>/ 100</span>
              </span>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <div style={{ display: 'flex', gap: 6, marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
          <button onClick={handleSave} disabled={saving} style={{ fontSize: 10, padding: '5px 12px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={() => setEditing(false)} style={{ fontSize: 10, padding: '5px 10px', background: 'white', color: 'var(--bark)', border: '1px solid var(--line)', borderRadius: 3, cursor: 'pointer' }}>Batal</button>
        </div>
      )}
    </div>
  )
}

function fmtDateTime(dt: string) {
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function IncomingPanel({ initialItems, canManage }: { initialItems?: MinisterInvitation[]; canManage: boolean }) {
  const [items, setItems] = useState<MinisterInvitation[]>(initialItems ?? [])
  const [showAdd, setShowAdd] = useState(false)
  const [newFromOrg, setNewFromOrg] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDateTime, setNewDateTime] = useState('')

  useEffect(() => {
    if (initialItems) setItems(initialItems)
  }, [initialItems])

  const STATUS_COLOR: Record<string, string> = {
    pending: 'var(--bark-soft)', confirmed: 'var(--leaf-deep)', delegated: 'var(--sun)', declined: 'var(--clay)',
  }
  const STATUS_LABEL: Record<string, string> = {
    pending: 'Menunggu', confirmed: 'Dikonfirmasi', delegated: 'Didelegasi', declined: 'Ditolak',
  }

  const handleRespond = async (id: number, action: 'confirm' | 'delegate' | 'decline') => {
    try {
      await ministerApi.respondInvitation(id, action)
      const next = action === 'confirm' ? 'confirmed' : action === 'delegate' ? 'delegated' : 'declined'
      setItems(prev => prev.map(i => i.id === id ? { ...i, response: next as MinisterInvitation['response'] } : i))
    } catch (err) { console.error('Respond failed:', err) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus undangan ini?')) return
    try {
      await ministerApi.deleteInvitation(id)
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) { console.error('Delete failed:', err) }
  }

  const handleAdd = async () => {
    if (!newFromOrg.trim() || !newTitle.trim()) return
    try {
      const created = await ministerApi.createInvitation({
        from_org: newFromOrg,
        title: newTitle,
        date_time: newDateTime ? new Date(newDateTime).toISOString() : new Date().toISOString(),
        response: 'pending',
      })
      setItems(prev => [...prev, created as MinisterInvitation])
      setNewFromOrg(''); setNewTitle(''); setNewDateTime(''); setShowAdd(false)
    } catch (err) { console.error('Create failed:', err) }
  }

  const s = { width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 4, fontFamily: 'inherit', boxSizing: 'border-box' as const, marginBottom: 6 }

  return (
    <div style={{ background: 'white', border: '1px solid var(--line)', borderRadius: 6, padding: '16px 18px', marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--bark-soft)' }}>
          Undangan Masuk · Hari Ini
        </div>
        {canManage && (
          <button onClick={() => setShowAdd(v => !v)} style={{ fontSize: 10, padding: '3px 8px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer' }}>+</button>
        )}
      </div>

      {showAdd && canManage && (
        <div style={{ marginBottom: 14, padding: '10px 12px', background: 'var(--paper)', borderRadius: 4, border: '1px solid var(--line)' }}>
          <input style={s} placeholder="Dari (org/lembaga)" value={newFromOrg} onChange={e => setNewFromOrg(e.target.value)} />
          <input style={s} placeholder="Nama acara / judul undangan" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          <input type="datetime-local" style={s} value={newDateTime} onChange={e => setNewDateTime(e.target.value)} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAdd} style={{ fontSize: 10, padding: '5px 10px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>Simpan</button>
            <button onClick={() => setShowAdd(false)} style={{ fontSize: 10, padding: '5px 10px', background: 'white', color: 'var(--bark)', border: '1px solid var(--line)', borderRadius: 3, cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--bark-soft)', textAlign: 'center', padding: '12px 0' }}>Belum ada undangan</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{ paddingBottom: 12, borderBottom: '1px dashed var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{item.from_org ?? item.from}</div>
                  <div style={{ fontSize: 12, color: 'var(--bark-soft)' }}>{item.title ?? item.event} · {fmtDateTime(item.date_time ?? item.date ?? '')}</div>
                  {item.location && <div style={{ fontSize: 11, color: 'var(--bark-soft)', marginTop: 2 }}>📍 {item.location}</div>}
                  {item.response && item.response !== 'pending' && (
                    <div style={{ fontSize: 10, color: STATUS_COLOR[item.response] || 'var(--bark-soft)', marginTop: 4, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {STATUS_LABEL[item.response] || item.response}
                    </div>
                  )}
                </div>
                {canManage && (
                  <button onClick={() => handleDelete(item.id)} style={{ fontSize: 10, padding: '2px 6px', background: 'white', color: 'var(--clay)', border: '1px solid var(--clay)', borderRadius: 3, cursor: 'pointer', flexShrink: 0 }}>✕</button>
                )}
              </div>
              {canManage && (!item.response || item.response === 'pending' || item.response === undefined) && (
                <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                  <button onClick={() => handleRespond(item.id, 'confirm')} style={{ fontSize: 9, padding: '3px 8px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>Konfirmasi</button>
                  <button onClick={() => handleRespond(item.id, 'delegate')} style={{ fontSize: 9, padding: '3px 8px', background: 'var(--sun)', color: 'var(--ink)', border: 'none', borderRadius: 3, cursor: 'pointer', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>Delegasi</button>
                  <button onClick={() => handleRespond(item.id, 'decline')} style={{ fontSize: 9, padding: '3px 8px', background: 'white', color: 'var(--clay)', border: '1px solid var(--clay)', borderRadius: 3, cursor: 'pointer', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>Tolak</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function NewsLinksSection({ initialLinks, canManage }: { initialLinks?: MinisterLink[]; canManage: boolean }) {
  const fallback: MinisterLink[] = [
    { id: 1, type: 'berita',        title: 'Menteri Jumhur tegaskan komitmen Indonesia di COP31 menjelang Belém', url: 'https://www.menlhk.go.id',          source: 'Kompas',     published_at: '2026-05-24' },
    { id: 2, type: 'press_release', title: 'Siaran Pers KLH No. 124/PR/2026 — Capaian 30 Hari Pertama',          url: 'https://www.menlhk.go.id/site/post', source: 'klhk.go.id', published_at: '2026-05-23' },
    { id: 3, type: 'dokumen',       title: 'Permen LH No. 6/2025 — Baku Mutu Air Limbah (revisi)',                url: 'https://data.menlhk.go.id',          source: 'JDIH KLH' },
  ]
  const [items, setItems] = useState<MinisterLink[]>(initialLinks && initialLinks.length > 0 ? [...initialLinks].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)) : fallback)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ type: 'berita' as MinisterLink['type'], title: '', url: '', source: '', published_at: '', is_featured: false })

  useEffect(() => {
    if (initialLinks && initialLinks.length > 0)
      setItems([...initialLinks].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)))
  }, [initialLinks])

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus tautan ini?')) return
    try { await ministerApi.deleteLink(id); setItems(prev => prev.filter(l => l.id !== id)) }
    catch (err) { console.error('Delete link failed:', err) }
  }

  const handleAdd = async () => {
    if (!form.title.trim() || !form.url.trim()) return
    try {
      const created = await ministerApi.createLink(form)
      setItems(prev => [...prev, created as MinisterLink])
      setForm({ type: 'berita', title: '', url: '', source: '', published_at: '', is_featured: false })
      setShowAdd(false)
    } catch (err) { console.error('Create link failed:', err) }
  }

  const TYPE_LABEL: Record<string, string> = { berita: 'Berita', press_release: 'Press Release', dokumen: 'Regulasi' }
  const s = { width: '100%', padding: '6px 8px', fontSize: 12, border: '1px solid var(--line)', borderRadius: 4, fontFamily: 'inherit', boxSizing: 'border-box' as const, marginBottom: 6 }

  return (
    <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
          Tautan <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>Berita · Press Release · Dokumen Terkait</em>
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--bark-soft)', fontFamily: 'JetBrains Mono, monospace' }}>Diperbarui otomatis dari sumber resmi</span>
          {canManage && (
            <button onClick={() => setShowAdd(v => !v)} style={{ fontSize: 10, padding: '4px 10px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>+ Tambah</button>
          )}
        </div>
      </div>

      {showAdd && canManage && (
        <div style={{ marginBottom: 16, padding: '16px 18px', background: 'white', border: '1px solid var(--line)', borderRadius: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 6 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--bark-soft)', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>Tipe</label>
              <select style={s} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as MinisterLink['type'] }))}>
                <option value="berita">Berita</option>
                <option value="press_release">Press Release</option>
                <option value="dokumen">Dokumen/Regulasi</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--bark-soft)', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>Tanggal Terbit</label>
              <input type="date" style={s} value={form.published_at} onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} />
            </div>
          </div>
          <input style={s} placeholder="Judul" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <input style={s} placeholder="URL" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
          <input style={s} placeholder="Sumber (misal: Kompas, JDIH KLH)" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
            <label htmlFor="featured" style={{ fontSize: 12, color: 'var(--ink)', cursor: 'pointer' }}>Tampilkan sebagai unggulan</label>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleAdd} style={{ fontSize: 10, padding: '6px 14px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 3, cursor: 'pointer', fontWeight: 600 }}>Simpan</button>
            <button onClick={() => setShowAdd(false)} style={{ fontSize: 10, padding: '6px 10px', background: 'white', color: 'var(--bark)', border: '1px solid var(--line)', borderRadius: 3, cursor: 'pointer' }}>Batal</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {items.map(link => (
          <div key={link.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px 18px', border: '1px solid var(--line)', borderLeft: `3px solid var(--leaf-mid)`, borderRadius: '0 6px 6px 0', background: 'white', minHeight: 110 }}>
            {canManage && (
              <button onClick={() => handleDelete(link.id)} style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, padding: '2px 6px', background: 'white', color: 'var(--clay)', border: '1px solid var(--clay)', borderRadius: 3, cursor: 'pointer' }}>✕</button>
            )}
            <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: 1 }}>
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--leaf-deep)', marginBottom: 8 }}>
                {TYPE_LABEL[link.type] || link.type}
                {link.is_featured && <span style={{ marginLeft: 6, color: 'var(--sun)' }}>★</span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.4 }}>{link.title}</div>
            </a>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <div>
                {link.source && <span style={{ fontSize: 11, color: 'var(--bark-soft)' }}>{link.source}</span>}
                {link.published_at && <span style={{ fontSize: 11, color: 'var(--bark-soft)' }}> · {new Date(link.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
              </div>
              <span style={{ fontSize: 14, color: 'var(--bark-soft)' }}>↗</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AgendaPanel() {
  const { user } = useAuth()
  const [response, setResponse] = useState<AgendaResponse>({ data: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAgenda, setEditingAgenda] = useState<Agenda | undefined>()
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const isMobile = useIsMobile()

  const canManage = user?.role === 'admin'
  const agendas = response.data
  const stats = response.stats
  const weekLabel = response.ai_analysis?.week_label ?? getWeekLabel()
  const totalIncoming = response.ai_analysis?.total_incoming ?? stats?.total ?? agendas.length
  const totalScheduled = response.ai_analysis?.total_scheduled ?? stats?.confirmed ?? agendas.filter(a => a.status === 'confirmed').length

  useEffect(() => { fetchAgendas() }, [])

  const fetchAgendas = async () => {
    try {
      setLoading(true)
      const raw = await ministerApi.getAgendas({ limit: 50 })
      // Handle both array response and full envelope response
      if (Array.isArray(raw)) {
        setResponse({ data: raw })
      } else {
        setResponse(raw as unknown as AgendaResponse)
      }
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
      <div style={{ 
        display: 'flex', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        justifyContent: 'space-between', 
        marginBottom: 20,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 12 : 0
      }}>
        <div>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: isMobile ? 18 : 22, fontWeight: 500, color: 'var(--ink)', margin: 0 }}>
            Agenda Pekan Ini <em style={{ fontStyle: 'italic', color: 'var(--clay)', fontWeight: 400 }}>· {weekLabel}</em>
          </h3>
          <div style={{ fontSize: 12, color: 'var(--bark-soft)', marginTop: 4 }}>
            {totalIncoming} agenda masuk · {totalScheduled} sudah dijadwalkan
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {canManage && (
            <button onClick={() => { setEditingAgenda(undefined); setShowForm(true) }}
              style={{ fontSize: 11, fontWeight: 700, padding: isMobile ? '8px 12px' : '10px 18px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              + {isMobile ? 'Tambah' : 'Tambah Agenda'}
            </button>
          )}
          <button style={{ fontSize: 11, fontWeight: 700, padding: isMobile ? '8px 12px' : '10px 18px', background: 'var(--sun)', color: 'var(--ink)', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            ≡ {isMobile ? 'Ajukan' : 'Ajukan Undangan'}
          </button>
        </div>
      </div>

      {error && <div style={{ background: '#fee', color: 'var(--clay)', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 12 }}>{error}</div>}

      {isMobile ? (
        /* Mobile: Vertical layout - Agenda on top, sidebar below */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main column - Agenda on top */}
          <div>
            <AiAnalysisPanel ai={response.ai_analysis} agendas={agendas} />

            {agendas.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--bark-soft)', border: '1px dashed var(--line)', borderRadius: 6 }}>
                Belum ada agenda minggu ini
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {agendas.map(agenda => (
                  <AgendaCard key={agenda.id} agenda={agenda} canManage={canManage}
                    onEdit={(a) => { setEditingAgenda(a); setShowForm(true) }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Incoming, Categories, KPI Weights on bottom */}
          <div>
            <IncomingPanel initialItems={response.incoming_today} canManage={canManage} />
            <CategoryStatsPanel counts={stats?.category_counts} agendas={agendas} />
            <KpiWeightsPanel weights={stats?.kpi_weights} agendas={agendas} canManage={canManage} />
          </div>
        </div>
      ) : (
        /* Desktop: Grid layout - Agenda on left, sidebar on right */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
          {/* Main column */}
          <div>
            <AiAnalysisPanel ai={response.ai_analysis} agendas={agendas} />

            {agendas.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--bark-soft)', border: '1px dashed var(--line)', borderRadius: 6 }}>
                Belum ada agenda minggu ini
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {agendas.map(agenda => (
                  <AgendaCard key={agenda.id} agenda={agenda} canManage={canManage}
                    onEdit={(a) => { setEditingAgenda(a); setShowForm(true) }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div>
            <IncomingPanel initialItems={response.incoming_today} canManage={canManage} />
            <CategoryStatsPanel counts={stats?.category_counts} agendas={agendas} />
            <KpiWeightsPanel weights={stats?.kpi_weights} agendas={agendas} canManage={canManage} />
          </div>
        </div>
      )}

      {/* Full-width bottom: news/press/docs */}
      <NewsLinksSection initialLinks={response.links} canManage={canManage} />

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

// ── Form modal ────────────────────────────────────────────────────────────────

function AgendaFormModal({ agenda, saving, onClose, onSave }: {
  agenda?: Agenda
  saving: boolean
  onClose: () => void
  onSave: (data: Partial<Agenda>) => Promise<void>
}) {
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
  const [formError, setFormError] = useState('')

  const s = { width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid var(--line)', borderRadius: 4, fontFamily: 'inherit', boxSizing: 'border-box' as const }
  const l = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase' as const }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!title.trim()) { setFormError('Judul diperlukan'); return }
    if (!date) { setFormError('Tanggal diperlukan'); return }
    await onSave({ title, description, date, time, location, priority, status, category, kpi_score: kpiScore ? Number(kpiScore) : undefined, is_kpi: isKpi })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 8, maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1.5px solid var(--ink)' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, color: 'var(--leaf-deep)', margin: 0 }}>{agenda ? 'Edit Agenda' : 'Tambah Agenda'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--bark-soft)' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && <div style={{ background: '#fee', border: '1px solid #fcc', padding: '10px 12px', borderRadius: 4, fontSize: 12, color: 'var(--clay)' }}>{formError}</div>}

          <div><label style={l}>Judul</label><input style={s} value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div><label style={l}>Deskripsi</label><textarea style={{ ...s, minHeight: 80, resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} /></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={l}>Tanggal</label><input type="date" style={s} value={date} onChange={e => setDate(e.target.value)} required /></div>
            <div><label style={l}>Waktu</label><input type="time" style={s} value={time} onChange={e => setTime(e.target.value)} /></div>
          </div>

          <div><label style={l}>Lokasi</label><input style={s} value={location} onChange={e => setLocation(e.target.value)} /></div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={l}>Prioritas</label>
              <select style={s} value={priority} onChange={e => setPriority(e.target.value as Agenda['priority'])}>
                <option value="critical">Kritis</option>
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>
            <div>
              <label style={l}>Status</label>
              <select style={s} value={status} onChange={e => setStatus(e.target.value as Agenda['status'])}>
                <option value="scheduled">Dijadwalkan</option>
                <option value="confirmed">Dikonfirmasi</option>
                <option value="delegated">Delegasi</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Batal</option>
              </select>
            </div>
            <div>
              <label style={l}>Kategori</label>
              <select style={s} value={category} onChange={e => setCategory(e.target.value as Agenda['category'])}>
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
            <div><label style={l}>KPI Score (0–100)</label><input type="number" min="0" max="100" style={s} value={kpiScore} onChange={e => setKpiScore(e.target.value)} /></div>
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
