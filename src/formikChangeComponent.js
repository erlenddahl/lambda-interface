import { useEffect } from 'react'
import { useFormikContext } from 'formik'

const FormikChangeComponent = () => {
    const { values, errors } = useFormikContext();

    useEffect(() => {
      console.log('changed', values, errors);
    }, [values, errors]);

    return null;
}

export default FormikChangeComponent;