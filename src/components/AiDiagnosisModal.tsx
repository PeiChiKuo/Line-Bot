import React, { useEffect, useState } from 'react';
import { Sparkles, X, CheckCircle2, TrendingUp, Clock, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { AiDiagnosisResult } from '../types';

interface AiDiagnosisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic?: (topic: string) => void;
}

export const AiDiagnosisModal: React.FC<AiDiagnosisModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
}) => {
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<AiDiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDiagnosis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/deep-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setDiagnosis(data);
    } catch (err: any) {
      setError(err.message || '無法生成 AI 診斷報告');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !diagnosis && !loading) {
      fetchDiagnosis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06c755]/20 border border-[#06c755]/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#06c755] fill-[#06c755]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">LINE 官方帳號數據深度診斷報告</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#06c755]/20 text-[#06c755] border border-[#06c755]/30 uppercase">
                  Gemini AI 自動分析
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                整合歷史推播、開封時間與好友留存行為之智慧診斷
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#06c755] animate-spin mx-auto" />
              <div className="text-sm font-bold text-slate-800">正在分析官方帳號歷史數據與互動表現...</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Gemini 正在計算最佳推播時段、開封率驅動力與防封鎖策略
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          ) : diagnosis ? (
            <div className="space-y-6">
              {/* Score & Summary */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="text-center sm:text-left shrink-0">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    帳號營運健康度
                  </div>
                  <div className="text-4xl font-extrabold text-slate-900 mt-1 font-mono">
                    {diagnosis.overallScore} <span className="text-base text-slate-400 font-normal">/ 100</span>
                  </div>
                </div>
                <div className="sm:border-l sm:border-slate-200 sm:pl-5 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    總結診斷評語:
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {diagnosis.summary}
                  </p>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#06c755]" />
                  <span>核心數據亮點 (已具備優勢)</span>
                </h4>
                <div className="space-y-2">
                  {diagnosis.strengths.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5 font-medium"
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span>具體優化策略與行動建議</span>
                </h4>
                <div className="space-y-3">
                  {diagnosis.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            {rec.targetMetric}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              rec.impact === 'high'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {rec.impact === 'high' ? '高影響力' : '中影響力'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rec.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optimal Schedule Guidance */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-2.5">
                <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>最佳排程時段推薦（針對台灣用戶閱讀作息）</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase">推薦推播星期</span>
                    <div className="font-bold text-indigo-900 mt-1">
                      {diagnosis.optimalSchedule.bestDays.join('、')}
                    </div>
                  </div>
                  <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase">黃金時間視窗</span>
                    <div className="font-bold text-indigo-900 mt-1">
                      {diagnosis.optimalSchedule.bestTimeWindows.join(' / ')}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-700 leading-relaxed pt-1">
                  💡 理由：{diagnosis.optimalSchedule.reason}
                </p>
              </div>

              {/* Suggested Topics for Next Broadcasts */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  推薦近期高轉化推播主題（點擊可直接建立）
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {diagnosis.suggestedTopics.map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (onSelectTopic) onSelectTopic(topic);
                        onClose();
                      }}
                      className="p-3.5 bg-slate-50 hover:bg-purple-50 text-left rounded-xl border border-slate-200 hover:border-purple-200 transition-all text-xs group"
                    >
                      <div className="font-bold text-slate-800 group-hover:text-purple-900 line-clamp-2">
                        {topic}
                      </div>
                      <div className="text-[10px] text-purple-600 font-bold mt-2 flex items-center gap-1">
                        <span>以此主題發送</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            onClick={fetchDiagnosis}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>重新產生最新數據診斷</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            完成檢閱
          </button>
        </div>
      </div>
    </div>
  );
};
