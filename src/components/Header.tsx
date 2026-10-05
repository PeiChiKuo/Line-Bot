import React from 'react';
import { Send, RefreshCw, Menu, Sparkles, AlertCircle, User } from 'lucide-react';
import { LineConfig, LineBotInfo, LineQuota } from '../types';

interface HeaderProps {
  activeTab: 'broadcasts' | 'editor' | 'analytics' | 'ai-diagnosis';
  setActiveTab: (tab: 'broadcasts' | 'editor' | 'analytics' | 'ai-diagnosis') => void;
  config: LineConfig | null;
  botInfo: LineBotInfo | null;
  quota: LineQuota | null;
  onOpenSettings: () => void;
  onOpenNewBroadcast: () => void;
  onOpenPrivateSend?: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  config,
  botInfo,
  quota,
  onOpenSettings,
  onOpenNewBroadcast,
  onOpenPrivateSend,
  onRefresh,
  isRefreshing,
  onToggleMobileMenu,
}) => {
  const quotaUsed = quota?.totalUsage ?? 180;
  const quotaLimit = quota?.value ?? 500;
  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    broadcasts: {
      title: '系統總覽儀表板',
      subtitle: '即時推播狀態、待發送排程與歷史訊息管理',
    },
    editor: {
      title: '推播撰寫編輯器',
      subtitle: '編輯推播訊息、AI 文案生成與手機實機預覽',
    },
    analytics: {
      title: '自動化數據統計分析',
      subtitle: '好友互動率、送達率與推播效益趨勢圖',
    },
    'ai-diagnosis': {
      title: 'AI 智慧成效診斷',
      subtitle: 'Gemini 智能診斷分析最佳發送時間與文案改善策略',
    },
  };

  const current = pageTitles[activeTab] || pageTitles.broadcasts;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-20 sticky top-0">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
            {current.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 mt-1 font-normal">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quota + Refresh + Action CTA + User Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Monthly Quota Meter */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">本月推播額度</div>
            <div className="text-slate-800 font-bold font-mono">
              {quotaUsed} <span className="text-slate-400 font-normal">/ {quotaLimit} 則</span>
            </div>
          </div>
          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                quotaPercent > 85 ? 'bg-amber-500' : 'bg-[#06c755]'
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        </div>

        {/* Private Send & Zero-Quota Button */}
        <button
          onClick={onOpenPrivateSend}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 rounded-xl border border-emerald-200/90 text-xs font-bold transition-all shadow-2xs"
          title="私人發送給指定好友，避開全體推播額度扣除"
        >
          <User className="w-3.5 h-3.5 text-[#06c755]" />
          <span>私人發送 / 避額度</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="重新整理數據"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/80"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#06c755]' : ''}`} />
        </button>

        {/* Primary CTA Button */}
        <button
          onClick={onOpenNewBroadcast}
          className="flex items-center gap-2 bg-[#06c755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded-xl shadow-lg shadow-[#06c755]/20 transition-all active:scale-95"
        >
          <Send className="w-3.5 h-3.5 fill-white" />
          <span className="hidden sm:inline">新增推播 / 排程</span>
          <span className="sm:hidden">新增</span>
        </button>

        {/* Admin / Bot Avatar */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-slate-500 font-medium leading-tight">管理員入口</p>
            <p className="text-xs font-bold text-slate-800 truncate max-w-[110px]">
              {botInfo?.displayName || '淡水踩街櫃檯小姐'}
            </p>
          </div>
          {botInfo?.pictureUrl ? (
            <img
              src={botInfo.pictureUrl}
              alt="Avatar"
              className="w-9 h-9 rounded-full bg-slate-200 border-2 border-slate-100 object-cover shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs border-2 border-slate-100 shadow-sm">
              LP
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
