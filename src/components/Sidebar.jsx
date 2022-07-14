import React from 'react'
import {MdOutlineCancel} from 'react-icons/md'
import { NavLink, Link} from 'react-router-dom'
import { links } from '../data/dummy'
import logo from '../data/logo.png'

const Sidebar = () => {
  const activeMenu = true;
  const activeLink = 'text-white font-bold flex items-center gap-5 pl-4 pt-3 pb-3 text-2xl';
  const normalLink = 'text-slate-200 flex items-center gap-5 pl-4 pt-3 pb-3 text-2xl hover:bg-violet-700 rounded-lg'
  return (
    <div className='h-screen overflow-auto pb-10 w-72 bg-blue-700'>
      {activeMenu && (<>
        <div className='flex items-center justify-between mt-5 ml-4'>
          <Link to='/dashboard' onClick={()=>{}}>
            <img src={logo} alt=" Logo" className='w-64' />
          </Link>
          {/* <button type='button' onClick={()=>!activeMenu} className='text-xl ml-0'>
            <MdOutlineCancel/>
          </button> */}
        </div>

        <div className='mt-10'>
          {
            links.map((item)=>(
              <div key={item.title}>

                {item.links.map((link)=>(
                  <NavLink
                    to={`/${link.name}`}
                    key={link.name}
                    className={({isActive})=>(isActive? activeLink:normalLink)}
                  >
                    {link.icon}
                    <span>{link.name}</span>
                  </NavLink>
                ))}

              </div>
            ))
          }
        </div>
      </>)}
    </div>
  )
}

export default Sidebar