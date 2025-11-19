// src/hooks/useTowerExpansion.js
import { useState } from 'react';

export const useTowerExpansion = (initialExpandedIds = []) => {
    const [expandedTowers, setExpandedTowers] = useState(new Set(initialExpandedIds));

    const toggleTower = (towerId) => {
        setExpandedTowers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(towerId)) {
                newSet.delete(towerId);
            } else {
                newSet.add(towerId);
            }
            return newSet;
        });
    };

    const expandTower = (towerId) => {
        setExpandedTowers(prev => new Set([...prev, towerId]));
    };

    const collapseTower = (towerId) => {
        setExpandedTowers(prev => {
            const newSet = new Set(prev);
            newSet.delete(towerId);
            return newSet;
        });
    };

    const collapseAll = () => {
        setExpandedTowers(new Set());
    };

    const expandAll = (towerIds) => {
        setExpandedTowers(new Set(towerIds));
    };

    return {
        expandedTowers,
        toggleTower,
        expandTower,
        collapseTower,
        collapseAll,
        expandAll
    };
};
