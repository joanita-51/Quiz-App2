import React,{useState, useEffect} from 'react'
import { Navbar,Header} from '../components'
import { notifications } from '../data/dummy'
import { MdOutlineCancel } from 'react-icons/md'
import Search from '../components/Search'

const filterNotifications = (searchValue) =>{
  if (searchValue === ""){
    return notifications;
  }
  return notifications.filter((notification) =>
    notification.name.toLowerCase().includes(searchValue.toLowerCase())
  )
}

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
  const [searchValue, setSearchValue] = useState('')

  //useEffect called whenever we change our search value
  useEffect(() => {
    const filteredNotifications = filterNotifications(searchValue)
    setdata(filteredNotifications);
  }, [searchValue])
  
  return (
    <div className='w-full'>
      <Navbar/>
      <div className='mt-9 ml-3 mr-5'>
        <div className='flex justify-between mb-3'>
          <Header title='Notifications' size={data.length} />
          <Search callback={(searchValue)=> setSearchValue(searchValue)}/>
        </div>

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