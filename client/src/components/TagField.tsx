import { useState } from 'react'

type TagFieldProps = {
  label: string
  hint: string
  suggestions: string[]
  values: string[]
  onChange: (values: string[]) => void
  error?: string
  placeholder: string
}

export function TagField({ label, hint, suggestions, values, onChange, error, placeholder }: TagFieldProps) {
  const [draft, setDraft] = useState('')

  function add(raw: string) {
    const tag = raw.trim().replace(/\s+/g, ' ')
    if (!tag) return
    if (values.some((value) => value.toLowerCase() === tag.toLowerCase())) {
      setDraft('')
      return
    }
    onChange([...values, tag])
    setDraft('')
  }

  function toggle(tag: string) {
    if (values.some((value) => value.toLowerCase() === tag.toLowerCase())) {
      onChange(values.filter((value) => value.toLowerCase() !== tag.toLowerCase()))
      return
    }
    add(tag)
  }

  return (
    <div className={error ? 'field invalid' : 'field'}>
      <span className="label">{label}</span>
      <p className="hint">{hint}</p>
      <div className="suggest" role="group" aria-label={label}>
        {suggestions.map((suggestion) => {
          const on = values.some((value) => value.toLowerCase() === suggestion.toLowerCase())
          return (
            <button
              key={suggestion}
              type="button"
              className={on ? 'chip on' : 'chip'}
              aria-pressed={on}
              onClick={() => toggle(suggestion)}
            >
              {suggestion}
            </button>
          )
        })}
      </div>
      <div className="tag-entry">
        <input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add(draft)
            }
          }}
          aria-label={`Add a custom ${label.toLowerCase()}`}
        />
        <button type="button" className="btn ghost" onClick={() => add(draft)}>
          Add
        </button>
      </div>
      {values.length > 0 && (
        <ul className="picked">
          {values.map((value) => (
            <li key={value}>
              {value}
              <button type="button" onClick={() => onChange(values.filter((item) => item !== value))} aria-label={`Remove ${value}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
