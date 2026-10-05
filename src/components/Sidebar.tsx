import React from 'react';
import { LayoutDashboard, Send, Clock, BarChart3, Sparkles, Settings, Wifi, User } from 'lucide-react';
import { LineConfig, LineBotInfo } from '../types';

interface SidebarProps {
  activeTab: 'broadcasts' | 'editor' | 'analytics' | 'ai-diagnosis';
  setActiveTab: (tab: 'broadcasts' | 'editor' | 'analytics' | 'ai-diagnosis') => void;
  config: LineConfig | null;
  botInfo: LineBotInfo | null;
  onOpenSettings: () => void;
  onOpenPrivateSend?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  config,
  botInfo,
  onOpenSettings,
  onOpenPrivateSend,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'broadcasts' as const,
      label: '推播總覽 (Dashboard)',
      icon: LayoutDashboard,
    },
    {
      id: 'editor' as const,
      label: '推播撰寫 (Broadcast)',
      icon: Send,
    },
    {
      id: 'analytics' as const,
      label: '數據統計 (Analytics)',
      icon: BarChart3,
    },
    {
      id: 'ai-diagnosis' as const,
      label: 'AI 智慧診斷 (AI Agent)',
      icon: Sparkles,
    },
  ];

  return (
    <aside
      className={`w-64 bg-[#0f172a] text-white flex flex-col shrink-0 z-40 transition-transform duration-300 md:static fixed inset-y-0 left-0 ${
        isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#06c755] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#06c755]/30">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 10.3c0-4.6-4.7-8.3-10.5-8.3S3 5.7 3 10.3c0 4.1 3.7 7.5 8.7 8.1l-.6 2.3s-.2.9.8.6c1.1-.3 5.7-3.4 7.8-5.8 2.3-2 4.3-5.2 4.3-5.2z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white block leading-none">LINE Hub Pro</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">官方推播與數據管理</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 mt-5">
        <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">主選單</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left ${
                isActive
                  ? 'bg-[#06c755]/10 text-[#06c755] border-l-4 border-[#06c755] font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#06c755]' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Zero Quota / Private Send Quick Launcher */}
      <div className="px-4 pt-2">
        <button
          onClick={() => {
            if (onOpenPrivateSend) onOpenPrivateSend();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/30 transition-all text-left group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#06c755]/20 flex items-center justify-center shrink-0 group-hover:bg-[#06c755]/30">
            <User className="w-4 h-4 text-[#06c755]" />
          </div>
          <div className="truncate min-w-0">
            <div className="text-white font-bold flex items-center gap-1.5">
              <span>私人發送 (避額度)</span>
              <span className="text-[9px] bg-emerald-500/20 text-[#06c755] px-1 py-0.2 rounded font-mono font-bold">省99%</span>
            </div>
            <div className="text-[10px] text-slate-400 font-normal truncate">單人推播 • 零額度密技</div>
          </div>
        </button>
      </div>

      {/* Bottom API Status Box */}
      <div className="p-4 mt-auto space-y-3">
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">API 連線狀態</p>
            <span className="text-[10px] text-[#06c755] font-mono bg-[#06c755]/15 px-1.5 py-0.5 rounded font-bold">ONLINE</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white truncate font-medium">
              {botInfo?.displayName || '淡水踩街櫃檯小姐'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 truncate font-mono">
            Channel ID: {config?.channelId || '2005645102'}
          </p>
          <button
            onClick={onOpenSettings}
            className="w-full mt-3 px-3 py-1.5 bg-slate-700/70 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-600/50"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>帳號與憑證設定</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
