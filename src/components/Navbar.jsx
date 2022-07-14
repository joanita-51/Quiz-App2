import React from 'react'
import {TooltipComponent } from '@syncfusion/ej2-react-popups'
import {FiMenu} from 'react-icons/fi'
import profile from '../data/profile.jpg'
const NavButton = ({title, customFunc, icon})=>{
  <TooltipComponent content={title} position='BottomCenter'>
    <button type='button' onClick={customFunc}>
      {icon}
    </button>
  </TooltipComponent>
}

const Navbar = () => {
  return (
    <div className='flex justify-between'>
  
      <FiMenu/>
      <button className='bg-blue-200'> View Institution Page</button>
      <div className='flex items-center gap-2 p-1'>
        <img 
          className='rounded-full h-8' src={profile} alt="" 
        />
        <p>
          <span>Hi Joanita</span>
        </p>
      </div>

    </div>
  )
}

export default Navbar