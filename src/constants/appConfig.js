export const BRAND_COLORS = { 
  BLUE: '#284db3', 
  LIGHT_GREEN: '#c2e086', 
  PINK: '#ffc1bc', 
  GREEN: '#34cc99', 
  YELLOW: '#fef667', 
  RED: '#fd594e', 
  ORANGE: '#fe9a33' 
};

export const ROLES = { 
  HQ: '本部', 
  HOST: '主催', 
  PARTNER: '提供', 
  SUPPORT: '後援・共催' 
};

export const TASK_STATUS = { 
  TODO: '未着手', 
  IN_PROGRESS: '進行中', 
  PENDING: '確認待ち', 
  DONE: '完了' 
};

export const BUDGET_CATEGORIES = ['会場費', '広報広告費', '制作物費', '運営人件費', '機材備品費', 'その他'];

export const CATEGORIES = ['①設計', '②準備', '③運営', '④事後'];

export const INITIAL_EVENTS = [
  { 
    id: 'ev_osaka', 
    name: 'STREAM FEST. 2026 in 大阪', 
    location: 'マイドームおおさか', 
    hostName: '石垣', 
    status: '進行中', 
    progress: 68, 
    startDate: '2026-05-05' 
  },
  { 
    id: 'ev_tokyo', 
    name: 'STREAM FEST. 2026 in 東京', 
    location: '東京ビッグサイト', 
    hostName: '大津', 
    status: '設計中', 
    progress: 32, 
    startDate: '2026-07-20' 
  },
];

export const INITIAL_USERS = [
  { id: 1, name: '重見', role: ROLES.HQ, email: 'shigemi@stream-fest.org', eventId: null },
  { id: 2, name: '石垣', role: ROLES.HOST, email: 'ishigaki@edion.com', eventId: 'ev_osaka' },
  { id: 3, name: '大津', role: ROLES.HOST, email: 'otsu@yumemiru.jp', eventId: 'ev_tokyo' },
];

export const INITIAL_TASKS = [
  { 
    id: 101, 
    eventId: 'ev_osaka', 
    title: '全体スケジュール設定', 
    category: '①設計', 
    role: ROLES.HOST, 
    assignee: '石垣', 
    status: TASK_STATUS.DONE, 
    startDate: '2026-01-05', 
    dueDate: '2026-01-20', 
    progress: 100 
  },
  { 
    id: 104, 
    eventId: 'ev_osaka', 
    title: '制作物一覧作成', 
    category: '①設計', 
    role: ROLES.HOST, 
    assignee: '石垣', 
    status: TASK_STATUS.IN_PROGRESS, 
    startDate: '2026-01-20', 
    dueDate: '2026-02-15', 
    progress: 70 
  },
  { 
    id: 201, 
    eventId: 'ev_osaka', 
    title: '公式Webサイト作成', 
    category: '②準備', 
    role: ROLES.HQ, 
    assignee: '重見', 
    status: TASK_STATUS.IN_PROGRESS, 
    startDate: '2026-02-01', 
    dueDate: '2026-03-01', 
    progress: 45 
  },
];

export const INITIAL_BUDGETS = [
  { 
    id: 1, 
    eventId: 'ev_osaka', 
    title: '会場レンタル代', 
    category: '会場費', 
    planned: 500000, 
    actual: 500000, 
    status: '完了' 
  },
  { 
    id: 2, 
    eventId: 'ev_osaka', 
    title: '広告費', 
    category: '広報広告費', 
    planned: 200000, 
    actual: 50000, 
    status: '進行中' 
  },
];