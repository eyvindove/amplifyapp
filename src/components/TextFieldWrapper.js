import React from 'react'
import { TextField } from '@aws-amplify/ui-react'

const TextFieldWrapper = React.forwardRef((props, ref) => {
  return (
    <TextField
      ref={ref}
      type='text'
      label={props.label}
      placeholder={props.placeholder}
    />
  )
})

export default TextFieldWrapper
