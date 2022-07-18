import React, { useState } from 'react'
import { Navbar } from '../components'
import {BiSearch} from 'react-icons/bi'
import {GrFormAdd} from 'react-icons/gr'
import {RiDeleteBinFill} from 'react-icons/ri'
import {BsFillBookFill} from 'react-icons/bs'
import { courses } from '../data/dummy'

const Dashboard = () => {
  const [data, setData] = useState(courses)
  const handleDelete = (code)=>{
      setData(data.filter((course)=> course.code !== code))
  }
  return (
    
    <div className='w-full'>
      <Navbar/>
      <div className='flex justify-between items-center mt-11 ml-3 mr-3 '>
        <h2 className='text-xl'>All Courses Enrolled </h2>
        <div className='bg-white drop-shadow-sm rounded-lg'>
          <button  className='flex  py-2 w-96  items-center p-3  justify-between'>
            <p>Search</p>
            
            <BiSearch />
          </button>
        </div>

        <div className='mr-5 bg-blue-900 rounded-3xl drop-shadow-lg'>
          <button  className='flex items-center  text-white py-2 w-44 px-2'>
           <GrFormAdd className='bg-white rounded-full ml-1'/>
          <p className='pl-2'> Add New Course</p>
          </button>
        </div>
       
      </div>

      <div className="grid grid-cols-2 gap-7 ml-3 mt-11 mr-6">
        {data.map((course)=>(
          <div className='bg-white p-3 drop-shadow-sm rounded-lg'>
            <p className='mb-3 '>Course Name : <span className='ml-3'>{course.name}</span> </p>
            <p className='mb-3'>Course Code  : <span className='ml-3'>{course.code}</span> </p>
            <p className='mb-3'>Updated On : <span className='ml-5'>{course.update}</span> </p>
            <div className='flex gap-3 mt-2 justify-between mr-6'>
              <div className='bg-blue-900 rounded-md drop-shadow-lg'>
                <button  className='flex items-center  text-white py-2 px-5'>
                  <BsFillBookFill/>
                  <p className='pl-2'>View</p>
                </button>
              </div>
                <div className='bg-red-600 rounded-md drop-shadow-lg'>
                  <button  
                    className='flex items-center  text-white py-2 px-3'
                    onClick={()=>handleDelete(course)}
                    >
                    <RiDeleteBinFill/>
                    <p className='pl-2'>Unenroll</p>
                  </button>
                  </div>
              </div>
        
          </div>
        ))}

      </div>
    </div>
  )
}

export default Dashboard