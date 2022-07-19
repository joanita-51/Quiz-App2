import React from 'react'
import { BiSearch } from 'react-icons/bi'

const Header = ({title , size}) => {
  return (
    <div className='flex justify-between'>
      <p className='text-3xl font-extrabold tracking-tight text-slate-900'>
        {title} <span>({size})</span>
      </p>
      <div className='bg-white drop-shadow-sm rounded-lg mb-2'>
        <div  className='flex  py-2 w-96  items-center p-3  justify-between'>
          <input  placeholder='Search'/>
            
          <BiSearch className='cursor-pointer' />
        </div>
        </div>
    </div>
  )
}

export default Header