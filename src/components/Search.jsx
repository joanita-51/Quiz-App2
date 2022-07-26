// import React from 'react'

// import { useState } from 'react';
// import { BiSearch } from 'react-icons/bi';

// const Search = ({details}) => {
//   const [items, setItems] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const searchItem = ()=>{
//     setItems(details.filter(
//       detail =>{
//         return (
//           detail.name.toLowerCase().includes(searchTerm.toLowerCase())

//         )
//       }))
//   }


//   return (
//     <div>
//       <div className='flex justify-between'>
//         <input type="text" 
//         placeholder='Search' 
//         value={searchItem} 
//         onChange={(e)=>{setSearchTerm(e.target.value)}}
//         />
//         <BiSearch 
//           onClick={()=>searchItem(searchTerm)}
//         />
//       </div>
//       {
//         items.length>0?(
//           <div></div>
//         ) : (
//           <div>
//             {items.map((item)=>(
//               <div >
//                 {item}
//               </div>
//             ))}
//           </div>
//         )
//       }
//     </div>
    
//   )
// }

// export default Search

import React from 'react'
import { useState } from 'react'
import { BiSearch } from 'react-icons/bi';

const Search = ({callback}) => {
  const [innerValue, setInnerValue] = useState("");
  const handleSubmit = e =>{
    e.preventDefault()
    callback(innerValue)
  }

  return (
    <div className='bg-white drop-shadow-sm rounded-lg w-80'>
      <form onSubmit={handleSubmit} className='flex items-center justify-between p-2 '>
        <input type="text" 
          className='w-64 pl-3'
          value={innerValue}
          onChange={(e)=>setInnerValue(e.target.value)}
          placeholder = 'Search'
        />
        <BiSearch onClick={handleSubmit}/>
      </form>
    </div>

  )
}

export default Search