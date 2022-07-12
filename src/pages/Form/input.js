import React from 'react'
import {FastField, ErrorMessage} from 'formik'
import TextError from './TextError'

function Input(props) {
    const {label, name, ...rest} = props
  return (
    <div  className='mx-12 mt-8'>
        <label htmlFor={name}>{label}</label>
        < FastField id={name} name={name} {...rest} className='block px-20 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 '/>
        <ErrorMessage name = {name}component = {TextError}/>
    </div>
  )
}

export default Input