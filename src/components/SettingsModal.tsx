import React, { useState } from 'react';
import { Settings, X, Shield, Key, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, HelpCircle } from 'lucide-react';
import { LineConfig, LineBotInfo } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LineConfig | null;
  botInfo: LineBotInfo | null;
  onSaveConfig: (updates: Partial<LineConfig>) => Promise<void>;
  onTestConnection: () => Promise<any>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  botInfo,
  onSaveConfig,
  onTestConnection,
}) => {
  const [channelId, setChannelId] = useState(config?.channelId || '2005645102');
  const [channelSecret, setChannelSecret] = useState(config?.channelSecret || '398637e41ea383a2fac9892722ab8e00');
  const [accessToken, setAccessToken] = useState(config?.accessToken || '');
  const [testMode, setTestMode] = useState(config?.testMode || false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // First save if changed
      await onSaveConfig({
        channelId,
        channelSecret,
        accessToken,
        testMode,
      });

      const res = await onTestConnection();
      if (res.success) {
        setTestResult({
          success: true,
          message: `連線成功！已成功連線至官方帳號：${res.botInfo?.displayName || 'LINE 官方小幫手'} (${res.botInfo?.basicId || '@2005645102'})`,
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || '連線失敗，請檢查 Channel ID、Secret 或 Access Token 是否正確。',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || '連線測試時發生錯誤',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveConfig({
        channelId,
        channelSecret,
        accessToken,
        testMode,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06c755]/20 border border-[#06c755]/30 flex items-center justify-center">
              <Settings className="w-5 h-5 text-[#06c755]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">LINE 官方帳號與憑證設定</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                管理 Messaging API 憑證、密鑰與連線健康狀態
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 leading-relaxed font-medium ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{testResult.success ? 'LINE API 連線正常' : '連線提示'}</div>
                <p className="mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Channel ID & Secret */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                LINE Channel ID (頻道 ID)
              </label>
              <input
                type="text"
                required
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                placeholder="2005645102"
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06c755]/20 focus:border-[#06c755]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                LINE Channel Secret (頻道金鑰密碼)
              </label>
              <input
                type="password"
                required
                value={channelSecret}
                onChange={(e) => setChannelSecret(e.target.value)}
                placeholder="398637e41ea383a2fac9892722ab8e00"
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06c755]/20 focus:border-[#06c755]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Channel Access Token (長期權限存取權杖 - 選填)
                </label>
                <span className="text-[10px] text-slate-400 font-medium">若有自訂可直接貼上</span>
              </div>
              <textarea
                rows={2}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="若未填寫，系統將自動使用上方 Channel ID 與 Secret 向 LINE 伺服器簽發 Access Token..."
                className="w-full px-4 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06c755]/20 focus:border-[#06c755] leading-relaxed"
              />
            </div>
          </div>

          {/* Test connection button */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? '連線驗證中...' : '測試 LINE API 連線'}</span>
            </button>
            <a
              href="https://developers.line.biz/console/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#06c755] px-2 py-2 transition-colors"
            >
              <span>前往 LINE Developers 後台</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Useful Tips */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <HelpCircle className="w-3.5 h-3.5 text-[#06c755]" />
              <span>推播小秘訣</span>
            </div>
            <p>
              • <strong>全體好友廣播</strong>：發送至 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">/v2/bot/message/broadcast</code>，將推播送達所有尚未封鎖的好友。
            </p>
            <p>
              • <strong>免費額度</strong>：LINE 官方帳號免費方案每月提供 500 則免費廣播則數，系統會自動在頂端即時統計剩餘用量。
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#06c755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#06c755]/20 transition-colors"
            >
              {saving ? '儲存中...' : '儲存設定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
