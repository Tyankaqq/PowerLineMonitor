import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './ImageModal.module.css';

const ImageModal = ({ imageUrl, onClose }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return createPortal(
        <div className={styles.fullscreenModal} onClick={onClose}>
            <button
                className={styles.closeButton}
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                aria-label="Закрыть"
            >
                <X size={32} />
            </button>
            <img
                src={imageUrl}
                alt="Полноэкранный просмотр"
                className={styles.fullscreenImage}
                onClick={(e) => e.stopPropagation()}
            />
        </div>,
        document.body
    );
};

export default ImageModal;
