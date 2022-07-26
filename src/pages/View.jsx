import React from 'react'
import { Navbar } from '../components'
import { Link } from 'react-router-dom'

const View = () => {
  return (
    <div className='w-full'>
        <Navbar/>
        <h1 className='mt-5 flex justify-center'>Upcoming Quizzes</h1>
        <div className='grid grid-cols-2 gap-7 '>
            <div className='bg-white rounded-lg drop-shadow-md m-5 p-5'>
                <p className='mb-3'>Topic: <span className='ml-3'>General Knowledge</span> </p>
                <p className='mb-3'>Due: <span className='ml-5 '>10 Oct, 2022</span> </p>
                <p className='mb-3'>Status: <span className='ml-3'>Not attempted</span></p>
                <button className='bg-lime-600 text-white rounded-md p-1 '>Take quiz</button>
            </div>
            <div className='bg-white rounded-lg drop-shadow-md m-5 p-5'>
                <p className='mb-3'>Topic: <span className='ml-3'>General Knowledge</span> </p>
                <p className='mb-3'>Due: <span className='ml-5 '>10 Oct, 2022</span> </p>
                <p className='mb-3'>Status: <span className='ml-3'>Not attempted</span></p>
                <button className='bg-lime-600 text-white rounded-md p-1'>Take quiz</button>
            </div>
        </div>
        <h1 className='mt-5 flex justify-center'>Your Course Results </h1>
        <div className='grid grid-cols-2 gap-7 m-5'>
            <p>Total Number of Quizzes done : 5/5 </p>
            <p>Total score for the Quizzes done : 95/100 </p>
            <p>Percentage Score: 95%</p>
        </div>
        <Link to='/Results'>
            <div className='flex justify-center'>
                <button className='bg-lime-600 text-white rounded-md p-1'>View More</button>
            </div>
        </Link>


    </div>
  )
}

export default View