import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import {Button, Footer, Header, Navbar, Sidebar, UserProfile} from './components';
import {Dashboard, Landing, Login, Logout, Notifications, Profile, Results, SignUp} from './pages'

function App() {
  return (
    <div>
     <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/login' element={<Login/>}/>

        {/* Dashboard pages */}
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/results' element={<Results/>}/>
        <Route path='/notifications' element={<Notifications/>}/>
        <Route path='/profile' element={<Profile/>}/>
        <Route path='/logout' element={<Logout/>}/>
      </Routes>
     </BrowserRouter>
    </div>
  );
}

export default App;
