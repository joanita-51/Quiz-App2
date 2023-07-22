import React, { useState } from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Button, Footer, Header, Navbar, Sidebar, UserProfile} from './components';
import SidebarLayout from './components/SidebarLayout';
import {Dashboard, Landing, Login, Logout, Notifications, Profile, Results, SignUp} from './pages'
import './App.css'

import {useStateContext} from './components/contexts/ContextProvider';
import View from './pages/View';
import Quiz from './pages/Quiz';

function App() {
  const {activeMenu} = useStateContext()
  const {isLoggedIn} = useStateContext()
 
  return (
    <BrowserRouter>
      <div className='flex bg-[#10316B]'>
   
        <Routes>
          <Route element={<SidebarLayout/>}>
            {/* Dashboard pages */}
            <Route path='/Dashboard' element={<Dashboard/>}/>
            <Route path='/Results' element={<Results/>}/>
            <Route path='/Notifications' element={<Notifications/>}/>
            <Route path='/Profile' element={<Profile/>}/>
            <Route path='/Logout' element={<Logout/>}/>
            <Route path = '/Navbar' element = {<Navbar/>}/>
            <Route path='/view' element={<View/>}/>
          </Route>

          <Route path='/' element={<Landing/>}/>
          <Route path='/signup' element={<SignUp/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/quiz' element={<Quiz/>}/>
         
        
        </Routes>
      </div>

    </BrowserRouter>
 
  );
}

export default App;
