import * as React from 'react'

type props = {
  navigation?: boolean
}

const Content: React.FC<props> = (props) => {
  let className = 'flex-1 p-10 sm:h-screen container xl:mx-auto'
  if (props.navigation) className += ' pb-16 sm:pb-10 md:pl-40 xl:px-20'
  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

export default Content
