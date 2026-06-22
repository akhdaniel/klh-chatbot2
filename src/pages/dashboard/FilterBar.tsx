interface Filter { label: string; count: number; value: string }

export default function FilterBar({ filters, active, onChange, onUpload }: {
  filters: Filter[]; active: string; onChange: (v: string) => void; onUpload: () => void
}) {
  return (
    <div style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--line)', background: 'var(--paper)', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 200, background: 'white', border: '1px solid var(--line)', padding: '8px 14px', borderRadius: 6, fontSize: 13, color: 'var(--bark-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
        🔍 <span>Cari tiket, nama pelapor, atau nomor surat…</span>
      </div>
      {filters.map(f => (
        <button key={f.value} onClick={() => onChange(f.value)} style={{
          background: active === f.value ? 'var(--leaf-deep)' : 'white',
          border: `1px solid ${active === f.value ? 'var(--leaf-deep)' : 'var(--line)'}`,
          color: active === f.value ? 'white' : 'var(--bark)',
          padding: '6px 12px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500,
        }}>
          {f.label}
          <span style={{ background: 'rgba(0,0,0,0.08)', padding: '1px 6px', borderRadius: 8, fontSize: 10, fontWeight: 600 }}>{f.count}</span>
        </button>
      ))}
      <button onClick={onUpload} style={{
        marginLeft: 'auto', background: 'var(--sun)', border: '1.5px solid var(--ink)',
        padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>⬆ Upload Sumber Data</button>
    </div>
  )
}
