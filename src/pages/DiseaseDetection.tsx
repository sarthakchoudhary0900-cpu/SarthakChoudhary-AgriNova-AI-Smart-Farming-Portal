import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine, Upload, Loader2, Leaf, FlaskConical,
  Shield, MapPin, AlertTriangle, Save, Check, X, Activity, Sprout,
} from 'lucide-react';
import { getDiseasesForCropResult } from '@/services/diseaseApi';
import { cropNames } from '@/services/cropAdvisor';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { DiseaseResult } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';

export function DiseaseDetection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [allDiseases, setAllDiseases] = useState<DiseaseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('');

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) { toast('Please upload an image file.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setResult(null);
    setAllDiseases([]);
    setSaved(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!preview) return;
    if (!selectedCrop) { toast('Please select a crop type first.', 'error'); return; }
    setLoading(true);
    setSaved(false);
    await new Promise(r => setTimeout(r, 1500));
    const diseases = getDiseasesForCropResult(selectedCrop);
    setAllDiseases(diseases);
    setResult(diseases[0] || null);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user || !result) return;
    const { error } = await supabase.from('disease_scans').insert({ image_url: preview, result: { ...result, crop: selectedCrop } });
    if (error) { toast('Failed to save scan.', 'error'); }
    else { toast('Scan saved to your profile!', 'success'); setSaved(true); }
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setAllDiseases([]);
    setSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-forest-800 dark:text-brand-50">Plant Disease Detection</h1>
        <p className="text-forest-500 dark:text-brand-200/60 mt-2">Upload a photo of your crop and select the crop type to get disease diagnosis from our agricultural knowledge base.</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload + Crop Selection */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <GlassCard className="h-full">
            <h3 className="font-semibold text-forest-800 dark:text-brand-50 mb-5">Upload Crop Image & Select Crop</h3>

            {/* Crop selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-forest-700 dark:text-brand-100 mb-1.5">Select Crop Type</label>
              <div className="relative">
                <Sprout size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-forest-400 pointer-events-none" />
                <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} className="glass-input w-full pl-11 appearance-none">
                  <option value="">Select crop...</option>
                  {cropNames.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />

            {!preview ? (
              <div onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="border-2 border-dashed border-brand-300 dark:border-brand-400/30 rounded-2xl p-10 text-center cursor-pointer hover:bg-brand-50 dark:hover:bg-forest-800/40 transition min-h-[250px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-4"><Upload className="text-brand-500" size={32} /></div>
                <p className="text-forest-700 dark:text-brand-100 font-medium">Click to upload or drag & drop</p>
                <p className="text-sm text-forest-400 mt-1">PNG, JPG up to 10MB</p>
              </div>
            ) : (
              <div>
                <div className="relative rounded-2xl overflow-hidden mb-4">
                  <img src={preview} alt="Crop preview" className="w-full h-64 object-cover" />
                  <button onClick={handleReset} className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition"><X size={16} /></button>
                </div>
                <button onClick={handleAnalyze} disabled={loading || !selectedCrop} className="btn-primary w-full disabled:opacity-60">
                  {loading ? <><Loader2 className="animate-spin" size={18} /> Analyzing...</> : <><ScanLine size={18} /> Detect Disease</>}
                </button>
                {!selectedCrop && <p className="text-xs text-amber-600 mt-2 text-center">Please select a crop type above to enable analysis.</p>}
              </div>
            )}

            <div className="mt-5 p-4 rounded-xl bg-brand-50 dark:bg-forest-800/40">
              <p className="text-xs text-forest-500 dark:text-brand-200/60 leading-relaxed">
                <strong className="text-forest-700 dark:text-brand-100">Note:</strong> AI image-based diagnosis requires an AI API integration. Currently, we provide disease information from our agricultural knowledge base based on the selected crop type. Each disease includes symptoms, organic and chemical treatments, prevention tips, and government helpline numbers.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Result */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlassCard className="h-full flex flex-col items-center justify-center min-h-[400px]">
                  <div className="relative">
                    <ScanLine className="animate-pulse text-brand-500" size={48} />
                    <div className="absolute inset-0 animate-ping"><ScanLine className="text-brand-300" size={48} /></div>
                  </div>
                  <p className="mt-6 text-forest-600 dark:text-brand-200 font-medium">Checking disease database...</p>
                  <p className="text-sm text-forest-400 mt-1">Matching symptoms for {selectedCrop}</p>
                </GlassCard>
              </motion.div>
            ) : result ? (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <GlassCard className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${result.disease.includes('unavailable') || result.disease.includes('No disease') ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                        <span className="text-xs font-medium text-forest-500 dark:text-brand-200/60">Detection Result — {selectedCrop}</span>
                      </div>
                      <h3 className="text-xl font-bold font-display text-forest-800 dark:text-brand-50">{result.disease}</h3>
                      {result.confidence > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Activity size={16} className="text-brand-600 dark:text-brand-300" />
                          <span className="text-sm text-forest-600 dark:text-brand-200">Knowledge Base Match: <strong>{result.confidence}%</strong></span>
                        </div>
                      )}
                    </div>
                    {user && result.confidence > 0 && (
                      <button onClick={handleSave} disabled={saved} className={`btn-ghost !py-2 !px-4 text-sm ${saved ? '!text-brand-600' : ''}`}>{saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> Save</>}</button>
                    )}
                  </div>

                  {result.confidence > 0 && (
                    <div className="w-full h-2 rounded-full bg-forest-100 dark:bg-forest-800 mb-5 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="h-full rounded-full bg-gradient-to-r from-brand-500 to-forest-500" />
                    </div>
                  )}

                  <div className="space-y-3">
                    {[
                      { icon: AlertTriangle, label: 'Symptoms', value: result.symptoms, color: 'text-amber-500' },
                      { icon: Leaf, label: 'Treatment', value: result.treatment, color: 'text-brand-500' },
                      { icon: Leaf, label: 'Organic Solution', value: result.organicSolution, color: 'text-brand-600' },
                      { icon: FlaskConical, label: 'Chemical Solution', value: result.chemicalSolution, color: 'text-blue-500' },
                      { icon: Shield, label: 'Prevention', value: result.prevention, color: 'text-teal-500' },
                      { icon: MapPin, label: 'Nearby Agriculture Office & Helpline', value: result.nearbyOffice, color: 'text-red-500' },
                    ].map((item) => (
                      <motion.div key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40">
                        <div className="flex items-center gap-2 mb-1.5"><item.icon size={16} className={item.color} /><span className="text-sm font-semibold text-forest-700 dark:text-brand-100">{item.label}</span></div>
                        <p className="text-sm text-forest-600 dark:text-brand-200/70 leading-relaxed pl-6 whitespace-pre-line">{item.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Other diseases for this crop */}
                  {allDiseases.length > 1 && (
                    <div className="mt-5 pt-4 border-t border-forest-200/40 dark:border-brand-400/10">
                      <h4 className="text-sm font-semibold text-forest-700 dark:text-brand-100 mb-3">Other Common Diseases for {selectedCrop}</h4>
                      <div className="space-y-2">
                        {allDiseases.slice(1).map((d, i) => (
                          <button key={i} onClick={() => setResult(d)} className="w-full flex items-center justify-between p-3 rounded-xl bg-brand-50 dark:bg-forest-800/40 hover:bg-brand-100 dark:hover:bg-forest-800/60 transition text-left">
                            <span className="text-sm font-medium text-forest-700 dark:text-brand-100">{d.disease}</span>
                            <span className="text-xs text-forest-400">{d.confidence}% match</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlassCard className="h-full flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-20 h-20 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mb-4"><ScanLine className="text-brand-500" size={40} /></div>
                  <h3 className="text-xl font-semibold text-forest-700 dark:text-brand-100">Disease Knowledge Base</h3>
                  <p className="text-forest-500 dark:text-brand-200/60 mt-2 max-w-sm">Upload a photo of your crop, select the crop type, and get detailed disease information including symptoms, organic and chemical treatments, prevention tips, and government helpline numbers.</p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
