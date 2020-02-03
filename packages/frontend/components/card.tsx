import * as React from 'react'

type props = {
  navigation?: boolean
}

const Card: React.FC<props> = (props) => {
  let className = 'p-4 bg-surface-elevation-6 elevation-6 rounded text-on-surface overline'
  // if (props.navigation) className += ' ml-32'
  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

export default Card
