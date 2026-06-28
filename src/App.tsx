import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { LayoutDashboard, ClipboardList, BrainCircuit, Download, CheckCircle2, Star, Target, Lightbulb, TrendingUp, AlertCircle, RefreshCcw, PenLine, MessageSquareQuote } from 'lucide-react';

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
    const { data } = await supabase.from('responses').select('*');
    if (data) setResponses(data);
  };

  const resetAdminVote = () => {
    localStorage.removeItem('voted_status');
    setIsVoted(false);
    setActiveTab('survey');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['IBM_Plex_Sans_Arabic']" dir="rtl">
      {/* Navbar مع تأثير الزجاج */}
      <nav className="border-b border-white/20 bg-white/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">ع</div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">شاركني رأيك</h1>
          </div>
          <div className="flex bg-slate-200/50 p-1 rounded-2xl gap-1 border border-slate-300/30">
            <TabButton active={activeTab === 'survey'} onClick={() => setActiveTab('survey')} icon={<ClipboardList size={18}/>} label="الاستبيان" />
            <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18}/>} label="النتائج" />
            <TabButton active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={<BrainCircuit size={18}/>} label="التحليل" />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-10 px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'survey' && <SurveyView key="survey" isVoted={isVoted} onFinish={() => {setIsVoted(true); fetchResponses();}} />}
          {activeTab === 'dashboard' && <DashboardView key="dash" responses={responses} onReset={resetAdminVote} showAdminBtn={isAdmin} />}
          {activeTab === 'analysis' && <AnalysisView key="analysis" responses={responses} />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${active ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-blue-600'}`}>
      {icon} <span className="text-sm font-bold">{label}</span>
    </button>
  );
}

function SurveyView({ isVoted, onFinish }: any) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const isFormComplete = () => {
    const allQuestionFields = categories.flatMap(cat => cat.fields);
    const requiredFields = [...allQuestionFields, "p_desc", "p_strengths", "p_improvements", "p_notes"];
    return requiredFields.every(field => formData[field] && String(formData[field]).trim() !== "");
  };

  const isComplete = isFormComplete();

  if (isVoted) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-white">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
        <CheckCircle2 size={40} className="text-white" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-4">شكراً لك!</h2>
      <p className="text-slate-500 px-6">تم استلام تقييمك بنجاح. مشاركتك تساهم بفاعلية في عملية التطوير.</p>
    </motion.div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) return;
    setLoading(true);
    const { error } = await supabase.from('responses').insert([formData]);
    if (!error) { localStorage.setItem('voted_status', 'true'); onFinish(); }
    else { alert("حدث خطأ أثناء الإرسال."); }
    setLoading(false);
  };

  return (
    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-8">
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">أنا عبداللطيف الشهري، وقد صممت هذا الموقع بهدف الحصول على آراء صادقة وموضوعية</h2>
        <p className="text-slate-500 text-sm md:text-base">مشاركتكم الصادقة تساهم بفاعلية في تحديد نقاط القوة وفرص التحسين.</p>
      </div>

      {categories.map((cat, idx) => (
        <motion.div whileHover={{ y: -5 }} key={idx} className="bg-white p-6 md:p-8 rounded-[1.5rem] shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-slate-800">{cat.title}</h3>
          </div>
          <div className="space-y-10">
            {cat.questions.map((q, qIdx) => (
              <div key={qIdx} className="space-y-4">
                <p className="text-slate-700 font-medium text-[15px] leading-relaxed">{q}</p>
                <div className="flex justify-between items-center gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button type="button" key={val} 
                      onClick={() => setFormData({...formData, [cat.fields[qIdx]]: val})}
                      className={`flex-1 h-12 rounded-xl border transition-all duration-300 font-bold text-sm md:text-base flex items-center justify-center
                        ${formData[cat.fields[qIdx]] === val 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* قسم رأيك الشخصي - مظهر جديد */}
      <div className="bg-blue-50/50 p-6 md:p-8 rounded-[2rem] border border-blue-100 space-y-8 relative overflow-hidden shadow-inner">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">✍️</div>
          <h3 className="text-xl font-bold text-blue-900 uppercase tracking-wide">رأيك الشخصي</h3>
        </div>

        {[
          { id: 'p_desc', label: 'كيف تصف شخصية عبداللطيف الشهري بشكل عام؟' },
          { id: 'p_strengths', label: 'ما أبرز نقاط القوة التي تراها فيه؟' },
          { id: 'p_improvements', label: 'ما الجوانب التي يمكنه تطويرها أو تحسينها؟' },
          { id: 'p_notes', label: 'هل لديك أي ملاحظة أو اقتراح إضافي؟' }
        ].map((area) => (
          <div key={area.id} className="space-y-3">
            <label className="text-slate-700 font-bold text-sm block pr-2">{area.label}</label>
            <textarea 
              required 
              placeholder="اكتب إجابتك هنا..."
              className="w-full bg-white border border-slate-200 rounded-[1.25rem] p-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-800 transition-all min-h-[120px] shadow-sm text-sm"
              onChange={(e) => setFormData({...formData, [area.id]: e.target.value})}
            />
          </div>
        ))}
      </div>

      {!isComplete && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-4 rounded-2xl flex items-center gap-3 text-rose-500 border border-rose-100 shadow-sm">
          <AlertCircle size={20} className="shrink-0" />
          <span className="text-xs md:text-sm font-bold">متبقي بعض الأسئلة.. يرجى إكمال جميع الخانات لتفعيل الإرسال.</span>
        </motion.div>
      )}

      <button 
        disabled={!isComplete || loading} 
        type="submit" 
        className={`w-full py-5 rounded-[1.5rem] shadow-lg transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 active:scale-95
          ${isComplete && !loading 
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' 
            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
      >
        {loading ? 'جاري الحفظ...' : 'إرسال التقييم النهائي'}
        {isComplete && !loading && <CheckCircle2 size={22} />}
      </button>
    </motion.form>
  );
}

function DashboardView({ responses, onReset, showAdminBtn }: any) {
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(responses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الردود");
    XLSX.writeFile(wb, "Results.xlsx");
  };
  return (
    <div className="space-y-6 animate-in fade-in">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">نتائج الاستبيان</h2>
            <div className="flex gap-2 w-full md:w-auto">
                {showAdminBtn && <button onClick={onReset} className="flex-1 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><RefreshCcw size={14}/> وضع المعاينة</button>}
                <button onClick={exportToExcel} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"><Download size={14}/> تصدير Excel</button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 text-center shadow-sm">
                <p className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">إجمالي المشاركين</p>
                <p className="text-6xl font-black text-blue-600">{responses.length}</p>
            </div>
            <div className="bg-blue-600 p-8 rounded-[2rem] text-center shadow-lg shadow-blue-200 flex flex-col justify-center items-center text-white">
                <MessageSquareQuote size={40} className="mb-2 opacity-50" />
                <p className="font-bold">لوحة البيانات</p>
                <p className="text-xs opacity-80 uppercase mt-1">سيتم تفعيل الرسوم قريباً</p>
            </div>
        </div>
    </div>
  );
}

function AnalysisView() {
  return (
    <div className="bg-white border border-slate-100 p-12 rounded-[2.5rem] shadow-sm text-center space-y-6">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
        <BrainCircuit size={40} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800">التحليل الذكي للشخصية</h2>
      <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">بناءً على الردود، سيقوم الذكاء الاصطناعي برسم خارطة طريق لتطوير أدائك المهني والشخصي فور اكتمال عدد الردود المطلوب.</p>
    </div>
  );
}
