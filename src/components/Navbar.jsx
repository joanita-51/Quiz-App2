import React from 'react'
import {TooltipComponent } from '@syncfusion/ej2-react-popups'
import {FiMenu} from 'react-icons/fi'
import {AiOutlineBell} from 'react-icons/ai'
import {IoMdArrowDropdown} from 'react-icons/io'
import profile from '../data/profile.jpg'
import { useStateContext } from './contexts/ContextProvider'

const Navbar = () => {
  const {activeMenu, setActiveMenu} = useStateContext()
  return (
    <div className='flex justify-between'>

      
      <TooltipComponent content='Menu' position='BottomCenter'>
        <button onClick={()=>setActiveMenu((prevActiveMenu)=> !prevActiveMenu)} className='text-sky-400 text-3xl'>
          <FiMenu/>
        </button> 
      </TooltipComponent>
        
 
      <TooltipComponent content='notifications' position='BottomCenter'>
        <button type='button' onClick={()=>{}} className=' text-sky-400 text-3xl'>

          <span className='absolute inline-flex rounded-full h-2 w-2 bg-sky-400'>  </span>
          <AiOutlineBell/>
  
        </button>
      </TooltipComponent>
      <TooltipComponent content='userProfile' position='BottomCenter'>
        <div className='flex items-center gap-2 p-1' onClick={()=>{}}>
          <img 
            className='rounded-full h-8 w-8' src={profile} alt="" 
          />
          <p>
            <span>Hi Joanita</span>
          </p>

          <IoMdArrowDropdown/>
        </div>
       
      </TooltipComponent>

    </div>
  )
}

export default Navbar