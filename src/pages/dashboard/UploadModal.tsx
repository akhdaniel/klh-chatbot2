import { useState, useRef } from 'react'
import { knowledgeApi } from '../../api/pgrest'

interface UploadedFile {
  filename: string
  originalname: string
  size: number
  category: string
}

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Regulasi & Peraturan')
  const [files, setFiles] = useState<File[]>([])
  const [uploaded, setUploaded] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)])
    }
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setError(null)

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('title', title || file.name)
          formData.append('category', category)
          return knowledgeApi.upload(formData)
        })
      )

      const successFiles = results
        .filter((r: any) => r.ok)
        .map((r: any) => r.data)

      setUploaded(prev => [...prev, ...successFiles])
      setFiles([])
      setTitle('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal')
    } finally {
      setUploading(false)
    }
  }

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
          {error && (
            <div style={{ padding: '10px 14px', background: '#fee', border: '1px solid var(--clay)', borderRadius: 4, marginBottom: 16, fontSize: 13, color: 'var(--clay)' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark)', fontWeight: 600, marginBottom: 8 }}>Judul / Deskripsi Dokumen</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', background: 'white', fontFamily: 'inherit', fontSize: 13, borderRadius: 4 }}
              placeholder="Mis. Peraturan Menteri LHK No. 12 Tahun 2026"
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark)', fontWeight: 600, marginBottom: 8 }}>Kategori</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--line)', background: 'white', fontFamily: 'inherit', fontSize: 13, borderRadius: 4 }}
            >
              <option>Regulasi & Peraturan</option>
              <option>Juknis & SOP</option>
              <option>FAQ Terkurasi</option>
              <option>Data Referensi</option>
            </select>
          </div>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{ border: '2px dashed var(--line)', background: 'white', padding: '30px 20px', textAlign: 'center', borderRadius: 6, cursor: 'pointer' }}
          >
            <div style={{ fontSize: 32, color: 'var(--leaf-mid)', marginBottom: 8 }}>📁</div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500, color: 'var(--ink)' }}>Seret file ke sini atau klik untuk memilih</div>
            <div style={{ fontSize: 11, color: 'var(--bark-soft)', marginTop: 4 }}>PDF, DOCX, XLSX — maks. 50 MB</div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.csv,.txt"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* Pending files */}
          {files.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {files.map((f, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'white', border: '1px solid var(--line)', marginTop: 8, borderRadius: 4 }}>
                  <div style={{ width: 28, height: 28, background: 'var(--leaf-light)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--leaf-deep)' }}>
                    {f.name.split('.').pop()?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 12 }}>{f.name}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--bark-soft)' }}>{formatSize(f.size)}</div>
                  </div>
                  <button onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--clay)', fontSize: 14, fontWeight: 700 }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Uploaded files */}
          {uploaded.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--bark)', fontWeight: 600, marginBottom: 8 }}>Uploaded</div>
              {uploaded.map((f, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', marginTop: 8, borderRadius: 4 }}>
                  <div style={{ width: 28, height: 28, background: '#dcfce7', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#166534' }}>
                    {f.originalname.split('.').pop()?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#166534', fontSize: 12 }}>{f.originalname}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: '#166534' }}>{formatSize(f.size)}</div>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, fontWeight: 700, background: '#dcfce7', color: '#166534', textTransform: 'uppercase' }}>✓ saved</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '16px 28px', borderTop: '1.5px solid var(--ink)', background: 'white', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: 'white', border: '1px solid var(--line)', borderRadius: 5, cursor: 'pointer', fontSize: 13 }}>Batal</button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            style={{ padding: '8px 20px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 5, cursor: files.length === 0 || uploading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, opacity: files.length === 0 || uploading ? 0.5 : 1 }}
          >
            {uploading ? 'Uploading...' : 'Upload & Indeks'}
          </button>
        </div>
      </div>
    </div>
  )
}
