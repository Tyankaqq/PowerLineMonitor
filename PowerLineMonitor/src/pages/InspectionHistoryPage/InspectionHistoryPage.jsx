import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Eye, Edit, Trash2, RefreshCw, AlertTriangle, AlertCircle, XCircle, CheckCircle, AlertOctagon } from 'lucide-react';
import AdvancedFiltersModal from '../../components/AdvancedFiltersModal/AdvancedFiltersModal';
import NewInspectionModal from '../../components/NewInspectionModal/NewInspectionModal';
import ExportReportModal from '../../components/ExportReportModal/ExportReportModal';
import EditInspectionModal from '../../components/EditInspectionModal/EditInspectionModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal/DeleteConfirmModal';
import ConfirmChangesModal from '../../components/ConfirmChangesModal/ConfirmChangesModal';
import Checkbox from '../../components/Checkbox/Checkbox';
import Select from '../../components/Select/Select';
import styles from './InspectionHistoryPage.module.css';
import { fetchImagesList } from '../../API/ImagesAPI/ImagesAPI';


const ITEMS_PER_PAGE = 10;

const objectTypeLabels = {
    'vibration_damper': 'Виброгаситель',
    'festoon_insulators': 'Гирлянда изоляторов',
    'traverse': 'Траверса',
    'nest': 'Гнездо',
    'safety_sign': 'Знак безопасности',
    'polymer_insulators': 'Полимерный изолятор',
};

// ДОБАВЛЕНО: Функция для определения цвета критичности
const getCriticalityConfig = (criticality) => {
    if (criticality === null || criticality === undefined) {
        return null;
    }

    const configs = {
        1: { label: 'Низкая', color: '#10b981', Icon: CheckCircle },        // Зеленая галочка
        2: { label: 'Средняя', color: '#f59e0b', Icon: AlertCircle },       // Желтый круг
        3: { label: 'Высокая', color: '#ef4444', Icon: AlertTriangle },     // Красный треугольник
        4: { label: 'Критическая', color: '#dc2626', Icon: AlertOctagon },  // Красный восьмиугольник
        5: { label: 'Экстренная', color: '#991b1b', Icon: XCircle }         // Темно-красный крест
    };

    return configs[criticality];
};

const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length !== 3) return new Date(dateStr);
    const [year, p2, p3] = parts.map(Number);
    if (p2 > 12) return new Date(year, p3 - 1, p2);
    return new Date(year, p2 - 1, p3);
};

const filterByDateRange = (dateStr, range) => {
    if (!range) return true;
    const date = parseDate(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    if (range === 'today') return date >= startOfToday && date < endOfToday;

    if (range === 'week') {
        const day = now.getDay();
        const diffToMonday = (day === 0 ? 6 : day - 1);
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
        const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 7);
        return date >= startOfWeek && date < endOfWeek;
    }

    if (range === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return date >= startOfMonth && date < endOfMonth;
    }
    return true;
};

