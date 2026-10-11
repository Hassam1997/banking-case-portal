import { useEffect, useState, type FormEvent } from 'react'
import { errorMessage } from '../../api/client'
import { useToast } from '../../components/ToastProvider'
import type { CreateCaseInput } from '../../types'
import { PRIORITIES } from './constants'
import { useCreateCase } from './useCases'

export default function CreateCaseModal({ onClose }: { onClose: () => void }) {
  const create = useCreateCase()
  const toast = useToast()
  const [form, setForm] = useState<CreateCaseInput>({
    customerName: '', title: '', description: '', priority: 'MEDIUM',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = <K extends keyof CreateCaseInput>(key: K, value: CreateCaseInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    create.mutate(
      { ...form, customerName: form.customerName.trim(), title: form.title.trim() },
      {
        onSuccess: (c) => {
          toast.push(`${c.caseNumber} created`, 'success')
          onClose()
        },
        onError: (err) => setError(errorMessage(err)),
      },
    )
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit} role="dialog" aria-modal="true" aria-label="Create case">
        <h2>Create case</h2>
        {error && <div className="banner banner-error" role="alert">{error}</div>}

        <label className="field">
          Customer name
          <input className="input" value={form.customerName} maxLength={100} required autoFocus
                 onChange={(e) => set('customerName', e.target.value)} />
        </label>
        <label className="field">
          Title
          <input className="input" value={form.title} maxLength={150} required
                 onChange={(e) => set('title', e.target.value)} />
        </label>
        <label className="field">
          Description
          <textarea className="input" rows={4} value={form.description} maxLength={2000}
                    onChange={(e) => set('description', e.target.value)} />
        </label>
        <label className="field">
          Priority
          <select className="input" value={form.priority}
                  onChange={(e) => set('priority', e.target.value as CreateCaseInput['priority'])}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>

        <div className="modal-actions">
          <button type="button" className="btn btn-subtle" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}