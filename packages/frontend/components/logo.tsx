import * as React from 'react'

type props = {
  height: number
  mono?: boolean // TODO: implement black/white version.
}

const Logo: React.FC<props> = (props) => {
  return (
    <div className="logo">
      <svg width={props.height} height={props.height} viewBox="0 0 584 584" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
          <circle cx="409" cy="292" r="150"/>
        </g>
        <g>
          <rect x="25" y="243" width="270" height="270" transform="rotate(-30 25 243)"/>
        </g>
      </svg>
    </div>
  )
}

export default Logo
