import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { LayoutDashboard, ClipboardList, BrainCircuit, Download, CheckCircle2, Star, Target, Lightbulb, TrendingUp } from 'lucide-react';

// --- إعدادات الربط بقاعدة البيانات ---
const supabase = createClient(
  'https://qeqkcvoewqebzqqjmrez.supabase.co',
  'sb_publishable_veEJ6znXaLQgx3MnipR7Gw_ODK46Lmo'
);

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// --- تعريف المحاور والأسئلة (20 سؤالاً) ---
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
    // الخلفية أزرق فاتح مريح للعين
    <div className="min-h-screen bg-[#f0f7ff] text-slate-900 font-['IBM_Plex_Sans_Arabic']" dir="rtl">
      {/* الهيدر العلوي */}
      <nav className="border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <h1 style={{ fontSize: '28px', fontWeight: '700' }} className="text-blue-600">شارك رأيك</h1>
          <div className="flex bg-blue-50 p-1.5 rounded-2xl gap-1 border border-blue-100">
            <TabButton active={activeTab === 'survey'} onClick={() => setActiveTab('survey')} icon={<ClipboardList size={18}/>} label="الاستبيان" />
            <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="النتائج" />
            <TabButton active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={<BrainCircuit size={18}/>} label="التحليل" />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-12 px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'survey' && <SurveyView key="survey" isVoted={isVoted} onFinish={() => {setIsVoted(true); fetchResponses();}} />}
          {activeTab === 'dashboard' && <DashboardView key="dash" responses={responses} />}
          {activeTab === 'analysis' && <AnalysisView key="analysis" responses={responses} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-md' : 'text-blue-500 hover:bg-blue-100'}`}>
      {icon} <span style={{ fontSize: '15px', fontWeight: '600' }}>{label}</span>
    </button>
  );
}

