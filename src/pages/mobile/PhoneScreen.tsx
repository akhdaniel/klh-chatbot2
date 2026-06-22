interface Msg { role: 'received' | 'sent'; text: string; time: string; isTicket?: boolean; ticketId?: string }

const SCENARIO_1: Msg[] = [
  { role: 'received', text: 'Selamat pagi 🌱 Saya asisten resmi KLH. Boleh saya tahu nama dan kota Anda?', time: '09:28' },
  { role: 'sent', text: 'Budi, dari Karawang.', time: '09:29' },
  { role: 'received', text: 'Terima kasih Pak Budi. Apa yang bisa saya bantu?', time: '09:29' },
  { role: 'sent', text: 'Saya mau lapor. Air Sungai Citarum hitam pekat dan bau sejak kemarin. Ada pabrik tekstil baru.', time: '09:31' },
  { role: 'received', text: 'Ini saya catat sebagai <strong>dugaan pencemaran air</strong>. Mohon kirim foto dan share lokasi GPS untuk verifikasi cepat.', time: '09:31' },
  { role: 'sent', text: '📷 [3 foto sungai] · 📍 -6.3024, 107.3025', time: '09:33' },
  { role: 'received', text: 'Data lengkap diterima.', time: '09:33', isTicket: true, ticketId: 'KLH-PCM-2026-0428' },
]

const SCENARIO_2: Msg[] = [
  { role: 'received', text: 'Selamat pagi 🌱 Boleh saya tahu nama Anda? (opsional — bisa dilewati)', time: '10:12' },
  { role: 'sent', text: 'Saya lebih suka anonim.', time: '10:13' },
  { role: 'received', text: 'Baik, identitas Anda terlindungi. Apa yang ingin Anda laporkan?', time: '10:13' },
  { role: 'sent', text: 'Ada penjualan satwa dilindungi di marketplace. Saya punya screenshot-nya.', time: '10:15' },
  { role: 'received', text: 'Terima kasih. Tolong kirim screenshot-nya ke sini.', time: '10:15' },
  { role: 'sent', text: '📷 [screenshot marketplace]', time: '10:16' },
  { role: 'received', text: 'Laporan diteruskan ke Balai Gakkum. Identitas Anda dirahasiakan.', time: '10:16', isTicket: true, ticketId: 'KLH-KSV-2026-0422' },
]

const SCENARIO_3: Msg[] = [
  { role: 'received', text: 'Selamat siang 🌱 Ada yang bisa saya bantu?', time: '13:20' },
  { role: 'sent', text: 'Saya mau cek status surat AMDAL No. 1247/AM/2026', time: '13:21' },
  { role: 'received', text: 'Mohon tunggu, saya periksa...', time: '13:21' },
  { role: 'received', text: '📋 Surat <strong>No. 1247/AM/2026</strong> sudah didisposisi ke Direktorat Validasi pada 23 Mei. Estimasi review selesai 14 hari kerja.', time: '13:22' },
  { role: 'sent', text: 'Terima kasih!', time: '13:22' },
  { role: 'received', text: 'Sama-sama. Ada yang lain bisa dibantu? Tiket Anda: KLH-SRT-2026-0425', time: '13:22', isTicket: true, ticketId: 'KLH-SRT-2026-0425' },
]

const SCENARIOS: Record<string, Msg[]> = { '1': SCENARIO_1, '2': SCENARIO_2, '3': SCENARIO_3 }

export default function PhoneScreen({ scenario }: { scenario: string }) {
  const msgs = SCENARIOS[scenario] || SCENARIO_1

  return (
    <div style={{
      flex: 1, background: 'var(--whatsapp-bg)', padding: '12px 10px',
      overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ alignSelf: 'center', background: 'white', padding: '4px 10px', borderRadius: 8, fontSize: 10, color: '#667781', fontWeight: 500, boxShadow: '0 1px 1px rgba(0,0,0,0.05)', margin: '4px 0' }}>
        Hari ini
      </div>
      {msgs.map((msg, i) => (
        <div key={i} style={{ maxWidth: '78%', alignSelf: msg.role === 'sent' ? 'flex-end' : 'flex-start', animation: 'msgIn 0.3s ease' }}>
          <div style={{
            padding: '7px 10px 6px', borderRadius: 8,
            borderTopLeftRadius: msg.role === 'received' ? 2 : 8,
            borderTopRightRadius: msg.role === 'sent' ? 2 : 8,
            background: msg.role === 'sent' ? 'var(--whatsapp-sent)' : 'var(--whatsapp-received)',
            fontSize: 13, lineHeight: 1.4, boxShadow: '0 1px 1px rgba(0,0,0,0.08)',
          }}>
            <span dangerouslySetInnerHTML={{ __html: msg.text }} />
            {msg.isTicket && msg.ticketId && (
              <div style={{ marginTop: 6, padding: 10, background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: 6, borderLeft: '3px solid var(--sun)' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--bark-soft)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Nomor Tiket</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: 'var(--bark)', letterSpacing: '0.05em' }}>{msg.ticketId}</div>
              </div>
            )}
            <div style={{ fontSize: 10, color: '#667781', marginTop: 2, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
              {msg.time}
              {msg.role === 'sent' && <span style={{ color: '#53bdeb', fontSize: 11 }}>✓✓</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
