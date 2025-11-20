import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AlertTriangle, Wrench, FileClock, XCircle, CheckCircle } from 'lucide-react';
import StatCard from './StatCard.jsx';
import styles from './DashboardPage.module.css';

const generateDailyDefects = (days) => {
    const data = [];
    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        data.push({ date: date.toISOString().split('T')[0], defects: Math.floor(Math.random() * 40) + 5 });
    }
    return data.reverse();
};

const mockDashboardData = {
    generalStats: { totalDefects: 1152 },
    repairStats: { total: 152, open: 35, completed: 110, cancelled: 7 },
    defectTypes: [
        { type: 'Коррозия', count: 82, color: '#ef4444' },
        { type: 'Трещина', count: 41, color: '#f97316' },
        { type: 'Скол', count: 18, color: '#eab308' },
        { type: 'Отсутствие элемента', count: 9, color: '#8b5cf6' },
    ],
    dailyDefects: generateDailyDefects(90),
};

const LineChart = ({ data }) => {
    const svgRef = useRef(null);
    const [lineLength, setLineLength] = useState(0);
    const PADDING = 40; const SVG_WIDTH = 600; const SVG_HEIGHT = 250;
    const maxDefects = Math.max(...data.map(d => d.defects), 10);
    const yAxisTicks = useMemo(() => { const numTicks = 5; const roundedMax = Math.ceil(maxDefects / 10) * 10; if (roundedMax === 0) return []; return Array.from({ length: numTicks }, (_, i) => Math.round((i / (numTicks - 1)) * roundedMax)); }, [maxDefects]);
    const topYValue = yAxisTicks[yAxisTicks.length - 1] || 1;
    const points = useMemo(() => { if (data.length === 0) return ''; return data.map((point, i) => { const x = PADDING + (i / (data.length - 1)) * (SVG_WIDTH - 2 * PADDING); const y = SVG_HEIGHT - PADDING - (point.defects / topYValue) * (SVG_HEIGHT - 2 * PADDING); return `${x},${y}`; }).join(' '); }, [data, topYValue]);
    useEffect(() => { const path = svgRef.current; if (path) setLineLength(path.getTotalLength()); }, [points]);
    const formatDate = (dateStr) => dateStr.split('-').slice(1).reverse().join('.');
    return (
        <div className={styles.lineChartContainer}>
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} width="100%" height="100%">
                <defs><linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="var(--accent-blue-light)" /><stop offset="100%" stopColor="var(--accent-blue)" /></linearGradient></defs>
                {yAxisTicks.map((tick, i) => (<g key={i} className={styles.gridLineGroup}><line x1={PADDING} y1={SVG_HEIGHT - PADDING - (tick / topYValue) * (SVG_HEIGHT - 2 * PADDING)} x2={SVG_WIDTH - PADDING} y2={SVG_HEIGHT - PADDING - (tick / topYValue) * (SVG_HEIGHT - 2 * PADDING)} className={styles.gridLine} /><text x={PADDING - 8} y={SVG_HEIGHT - PADDING - (tick / topYValue) * (SVG_HEIGHT - 2 * PADDING) + 3} textAnchor="end" className={styles.yAxisLabel}>{tick}</text></g>))}
                <line x1={PADDING} y1={SVG_HEIGHT - PADDING} x2={SVG_WIDTH - PADDING} y2={SVG_HEIGHT - PADDING} stroke="var(--border-color)" />
                {points && (<polyline ref={svgRef} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" points={points} className={styles.lineChartPath} style={{ '--line-length': lineLength }} />)}
                {data.map((point, i) => { const x = PADDING + (i / (data.length - 1)) * (SVG_WIDTH - 2 * PADDING); const y = SVG_HEIGHT - PADDING - (point.defects / topYValue) * (SVG_HEIGHT - 2 * PADDING); return (<g key={i}><text x={x} y={SVG_HEIGHT - PADDING + 15} textAnchor="middle" fill="var(--text-secondary)" fontSize="10">{formatDate(point.date)}</text><circle cx={x} cy={y} r="5" fill="var(--accent-blue)" className={styles.lineChartPoint} /><g className={styles.tooltip}><rect x={x - 20} y={y - 35} width="40" height="25" rx="5" fill="var(--bg-darker)" /><text x={x} y={y - 20} textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="bold">{point.defects}</text></g></g>);})}
            </svg>
        </div>
    );
};


const DashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 13); return d.toISOString().split('T')[0]; });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const timer = setTimeout(() => { setData(mockDashboardData); setLoading(false); }, 1200);
        return () => clearTimeout(timer);
    }, []);

    const filteredDefects = useMemo(() => {
        if (!data) return [];
        return data.dailyDefects.filter(d => d.date >= startDate && d.date <= endDate);
    }, [data, startDate, endDate]);

    if (loading) return <div className={styles.loadingState}>Загрузка аналитики...</div>;
    if (!data) return <div className={styles.errorState}>Не удалось загрузить данные.</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <h1>Аналитическая панель</h1>
                <p>Обзор состояния и производительности системы.</p>
            </div>

            {/* --- НОВАЯ СТРУКТУРА КАРТОЧЕК --- */}
            <div className={styles.statsLayout}>
                <div className={styles.statsRow}>
                    <StatCard icon={<FileClock size={24} />} title="Открытые заявки" value={data.repairStats.open} style={{ '--animation-order': 1 }} />
                    <StatCard icon={<CheckCircle size={24} />} title="Выполненные" value={data.repairStats.completed} style={{ '--animation-order': 2 }} />
                    <StatCard icon={<XCircle size={24} />} title="Отмененные" value={data.repairStats.cancelled} style={{ '--animation-order': 3 }} />
                </div>
                <div className={styles.statsRow}>
                    <StatCard isLarge={true} icon={<AlertTriangle size={32} />} title="Всего дефектов" value={data.generalStats.totalDefects} style={{ '--animation-order': 4 }} />
                    <StatCard isLarge={true} icon={<Wrench size={32} />} title="Всего заявок" value={data.repairStats.total} style={{ '--animation-order': 5 }} />
                </div>
            </div>

            <div className={styles.chartsGrid}>
                <div className={styles.chartCard} style={{ '--animation-order': 6 }}>
                    <h3>Типы дефектов</h3>
                    <div className={styles.pieChartContainer}>
                        <div className={styles.pieChart} style={{ background: `conic-gradient(${data.defectTypes.reduce((acc, item) => { const total = data.defectTypes.reduce((s, i) => s + i.count, 0); const start = acc.prevEnd; const end = start + (item.count / total) * 360; acc.str += `${item.color} ${start}deg ${end}deg, `; acc.prevEnd = end; return acc; }, { str: '', prevEnd: 0 }).str.slice(0, -2)})`}}></div>
                        <div className={styles.pieChartLegend}>
                            {data.defectTypes.map(item => (<div key={item.type} className={styles.legendItem}><span className={styles.legendColor} style={{ backgroundColor: item.color }}></span><span className={styles.legendText}>{item.type} ({item.count})</span></div>))}
                        </div>
                    </div>
                </div>

                <div className={styles.chartCard} style={{ '--animation-order': 7 }}>
                    <div className={styles.chartHeader}>
                        <h3>Динамика дефектов</h3>
                        <div className={styles.dateInputGroup}>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={styles.dateInput} /><span>-</span><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={styles.dateInput} />
                        </div>
                    </div>
                    <LineChart data={filteredDefects} />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
