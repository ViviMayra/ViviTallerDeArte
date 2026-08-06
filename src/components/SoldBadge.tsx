export function SoldBadge({label}: {label: string}) {
  return (
    <span className="pointer-events-none absolute left-3 top-3 z-10 bg-foreground/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-background">
      {label}
    </span>
  )
}
