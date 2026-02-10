// src/components/ui/ProgressBar.jsx
import React from 'react';
import { BRAND_COLORS } from '../../constants/appConfig';

/**
 * 進捗バーコンポーネント
 * @param {number} progress - 進捗率（0-100）
 * @param {string} height - バーの高さ（Tailwindクラス）
 * @param {string} color - バーの色
 */
const ProgressBar = ({ progress, height = "h-2", color = BRAND_COLORS.BLUE }) => (
  <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
    <div 
      className="h-full transition-all duration-700 ease-out" 
      style={{ 
        width: `${Math.min(100, Math.max(0, progress))}%`, 
        backgroundColor: color 
      }}
    ></div>
  </div>
);

export default ProgressBar;