export function ProofSeal({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`seal seal-${size}`} aria-label={`Proof score ${value}`}>
      <strong>{value}</strong>
      <span>Proof</span>
    </div>
  )
}
