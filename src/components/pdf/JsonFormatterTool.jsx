import React, { useState } from 'react';
import { Code, Copy, Check, Download, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

export default function JsonFormatterTool() {
  const [inputJson, setInputJson] = useState('');
  const [outputJson, setOutputJson] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const sampleJson = `{"name":"PDFora","type":"SaaS Platform","features":["Merge PDF","Compress PDF","OCR PDF"],"active":true,"rating":4.9}`;

  const formatJson = (indent = 2) => {
    setErrorMsg('');
    if (!inputJson.trim()) return;

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutputJson(formatted);
    } catch (err) {
      setErrorMsg(`Invalid JSON Syntax: ${err.message}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([outputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted_data_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">JSON Formatter &amp; Prettifier</h3>
              <p className="text-xs text-zinc-500 font-medium">Format, validate, prettify, and minify JSON data</p>
            </div>
          </div>
          <button
            onClick={() => { setInputJson(sampleJson); setErrorMsg(''); }}
            className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100"
          >
            Load Sample JSON
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <textarea
          rows={6}
          value={inputJson}
          onChange={e => setInputJson(e.target.value)}
          placeholder='Paste raw unformatted JSON string here...'
          className="w-full text-xs font-mono p-4 rounded-2xl border border-zinc-200 focus:border-teal-600 outline-none bg-zinc-50/50"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="text-xs text-zinc-400 font-medium">100% Client-Side JSON Validation</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => formatJson(0)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
            >
              Minify (1 Line)
            </button>
            <button
              onClick={() => formatJson(2)}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold text-white shadow-md bg-teal-600 hover:bg-teal-700 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Prettify JSON
            </button>
          </div>
        </div>
      </div>

      {outputJson && (
        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xl space-y-3 animate-fade-up">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-700 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              Valid Formatted JSON Output
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={downloadJson}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download .json
              </button>
            </div>
          </div>

          <textarea
            readOnly
            rows={10}
            value={outputJson}
            className="w-full text-xs font-mono p-4 rounded-2xl border border-zinc-200 bg-zinc-50 text-zinc-800 outline-none"
          />
        </div>
      )}
    </div>
  );
}
