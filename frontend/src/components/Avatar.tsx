const COLORS = ['#0c66e4', '#1f845a', '#6e5dc6', '#c9372c', '#b65c02', '#0b7285']

export default function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return (
    <span
      className="avatar"
      title={name}
      style={{
        background: COLORS[hash % COLORS.length],
        width: size,
        height: size,
        fontSize: size * 0.42,
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}