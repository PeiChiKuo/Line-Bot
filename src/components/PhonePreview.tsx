import React, { useState } from 'react';
import { MessageSquare, Bell, ArrowLeft, MoreVertical, Wifi, Battery, ExternalLink, Tag, Copy, Smartphone } from 'lucide-react';
import { MessageType, CardButton } from '../types';

interface PhonePreviewProps {
  type: MessageType;
  title: string;
  text: string;
  imageUrl?: string;
  cardTitle?: string;
  cardDescription?: string;
  buttons?: CardButton[];
  couponCode?: string;
  couponDiscount?: string;
  couponExpiry?: string;
  notificationDisabled?: boolean;
  botName?: string;
  botAvatar?: string;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
  type,
  title,
  text,
  imageUrl,
  cardTitle,
  cardDescription,
  buttons = [],
  couponCode,
  couponDiscount,
  couponExpiry,
  notificationDisabled,
  botName = '官方帳號小幫手',
  botAvatar = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
}) => {
  const [previewMode, setPreviewMode] = useState<'chat' | 'notification'>('chat');
  const [copiedCode, setCopiedCode] = useState(false);

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleCopy = () => {
    if (couponCode) {
      navigator.clipboard.writeText(couponCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Switch Preview View */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl mb-4 text-xs font-bold shadow-2xs">
        <button
          onClick={() => setPreviewMode('chat')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
            previewMode === 'chat'
              ? 'bg-white text-slate-900 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>LINE 聊天室實機預覽</span>
        </button>
        <button
          onClick={() => setPreviewMode('notification')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
            previewMode === 'notification'
              ? 'bg-white text-slate-900 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>鎖定畫面通知預覽</span>
        </button>
      </div>

      {/* Smartphone Mockup Frame */}
      <div className="w-[330px] h-[640px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-[4px] border-slate-800 relative flex flex-col overflow-hidden">
        {/* Phone Notch / Speaker */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-20 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700/50" />
        </div>

        {/* Screen Content Container */}
        <div className="w-full h-full bg-[#8CABD9] rounded-[34px] overflow-hidden flex flex-col relative text-slate-900">
          {/* iOS Status Bar */}
          <div className="h-9 px-6 pt-2 flex items-center justify-between text-[11px] font-semibold text-slate-800 select-none z-10">
            <span>{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              <div className="w-4 h-2 border border-slate-800 rounded-sm p-0.5 flex items-center">
                <div className="w-2.5 h-1 bg-slate-800 rounded-2xs" />
              </div>
            </div>
          </div>

          {previewMode === 'chat' ? (
            /* LINE Chat Window */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* LINE Header */}
              <div className="h-11 bg-slate-900/10 backdrop-blur-md px-3 flex items-center justify-between border-b border-white/10 text-slate-900">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4 cursor-pointer" />
                  <div className="flex items-center gap-2">
                    <img
                      src={botAvatar}
                      alt="bot"
                      className="w-7 h-7 rounded-full object-cover border border-white/40"
                    />
                    <div>
                      <div className="text-xs font-bold leading-none">{botName}</div>
                      <div className="text-[10px] text-slate-700 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        官方認證帳號
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <MoreVertical className="w-4 h-4" />
                </div>
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Date Divider */}
                <div className="flex justify-center my-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/15 text-[10px] font-medium text-white/90">
                    今天 {currentTime}
                  </span>
                </div>

                {/* Bot Message Row */}
                <div className="flex items-start gap-2 max-w-[95%]">
                  <img
                    src={botAvatar}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border border-white/60 shadow-sm shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-800 mb-1 px-1">
                      {botName}
                    </span>

                    {/* Content depending on MessageType */}
                    {type === 'text' && (
                      <div className="relative bg-white text-slate-900 px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-sm text-xs leading-relaxed max-w-[230px]">
                        <p className="whitespace-pre-wrap break-words">{text || '請在左側輸入要廣播的推播文字內容...'}</p>
                      </div>
                    )}

                    {type === 'image' && (
                      <div className="bg-white rounded-2xl rounded-tl-xs shadow-sm overflow-hidden max-w-[230px]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt="preview"
                            className="w-full h-36 object-cover"
                          />
                        ) : (
                          <div className="w-full h-32 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                            請輸入圖片網址
                          </div>
                        )}
                        {text && (
                          <div className="p-3 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {text}
                          </div>
                        )}
                      </div>
                    )}

                    {type === 'card' && (
                      <div className="bg-white rounded-2xl rounded-tl-xs shadow-md overflow-hidden max-w-[240px] border border-slate-100">
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt="card-hero"
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="p-3">
                          <h4 className="font-bold text-slate-900 text-xs leading-snug">
                            {cardTitle || title || '卡片主標題'}
                          </h4>
                          {cardDescription && (
                            <p className="text-[11px] text-[#06C755] font-semibold mt-0.5">
                              {cardDescription}
                            </p>
                          )}
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap line-clamp-3">
                            {text || '卡片說明文字...'}
                          </p>
                        </div>

                        {/* Card Buttons */}
                        {buttons.length > 0 ? (
                          <div className="border-t border-slate-100 divide-y divide-slate-100">
                            {buttons.map((btn, idx) => (
                              <button
                                key={idx}
                                className={`w-full py-2 px-3 text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                                  btn.style === 'secondary'
                                    ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                    : 'bg-white text-[#06C755] hover:bg-emerald-50/50'
                                }`}
                              >
                                <span>{btn.label || `按鈕 ${idx + 1}`}</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-2 border-t border-slate-100 text-center">
                            <span className="text-[11px] text-slate-400">尚未設定行動按鈕</span>
                          </div>
                        )}
                      </div>
                    )}

                    {type === 'coupon' && (
                      <div className="bg-white rounded-2xl rounded-tl-xs shadow-md overflow-hidden max-w-[240px] border border-emerald-100">
                        {/* Coupon Banner */}
                        <div className="bg-gradient-to-r from-[#06C755] to-emerald-600 text-white p-3">
                          <div className="text-[10px] font-bold tracking-wider uppercase opacity-90">
                            LINE VIP 專屬優惠
                          </div>
                          <div className="text-base font-extrabold mt-0.5">
                            {couponDiscount || '全館 85 折 + 免運'}
                          </div>
                        </div>

                        <div className="p-3 space-y-2.5">
                          <div className="text-xs font-bold text-slate-800">
                            {title || '好友專屬限定好康'}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {text || '結帳輸入折扣碼即享優惠！'}
                          </p>

                          {/* Coupon Code Box */}
                          <div
                            onClick={handleCopy}
                            className="bg-emerald-50/80 border border-dashed border-emerald-300 rounded-lg p-2 flex items-center justify-between cursor-pointer hover:bg-emerald-100/70 transition-colors"
                          >
                            <div>
                              <div className="text-[9px] text-slate-500 font-medium">點擊複製優惠碼</div>
                              <div className="text-xs font-mono font-bold text-emerald-800">
                                {couponCode || 'VIP888'}
                              </div>
                            </div>
                            <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                              <Copy className="w-3 h-3" />
                              {copiedCode ? '已複製' : '複製'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                            <span>使用期限</span>
                            <span className="text-slate-600">{couponExpiry || '2026-09-30'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timestamp and Read Status */}
                    <div className="flex items-center gap-1 mt-1 px-1 text-[9px] text-slate-700">
                      <span>{currentTime}</span>
                      <span>•</span>
                      <span>全體廣播</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Mock Input Bar */}
              <div className="h-11 bg-white/90 backdrop-blur px-3 flex items-center gap-2 border-t border-slate-200">
                <div className="flex-1 h-7 bg-slate-100 rounded-full px-3 text-[11px] text-slate-400 flex items-center">
                  傳送訊息...
                </div>
                <div className="w-7 h-7 rounded-full bg-[#06C755] flex items-center justify-center text-white">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ) : (
            /* Lock Screen Notification Simulator */
            <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 flex flex-col justify-start pt-12 space-y-4">
              <div className="text-center">
                <div className="text-4xl font-light tracking-tight">{currentTime}</div>
                <div className="text-xs text-slate-400 mt-1">9月7日 星期一</div>
              </div>

              {/* Push Notification Card */}
              <div className="bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl p-3 shadow-lg">
                <div className="flex items-center justify-between text-xs text-white/80 mb-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <img
                      src={botAvatar}
                      alt="avatar"
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>LINE • {botName}</span>
                  </div>
                  <span className="text-[10px] text-white/60">現在</span>
                </div>

                <div className="text-xs font-bold text-white mb-0.5">
                  {title || '新推播訊息'}
                </div>

                <div className="text-[11px] text-white/90 line-clamp-2 leading-relaxed">
                  {text || '這是推播內容預覽...'}
                </div>

                {notificationDisabled && (
                  <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center gap-1 text-[10px] text-amber-300">
                    <span>🔕 此推播已設定靜音推播（不震動或響鈴）</span>
                  </div>
                )}
              </div>

              <div className="text-center text-[11px] text-slate-400 pt-4">
                輕觸通知即可直接跳轉至 LINE 聊天室
              </div>
            </div>
          )}

          {/* Home indicator bar */}
          <div className="h-4 flex items-center justify-center pb-1">
            <div className="w-28 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-400 mt-3 text-center">
        預覽畫面依據 LINE 官方規格 1:1 實機模擬
      </div>
    </div>
  );
};
