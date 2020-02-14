import * as React from 'react'
import { useState } from 'react'
import Logo from './logo'

type props = {
  active: string
}

const Navigation: React.FC<props> = (props) => {
  let [dis, setDis] = useState()
  const navItems = [
    {
      name: 'overview',
      icon: 'dashboard' 
    },
    {
      name: 'mandates',
      icon: 'description' 
    },
    {
      name: 'settings',
      icon: 'settings' 
    },
  ]
  return (
    <div>
      <div className="flex z-50 left-0 bottom-0 h-16 md:h-32 w-full md:top-0 md:h-full md:w-32 fixed bg-surface">
        <div className="flex flex-wrap content-center text-center justify-center items-center left-0 bottom-0 md:top-0 md:w-32 bg-surface w-full md:h-full elevation-8 bg-surface-elevation-8 md:elevation-0 md:bg-surface">
          <div className="hidden md:flex flex-wrap w-full h-32 content-center text-center justify-center">
            <Logo height={50}/>
          </div>
          {navItems.map(element => {
            return(<div onClick={() => { window.location.href = element.name}} key={element.name} className={`cursor-pointer flex flex-wrap w-24 h-full md:w-full md:h-32 content-center text-center justify-center hover:bg-primary-100 text-${props.active === element.name ? 'primary' : 'on-surface'} hover:text-surface`}>
              <i className={`material-icons w-full`}>{element.icon}</i>
              <p className="hidden md:flex button pt-3">{ props.active === element.name ? element.name : '' }</p>
            </div>)
          })}
        </div>
        <div className="border-t md:border-r border-on-surface opacity-12 top-0 md:h-full"/>
      </div>
    </div>
  )
}

export default Navigation
