import React, { useState } from 'react';
import { Key, ShieldCheck, ExternalLink, X, Check, Bot } from 'lucide-react';
import { aiService } from '../../services/aiService';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [keyInput, setKeyInput] = useState(aiService.getStoredApiKey());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    aiService.setStoredApiKey(keyInput);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#141622] rounded-3xl p-6 border border-zinc-200 dark:border-[#2A2E45] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">
              Google Gemini AI Key Settings
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Power Chat with PDF &amp; AI Summarizer with real AI
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-[#2A2E45] bg-zinc-50 dark:bg-[#1B1E2E] focus:border-purple-600 dark:focus:border-purple-500 outline-none text-zinc-900 dark:text-white placeholder-zinc-400"
            />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1">
              <span>Don't have one? Get a 100% free Gemini API key from</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline inline-flex items-center gap-0.5"
              >
                Google AI Studio <ExternalLink className="w-3 h-3 inline" />
              </a>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-[11px] text-purple-800 dark:text-purple-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
            <span>
              <strong>Privacy Guaranteed:</strong> Your API key is stored securely in your browser's local storage and used directly to communicate with Google Gemini. If left blank, PDFora will use its smart extractive NLP engine!
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#2A2E45] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
