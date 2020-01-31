import * as React from 'react'
import { useState } from 'react'
import Logo from './logo'

type props = {
  active: string
  // to: string
  // bgColour?: string
  // textColour?: string
  // disabled?: boolean
  // onTap: (event: any) => void
}

const Navigation: React.FC<props> = (props) => {
  let [dis, setDis] = useState()
  const navItems = [
    {
      name: 'overview',
      icon: 'dashboard' 
    },
    {
      name: 'wallet',
      icon: 'account_balance_wallet' 
    },
    {
      name: 'account',
      icon: 'person' 
    },
    {
      name: 'settings',
      icon: 'settings' 
    },
  ]
  return (
    <div>
      <div className="flex left-0 top-0 h-full w-32 fixed">
        <div className="cursor-pointer flex flex-wrap content-center text-center justify-center left-0 top-0 w-32 bg-surface h-full">
          <div className="flex flex-wrap w-full h-32 content-center text-center justify-center">
            <Logo height={80}/>
          </div>
          {navItems.map(element => {
            return(<div onClick={() => { window.location.href = element.name}} key={element.name} className={`flex flex-wrap w-full h-24 content-center text-center justify-center hover:bg-primary-100 text-${props.active === element.name ? 'primary' : 'on-surface'} hover:text-surface`}>
              <i className={`material-icons w-full`}>{element.icon}</i>
              <p className="button pt-3">{ props.active === element.name ? element.name : '' }</p>
            </div>)
          })}
        </div>
        <div className="border-r border-on-surface opacity-12 top-0 h-full"/>
      </div>
    </div>
  )
}

export default Navigation
