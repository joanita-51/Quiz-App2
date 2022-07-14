import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Button, Footer, Header, Navbar, Sidebar, UserProfile} from './components';
import SidebarLayout from './components/SidebarLayout';
import {Dashboard, Landing, Login, Logout, Notifications, Profile, Results, SignUp} from './pages'

function App() {
  const activeMenu = true;
  return (
    <BrowserRouter>
      <div className='flex '>
        <Routes>
          <Route element={<SidebarLayout/>}>
            {/* Dashboard pages */}
            <Route path='/Dashboard' element={<Dashboard/>}/>
            <Route path='/Results' element={<Results/>}/>
            <Route path='/Notifications' element={<Notifications/>}/>
            <Route path='/Profile' element={<Profile/>}/>
            <Route path='/Logout' element={<Logout/>}/>
          </Route>

          <Route path='/' element={<Landing/>}/>
          <Route path='/signup' element={<SignUp/>}/>
          <Route path='/login' element={<Login/>}/>
        
        </Routes>
      </div>

    </BrowserRouter>
 
  );
}

export default App;
