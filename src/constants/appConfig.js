/**
 * アプリケーション全体で使用する定数定義
 */

// UIで使用するブランドカラー（重複を統合）
export const BRAND_COLORS = { 
  BLUE: '#284db3', 
  GREEN: '#34cc99', 
  YELLOW: '#fef667', 
  RED: '#fd594e', 
  ORANGE: '#fe9a33',
  LIGHT_GREEN: '#c2e086', 
  PINK: '#ffc1bc'
};

// ユーザーの権限役割
export const ROLES = { 
  HQ: '本部', 
  HOST: '主催', 
  PARTNER: '提供', 
  SUPPORT: '後援・共催' 
};

// タスクの進捗ステータス（重複を統合し、実用的な4つに絞り込み）
export const TASK_STATUS = { 
  TODO: '未着手', 
  IN_PROGRESS: '進行中', 
  PENDING: '確認待ち', // または '遅延' 
  DONE: '完了' 
};

// タスク管理の大分類カテゴリ
export const CATEGORIES = [
  "企画・全体管理",
  "コンテンツ・制作",
  "会場・施工",
  "運営・ロジ",
  "集客・顧客管理"
];

// カテゴリごとの色定義（TaskTableで使用）
export const CATEGORY_COLORS = {
  "企画・全体管理": "#284db3",    // ブルー
  "コンテンツ・制作": "#8b5cf6",  // パープル
  "会場・施工": "#10b981",       // グリーン
  "運営・ロジ": "#f59e0b",       // オレンジ
  "集客・顧客管理": "#ec4899"    // ピンク
};

// 予算管理のカテゴリ
export const BUDGET_CATEGORIES = ['会場費', '広報広告費', '制作物費', '運営人件費', '機材備品費', 'その他'];

// 準備物カテゴリ
export const ITEM_CATEGORIES = [
  '計画・管理ドキュメント',
  '競技・ステージ関連',
  '広報・デザイン制作物',
  '会場設営・インフラ備品',
  '運営ツール・消耗品',
  '来場者対応・ノベルティ'
];

// 手配方法
export const PROCUREMENT_METHODS = ['社内制作', '社用品', 'レンタル', '外注', '購入'];

// 準備物ステータス
export const ITEM_STATUS = {
  TODO: '未着手',
  IN_PROGRESS: '手配中',
  DONE: '完了'
};