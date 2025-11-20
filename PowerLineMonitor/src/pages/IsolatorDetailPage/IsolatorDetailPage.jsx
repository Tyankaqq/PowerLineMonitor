import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Wrench, CheckCircle } from 'lucide-react';
import AnimatedProgressBar from '../../components/AnimatedProgressBar/AnimatedProgressBar.jsx';
import ExportReportModal from '../../components/ExportReportModal/ExportReportModal.jsx';
import Toast from '../../common/Toast';
import styles from './IsolatorDetailPage.module.css';
import { fetchImageCard } from '../../API/ImagesAPI/ImagesAPI';

// Словарь перевода типов дефектов
const defectTypeLabels = {
    'chip': 'Скол',
    'corrosion': 'Коррозия',
    'crack': 'Трещина',
    'missing-element': 'Отсутствие элемента',
    'undefined': 'Неопределено',
};

const IsolatorDetailPage = () => {
    const { id } = useParams();
    const targetImageId = id || 24;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('results');
    const [exportModalOpen, setExportModalOpen] = useState(false);

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    const [images, setImages] = useState([]);
    const [analysisResult, setAnalysisResult] = useState(null);

    const formatClassifConfidence = (value) => {
        if (value === undefined || value === null) return '0.00';
        const percent = value * 100;
        const formatted = percent.toFixed(2);
        return formatted === '100.00' ? '99.99' : formatted;
    };

    useEffect(() => {
        fetchImageCard(targetImageId)
            .then(data => {
                setAnalysisResult(data);

                const imgs = [];
                // Правильный способ для Vite!
                const baseUrl = import.meta.env.VITE_API_URL;

                if (data.file_path) {
                    const mainImage = data.file_path.startsWith('http')
                        ? data.file_path
                        : `${baseUrl}${data.file_path}`;

                    if (data.detections && data.detections.length > 0) {
                        imgs.push(mainImage);

                        const firstDefectWithRoi = data.detections.find(det => det.roi_path);
                        if (firstDefectWithRoi) {
                            const roiImage = firstDefectWithRoi.roi_path.startsWith('http')
                                ? firstDefectWithRoi.roi_path
                                : `${baseUrl}${firstDefectWithRoi.roi_path}`;
                            imgs.push(roiImage);
                        }
                    } else {
                        imgs.push(mainImage);
                    }
                }

                setImages(imgs);
                setCurrentImageIndex(0);
            })
            .catch((error) => {
                console.error("Ошибка при загрузке данных:", error);
                setToastMessage('Ошибка загрузки данных с сервера');
                setToastType('error');
                setToastVisible(true);
                setAnalysisResult(null);
                setImages([]);
            });
    }, [targetImageId]);


    const openExportModal = () => setExportModalOpen(true);
    const closeExportModal = () => setExportModalOpen(false);

    const handleCreateRepairTask = (defectId) => {
        setToastMessage(`Задача на ремонт успешно создана для дефекта ${defectId}!`);
        setToastType('success');
        setToastVisible(true);
    };

    const nextImage = () => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
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
                        <p className={styles.idText}>
                            ID: {analysisResult.isolatorId || analysisResult.image_id}
                        </p>
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
                                                >
                                                    <Wrench size={18} />
                                                    Создать задачу на ремонт
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
