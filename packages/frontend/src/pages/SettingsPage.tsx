import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import {
  User,
  Key,
  Loader2,
  Save,
  Plus,
  Trash2,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Power,
  PowerOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ApiKey {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'api'>('profile');
  
  // Profile form
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [creatingKey, setCreatingKey] = useState(false);

  useEffect(() => {
    if (activeTab === 'api') {
      loadApiKeys();
    }
  }, [activeTab]);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const keys = await api.getApiKeys();
      setApiKeys(keys);
    } catch (error) {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await api.updateProfile({ name });
      await refreshProfile();
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyLabel.trim()) {
      toast.error('Please enter a label for the API key');
      return;
    }

    setCreatingKey(true);
    try {
      const result = await api.createApiKey({ label: newKeyLabel });
      setNewlyCreatedKey(result.key);
      setNewKeyLabel('');
      await loadApiKeys();
      toast.success('API key created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create API key');
      setShowNewKeyModal(false);
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteApiKey(id);
      await loadApiKeys();
      toast.success('API key deleted');
    } catch (error) {
      toast.error('Failed to delete API key');
    }
  };

  const handleToggleApiKey = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await api.deactivateApiKey(id);
        toast.success('API key deactivated');
      } else {
        await api.reactivateApiKey(id);
        toast.success('API key reactivated');
      }
      await loadApiKeys();
    } catch (error) {
      toast.error('Failed to update API key');
    }
  };

  const copyApiKey = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(id);
    toast.success('API key copied!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyNewKey = async () => {
    if (newlyCreatedKey) {
      await navigator.clipboard.writeText(newlyCreatedKey);
      toast.success('API key copied!');
    }
  };

  const closeNewKeyModal = () => {
    setShowNewKeyModal(false);
    setNewlyCreatedKey(null);
    setNewKeyLabel('');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-300 mt-1">Manage your account settings</p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-white/10">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="input bg-surface"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="label">Current Plan</label>
                <div className="flex items-center gap-2">
                  <span className="badge-primary capitalize">
                    {profile?.planName || 'Free'}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-medium text-white">API Keys</h3>
                  <p className="text-sm text-slate-400">
                    Use API keys to integrate with the Chrome extension or external tools
                  </p>
                </div>
                <button
                  onClick={() => setShowNewKeyModal(true)}
                  className="btn-primary btn-sm"
                  disabled={apiKeys.length >= 5}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Key
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-12 bg-surface rounded-lg">
                  <Key className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No API keys yet</p>
                  <button
                    onClick={() => setShowNewKeyModal(true)}
                    className="btn-outline btn-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create your first API key
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((apiKey) => (
                    <div
                      key={apiKey.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        apiKey.isActive
                          ? 'bg-surface-50 border-white/10'
                          : 'bg-surface border-white/10 opacity-60'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{apiKey.label}</p>
                          {!apiKey.isActive && (
                            <span className="badge-warning text-xs">Inactive</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm text-slate-400 font-mono">
                            {showKey === apiKey.id
                              ? apiKey.key
                              : `${apiKey.key.slice(0, 8)}${'•'.repeat(24)}${apiKey.key.slice(-4)}`}
                          </code>
                          <button
                            onClick={() =>
                              setShowKey(showKey === apiKey.id ? null : apiKey.id)
                            }
                            className="p-1 text-slate-500 hover:text-slate-300"
                          >
                            {showKey === apiKey.id ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Created {new Date(apiKey.createdAt).toLocaleDateString()}
                          {apiKey.lastUsedAt && (
                            <> • Last used {new Date(apiKey.lastUsedAt).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyApiKey(apiKey.key, apiKey.id)}
                          className="p-2 text-slate-500 hover:text-slate-300"
                          title="Copy API key"
                        >
                          {copiedKey === apiKey.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleApiKey(apiKey.id, apiKey.isActive)}
                          className={`p-2 ${
                            apiKey.isActive
                              ? 'text-slate-500 hover:text-amber-600'
                              : 'text-slate-500 hover:text-green-600'
                          }`}
                          title={apiKey.isActive ? 'Deactivate' : 'Reactivate'}
                        >
                          {apiKey.isActive ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteApiKey(apiKey.id)}
                          className="p-2 text-slate-500 hover:text-red-600"
                          title="Delete API key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {apiKeys.length >= 5 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    You've reached the maximum of 5 API keys. Delete an existing key to create a new one.
                  </p>
                </div>
              )}

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-1">Security Notice</h4>
                <p className="text-sm text-amber-700">
                  Keep your API keys secure. Do not share them publicly or commit them to version control.
                  If you suspect a key has been compromised, delete it immediately and create a new one.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create API Key Modal */}
      {showNewKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-50 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {newlyCreatedKey ? 'API Key Created!' : 'Create New API Key'}
              </h3>

              {newlyCreatedKey ? (
                <div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Save this API key now!
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          You won't be able to see it again. Copy it and store it securely.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <code className="block p-3 bg-surface-100 rounded text-sm font-mono break-all">
                      {newlyCreatedKey}
                    </code>
                    <button
                      onClick={copyNewKey}
                      className="absolute top-2 right-2 p-2 bg-surface-50 rounded shadow-sm hover:bg-surface-50/5"
                    >
                      <Copy className="w-4 h-4 text-slate-300" />
                    </button>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={copyNewKey}
                      className="btn-primary flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Key
                    </button>
                    <button
                      onClick={closeNewKeyModal}
                      className="btn-outline flex-1"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateApiKey}>
                  <div className="mb-4">
                    <label className="label">Label</label>
                    <input
                      type="text"
                      value={newKeyLabel}
                      onChange={(e) => setNewKeyLabel(e.target.value)}
                      className="input"
                      placeholder="e.g., Chrome Extension, Mobile App"
                      required
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Give this key a descriptive name to help you identify it later
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={creatingKey}
                      className="btn-primary flex-1"
                    >
                      {creatingKey ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Key
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeNewKeyModal}
                      className="btn-outline flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
