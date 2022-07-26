import React from 'react'
const Header = ({title , size}) => {
  return (

    <p className='text-3xl font-extrabold tracking-tight text-slate-900'>
      {title} <span>({size})</span>
    </p>
  
  )
}

export default Header