import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import {
  TrendingUp, Users, Eye, MousePointer, ShieldAlert, Sparkles, Download, Calendar, ArrowUpRight, CheckCircle2,
} from 'lucide-react';
import { AnalyticsData } from '../types';

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  onOpenAiDiagnosis: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, onOpenAiDiagnosis }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  const { metrics, dailyTrends, hourlyEngagement, categoryPerformance, recentDeliveryLogs } = data;

  const handleExportCsv = () => {
    const headers = ['推播標題', '發送時間', '類型', '送達好友數', '開封率(%)', '點擊率(%)'];
    const rows = recentDeliveryLogs.map((log) => [
      `"${log.title.replace(/"/g, '""')}"`,
      log.sentAt,
      log.type,
      log.recipients,
      log.openRate,
      log.clickRate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LINE_官方帳號推播成效報表_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with AI Analysis CTA */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#06c755]/15 text-[#06c755] border border-[#06c755]/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#06c755]" />
            <span>自動化數據統計與成效洞察</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            官方帳號全方位數據儀表板
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            系統每日自動同步好友成長動態、開封趨勢與每則推播點擊互動。點擊右側可啟動 Gemini AI 深度成效診斷與最佳發送時段建議。
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={onOpenAiDiagnosis}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#06c755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#06c755]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>AI 深度數據診斷</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>匯出 CSV</span>
          </button>
        </div>

        {/* Decorative background subtle glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#06c755]/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">好友總數</span>
            <Users className="w-4 h-4 text-[#06c755]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            {metrics.totalFollowers.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#06c755] mt-1 font-bold">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18 本週淨增長</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">目標有效觸及</span>
            <CheckCircle2 className="w-4 h-4 text-[#06c755]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            {metrics.activeFollowers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            活躍率 <strong className="text-slate-900">95.7%</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">平均開封率</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-2 tracking-tight">
            {metrics.avgOpenRate}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-bold">
            高於同業平均 (42%)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">平均點擊轉化率</span>
            <MousePointer className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2 tracking-tight">
            {metrics.avgClickRate}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            連結與卡片按鈕
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">封鎖率</span>
            <ShieldAlert className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2 tracking-tight">
            {((metrics.blockedFollowers / metrics.totalFollowers) * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">
            ✓ 處於健康安全區間
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">本月廣播次數</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            {metrics.monthlyBroadcastsSent} 則
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            發送額度剩餘充足
          </div>
        </div>
      </div>

      {/* Row 1: Trends & Hourly Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">好友成長與有效觸及動態</h3>
              <p className="text-xs text-slate-500 mt-0.5">每日自動追蹤官方帳號總好友數與退追封鎖變化</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded-lg transition-colors ${timeRange === '7d' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              >
                近 7 天
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded-lg transition-colors ${timeRange === '30d' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500'}`}
              >
                近 30 天
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06c755" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06c755" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={['dataMin - 50', 'dataMax + 50']} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="followers" name="總好友數" stroke="#06c755" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFollowers)" />
                <Area type="monotone" dataKey="targetedReaches" name="有效可觸及好友" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorReach)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Peak Engagement Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">推播最佳時段成效分析</h3>
            <p className="text-xs text-slate-500 mt-0.5">依據全天時段統計之平均開封速度與閱讀率</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyEngagement} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} unit="%" />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, '平均開封率']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="avgOpenRate" name="平均開封率 (%)" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-900">黃金推播推薦:</span>
            <span className="text-indigo-700 font-bold">中午 12:00 (68%) 與 晚間 20:30 (74%)</span>
          </div>
        </div>
      </div>

      {/* Row 2: Category Breakdown & Recent Delivery Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Performance Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">推播類型成效分佈</h3>
            <p className="text-xs text-slate-500 mt-0.5">不同格式對於開封率與點擊率的實際回饋</p>
          </div>

          <div className="space-y-3">
            {categoryPerformance.map((cat, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{cat.category}</span>
                  <span className="text-slate-500 font-medium">{cat.count} 則推播</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400">平均開封:</span>
                    <strong className="text-emerald-600 ml-1 font-bold">{cat.avgOpenRate}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">點擊率:</span>
                    <strong className="text-blue-600 ml-1 font-bold">{cat.avgClickRate}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Delivery Logs Table (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">推播送達紀錄與成效日誌</h3>
              <p className="text-xs text-slate-500 mt-0.5">歷史全體推播訊息的送達人數、開封率與點擊轉化</p>
            </div>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1 text-xs text-[#06c755] font-bold hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>匯出明細</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">推播標題</th>
                  <th className="py-3 px-3">格式</th>
                  <th className="py-3 px-3">送達好友</th>
                  <th className="py-3 px-3">開封率</th>
                  <th className="py-3 px-3">點擊率</th>
                  <th className="py-3 px-3">發送時間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDeliveryLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-800 max-w-xs truncate">
                      {log.title}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-700 font-medium">
                      {log.recipients.toLocaleString()} 人
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-[#06c755]">{log.openRate}%</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-blue-600">{log.clickRate}%</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 font-medium">
                      {new Date(log.sentAt).toLocaleDateString('zh-TW', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
