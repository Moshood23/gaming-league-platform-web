import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Field, FormError } from '../../components/Form'
import { api } from '../../lib/api'
import { formatDateTime } from '../../lib/format'

interface Announcement {
  id: string
  title: string
  content: string
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
}

interface AnnouncementList {
  canPost: boolean
  items: Announcement[]
}

export function Announcements({ seasonId }: { seasonId: string }) {
  const queryClient = useQueryClient()
  const key = ['announcements', seasonId]
  const list = useQuery({ queryKey: key, queryFn: () => api<AnnouncementList>(`/api/seasons/${seasonId}/announcements`) })
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publishNow, setPublishNow] = useState(true)
  const refresh = () => queryClient.invalidateQueries({ queryKey: key })
  const post = useMutation({
    mutationFn: () => api(`/api/seasons/${seasonId}/announcements`, { method: 'POST', json: { title, content, publish: publishNow } }),
    onSuccess: () => {
      setTitle('')
      setContent('')
      void refresh()
    },
  })
  const publish = useMutation({ mutationFn: (id: string) => api(`/api/announcements/${id}/publish`, { method: 'POST' }), onSuccess: refresh })

  if (!list.data || (!list.data.canPost && list.data.items.length === 0)) return null

  return (
    <>
      <h2>Announcements</h2>
      {list.data.items.map((a) => (
        <div key={a.id} className="card">
          <strong>{a.title}</strong>
          <p className="pre-wrap">{a.content}</p>
          <span className="hint">{a.isPublished ? formatDateTime(a.publishedAt) : 'Draft — only organizers can see this'}</span>
          {!a.isPublished && (
            <button type="button" className="secondary" disabled={publish.isPending} onClick={() => publish.mutate(a.id)}>
              Publish and notify players
            </button>
          )}
        </div>
      ))}
      {list.data.canPost && (
        <form
          className="card"
          onSubmit={(e) => {
            e.preventDefault()
            post.mutate()
          }}
        >
          <h2>Post an announcement</h2>
          <Field label="Title" required maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="field">
            <label htmlFor="content">Message</label>
            <textarea id="content" required maxLength={4000} rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <label className="radio">
            <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} />
            <span>Publish now and notify every player in the season</span>
          </label>
          <FormError error={post.error ?? publish.error} />
          <button type="submit" disabled={post.isPending}>
            {publishNow ? 'Publish' : 'Save draft'}
          </button>
        </form>
      )}
    </>
  )
}
