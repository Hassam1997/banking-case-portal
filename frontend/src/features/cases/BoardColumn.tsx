import { useDroppable } from '@dnd-kit/core'
import type { CaseItem } from '../../types'
import CaseCard from './CaseCard'
import type { ColumnDef } from './constants'

interface Props {
  column: ColumnDef
  items: CaseItem[]
  locked: boolean // true when the current user may not drop here
  onOpen: (id: string) => void
}

export default function BoardColumn({ column, items, locked, onOpen }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status })
  const state = isOver ? (locked ? ' over-locked' : ' over') : ''

  return (
    <section className={`column${state}`}>
      <header className="column-header">
        <span className="column-title">{column.label}</span>
        <span className="count">{items.length}</span>
        {locked && <span title="Managers only">🔒</span>}
      </header>
      <div ref={setNodeRef} className="column-body">
        {items.map((item) => (
          <CaseCard key={item.id} item={item} onOpen={onOpen} />
        ))}
        {items.length === 0 && <div className="empty">No cases</div>}
      </div>
    </section>
  )
}