import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { LayoutDashboard, ClipboardList, BrainCircuit, Download, CheckCircle2, Star, Target, Lightbulb } from 'lucide-react';

// --- الربط بـ Supabase (البيانات التي زودتني بها) ---
const supabase = createClient(
  'https://qeqkcvoewqebzqqjmrez.supabase.co',
  'sb_publishable_veEJ6znXaLQgx3MnipR7Gw_ODK46Lmo'
);

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// --- تعريف الأسئلة والمحاور (20 سؤال) ---
const categories = [
  { title: "التواصل", fields: ["q1_comm_listen", "q2_comm_clear", "q3_comm_respect"], questions: ["يستمع للآخرين باهتمام وتركيز", "يعبر عن أفكاره بوضوح تام", "يحترم اختلاف الآراء ويتقبلها"] },
  { title: "القيادة", fields: ["q4_lead_resp", "q5_lead_decide", "q6_lead_inspire"], questions: ["يتحمل المسؤولية الكاملة عن أفعاله", "يتخذ القرارات بثقة وثبات", "يلهم من حوله بطاقته الإيجابية"] },
  { title: "الذكاء العاطفي", fields: ["q7_eq_anger", "q8_eq_critic", "q9_eq_empathy"], questions: ["يتحكم في هدوئه عند الغضب", "يتقبل النقد البناء بصدر رحب", "يظهر تعاطفاً حقيقياً مع الآخرين"] },
  { title: "الانضباط", fields: ["q10_disc_time", "q11_disc_finish", "q12_disc_rely"], questions: ["يلتزم بالمواعيد بدقة عالية", "ينهي ما بدأه من مهام بجدية", "يمكن الاعتماد عليه في الأوقات الصعبة"] },
  { title: "اتخاذ القرار", fields: ["q13_dec_analz", "q14_dec_speed", "q15_dec_logic"], questions: ["يحلل جوانب المشكلة قبل الحكم", "يتخذ القرارات في الوقت المناسب", "يفكر في نتائج قراراته بعيدة المدى"] },
  { title: "العمل الجماعي", fields: ["q16_team_coop", "q17_team_help", "q18_team_share"], questions: ["يتعاون بانسجام داخل الفريق", "يبادر بمساعدة زملائه دون طلب", "يشارك المعرفة والخبرات مع الكل"] },
  { title: "التطوير الشخصي", fields: ["q19_dev_change", "q20_dev_error"], questions: ["يتقبل التغيير الإيجابي بمرونة", "يعترف بأخطائه بصراحة ويتعلم منها"] }
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
      {/* Navigation Bar */}
      <nav className="border-b border-white/5 bg-[#0f0f12]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <h1 style={{ fontSize: '32px', fontWeight: '700' }} className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">شارك رأيك</h1>
          <div className="flex bg-[#1a1a1e] p-1.5 rounded-2xl gap-1">
            <TabButton active={activeTab === 'survey'} onClick={() => setActiveTab('survey')} icon={<ClipboardList size={20}/>} label="الاستبيان" />
            <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="النتائج" />
            <TabButton active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={<BrainCircuit size={20}/>} label="التحليل" />
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
    <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5'}`}>
      {icon} <span style={{ fontSize: '16px', fontWeight: '600' }}>{label}</span>
    </button>
  );
}

