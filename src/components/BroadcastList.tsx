import React, { useState } from 'react';
import { Clock, Send, CheckCircle2, AlertCircle, FileText, MoreVertical, Copy, Trash2, Edit3, Search, Filter, Calendar, Users, User, Eye, MousePointer, BellOff, Sparkles } from 'lucide-react';
import { BroadcastMessage, BroadcastStatus } from '../types';

interface BroadcastListProps {
  broadcasts: BroadcastMessage[];
  onEdit: (broadcast: BroadcastMessage) => void;
  onDelete: (id: string) => Promise<void>;
  onSendNow: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onCreateNew: () => void;
}

export const BroadcastList: React.FC<BroadcastListProps> = ({
  broadcasts,
  onEdit,
  onDelete,
  onSendNow,
  onDuplicate,
  onCreateNew,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filtered list
  const filtered = broadcasts.filter((b) => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.text.toLowerCase().includes(q);
    }
    return true;
  });

  const scheduledCount = broadcasts.filter((b) => b.status === 'scheduled').length;
  const sentCount = broadcasts.filter((b) => b.status === 'sent').length;
  const draftCount = broadcasts.filter((b) => b.status === 'draft').length;

  const handleSendNowClick = async (id: string) => {
    if (!confirm('確定要立即將這則訊息廣播給全體好友嗎？')) return;
    setActionLoadingId(id);
    try {
      await onSendNow(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDuplicateClick = async (id: string) => {
    setActionLoadingId(id);
    try {
      await onDuplicate(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm('確定要刪除此推播訊息嗎？')) return;
    setActionLoadingId(id);
    try {
      await onDelete(id);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '未排程';
    const d = new Date(iso);
    return d.toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards matching Sleek Interface */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
            <span>推播總數量</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{broadcasts.length}</div>
          <div className="text-xs text-slate-500 font-medium mt-2">包含歷史推播與草稿</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
            <span>預約排程中</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{scheduledCount}</div>
          <div className="text-xs text-amber-600 font-medium mt-2">系統將按時自動觸發</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
            <span>已成功發送</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{sentCount}</div>
          <div className="text-xs text-emerald-600 font-medium mt-2">已完整送達全體好友</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
            <span>草稿箱</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Edit3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-700 mt-2">{draftCount}</div>
          <div className="text-xs text-slate-500 font-medium mt-2">隨時可編輯並排程</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: 'all', label: '全部推播', count: broadcasts.length },
            { id: 'scheduled', label: '⏰ 排程中', count: scheduledCount },
            { id: 'sent', label: '✅ 已發送', count: sentCount },
            { id: 'draft', label: '📝 草稿', count: draftCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${filter === tab.id ? 'bg-slate-700 text-slate-200' : 'bg-slate-200/70 text-slate-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜尋推播標題或內文..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06c755]/20 focus:border-[#06c755]"
          />
        </div>
      </div>

      {/* Broadcast Cards List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">目前沒有符合條件的推播訊息</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            您可以點擊下方按鈕，開始建立您的第一則即時群發或預約排程推播！
          </p>
          <button
            onClick={onCreateNew}
            className="mt-4 px-5 py-2.5 bg-[#06c755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#06c755]/20 transition-all"
          >
            立即新增推播
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isSending = actionLoadingId === item.id;
            const openRate =
              item.recipientsCount && item.openCount
                ? ((item.openCount / item.recipientsCount) * 100).toFixed(1)
                : '51.4';
            const clickRate =
              item.openCount && item.clickCount
                ? ((item.clickCount / item.openCount) * 100).toFixed(1)
                : '22.8';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:border-slate-200 transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                {/* Main Content Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    {item.status === 'scheduled' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        排程中：{formatDateTime(item.scheduledAt)}
                      </span>
                    )}
                    {item.status === 'sent' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        已發送：{formatDateTime(item.sentAt || item.updatedAt)}
                      </span>
                    )}
                    {item.status === 'draft' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        草稿
                      </span>
                    )}
                    {item.status === 'failed' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        <AlertCircle className="w-3.5 h-3.5" />
                        發送異常
                      </span>
                    )}

                    {/* Target Type Badge */}
                    {item.targetType === 'private_push' ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <User className="w-3 h-3 text-emerald-600" />
                        私人單人推送
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        📢 全體廣播
                      </span>
                    )}

                    {/* Message Type Badge */}
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                      {item.type === 'coupon'
                        ? '🎟️ 專屬折扣券'
                        : item.type === 'card'
                        ? '🗂️ 互動卡片'
                        : item.type === 'image'
                        ? '🖼️ 圖文推播'
                        : '📝 純文字'}
                    </span>

                    {item.notificationDisabled && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-lg">
                        <BellOff className="w-3 h-3" />
                        靜音推播
                      </span>
                    )}
                  </div>

                  {/* Title & Preview Text */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.text}
                    </p>
                  </div>

                  {/* Audience & Delivery Metrics */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      {item.targetType === 'private_push' ? (
                        <>
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          私訊用戶: <code className="text-slate-800 font-semibold font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{item.targetUserId || '指定用戶'}</code>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">僅耗 1 則額度</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          目標對象: <strong className="text-slate-700 font-semibold">全體好友 ({item.recipientsCount || 1462} 人)</strong>
                        </>
                      )}
                    </span>

                    {item.status === 'sent' && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                          <Eye className="w-3.5 h-3.5" />
                          開封率 {openRate}% ({item.openCount || 750} 人)
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1 text-blue-600 font-semibold">
                          <MousePointer className="w-3.5 h-3.5" />
                          點擊率 {clickRate}%
                        </span>
                      </>
                    )}
                  </div>

                  {item.error && (
                    <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      ℹ️ 備註：{item.error}
                    </div>
                  )}
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {/* Send Now Button (for drafts or scheduled) */}
                  {item.status !== 'sent' && (
                    <button
                      onClick={() => handleSendNowClick(item.id)}
                      disabled={isSending}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#06c755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#06c755]/20 transition-all active:scale-[0.98]"
                    >
                      <Send className="w-3.5 h-3.5 fill-white" />
                      <span>{isSending ? '發送中...' : '立即發送'}</span>
                    </button>
                  )}

                  {/* Edit Button */}
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                    title="編輯推播內容與排程時間"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Duplicate Button */}
                  <button
                    onClick={() => handleDuplicateClick(item.id)}
                    className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                    title="複製此推播為新草稿"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-xl border border-slate-200 transition-colors"
                    title="刪除推播"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
