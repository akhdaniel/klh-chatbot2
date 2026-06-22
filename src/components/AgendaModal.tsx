import { useState } from 'react'
import type { Agenda } from '../types/agenda'

interface AgendaModalProps {
  isOpen: boolean
  agenda?: Agenda
  onClose: () => void
  onSave: (data: Partial<Agenda>) => Promise<void>
  loading?: boolean
}

export default function AgendaModal({ isOpen, agenda, onClose, onSave, loading }: AgendaModalProps) {
  const [title, setTitle] = useState(agenda?.title || '')
  const [description, setDescription] = useState(agenda?.description || '')
  const [startDate, setStartDate] = useState(agenda?.start_date || '')
  const [endDate, setEndDate] = useState(agenda?.end_date || '')
  const [location, setLocation] = useState(agenda?.location || '')
  const [status, setStatus] = useState(agenda?.status || 'planned')
  const [category, setCategory] = useState(agenda?.category || 'pertemuan')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Judul agenda diperlukan')
      return
    }

    if (!startDate) {
      setError('Tanggal mulai diperlukan')
      return
    }

    try {
      await onSave({
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        location,
        status,
        category,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan agenda')
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
    }}>
      <div style={{
        background: 'white', borderRadius: 8, maxWidth: 500, width: '100%',
        maxHeight: '90vh', overflow: 'auto', border: '1.5px solid var(--ink)',
        boxShadow: '0 20px 50px rgba(13,59,46,0.2)',
      }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 500, color: 'var(--leaf-deep)' }}>
            {agenda ? 'Edit Agenda' : 'Tambah Agenda'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: 'var(--bark-soft)' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ background: '#fee', border: '1px solid #fcc', padding: '12px 14px', borderRadius: 6, fontSize: 12, color: 'var(--clay)' }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Judul Agenda</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pertemuan dengan Kepala Dinas"
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid var(--line)', borderRadius: 6 }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rincian agenda..."
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid var(--line)', borderRadius: 6, minHeight: 100, fontFamily: 'inherit', resize: 'vertical' }}
              rows={4}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid var(--line)', borderRadius: 6 }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Tanggal Selesai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid var(--line)', borderRadius: 6 }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Lokasi</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kantor Kementerian LHK"
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid var(--line)', borderRadius: 6 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid var(--line)', borderRadius: 6 }}
              >
                <option value="pertemuan">Pertemuan</option>
                <option value="kunjungan">Kunjungan</option>
                <option value="seminar">Seminar</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid var(--line)', borderRadius: 6 }}
              >
                <option value="planned">Direncanakan</option>
                <option value="ongoing">Sedang Berlangsung</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Batal</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, background: 'white', color: 'var(--bark)', border: '1px solid var(--line)', borderRadius: 6, cursor: 'pointer' }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '10px 16px', fontSize: 12, fontWeight: 600, background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
