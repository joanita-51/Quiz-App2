import React from 'react'
import { Navbar,Header } from '../components'
import { notifications } from '../data/dummy'
import { MdOutlineCancel } from 'react-icons/md'

const Notifications = () => {
  return (
    <div className='w-full'>
      <Navbar/>
      <div className='mt-9 ml-3 mr-5'>
        <Header title='Notifications' size={(Object.keys(notifications)).length} />
        {
          notifications.map((notification,index)=>(
            <div className=' flex justify-between bg-white drop-shadow-sm rounded-md mb-2 py-7 pl-4'>
              {notification.content}
              <button type='button' 
                onClick={()=>{}} 
                className='text-2xl block p-3 '
              >
                <MdOutlineCancel/>
              </button>
              
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Notifications