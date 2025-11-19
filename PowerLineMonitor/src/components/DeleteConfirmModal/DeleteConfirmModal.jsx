// src/components/DeleteConfirmModal/DeleteConfirmModal.jsx
import React from 'react';
import Modal from '../Modal/Modal';
import { AlertTriangle } from 'lucide-react';
import styles from './DeleteConfirmModal.module.css';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.container}>
                <div className={styles.icon}>
                    <AlertTriangle size={48} color="#f59e0b" />
                </div>
                <h2>Удалить линию?</h2>
                <p>
                    Вы действительно хотите удалить выбранную линию? Это действие нельзя будет отменить.
                </p>

                <div className={styles.footer}>
                    <button className={styles.btnCancel} onClick={onClose}>
                        Отмена
                    </button>
                    <button className={styles.btnDelete} onClick={onConfirm}>
                        Удалить
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteConfirmModal;
