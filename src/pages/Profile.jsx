import React from 'react'
import { Navbar } from '../components'
import profile from '../data/profile.jpg'
import {Formik, Form} from 'formik'
import * as Yup from 'yup'
import FormikControl from './Form/FormikControl'

const Profile = () => {
  const initialValues ={
    email : '',
    name: '',
    contact: ''
  }

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalide email format').required('Required'),
    name: Yup.string().required('Required'),
    contact: Yup.string().required('Required')
  })

  const onSubmit = values => {
    console.log('Form data', values)
   
  }
 
  return (
    <div className='w-full'>
      <Navbar/>
      <div className='grid grid-cols-2 gap-4'>
        <div className='my-24 mx-24'>
        <img className='rounded-full h-40 w-40 object-cover' src={profile} alt=""/>
          <p>Nakityo Joanita</p> 
          <p className='text-slate-700'>nakityoanita@gmail.com</p>
          <button className='bg-green-500 text-white rounded-lg py-1 px-3'>Active</button>
        </div>
        <div>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} >
            {
              formik => (
              
                  <Form >
                    <FormikControl
                      control='input'
                      type='name'
                      label='Name'
                      name='name'
                      placeholder='Nakityo Joanita'
                    />
                    <FormikControl
                      control='input'
                      type='email'
                      label='Email'
                      name='email'
                      placeholder='nakityoanita@gmail.com'
                    />

                    <FormikControl
                      control='input'
                      type='role'
                      label='Role'
                      name='role'
                      placeholder='Student'
                    />

                    <FormikControl
                      control='input'
                      type='contact'
                      label='Contact'
                      name='contact'
                    />

                    <FormikControl
                      control='input'
                      type='gender'
                      label='Gender'
                      name='gender'
                      placeholder='Female'
                    />
                    <button type='submit' disabled={!formik.isValid} className='rounded-full border-2 mx-11 my-3 mt-6 px-11 py-2 border-indigo-600 text-white bg-indigo-900 hover:bg-indigo-400'>Save</button>
                  </Form>
                
              )
            }
          </Formik>
        </div>

      </div>
    </div>
  )
}

export default Profile