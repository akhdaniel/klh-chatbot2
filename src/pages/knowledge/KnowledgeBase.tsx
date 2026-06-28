import { useState, useEffect } from 'react'
import { knowledgeApi } from '../../api/pgrest'
import UploadModal from '../dashboard/UploadModal'

interface KnowledgeDoc {
  id: number | string
  title: string
  filename?: string | null
  file_type?: string | null
  file_size?: number | null
  status: 'processing' | 'indexed' | 'failed'
  category?: string
  created_at: string
  updated_at?: string
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  indexed: { bg: '#dcfce7', color: '#166534', label: 'Indexed' },
  processing: { bg: '#fef3c7', color: '#92400e', label: 'Processing' },
  failed: { bg: '#fee2e2', color: '#991b1b', label: 'Failed' },
}

const CATEGORIES = ['', 'Regulasi & Peraturan', 'Juknis & SOP', 'FAQ Terkurasi', 'Data Referensi', 'general']

export default function KnowledgeBase() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const isMobile = useIsMobile()

  const fetchDocs = async () => {
    try {
      setLoading(true)
      const response = await knowledgeApi.list({
        category: filter || undefined,
        search: search || undefined,
        limit: 100,
      })
      setDocs(response.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dokumen')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [filter])

  const handleSearch = () => {
    fetchDocs()
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm('Hapus dokumen ini?')) return
    try {
      await knowledgeApi.delete(id)
      setDocs(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      alert('Gagal menghapus')
    }
  }

  const formatSize = (bytes: number | null | undefined) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
      return '-'
    }
  }

  return (
    <div style={{ border: '1.5px solid var(--ink)', overflow: 'hidden', background: 'var(--paper)', boxShadow: '0 20px 50px rgba(13,59,46,0.12)' }}>
      {/* Header */}
      <div style={{ padding: isMobile ? '16px' : '22px 28px', borderBottom: '1.5px solid var(--ink)', background: 'linear-gradient(135deg, var(--leaf-paper), var(--paper))', display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: isMobile ? 18 : 24, fontWeight: 500, color: 'var(--leaf-deep)', marginBottom: 4 }}>
            Sumber Data <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>· Knowledge Base</em>
          </h2>
          <p style={{ fontSize: 12, color: 'var(--bark-soft)' }}>
            {docs.length} dokumen · Regulasi, juknis, FAQ untuk basis pengetahuan AI
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          style={{ padding: '8px 20px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}
        >
          + Upload Dokumen
        </button>
      </div>

      {/* Filters */}
      <div style={{ padding: isMobile ? '12px 16px' : '14px 28px', borderBottom: '1px solid var(--line)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat || 'all'}
            onClick={() => setFilter(cat)}
            style={{
              padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 4, cursor: 'pointer',
              border: '1px solid var(--line)',
              background: filter === cat ? 'var(--ink)' : 'white',
              color: filter === cat ? 'white' : 'var(--bark-soft)',
              fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em',
            }}
          >
            {cat || 'Semua'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Cari dokumen..."
            style={{ padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 4, fontSize: 12, fontFamily: 'inherit', width: isMobile ? 120 : 180 }}
          />
          <button onClick={handleSearch} style={{ padding: '5px 10px', background: 'white', border: '1px solid var(--line)', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>🔍</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? '12px 16px' : '16px 28px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--bark-soft)' }}>Memuat dokumen...</div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--clay)' }}>{error}</div>
        )}

        {!loading && !error && docs.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--bark-soft)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
            <div style={{ fontSize: 16, marginBottom: 8 }}>Belum ada dokumen</div>
            <div style={{ fontSize: 13 }}>Upload dokumen pertama untuk memulai</div>
          </div>
        )}

        {!loading && !error && docs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {docs.map(doc => {
              const st = STATUS_CONFIG[doc.status] || STATUS_CONFIG.processing
              const ext = doc.file_type || doc.filename?.split('.').pop() || '?'
              return (
                <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: isMobile ? '12px' : '14px 16px', background: 'white', border: '1px solid var(--line)', borderRadius: 6, transition: 'box-shadow 0.15s' }}>
                  {/* Icon */}
                  <div style={{ width: 36, height: 36, background: 'var(--leaf-light)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--leaf-deep)', flexShrink: 0 }}>
                    {ext.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.title}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 11, color: 'var(--bark-soft)', fontFamily: 'JetBrains Mono, monospace', flexWrap: 'wrap' }}>
                      <span>{formatSize(doc.file_size)}</span>
                      <span>·</span>
                      <span>{formatDate(doc.created_at)}</span>
                      {doc.category && <><span>·</span><span>{doc.category}</span></>}
                    </div>
                  </div>

                  {/* Status */}
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 3, fontWeight: 700, background: st.bg, color: st.color, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                    {st.label}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--bark-soft)', fontSize: 14, padding: 4, flexShrink: 0 }}
                    title="Hapus"
                  >×</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showUpload && <UploadModal onClose={() => { setShowUpload(false); fetchDocs() }} />}
    </div>
  )
}
