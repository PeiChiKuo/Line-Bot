import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BroadcastList } from './components/BroadcastList';
import { BroadcastEditor } from './components/BroadcastEditor';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AiDiagnosisModal } from './components/AiDiagnosisModal';
import { SettingsModal } from './components/SettingsModal';
import { BroadcastMessage, LineConfig, LineBotInfo, LineQuota, AnalyticsData } from './types';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'broadcasts' | 'editor' | 'analytics' | 'ai-diagnosis'>('broadcasts');
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [config, setConfig] = useState<LineConfig | null>(null);
  const [botInfo, setBotInfo] = useState<LineBotInfo | null>(null);
  const [quota, setQuota] = useState<LineQuota | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const [editingBroadcast, setEditingBroadcast] = useState<BroadcastMessage | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiDiagnosisOpen, setIsAiDiagnosisOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch status
      const statusRes = await fetch('/api/status');
      if (statusRes.ok) {
        const statusJson = await statusRes.json();
        setConfig(statusJson.config);
        setBotInfo(statusJson.botInfo);
        setQuota(statusJson.quota);
      }

      // 2. Fetch broadcasts
      const bcRes = await fetch('/api/broadcasts');
      if (bcRes.ok) {
        const bcJson = await bcRes.json();
        setBroadcasts(bcJson.broadcasts || []);
      }

      // 3. Fetch analytics
      const anaRes = await fetch('/api/analytics');
      if (anaRes.ok) {
        const anaJson = await anaRes.json();
        setAnalyticsData(anaJson);
      }
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Refresh every 15s to catch background scheduler completions
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle Save / Create Broadcast
  const handleSaveBroadcast = async (payload: any) => {
    try {
      if (editingBroadcast) {
        // Edit existing
        const res = await fetch(`/api/broadcasts/${editingBroadcast.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '更新失敗');
        showToast('推播訊息已成功更新！');
      } else {
        // Create new
        const res = await fetch('/api/broadcasts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || '新增推播失敗');

        if (payload.action === 'send_now') {
          showToast('推播已立即發送給全體 1,462 位好友！', 'success');
        } else if (payload.action === 'schedule') {
          showToast('推播已成功排程，系統將準時自動廣播！', 'success');
        } else {
          showToast('已儲存至草稿箱', 'info');
        }
      }

      setEditingBroadcast(null);
      setActiveTab('broadcasts');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || '操作失敗', 'error');
      throw err;
    }
  };

  // Immediate Send Trigger
  const handleSendNow = async (id: string) => {
    try {
      const res = await fetch(`/api/broadcasts/${id}/send-now`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '發送失敗');
      showToast('推播已立即發送給全體好友！');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || '發送失敗', 'error');
    }
  };

  // Delete broadcast
  const handleDeleteBroadcast = async (id: string) => {
    try {
      const res = await fetch(`/api/broadcasts/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '刪除失敗');
      }
      showToast('已刪除推播訊息');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || '刪除失敗', 'error');
    }
  };

  // Duplicate broadcast
  const handleDuplicateBroadcast = async (id: string) => {
    try {
      const res = await fetch(`/api/broadcasts/${id}/duplicate`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '複製失敗');
      }
      showToast('已成功複製為新草稿');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || '複製失敗', 'error');
    }
  };

  // Save Config
  const handleSaveConfig = async (updates: Partial<LineConfig>) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '儲存設定失敗');
      showToast('官方帳號設定已更新');
      await fetchData();
    } catch (err: any) {
      showToast(err.message || '儲存設定失敗', 'error');
      throw err;
    }
  };

  // Test Connection
  const handleTestConnection = async () => {
    const res = await fetch('/api/test-connection', { method: 'POST' });
    return await res.json();
  };

  // Open New Broadcast Editor
  const handleOpenNew = () => {
    setEditingBroadcast(null);
    setActiveTab('editor');
  };

  // Open Edit Broadcast
  const handleEdit = (b: BroadcastMessage) => {
    setEditingBroadcast(b);
    setActiveTab('editor');
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 font-sans overflow-hidden selection:bg-[#06C755]/20 selection:text-[#06C755]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 transition-all animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold border ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toast.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-indigo-600 text-white border-indigo-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#06C755]" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-300" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-300" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sleek Dark Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        botInfo={botInfo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Main Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          config={config}
          botInfo={botInfo}
          quota={quota}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenNewBroadcast={handleOpenNew}
          onRefresh={fetchData}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Dynamic Views Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'broadcasts' && (
            <BroadcastList
              broadcasts={broadcasts}
              onEdit={handleEdit}
              onDelete={handleDeleteBroadcast}
              onSendNow={handleSendNow}
              onDuplicate={handleDuplicateBroadcast}
              onCreateNew={handleOpenNew}
            />
          )}

          {activeTab === 'editor' && (
            <BroadcastEditor
              initialBroadcast={editingBroadcast}
              onSave={handleSaveBroadcast}
              onCancel={() => {
                setEditingBroadcast(null);
                setActiveTab('broadcasts');
              }}
              botName={botInfo?.displayName}
              botAvatar={botInfo?.pictureUrl}
            />
          )}

          {activeTab === 'analytics' && (
            analyticsData ? (
              <AnalyticsDashboard
                data={analyticsData}
                onOpenAiDiagnosis={() => setIsAiDiagnosisOpen(true)}
              />
            ) : (
              <div className="py-20 text-center text-sm text-slate-400">載入數據分析中...</div>
            )
          )}

          {activeTab === 'ai-diagnosis' && (
            analyticsData && (
              <div className="py-2">
                <AiDiagnosisModal
                  isOpen={true}
                  onClose={() => setActiveTab('analytics')}
                  onSelectTopic={() => {
                    setEditingBroadcast(null);
                    setActiveTab('editor');
                  }}
                />
              </div>
            )
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        botInfo={botInfo}
        onSaveConfig={handleSaveConfig}
        onTestConnection={handleTestConnection}
      />

      {/* AI Diagnosis Modal (when triggered from buttons outside tab) */}
      <AiDiagnosisModal
        isOpen={isAiDiagnosisOpen}
        onClose={() => setIsAiDiagnosisOpen(false)}
        onSelectTopic={(topic) => {
          setIsAiDiagnosisOpen(false);
          setEditingBroadcast(null);
          setActiveTab('editor');
        }}
      />
    </div>
  );
}
