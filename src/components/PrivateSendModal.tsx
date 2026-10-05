import React, { useState } from 'react';
import { User, Send, X, ShieldAlert, Sparkles, CheckCircle2, AlertCircle, Info, ExternalLink, HelpCircle, MessageSquare, Zap, RefreshCw } from 'lucide-react';
import { LineConfig } from '../types';

interface PrivateSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LineConfig | null;
  onSendSuccess?: () => void;
}

export const PrivateSendModal: React.FC<PrivateSendModalProps> = ({
  isOpen,
  onClose,
  config,
  onSendSuccess,
}) => {
  const [targetUserId, setTargetUserId] = useState('');
  const [title, setTitle] = useState('專屬私人訊息通知');
  const [text, setText] = useState('您好！這是一則透過私人專屬通道推送的訊息，僅單獨發送給您，不使用全體廣播。');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim()) {
      setResult({ success: false, message: '請填寫接收對象的 LINE User ID' });
      return;
    }
    if (!text.trim()) {
      setResult({ success: false, message: '請輸入欲發送的私訊內容' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await fetch('/api/private-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: targetUserId.trim(),
          title: title.trim(),
          text: text.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({
          success: true,
          message: data.simulated
            ? `私人發送完成（模擬模式）：${data.error || '已成功將訊息投遞至目標用戶。'}`
            : `發送成功！LINE Request ID: ${data.requestId}，本次僅消耗 1 則額度（節省了 1,459 則全體廣播額度）。`,
        });
        if (onSendSuccess) onSendSuccess();
      } else {
        setResult({
          success: false,
          message: data.error || '私人推送失敗，請檢查 User ID 與 API 憑證是否有效。',
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || '發送時發生網路異常',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#06c755]/20 border border-[#06c755]/30 flex items-center justify-center">
              <User className="w-5 h-5 text-[#06c755]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">私人專屬發送與「零額度」防超標指南</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#06c755]/20 text-[#06c755] border border-[#06c755]/30">
                  額度節省策略
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                透過單人推播與官方免額度回覆機制，精準省下 99% 以上廣播則數
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Official Quota Rules Clarification Card */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
              <Zap className="w-4 h-4 text-[#06c755]" />
              <span>重要釐清：LINE 官方訊息計費機制與避開額度攻略</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>私人 Push 推送 (本工具)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  每發給 1 人<strong>僅扣 1 則額度</strong>！相比全體廣播（一次扣 1,460 則），<strong>可省下 99.9% 額度</strong>，極適合 VIP 客戶或單一通知。
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#06c755]" />
                  <span>被動回覆 Reply API (完全免費)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  當用戶<strong>主動傳訊息</strong>給官方帳號時，系統以 Webhook 回覆，LINE 規範<strong>100% 免費、0 額度消耗</strong>！
                </p>
              </div>
            </div>

            <div className="text-[11px] text-emerald-900 bg-white/80 p-2.5 rounded-xl border border-emerald-200/60 leading-relaxed">
              💡 <strong>行銷實戰避坑建議</strong>：
              LINE 伺服器是以「發送則數」計費，<strong>任何主動推送皆無法徹底繞過 LINE 計費伺服器</strong>。若要徹底達到 0 額度行銷，最有效策略是：<strong>在貼文串或店面引導好友主動傳送特定關鍵字（如輸入「領取優惠」），系統藉由免費的 Webhook Reply API 將私人優惠券回傳給對方</strong>！
            </div>
          </div>

          {/* Direct Private Push Form */}
          <form onSubmit={handleSend} className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[#06c755]" />
                <span>立即向單一使用者發送私人訊息 (Push Message)</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">單次發送僅計 1 則額度</span>
            </div>

            {result && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  result.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{result.success ? '私人發送成功' : '發送提示'}</div>
                  <p className="mt-0.5 leading-relaxed">{result.message}</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                接收使用者的 LINE User ID (必填)
              </label>
              <input
                type="text"
                required
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="例如：U1234567890abcdef1234567890abcdef (以 U 開頭之 33 碼字串)"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06c755]/20 focus:border-[#06c755]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                註：LINE User ID 是用戶加入好友或發送 Webhook 時由 LINE 分配的專屬 ID（並非公開的 LINE 搜尋帳號）。
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                訊息標題 (管理後台標記)
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06c755]/20 focus:border-[#06c755]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                私人訊息文字內文
              </label>
              <textarea
                rows={3}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="請輸入私訊給該用戶的詳細文字內容..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#06c755]/20 focus:border-[#06c755] leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              >
                關閉
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2 bg-[#06c755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#06c755]/20 transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? '私人發送中...' : '立即發送私人訊息'}</span>
              </button>
            </div>
          </form>

          {/* Webhook Auto-Reply Information Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>零額度自動回覆端點 (Webhook Endpoint)</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              本系統後台伺服器已內建零額度自動回應機制。您可將下列 Webhook URL 填入 LINE Developers 後台，當用戶主動傳送私訊時，系統將自動以免額度的 Reply API 回應：
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 select-all">
              /api/line/webhook
            </div>
            <div className="text-[10px] text-slate-400">
              • 官方支援：完全相容 LINE Messaging API Webhook 格式
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
