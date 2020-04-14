import React, { useState } from "react"

type props = {
  text: string[]
  onClick?: (event: any) => void
  active: string
}

const ToggleSwitch: React.FC<props> = props => {
  let textLength = props.text.length
  let longest = 0

  for (let i = 0; i < textLength; i++) {
    if (props.text[i].length >= longest) longest = props.text[i].length
  }

  const minWidth = longest * 16

  let clicked = `button py-2 px-4 focus:outline-none bg-primary text-on-surface hover:elevation-3 active:elevation-6 cursor-pointer`
  let defaultButton = `button py-2 px-4 focus:outline-none text-on-surface active:bg-primary hover:elevation-3 active:elevation-6 cursor-pointer`
  let rounding = ""

  const toggleSelected = (selected: string) => {
    if(props.onClick) {
      props.onClick(selected)
    }
  }

  let arr = []
  for (let x = 0; x < textLength; x++) {
    if (x === 0) {
      rounding = "rounded-l"
    } else if (x === textLength - 1) {
      rounding = "rounded-r"
    } else rounding = ""
    if (props.active === props.text[x])
      arr.push(
        <div
          key={props.text[x]}
          style={{ width: minWidth }}
          onClick={() => toggleSelected(props.text[x])}
          className={clicked + ` ${rounding}`}
        >
          {props.text[x]}
        </div>
      )
    else
      arr.push(
        <div
          key={props.text[x]}
          style={{ width: minWidth }}
          onClick={() => toggleSelected(props.text[x])}
          className={defaultButton + ` ${rounding}`}
        >
          {props.text[x]}
        </div>
      )
    if (x != textLength - 1)
      arr.push(<div key={x} className="border border-on-surface opacity-12"></div>)
  }

  return (
    <div className="bg-surface-elevation-2 elevation-2 rounded">
      <div className="flex justify-center">{arr}</div>
    </div>
  )
}

export default ToggleSwitch
