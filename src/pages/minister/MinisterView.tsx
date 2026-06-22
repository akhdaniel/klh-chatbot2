import { useState } from 'react'
import AgendaPanel from './AgendaPanel'
import KpiPanel from './KpiPanel'
import AwardsPanel from './AwardsPanel'
import QualityPanel from './QualityPanel'
import PolicyPanel from './PolicyPanel'
import EsgPanel from './EsgPanel'

type Tab = 'agenda' | 'kpi' | 'awards' | 'quality' | 'policy' | 'esg'

const TABS: { id: Tab; label: string }[] = [
  { id: 'agenda', label: '▦ Agenda & AI Saran' },
  { id: 'kpi', label: '▲ Dashboard KPI' },
  { id: 'awards', label: '🏆 Capaian & Penghargaan' },
  { id: 'quality', label: '🌿 Mutu Lingkungan' },
  { id: 'policy', label: '§ Kebijakan Unggulan' },
  { id: 'esg', label: '◆ ESG · SDG · Profil' },
]

export default function MinisterView() {
  const [tab, setTab] = useState<Tab>('agenda')

  return (
    <div style={{ border: '1.5px solid var(--ink)', overflow: 'hidden', background: 'var(--paper)', boxShadow: '0 20px 50px rgba(13,59,46,0.12)' }}>
      {/* Hero */}
      <div style={{
        background: 'radial-gradient(circle at 80% 30%, rgba(232,179,65,0.18), transparent 50%), linear-gradient(135deg, #0d3b2e 0%, #082821 60%, #051a14 100%)',
        color: 'white', padding: '32px 40px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 300, height: 300, background: 'radial-gradient(circle, rgba(212,233,221,0.08) 1px, transparent 1px)', backgroundSize: '12px 12px', opacity: 0.6 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, alignItems: 'center', position: 'relative' }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--sun), var(--clay))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 700, fontSize: 36, color: 'var(--leaf-deep)', border: '3px solid var(--sun)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>MJ</div>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--sun)', marginBottom: 6 }}>Profil Menteri · Kabinet Merah Putih 2024–2029</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 30, letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: 4 }}>
              Muhammad Jumhur <em style={{ fontStyle: 'italic', color: 'var(--sun-soft)', fontWeight: 400 }}>Hidayat</em>
            </div>
            <div style={{ fontSize: 14, color: 'rgba(212,233,221,0.85)', marginBottom: 12 }}>Menteri Lingkungan Hidup Republik Indonesia · dilantik 27 April 2026</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['⬢ Aktif 28 hari', '🌱 Fokus: Ekonomi Hijau', '🌏 Diplomasi Iklim', '📋 G20 · ASEAN'].map(tag => (
                <span key={tag} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 999, fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.9)' }}>{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, minWidth: 280 }}>
            {[['47', '/bln', 'Rata Agenda'], ['12', '', 'Penghargaan'], ['#27', '/180', 'EPI Global']].map(([num, sup, lbl]) => (
              <div key={lbl} style={{ textAlign: 'right', paddingLeft: 16, borderLeft: num === '47' ? 'none' : '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 500, color: 'white', lineHeight: 1 }}>
                  {num}<em style={{ fontStyle: 'italic', color: 'var(--sun)', fontSize: 14 }}>{sup}</em>
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(212,233,221,0.6)', marginTop: 6 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', padding: '0 32px', borderBottom: '1.5px solid var(--ink)', background: 'var(--paper)', overflowX: 'auto', gap: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: 'transparent', border: 'none', padding: '14px 18px',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.05em',
            textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', marginBottom: -1.5,
            color: tab === t.id ? 'var(--leaf-deep)' : 'var(--bark-soft)',
            borderBottom: `3px solid ${tab === t.id ? 'var(--sun)' : 'transparent'}`,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Panels */}
      <div style={{ padding: '28px 32px', animation: 'fadeUp 0.3s ease' }}>
        {tab === 'agenda' && <AgendaPanel />}
        {tab === 'kpi' && <KpiPanel />}
        {tab === 'awards' && <AwardsPanel />}
        {tab === 'quality' && <QualityPanel />}
        {tab === 'policy' && <PolicyPanel />}
        {tab === 'esg' && <EsgPanel />}
      </div>
    </div>
  )
}
