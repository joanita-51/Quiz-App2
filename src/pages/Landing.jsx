import React from 'react'
import hero from '../data/background1.jpg'
import logo from '../data/logo.png'
import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className=" bg-gradient-to-r from-violet-500 to-fuchsia-500">
      <nav className="relative px-2 py-3  bg-blue-700 mb-0">
        <div className="container px-4 mx-auto flex items-center justify-between text-white font-semibold text-2xl">
          <img src={logo} alt='logo' className='w-64'/>
          <div>
            
            <span className="ml-2 ">
              <Link to='/login'>
                <button className="outline outline-offset-2 outline-1 w-24 shadow-lg rounded-sm focus:-translate-y-1 hover:bg-blue-600 ">Log In</button>
              </Link>
            </span>

            <span className="ml-10">
              <Link to='/signup'>
                <button className="outline outline-offset-2 outline-1 w-24 shadow-lg rounded-sm focus:-translate-y-1 hover:bg-blue-600">Sign Up</button>
              </Link>  
            </span>

          </div>
        </div>
      </nav>
      <div className="grid grid-cols-2 gap-4 pl-16 text-xl  text-white ">
        <div className='mr-5 mt-20 '>
          Quizote is an online quizz web application for both teachers and students.<br />
          For students, find quiz friendly questions to test your mind and teachers, find out the area that needs more focus <br />

          <Link to = '/quiz'>
          <button className="outline outline-offset-1 outline-1 p-2 shadow-lg rounded-sm focus:-translate-y-1 bg-blue-700 hover:bg-blue-600 mt-16 mb-28 ">Get Started</button>
          </Link>
          
        </div>
        
        <img src={hero} alt='logo' className='rounded-md shadow-xl mt-5 mb-5' />
      </div>

      <div>
      
      </div>
      
     
      {/* background image failed */}
      {/* <div className="bg-cover bg-no-repeat bg-center h-14 w-48" style={{backgroundImage:{hero}}}></div> */}
    
      
    </div>
  )
}

export default Landing