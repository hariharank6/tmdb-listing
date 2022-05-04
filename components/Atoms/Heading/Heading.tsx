import React, { ReactElement } from 'react'
import styles from './Heading.module.css'
import { HeadingProps } from './types'

export const Heading = ({ title }: HeadingProps): ReactElement => {
  return <h1 className={styles.heading}> {title} </h1>
}
