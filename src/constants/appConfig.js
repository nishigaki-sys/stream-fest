/**
 * アプリケーション全体で使用する定数定義
 */

// UIで使用するブランドカラー
export const BRAND_COLORS = { 
  BLUE: '#284db3', 
  LIGHT_GREEN: '#c2e086', 
  PINK: '#ffc1bc', 
  GREEN: '#34cc99', 
  YELLOW: '#fef667', 
  RED: '#fd594e', 
  ORANGE: '#fe9a33' 
};

// ユーザーの権限役割
export const ROLES = { 
  HQ: '本部', 
  HOST: '主催', 
  PARTNER: '提供', 
  SUPPORT: '後援・共催' 
};

// タスクの進捗ステータス
export const TASK_STATUS = { 
  TODO: '未着手', 
  IN_PROGRESS: '進行中', 
  PENDING: '確認待ち', 
  DONE: '完了' 
};

// 予算管理のカテゴリ
export const BUDGET_CATEGORIES = ['会場費', '広報広告費', '制作物費', '運営人件費', '機材備品費', 'その他'];

// タスク管理の工程カテゴリ
// 追加・編集・削除はこの配列を書き換えることでアプリ全体に反映されます
export const CATEGORIES = ['①設計', '②準備', '③運営', '④事後'];

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