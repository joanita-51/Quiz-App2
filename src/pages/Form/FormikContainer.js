import React from 'react'
import {Formik, Form} from 'formik'
import * as Yup from 'yup'
import FormikControl from './FormikControl'

function FormikContainer() {
    const checkboxOptions = [
        {key: 'option 1', value:'coption1'},
        {key: 'option 2', value:'coption2'},
        {key: 'option 3', value:'coption3'}
    ]
    const radioOptions = [
        {key: 'option 1', value:'roption1'},
        {key: 'option 2', value:'roption2'},
        {key: 'option 3', value:'roption3'}
    ]
  
    const dropdownOptions = [
        {key: 'Select an option', value:''},
        {key: 'option 1', value:'option1'},
        {key: 'option 2', value:'option2'},
        {key: 'option 3', value:'option3'}
    ]
    const initialValues = {
        email: '',
        description: '',
        selectOption:'',
        radioOption : '',
        checkboxOption : [],
        birthDate: null
    }
    const validationSchema = Yup.object({
        email: Yup.string().required('Required'),
        description: Yup.string().required('Required'),
        selectOption: Yup.string().required('Required'),
        radioOption: Yup.array().required('Required'),
        checkboxOption: Yup.array().required('Required'),
        birthDate: Yup.date().required('Required').nullable()
    })
    const onSubmit = values => console.log('Form data',values)
  return (
    <Formik >
        {formik =>(
            <Form>
                <FormikControl 
                    control = 'input' 
                    type='email' 
                    label='Email' 
                    name='email'
                />
                <FormikControl
                    control = 'textarea'
                    label = 'description'
                    name= 'description'
                />
                <FormikControl
                    control = 'select'
                    label='Select a topic'
                    name='selectOption'
                    options={dropdownOptions}
                />
                <FormikControl
                    control = 'radio'
                    label='Radio topic'
                    name='radioOptions'
                    options={radioOptions}
                />
                <FormikControl
                    control = 'checkbox'
                    label='Checkbox topics'
                    name='checkboxOption'
                    options={checkboxOptions}
                />
                <FormikControl
                    control = 'date'
                    label='Pick a date'
                    name='birthDate'
                />
                <button type = 'submit'>Submit</button>
            </Form>
        )}
    </Formik>
  )
}

export default FormikContainer