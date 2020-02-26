import React, { useState } from "react"

type props = {
  text: string[]
  onClick?: (event: any) => void
  active: string
}

const ToggleSwitch: React.FC<props> = props => {
  let textLength = props.text.length
  let longest = 0

  for (var i = 0; i < textLength; i++) {
    if (props.text[i].length >= longest) longest = props.text[i].length
  }

  const minWidth = longest * 16

  let clicked = `button py-2 px-4 focus:outline-none bg-primary text-on-surface hover:elevation-3 active:elevation-6`
  let defaultButton = `button py-2 px-4 focus:outline-none text-on-surface active:bg-primary hover:elevation-3 active:elevation-6`
  let rounding = ""

  let arr = []
  for (let x = 0; x < textLength; x++) {
    if (x === 0) {
      rounding = "rounded-l"
    } else if (x === textLength - 1) {
      rounding = "rounded-r"
    } else rounding = ""
    if (props.active === props.text[x])
      arr.push(
        <button
          style={{ width: minWidth }}
          type={"submit"}
          onClick={!props.onClick ? () => {} : props.onClick}
          className={clicked + ` ${rounding}`}
        >
          {props.text[x]}
        </button>
      )
    else
      arr.push(
        <button
          style={{ width: minWidth }}
          type={"submit"}
          onClick={!props.onClick ? () => {} : props.onClick}
          className={defaultButton + ` ${rounding}`}
        >
          {props.text[x]}
        </button>
      )
    if (x != textLength - 1)
      arr.push(<div className="border border-on-surface opacity-12"></div>)
  }

  return (
    <div className="bg-surface-elevation-2 elevation-2">
      <div className="flex justify-center">{arr}</div>
    </div>
  )
}

export default ToggleSwitch
