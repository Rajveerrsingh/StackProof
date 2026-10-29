export function Loading({ label = 'Loading the board' }: { label?: string }) {
  return (
    <div className="state" role="status">
      <span className="seal seal-sm pulse" aria-hidden="true">
        <strong>—</strong>
        <span>Proof</span>
      </span>
      <p>{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="state error" role="alert">
      <h2>That didn’t load</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn ghost" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="state">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  )
}
