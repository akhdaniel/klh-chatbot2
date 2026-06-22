import { useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Ticket } from '../../types'

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface InteractiveMapProps {
  tickets: Ticket[]
  onMarkerClick?: (ticket: Ticket) => void
}

export default function InteractiveMap({ tickets, onMarkerClick }: InteractiveMapProps) {
  useEffect(() => {
    // Initialize map centered on Indonesia
    const map = L.map('leaflet-map').setView([-2.5489, 113.9213], 5)

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    // Add markers for tickets with coordinates
    tickets.forEach(ticket => {
      if (ticket.location_lat && ticket.location_lng) {
        const statusColor: Record<string, string> = {
          pending: '#d97706',
          open: '#d97706',
          in_progress: '#0891b2',
          resolved: '#059669',
          closed: '#6b7280',
        }

        // Create custom colored marker
        const markerHtml = `
          <div style="
            width: 30px;
            height: 30px;
            background: ${statusColor[ticket.status] || '#d97706'};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            ${tickets.indexOf(ticket) + 1}
          </div>
        `

        const customIcon = L.divIcon({
          html: markerHtml,
          iconSize: [30, 30],
          className: 'custom-marker',
        })

        const marker = L.marker([ticket.location_lat, ticket.location_lng], {
          icon: customIcon,
          title: ticket.title || ticket.ticket_number,
        }).addTo(map)

        // Popup on marker click
        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 250px;">
            <div style="font-weight: 600; color: #0d3b2e; margin-bottom: 8px; font-size: 14px;">
              ${ticket.ticket_number}
            </div>
            <div style="font-size: 13px; color: #2a2620; margin-bottom: 8px; line-height: 1.4;">
              <strong>Judul:</strong> ${ticket.title || ticket.ticket_number}
            </div>
            <div style="font-size: 13px; color: #2a2620; margin-bottom: 8px;">
              <strong>Lokasi:</strong> ${ticket.location_name || 'N/A'}
            </div>
            <div style="font-size: 13px; color: #2a2620; margin-bottom: 8px;">
              <strong>Status:</strong> <span style="color: ${statusColor[ticket.status] || '#d97706'}">${ticket.status}</span>
            </div>
            <div style="font-size: 12px; color: #4a4338;">
              ${new Date(ticket.created_at).toLocaleDateString('id-ID')}
            </div>
          </div>
        `

        marker.bindPopup(popupContent)

        // Click handler
        marker.on('click', () => {
          onMarkerClick?.(ticket)
        })
      }
    })

    // Cleanup
    return () => {
      map.remove()
    }
  }, [tickets, onMarkerClick])

  return (
    <div
      id="leaflet-map"
      style={{
        width: '100%',
        height: '100%',
        background: '#c8dfd8',
      }}
    />
  )
}