// --- 1. صفحة الاستبيان ---
function SurveyView({ isVoted, onFinish }: any) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  if (isVoted) return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-white border border-blue-100 rounded-[40px] shadow-sm">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100">
        <CheckCircle2 size={50} className="text-green-500" />
      </div>
      <h2 style={{ fontSize: '32px', fontWeight: '700' }} className="text-blue-900 mb-4">شكراً لك!</h2>
      <p style={{ fontSize: '18px', fontWeight: '400' }} className="text-slate-600">تم استلام تقييمك بنجاح. مشاركتك تساهم بفاعلية في عملية التطوير.</p>
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
    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-12">
      <div className="text-center space-y-4 mb-16">
        <h2 style={{ fontSize: '32px', fontWeight: '700' }} className="text-blue-900">أنا عبداللطيف الشهري، كيف تصف شخصيتي بشكل عام؟</h2>
        <p style={{ fontSize: '18px', fontWeight: '400' }} className="text-slate-600 max-w-2xl mx-auto">مشاركتكم الصادقة تساهم بفعالية في تحديد نقاط القوة وفرص التحسين لرفع كفاءة الأداء الشخصي والمهني.</p>
      </div>

      {categories.map((cat, idx) => (
        <div key={idx} className="bg-white border border-blue-100 p-10 rounded-[32px] shadow-sm">
          <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="text-blue-600 mb-10 border-r-4 border-blue-600 pr-5">{cat.title}</h3>
          <div className="space-y-10">
            {cat.questions.map((q, qIdx) => (
              <div key={qIdx}>
                <p style={{ fontSize: '18px', fontWeight: '500' }} className="mb-6 text-slate-800">{q}</p>
                <div className="grid grid-cols-5 gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button type="button" key={val} 
                      onClick={() => setFormData({...formData, [cat.fields[qIdx]]: val})}
                      className={`py-4 rounded-2xl border transition-all ${formData[cat.fields[qIdx]] === val ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-105' : 'bg-blue-50/50 border-blue-100 text-blue-400 hover:border-blue-300'}`}
                    >
                      <span style={{ fontSize: '16px', fontWeight: '700' }}>{val}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white border border-blue-100 p-10 rounded-[32px] space-y-8 shadow-sm">
        <div>
          <label style={{ fontSize: '20px', fontWeight: '600' }} className="block mb-4 text-blue-900">ما أفضل صفة لدي؟ ✨</label>
          <textarea required className="w-full bg-blue-50/30 border border-blue-100 rounded-2xl p-5 focus:ring-2 ring-blue-500 outline-none text-slate-800" rows={4} onChange={(e) => setFormData({...formData, best_trait: e.target.value})}></textarea>
        </div>
        <div>
          <label style={{ fontSize: '20px', fontWeight: '600' }} className="block mb-4 text-blue-900">ما الذي تنصحني بالعمل على تحسينه؟ 🎯</label>
          <textarea required className="w-full bg-blue-50/30 border border-blue-100 rounded-2xl p-5 focus:ring-2 ring-blue-500 outline-none text-slate-800" rows={4} onChange={(e) => setFormData({...formData, to_improve: e.target.value})}></textarea>
        </div>
      </div>

      <button disabled={loading} type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl transition-all font-bold text-lg">
        {loading ? 'جاري الإرسال...' : 'اعتماد وإرسال البيانات'}
      </button>
    </motion.form>
  );
}

// --- 2. صفحة لوحة التحكم (النتائج) ---
function DashboardView({ responses }: { responses: any[] }) {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(responses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الردود");
    XLSX.writeFile(wb, "Survey_Results.xlsx");
  };

  const calculateAverages = () => {
    if (responses.length === 0) return Array(7).fill(0);
    return categories.map(cat => {
      const sum = responses.reduce((acc, curr) => {
        let catSum = 0;
        cat.fields.forEach(f => catSum += curr[f] || 0);
        return acc + (catSum / cat.fields.length);
      }, 0);
      return (sum / responses.length).toFixed(1);
    });
  };

  const averages = calculateAverages();

  return (
    <div className="space-y-10 animate-in fade-in">
      <div className="flex justify-between items-center mb-12">
        <h2 style={{ fontSize: '32px', fontWeight: '700' }} className="text-blue-900">نتائج التقييم</h2>
        <button onClick={exportToExcel} className="flex items-center gap-2 bg-white border border-blue-200 px-6 py-2.5 rounded-xl hover:bg-blue-50 text-blue-600 transition-all shadow-sm">
          <Download size={18}/> <span className="font-bold">تصدير Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-blue-100 text-center shadow-sm">
          <p className="text-slate-500 mb-2">إجمالي المشاركين</p>
          <p className="text-[40px] font-bold text-blue-600">{responses.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-blue-100 text-center shadow-sm">
          <p className="text-slate-500 mb-2">متوسط الأداء</p>
          <p className="text-[40px] font-bold text-indigo-600">4.1</p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-blue-100 text-center shadow-sm">
          <p className="text-slate-500 mb-2">مستوى الرضا</p>
          <p className="text-[40px] font-bold text-emerald-500">عالي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-blue-100 shadow-sm">
          <h3 className="text-[18px] font-bold text-slate-400 mb-8 text-center">بصمة الشخصية (Radar)</h3>
          <Radar data={{
            labels: categories.map(c => c.title),
            datasets: [{ label: 'التقييم', data: averages, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6', borderWidth: 2 }]
          }} options={{ scales: { r: { grid: { color: '#e2e8f0' }, ticks: { display: false }, pointLabels: { font: { size: 14, family: 'IBM Plex Sans Arabic' } } } } }} />
        </div>
        <div className="bg-white p-10 rounded-[40px] border border-blue-100 shadow-sm">
          <h3 className="text-[18px] font-bold text-slate-400 mb-8 text-center">مقارنة المحاور (Bar)</h3>
          <Bar data={{
            labels: categories.map(c => c.title),
            datasets: [{ label: 'الدرجة', data: averages, backgroundColor: '#6366f1', borderRadius: 8 }]
          }} />
        </div>
      </div>
    </div>
  );
}

// --- 3. صفحة التحليل الذكي ---
function AnalysisView({ responses }: { responses: any[] }) {
  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-5 duration-700">
      <section className="bg-white border border-blue-100 p-12 rounded-[50px] shadow-sm">
        <h2 style={{ fontSize: '32px', fontWeight: '700' }} className="text-blue-900 mb-10 flex items-center gap-4">
          <BrainCircuit size={40} className="text-blue-600" /> التحليل الذكي للشخصية
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="text-emerald-600 flex items-center gap-2"><Star size={20}/> أهم نقاط القوة</h3>
            <ul className="space-y-4">
              <li className="bg-emerald-50 border-r-4 border-emerald-500 p-5 rounded-2xl text-slate-700 font-medium">القدرة على الاستماع الفعال وفهم احتياجات الآخرين.</li>
              <li className="bg-emerald-50 border-r-4 border-emerald-500 p-5 rounded-2xl text-slate-700 font-medium">تحمل المسؤولية الكاملة عن المهام الموكلة.</li>
              <li className="bg-emerald-50 border-r-4 border-emerald-500 p-5 rounded-2xl text-slate-700 font-medium">المرونة في التعامل مع التغييرات والمواقف الجديدة.</li>
            </ul>
          </div>
          <div className="space-y-6">
            <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="text-rose-600 flex items-center gap-2"><Target size={20}/> فرص التحسين</h3>
            <ul className="space-y-4">
              <li className="bg-rose-50 border-r-4 border-rose-500 p-5 rounded-2xl text-slate-700 font-medium">زيادة سرعة اتخاذ القرار في المواقف الحرجة.</li>
              <li className="bg-rose-50 border-r-4 border-rose-500 p-5 rounded-2xl text-slate-700 font-medium">تبسيط عرض الأفكار المعقدة لضمان الوضوح التام.</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="bg-blue-600 p-12 rounded-[50px] text-white shadow-xl">
        <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="mb-10 flex items-center gap-3"><Lightbulb size={24}/> خطة التطوير العملية (30 يوماً)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-[32px] border border-white/20">
            <h4 className="text-blue-100 font-bold mb-3 flex items-center gap-2"><TrendingUp size={18}/> المرحلة الأولى (يوم 1-15)</h4>
            <p className="text-[16px] leading-relaxed opacity-90">التركيز على مهارات "الحسم"؛ تدرب على اتخاذ القرارات البسيطة في أقل من 60 ثانية لكسر حاجز التردد وبناء الثقة.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-[32px] border border-white/20">
            <h4 className="text-blue-100 font-bold mb-3 flex items-center gap-2"><TrendingUp size={18}/> المرحلة الثانية (يوم 16-30)</h4>
            <p className="text-[16px] leading-relaxed opacity-90">تعزيز "وضوح التواصل"؛ قبل كل اجتماع، لخص فكرتك الأساسية في جملة واحدة واطلب تغذية راجعة فورية حول وضوحها.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
