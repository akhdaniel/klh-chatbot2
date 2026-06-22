import { useState } from 'react'
import PhoneScreen from './PhoneScreen'

const SCENARIOS = [
  { id: '1', label: 'Skenario 1\nPengaduan' },
  { id: '2', label: 'Skenario 2\nAnonim' },
  { id: '3', label: 'Skenario 3\nCek Surat' },
]

const ANNOTATIONS = [
  {
    num: '01', title: 'Sapaan & identifikasi opsional',
    body: 'Setiap percakapan dimulai dengan menanyakan nama dan instansi/domisili. Pengguna <strong>berhak menolak</strong> dan tetap dilayani secara anonim. Persetujuan disimpan sebagai bagian dari rekam jejak GDPR/UU PDP.',
    items: [],
  },
  {
    num: '02', title: 'Menu natural language',
    body: 'Pengguna tidak perlu menghafal kode angka. AI memahami "saya mau lapor pencemaran sungai" sama baiknya dengan menu terstruktur. Semua jawaban berbasis dokumen resmi Kementerian.',
    items: [],
  },
  {
    num: '03', title: 'Tiket otomatis per kasus',
    body: 'Begitu kategori teridentifikasi, sistem membuat nomor tiket unik (mis. <strong>KLH-PCM-2026-0428</strong>). Pengguna dapat mengecek status kapan saja hanya dengan menyebut nomor tiket.',
    items: ['OPEN — baru diterima', 'IN PROGRESS — sedang ditangani unit terkait', 'RESOLVED — selesai, menunggu konfirmasi', 'CLOSED — final'],
  },
]

export default function MobileView() {
  const [scenario, setScenario] = useState('1')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.2em',
          color: 'var(--bark-soft)', textTransform: 'uppercase', marginBottom: 16,
          padding: '6px 14px', border: '1px solid var(--line)', background: 'var(--paper)',
        }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--leaf-mid)', marginRight: 6, verticalAlign: 'middle' }} />
          WhatsApp · +62 811-KLH-INFO
        </div>

        {/* Phone frame */}
        <div style={{
          width: 340, height: 700, background: '#1a1a1a', borderRadius: 42, padding: 10,
          boxShadow: '0 30px 60px rgba(13,59,46,0.18), 0 8px 20px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
            width: 100, height: 26, background: '#0a0a0a', borderRadius: 14, zIndex: 10,
          }} />
          <div style={{ width: '100%', height: '100%', background: 'var(--whatsapp-bg)', borderRadius: 32, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Status bar */}
            <div style={{ height: 44, background: 'var(--whatsapp-green)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', color: 'white', fontSize: 12, fontWeight: 600 }}>
              <span>09:42</span><span>●●● ▮▮▮▮</span>
            </div>
            {/* WA Header */}
            <div style={{ background: 'var(--whatsapp-green)', padding: '10px 14px 14px', display: 'flex', alignItems: 'center', gap: 12, color: 'white' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--leaf-light), var(--leaf-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 700, color: 'var(--leaf-deep)', fontSize: 18, border: '2px solid rgba(255,255,255,0.3)' }}>⬢</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>KLH Asisten Resmi ✓</div>
                <div style={{ fontSize: 11, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} /> online · AI aktif
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 16, opacity: 0.9 }}>📞 ⋮</div>
            </div>
            <PhoneScreen scenario={scenario} />
            {/* Input */}
            <div style={{ background: 'var(--whatsapp-bg)', padding: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, background: 'white', borderRadius: 22, padding: '10px 16px', fontSize: 13, color: '#999', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Ketik pesan…</span><span>📎 📷</span>
              </div>
              <div style={{ width: 40, height: 40, background: 'var(--whatsapp-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18 }}>🎤</div>
            </div>
          </div>
        </div>
      </div>

      {/* Annotations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 40 }}>
        {/* Scenario toggle */}
        <div style={{ display: 'flex', gap: 6, border: '1px solid var(--ink)', padding: 3, background: 'var(--paper)' }}>
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => setScenario(s.id)} style={{
              flex: 1, background: scenario === s.id ? 'var(--leaf-deep)' : 'transparent',
              color: scenario === s.id ? 'white' : 'var(--bark-soft)',
              border: 'none', padding: '8px 10px',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600,
              whiteSpace: 'pre-line', textAlign: 'center',
            }}>{s.label}</button>
          ))}
        </div>

        {ANNOTATIONS.map(a => (
          <div key={a.num} style={{ border: '1.5px solid var(--ink)', background: 'var(--paper)', padding: '20px 22px', position: 'relative' }}>
            <div style={{
              position: 'absolute', top: -14, left: 18,
              background: 'var(--ink)', color: 'var(--paper)',
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600,
              padding: '4px 10px', letterSpacing: '0.1em',
            }}>{a.num}</div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 500, color: 'var(--leaf-deep)', marginBottom: 8 }}
              dangerouslySetInnerHTML={{ __html: a.title.replace(/(\w+)$/, '<em style="font-style:italic; color:var(--clay)">$1</em>') }} />
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--bark-soft)' }} dangerouslySetInnerHTML={{ __html: a.body }} />
            {a.items.length > 0 && (
              <ul style={{ listStyle: 'none', marginTop: 10 }}>
                {a.items.map((item, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--bark-soft)', padding: '5px 0 5px 20px', position: 'relative', borderBottom: i < a.items.length - 1 ? '1px dashed var(--line-soft)' : 'none' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--leaf-mid)', fontWeight: 600 }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
