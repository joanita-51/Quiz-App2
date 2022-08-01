import React from 'react'
import {Form, Formik } from 'formik'
import * as Yup from 'yup'
import FormikControl from './Form/FormikControl'
import { Link } from 'react-router-dom'

const SignUp = () => {
  const options =[
    {key: 'Iam a student', value:'studentmoc'},
    {key: 'Iam an administrator', value:'adminmoc'},
  ]
  const options1 =[
    {key: 'Male', value:'male'},
    {key: 'Female', value:'female'},
  ]
  const options2 =[
    {key: 'Makerere University', value:'muk'},
    {key: 'Ablestate Creatives', value:'able'},
    {key: 'Kyambogo University', value:'kyu'},
  ]
  const initialValues ={
    email: '',
    password: '',
    confirmPassword:'',
    modeOfContact:'',
    institutionID:'',
    fname:'',
    lname:'',
    confirmEmail:'',
    gender:'',
    institution:'',

  }
  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email format').required('Required'),
    password: Yup.string().required('Required'),
    fname: Yup.string().required('Required'),
    lname: Yup.string().required('Required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'),''], 'Passwords must match').required('Required'),
    confirmEmail: Yup.string().oneOf([Yup.ref('email'),''], 'Email must match').required('Required'),
    modeOfContact:Yup.string().required('Required'),
    gender:Yup.string().required('Required'),
    institutionID: Yup.string().when('institution',{is: true, then: Yup.string().required('Required')})
  })

  const onSubmit = values => {
    console.log('Form data', values)
  }

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      {
        formik => {
          return (
            <Form>
              <FormikControl
                control = 'input'
                type = 'text'
                label = 'First Name'
                name = 'fname'
              />
              <FormikControl
                control = 'input'
                type = 'text'
                label = 'Last Name'
                name = 'lname'
              />
              <FormikControl
                control = 'input'
                type = 'email'
                label = 'Email Address'
                name = 'email'
              />
              <FormikControl
                control = 'input'
                type = 'email'
                label = 'Confirm Email'
                name = 'confirmEmail'
              />
              <FormikControl
                control = 'input'
                type = 'password'
                label = 'Password'
                name = 'password'
              />
              <FormikControl
                control = 'input'
                type = 'password'
                label = 'Confirm Password'
                name = 'confirmPassword'
              />

              <FormikControl
                control = 'radio'
                label = 'Gender:  '
                name = 'gender'
                options = {options1}
              />
              <FormikControl
                control = 'select'
                label = 'Institution Name:  '
                name = 'institution'
                options = {options2}
              />
              <FormikControl
                control = 'radio'
                label = 'Mode of contact:  '
                name = 'modeOfContact'
                options = {options}
              />
              <FormikControl
                control = 'input'
                type = 'text'
                label = 'Institution ID'
                name = 'institution'
              />
              <Link to='/Dashboard'>
              <button type ='submit'  className='rounded-full border-2 mx-11 my-3 mt-6 px-11 py-2 border-indigo-600 text-white bg-indigo-900 hover:bg-indigo-400' disabled={!formik.isValid}>Submit</button>
              </Link>
              
            </Form>
          )
        }
      }
    </Formik>
  )
}

export default SignUp