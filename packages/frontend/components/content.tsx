import * as React from 'react'

type props = {
  navigation?: boolean,
  name?: string
}

const Content: React.FC<props> = (props) => {
  let className = 'flex-1 p-10 h-screen'
  if (props.name) className += ' ' + props.name
  if (props.navigation) className += ' md:ml-32'
  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

export default Content
