import * as React from 'react'

type props = {
  // type: string
  style: any
  textColour?: string
  borderCoulour?: string
  disabled?: boolean
  hint?: string
  label?: string
  defaultText?: string
  onKeyPress?: (event: any) => void
}

const TextInput: React.FC<props> = (props) => {
  let className: string = ''
  return (
    <div style={props.style} className="bg-surface">
      <div className="topBorder"></div>
      <div className="topBorderMask"></div>
      <div className="textFieldOutline border-2 border-primary rounded">
        <div className="label"></div>
        <div className="surface"></div>
        <div className=""></div>
      </div>
      <label className="labeltest border-l-2 border-r-2 border-surface bg-surface
      ">{props.label? props.label: ''}</label>
      <input type="text" className="inputText focus:outline-none bg-surface"></input>
      <p className="assistiveText">{ props.hint }</p>
    </div>
  )
}

export default TextInput