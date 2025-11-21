import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Wrench, FileClock, XCircle, CheckCircle } from 'lucide-react';
import StatCard from './StatCard.jsx';
import YandexMap from '../../components/YandexMap/YandexMapV2.jsx';
import DefectSidebar from '../../components/DeffectSidebar/DeffectSidebar.jsx';
import styles from './DashboardPage.module.css';
import { fetchGeneralStats, fetchDetectionsByDate } from '../../API/StatisticsAPI/StatisticsAPI';
import { fetchDetectionsForMap } from '../../API/MapAPI/MapAPI';

// [translate: Функция для получения локальной даты в формате YYYY-MM-DD]
const getLocalDate = (daysOffset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const LineChart = ({ data }) => {
    const svgRef = useRef(null);
    const [lineLength, setLineLength] = useState(0);
    const PADDING = 40;
    const SVG_WIDTH = 600;
    const SVG_HEIGHT = 250;

    const maxDefects = Math.max(...data.map(d => d.count || 0), 10);

    const yAxisTicks = useMemo(() => {
        const numTicks = 5;
        const roundedMax = Math.ceil(maxDefects / 10) * 10;
        if (roundedMax === 0) return [0, 10, 20, 30, 40];
        return Array.from({ length: numTicks }, (_, i) => Math.round((i / (numTicks - 1)) * roundedMax));
    }, [maxDefects]);

    const topYValue = yAxisTicks[yAxisTicks.length - 1] || 1;

    const points = useMemo(() => {
        if (data.length === 0) return '';
        return data.map((point, i) => {
            const x = PADDING + (i / (data.length - 1)) * (SVG_WIDTH - 2 * PADDING);
            const yValue = point.count || 0;
            const y = SVG_HEIGHT - PADDING - (yValue / topYValue) * (SVG_HEIGHT - 2 * PADDING);
            return `${x},${y}`;
        }).join(' ');
    }, [data, topYValue]);

    useEffect(() => {
        const path = svgRef.current;
        if (path) {
            const length = path.getTotalLength();
            setLineLength(length);
        }
    }, [points]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return dateStr.split('-').slice(1).reverse().join('.');
    };

    return (
        <div className={styles.lineChartContainer}>
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} width="100%" height="100%">
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--accent-blue-light)" />
                        <stop offset="100%" stopColor="var(--accent-blue)" />
                    </linearGradient>
                </defs>

                {yAxisTicks.map((tick, i) => (
                    <g key={i} className={styles.gridLineGroup}>
                        <line
                            x1={PADDING}
                            y1={SVG_HEIGHT - PADDING - (tick / topYValue) * (SVG_HEIGHT - 2 * PADDING)}
                            x2={SVG_WIDTH - PADDING}
                            y2={SVG_HEIGHT - PADDING - (tick / topYValue) * (SVG_HEIGHT - 2 * PADDING)}
                            className={styles.gridLine}
                        />
                        <text
                            x={PADDING - 8}
                            y={SVG_HEIGHT - PADDING - (tick / topYValue) * (SVG_HEIGHT - 2 * PADDING) + 3}
                            textAnchor="end"
                            className={styles.yAxisLabel}
                        >
                            {tick}
                        </text>
                    </g>
                ))}

                <line
                    x1={PADDING}
                    y1={SVG_HEIGHT - PADDING}
                    x2={SVG_WIDTH - PADDING}
                    y2={SVG_HEIGHT - PADDING}
                    stroke="var(--border-color)"
                />

                {points && (
                    <polyline
                        ref={svgRef}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        points={points}
                        className={styles.lineChartPath}
                        style={{ '--line-length': lineLength }}
                    />
                )}

                {data.map((point, i) => {
                    const x = PADDING + (i / (data.length - 1)) * (SVG_WIDTH - 2 * PADDING);
                    const yValue = point.count || 0;
                    const y = SVG_HEIGHT - PADDING - (yValue / topYValue) * (SVG_HEIGHT - 2 * PADDING);
                    return (
                        <g key={i}>
                            <text
                                x={x}
                                y={SVG_HEIGHT - PADDING + 15}
                                textAnchor="middle"
                                fill="var(--text-secondary)"
                                fontSize="10"
                            >
                                {formatDate(point.date)}
                            </text>
                            <circle
                                cx={x}
                                cy={y}
                                r="5"
                                fill="var(--accent-blue)"
                                className={styles.lineChartPoint}
                            />
                            <g className={styles.tooltip}>
                                <rect
                                    x={x - 20}
                                    y={y - 35}
                                    width="40"
                                    height="25"
                                    rx="5"
                                    fill="var(--bg-darker)"
                                />
                                <text
                                    x={x}
                                    y={y - 20}
                                    textAnchor="middle"
                                    fill="var(--text-primary)"
                                    fontSize="12"
                                    fontWeight="bold"
                                >
                                    {yValue}
                                </text>
                            </g>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const DashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState(null);

    const [generalStats, setGeneralStats] = useState(null);
    const [dailyDefects, setDailyDefects] = useState([]);
    const [mapMarkers, setMapMarkers] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const [startDate, setStartDate] = useState(() => getLocalDate(-13));
    const [endDate, setEndDate] = useState(() => getLocalDate(0));

    useEffect(() => {
        const loadGeneralData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [statsData, mapData] = await Promise.all([
                    fetchGeneralStats(),
                    fetchDetectionsForMap()
                ]);
                setGeneralStats(statsData);
                setMapMarkers(mapData);
            } catch (err) {
                console.error('Ошибка загрузки общих данных:', err);
                setError('Не удалось загрузить данные аналитики');
            } finally {
                setLoading(false);
            }
        };
        loadGeneralData();
    }, []);

    useEffect(() => {
        const loadChartData = async () => {
            setChartLoading(true);
            try {
                const detectionsData = await fetchDetectionsByDate(startDate, endDate);
                setDailyDefects(detectionsData);
            } catch (err) {
                console.error('Ошибка загрузки данных графика:', err);
            } finally {
                setChartLoading(false);
            }
        };

        // Загрузка при монтировании и при изменении дат
        loadChartData();

        // Автообновление графика каждые 30 секунд
        const intervalId = setInterval(() => {
            loadChartData();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [startDate, endDate]);

    // Обновление endDate при возврате фокуса
    useEffect(() => {
        const handleFocus = () => {
            const today = getLocalDate(0);
            if (today !== endDate) setEndDate(today);
        };
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                const today = getLocalDate(0);
                if (today !== endDate) setEndDate(today);
            }
        };
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [endDate]);

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
    };

    const handleCloseSidebar = () => {
        setSelectedMarker(null);
    };

    if (loading) return <div className={styles.loadingState}>Загрузка аналитики...</div>;
    if (error) return <div className={styles.errorState}>{error}</div>;
    if (!generalStats) return <div className={styles.errorState}>Не удалось загрузить данные.</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Аналитическая панель</h1>
                <p>Обзор состояния и производительности системы.</p>
            </div>

            <div className={styles.statsLayout}>
                <div className={styles.statsRow}>
                    <StatCard
                        icon={<FileClock size={24} />}
                        title="Открытые заявки"
                        value={generalStats.open_repair_requests || 0}
                        style={{ '--animation-order': 1 }}
                    />
                    <StatCard
                        icon={<CheckCircle size={24} />}
                        title="Выполненные"
                        value={generalStats.completed_repair_requests || 0}
                        style={{ '--animation-order': 2 }}
                    />
                    <StatCard
                        icon={<XCircle size={24} />}
                        title="Отмененные"
                        value={generalStats.closed_repair_requests || 0}
                        style={{ '--animation-order': 3 }}
                    />
                </div>
                <div className={styles.statsRow}>
                    <StatCard
                        isLarge={true}
                        icon={<AlertTriangle size={32} />}
                        title="Всего дефектов"
                        value={generalStats.total_defects || 0}
                        style={{ '--animation-order': 4 }}
                    />
                    <StatCard
                        isLarge={true}
                        icon={<Wrench size={32} />}
                        title="Всего заявок"
                        value={generalStats.total_repair_requests || 0}
                        style={{ '--animation-order': 5 }}
                    />
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <div className={styles.chartCard} style={{ '--animation-order': 6 }}>
                    <div className={styles.chartHeader}>
                        <h3>Динамика дефектов</h3>
                        <div className={styles.dateInputGroup}>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className={styles.dateInput}
                            />
                            <span>-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className={styles.dateInput}
                            />
                        </div>
                    </div>
                    {chartLoading ? (
                        <div style={{
                            textAlign: 'center',
                            color: 'var(--text-secondary)',
                            padding: '2rem',
                            minHeight: '250px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            Обновление графика...
                        </div>
                    ) : dailyDefects.length > 0 ? (
                        <LineChart key={`${startDate}-${endDate}-${dailyDefects.length}`} data={dailyDefects} />
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                           Нет данных за выбранный период
                        </p>
                    )}
                </div>

                <div className={styles.chartCard} style={{ '--animation-order': 7 }}>
                    <h3>Карта дефектов ({mapMarkers.length})</h3>
                    <YandexMap markers={mapMarkers} onMarkerClick={handleMarkerClick} />
                </div>
            </div>

            {selectedMarker && (
                <DefectSidebar
                    marker={selectedMarker}
                    onClose={handleCloseSidebar}
                />
            )}
        </div>
    );
};

export default DashboardPage;
