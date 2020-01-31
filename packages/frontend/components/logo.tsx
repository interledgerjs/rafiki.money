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
          <rect x="284" y="540.132" width="300" height="300" transform="rotate(-45 284 540.132)"/>
        </g>
        <g>
          <circle cx="646.132" cy="540.132" r="150"/>
        </g>
      </svg>
    </div>
  )
}

export default Logo
