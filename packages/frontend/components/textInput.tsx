import * as React from 'react'

type props = {
  inputType?: 'text'|'password'|'email';
  inputRef?: any;
  name: string;
  style?: any;
  textColour?: string;
  blurColour?: string;
  bgColour?: string;
  disabled?: boolean;
  hint?: string;
  label?: string;
  defaultText?: string;
  maxWidth?: string;
  onKeyPress?: (event: any) => void
}

const TextInput: React.FC<props> = (props) => {
  const textColour = props.textColour? props.textColour : 'on-surface'
  const blurColour = props.blurColour? props.blurColour : 'on-surface-trans'
  const focusColour = 'primary'
  const bgColour = props.bgColour? props.bgColour : 'surface'
  const maxWidth = props.maxWidth? props.maxWidth : 'xs'
  const inputType = props.inputType? props.inputType: 'text'

  const [focussed, setFocussed] = React.useState(false)

  return (
    <div style={props.style} className={`bg-${bgColour} max-w-${maxWidth}`}>

      <div 
        className={`textFieldOutline border${focussed? '-2': ''} border-${focussed? focusColour: textColour + ' opacity-12'} rounded`}>
      </div>

      <label 
        className={props.label? `${focussed? 'toLabel inputLabel': 'toPlaceHolder inputText'} text-${focussed? focusColour: blurColour} border-l-2 border-r-2 border-${bgColour} bg-${bgColour}`: `invisible `}>
        {props.label? props.label: ''}
      </label>

      <input 
        onFocus={() => {setFocussed(true)}} onBlur={() => {setFocussed(false)}} ref={props.inputRef? props.inputRef: undefined} name={props.name} type={inputType} className={`inputText focus:outline-none bg-transparent text-${textColour} max-w-${maxWidth} w-5/6 focus:`} onKeyPress={props.onKeyPress? props.onKeyPress : () => {}}>
      </input>

      <p 
        className={props.hint? `assistiveText text-${focussed? focusColour: blurColour} w-full` : `invisible`}>
        { props.hint }
      </p>

    </div>
  )
}

export default TextInput
