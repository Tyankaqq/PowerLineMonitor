import React, { useEffect, useRef, useState } from 'react';
import styles from './YandexMap.module.css';

const YandexMapV2 = ({ markers = [], onMarkerClick }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadYandexMap();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (mapInstance.current && markers.length > 0 && !isLoading) {
            addMarkers();
        }
    }, [markers, isLoading]);

    const loadYandexMap = () => {
        if (window.ymaps) {
            console.log('✅ Яндекс.Карты уже загружены');
            initMap();
            return;
        }

        console.log('🗺️ Загружаем Яндекс.Карты API 2.1...');

        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.async = true;

        script.onload = () => {
            console.log('✅ Яндекс.Карты API 2.1 загружены');
            initMap();
        };

        script.onerror = (e) => {
            console.error('❌ Ошибка загрузки Яндекс.Карт:', e);
            setError('Не удалось загрузить Яндекс.Карты');
            setIsLoading(false);
        };

        document.head.appendChild(script);

        setTimeout(() => {
            if (isLoading && !window.ymaps) {
                setError('Превышено время ожидания загрузки карты');
                setIsLoading(false);
            }
        }, 10000);
    };

    const initMap = () => {
        window.ymaps.ready(() => {
            try {
                let center = [55.755819, 37.617644];

                if (markers.length > 0 && markers[0].gps_latitude && markers[0].gps_longitude) {
                    center = [markers[0].gps_latitude, markers[0].gps_longitude];
                    console.log('📍 Центр карты:', center);
                }

                const map = new window.ymaps.Map(mapRef.current, {
                    center: center,
                    zoom: 10,
                    controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
                });

                mapInstance.current = map;
                setIsLoading(false);

                console.log('✅ Карта создана');

                if (markers.length > 0) {
                    addMarkers();
                }
            } catch (error) {
                console.error('❌ Ошибка создания карты:', error);
                setError(`Ошибка создания карты: ${error.message}`);
                setIsLoading(false);
            }
        });
    };

    const addMarkers = () => {
        if (!mapInstance.current || !window.ymaps) {
            console.warn('⚠️ Карта не готова');
            return;
        }

        console.log(`📌 Добавляем ${markers.length} маркеров`);

        markers.forEach((marker, index) => {
            if (!marker.gps_latitude || !marker.gps_longitude) {
                console.warn(`⚠️ Маркер ${index} без координат`);
                return;
            }

            const color = getMarkerColor(marker.defect_type);
            const defectTypeName = getDefectTypeName(marker.defect_type);
            const formattedDate = formatDateTime(marker.created_at);

            // Создаем кастомный HTML-маркер
            const markerLayout = window.ymaps.templateLayoutFactory.createClass(
                `<div class="custom-marker" style="background: ${color};">
                    <div class="marker-pin"></div>
                    <div class="marker-pulse" style="background: ${color};"></div>
                </div>`
            );

            const placemark = new window.ymaps.Placemark(
                [marker.gps_latitude, marker.gps_longitude],
                {
                    hintContent: `
                        <div style="padding: 8px; font-family: system-ui;">
                            <strong style="font-size: 14px; color: ${color};">Дефект #${marker.detection_id}</strong><br/>
                            <span style="font-size: 12px; color: #666;">Тип: ${defectTypeName}</span><br/>
                            <span style="font-size: 11px; color: #999;">${formattedDate}</span>
                        </div>
                    `,
                    balloonContent: `
                        <div style="padding: 12px; font-family: system-ui;">
                            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: ${color};">Дефект #${marker.detection_id}</h3>
                            <p style="margin: 4px 0;"><strong>Тип:</strong> ${defectTypeName}</p>
                            <p style="margin: 4px 0;"><strong>Дата создания:</strong> ${formattedDate}</p>
                            <button 
                                onclick="window.location.href='/isolator/${marker.image_id}'" 
                                style="margin-top: 10px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;"
                            >
                                Подробнее →
                            </button>
                        </div>
                    `
                },
                {
                    iconLayout: markerLayout,
                    iconShape: {
                        type: 'Circle',
                        coordinates: [0, 0],
                        radius: 15
                    }
                }
            );

            placemark.events.add('click', () => {
                if (onMarkerClick) {
                    onMarkerClick(marker);
                }
            });

            mapInstance.current.geoObjects.add(placemark);
            console.log(`✅ Маркер ${index} добавлен`);
        });

        if (markers.length > 1) {
            mapInstance.current.setBounds(
                mapInstance.current.geoObjects.getBounds(),
                { checkZoomRange: true, zoomMargin: 50 }
            );
        }
    };

    const getMarkerColor = (defectType) => {
        const colors = {
            'crack': '#ef4444',       // Красный
            'corrosion': '#f97316',   // Оранжевый
            'chip': '#eab308',        // Желтый
            'missing-element': '#8b5cf6', // Фиолетовый
            'default': '#3b82f6'      // Синий
        };
        return colors[defectType] || colors['default'];
    };

    const getDefectTypeName = (defectType) => {
        const names = {
            'crack': 'Трещина',
            'corrosion': 'Коррозия',
            'chip': 'Скол',
            'missing-element': 'Отсутствующий элемент',
            'default': 'Неизвестный тип'
        };
        return names[defectType] || names['default'];
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Дата неизвестна';

        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${day}.${month}.${year}, ${hours}:${minutes}`;
    };

    // ДОБАВЛЕНО: Легенда
    const MapLegend = () => {
        const legendItems = [
            { type: 'crack', name: 'Трещина', color: '#ef4444' },
            { type: 'corrosion', name: 'Коррозия', color: '#f97316' },
            { type: 'chip', name: 'Скол', color: '#eab308' },
            { type: 'missing-element', name: 'Отсутствующий элемент', color: '#8b5cf6' }
        ];

        return (
            <div className={styles.mapLegend}>
                <div className={styles.legendTitle}>Типы дефектов</div>
                {legendItems.map(item => (
                    <div key={item.type} className={styles.legendItem}>
                        <div
                            className={styles.legendMarker}
                            style={{ background: item.color }}
                        ></div>
                        <span className={styles.legendText}>{item.name}</span>
                    </div>
                ))}
            </div>
        );
    };

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorText}>❌ {error}</p>
                <button
                    className={styles.retryButton}
                    onClick={() => {
                        setError(null);
                        setIsLoading(true);
                        loadYandexMap();
                    }}
                >
                    Попробовать снова
                </button>
            </div>
        );
    }

    return (
        <div className={styles.mapContainer}>
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <p>Загрузка карты...</p>
                </div>
            )}
            <div ref={mapRef} className={styles.map}></div>
            {!isLoading && <MapLegend />}
        </div>
    );
};

export default YandexMapV2;
