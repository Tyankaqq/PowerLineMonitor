import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

const Select = ({ options, value, onChange, placeholder }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    // Закрываем меню при клике вне компонента
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val) => {
        onChange(val);
        setOpen(false);
    };

    return (
        <div className={styles.selectContainer} ref={ref}>
            <button
                type="button"
                className={styles.selectButton}
                onClick={() => setOpen(o => !o)}
            >
                <span>{options.find(o => o.value === value)?.label || placeholder}</span>
                <ChevronDown size={18} />
            </button>
            {open && (
                <div className={styles.selectDropdown}>
                    {options.map(opt => (
                        <div
                            key={opt.value}
                            className={`${styles.selectOption} ${value === opt.value ? styles.selected : ''}`}
                            onClick={() => handleSelect(opt.value)}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Select;
