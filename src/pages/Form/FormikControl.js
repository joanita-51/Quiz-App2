import React from 'react'
import TextArea from './TextArea'
import Input from './input'
import Select from './Select'
import Radio from './Radio'
import Checkbox from './Checkbox'
import DatePicker from './DatePicker'
// what form fields have to be rendered based on a particular prop
//control prop determines the type of form control we need to render e.g text area, input , radio etc..
//label prop is the label text for the form field
//name prop for the field and error message components

const FormikControl = (props) => {
    const {control, ...rest} =props
    switch (control){
        case 'input':
            return <Input {...rest}/>
        case 'textarea':
            return <TextArea {...rest}/> 
        case 'select':
            return <Select {...rest}/>
        case 'radio': 
            return <Radio {...rest} /> 
        case 'checkbox': 
            return <Checkbox {...rest}/>
        case 'date':
            return <DatePicker {...rest}/>
        default : return null

    }
  return (
    <div>FormikControl</div>
  )
}

export default FormikControl