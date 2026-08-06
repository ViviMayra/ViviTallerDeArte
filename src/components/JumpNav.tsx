'use client'

type Item = {id: string; label: string}

export function JumpNav({items, label}: {items: Item[]; label: string}) {
  if (!items.length) return null

  return (
    <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-4 py-3 md:px-8">
      <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="nav-link shrink-0"
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}
