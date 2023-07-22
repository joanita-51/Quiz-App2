import React from 'react'
import {Formik, Form} from 'formik'
import * as Yup from 'yup'
import FormikControl from './Form/FormikControl'
import { Link } from 'react-router-dom'

const Login = () => {
  const initialValues ={
    email : '',
    password: ''
  }

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalide email format').required('Required'),
    password: Yup.string().required('Required')
  })

  const onSubmit = values => {
    console.log('Form data', values)
   
  }
 
  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}  >
      {
        formik => (
        
            <Form className="text-white h-screen">
              <FormikControl
                control='input'
                type='telephone'
                label='Phone Number'
                name='phone'
              />

            <Link to='/Quiz'>
            <button  className='rounded-full border-2 mx-11 my-3 mt-6 px-11 py-2 border-indigo-600 text-white bg-indigo-900 hover:bg-indigo-400'>Submit</button>
            </Link>
              
            </Form>
          
        )
      }
    </Formik>
  )
}

export default Login