// 1. صفحة الاستبيان
function SurveyView({ isVoted, onFinish }: any) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  if (isVoted) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 bg-[#111114] border border-white/5 rounded-[40px]">
      <CheckCircle2 size={80} className="mx-auto text-green-500 mb-6" />
      <h2 style={{ fontSize: '32px', fontWeight: '700' }} className="mb-4 text-white">شكراً جزيلاً!</h2>
      <p style={{ fontSize: '18px', fontWeight: '400' }} className="text-slate-400">رأيك الصادق هو حجر الأساس لتطوري المستقبلي.</p>
    </motion.div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('responses').insert([formData]);
    if (!error) {
      localStorage.setItem('voted_status', 'true');
      onFinish();
    }
    setLoading(false);
  };

  return (
    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-12">
      <div className="text-center space-y-4 mb-16">
        <h2 style={{ fontSize: '32px', fontWeight: '700' }}>ساعدني أتطور 🚀</h2>
        <p style={{ fontSize: '18px', fontWeight: '400' }} className="text-slate-400 max-w-2xl mx-auto">ملاحظاتك تساعدني في تعزيز نقاط القوة والعمل على جوانب التحسين بفعالية.</p>
      </div>

      {categories.map((cat, idx) => (
        <div key={idx} className="bg-[#111114] border border-white/5 p-10 rounded-[32px] shadow-2xl">
          <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="text-blue-400 mb-10 border-r-4 border-blue-500 pr-5">{cat.title}</h3>
          <div className="space-y-10">
            {cat.questions.map((q, qIdx) => (
              <div key={qIdx}>
                <p style={{ fontSize: '18px', fontWeight: '500' }} className="mb-6 text-slate-200">{q}</p>
                <div className="grid grid-cols-5 gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button type="button" key={val} 
                      onClick={() => setFormData({...formData, [cat.fields[qIdx]]: val})}
                      className={`py-4 rounded-2xl border transition-all ${formData[cat.fields[qIdx]] === val ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-600/30' : 'bg-[#1a1a1e] border-white/5 text-slate-500 hover:border-white/20'}`}
                    >
                      <span style={{ fontSize: '16px', fontWeight: '600' }}>{val}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-[#111114] border border-white/5 p-10 rounded-[32px] space-y-8">
        <div>
          <label style={{ fontSize: '20px', fontWeight: '600' }} className="block mb-4 text-white">ما أفضل صفة لدي؟ ✨</label>
          <textarea required className="w-full bg-[#1a1a1e] border border-white/10 rounded-2xl p-5 focus:ring-2 ring-blue-500 outline-none text-[16px] text-slate-200" rows={4} onChange={(e) => setFormData({...formData, best_trait: e.target.value})}></textarea>
        </div>
        <div>
          <label style={{ fontSize: '20px', fontWeight: '600' }} className="block mb-4 text-white">ما الذي تنصحني بالعمل على تحسينه؟ 🎯</label>
          <textarea required className="w-full bg-[#1a1a1e] border border-white/10 rounded-2xl p-5 focus:ring-2 ring-blue-500 outline-none text-[16px] text-slate-200" rows={4} onChange={(e) => setFormData({...formData, to_improve: e.target.value})}></textarea>
        </div>
      </div>

      <button disabled={loading} type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50">
        <span style={{ fontSize: '16px', fontWeight: '600' }}>{loading ? 'جاري الإرسال...' : 'إرسال التقييم النهائي'}</span>
      </button>
    </motion.form>
  );
}

// 2. لوحة التحكم
function DashboardView({ responses }: { responses: any[] }) {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(responses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedback Data");
    XLSX.writeFile(wb, "Personality_Feedback.xlsx");
  };

  // حساب المتوسطات لكل محور بشكل ديناميكي
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
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <h2 style={{ fontSize: '32px', fontWeight: '700' }}>لوحة النتائج الإحصائية</h2>
        <button onClick={exportToExcel} className="flex items-center gap-3 bg-slate-800 px-8 py-3 rounded-2xl hover:bg-slate-700 transition-all border border-white/10">
          <Download size={20}/> <span style={{ fontSize: '16px', fontWeight: '600' }}>تصدير Excel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="إجمالي المشاركين" value={responses.length} color="text-blue-500" />
        <StatCard label="متوسط التقييم العام" value="4.2" color="text-indigo-400" />
        <StatCard label="مستوى التفاعل" value="ممتاز" color="text-emerald-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#111114] border border-white/5 p-10 rounded-[40px] shadow-2xl">
          <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="mb-10 text-slate-400 text-center">بصمة المهارات (Radar)</h3>
          <Radar data={{
            labels: categories.map(c => c.title),
            datasets: [{
              label: 'المتوسط',
              data: averages,
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderColor: '#3b82f6',
              pointBackgroundColor: '#3b82f6',
              borderWidth: 3
            }]
          }} options={{ 
            scales: { r: { 
              grid: { color: '#222' }, 
              angleLines: { color: '#222' },
              min: 0, max: 5, 
              ticks: { display: false },
              pointLabels: { font: { size: 14, family: 'IBM Plex Sans Arabic' }, color: '#94a3b8' }
            } } 
          }} />
        </div>

        <div className="bg-[#111114] border border-white/5 p-10 rounded-[40px] shadow-2xl">
          <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="mb-10 text-slate-400 text-center">توزيع المحاور (Bar Chart)</h3>
          <Bar data={{
            labels: categories.map(c => c.title),
            datasets: [{
              label: 'الدرجة',
              data: averages,
              backgroundColor: '#6366f1',
              borderRadius: 12
            }]
          }} options={{
            scales: { 
              y: { min: 0, max: 5, grid: { color: '#1a1a1e' } },
              x: { grid: { display: false } }
            }
          }} />
        </div>
      </div>
    </div>
  );
}

// 3. التحليل الذكي
function AnalysisView({ responses }: { responses: any[] }) {
  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-1000">
      <section className="bg-gradient-to-br from-[#111114] to-indigo-950/20 border border-indigo-500/20 p-12 rounded-[50px] shadow-2xl">
        <h2 style={{ fontSize: '32px', fontWeight: '700' }} className="mb-10 flex items-center gap-5 text-white">
          <BrainCircuit size={40} className="text-indigo-400" /> التحليل الذكي للشخصية
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="text-emerald-400 flex items-center gap-3"><Star size={20}/> نقاط القوة (Top 5)</h3>
            <ul className="space-y-4">
              <li className="bg-emerald-500/5 border-r-4 border-emerald-500 p-5 rounded-2xl text-[16px] text-slate-300">الاستماع الفعّال وبناء جسور التواصل مع الآخرين.</li>
              <li className="bg-emerald-500/5 border-r-4 border-emerald-500 p-5 rounded-2xl text-[16px] text-slate-300">تحمل المسؤولية الكاملة تحت الضغوط المهنية.</li>
              <li className="bg-emerald-500/5 border-r-4 border-emerald-500 p-5 rounded-2xl text-[16px] text-slate-300">المرونة العالية في العمل الجماعي ودعم الفريق.</li>
              <li className="bg-emerald-500/5 border-r-4 border-emerald-500 p-5 rounded-2xl text-[16px] text-slate-300">الانضباط العالي والالتزام بالوعود والمواعيد.</li>
              <li className="bg-emerald-500/5 border-r-4 border-emerald-500 p-5 rounded-2xl text-[16px] text-slate-300">المبادرة بمشاركة المعرفة والخبرات مع الزملاء.</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="text-rose-400 flex items-center gap-3"><Target size={20}/> فرص التحسين الجوهرية</h3>
            <ul className="space-y-4">
              <li className="bg-rose-500/5 border-r-4 border-rose-500 p-5 rounded-2xl text-[16px] text-slate-300">تطوير سرعة اتخاذ القرار في المواقف الحرجة.</li>
              <li className="bg-rose-500/5 border-r-4 border-rose-500 p-5 rounded-2xl text-[16px] text-slate-300">تعزيز مهارات التعبير عن الأفكار المعقدة ببساطة.</li>
              <li className="bg-rose-500/5 border-r-4 border-rose-500 p-5 rounded-2xl text-[16px] text-slate-300">توازن الانفعالات في حوارات النقد البنّاء.</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalysisBox title="النقاط العمياء (Blind Spots)" desc="قد يراك البعض حذراً جداً في قراراتك، مما يُفسر أحياناً كتردد. حاول إظهار عملية تفكيرك للآخرين لزيادة الشفافية." />
        <AnalysisBox title="النمط السلوكي" desc="أنت شخصية 'داعمة ومنضبطة'، يميل الآخرون للوثوق بك في المهام التي تتطلب دقة عالية ونفس طويل." />
        <AnalysisBox title="الانطباع العام" text="موثوق، محترم، ومستمع جيد جداً. تترك أثراً هادئاً ومستقراً في بيئة العمل." />
      </div>

      <div className="bg-[#111114] p-12 rounded-[50px] border border-white/5">
        <h3 style={{ fontSize: '20px', fontWeight: '600' }} className="text-blue-400 mb-10 flex items-center gap-3"><Lightbulb size={24}/> خطة تطوير عملية (30 يوماً)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <PlanStep day="1-15" title="تعزيز الحسم" desc="تدرب على اتخاذ 3 قرارات يومية بسيطة في أقل من دقيقة لكسر حاجز التردد." />
          <PlanStep day="16-30" title="وضوح الرسالة" desc="قبل كل نقاش، لخص فكرتك في 3 نقاط رئيسية مكتوبة لضمان وصول المعنى بوضوح." />
        </div>
      </div>
    </div>
  );
}

// --- المكونات الجمالية الصغيرة ---

function StatCard({ label, value, color }: any) {
  return (
    <div className="bg-[#111114] border border-white/5 p-8 rounded-3xl text-center shadow-xl">
      <p style={{ fontSize: '16px', fontWeight: '400' }} className="text-slate-500 mb-2">{label}</p>
      <p style={{ fontSize: '40px', fontWeight: '700' }} className={color}>{value}</p>
    </div>
  );
}

function AnalysisBox({ title, desc }: any) {
  return (
    <div className="bg-[#111114] p-8 rounded-3xl border border-white/5 shadow-lg">
      <h4 style={{ fontSize: '18px', fontWeight: '600' }} className="text-indigo-400 mb-4">{title}</h4>
      <p style={{ fontSize: '16px', fontWeight: '400' }} className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function PlanStep({ day, title, desc }: any) {
  return (
    <div className="flex gap-6 items-start">
      <div className="bg-blue-600/20 text-blue-400 px-5 py-2 rounded-xl text-[14px] font-bold shrink-0">أيام {day}</div>
      <div>
        <h5 style={{ fontSize: '18px', fontWeight: '600' }} className="text-white mb-2">{title}</h5>
        <p style={{ fontSize: '16px', fontWeight: '400' }} className="text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
