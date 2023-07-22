import React from 'react'
import hero from '../data/hero.png'
import logo from '../data/icon.png'
import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className=" bg-[#10316B] w-full h-screen">
      <nav className="px-10 py-10 ">
        <div className="container px-4 mx-auto flex items-center justify-between text-white">
          {/* <img src={logo} alt='logo' className=''/> */}

          <div className='font-bold text-[30px]'>
            <p><span>QuiZ</span><span className='text-[#f57328]'>ote</span></p>
          </div>

            <div className='flex gap-16 '>
              <p>ABOUT</p>
              <p>FAQ</p>
              <p>CONTACT</p>
            </div>

            <span className="ml-2 ">
              <Link to='/login'>
                <button className="w-24 p-2 shadow-lg rounded-lg focus:-translate-y-1 bg-[#3f8521] hover:bg-[#f57328]">Log In</button>
              </Link>
            </span>
            
            
            {/* <span className="ml-10">
              <Link to='/signup'>
                <button className="outline outline-offset-2 outline-1 w-24 shadow-lg rounded-sm focus:-translate-y-1 hover:bg-blue-600">Sign Up</button>
              </Link>  
            </span> */}


        </div>
      </nav>
      <div className="grid grid-cols-3 gap-4 pl-16 text-xl  text-white ">
        <div className=''>
          <div className='mt-20 mb-20 font-bold'>
            <p className='text-[40px] pb-5'>Unlock <span className='text-[#f57328]'>Knowledge,</span></p> 
            <p className='text-[50px] pt-5'>Empower <span className='text-[#4FA929]'>Minds</span></p>
          </div>
          <div ld>
            <p className='leading-10'>Your ultimate app designed to ignite curiosity <span className='font-bold'>&</span> <br />
             fuel the pursuit of knowledge.</p>
          </div>

          <Link to = '/quiz' >
          <button className="w-32 p-2 shadow-lg rounded-lg focus:-translate-y-1 bg-[#3f8521] hover:bg-[#f57328] mt-5">Get Started</button>
          </Link>
          
        </div>
        <div className='col-span-2'>
          <img src={hero} alt='logo' className='w-full' />
        </div>

      </div>

      <div>
      
      </div>
      
     
      {/* background image failed */}
      {/* <div className="bg-cover bg-no-repeat bg-center h-14 w-48" style={{backgroundImage:{hero}}}></div> */}
    
      
    </div>
  )
}

export default Landing