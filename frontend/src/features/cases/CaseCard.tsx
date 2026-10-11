import { memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import Avatar from '../../components/Avatar'
import PriorityBadge from '../../components/PriorityBadge'
import type { CaseItem } from '../../types'

/** Presentational card, also used inside the DragOverlay. */
export function CaseCardBody({ item, overlay = false }: { item: CaseItem; overlay?: boolean }) {
  return (
    <div className={`card prio-${item.priority}${overlay ? ' overlay' : ''}`}>
      <div className="card-title">{item.title}</div>
      <div className="card-customer">{item.customerName}</div>
      <div className="card-footer">
        <span className="card-key">{item.caseNumber}</span>
        <span className="spacer" />
        <PriorityBadge priority={item.priority} />
        <Avatar name={item.createdBy} />
      </div>
    </div>
  )
}

interface Props {
  item: CaseItem
  onOpen: (id: string) => void
}

// memo: when one card moves, the other cards do not re-render
const CaseCard = memo(function CaseCard({ item, onOpen }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`card-wrap${isDragging ? ' dragging' : ''}`}
      onClick={() => onOpen(item.id)}
    >
      <CaseCardBody item={item} />
    </div>
  )
})

export default CaseCard