const InspectionHistoryPage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showNewInspection, setShowNewInspection] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showConfirmChanges, setShowConfirmChanges] = useState(false);

    const [selectedInspection, setSelectedInspection] = useState(null);
    const [editedData, setEditedData] = useState(null);
    const [inspections, setInspections] = useState([]);

    const loadInspections = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchImagesList();

            const mappedData = data.map(item => {
                const translatedType = objectTypeLabels[item.main_class] || item.main_class || 'Не определен';

                return {
                    id: `#${item.image_id}`,
                    realId: item.image_id,
                    date: item.created_at.split('T')[0],
                    objectType: translatedType,
                    confidence: item.main_confidence,
                    imageUrl: item.file_path,
                    criticality: item.criticality, // ДОБАВЛЕНО
                    countDamage: item.count_damage || 0 // ДОБАВЛЕНО
                };
            });

            mappedData.sort((a, b) => b.realId - a.realId);
            setInspections(mappedData);

        } catch (err) {
            console.error('Ошибка при загрузке списка:', err);
            setError('Не удалось загрузить список осмотров. Проверьте соединение.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInspections();
    }, []);

    const filteredInspections = useMemo(() => inspections.filter(i =>
        (searchQuery === '' ||
            i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.objectType.toLowerCase().includes(searchQuery.toLowerCase())) &&
        filterByDateRange(i.date, dateRange)
    ), [inspections, searchQuery, dateRange]);

    const totalPages = Math.ceil(filteredInspections.length / ITEMS_PER_PAGE);

    const paginatedInspections = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredInspections.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredInspections, currentPage]);

    const handleSelectAll = e => {
        if (e.target.checked) setSelectedItems(new Set(paginatedInspections.map(i => i.id)));
        else setSelectedItems(new Set());
    };

    const handleSelectItem = id => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedItems(newSelected);
    };

    const handleRowClick = inspection => {
        navigate(`/isolator/${inspection.realId}`);
    };

    const handleEdit = (e, inspection) => {
        e.stopPropagation();
        setSelectedInspection(inspection);
        setShowEdit(true);
    };

    const handleSaveEdit = (updatedData) => {
        // Сохраняем данные для подтверждения
        setEditedData(updatedData);

        // Сразу обновляем локальное состояние
        setInspections(prev => prev.map(i =>
            i.id === selectedInspection.id
                ? { ...i, criticality: updatedData.criticality }
                : i
        ));

        setShowEdit(false);
        // Не показываем модалку подтверждения, просто закрываем
        setSelectedInspection(null);
        setEditedData(null);
    };

    const handleConfirmEdit = () => {
        // Обновляем только конкретную запись с данными из editedData
        setInspections(prev => prev.map(i =>
            i.id === selectedInspection.id
                ? { ...i, criticality: editedData.criticality }
                : i
        ));

        setShowConfirmChanges(false);
        setEditedData(null);
        setSelectedInspection(null);
    };

    const handleDelete = (e, inspection) => {
        e.stopPropagation();
        setSelectedInspection(inspection);
        setShowDelete(true);
    };

    const handleConfirmDelete = () => {
        setInspections(prev => prev.filter(i => i.id !== selectedInspection.id));
        setShowDelete(false);
    };

    const handleNewInspection = newInspection => {
        setInspections(prev => [newInspection, ...prev]);
    };

    const handleApplyFilters = filters => {
        setShowAdvancedFilters(false);
    };

    return (
        <div className={styles.pageContainer}>
            <main className={styles.mainContent}>
                <div className={styles.pageHeader}>
                    <div>
                        <h1>История Осмотров</h1>
                        <p>Просмотр, фильтрация и экспорт всех прошлых осмотров линий электропередач.</p>
                    </div>

                    <div className={styles.headerActions}>
                        <button
                            className={`${styles.btnSecondary} ${styles.btnEqualSize}`}
                            onClick={loadInspections}
                            title="Обновить список"
                        >
                            <RefreshCw size={18} className={loading ? styles.spin : ''} />
                        </button>
                        <button className={`${styles.btnSecondary} ${styles.btnEqualSize}`} onClick={() => setShowExport(true)}>
                            <Download size={18} /> Экспорт отчета
                        </button>
                    </div>
                </div>

                <div className={styles.filtersBar}>
                    <div className={styles.searchBox}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Поиск по ID, типу объекта..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Дата:</label>
                        <Select
                            options={[
                                { value: '', label: 'Все время' },
                                { value: 'today', label: 'Сегодня' },
                                { value: 'week', label: 'Эта неделя' },
                                { value: 'month', label: 'Этот месяц' },
                            ]}
                            value={dateRange}
                            onChange={setDateRange}
                            placeholder="Выберите диапазон"
                        />
                    </div>

                    <button className={styles.btnIcon} onClick={() => setShowAdvancedFilters(true)}>
                        <Filter size={20} /> Больше фильтров
                    </button>
                </div>

                {error && <div className={styles.errorBlock}>{error}</div>}

                <div className={styles.tableContainer}>
                    {loading ? (
                        <div className={styles.loadingState}>Загрузка данных...</div>
                    ) : (
                        <table className={styles.dataTable}>
                            <thead>
                            <tr>
                                <th>
                                    <Checkbox
                                        checked={paginatedInspections.length > 0 && selectedItems.size === paginatedInspections.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>ID ОСМОТРА</th>
                                <th>ДАТА</th>
                                <th>ТИП ОБЪЕКТА</th>
                                <th>УВЕРЕННОСТЬ</th>
                                <th>ПОВРЕЖДЕНИЙ</th> {/* ДОБАВЛЕНО */}
                                <th>КРИТИЧНОСТЬ</th> {/* ДОБАВЛЕНО */}
                                <th>ДЕЙСТВИЯ</th>
                            </tr>
                            </thead>
                            <tbody>
                            {paginatedInspections.length > 0 ? (
                                paginatedInspections.map(inspection => {
                                    const criticalityConfig = getCriticalityConfig(inspection.criticality);

                                    return (
                                        <tr key={inspection.id} className={styles.rowWithBorder} onClick={() => handleRowClick(inspection)}>
                                            <td onClick={e => e.stopPropagation()}>
                                                <Checkbox checked={selectedItems.has(inspection.id)} onChange={() => handleSelectItem(inspection.id)} />
                                            </td>
                                            <td className={styles.idCell}>{inspection.id}</td>
                                            <td>{inspection.date}</td>
                                            <td>{inspection.objectType}</td>
                                            <td>{(inspection.confidence * 100).toFixed(2)}%</td>

                                            {/* ДОБАВЛЕНО: Количество повреждений */}
                                            <td>
                                                <span className={styles.damageCount}>
                                                    {inspection.countDamage > 0 && (
                                                        <AlertTriangle size={14} style={{ color: '#ef4444', marginRight: '4px' }} />
                                                    )}
                                                    {inspection.countDamage}
                                                </span>
                                            </td>

                                            {/* ДОБАВЛЕНО: Критичность с цветовой индикацией */}
                                            <td>
                                                {criticalityConfig ? (
                                                    <div className={styles.criticalityIcon} title={criticalityConfig.label}>
                                                        <criticalityConfig.Icon
                                                            size={20}
                                                            color={criticalityConfig.color}
                                                            strokeWidth={2.5}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className={styles.noCriticality}>—</span>
                                                )}
                                            </td>

                                            <td className={styles.actionsCell} onClick={e => e.stopPropagation()}>
                                                <button className={styles.actionBtn} title="Просмотр" onClick={() => handleRowClick(inspection)}>
                                                    <Eye size={16} />
                                                </button>
                                                <button className={styles.actionBtn} title="Редактировать" onClick={(e) => handleEdit(e, inspection)}>
                                                    <Edit size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className={styles.emptyState}>Нет данных для отображения</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className={styles.pagination}>
                    <span>
                        Показано {filteredInspections.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0}-
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredInspections.length)} из {filteredInspections.length}
                    </span>
                    <div className={styles.paginationControls}>
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                        >
                            Назад
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            className={styles.pageBtn}
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Вперед
                        </button>
                    </div>
                </div>

                <AdvancedFiltersModal isOpen={showAdvancedFilters} onClose={() => setShowAdvancedFilters(false)} onApply={handleApplyFilters} />
                <NewInspectionModal isOpen={showNewInspection} onClose={() => setShowNewInspection(false)} onSubmit={handleNewInspection} />
                <ExportReportModal isOpen={showExport} onClose={() => setShowExport(false)} inspections={filteredInspections} />
                <EditInspectionModal isOpen={showEdit} onClose={() => setShowEdit(false)} inspection={selectedInspection} onSave={handleSaveEdit} />
                <DeleteConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleConfirmDelete} itemName={selectedInspection?.id} />
                <ConfirmChangesModal isOpen={showConfirmChanges} onClose={() => setShowConfirmChanges(false)} onConfirm={handleConfirmEdit} original={selectedInspection} edited={editedData} />
            </main>
        </div>
    );
};

export default InspectionHistoryPage;
