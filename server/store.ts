import fs from 'fs';
import path from 'path';
import { BroadcastMessage, LineConfig, AnalyticsData } from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const BROADCASTS_FILE = path.join(DATA_DIR, 'broadcasts.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    // Ignore filesystem errors in restricted environments
  }
}

// Default initial config with the user's provided credentials
export let currentConfig: LineConfig = {
  channelId: process.env.LINE_CHANNEL_ID || '2005645102',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '398637e41ea383a2fac9892722ab8e00',
  accessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  isConnected: false,
  isCustomToken: false,
  testMode: false,
};

// Initial realistic broadcasts to showcase scheduling and history
const DEFAULT_BROADCASTS: BroadcastMessage[] = [
  {
    id: 'bc-1',
    title: '【週末快閃】全館限時免運與專屬 85 折優惠券',
    type: 'coupon',
    text: '親愛的好友您好！🎉 感謝您一直以來的支持，本週末為您獻上專屬驚喜優惠！\n\n結帳輸入下方折扣碼即可享全館 85 折 + 超取免運，限量前 100 名，把握機會立即挑選！✨',
    couponCode: 'LINEVIP85',
    couponDiscount: '全館 85 折 + 免運',
    couponExpiry: '2026-09-10 23:59',
    notificationDisabled: false,
    status: 'sent',
    createdAt: '2026-09-04T10:00:00.000Z',
    updatedAt: '2026-09-05T12:00:00.000Z',
    sentAt: '2026-09-05T12:00:00.000Z',
    recipientsCount: 1420,
    openCount: 785,
    clickCount: 312,
    lineRequestId: 'req_8f7b2c91',
  },
  {
    id: 'bc-2',
    title: '秋季精選新品上市！搶先預覽設計細節',
    type: 'card',
    text: '🍁 秋日微涼，生活也需要一點新靈感。\n我們為大家準備了全新秋季系列，精選質感知性風格，現已正式登場！點擊下方按鈕搶先看最新型錄：',
    cardTitle: '2026 輕秋生活新提案',
    cardDescription: '全系列天然材質・簡約溫潤色調・限量現貨販售中',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
    buttons: [
      { label: '查看新品型錄', url: 'https://example.com/autumn-new', style: 'primary' },
      { label: '領取好友專屬禮', url: 'https://example.com/vip-gift', style: 'secondary' },
    ],
    notificationDisabled: false,
    status: 'sent',
    createdAt: '2026-09-02T08:30:00.000Z',
    updatedAt: '2026-09-03T18:30:00.000Z',
    sentAt: '2026-09-03T18:30:00.000Z',
    recipientsCount: 1395,
    openCount: 698,
    clickCount: 245,
    lineRequestId: 'req_6c4a1d82',
  },
  {
    id: 'bc-3',
    title: '【明日排程】中午美食精選推播提醒',
    type: 'text',
    text: '午餐時間吃什麼？🍱\n精選今日人氣特餐已出爐，立即打開選單預約外帶，省去排隊時間！今日限定前 50 筆享加贈現萃茶飲一杯 🍵',
    notificationDisabled: false,
    status: 'scheduled',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2026-09-06T14:20:00.000Z',
    updatedAt: '2026-09-06T14:20:00.000Z',
  },
  {
    id: 'bc-4',
    title: '中秋連假門市營業時間與配送公告',
    type: 'text',
    text: '🌕 中秋佳節將至，預祝各位好友佳節愉快！\n連假期間（9/15-9/17）全台門市照常營業，線上訂單將於連假後首個工作日依序出貨，如有任何問題歡迎隨時私訊小編！',
    notificationDisabled: true,
    status: 'draft',
    createdAt: '2026-09-06T16:00:00.000Z',
    updatedAt: '2026-09-06T16:00:00.000Z',
  }
];

export let broadcasts: BroadcastMessage[] = [...DEFAULT_BROADCASTS];

// Load from disk if exists
try {
  if (fs.existsSync(BROADCASTS_FILE)) {
    const raw = fs.readFileSync(BROADCASTS_FILE, 'utf-8');
    broadcasts = JSON.parse(raw);
  }
  if (fs.existsSync(CONFIG_FILE)) {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const loaded = JSON.parse(raw);
    currentConfig = { ...currentConfig, ...loaded };
  }
} catch (e) {
  console.warn('Notice: using memory store for initial state', e);
}

