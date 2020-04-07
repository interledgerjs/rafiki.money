import * as React from 'react'

type props = {
  width ?: string // Allows card's width to be set. Setting w-full will stretch the card to full width of container
  className?: string
  flat?: boolean
}

const Card: React.FC<props> = (props) => {
  let className = 'p-4 bg-surface rounded text-on-surface sm:max-w-full md:'
  className += props.width || 'w-card'
  className += props.className ?  ' ' + props.className : ''
  className += props.flat ?  '' : ' elevation-1'
  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

export default Card
