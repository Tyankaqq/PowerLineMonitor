import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, Download, Eye, Edit, RefreshCw, AlertTriangle, AlertCircle, XCircle, CheckCircle, AlertOctagon, ChevronDown, ChevronRight, Folder, FolderOpen, MapPin } from 'lucide-react';
import AdvancedFiltersModal from '../../components/AdvancedFiltersModal/AdvancedFiltersModal';
import NewInspectionModal from '../../components/NewInspectionModal/NewInspectionModal';
import ExportReportModal from '../../components/ExportReportModal/ExportReportModal';
import EditInspectionModal from '../../components/EditInspectionModal/EditInspectionModal';
import DeleteConfirmModal from '../../components/DeleteConfirmModal/DeleteConfirmModal';
import ConfirmChangesModal from '../../components/ConfirmChangesModal/ConfirmChangesModal';
import Checkbox from '../../components/Checkbox/Checkbox';
import Select from '../../components/Select/Select';
import YandexMap from '../../components/YandexMap/YandexMapV2.jsx';
import DefectSidebar from '../../components/DeffectSidebar/DeffectSidebar.jsx';
import styles from './InspectionHistoryPage.module.css';
import { fetchImagesList } from '../../API/ImagesAPI/ImagesAPI';
import { fetchRoutesList } from '../../API/RoutesAPI/RoutesAPI';
import { fetchDetectionsForRouteMap } from '../../API/MapAPI/MapAPI';

const ITEMS_PER_PAGE = 10;

const objectTypeLabels = {
    'vibration_damper': 'Виброгаситель',
    'festoon_insulators': 'Гирлянда изоляторов',
    'traverse': 'Траверса',
    'nest': 'Гнездо',
    'safety_sign': 'Знак безопасности',
    'polymer_insulators': 'Полимерный изолятор',
};

