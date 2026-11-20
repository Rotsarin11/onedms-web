import { cn } from '@/lib/utils'

export type BadgeTone = 'ok' | 'bad' | 'draft' | 'plain'

const tones: Record<BadgeTone, string> = {
  ok: 'bg-ok-bg text-ok',
  bad: 'bg-bad-bg text-bad',
  draft: 'bg-draft-bg text-draft',
  plain: 'text-muted',
}

export function Badge({ tone, children, className }: { tone: BadgeTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-block rounded-[3px] px-2 py-0.5 text-sm leading-5 whitespace-nowrap', tones[tone], className)}>
      {children}
    </span>
  )
}
