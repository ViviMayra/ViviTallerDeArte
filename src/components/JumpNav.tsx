'use client'

type Item = {id: string; label: string}

export function JumpNav({items, label}: {items: Item[]; label: string}) {
  if (!items.length) return null

  return (
    <div className="sticky top-[73px] z-20 border-b border-line bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-4 py-3 md:px-8">
        <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-muted">
          {label}
        </span>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-foreground hover:text-ochre-deep"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  )
}
