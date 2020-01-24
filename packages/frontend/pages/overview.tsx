import React, { useState } from 'react'
import { NextPage } from "next"
import Navigation from '../components/navigation'

const Sandbox: NextPage = () => {
  return (
    <div className="flex flex-wrap">
      <Navigation active="overview"></Navigation>
      <div className="flex-1 p-10 bg-surface content-center items-center justify-center text-center h-screen">
        <div className="w-full bg-surface-elevation-6 elevation-6 h-full rounded-lg">
        
        </div>
      </div>
    </div>
  )
}

export default Sandbox
