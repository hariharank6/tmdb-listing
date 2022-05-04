import React, { ReactElement } from 'react'
import styles from './Select.module.css'
import { SelectProps } from './types'

export const Select = ({ options, handleChange, defaultValue, label }: SelectProps): ReactElement => {
  return (
    <div>
      {label && <label className={styles.label}>{label}</label>}
      <select
        className={styles.selectContainer}
        onChange={e => handleChange(e.target.value)}
        defaultValue={defaultValue}>
        {options.map((option, index: number) => (
          <option key={index} value={option.value} className={styles.selectOption}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
