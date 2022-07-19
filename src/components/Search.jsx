import React from 'react'
import { useState } from 'react';
import { BiSearch } from 'react-icons/bi';

const Search = ({details}) => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const searchItem = ()=>{
    setItems(details.filter(
      detail =>{
        return (
          detail.name.toLowerCase().includes(searchTerm.toLowerCase())

        )
      }))
  }


  return (
    <div>
      <div className='flex justify-between'>
        <input type="text" 
        placeholder='Search' 
        // value={searchItem} 
        onChange={(e)=>{setSearchTerm(e.target.value)}}
        />
        <BiSearch 
          onClick={()=>searchItem(searchTerm)}
        />
      </div>
      {
        items.length>0?(
          <div></div>
        ) : (
          <div>
            {items.map((item)=>(
              <div >
                {item}
              </div>
            ))}
          </div>
        )
      }
    </div>
    
  )
}

export default Search