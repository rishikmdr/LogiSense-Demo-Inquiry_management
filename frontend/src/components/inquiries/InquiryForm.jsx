import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useLookupData, useCheckDuplicate } from '../../hooks/useInquiries';
import { ALL_STATUSES } from '../ui/StatusBadge';

const DIRECTIONS = [
  'PERSIAN GULF', 'EAST AFRICA', 'WEST AFRICA', 'FAR EAST',
  'FAR EAST / SOUTH EAST ASIA', 'AUSTRALIA / NEW ZEALAND',
  'SOUTH AMERICA', 'USA', 'EUROPE', 'MEDITERRANEAN', 'RED SEA', 'SOUTH AFRICA',
];

const CUSTOMER_TYPES = ['FORWARDER', 'DIRECT CUSTOMER', 'OVERSEAS AGENT'];

function FormField({ label, required, children, error }) {
  return (
    <div>
      <label className="block text-text-muted text-xs uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-accent-red ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-accent-red text-xs mt-1">{error}</p>}
    </div>
  );
}

const inputClass = 'w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-border-active transition-colors';

export function InquiryForm({ initialData = {}, onSubmit, isLoading, submitLabel = 'Save Inquiry' }) {
  const navigate = useNavigate();
  const { data: lookup } = useLookupData();
  const { mutate: checkDuplicate, data: duplicateResult } = useCheckDuplicate();

  const [form, setForm] = useState({
    branch: '', sales_person: '', customer_name: '', inquiry_date: new Date().toISOString().split('T')[0],
    direction: '', pol: '', pod: '', cargo_description: '', no_of_packages: '',
    volume_frt: '', heavy_lifts: '', laycan: '', rate_per_frt: '', target_per_frt: '',
    status: 'OPEN', sales_support: '', customer_type: '',
    has_photographs: false, has_technical_diagrams: false,
    ...initialData,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (form.pol && form.pod && form.direction) {
      const timer = setTimeout(() => {
        checkDuplicate({ pol: form.pol, pod: form.pod, direction: form.direction, laycan: form.laycan, excludeId: initialData?.id });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [form.pol, form.pod, form.direction, form.laycan]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.branch) errs.branch = 'Branch is required';
    if (!form.sales_person) errs.sales_person = 'Sales person is required';
    if (!form.direction) errs.direction = 'Trade route is required';
    if (!form.pol) errs.pol = 'Port of loading is required';
    if (!form.pod) errs.pod = 'Port of discharge is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...form };
    // Auto-calculate rates
    if (payload.rate_per_frt && payload.volume_frt) {
      payload.total_rate = parseFloat(payload.rate_per_frt) * parseFloat(payload.volume_frt);
    }
    if (payload.target_per_frt && payload.volume_frt) {
      payload.total_target = parseFloat(payload.target_per_frt) * parseFloat(payload.volume_frt);
    }
    // Clean empty strings to null
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '') payload[k] = null;
    });
    onSubmit(payload);
  };

  const hasDuplicates = duplicateResult?.potential_duplicates?.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Duplicate warning */}
      {hasDuplicates && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-accent-amber font-medium text-sm">
              ⚠️ {duplicateResult.potential_duplicates.length} similar {duplicateResult.potential_duplicates.length === 1 ? 'inquiry' : 'inquiries'} found
              <span className="ml-1 text-xs text-amber-400/70">({duplicateResult.confidence} confidence)</span>
            </p>
            <p className="text-amber-400/70 text-xs mt-1">
              {duplicateResult.potential_duplicates.map((d) => d.ref_no).join(', ')} — same route and port combination
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Column 1 */}
        <div className="space-y-4">
          <FormField label="Branch" required error={errors.branch}>
            <select value={form.branch} onChange={set('branch')} className={inputClass}>
              <option value="">Select branch...</option>
              {(lookup?.branches || []).map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </FormField>

          <FormField label="Sales Person" required error={errors.sales_person}>
            <select value={form.sales_person} onChange={set('sales_person')} className={inputClass}>
              <option value="">Select sales person...</option>
              {(lookup?.sales_persons || []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>

          <FormField label="Customer Name">
            <input type="text" value={form.customer_name} onChange={set('customer_name')} placeholder="Customer or company name" className={inputClass} />
          </FormField>

          <FormField label="Customer Type">
            <div className="flex gap-2 flex-wrap">
              {CUSTOMER_TYPES.map((t) => (
                <button
                  key={t} type="button"
                  onClick={() => setForm((f) => ({ ...f, customer_type: f.customer_type === t ? '' : t }))}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    form.customer_type === t
                      ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                      : 'border-border-subtle text-text-muted hover:border-border-active'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Trade Route" required error={errors.direction}>
            <select value={form.direction} onChange={set('direction')} className={inputClass}>
              <option value="">Select trade route...</option>
              {DIRECTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>

          <FormField label="Port of Loading (POL)" required error={errors.pol}>
            <input type="text" value={form.pol} onChange={set('pol')} placeholder="e.g. NHAVA SHEVA" className={inputClass} />
          </FormField>

          <FormField label="Port of Discharge (POD)" required error={errors.pod}>
            <input type="text" value={form.pod} onChange={set('pod')} placeholder="e.g. JEBEL ALI" className={inputClass} />
          </FormField>

          <FormField label="Inquiry Date">
            <input type="date" value={form.inquiry_date} onChange={set('inquiry_date')} className={inputClass} />
          </FormField>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <FormField label="Cargo Description">
            <textarea rows={3} value={form.cargo_description} onChange={set('cargo_description')} placeholder="Describe the cargo..." className={inputClass} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="No. of Packages">
              <input type="number" min="0" value={form.no_of_packages} onChange={set('no_of_packages')} className={inputClass} />
            </FormField>
            <FormField label="Volume (FRT)">
              <input type="number" min="0" step="0.01" value={form.volume_frt} onChange={set('volume_frt')} className={inputClass} />
            </FormField>
          </div>

          <FormField label="Heavy Lifts">
            <input type="text" value={form.heavy_lifts} onChange={set('heavy_lifts')} placeholder="e.g. 1 X 47MT" className={inputClass} />
          </FormField>

          <FormField label="Laycan">
            <input type="text" value={form.laycan} onChange={set('laycan')} placeholder="e.g. Cargo Ready, End Jan, 20-30 Jan" className={inputClass} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Rate/FRT (USD)">
              <input type="number" min="0" step="0.01" value={form.rate_per_frt} onChange={set('rate_per_frt')} className={inputClass} />
            </FormField>
            <FormField label="Target/FRT (USD)">
              <input type="number" min="0" step="0.01" value={form.target_per_frt} onChange={set('target_per_frt')} className={inputClass} />
            </FormField>
          </div>

          {form.rate_per_frt && form.volume_frt && (
            <div className="bg-bg-elevated rounded-lg p-3 text-xs text-text-secondary">
              Total Rate: <span className="text-accent-teal font-semibold">
                ${(parseFloat(form.rate_per_frt) * parseFloat(form.volume_frt)).toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          )}

          <FormField label="Sales Support">
            <select value={form.sales_support} onChange={set('sales_support')} className={inputClass}>
              <option value="">Select sales support...</option>
              {(lookup?.sales_support || []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>

          <FormField label="Status" required>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s} type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    form.status === s
                      ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                      : 'border-border-subtle text-text-muted hover:border-border-active'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </FormField>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.has_photographs} onChange={set('has_photographs')} className="rounded" />
              <span className="text-text-secondary text-sm">Has Photographs</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.has_technical_diagrams} onChange={set('has_technical_diagrams')} className="rounded" />
              <span className="text-text-secondary text-sm">Has Tech Diagrams</span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2 border-t border-border-subtle">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-accent-blue hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 border border-border-subtle text-text-secondary hover:bg-bg-elevated rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
