import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ministerApi } from '../../api/pgrest'
import type { Agenda } from '../../types/agenda'
import AgendaModal from '../../components/AgendaModal'

const BORDER_COLOR: Record<string, string> = {
  critical: 'var(--clay)',
  high: 'var(--sun)',
  medium: 'var(--leaf-mid)',
  low: 'var(--line)',
}

export default function AgendaPanel() {
  const { user } = useAuth()
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingAgenda, setEditingAgenda] = useState<Agenda | undefined>()
  const [saving, setSaving] = useState(false)

  // Check if user can manage agendas (admin or has allow_add_agenda flag)
  const canManage = user?.role === 'admin'

  useEffect(() => {
    fetchAgendas()
  }, [])

  const fetchAgendas = async () => {
    try {
      setLoading(true)
      const response = await ministerApi.getAgendas({ limit: 50 })
      const data = Array.isArray(response) ? response : response.data || []
      setAgendas(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch agendas:', err)
      setError('Gagal memuat agenda')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAgenda = async (data: Partial<Agenda>) => {
    try {
      setSaving(true)
      if (editingAgenda) {
        await ministerApi.updateAgenda(editingAgenda.id, data)
      } else {
        await ministerApi.createAgenda(data)
      }
      await fetchAgendas()
      setEditingAgenda(undefined)
    } catch (err) {
      throw err
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAgenda = async (id: string | number) => {
    if (!confirm('Hapus agenda ini?')) return
    try {
      await ministerApi.deleteAgenda(id)
      await fetchAgendas()
    } catch (err) {
      console.error('Failed to delete agenda:', err)
    }
  }

  const handleEditAgenda = (agenda: Agenda) => {
    setEditingAgenda(agenda)
    setShowModal(true)
  }

  if (loading) {
    return <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--bark-soft)' }}>Loading agenda...</div>
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 500, color: 'var(--leaf-deep)' }}>
            Agenda Menteri <em style={{ fontStyle: 'italic', color: 'var(--clay)' }}>· Real-time</em>
          </h3>
          {canManage && (
            <button
              onClick={() => {
                setEditingAgenda(undefined)
                setShowModal(true)
              }}
              style={{ fontSize: 12, fontWeight: 600, padding: '8px 14px', background: 'var(--leaf-deep)', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}
            >
              + Tambah Agenda
            </button>
          )}
        </div>

        {error && <div style={{ background: '#fee', color: 'var(--clay)', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 12 }}>{error}</div>}

        {agendas.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--bark-soft)', fontSize: 14 }}>
            Belum ada agenda
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {agendas.map((agenda) => (
              <div
                key={agenda.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 16,
                  padding: '16px 18px',
                  background: 'white',
                  border: '1px solid var(--line)',
                  borderLeft: `4px solid ${BORDER_COLOR[agenda.status] || 'var(--line)'}`,
                  borderRadius: '0 4px 4px 0',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 10,
                        fontFamily: 'JetBrains Mono, monospace',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: 3,
                        fontWeight: 700,
                        background: 'var(--leaf-light)',
                        color: 'var(--leaf-deep)',
                      }}
                    >
                      {agenda.category || 'agenda'}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--bark-soft)' }}>
                      {new Date(agenda.start_date).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: 'Fraunces, serif',
                      fontSize: 17,
                      fontWeight: 500,
                      color: 'var(--ink)',
                      marginBottom: 8,
                      lineHeight: 1.3,
                    }}
                  >
                    {agenda.title}
                  </div>
                  {agenda.description && (
                    <div style={{ fontSize: 13, color: 'var(--bark-soft)', marginBottom: 8, lineHeight: 1.4 }}>
                      {agenda.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--bark-soft)' }}>
                    {agenda.location && <span>📍 {agenda.location}</span>}
                    {agenda.end_date && (
                      <span>
                        📅 s/d {new Date(agenda.end_date).toLocaleDateString('id-ID')}
                      </span>
                    )}
                    <span style={{ textTransform: 'capitalize' }}>
                      Status: <strong style={{ color: 'var(--ink)' }}>{agenda.status}</strong>
                    </span>
                  </div>
                </div>

                {canManage && (
                  <div style={{ display: 'flex', gap: 6, flexDirection: 'column', minWidth: 80 }}>
                    <button
                      onClick={() => handleEditAgenda(agenda)}
                      style={{
                        background: 'white',
                        border: '1px solid var(--line)',
                        padding: '6px 10px',
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: 3,
                        color: 'var(--leaf-deep)',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAgenda(agenda.id)}
                      style={{
                        background: 'white',
                        border: '1px solid var(--clay)',
                        padding: '6px 10px',
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                        borderRadius: 3,
                        color: 'var(--clay)',
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right sidebar - info panel */}
      <div>
        {canManage && (
          <div style={{ background: 'var(--leaf-light)', border: '1.5px solid var(--leaf-mid)', padding: '14px 16px', borderRadius: 6, marginBottom: 16, fontSize: 12 }}>
            <div style={{ fontWeight: 600, color: 'var(--leaf-deep)', marginBottom: 6 }}>✓ Admin Mode</div>
            <div style={{ color: 'var(--bark-soft)', lineHeight: 1.4 }}>
              Anda dapat menambah, mengubah, dan menghapus agenda.
            </div>
          </div>
        )}

        <div style={{ background: 'white', border: '1px solid var(--line)', padding: '16px 18px', borderRadius: 6 }}>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'var(--bark-soft)',
              marginBottom: 12,
            }}
          >
            Statistik Agenda
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--bark)' }}>Total Agenda</span>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 500, color: 'var(--leaf-deep)' }}>
                {agendas.length}
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 8,
                paddingTop: 10,
                borderTop: '1px dashed var(--line-soft)',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--bark-soft)' }}>Dalam rencana</span>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                {agendas.filter((a) => a.status === 'planned').length}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--bark-soft)' }}>Sedang berlangsung</span>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                {agendas.filter((a) => a.status === 'ongoing').length}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--bark-soft)' }}>Selesai</span>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                {agendas.filter((a) => a.status === 'completed').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Agenda Modal */}
      <AgendaModal
        isOpen={showModal}
        agenda={editingAgenda}
        onClose={() => {
          setShowModal(false)
          setEditingAgenda(undefined)
        }}
        onSave={handleSaveAgenda}
        loading={saving}
      />
    </div>
  )
}
