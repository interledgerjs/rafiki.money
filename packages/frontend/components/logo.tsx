import * as React from 'react'

type props = {
  height: number
  mono?: boolean // TODO: implement black/white version.
}

const Logo: React.FC<props> = (props) => {
  return (
    <div className="logo">
      <svg width={props.height} height={props.height} viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g>
          <rect x="273" y="491" width="270" height="270" transform="rotate(-30 273 491)"/>
        </g>
        <g>
          <circle cx="657" cy="540" r="150"/>
        </g>
      </svg>
    </div>
  )
}

export default Logo
