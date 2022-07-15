import React from 'react'
import {Formik, Form} from 'formik'
import * as Yup from 'yup'
import FormikControl from './Form/FormikControl'


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
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} >
      {
        formik => (
        
            <Form >
              <FormikControl
                control='input'
                type='email'
                label='Email'
                name='email'
              />
              <FormikControl
                control='input'
                type='password'
                label='Password'
                name='password'
              />
            
              <button type='submit' disabled={!formik.isValid} className='rounded-full border-2 mx-11 my-3 mt-6 px-11 py-2 border-indigo-600 text-white bg-indigo-900 hover:bg-indigo-400'>Submit</button>
            </Form>
          
        )
      }
    </Formik>
  )
}

export default Login
