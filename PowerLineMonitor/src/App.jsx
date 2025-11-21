import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';

// Импортируем все страницы, включая новую
import DashboardPage from './pages/DashboardPage/DashboardPage';
import IsolatorDetailPage from './pages/IsolatorDetailPage/IsolatorDetailPage';
import InspectionHistoryPage from './pages/InspectionHistoryPage/InspectionHistoryPage';
import ImageUploadPage from './pages/ImageUploadPage/ImageUploadPage';

import styles from './App.module.css';
import { NotificationProvider } from './hooks/useNotifications.jsx';

function App() {
    return (
        <NotificationProvider>
            <Router>
                <div className={styles.app}>
                    <Header />
                    <Routes>
                        {/* Дашборд теперь главная страница */}
                        <Route path="/dashboard" element={<DashboardPage />} />

                        {/* Старая главная страница теперь на /upload */}
                        <Route path="/" element={<ImageUploadPage />} />

                        {/* Остальные роуты без изменений */}
                        <Route path="/isolator/:id" element={<IsolatorDetailPage />} />
                        <Route path="/inspections" element={<InspectionHistoryPage />} />
                    </Routes>
                </div>
            </Router>
        </NotificationProvider>
    );
}

export default App;
