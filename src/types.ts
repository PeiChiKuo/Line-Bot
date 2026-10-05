export type MessageType = 'text' | 'image' | 'card' | 'coupon';

export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

export interface CardButton {
  label: string;
  url: string;
  style?: 'primary' | 'secondary';
}

export interface BroadcastMessage {
  id: string;
  title: string;
  type: MessageType;
  text: string;
  imageUrl?: string;
  cardTitle?: string;
  cardDescription?: string;
  buttons?: CardButton[];
  couponCode?: string;
  couponDiscount?: string;
  couponExpiry?: string;
  notificationDisabled: boolean;
  targetType?: 'broadcast' | 'private_push';
  targetUserId?: string;
  status: BroadcastStatus;
  scheduledAt?: string | null; // ISO string
  createdAt: string;
  updatedAt: string;
  sentAt?: string | null;
  recipientsCount?: number;
  openCount?: number;
  clickCount?: number;
  lineRequestId?: string;
  error?: string;
}

export interface LineBotInfo {
  userId: string;
  basicId: string;
  displayName: string;
  pictureUrl?: string;
  chatMode: string;
  markAsReadMode: string;
}

export interface LineQuota {
  type: 'none' | 'limited';
  value?: number;
  totalUsage: number;
  remaining?: number;
}

export interface LineConfig {
  channelId: string;
  channelSecret: string;
  accessToken: string;
  isConnected: boolean;
  isCustomToken: boolean;
  lastConnectedAt?: string;
  testMode: boolean;
}

export interface AnalyticsMetric {
  totalFollowers: number;
  activeFollowers: number;
  blockedFollowers: number;
  monthlyBroadcastsSent: number;
  monthlyQuotaUsed: number;
  monthlyQuotaLimit: number;
  avgOpenRate: number; // percentage, e.g. 48.5
  avgClickRate: number; // percentage, e.g. 18.2
  estimatedReach: number;
}

export interface FollowerGrowthPoint {
  date: string;
  followers: number;
  targetedReaches: number;
  blocks: number;
}

export interface DeliveryHourStats {
  hour: string;
  avgOpenRate: number;
  sendCount: number;
}

export interface CategoryStats {
  category: string;
  count: number;
  avgOpenRate: number;
  avgClickRate: number;
}

export interface AnalyticsData {
  metrics: AnalyticsMetric;
  dailyTrends: FollowerGrowthPoint[];
  hourlyEngagement: DeliveryHourStats[];
  categoryPerformance: CategoryStats[];
  recentDeliveryLogs: Array<{
    id: string;
    title: string;
    sentAt: string;
    type: string;
    recipients: number;
    openRate: number;
    clickRate: number;
  }>;
}

export interface AiDiagnosisResult {
  overallScore: number;
  summary: string;
  strengths: string[];
  recommendations: Array<{
    title: string;
    impact: 'high' | 'medium' | 'low';
    suggestion: string;
    targetMetric: string;
  }>;
  optimalSchedule: {
    bestDays: string[];
    bestTimeWindows: string[];
    reason: string;
  };
  suggestedTopics: string[];
}

export interface AiCopySuggestion {
  styleName: string;
  headline: string;
  body: string;
  callToAction: string;
  estimatedOpenBoost: string;
}
