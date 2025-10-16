import { Select } from '@mantine/core';
import classes from './SelectInput.module.css';

export function SelectInputs() {
  return (
    <>

      <Select
        mt="md"
        comboboxProps={{ withinPortal: true }}
        data={['User', 'Admin']}
        placeholder="Your role"
        label=""
        classNames={classes}
      />
    </>
  );
}