import React,{useState} from 'react'
import { Navbar,Header} from '../components'
import { notifications } from '../data/dummy'
import { MdOutlineCancel } from 'react-icons/md'

const Notifications = () => {

  //state for the deletion of items
  const [data, setdata] = useState(notifications)
  const handleDelete = (index)=>{
    setdata(current=>
      current.filter((notification)=>(notification !== index )
        
      )
    )
    
  }

  //Search functionality
  return (
    <div className='w-full'>
      <Navbar/>
      <div className='mt-9 ml-3 mr-5'>

        <Header title='Notifications' size={data.length} />
        {
          data.map((notification,index)=>(
            <div key={index} className=' flex justify-between bg-white drop-shadow-sm rounded-md mb-2 py-7 pl-4'>
              {notification.name}
              <button type='button' 
                onClick={()=>handleDelete(notification)} 
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