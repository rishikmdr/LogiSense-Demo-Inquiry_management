import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, AlertTriangle, XCircle, FileSpreadsheet, Download } from 'lucide-react';
import client from '../api/client';
import toast from 'react-hot-toast';

export default function ImportExport() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((accepted) => {
    setFile(accepted[0]);
    setResult(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await client.post('/import/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
      toast.success(`Imported ${res.data.imported} inquiries`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = () => {
    window.open('/api/v1/import/export-csv', '_blank');
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Import Section */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-accent-blue/10 rounded-lg">
            <Upload className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <h3 className="text-text-primary font-semibold">Import from Excel</h3>
            <p className="text-text-muted text-xs">Upload BBK export file (.xlsx)</p>
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-accent-blue bg-accent-blue/10'
              : file
              ? 'border-accent-teal/50 bg-accent-teal/5'
              : 'border-border-active hover:border-accent-blue/50 hover:bg-bg-elevated'
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-accent-teal" />
              <div className="text-left">
                <p className="text-text-primary font-medium">{file.name}</p>
                <p className="text-text-muted text-xs">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary text-sm">Drop your Excel file here, or click to browse</p>
              <p className="text-text-muted text-xs mt-1">Supports BBK Export format (.xlsx, .xls)</p>
            </div>
          )}
        </div>

        {file && (
          <button
            onClick={handleImport}
            disabled={uploading}
            className="mt-4 w-full py-2.5 bg-accent-blue hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {uploading ? 'Importing...' : 'Import File'}
          </button>
        )}

        {/* Results */}
        {result && (
          <div className="mt-4 bg-bg-elevated border border-border-subtle rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-accent-teal text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Imported: <strong>{result.imported}</strong> rows</span>
            </div>
            {result.skipped > 0 && (
              <div className="flex items-center gap-2 text-accent-amber text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Skipped (already exists): <strong>{result.skipped}</strong> rows</span>
              </div>
            )}
            {result.errors?.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-accent-red text-sm mb-1">
                  <XCircle className="w-4 h-4" />
                  <span>Errors: <strong>{result.errors.length}</strong></span>
                </div>
                <ul className="text-xs text-text-muted space-y-0.5 ml-6">
                  {result.errors.slice(0, 5).map((e, i) => (
                    <li key={i}>Row {e.row}: {e.error}</li>
                  ))}
                  {result.errors.length > 5 && <li>...and {result.errors.length - 5} more</li>}
                </ul>
              </div>
            )}
            <p className="text-text-muted text-xs pt-1 border-t border-border-subtle">
              Total processed: {result.total_processed} rows
            </p>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-accent-teal/10 rounded-lg">
            <Download className="w-5 h-5 text-accent-teal" />
          </div>
          <div>
            <h3 className="text-text-primary font-semibold">Export to CSV</h3>
            <p className="text-text-muted text-xs">Download all inquiries as CSV</p>
          </div>
        </div>
        <p className="text-text-secondary text-sm mb-4">
          Export the current inquiry database to a CSV file. Use the filters on the Inquiry List page to export a specific subset.
        </p>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent-teal/20 hover:bg-accent-teal/30 text-accent-teal border border-accent-teal/30 font-medium rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export All Inquiries (CSV)
        </button>
      </div>

      {/* Help */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
        <h4 className="text-text-secondary font-medium text-sm mb-2">Excel Format Guide</h4>
        <p className="text-text-muted text-xs leading-relaxed">
          The import supports the BBK Export format with sheets named "BBK EXPORT 2024", "BBK EXPORT 2025", "BBK EXPORT 2026", "BBK EXPORT 2026 NEW".
          Required columns: <span className="text-text-secondary font-mono">BRANCH, DIRECTION, POL, POD</span>.
          Duplicate ref numbers (REF NO.) will be skipped automatically.
        </p>
      </div>
    </div>
  );
}
