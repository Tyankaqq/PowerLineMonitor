import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';

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

                    <Route path="/isolator/:id" element={<IsolatorDetailPage />} />
                    <Route path="/inspections" element={<InspectionHistoryPage />} />
                    <Route path="/" element={<ImageUploadPage />} />
                </Routes>

            </div>
        </Router>
        </NotificationProvider>
    );
}

export default App;
