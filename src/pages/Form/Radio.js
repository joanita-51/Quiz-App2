import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from './TextError'
/*
distinct elements...
1. form label - html form label element
2. form input - a field element form formik. has a list that allow you to select one
3. error message component form formik

Props..
1. control= radio - required to determine the type of form control we need to render
2. label prop = 'pick one option' - label text for the form field 
3. name prop = 'radioOption' - for the field and error message components
4. options prop= [{key, value}] - An array of objects . each object with key value pairs used to render each radio button for the component
*/

const Radio = (props) => {
    const {label, name, options, ...rest} = props
  return (
    <div className='form-control'>
        <label>{label}</label>
        <Field name={name} {...rest}>
            {
                ({field})=>{
                    return options.map(option=>{
                        <React.Fragment key={option.key}>
                            <input
                                type='radio'
                                id = {option.value}
                                {...field}
                                value = {option.value}
                                checked={field.value === option.value}
                            />
                            <label htmlFor={option.value}>{option.key}</label>
                        </React.Fragment>
                    })
                }
            }
        </Field>
        <ErrorMessage name={name} component = {TextError}/>
    </div>
  )
}

export default Radio