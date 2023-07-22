import React, { useState,useEffect } from 'react'
import { Navbar } from '../components'
import {GrFormAdd} from 'react-icons/gr'
import {RiDeleteBinFill} from 'react-icons/ri'
import {BsFillBookFill} from 'react-icons/bs'
import { courses } from '../data/dummy'
import Search from '../components/Search'
import { Link } from 'react-router-dom'

const filterCourses = (searchValue) =>{
  if(searchValue === ""){
    return courses;
  }
  return courses.filter((course)=>
    course.coursename.toLowerCase().includes(searchValue.toLowerCase()) ||
    course.code.toLowerCase().includes(searchValue.toLowerCase()) ||
    course.update.toLowerCase().includes(searchValue.toLowerCase()) 
  )
}

const Dashboard = () => {
  const [data, setData] = useState(courses)
  const [addCourse, setaddCourse] = useState(false);

  //For unenrolling a particular course
  const handleDelete = (index)=>{
      setData(current =>
        current.filter((course)=>(course !== index))
      )
  }

  //For searching
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    const filteredCourses = filterCourses(searchValue)
    setData(filteredCourses)
  }, [searchValue])

  //Adding a particular course
  const [inputs, setInputs] = useState({})
 
  const handleSubmit =(e)=>{
    e.preventDefault();
    //add item
    const newCourse = data.concat(inputs);
    setData(newCourse)
    console.log(inputs)
    setaddCourse(false)
    
  }

  return (
    
    <div >
      <Navbar/>
      <div className='flex justify-between items-center mt-11 ml-3 mr-3 '>
        <h2 className='text-xl'>All Courses Enrolled ({data.length}) </h2>
        <Search callback={(searchValue)=>setSearchValue(searchValue)} />

        <div className='mr-5 bg-blue-900 rounded-3xl drop-shadow-lg' >
          <button  className='flex items-center  text-white py-2 w-44 px-2' onClick={()=>{setaddCourse((prev)=>!prev)}} >
           <GrFormAdd className='bg-white rounded-full ml-1'/>
          <p className='pl-2'> Add New Course</p>
          </button>
        </div>
       
      </div>
      {
        addCourse?(
        <div className='m-5'>
          <form onSubmit={handleSubmit} >
            <label>Course Name:
              <input 
                type="text" 
                name='coursename' 
                className='mr-5 ml-2'
               onChange={(event)=>{setInputs({...inputs, coursename:event.target.value})}}
              />
            </label> 
            
            <label>Course Code:
              <input
               type="text" 
               name='code' 
               className='mr-5 ml-2'
               onChange={(event)=>{setInputs({...inputs, code:event.target.value})}}
              />
            </label>
            
            <button type='submit' className='bg-blue-900 text-white rounded-md px-3 py-1' >
              Add
            </button>
          </form>
        </div>
        ):(
        <div>

        </div>)
      }



      <div className="grid grid-cols-2 gap-7 ml-3 mt-11 mr-6">
        {data.map((course,index)=>(
          <div key={index} className='bg-white p-3 drop-shadow-sm rounded-lg'>
            <p className='mb-3 '>Course Name : <span className='ml-3'>{course.coursename}</span> </p>
            <p className='mb-3'>Course Code  : <span className='ml-3'>{course.code}</span> </p>
            <p className='mb-3'>Updated On : <span className='ml-5'>{course.update}</span> </p>
            <div className='flex gap-3 mt-2 justify-between mr-6'>
              <Link to='/view'>
                <div className='bg-blue-900 rounded-md drop-shadow-lg'>
                  <button  
                  className='flex items-center  text-white py-2 px-5'
                  
                  >
                    <BsFillBookFill/>
                    <p className='pl-2'>View</p>
                  </button>
              </div>
              </Link>
 
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