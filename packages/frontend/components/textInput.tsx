import * as React from 'react'

type props = {
  style?: any;
  textColour?: string;
  borderColour?: string;
  bgColour?: string;
  disabled?: boolean;
  hint?: string;
  label?: string;
  defaultText?: string;
  maxWidth?: string;
  onKeyPress?: (event: any) => void
}

export const TextInput: React.FC<props> = (props) => {
  const textColour = props.textColour? props.textColour : 'on-surface'
  const borderColour = props.borderColour? props.borderColour : 'primary'
  const bgColour = props.bgColour? props.bgColour : 'surface'
  const maxWidth = props.maxWidth? props.maxWidth : 'xs'

  return (
    <div style={props.style} className={`bg-${bgColour} max-w-${maxWidth}`}>
      <div className={`textFieldOutline border-2 border-${borderColour} rounded`}>
      </div>
      <label className={props.label? `labeltest border-l-2 border-r-2 border-${bgColour} bg-${bgColour}`: `invisible`}>{props.label? props.label: ''}</label>
      <input type='text' className={`inputText focus:outline-none bg-${bgColour} text-${textColour}`} onKeyPress={props.onKeyPress? props.onKeyPress : () => {}}></input>
      <p className={props.hint? `assistiveText text-${textColour} w-full` : `invisible`}>{ props.hint }</p>
    </div>
  )
}

export const PasswordInput: React.FC<props> = (props) => {
  const textColour = props.textColour? props.textColour : 'on-surface'
  const borderColour = props.borderColour? props.borderColour : 'on-surface'
  const bgColour = props.bgColour? props.bgColour : 'surface'
  const maxWidth = props.maxWidth? props.maxWidth : 'xs'

  return (
    <div style={props.style} className={`bg-${bgColour} max-w-${maxWidth}`}>
      <div className={`textFieldOutline border border-${borderColour} opacity-12 rounded`}>
      </div>
      <input type='password' className={`inputText focus:outline-none bg-${bgColour} text-${textColour}`} onKeyPress={props.onKeyPress? props.onKeyPress : () => {}} placeholder={props.label}></input>
      <p className={`assistiveText text-${textColour} opacity-60 w-full`}>{ props.hint }</p>
    </div>
  )
}