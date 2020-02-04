import * as React from 'react'

type props = {
  navigation?: boolean
}

const Content: React.FC<props> = (props) => {
  let className = 'flex-1 p-10 h-screen'
  if (props.navigation) className += ' md:ml-32'
  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

export default Content
