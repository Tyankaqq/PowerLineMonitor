import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import UploadConfirmModal from '../../components/UploadConfirmModal/UploadConfirmModal';
import UploadSuccessModal from '../../components/UploadSuccessModal/UploadSuccessModal';
import { uploadSingleImage } from '../../API/ImagesAPI/ImagesAPI';
import styles from './ImageUploadPage.module.css';

const ImageUploadPage = () => {
    const navigate = useNavigate();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [analysisResults, setAnalysisResults] = useState({
        processedCount: 0,
        defectsFound: 0,
        results: []
    });

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        const newFiles = acceptedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            status: 'pending',
            preview: URL.createObjectURL(file),
            progress: 0,
            stage: 'pending' // pending, uploading, analyzing, success, error
        }));

        setSelectedFiles(prev => [...prev, ...newFiles]);

        if (rejectedFiles.length > 0) {
            console.log('Отклоненные файлы:', rejectedFiles);
            setUploadError('Некоторые файлы не поддерживаются или превышают допустимый размер');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/tiff': ['.tiff', '.tif']
        },
        maxSize: 1073741824,
        multiple: true
    });

    const removeFile = (id) => {
        setSelectedFiles(prev => prev.filter(file => file.id !== id));
        setUploadError(null);
    };

    const handleUploadClick = () => {
        if (selectedFiles.length > 0) {
            setShowConfirmModal(true);
        }
    };

    const uploadFile = async (file) => {
        try {
            // Этап 1: Загрузка файла (быстро)
            setUploadedFiles(prev => prev.map(f =>
                f.id === file.id ? {
                    ...f,
                    progress: 20,
                    status: 'uploading',
                    stage: 'uploading'
                } : f
            ));

            // Симуляция быстрой загрузки файла (для UX)
            await new Promise(resolve => setTimeout(resolve, 200));

            // Этап 2: Анализ YOLO (медленно)
            setUploadedFiles(prev => prev.map(f =>
                f.id === file.id ? {
                    ...f,
                    progress: 50,
                    status: 'analyzing',
                    stage: 'analyzing'
                } : f
            ));

            // Загружаем через API.
            // Сервер возвращает JSON с результатами анализа, включая ID созданной записи.
            const startTime = Date.now();
            const result = await uploadSingleImage(file.file);
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);

            console.log(`Файл ${file.name} обработан за ${duration}с`, result);

            // Этап 3: Успех
            setUploadedFiles(prev => prev.map(f =>
                f.id === file.id ? {
                    ...f,
                    progress: 100,
                    status: 'success',
                    stage: 'success',
                    apiResult: result,
                    processingTime: duration
                } : f
            ));

            return result;
        } catch (error) {
            console.error(`Ошибка загрузки ${file.name}:`, error);

            setUploadedFiles(prev => prev.map(f =>
                f.id === file.id ? {
                    ...f,
                    progress: 0,
                    status: 'error',
                    stage: 'error',
                    error: error.message || 'Failed to fetch'
                } : f
            ));

            throw error;
        }
    };

    const handleRetryFile = async (fileId) => {
        const fileToRetry = uploadedFiles.find(f => f.id === fileId);
        if (!fileToRetry) return;

        try {
            const result = await uploadFile(fileToRetry);

            const allSuccessfulFiles = uploadedFiles
                .map(f => f.id === fileId ? { ...f, status: 'success', apiResult: result } : f)
                .filter(f => f.status === 'success' && f.apiResult);

            const updatedResults = allSuccessfulFiles.map(f => f.apiResult);
            const defectsFound = updatedResults.filter(r => r.main_class !== null).length;

            setAnalysisResults({
                processedCount: updatedResults.length,
                defectsFound: defectsFound,
                results: updatedResults
            });
        } catch (error) {
            console.error('Ошибка при повторной загрузке:', error);
        }
    };

    const handleConfirmUpload = async () => {
        setShowConfirmModal(false);
        setIsUploading(true);
        setUploadError(null);

        setUploadedFiles(selectedFiles.map(f => ({
            ...f,
            status: 'pending',
            stage: 'pending',
            progress: 0
        })));

        try {
            const results = [];
            for (const file of selectedFiles) {
                try {
                    const result = await uploadFile(file);
                    results.push(result);
                } catch (error) {
                    console.error(`Не удалось загрузить ${file.name}`);
                }
            }

            const successfulUploads = results.length;
            // Считаем, что дефект найден, если main_class не null (или другая логика вашего API)
            const defectsFound = results.filter(r => r.main_class).length;

            setAnalysisResults({
                processedCount: successfulUploads,
                defectsFound: defectsFound,
                results: results
            });

            setTimeout(() => {
                if (successfulUploads > 0) {
                    setShowSuccessModal(true);
                    setSelectedFiles([]);
                }
                setIsUploading(false);
            }, 500);

        } catch (error) {
            console.error('Критическая ошибка при загрузке:', error);
            setUploadError('Произошла критическая ошибка. Попробуйте снова.');
            setIsUploading(false);
        }
    };

    // Логика перехода на страницу результата
    const handleViewResults = () => {
        setShowSuccessModal(false);

        // Сохраняем в localStorage, если нужно для истории
        localStorage.setItem('lastAnalysisResults', JSON.stringify(analysisResults));

        // 1. Если загружен РОВНО ОДИН файл - переходим на детальную страницу
        if (analysisResults.results && analysisResults.results.length === 1) {
            const singleResult = analysisResults.results[0];
            // Проверяем оба варианта поля ID, которые могут прийти с бэкенда
            const targetId = singleResult.image_id || singleResult.id;

            if (targetId) {
                console.log('Переход к изолятору:', targetId);
                // Переходим на страницу /isolator/:id
                navigate(`/isolator/${targetId}`, {
                    state: {
                        // Можно передать данные сразу, чтобы не ждать повторной загрузки (опционально)
                        analysisResults: singleResult
                    }
                });
            } else {
                // Если ID почему-то нет, идем в общий список
                console.warn('ID не найден в результате, переход в список');
                navigate('/inspections');
            }
        } else {
            // 2. Если файлов МНОГО или 0 - переходим в общий список инспекций
            navigate('/inspections');
        }
    };

    const handleRetry = () => {
        setUploadedFiles([]);
        setUploadError(null);
        setIsUploading(false);
    };

    const getStageText = (stage) => {
        switch(stage) {
            case 'uploading': return 'Загрузка файла...';
            case 'analyzing': return 'Анализ изображения...';
            case 'success': return 'Загружено и проанализировано';
            case 'error': return 'Ошибка';
            default: return 'Ожидание...';
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.uploadContainer}>
                <h1>Загрузка изображений для анализа</h1>

                {uploadError && (
                    <div className={styles.errorAlert}>
                        <AlertCircle size={20} />
                        <span>{uploadError}</span>
                        <button onClick={() => setUploadError(null)}>
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div
                    {...getRootProps()}
                    className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${isUploading ? styles.disabled : ''}`}
                >
                    <input {...getInputProps()} disabled={isUploading} />
                    <Upload size={48} className={styles.uploadIcon} />
                    <p className={styles.dropzoneText}>Перетащите файлы сюда</p>
                    <p className={styles.dropzoneSubtext}>или</p>
                    <button
                        className={styles.btnPrimary}
                        type="button"
                        disabled={isUploading}
                    >
                        Выберите файлы
                    </button>
                </div>

                <p className={styles.uploadInfo}>
                    Поддерживаемые форматы: JPEG, PNG, TIFF, RAW.
                    Максимальный размер файла: 1 ГБ. Рекомендуемое разрешение: 8K.
                </p>

                {selectedFiles.length > 0 && !isUploading && uploadedFiles.length === 0 && (
                    <>
                        <div className={styles.selectedFiles}>
                            <h3>Выбрано файлов: {selectedFiles.length}</h3>
                            <div className={styles.filesList}>
                                {selectedFiles.map((file) => (
                                    <div key={file.id} className={styles.fileItem}>
                                        <div className={styles.filePreview}>
                                            <img src={file.preview} alt={file.name} />
                                        </div>
                                        <div className={styles.fileInfo}>
                                            <span className={styles.fileName}>{file.name}</span>
                                            <span className={styles.fileSize}>
                                                {(file.size / (1024 * 1024)).toFixed(2)} МБ
                                            </span>
                                        </div>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeFile(file.id)}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            className={styles.btnUpload}
                            onClick={handleUploadClick}
                        >
                            <Upload size={20} />
                            Загрузить {selectedFiles.length} файл{selectedFiles.length > 1 ? 'а' : ''}
                        </button>
                    </>
                )}

                {(isUploading || uploadedFiles.length > 0) && (
                    <div className={styles.uploadProgress}>
                        <h3>Загрузка и анализ файлов...</h3>
                        <div className={styles.filesList}>
                            {uploadedFiles.map((file) => (
                                <div key={file.id} className={styles.fileItem}>
                                    <div className={styles.filePreview}>
                                        <img src={file.preview} alt={file.name} />
                                    </div>
                                    <div className={styles.fileInfo}>
                                        <span className={styles.fileName}>{file.name}</span>
                                        <span className={styles.fileSize}>
                                            {(file.size / (1024 * 1024)).toFixed(2)} МБ
                                        </span>

                                        {file.status !== 'error' && (
                                            <div className={styles.progressBar}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${file.progress}%` }}
                                                ></div>
                                            </div>
                                        )}

                                        {file.stage && file.stage !== 'success' && file.stage !== 'error' && (
                                            <span className={styles.statusUploading}>
                                                {getStageText(file.stage)}
                                            </span>
                                        )}

                                        {file.status === 'success' && (
                                            <span className={styles.statusSuccess}>
                                                <CheckCircle size={16} />
                                                Загружено и проанализировано
                                                {file.processingTime && ` (${file.processingTime}с)`}
                                            </span>
                                        )}

                                        {file.status === 'error' && (
                                            <span className={styles.statusError}>
                                                <AlertCircle size={16} />
                                                Ошибка: {file.error}
                                            </span>
                                        )}

                                        {file.apiResult && file.apiResult.main_class && (
                                            <span className={styles.defectInfo}>
                                                Найден дефект: {file.apiResult.main_class}
                                                (уверенность: {(file.apiResult.main_confidence * 100).toFixed(1)}%)
                                            </span>
                                        )}
                                    </div>

                                    {file.status === 'error' && (
                                        <button
                                            className={styles.retryFileBtn}
                                            onClick={() => handleRetryFile(file.id)}
                                            title="Повторить загрузку"
                                        >
                                            <RefreshCw size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {uploadedFiles.some(f => f.status === 'error') && !isUploading && (
                            <button
                                className={styles.btnRetry}
                                onClick={handleRetry}
                            >
                                Попробовать снова
                            </button>
                        )}
                    </div>
                )}
            </div>

            <UploadConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmUpload}
                filesCount={selectedFiles.length}
            />

            <UploadSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                onViewResults={handleViewResults}
                processedCount={analysisResults.processedCount}
                defectsFound={analysisResults.defectsFound}
            />
        </div>
    );
};

export default ImageUploadPage;
