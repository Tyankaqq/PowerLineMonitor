// src/components/Checkbox/Checkbox.jsx
import React from 'react';
import styles from './Checkbox.module.css';

const Checkbox = ({ checked, onChange, label, ...rest }) => (
    <label className={styles.checkboxLabel}>
        <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={checked}
            onChange={onChange}
            {...rest}
        />
        <span className={styles.checkboxCustom}>{checked && <span className={styles.checkboxMark} />}</span>
        {label && <span className={styles.checkboxText}>{label}</span>}
    </label>
);

export default Checkbox;
