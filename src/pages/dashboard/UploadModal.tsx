const FILES = [
  { name: 'Peraturan-MENLHK-2025.pdf', size: '2.4 MB', status: 'indexed' },
  { name: 'Panduan-AMDAL-2024.docx', size: '1.1 MB', status: 'indexed' },
  { name: 'FAQ-Carbon-Credit-Q1-2026.pdf', size: '840 KB', status: 'processing' },
]

export default function UploadModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,59,46,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: 20 }}>
      <div style={{ background: 'var(--paper)', border: '1.5px solid var(--ink)', maxWidth: 620, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 80px rgba(0,0,0,0.4)', animation: 'fadeUp 0.3s ease' }}>
        <div style={{ padding: '22px 28px 18px', borderBottom: '1.5px solid var(--ink)', background: 'linear-gradient(135deg, var(--leaf-paper), var(--paper))', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 500, color: 'var(--leaf-deep)', marginBottom: 4 }}>
              Upload <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>Sumber Data</em>
            </h3>
            <p style={{ fontSize: 13, color: 'var(--bark-soft)' }}>Regulasi, juknis, FAQ — dikurasi sebagai basis pengetahuan AI.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--ink)', width: 30, height: 30, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}>×</button>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark)', fontWeight: 600, marginBottom: 8 }}>Judul / Deskripsi Dokumen</label>
            <input style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', background: 'white', fontFamily: 'inherit', fontSize: 13, borderRadius: 4 }} placeholder="Mis. Peraturan Menteri LHK No. 12 Tahun 2026" />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark)', fontWeight: 600, marginBottom: 8 }}>Kategori</label>
            <select style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', background: 'white', fontFamily: 'inherit', fontSize: 13, borderRadius: 4 }}>
              <option>Regulasi & Peraturan</option>
              <option>Juknis & SOP</option>
              <option>FAQ Terkurasi</option>
              <option>Data Referensi</option>
            </select>
          </div>
          <div style={{ border: '2px dashed var(--line)', background: 'white', padding: '30px 20px', textAlign: 'center', borderRadius: 6, cursor: 'pointer' }}>
            <div style={{ fontSize: 32, color: 'var(--leaf-mid)', marginBottom: 8 }}>📁</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>Seret file ke sini atau klik untuk memilih</div>
            <div style={{ fontSize: 11, color: 'var(--bark-soft)', marginTop: 4 }}>PDF, DOCX, XLSX — maks. 50 MB</div>
          </div>

          <div style={{ marginTop: 16 }}>
            {FILES.map(f => (
              <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'white', border: '1px solid var(--line)', marginTop: 8, borderRadius: 4 }}>
                <div style={{ width: 28, height: 28, background: 'var(--leaf-light)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--leaf-deep)' }}>
                  {f.name.split('.').pop()?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 12 }}>{f.name}</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--bark-soft)' }}>{f.size}</div>
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace', background: f.status === 'indexed' ? '#d1fae5' : '#fef3c7', color: f.status === 'indexed' ? 'var(--status-resolved)' : 'var(--status-open)' }}>{f.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 28px', borderTop: '1.5px solid var(--ink)', background: 'white', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: 'white', border: '1px solid var(--line)', borderRadius: 5, cursor: 'pointer', fontSize: 13 }}>Batal</button>
          <button style={{ padding: '8px 20px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Upload & Indeks</button>
        </div>
      </div>
    </div>
  )
}
