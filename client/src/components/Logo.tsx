import { Crown } from 'lucide-react'

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const crownSize = size === 'lg' ? 40 : size === 'sm' ? 20 : 28
  const titleSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg'
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 border border-white/10">
        <Crown size={crownSize} className="text-accent" />
      </div>
      <div className="leading-tight">
        <div className={`font-bold tracking-wider text-white ${titleSize}`}>MONARCH PREDICTOR</div>
        <div className="text-[10px] tracking-widest text-muted">VIRTUAL FOOTBALL · PLAY SMARTER</div>
      </div>
    </div>
  )
}
