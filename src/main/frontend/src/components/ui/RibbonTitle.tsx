import type { ReactNode } from 'react'

interface RibbonTitleProps {
  children: ReactNode
  tone?: 'purple' | 'green' | 'amber' | 'blue'
}

export default function RibbonTitle({ children, tone = 'purple' }: RibbonTitleProps) {
  return <div className={`ribbon-title ribbon-${tone}`}>{children}</div>
}
