import React from 'react'

const Button = ({bg , text}) => {
  return (
    <div>
      <button className='text-blue-400 `${bg}`'> {text}</button>
    </div>
  )
}

export default Button