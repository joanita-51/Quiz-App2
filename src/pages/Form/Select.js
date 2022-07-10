import React from 'react'
import {Field, ErrorMessage} from 'formik'
import TextError from './TextError';
/* label for label element in html, field renders select html element. 
also has options to select from , Error for the error message component
props: control- determines the type of the form control we need to render
2. label prop - label text for the form field
3. name prop- required for the field and the error message components
4. options prop - Array of objects each object contains key value pairs that are used to populate the drop down for the select component
*/

const Select = (props) => {
    const {name, label,options , ...rest} = props;
  return (
    <div className='form-control'>
        <label htmlFor={name}>{label}</label>
        <Field as='select' id={name} name={name} {...rest}>
            //these children are the list of options
            {
                options.map(option => {
                    return(
                        // option html element is returned
                        <option key={option.value} value={option.value}>
                            {option.key} 
                        </option>
                    )
                })
            }
        </Field>
        <ErrorMessage name={name} component={TextError}/>    
    </div>
  )
}

export default Select