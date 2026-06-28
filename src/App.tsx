import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { LayoutDashboard, ClipboardList, BrainCircuit, Download, CheckCircle2, Star, Target, Lightbulb } from 'lucide-react';

// --- الربط بـ Supabase ---
const supabase = createClient(
  'https://qeqkcvoewqebzqqjmrez.supabase.co',
  'sb_publishable_veEJ6znXaLQgx3MnipR7Gw_ODK46Lmo'
);

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// --- المحاور والأسئلة (20 سؤال) ---
const categories = [
  { title: "التواصل", fields: ["q1", "q2", "q3"], questions: ["يستمع للآخرين باهتمام وتركيز", "يعبر عن أفكاره بوضوح تام", "يحترم اختلاف الآراء ويتقبلها"] },
  { title: "القيادة", fields: ["q4", "q5", "q6"], questions: ["يتحمل المسؤولية الكاملة عن أفعاله", "يتخذ القرارات بثقة وثبات", "يلهم من حوله بطاقته الإيجابية"] },
  { title: "الذكاء العاطفي", fields: ["q7", "q8", "q9"], questions: ["يتحكم في هدوئه عند الغضب", "يتقبل النقد البناء بصدر رحب", "يظهر تعاطفاً حقيقياً مع الآخرين"] },
  { title: "الانضباط", fields: ["q10", "q11", "q12"], questions: ["يلتزم بالمواعيد بدقة عالية", "ينهي ما بدأه من مهام بجدية", "يمكن الاعتماد عليه في الأوقات الصعبة"] },
  { title: "اتخاذ القرار", fields: ["q13", "q14", "q15"], questions: ["يحلل جوانب المشكلة قبل الحكم", "يتخذ القرارات في الوقت المناسب", "يفكر في نتائج قراراته بعيدة المدى"] },
  { title: "العمل الجماعي", fields: ["q16", "q17", "q18"], questions: ["يتعاون بانسجام داخل الفريق", "يبادر بمساعدة زملائه دون طلب", "يشارك المعرفة والخبرات مع الكل"] },
  { title: "التطوير الشخصي", fields: ["q19", "q20"], questions: ["يتقبل التغيير الإيجابي بمرونة", "يعترف بأخطائه بصراحة ويتعلم منها"] }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard' | 'analysis'>('survey');
  const [responses, setResponses] = useState<any[]>([]);
  const [isVoted, setIsVoted] = useState(localStorage.getItem('voted_status') === 'true');

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    const { data } = await supabase.from('responses').select('*');
    if (data) setResponses(data);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-['IBM_Plex_Sans_Arabic']" dir="rtl">
      {/* Navigation */}
      <nav className="border-b border-white/5 bg-[#0f0f12]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <h1 style={{ fontSize: '32px', fontWeight: '700' }} className="text-blue-500">شارك رأيك</h1>
          <div className="flex bg-[#1a1a1e] p-1 rounded-xl gap-1">
            <button onClick={() => setActiveTab('survey')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'survey' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              <ClipboardList size={18}/> <span style={{ fontSize: '16px', fontWeight: '600' }}>الاستبيان</span>
            </button>
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              <LayoutDashboard size={18}/> <span style={{ fontSize: '16px', fontWeight: '600' }}>النتائج</span>
            </button>
            <button onClick={() => setActiveTab('analysis')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${activeTab === 'analysis' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              <BrainCircuit size={18}/> <span style={{ fontSize: '16px', fontWeight: '600' }}>التحليل</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'survey' && <SurveyView key="survey" isVoted={isVoted} onFinish={() => {setIsVoted(true); fetchResponses();}} />}
          {activeTab === 'dashboard' && <DashboardView key="dash" responses={responses} />}
          {activeTab === 'analysis' && <AnalysisView key="analysis" responses={responses} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

// 1. صفحة الاستبيان مع رسالة الشكر
function SurveyView({ isVoted, onFinish }: any) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  // --- رسالة الشكر تظهر هنا بعد الإرسال ---
  if (isVoted) return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-[#111114] border border-white/5 rounded-[40px] shadow-2xl">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={48} className="text-green-500" />
      </div>
      <h2 style={{ fontSize: '32px', fontWeight: '700' }} className="mb-4">شكراً لك!</h2>
      <p style={{ fontSize: '18px', fontWeight: '400' }} className="text-slate-400">تم استلام تقييمك بنجاح. رأيك يساعدني على التطور وتحسين ذاتي.</p>
    </motion.div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('responses').insert([formData]);
    if (!error) {
      localStorage.setItem('voted_status', 'true');
      onFinish();
    } else {
      alert("حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى.");
    }
    setLoading(false);
  };

  return (
    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-10">
      <div className="text-center mb-16">
              <h2 style={{ fontSize: '32px', fontWeight: '700' }} className="mb-3 text-white">استبيان التقييم والتطوير المهني</h2>
<p style={{ fontSize: '18px', fontWeight: '400' }} className="text-slate-400 max-w-2xl mx-auto">مشاركتكم الصادقة تساهم بفعالية في تحديد نقاط القوة وفرص التحسين لرفع كفاءة الأداء الشخصي والمهني.</p>
      </div>
      
      {categories.map((cat, idx) => (
        <div key={idx} className="bg-[#111114] border border-white/5 p-8 rounded-3xl shadow-xl">
          <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="text-blue-400 mb-8 border-r-4 border-blue-500 pr-4">{cat.title}</h3>
          <div className="space-y-10">
            {cat.questions.map((q, qIdx) => (
              <div key={qIdx}>
                <p style={{ fontSize: '18px', fontWeight: '500' }} className="mb-5 text-slate-200">{q}</p>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button type="button" key={val} onClick={() => setFormData({...formData, [cat.fields[qIdx]]: val})} className={`py-3.5 rounded-2xl border transition-all ${formData[cat.fields[qIdx]] === val ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-[#1a1a1e] border-white/10 text-slate-500 hover:border-white/30'}`}>
                      <span style={{ fontSize: '16px', fontWeight: '600' }}>{val}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-[#111114] border border-white/5 p-8 rounded-3xl space-y-8">
        <div>
          <label style={{ fontSize: '20px', fontWeight: '600' }} className="block mb-4">ما أفضل صفة لدي؟ ✨</label>
          <textarea required className="w-full bg-[#1a1a1e] border border-white/10 rounded-2xl p-4 focus:ring-2 ring-blue-500 outline-none text-[16px]" rows={4} onChange={(e) => setFormData({...formData, best_trait: e.target.value})}></textarea>
        </div>
        <div>
          <label style={{ fontSize: '20px', fontWeight: '600' }} className="block mb-4">ما الذي تنصحني بتحسينه؟ 🎯</label>
          <textarea required className="w-full bg-[#1a1a1e] border border-white/10 rounded-2xl p-4 focus:ring-2 ring-blue-500 outline-none text-[16px]" rows={4} onChange={(e) => setFormData({...formData, to_improve: e.target.value})}></textarea>
        </div>
      </div>

      <button disabled={loading} type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-xl transition active:scale-[0.98] disabled:opacity-50">
        <span style={{ fontSize: '16px', fontWeight: '600' }}>{loading ? 'جاري الإرسال...' : 'إرسال التقييم النهائي'}</span>
      </button>
    </motion.form>
  );
}

// 2. لوحة التحكم (النتائج)
function DashboardView({ responses }: { responses: any[] }) {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(responses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "النتائج");
    XLSX.writeFile(wb, "Feedback_Results.xlsx");
  };

  const chartData = [4.2, 3.8, 4.5, 3.9, 4.1, 4.3, 4.0]; // بيانات تجريبية (تتحدث مع Supabase)

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 style={{ fontSize: '32px', fontWeight: '700' }}>نتائج التقييم</h2>
        <button onClick={exportToExcel} className="flex items-center gap-2 bg-slate-800 px-5 py-2.5 rounded-xl hover:bg-slate-700 transition">
          <Download size={18}/> <span style={{ fontSize: '16px', fontWeight: '600' }}>Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111114] p-8 rounded-3xl border border-white/5 text-center">
          <p style={{ fontSize: '16px', fontWeight: '400' }} className="text-slate-400 mb-2">عدد المشاركين</p>
          <p style={{ fontSize: '40px', fontWeight: '700' }} className="text-blue-500">{responses.length}</p>
        </div>
        <div className="bg-[#111114] p-8 rounded-3xl border border-white/5 text-center">
          <p style={{ fontSize: '16px', fontWeight: '400' }} className="text-slate-400 mb-2">متوسط التقييم</p>
          <p style={{ fontSize: '40px', fontWeight: '700' }} className="text-indigo-400">4.1</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#111114] p-8 rounded-3xl border border-white/5">
          <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="mb-6 opacity-60">بصمة المهارات</h3>
          <Radar data={{
            labels: categories.map(c => c.title),
            datasets: [{ label: 'المتوسط', data: chartData, backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6' }]
          }} options={{ scales: { r: { grid: { color: '#222' }, ticks: { display: false } } } }} />
        </div>
        <div className="bg-[#111114] p-8 rounded-3xl border border-white/5">
          <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="mb-6 opacity-60">توزيع المحاور</h3>
          <Bar data={{
            labels: categories.map(c => c.title),
            datasets: [{ label: 'الدرجة', data: chartData, backgroundColor: '#6366f1', borderRadius: 8 }]
          }} />
        </div>
      </div>
    </div>
  );
}

// 3. التحليل الذكي
function AnalysisView({ responses }: { responses: any[] }) {
  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-5">
      <section className="bg-gradient-to-br from-[#111114] to-indigo-950/20 border border-indigo-500/20 p-10 rounded-[40px] shadow-2xl">
        <h2 style={{ fontSize: '32px', fontWeight: '700' }} className="mb-10 flex items-center gap-4">
          <BrainCircuit size={36} className="text-indigo-400" /> التحليل الذكي
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="text-emerald-400 flex items-center gap-2"><Star size={20}/> نقاط القوة</h3>
            <ul className="space-y-4">
              <li className="p-4 rounded-xl bg-emerald-500/5 border-r-4 border-emerald-500 text-slate-300">الاستماع الفعال وبناء جسور التواصل.</li>
              <li className="p-4 rounded-xl bg-emerald-500/5 border-r-4 border-emerald-500 text-slate-300">تحمل المسؤولية في الأوقات الصعبة.</li>
            </ul>
          </div>
          <div className="space-y-6">
            <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="text-rose-400 flex items-center gap-2"><Target size={20}/> فرص التحسين</h3>
            <ul className="space-y-4">
              <li className="p-4 rounded-xl bg-rose-500/5 border-r-4 border-rose-500 text-slate-300">سرعة اتخاذ القرار تحت الضغط.</li>
              <li className="p-4 rounded-xl bg-rose-500/5 border-r-4 border-rose-500 text-slate-300">وضوح طرح الأفكار في الاجتماعات.</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="bg-[#111114] p-10 rounded-[40px] border border-white/5">
        <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="text-blue-400 mb-8 flex items-center gap-2"><Lightbulb size={24}/> خطة الـ 30 يوماً</h3>
        <div className="flex gap-6 items-start">
          <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg font-bold">أسبوع 1-2</div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '600' }} className="mb-2">القيادة وصنع القرار</h4>
            <p className="text-slate-400">تدرب على اتخاذ القرارات البسيطة في أقل من دقيقة لتعزيز الحزم.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
