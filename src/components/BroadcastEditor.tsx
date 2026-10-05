import React, { useState } from 'react';
import { Send, Clock, Sparkles, Image, CreditCard, Tag, FileText, Plus, Trash2, BellOff, Bell, Check, ArrowRight, Zap, AlertCircle, User, Users, ShieldAlert, HelpCircle } from 'lucide-react';
import { MessageType, CardButton, BroadcastMessage, AiCopySuggestion } from '../types';
import { PhonePreview } from './PhonePreview';

interface BroadcastEditorProps {
  initialBroadcast?: BroadcastMessage | null;
  onSave: (payload: any) => Promise<void>;
  onCancel: () => void;
  botName?: string;
  botAvatar?: string;
}

const COMMON_EMOJIS = ['🎉', '🎁', '✨', '📢', '🔥', '💡', '☕', '🍱', '🚀', '⭐', '🛒', '💬', '❤️', '🏷️'];

export const BroadcastEditor: React.FC<BroadcastEditorProps> = ({
  initialBroadcast,
  onSave,
  onCancel,
  botName,
  botAvatar,
}) => {
  const [title, setTitle] = useState(initialBroadcast?.title || '');
  const [type, setType] = useState<MessageType>(initialBroadcast?.type || 'text');
  const [text, setText] = useState(initialBroadcast?.text || '');
  const [imageUrl, setImageUrl] = useState(initialBroadcast?.imageUrl || '');
  const [cardTitle, setCardTitle] = useState(initialBroadcast?.cardTitle || '');
  const [cardDescription, setCardDescription] = useState(initialBroadcast?.cardDescription || '');
  const [buttons, setButtons] = useState<CardButton[]>(
    initialBroadcast?.buttons || [
      { label: '立即查看詳情', url: 'https://line.me', style: 'primary' },
    ]
  );
  const [couponCode, setCouponCode] = useState(initialBroadcast?.couponCode || 'LINEVIP88');
  const [couponDiscount, setCouponDiscount] = useState(initialBroadcast?.couponDiscount || '全館 85 折優惠');
  const [couponExpiry, setCouponExpiry] = useState(initialBroadcast?.couponExpiry || '2026-09-30 23:59');
  const [notificationDisabled, setNotificationDisabled] = useState(initialBroadcast?.notificationDisabled || false);
  
  // Target Type: 'broadcast' (all followers) | 'private_push' (single user)
  const [targetType, setTargetType] = useState<'broadcast' | 'private_push'>(
    initialBroadcast?.targetType || 'broadcast'
  );
  const [targetUserId, setTargetUserId] = useState(initialBroadcast?.targetUserId || '');
  const [showQuotaNotice, setShowQuotaNotice] = useState(false);

  // Delivery Mode: 'send_now' | 'schedule' | 'draft'
  const [deliveryMode, setDeliveryMode] = useState<'send_now' | 'schedule' | 'draft'>(
    initialBroadcast?.status === 'scheduled' ? 'schedule' : initialBroadcast?.status === 'draft' ? 'draft' : 'schedule'
  );

  // Scheduled date time (formatted for datetime-local input: YYYY-MM-DDTHH:mm)
  const getDefaultScheduleTime = () => {
    if (initialBroadcast?.scheduledAt) {
      const d = new Date(initialBroadcast.scheduledAt);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    const d = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [scheduledAt, setScheduledAt] = useState(getDefaultScheduleTime());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // AI Copy suggestions state
  const [showAiCopy, setShowAiCopy] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiCopySuggestion[]>([]);

  // Fast schedule presets
  const applyPresetTime = (hoursFromNow: number, targetHour?: number, targetMin: number = 0) => {
    const d = new Date();
    if (targetHour !== undefined) {
      if (hoursFromNow > 0) d.setDate(d.getDate() + Math.floor(hoursFromNow / 24));
      d.setHours(targetHour, targetMin, 0, 0);
      if (d.getTime() < Date.now()) {
        d.setDate(d.getDate() + 1);
      }
    } else {
      d.setTime(d.getTime() + hoursFromNow * 60 * 1000);
    }
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setScheduledAt(localIso);
    setDeliveryMode('schedule');
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const insertVariable = (token: string) => {
    setText((prev) => prev + token);
  };

  const addButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { label: '查看更多', url: 'https://line.me', style: 'secondary' }]);
    }
  };

  const removeButton = (index: number) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, field: keyof CardButton, val: any) => {
    const next = [...buttons];
    next[index] = { ...next[index], [field]: val };
    setButtons(next);
  };

  // AI Copy Generation
  const handleGenerateAiCopy = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/optimize-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic || title || '專屬會員優惠與活動推播',
          goal: '提升點擊率與高互動',
          keyHighlight: couponDiscount || cardDescription || '限時優惠名額倒數中',
        }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    } catch (err: any) {
      console.error('Failed generating AI copy:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiSuggestion = (suggestion: AiCopySuggestion) => {
    setTitle(suggestion.headline);
    setText(suggestion.body);
    if (type === 'card') {
      setCardTitle(suggestion.headline);
      if (buttons.length > 0) {
        updateButton(0, 'label', suggestion.callToAction);
      }
    }
    setShowAiCopy(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSubmitError('請填寫推播管理標題');
      return;
    }
    if (!text.trim()) {
      setSubmitError('請填寫推播內容文字');
      return;
    }

    if (targetType === 'private_push' && !targetUserId.trim()) {
      setSubmitError('私人推播模式請填寫目標使用者的 LINE User ID (例如：U12345...)');
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload: any = {
        title: title.trim(),
        type,
        text: text.trim(),
        imageUrl: imageUrl.trim() || undefined,
        cardTitle: cardTitle.trim() || undefined,
        cardDescription: cardDescription.trim() || undefined,
        buttons: type === 'card' ? buttons : undefined,
        couponCode: type === 'coupon' ? couponCode.trim() : undefined,
        couponDiscount: type === 'coupon' ? couponDiscount.trim() : undefined,
        couponExpiry: type === 'coupon' ? couponExpiry.trim() : undefined,
        notificationDisabled,
        targetType,
        targetUserId: targetType === 'private_push' ? targetUserId.trim() : undefined,
        action: deliveryMode,
        scheduledAt: deliveryMode === 'schedule' ? new Date(scheduledAt).toISOString() : null,
      };

      await onSave(payload);
    } catch (err: any) {
      setSubmitError(err.message || '儲存推播失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {initialBroadcast ? '編輯推播與排程內容' : '快速建立 LINE 推播與排程'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            發送模式：
            <strong className={targetType === 'private_push' ? 'text-[#06c755] font-bold' : 'text-slate-700 font-bold'}>
              {targetType === 'private_push' ? '👤 私人專屬推送 (僅扣 1 則額度)' : '📢 全體有效好友廣播 (扣除 1,460 則額度)'}
            </strong>
            {' '}• 支援即時發送與排程
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          取消返回
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Area (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {submitError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Card: Basic Info & Type */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm">推播基本設定</h4>
              <span className="text-[11px] text-[#06c755] font-semibold bg-[#06c755]/10 px-2.5 py-0.5 rounded-full uppercase">
                {deliveryMode === 'schedule' ? '排程模式' : deliveryMode === 'send_now' ? '立即發送' : '草稿模式'}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                推播標題（內部辨識與通知預覽）
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="例如：【限時快閃】週末免運與專屬 85 折優惠券"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06c755]/20 focus:border-[#06c755] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAiCopy(!showAiCopy)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold rounded-xl transition-all shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>AI 靈感</span>
                </button>
              </div>
            </div>

            {/* AI Copy Suggestion Drawer */}
            {showAiCopy && (
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Gemini AI 文案優化助手</span>
                  </div>
                  <span className="text-[11px] text-purple-600">針對 LINE 用戶習慣設計</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="輸入推播主題或關鍵促銷點（如：中秋月餅預購 8 折）"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                  />
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleGenerateAiCopy}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    {aiLoading ? '生成中...' : '生成 3 款文案'}
                  </button>
                </div>

                {/* Suggestions list */}
                {aiSuggestions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {aiSuggestions.map((s, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleApplyAiSuggestion(s)}
                        className="p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 shadow-2xs hover:shadow-sm cursor-pointer transition-all text-xs group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800">{s.styleName}</span>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {s.estimatedOpenBoost}
                          </span>
                        </div>
                        <div className="font-medium text-slate-700 text-[11px] mb-1">{s.headline}</div>
                        <p className="text-slate-500 text-[11px] line-clamp-2">{s.body}</p>
                        <div className="mt-2 text-[10px] text-purple-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>套用此款文案</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Message Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                推播訊息類型（格式）
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'text', label: '純文字訊息', icon: FileText, desc: '簡潔快速' },
                  { id: 'image', label: '圖文推播', icon: Image, desc: '圖片+說明' },
                  { id: 'card', label: '互動卡片', icon: CreditCard, desc: 'Flex Message' },
                  { id: 'coupon', label: '專屬折扣券', icon: Tag, desc: '優惠券領取' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = type === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id as MessageType)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-[#06C755] bg-emerald-50/60 text-[#06C755] font-semibold shadow-2xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs">{item.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card: Content Editor according to Type */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                訊息主要內文
              </label>
              <span className="text-[11px] text-slate-400">
                {text.length} 字 (建議 60-150 字最易讀)
              </span>
            </div>

            {/* Quick Emoji Tray */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[11px] text-slate-400 shrink-0">快捷 Emoji:</span>
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-xs shrink-0"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Quick Variable Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400">插入標籤:</span>
              {[
                { token: '{好友暱稱}', label: '好友姓名' },
                { token: '{限時倒數}', label: '倒數提醒' },
                { token: '{專屬折扣}', label: '專屬好康' },
              ].map((v) => (
                <button
                  key={v.token}
                  type="button"
                  onClick={() => insertVariable(v.token)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded transition-colors"
                >
                  + {v.label}
                </button>
              ))}
            </div>

            <textarea
              required
              rows={4}
              placeholder="輸入要傳送給所有好友的訊息內容..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06C755]/30 focus:border-[#06C755] leading-relaxed transition-all"
            />

            {/* Type Specific Fields */}
            {(type === 'image' || type === 'card') && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  圖片網址 (HTTPS 格式)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06C755]/30"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrl('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80')
                    }
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-xl"
                  >
                    範例圖
                  </button>
                </div>
              </div>
            )}

            {type === 'card' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      卡片主標題
                    </label>
                    <input
                      type="text"
                      placeholder="例如：2026 輕秋生活新提案"
                      value={cardTitle}
                      onChange={(e) => setCardTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06C755]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      卡片綠色副標 / 標籤
                    </label>
                    <input
                      type="text"
                      placeholder="例如：限量現貨販售中"
                      value={cardDescription}
                      onChange={(e) => setCardDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06C755]/30"
                    />
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700">
                      卡片點擊按鈕 (最多 3 個)
                    </label>
                    {buttons.length < 3 && (
                      <button
                        type="button"
                        onClick={addButton}
                        className="text-xs text-[#06C755] font-semibold flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>新增按鈕</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {buttons.map((btn, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="按鈕文字"
                          value={btn.label}
                          onChange={(e) => updateButton(idx, 'label', e.target.value)}
                          className="w-32 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                        />
                        <input
                          type="url"
                          placeholder="跳轉連結網址 (https://...)"
                          value={btn.url}
                          onChange={(e) => updateButton(idx, 'url', e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                        />
                        <select
                          value={btn.style || 'primary'}
                          onChange={(e) => updateButton(idx, 'style', e.target.value)}
                          className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <option value="primary">主樣式 (綠底)</option>
                          <option value="secondary">次樣式 (灰底)</option>
                        </select>
                        {buttons.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeButton(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {type === 'coupon' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      折扣名稱 / 醒目标題
                    </label>
                    <input
                      type="text"
                      placeholder="例如：全館 85 折 + 免運"
                      value={couponDiscount}
                      onChange={(e) => setCouponDiscount(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      優惠折扣代碼
                    </label>
                    <input
                      type="text"
                      placeholder="例如：LINEVIP85"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      有效使用期限
                    </label>
                    <input
                      type="text"
                      placeholder="例如：2026-09-30 23:59"
                      value={couponExpiry}
                      onChange={(e) => setCouponExpiry(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card: Target Audience & Quota Protection */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                發送對象與推播額度控制
              </label>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                targetType === 'private_push'
                  ? 'bg-emerald-50 text-[#06c755] border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {targetType === 'private_push' ? '⚡ 私人專屬推送 (僅扣 1 則額度)' : '📢 全體廣播 (扣除 1,460 則額度)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetType('broadcast')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  targetType === 'broadcast'
                    ? 'border-[#06C755] bg-emerald-50/50 text-slate-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg ${targetType === 'broadcast' ? 'bg-[#06C755] text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">全體官方帳號好友廣播</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    群發給全部 1,460 位關注好友（按全體總人數扣除月推播額度）。
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('private_push')}
                className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  targetType === 'private_push'
                    ? 'border-[#06C755] bg-emerald-50/50 text-slate-900 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg ${targetType === 'private_push' ? 'bg-[#06C755] text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>私人推送 (指定單一使用者)</span>
                    <span className="text-[9px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.2 rounded">極省額度</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    單獨推送至指定 User ID，<strong>僅消耗 1 則額度</strong>，不浪費全體廣播則數！
                  </div>
                </div>
              </button>
            </div>

            {targetType === 'private_push' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  目標使用者的 LINE User ID (必填)
                </label>
                <input
                  type="text"
                  required={targetType === 'private_push'}
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="例如：U1234567890abcdef1234567890abcdef (以 U 開頭 33 碼)"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06c755]/20 focus:border-[#06c755]"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>💡 私人 Push 只會發給此用戶，不影響其他人。</span>
                  <button
                    type="button"
                    onClick={() => setShowQuotaNotice(!showQuotaNotice)}
                    className="text-[#06c755] font-bold hover:underline"
                  >
                    {showQuotaNotice ? '收起額度機制說明' : '💡 如何徹底避開 LINE 推播額度？'}
                  </button>
                </div>
                {showQuotaNotice && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-100 text-[11px] text-slate-600 leading-relaxed space-y-1">
                    <p className="font-bold text-slate-800">📌 LINE 官方計費與零額度機制：</p>
                    <p>• <strong>私人 Push 推送</strong>：每發給 1 人只扣 1 則額度。若全體廣播會一次扣除 1,460 則，改為私人 Push 能省下 99.9% 額度。</p>
                    <p>• <strong>被動回覆 (Reply API)</strong>：當使用者主動發送文字或點擊互動，伺服器藉由 Webhook 回傳，官方規範<strong>100% 免費、0 額度消耗</strong>！</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card: Scheduling & Delivery Settings */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              發送方式與排程設定
            </label>

            {/* Delivery Mode Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'schedule', label: '⏰ 預約排程發送', desc: '指定最佳時段' },
                { id: 'send_now', label: '🚀 立即群發', desc: '馬上送達所有好友' },
                { id: 'draft', label: '💾 儲存為草稿', desc: '暫不發送' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDeliveryMode(item.id as any)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    deliveryMode === item.id
                      ? 'border-[#06C755] bg-emerald-50 text-slate-900 font-semibold shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>

            {/* Scheduled Date Time Picker & Presets */}
            {deliveryMode === 'schedule' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">快速排程推薦時段:</span>
                  <span className="text-[10px] text-[#06C755] font-semibold">依據台灣用戶閱讀習慣最佳化</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyPresetTime(10)}
                    className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-medium transition-all"
                  >
                    ⚡ 10 分鐘後 (快速測試)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTime(24, 12, 15)}
                    className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-medium transition-all"
                  >
                    🍱 明天中午 12:15 (午休高點擊)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTime(0, 20, 30)}
                    className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-medium transition-all"
                  >
                    🌙 今晚 20:30 (睡前黃金期)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTime(48, 10, 0)}
                    className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-medium transition-all"
                  >
                    ☕ 週末早上 10:00 (休閒放鬆)
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    自訂預計發送時間（年/月/日 時:分）:
                  </label>
                  <input
                    type="datetime-local"
                    required={deliveryMode === 'schedule'}
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06C755]/30 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Silent push toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                {notificationDisabled ? (
                  <BellOff className="w-4 h-4 text-slate-500" />
                ) : (
                  <Bell className="w-4 h-4 text-[#06C755]" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-800">靜音推播模式 (Silent Push)</div>
                  <div className="text-[11px] text-slate-500">
                    開啟後用戶收到訊息時手機不會發出響鈴或震動（適合深夜或非緊急通知）
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notificationDisabled}
                onChange={(e) => setNotificationDisabled(e.target.checked)}
                className="w-4 h-4 accent-[#06C755] cursor-pointer"
              />
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl hover:bg-slate-50 transition-colors text-xs"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-[0.99] ${
                deliveryMode === 'send_now'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-[#06c755] hover:bg-[#05b34c] shadow-[#06c755]/20'
              }`}
            >
              {isSubmitting ? (
                <span>處理中...</span>
              ) : deliveryMode === 'send_now' ? (
                <>
                  <Send className="w-4 h-4 fill-white" />
                  <span>立即群發給 1,462 位好友</span>
                </>
              ) : deliveryMode === 'schedule' ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>儲存並排程推播</span>
                </>
              ) : (
                <span>儲存為草稿</span>
              )}
            </button>
          </div>
        </form>

        {/* Right Phone Preview Sticky Area (5 cols) */}
        <div className="lg:col-span-5 flex justify-center sticky top-20">
          <PhonePreview
            type={type}
            title={title}
            text={text}
            imageUrl={imageUrl}
            cardTitle={cardTitle}
            cardDescription={cardDescription}
            buttons={buttons}
            couponCode={couponCode}
            couponDiscount={couponDiscount}
            couponExpiry={couponExpiry}
            notificationDisabled={notificationDisabled}
            botName={botName}
            botAvatar={botAvatar}
          />
        </div>
      </div>
    </div>
  );
};
