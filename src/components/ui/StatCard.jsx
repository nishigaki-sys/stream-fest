// src/components/ui/StatCard.jsx
import React from 'react';

/**
 * 統計カードコンポーネント
 * @param {string} title - 表示するタイトル
 * @param {string|number} value - メインの値
 * @param {string} subValue - 補助的なテキスト（任意）
 * @param {LucideIcon} icon - Lucide-reactのアイコンコンポーネント
 * @param {string} color - ブランドカラー（BRAND_COLORS）
 * @param {boolean} isCurrency - 通貨形式（¥）で表示するかどうか
 */
const StatCard = ({ title, value, subValue, icon: Icon, color, isCurrency = false }) => (
  <div className="p-4 sm:p-5 rounded-2xl border bg-white shadow-sm flex items-start justify-between transition-all hover:shadow-md">
    <div className="min-w-0">
      <span className="text-gray-500 text-[10px] sm:text-sm font-medium block truncate">{title}</span>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-lg sm:text-2xl font-black" style={{ color }}>
          {isCurrency ? `¥${Number(value).toLocaleString()}` : value}
        </span>
        {subValue && <span className="text-[8px] sm:text-xs text-gray-400 whitespace-nowrap">{subValue}</span>}
      </div>
    </div>
    <div className="p-1.5 sm:p-2 rounded-xl shrink-0" style={{ backgroundColor: `${color}15`, color: color }}>
      <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
    </div>
  </div>
);

export default StatCard;