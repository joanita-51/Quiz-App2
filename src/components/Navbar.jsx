import React from 'react'
import {TooltipComponent } from '@syncfusion/ej2-react-popups'
import {FiMenu} from 'react-icons/fi'
import {AiOutlineBell} from 'react-icons/ai'
import {IoMdArrowDropdown} from 'react-icons/io'
import profile from '../data/profile.jpg'
import flag from '../data/Quiz App/flag/UM.png'
import { useStateContext } from './contexts/ContextProvider'

const Navbar = () => {
  const {activeMenu, setActiveMenu} = useStateContext()
  return (
    <div className=' w-full h-24 sticky top-0 z-auto bg-white drop-shadow-sm'>

      <div className='h-full flex justify-between items-center'>
        
          <TooltipComponent content='Menu' position='BottomCenter'>
            <button onClick={()=>setActiveMenu((prevActiveMenu)=> !prevActiveMenu)} className='text-sky-400 text-3xl ml-2'>
              <FiMenu/>
            </button> 
          </TooltipComponent>
        
  
        <div className='flex items-center'>
          <TooltipComponent content='English language' position= 'BottomCenter'>
            <img  className='h-5 mr-5' src={flag}alt="English"/>
          </TooltipComponent>
       
          <TooltipComponent content='notifications' position='BottomCenter'>
            <button type='button' onClick={()=>{}} className=' text-sky-400 text-3xl relative mr-3 pt-1'>

              <span className='absolute flex rounded-full h-3 w-3 inset-x-0.5 bg-sky-400'> </span>
              <AiOutlineBell/>
    
            </button>
          </TooltipComponent>
          <TooltipComponent content='userProfile' position='BottomCenter'>
            <div className='flex items-center gap-2 p-1 mr-5 cursor-pointer' onClick={()=>{}}>
              <img 
                className='rounded-full h-7 w-7' src={profile} alt="" 
              />
              <p>
                <span>Joanita</span>
              </p>

              <IoMdArrowDropdown/>
            </div>
          
          </TooltipComponent>
        </div>

      </div>
      

    </div>
  )
}

export default Navbar