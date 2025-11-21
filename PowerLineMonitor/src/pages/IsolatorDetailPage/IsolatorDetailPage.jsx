import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Wrench, CheckCircle, MapPin } from 'lucide-react';
import AnimatedProgressBar from '../../components/AnimatedProgressBar/AnimatedProgressBar.jsx';
import ExportReportModal from '../../components/ExportReportModal/ExportReportModal.jsx';
import ImageModal from '../../components/ImageModal/ImageModal.jsx';
import YandexMap from '../../components/YandexMap/YandexMapV2.jsx';
import DefectSidebar from '../../components/DeffectSidebar/DeffectSidebar.jsx';
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

    // Состояния для карты
    const [mapMarkers, setMapMarkers] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const formatClassifConfidence = (value) => {
        if (value === undefined || value === null) return '0.00';
        const percent = value * 100;
        const formatted = percent.toFixed(2);
        return formatted === '100.00' ? '99.99' : formatted;
    };

    useEffect(() => {
        setAnalysisResult(null);
        setImages([]);
        setMapMarkers([]);

        fetchImageCard(targetImageId)
            .then(data => {
                console.log('Полученные данные карточки:', data);
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

                // Формируем маркер для карты из данных image card
                if (data.detections && data.detections.length > 0) {
                    const firstDetection = data.detections[0];

                    if (firstDetection.gps_latitude && firstDetection.gps_longitude) {
                        const marker = {
                            id: data.image_id,
                            latitude: firstDetection.gps_latitude,
                            longitude: firstDetection.gps_longitude,
                            defect_type: firstDetection.defect_type,
                            confidence: data.main_confidence,
                            has_defects: true,
                            image_path: data.file_path
                        };
                        console.log('Создан маркер:', marker);
                        setMapMarkers([marker]);
                    } else {
                        console.log('GPS координаты отсутствуют в detection');
                    }
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
        setFullscreenImage(images[currentImageIndex]);
    };

    const closeFullscreen = () => {
        setFullscreenImage(null);
    };

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
    };

    const handleCloseSidebar = () => {
        setSelectedMarker(null);
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

                        {/* КАРТА ПОД ОЦЕНКОЙ СОСТОЯНИЯ */}
                        <div className={styles.card} style={{ marginTop: 'var(--spacing-lg)' }}>
                            <div className={styles.mapHeader}>
                                <MapPin size={20} />
                                <h3>Местоположение на карте</h3>
                            </div>
                            {mapMarkers.length > 0 ? (
                                <div className={styles.mapContainer}>
                                    <YandexMap
                                        markers={mapMarkers}
                                        onMarkerClick={handleMarkerClick}
                                    />
                                </div>
                            ) : (
                                <div className={styles.noMapData}>
                                    Координаты отсутствуют
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

            {fullscreenImage && (
                <ImageModal imageUrl={fullscreenImage} onClose={closeFullscreen} />
            )}

            {selectedMarker && (
                <DefectSidebar
                    marker={selectedMarker}
                    onClose={handleCloseSidebar}
                />
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
