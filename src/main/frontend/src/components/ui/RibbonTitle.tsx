import type { ReactNode } from 'react'

interface RibbonTitleProps {
  children: ReactNode
  tone?: 'purple' | 'green' | 'amber' | 'blue'
  textColor?: 'dark' | 'light'
}

export default function RibbonTitle({ children, tone = 'purple', textColor = 'dark' }: RibbonTitleProps) {
  return <div className={`ribbon-title ribbon-${tone}${textColor === 'light' ? ' ribbon-title-light' : ''}`}>{children}</div>
}
