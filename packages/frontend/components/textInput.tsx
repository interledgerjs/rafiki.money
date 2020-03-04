import * as React from 'react'

type props = {
  inputType?: 'text'|'password'|'email'
  className?: string
  errorState?: boolean
  inputRef?: any
  name: string
  style?: any
  textColour?: string
  blurColour?: string
  bgColour?: string
  disabled?: boolean
  hint?: string
  label?: string
  defaultText?: string
  maxWidth?: string
  onKeyPress?: (event: any) => void
  validationFunction?: (e: any) => void
}

const TextInput: React.FC<props> = (props) => {
  const textColour = props.textColour? props.textColour : 'on-surface'
  let blurColour = props.blurColour? props.blurColour : 'on-surface-trans'
  let focusColour = 'primary'
  const bgColour = props.bgColour? props.bgColour : 'surface'
  const maxWidth = props.maxWidth? props.maxWidth : 'xs'
  const inputType = props.inputType? props.inputType: 'text'
  if (props.errorState) {
    blurColour = 'error'
    focusColour = 'error'
  }

  const [value, setValue] = React.useState('')
  const [focussed, setFocussed] = React.useState(false)

  return (
    <div style={props.style} className={`bg-${bgColour} max-w-${maxWidth} ${props.className} relative h-18 my-5`}>

      <div 
        className={`left-0 right-0 top-0 h-inputBox border${focussed||props.errorState? '-2': ''} border-${focussed||props.errorState? focusColour: textColour + ' opacity-12'} rounded`}>
      </div>

      <label 
        className={props.label? `${focussed? (value==''?'toLabel inputLabel':'inputLabel'): (value==''?'toPlaceHolder inputText':'inputLabel')} text-${focussed? focusColour: blurColour} border-l-2 border-r-2 border-${bgColour} bg-${bgColour}`: `invisible `}>
        {props.label? props.label: ''}
      </label>

      <input 
        onFocus={() => {setFocussed(true)}} onBlur={() => {setFocussed(false)}} ref={props.inputRef? props.inputRef: undefined} name={props.name} type={inputType} className={`inputText focus:outline-none bg-transparent text-${textColour} max-w-${maxWidth} w-5/6 focus:`} onKeyPress={props.onKeyPress? e => props.onKeyPress(e) : () => {}} onChange={e => {setValue(e.target.value);if (props.validationFunction) props.validationFunction(e)}}>
      </input>

      <p 
        className={props.hint? `assistiveText text-${focussed? focusColour: blurColour} w-full` : `invisible`}>
        { props.hint }
      </p>

    </div>
  )
}

export default TextInput
