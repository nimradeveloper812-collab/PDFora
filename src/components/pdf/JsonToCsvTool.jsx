import React, { useState, useRef } from 'react';
import { UploadCloud, Code, Download, Sparkles, Table, RefreshCw, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function JsonToCsvTool() {
  const [jsonText, setJsonText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const sampleJson = `[
  { "id": 1, "name": "John Doe", "role": "Software Engineer", "department": "Engineering", "salary": 95000 },
  { "id": 2, "name": "Jane Smith", "role": "Product Manager", "department": "Product", "salary": 110000 },
  { "id": 3, "name": "Alex Johnson", "role": "UX Designer", "department": "Design", "salary": 88000 }
]`;

  const handleParseJson = (textToParse) => {
    setErrorMsg('');
    const raw = textToParse || jsonText;
    if (!raw.trim()) return;

    try {
      const data = JSON.parse(raw);
      const rows = Array.isArray(data) ? data : [data];
      if (rows.length === 0) throw new Error('JSON array is empty.');

      const headers = Array.from(new Set(rows.flatMap(Object.keys)));
      setParsedData({ headers, rows });
    } catch (err) {
      setErrorMsg('Invalid JSON format. Please ensure valid JSON array or object.');
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      setJsonText(text);
      handleParseJson(text);
    } catch (err) {
      setErrorMsg('Failed to read JSON file.');
    }
  };

  const exportCsv = () => {
    if (!parsedData) return;
    const ws = XLSX.utils.json_to_sheet(parsedData.rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `json_export_${Date.now()}.csv`;
    link.click();
  };

  const exportExcel = () => {
    if (!parsedData) return;
    const ws = XLSX.utils.json_to_sheet(parsedData.rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "JSON Data");
    XLSX.writeFile(wb, `json_export_${Date.now()}.xlsx`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json, application/json"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />

      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900">JSON to CSV &amp; Excel Converter</h3>
              <p className="text-xs text-zinc-500 font-medium">Paste JSON string or upload a .json file</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setJsonText(sampleJson); handleParseJson(sampleJson); }}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100"
            >
              Load Sample JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-200"
            >
              Upload JSON File
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <textarea
          rows={6}
          value={jsonText}
          onChange={e => setJsonText(e.target.value)}
          placeholder='Paste JSON here... e.g. [{"id": 1, "name": "Product A", "price": 99.99}]'
          className="w-full text-xs font-mono p-4 rounded-2xl border border-zinc-200 focus:border-emerald-600 outline-none bg-zinc-50/50"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-400 font-medium">100% in-browser client-side JSON parsing</span>
          <button
            onClick={() => handleParseJson()}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Parse &amp; Convert JSON
          </button>
        </div>
      </div>

      {parsedData && (
        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xl space-y-4 animate-fade-up">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Extracted JSON Data Table</h4>
              <p className="text-xs text-zinc-500">{parsedData.rows.length} rows, {parsedData.headers.length} columns</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CSV
              </button>
              <button
                onClick={exportExcel}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs"
              >
                <Download className="w-4 h-4" />
                Export to Excel (.xlsx)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-emerald-50/60 border-b border-emerald-100 sticky top-0">
                  {parsedData.headers.map((h, idx) => (
                    <th key={idx} className="p-3 font-bold text-emerald-950 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {parsedData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-50 transition-colors">
                    {parsedData.headers.map((h, cIdx) => (
                      <td key={cIdx} className="p-3 text-zinc-700 max-w-xs truncate">
                        {typeof row[h] === 'object' ? JSON.stringify(row[h]) : String(row[h] !== undefined ? row[h] : '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
