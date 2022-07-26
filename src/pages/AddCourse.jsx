import React from 'react'
import {Formik, Form} from 'formik'
import * as Yup from 'yup'
import FormikControl from './Form/FormikControl'

const AddCourse = () => {
    const initialValues = {
        name: '',
        code: '',
    }
    const validationSchema = Yup.object({
        name: Yup.string().required('Required'),
        code: Yup.string().required('Required')
    })

    const onSubmit = values => {
        console.log('course', values)
    }
  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {
            formik => (
                <Form>
                    <FormikControl
                        control = 'input'
                        type ='text'
                        label = 'Course Name'
                        name='name'
                    />
                     <FormikControl
                        control = 'input'
                        type ='text'
                        label = 'Course Code'
                        name='code'
                    />
                    <button type='submit' disabled={!formik.isValid} className='rounded-full border-2 mx-11 my-3 mt-6 px-11 py-2 border-indigo-600 text-white bg-indigo-900 hover:bg-indigo-400'>Add</button>
                </Form>
            )
        }

    </Formik>
  )
}

export default AddCourse