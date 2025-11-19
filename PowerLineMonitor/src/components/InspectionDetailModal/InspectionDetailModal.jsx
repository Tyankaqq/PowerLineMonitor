import React from 'react';
import Modal from '../Modal/Modal';
import { Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './InspectionDetailModal.module.css';

const InspectionDetailModal = ({ isOpen, onClose, inspection }) => {
    const navigate = useNavigate();

    if (!inspection) return null;

    const handleNavigate = () => {
        onClose();
        // Навигация к странице изолятора, используя id из объекта inspection
        // Предполагается, что у inspection есть поле id изолятара
        // Если id эскемпляра осмотра отличается, адаптируйте по вашему объекту
        const isolatorId = inspection.id; // или inspection.isolatorId если есть
        navigate(`/isolator/}`);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} blur>
            <div className={styles.container}>
                <div className={styles.icon}>
                    <Zap size={32} color="#3b82f6" />
                </div>

                <h2>Коррозия опоры #7531</h2>

                <div className={styles.details}>
                    <div className={styles.row}>
                        <span className={styles.label}>Линия/Опора</span>
                        <span className={styles.value}>ВЛ 500 кВ 'Центральная'</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Степень повреждения</span>
                        <span className={`${styles.badge} ${styles.critical}`}>Критическая</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Дата обнаружения</span>
                        <span className={styles.value}>15.08.2024</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Статус</span>
                        <span className={styles.value}>Новый</span>
                    </div>
                </div>

                <button className={styles.btnDetails} onClick={handleNavigate}>
                    Перейти к деталям
                </button>
            </div>
        </Modal>
    );
};

export default InspectionDetailModal;