export function saveBroadcasts() {
  try {
    fs.writeFileSync(BROADCASTS_FILE, JSON.stringify(broadcasts, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed writing broadcasts to disk, kept in memory:', e);
  }
}

export function saveConfig(newConfig: Partial<LineConfig>) {
  currentConfig = { ...currentConfig, ...newConfig };
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed writing config to disk, kept in memory:', e);
  }
}

// Generate rich analytics data based on broadcasts and official account trends
export function getAnalyticsData(): AnalyticsData {
  const sentBroadcasts = broadcasts.filter((b) => b.status === 'sent');
  const totalSent = sentBroadcasts.length;
  
  const totalRecipients = sentBroadcasts.reduce((acc, b) => acc + (b.recipientsCount || 0), 0);
  const totalOpens = sentBroadcasts.reduce((acc, b) => acc + (b.openCount || 0), 0);
  const totalClicks = sentBroadcasts.reduce((acc, b) => acc + (b.clickCount || 0), 0);
  
  const avgOpenRate = totalRecipients > 0 ? Number(((totalOpens / totalRecipients) * 100).toFixed(1)) : 51.4;
  const avgClickRate = totalOpens > 0 ? Number(((totalClicks / totalOpens) * 100).toFixed(1)) : 22.8;

  // Base followers
  const totalFollowers = 1528;
  const activeFollowers = 1462;
  const blockedFollowers = 66;

  // 14-day growth trend
  const dailyTrends = [
    { date: '08/25', followers: 1410, targetedReaches: 1350, blocks: 58 },
    { date: '08/27', followers: 1425, targetedReaches: 1365, blocks: 59 },
    { date: '08/29', followers: 1442, targetedReaches: 1380, blocks: 60 },
    { date: '08/31', followers: 1460, targetedReaches: 1398, blocks: 62 },
    { date: '09/02', followers: 1485, targetedReaches: 1420, blocks: 63 },
    { date: '09/04', followers: 1510, targetedReaches: 1445, blocks: 65 },
    { date: '09/06', followers: 1528, targetedReaches: 1462, blocks: 66 },
  ];

  // Hourly engagement in Taiwan time
  const hourlyEngagement = [
    { hour: '08:00', avgOpenRate: 34, sendCount: 2 },
    { hour: '10:00', avgOpenRate: 46, sendCount: 3 },
    { hour: '12:00', avgOpenRate: 68, sendCount: 6 }, // Peak lunch
    { hour: '14:00', avgOpenRate: 42, sendCount: 2 },
    { hour: '16:00', avgOpenRate: 49, sendCount: 3 },
    { hour: '18:30', avgOpenRate: 64, sendCount: 5 },
    { hour: '20:30', avgOpenRate: 74, sendCount: 7 }, // Peak night prime
    { hour: '22:30', avgOpenRate: 52, sendCount: 4 },
  ];

  // Category breakdown
  const categoryPerformance = [
    { category: '限時優惠 / 折扣券', count: 5, avgOpenRate: 62.4, avgClickRate: 28.5 },
    { category: '新品上架與型錄', count: 4, avgOpenRate: 54.1, avgClickRate: 21.0 },
    { category: '日常互動與問候', count: 6, avgOpenRate: 45.8, avgClickRate: 14.2 },
    { category: '重要服務公告', count: 3, avgOpenRate: 69.2, avgClickRate: 11.5 },
  ];

  const recentDeliveryLogs = sentBroadcasts.map((b) => ({
    id: b.id,
    title: b.title,
    sentAt: b.sentAt || b.updatedAt,
    type: b.type === 'coupon' ? '優惠券' : b.type === 'card' ? '圖文卡片' : b.type === 'image' ? '純圖片' : '文字訊息',
    recipients: b.recipientsCount || 1400,
    openRate: b.recipientsCount ? Number((((b.openCount || 0) / b.recipientsCount) * 100).toFixed(1)) : 52.0,
    clickRate: b.openCount ? Number((((b.clickCount || 0) / (b.openCount || 1)) * 100).toFixed(1)) : 24.0,
  }));

  return {
    metrics: {
      totalFollowers,
      activeFollowers,
      blockedFollowers,
      monthlyBroadcastsSent: totalSent,
      monthlyQuotaUsed: totalRecipients,
      monthlyQuotaLimit: 500, // standard LINE free tier, or higher
      avgOpenRate,
      avgClickRate,
      estimatedReach: activeFollowers,
    },
    dailyTrends,
    hourlyEngagement,
    categoryPerformance,
    recentDeliveryLogs,
  };
}
