import * as React from "react"

type props = {
  value: string
}


const Amount: React.FC<props> = ({value}) => {
  return (
    <div>
      {(parseInt(value)/1000000).toFixed(6)} XRP
    </div>
  )
}

export default Amount
