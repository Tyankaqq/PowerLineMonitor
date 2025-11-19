import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import Toast from '../../common/Toast'; // путь к вашему toast компоненту
import styles from './NewInspectionModal.module.css';

const NewInspectionModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        line: '',
        element: '',
        date: new Date().toISOString().slice(0, 10),
        responsible: '',
        defectType: '',
        severity: 'normal', // вместо status теперь severity с ключами для степени повреждения
        description: ''
    });

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    const severityOptions = [
        { label: 'Норма', value: 'normal' },
        { label: 'Внимание', value: 'warning' },
        { label: 'Критический', value: 'critical' },
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newInspection = {
            id: `#${Math.floor(Math.random() * 10000)}`,
            date: formData.date,
            line: `${formData.line} / ${formData.element}`,
            defectType: formData.defectType || 'Нет',
            severity: formData.severity,   // степень повреждения из выбора
            status: 'new',                // статус всегда 'new' при создании
            responsible: formData.responsible,
            description: formData.description,
        };

        onSubmit?.(newInspection);

        setFormData({
            line: '',
            element: '',
            date: new Date().toISOString().slice(0, 10),
            responsible: '',
            defectType: '',
            severity: 'normal',
            description: ''
        });

        setToastMessage('Новый осмотр успешно создан!');
        setToastType('success');
        setToastVisible(true);

        onClose();
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <form className={styles.container} onSubmit={handleSubmit}>
                    <h2>Новый осмотр</h2>
                    <p className={styles.subtitle}>Создайте запись о новом осмотре линии электропередачи</p>

                    <div className={styles.formGroup}>
                        <label>Линия электропередачи *</label>
                        <select
                            className={styles.input}
                            value={formData.line}
                            onChange={(e) => handleChange('line', e.target.value)}
                            required
                        >
                            <option value="">Выберите линию</option>
                            <option value="ЛЭП-500">ЛЭП-500</option>
                            <option value="ЛЭП-220">ЛЭП-220</option>
                            <option value="ЛЭП-110">ЛЭП-110</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Элемент *</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Опора #112, Изолятор #45 и т.д."
                            value={formData.element}
                            onChange={(e) => handleChange('element', e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Дата осмотра *</label>
                            <input
                                type="date"
                                className={styles.input}
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Ответственный *</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="ФИО"
                                value={formData.responsible}
                                onChange={(e) => handleChange('responsible', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Тип дефекта</label>
                        <select
                            className={styles.input}
                            value={formData.defectType}
                            onChange={(e) => handleChange('defectType', e.target.value)}
                        >
                            <option value="">Нет дефектов</option>
                            <option value="Коррозия">Коррозия</option>
                            <option value="Трещина">Трещина</option>
                            <option value="Загрязнение">Загрязнение</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Степень повреждения</label>
                        <div className={styles.statusButtons}>
                            {severityOptions.map(({ label, value }) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`${styles.statusBtn} ${formData.severity === value ? styles.active : ''}`}
                                    onClick={() => handleChange('severity', value)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Отрисовка статуса (незменяемый) */}
                    <div className={styles.formGroup}>
                        <label>Статус</label>
                        <input
                            type="text"
                            value="Новый"
                            readOnly
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Описание (опционально)</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Добавьте дополнительные детали..."
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.btnCancel} onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className={styles.btnSubmit}>
                            Создать осмотр
                        </button>
                    </div>
                </form>
            </Modal>

            {toastVisible && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setToastVisible(false)}
                    duration={3000}
                />
            )}
        </>
    );
};

export default NewInspectionModal;