const getCriticalityConfig = (criticality) => {
    if (criticality === null || criticality === undefined) return null;
    const configs = {
        1: { label: 'Низкая', color: '#10b981', Icon: CheckCircle },
        2: { label: 'Средняя', color: '#f59e0b', Icon: AlertCircle },
        3: { label: 'Высокая', color: '#ef4444', Icon: AlertTriangle },
        4: { label: 'Критическая', color: '#dc2626', Icon: AlertOctagon },
        5: { label: 'Экстренная', color: '#991b1b', Icon: XCircle }
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
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState(new Set());

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showNewInspection, setShowNewInspection] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [showConfirmChanges, setShowConfirmChanges] = useState(false);

    const [selectedInspection, setSelectedInspection] = useState(null);
    const [editedData, setEditedData] = useState(null);
    const [inspections, setInspections] = useState([]);
    const [routes, setRoutes] = useState([]);

    // Состояния для карты
    const [selectedRouteForMap, setSelectedRouteForMap] = useState(null);
    const [mapMarkers, setMapMarkers] = useState([]);
    const [loadingMap, setLoadingMap] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [imagesData, routesData] = await Promise.all([
                fetchImagesList(),
                fetchRoutesList()
            ]);

            const mappedData = imagesData.map(item => {
                const translatedType = objectTypeLabels[item.main_class] || item.main_class || 'Не определен';
                return {
                    id: `#${item.image_id}`,
                    realId: item.image_id,
                    date: item.created_at.split('T')[0],
                    objectType: translatedType,
                    confidence: item.main_confidence,
                    imageUrl: item.file_path,
                    criticality: item.criticality,
                    countDamage: item.count_damage || 0,
                    routeId: item.route_id
                };
            });

            mappedData.sort((a, b) => b.realId - a.realId);
            setInspections(mappedData);
            setRoutes(routesData);
        } catch (err) {
            console.error('Ошибка при загрузке данных:', err);
            setError('Не удалось загрузить данные. Проверьте соединение.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Автоматически раскрываем папку после загрузки фото
    useEffect(() => {
        if (location.state?.expandRouteId && routes.length > 0) {
            setExpandedFolders(new Set([location.state.expandRouteId]));
            loadMapForRoute(location.state.expandRouteId);
            window.history.replaceState({}, document.title);
        }
    }, [location.state, routes]);

    // Загрузка маркеров карты для выбранного route
    const loadMapForRoute = async (routeId) => {
        setLoadingMap(true);
        try {
            const markers = await fetchDetectionsForRouteMap(routeId);
            console.log('Загружены маркеры для route', routeId, ':', markers);
            setMapMarkers(markers);
            setSelectedRouteForMap(routeId);
        } catch (err) {
            console.error('Ошибка загрузки карты:', err);
            setMapMarkers([]);
        } finally {
            setLoadingMap(false);
        }
    };

    const filteredInspections = useMemo(() => inspections.filter(i =>
        (searchQuery === '' ||
            i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.objectType.toLowerCase().includes(searchQuery.toLowerCase())) &&
        filterByDateRange(i.date, dateRange)
    ), [inspections, searchQuery, dateRange]);

    const inspectionsByRoute = useMemo(() => {
        const grouped = {};
        routes.forEach(route => {
            grouped[route.id] = filteredInspections.filter(i => i.routeId === route.id);
        });
        return grouped;
    }, [routes, filteredInspections]);

    const toggleFolder = (routeId) => {
        const next = new Set(expandedFolders);
        if (next.has(routeId)) {
            next.delete(routeId);
            if (selectedRouteForMap === routeId) {
                setSelectedRouteForMap(null);
                setMapMarkers([]);
            }
        } else {
            next.add(routeId);
            loadMapForRoute(routeId);
        }
        setExpandedFolders(next);
    };

    const handleSelectAll = (e, items) => {
        e.stopPropagation();
        const newSelected = new Set(selectedItems);
        if (e.target.checked) {
            items.forEach(i => newSelected.add(i.id));
        } else {
            items.forEach(i => newSelected.delete(i.id));
        }
        setSelectedItems(newSelected);
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
        setEditedData(updatedData);
        setInspections(prev => prev.map(i =>
            i.id === selectedInspection.id
                ? { ...i, criticality: updatedData.criticality }
                : i
        ));
        setShowEdit(false);
        setSelectedInspection(null);
        setEditedData(null);
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

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
    };

    const handleCloseSidebar = () => {
        setSelectedMarker(null);
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('ru-RU');
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
                            onClick={loadData}
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

                {loading ? (
                    <div className={styles.loadingState}>Загрузка данных...</div>
                ) : (
                    <div className={styles.foldersContainer}>
                        {routes.map((route, folderIndex) => {
                            const isExpanded = expandedFolders.has(route.id);
                            const FolderIcon = isExpanded ? FolderOpen : Folder;
                            const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
                            const items = inspectionsByRoute[route.id] || [];
                            const showMap = selectedRouteForMap === route.id && isExpanded;

                            return (
                                <div key={route.id} className={styles.folderBlock} style={{'--folder-index': folderIndex}}>
                                    <div className={styles.folderHeader} onClick={() => toggleFolder(route.id)}>
                                        <ChevronIcon size={20} className={styles.folderChevron} />
                                        <FolderIcon size={20} className={styles.folderIcon} />
                                        <h3 className={styles.folderTitle}>
                                            {route.name} — {formatDate(route.created_at)}
                                        </h3>
                                        <span className={styles.folderCount}>({items.length})</span>
                                    </div>

                                    {isExpanded && (
                                        <div className={styles.folderContent}>
                                            {/* КАРТА - ВСЕГДА СВЕРХУ */}
                                            <div className={styles.mapSection}>
                                                <div className={styles.mapHeader}>
                                                    <MapPin size={20} />
                                                    <h4>Карта дефектов ({mapMarkers.length})</h4>
                                                </div>
                                                {loadingMap ? (
                                                    <div className={styles.mapLoading}>Загрузка карты...</div>
                                                ) : mapMarkers.length > 0 ? (
                                                    <div className={styles.mapContainer}>
                                                        <YandexMap
                                                            markers={mapMarkers}
                                                            onMarkerClick={handleMarkerClick}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className={styles.noMapData}>
                                                        Нет координат для отображения на карте
                                                    </div>
                                                )}
                                            </div>

                                            {/* ТАБЛИЦА - ПОД КАРТОЙ */}
                                            {items.length === 0 ? (
                                                <div className={styles.noData}>Нет осмотров в этом вылете</div>
                                            ) : (
                                                <div className={styles.tableContainer}>
                                                    <table className={styles.dataTable}>
                                                        <thead>
                                                        <tr>
                                                            <th>
                                                                <Checkbox
                                                                    checked={items.length > 0 && items.every(i => selectedItems.has(i.id))}
                                                                    onChange={(e) => handleSelectAll(e, items)}
                                                                />
                                                            </th>
                                                            <th>ID ОСМОТРА</th>
                                                            <th>ДАТА</th>
                                                            <th>ТИП ОБЪЕКТА</th>
                                                            <th>УВЕРЕННОСТЬ</th>
                                                            <th>ПОВРЕЖДЕНИЙ</th>
                                                            <th>КРИТИЧНОСТЬ</th>
                                                            <th>ДЕЙСТВИЯ</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {items.map((inspection, index) => {
                                                            const criticalityConfig = getCriticalityConfig(inspection.criticality);
                                                            return (
                                                                <tr key={inspection.id} className={styles.rowWithBorder} onClick={() => handleRowClick(inspection)} style={{'--row-index': index}}>
                                                                    <td onClick={e => e.stopPropagation()}>
                                                                        <Checkbox checked={selectedItems.has(inspection.id)} onChange={() => handleSelectItem(inspection.id)} />
                                                                    </td>
                                                                    <td className={styles.idCell}>{inspection.id}</td>
                                                                    <td>{inspection.date}</td>
                                                                    <td>{inspection.objectType}</td>
                                                                    <td>{(inspection.confidence * 100).toFixed(2)}%</td>
                                                                    <td>
                                                                        <span className={styles.damageCount}>
                                                                            {inspection.countDamage > 0 && (
                                                                                <AlertTriangle size={14} style={{ color: '#ef4444', marginRight: '4px' }} />
                                                                            )}
                                                                            {inspection.countDamage}
                                                                        </span>
                                                                    </td>
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
                                                        })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Sidebar для маркера */}
                {selectedMarker && (
                    <DefectSidebar
                        marker={selectedMarker}
                        onClose={handleCloseSidebar}
                    />
                )}

                <AdvancedFiltersModal isOpen={showAdvancedFilters} onClose={() => setShowAdvancedFilters(false)} onApply={() => setShowAdvancedFilters(false)} />
                <NewInspectionModal isOpen={showNewInspection} onClose={() => setShowNewInspection(false)} onSubmit={handleNewInspection} />
                <ExportReportModal isOpen={showExport} onClose={() => setShowExport(false)} inspections={filteredInspections} />
                <EditInspectionModal isOpen={showEdit} onClose={() => setShowEdit(false)} inspection={selectedInspection} onSave={handleSaveEdit} />
                <DeleteConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleConfirmDelete} itemName={selectedInspection?.id} />
                <ConfirmChangesModal isOpen={showConfirmChanges} onClose={() => setShowConfirmChanges(false)} onConfirm={() => setShowConfirmChanges(false)} original={selectedInspection} edited={editedData} />
            </main>
        </div>
    );
};

export default InspectionHistoryPage;
