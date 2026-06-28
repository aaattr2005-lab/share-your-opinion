import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { LayoutDashboard, ClipboardList, BrainCircuit, Download, CheckCircle2, Star, Target, Lightbulb, TrendingUp, AlertCircle, RefreshCcw, MessageSquare } from 'lucide-react';

const supabase = createClient(
  'https://qeqkcvoewqebzqqjmrez.supabase.co',
  'sb_publishable_veEJ6znXaLQgx3MnipR7Gw_ODK46Lmo'
);

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  useEffect(() => { fetchResponses(); }, []);

  const fetchResponses = async () => {
    try {
      const { data } = await supabase.from('responses').select('*');
      if (data) setResponses(data);
    } catch (e) {
      console.error(e);
    }
  };

  const resetAdminVote = () => {
    localStorage.removeItem('voted_status');
    setIsVoted(false);
    setActiveTab('survey');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
      <nav className="border-b border-white/20 bg-white/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">ع</div>
            <h1 className="text-xl font-bold italic">التقييم الرسمي</h1>
          </div>
          <div className="flex bg-slate-200/50 p-1 rounded-2xl gap-1 border border-slate-300/30">
            <button onClick={() => setActiveTab('survey')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'survey' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <ClipboardList size={18}/> <span className="text-sm font-bold hidden md:inline">الاستبيان</span>
            </button>
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <LayoutDashboard size={18}/> <span className="text-sm font-bold hidden md:inline">النتائج</span>
            </button>
            <button onClick={() => setActiveTab('analysis')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${activeTab === 'analysis' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
              <BrainCircuit size={18}/> <span className="text-sm font-bold hidden md:inline">التحليل</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-10 px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'survey' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SurveyView isVoted={isVoted} onFinish={() => {setIsVoted(true); fetchResponses();}} />
            </motion.div>
          )}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DashboardView responses={responses} onReset={resetAdminVote} showAdminBtn={isAdmin} />
            </motion.div>
          )}
          {activeTab === 'analysis' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalysisView responses={responses} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SurveyView({ isVoted, onFinish }: any) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const isFormComplete = () => {
    const allFields = [...categories.flatMap(c => c.fields), "p_desc", "p_strengths", "p_improvements", "p_notes"];
    return allFields.every(f => formData[f] && String(formData[f]).trim() !== "");
  };

  const complete = isFormComplete();

  if (isVoted) return (
    <div className="text-center py-20 bg-white rounded-[2.5rem] shadow-xl border border-white">
      <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <CheckCircle2 size={40} className="text-white" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4">نشكر لك وقتك!</h2>
      <p className="text-slate-500 px-8 text-lg">تم استلام تقييمك بنجاح، مشاركتك تساعد في تطوير الأداء الشخصي والمهني.</p>
    </div>
  );

  const send = async (e: any) => {
    e.preventDefault();
    if (!complete) return;
    setLoading(true);
    const { error } = await supabase.from('responses').insert([formData]);
    if (!error) { localStorage.setItem('voted_status', 'true'); onFinish(); }
    else alert("حدث خطأ في الإرسال.");
    setLoading(false);
  };

  return (
    <form onSubmit={send} className="space-y-10">
      <div className="text-center mb-16 space-y-6">
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">عبداللطيف الشهري</h2>
        <p className="text-indigo-600 font-bold bg-indigo-50 inline-block px-6 py-2 rounded-full text-sm">استبيان مرئيات الأداء والتطوير</p>
        <p className="text-slate-500 text-base max-w-2xl mx-auto leading-relaxed">أنا عبداللطيف الشهري، وقد صممت هذا الموقع بهدف الحصول على آراء صادقة وموضوعية من الأشخاص الذين تعاملوا معي لتعزيز نقاط القوة.</p>
      </div>

      {categories.map((cat, idx) => (
        <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-10 border-b border-slate-50 pb-4">
            <div className="w-2 h-6 bg-indigo-600 rounded-full"></div>
            <h3 className="text-xl font-black text-slate-800">{cat.title}</h3>
          </div>
          <div className="space-y-12">
            {cat.questions.map((q, qIdx) => (
              <div key={qIdx} className="space-y-6">
                <p className="text-slate-700 font-bold text-[17px]">{q}</p>
                <div className="flex justify-between items-center gap-3">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button type="button" key={val} onClick={() => setFormData({...formData, [cat.fields[qIdx]]: val})}
                      className={`flex-1 h-14 rounded-2xl border-2 transition-all font-black text-lg ${formData[cat.fields[qIdx]] === val ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}>
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-indigo-900 p-8 md:p-12 rounded-[3rem] space-y-10 shadow-2xl text-right">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">✍️</div>
          <h3 className="text-2xl font-black text-white text-right">رأيك الشخصي</h3>
        </div>
        {[
          { id: 'p_desc', label: 'كيف تصف شخصية عبداللطيف الشهري بشكل عام؟' },
          { id: 'p_strengths', label: 'ما أبرز نقاط القوة التي تراها فيه؟' },
          { id: 'p_improvements', label: 'ما الجوانب التي يمكنه تطويرها أو تحسينها؟' },
          { id: 'p_notes', label: 'هل لديك أي ملاحظة أو اقتراح إضافي؟' }
        ].map((area) => (
          <div key={area.id} className="space-y-4">
            <label className="text-indigo-100 font-bold text-sm block opacity-90">{area.label}</label>
            <textarea required className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-5 focus:bg-white focus:text-slate-900 outline-none text-white transition-all min-h-[140px] text-base"
              onChange={(e) => setFormData({...formData, [area.id]: e.target.value})} />
          </div>
        ))}
      </div>

      {!complete && (
        <div className="bg-amber-50 p-5 rounded-2xl flex items-center gap-3 text-amber-700 border border-amber-100 shadow-sm">
          <AlertCircle size={22} className="shrink-0" />
          <span className="text-sm font-black w-full text-center">يرجى تقييم كافة المحاور وتعبئة الخانات النصية لتفعيل زر الإرسال.</span>
        </div>
      )}

      <button disabled={!complete || loading} type="submit" className={`w-full py-6 rounded-[2rem] shadow-2xl transition-all duration-500 font-black text-xl flex items-center justify-center gap-4 ${complete && !loading ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-200 text-slate-400'}`}>
        {loading ? 'جاري المعالجة...' : 'اعتماد التقييم النهائي'}
        {complete && !loading && <CheckCircle2 size={24} />}
      </button>
    </form>
  );
}

function DashboardView({ responses, onReset, showAdminBtn }: any) {
  return (
    <div className="text-center py-32 bg-white rounded-[3rem] shadow-sm border border-slate-100">
        <Message size={60} className="mx-auto text-indigo-100 mb-6" />
        <h2 className="text-2xl font-black text-slate-800 mb-4">لوحة النتائج الإحصائية</h2>
        <p className="text-slate-500 mb-10">إجمالي الردود المستلمة: <span className="text-indigo-600 font-black">{responses?.length || 0}</span></p>
        <div className="flex flex-wrap justify-center gap-4 px-6">
            {showAdminBtn && <button onClick={onReset} className="bg-slate-100 text-slate-600 px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all"><RefreshCcw size={18}/> وضع المعاينة</button>}
            <button onClick={() => window.print()} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg"><Download size={18}/> تصدير التقرير</button>
        </div>
    </div>
  );
}

// تعديل بسيط هنا لتجنب خطأ الأيقونة
function Message({ size, className }: any) {
    return <MessageSquare size={size} className={className} />;
}

function AnalysisView({ responses }: any) {
  return (
    <div className="bg-indigo-950 p-16 rounded-[3.5rem] shadow-2xl text-center space-y-8">
      <div className="w-24 h-24 bg-white/10 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
        <BrainCircuit size={48} />
      </div>
      <h2 className="text-3xl font-black text-white">التحليل الذكي للشخصية</h2>
      <p className="text-indigo-200 max-w-md mx-auto text-lg opacity-80">يتم حالياً معالجة {responses?.length || 0} رد لاستخراج أنماط الشخصية.</p>
    </div>
  );
}
