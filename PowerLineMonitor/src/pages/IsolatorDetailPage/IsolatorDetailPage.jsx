import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Wrench, CheckCircle } from 'lucide-react'; // Убрали X
import AnimatedProgressBar from '../../components/AnimatedProgressBar/AnimatedProgressBar.jsx';
import ExportReportModal from '../../components/ExportReportModal/ExportReportModal.jsx';
import ImageModal from '../../components/ImageModal/ImageModal.jsx'; // ДОБАВИЛИ
import Toast from '../../common/Toast';
import styles from './IsolatorDetailPage.module.css';
import { fetchImageCard } from '../../API/ImagesAPI/ImagesAPI';
import { createRepairRequest } from '../../API/RepairRequestsAPI/RepairRequestsAPI';

const defectTypeLabels = {
    'chip': 'Скол',
    'corrosion': 'Коррозия',
    'crack': 'Трещина',
    'missing-element': 'Отсутствие элемента',
    'undefined': 'Неопределено',
};

const BASE_URL = import.meta.env.VITE_API_URL || 'https://28c55251873d.ngrok-free.app';

const IsolatorDetailPage = () => {
    const { id } = useParams();
    const targetImageId = id || 24;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('results');
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [fullscreenImage, setFullscreenImage] = useState(null);

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    const [images, setImages] = useState([]);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [creatingRepair, setCreatingRepair] = useState(null);

    const formatClassifConfidence = (value) => {
        if (value === undefined || value === null) return '0.00';
        const percent = value * 100;
        const formatted = percent.toFixed(2);
        return formatted === '100.00' ? '99.99' : formatted;
    };

    useEffect(() => {
        setAnalysisResult(null);
        setImages([]);

        fetchImageCard(targetImageId)
            .then(data => {
                setAnalysisResult(data);

                const imgs = [];
                const baseUrl = import.meta.env.VITE_API_URL;

                if (data && data.file_path) {
                    const mainImage = data.file_path.startsWith('http')
                        ? data.file_path
                        : `${baseUrl}${data.file_path}`;

                    imgs.push(mainImage);

                    if (data.detections && data.detections.length > 0) {
                        const defectImages = data.detections
                            .filter(det => det.roi_path)
                            .map(det => det.roi_path.startsWith('http')
                                ? det.roi_path
                                : `${baseUrl}${det.roi_path}`
                            );

                        imgs.push(...defectImages);
                    }

                    setImages(imgs);
                    setCurrentImageIndex(0);
                }
            })
            .catch((error) => {
                console.error("Критическая ошибка при загрузке данных:", error);
                setToastMessage('Ошибка загрузки данных с сервера');
                setToastType('error');
                setToastVisible(true);
                setAnalysisResult(null);
                setImages([]);
            });
    }, [targetImageId]);

    const openExportModal = () => setExportModalOpen(true);
    const closeExportModal = () => setExportModalOpen(false);

    const handleCreateRepairTask = async (defectId) => {
        setCreatingRepair(defectId);

        try {
            const result = await createRepairRequest(defectId);
            setToastMessage(`Задача на ремонт успешно создана! ID заявки: ${result.repair_request_id}`);
            setToastType('success');
            setToastVisible(true);
        } catch (error) {
            console.error('Ошибка создания заявки:', error);
            setToastMessage(`Ошибка создания заявки: ${error.message}`);
            setToastType('error');
            setToastVisible(true);
        } finally {
            setCreatingRepair(null);
        }
    };

    const nextImage = () => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    };

    const openFullscreen = () => {
        console.log('🖼️ Открытие модалки с URL:', images[currentImageIndex]);
        setFullscreenImage(images[currentImageIndex]);
    };

    const closeFullscreen = () => {
        console.log('🚪 Закрытие модалки');
        setFullscreenImage(null);
    };

    if (!analysisResult) {
        return <p style={{ padding: 40 }}>Загрузка данных...</p>;
    }

    const hasDefects = analysisResult.detections && analysisResult.detections.length > 0;

    return (
        <>
            <div className={styles.pageContainer}>
                <div className={styles.pageHeader}>
                    <div>
                        <h1>{analysisResult.isolatorName || 'Изолятор'}</h1>

                    </div>
                    <button className={styles.btnPrimary} onClick={openExportModal}>
                        <Download size={18} />
                        Экспорт отчета
                    </button>
                </div>

                <div className={styles.contentGrid}>
                    <div className={styles.imageSection}>
                        <div className={styles.imageViewer}>
                            {images.length > 0 ? (
                                <>
                                    <img
                                        src={images[currentImageIndex]}
                                        alt={`Фото ${currentImageIndex + 1}`}
                                        className={styles.mainImage}
                                        onClick={openFullscreen}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    {images.length > 1 && (
                                        <div className={styles.sliderControls}>
                                            <button onClick={prevImage} aria-label="Предыдущее изображение">‹</button>
                                            <button onClick={nextImage} aria-label="Следующее изображение">›</button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p>Нет изображений</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.infoSection}>
                        <div className={styles.card}>
                            <h3>Оценка состояния</h3>

                            <div className={styles.metric}>
                                <label>Уверенность правильности определения объектов</label>
                                <div className={styles.progressBarWrapper}>
                                    <AnimatedProgressBar
                                        targetPercent={analysisResult.main_confidence ? analysisResult.main_confidence * 100 : 0}
                                        filledBackground="linear-gradient(to right, #3b82f6, #2563eb)"
                                        height={10}
                                    />
                                </div>
                                <span className={styles.metricValue}>
                                    {(analysisResult.main_confidence ? analysisResult.main_confidence * 100 : 0).toFixed(2)}%
                                </span>
                            </div>

                            {hasDefects && analysisResult.detections[0] && (
                                <div className={styles.metric}>
                                    <label>Уверенность в классификации повреждения</label>
                                    <div className={styles.progressBarWrapper}>
                                        <AnimatedProgressBar
                                            targetPercent={analysisResult.detections[0].classif_confidence ? analysisResult.detections[0].classif_confidence * 100 : 0}
                                            filledBackground="linear-gradient(to right, #fbbf24, #d97706)"
                                            height={10}
                                        />
                                    </div>
                                    <span className={styles.metricValue}>
                                        {formatClassifConfidence(analysisResult.detections[0].classif_confidence)}%
                                    </span>
                                </div>
                            )}

                            {!hasDefects && (
                                <div className={styles.statusOk}>
                                    <CheckCircle size={24} color="#10b981" />
                                    <span>Дефектов не обнаружено</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.tabsSection}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'results' ? styles.active : ''}`}
                            onClick={() => setActiveTab('results')}
                        >
                            Результаты анализа
                        </button>
                    </div>

                    {activeTab === 'results' && (
                        <div className={styles.defectsTable}>
                            {hasDefects ? (
                                <table>
                                    <thead>
                                    <tr>

                                        <th>ТИП ДЕФЕКТА</th>
                                        <th>YOLO</th>
                                        <th>КЛАССИФ</th>
                                        <th>ДЕЙСТВИЕ</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {analysisResult.detections.map(defect => (
                                        <tr key={defect.id}>

                                            <td>{defectTypeLabels[defect.defect_type] || defect.defect_type}</td>
                                            <td>{defect.yolo_confidence ? (defect.yolo_confidence * 100).toFixed(2) : '0.00'}%</td>
                                            <td>{formatClassifConfidence(defect.classif_confidence)}%</td>
                                            <td>
                                                <button
                                                    className={styles.btnSecondary}
                                                    onClick={() => handleCreateRepairTask(defect.id)}
                                                    disabled={creatingRepair === defect.id}
                                                >
                                                    <Wrench size={18} />
                                                    {creatingRepair === defect.id ? 'Создание...' : 'Создать задачу на ремонт'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className={styles.noDefectsMessage}>
                                    <CheckCircle size={48} color="#10b981" />
                                    <p>Дефекты не обнаружены</p>
                                    <span>Система не выявила повреждений на данном изображении.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ИСПОЛЬЗУЕМ КОМПОНЕНТ ImageModal */}
            {fullscreenImage && (
                <ImageModal imageUrl={fullscreenImage} onClose={closeFullscreen} />
            )}

            <ExportReportModal
                isOpen={exportModalOpen}
                onClose={closeExportModal}
                inspections={[]}
            />

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

export default IsolatorDetailPage;
