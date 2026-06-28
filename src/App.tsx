import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, LayoutDashboard, BrainCircuit, CheckCircle2, Star, Trophy, MessageCircle, Users, Target, Lightbulb, AlertCircle, RefreshCcw, Heart } from 'lucide-react';

const supabase = createClient(
  'https://qeqkcvoewqebzqqjmrez.supabase.co',
  'sb_publishable_veEJ6znXaLQgx3MnipR7Gw_ODK46Lmo'
);

const categories = [
  { title: "التواصل", icon: <MessageCircle size={24} className="text-[#facc15]" />, fields: ["q1", "q2", "q3"], questions: ["يستمع للآخرين باهتمام وتركيز", "يعبّر عن أفكاره بوضوح تام", "يحترم اختلاف الآراء ويتقبلها"] },
  { title: "الاحترافية", icon: <Star size={24} className="text-[#facc15]" />, fields: ["q4", "q5"], questions: ["يلتزم بالمواعيد ويحترم وقت الآخرين", "يُقدّم عمله بجودة ودقة عالية"] },
  { title: "القيادة", icon: <Trophy size={24} className="text-[#facc15]" />, fields: ["q6", "q7", "q8"], questions: ["يتحمل المسؤولية الكاملة عن أفعاله", "يتخذ القرارات بثقة وثبات", "يُلهم من حوله ويدفعهم نحو التميز"] },
  { title: "العلاقات والتعاون", icon: <Heart size={24} className="text-[#facc15]" />, fields: ["q9", "q10"], questions: ["يبني علاقات مهنية قائمة على الثقة", "يتعاون بفاعلية مع أعضاء الفريق"] },
  { title: "الذكاء العاطفي", icon: <Users size={24} className="text-[#facc15]" />, fields: ["q11", "q12", "q13"], questions: ["يتحكم في هدوئه عند الغضب", "يتقبل النقد البناء بصدر رحب", "يظهر تعاطفاً حقيقياً مع الآخرين"] },
  { title: "الانضباط", icon: <Target size={24} className="text-[#facc15]" />, fields: ["q14", "q15"], questions: ["ينهي ما بدأه من مهام بجدية", "يمكن الاعتماد عليه في الأوقات الصعبة"] },
  { title: "التطوير الشخصي", icon: <Lightbulb size={24} className="text-[#facc15]" />, fields: ["q16", "q17"], questions: ["يتقبل التغيير الإيجابي بمرونة", "يعترف بأخطائه بصراحة ويتعلم منها"] }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'survey' | 'dashboard' | 'analysis'>('survey');
  const [formData, setFormData] = useState<any>({});
  const [responses, setResponses] = useState<any[]>([]);
  const [isVoted, setIsVoted] = useState(localStorage.getItem('voted_status') === 'true');
  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  useEffect(() => { fetchResponses(); }, []);

  const fetchResponses = async () => {
    try {
      const { data } = await supabase.from('responses').select('*');
      if (data) setResponses(data);
    } catch (err) { console.error(err); }
  };

  const isFormComplete = () => {
    const questionFields = categories.flatMap(c => c.fields);
    const textFields = ["p_desc", "p_strengths", "p_improvements", "p_notes"];
    const allRequired = [...questionFields, ...textFields];
    return allRequired.every(f => formData[f] && String(formData[f]).trim() !== "");
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
      
      {/* شريط التنقل العلوي المطور */}
      <nav className="bg-[#161b22]/90 backdrop-blur-xl border-b border-[#30363d] sticky top-0 z-50 shadow-2xl">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center h-20">
          
          {/* الشعار بجانب بعض */}
          <div className="flex items-center gap-2">
            <span className="text-[#facc15] font-black text-2xl tracking-tighter whitespace-nowrap">شارك رأيك</span>
          </div>

          {/* الأزرار الملونة */}
          <div className="flex bg-[#0d1117] p-1.5 rounded-2xl gap-1.5 border border-[#30363d]">
            <NavTab 
              active={activeTab === 'analysis'} 
              onClick={() => setActiveTab('analysis')} 
              icon={<BrainCircuit size={18}/>} 
              label="التحليل" 
              activeColor="bg-purple-600 shadow-purple-900/20"
            />
            <NavTab 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard size={18}/>} 
              label="النتائج" 
              activeColor="bg-blue-600 shadow-blue-900/20"
            />
            <NavTab 
              active={activeTab === 'survey'} 
              onClick={() => setActiveTab('survey')} 
              icon={<ClipboardList size={18}/>} 
              label="الاستبيان" 
              activeColor="bg-emerald-600 shadow-emerald-900/20"
            />
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-10 px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'survey' ? (
            isVoted ? ( <ThankYouView key="thanks" /> ) : (
              <SurveyView key="form" formData={formData} setFormData={setFormData} isComplete={isFormComplete()} setIsVoted={setIsVoted} fetchResponses={fetchResponses} />
            )
          ) : activeTab === 'dashboard' ? (
            <DashboardView key="dash" responses={responses} isAdmin={isAdmin} setIsVoted={setIsVoted} />
          ) : (
            <AnalysisView key="analysis" responses={responses} />
          )}
        </AnimatePresence>
      </main>

      {/* Footer مع تحديث التاريخ */}
      <footer className="text-center py-12 border-t border-[#30363d] mt-10 bg-[#161b22]/30">
        <p className="text-gray-500 text-sm">
          صُمّم بعناية من قِبَل <span className="text-[#facc15] font-bold">عبداللطيف الشهري</span> . جميع الحقوق محفوظة © 2026
        </p>
      </footer>
    </div>
  );
}

function NavTab({ active, onClick, icon, label, activeColor }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center w-[70px] md:w-20 h-16 rounded-xl transition-all duration-500 ${active ? `${activeColor} text-white shadow-lg scale-105` : 'text-gray-500 hover:text-gray-300'}`}
    >
      {icon}
      <span className="text-[10px] font-black mt-1 uppercase tracking-widest">{label}</span>
    </button>
  );
}

function SurveyView({ formData, setFormData, isComplete, setIsVoted, fetchResponses }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!isComplete) return;
    setLoading(true);
    const { error } = await supabase.from('responses').insert([formData]);
    if (!error) {
      localStorage.setItem('voted_status', 'true');
      setIsVoted(true);
      fetchResponses();
    } else { alert("حدث خطأ تقني."); }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      <div className="text-center space-y-6 mb-16">
        <div className="inline-block px-5 py-1.5 rounded-full border border-emerald-500/20 text-emerald-400 text-xs font-bold bg-emerald-500/5 tracking-widest uppercase mb-4">تقييم شخصي وأداء مهني</div>
        <h2 className="text-3xl md:text-4xl font-black leading-[1.3] text-white">
          أنا <span className="text-[#facc15]">عبداللطيف الشهري</span>، <br />
          وقد صممت هذا الموقع للحصول على آراء صادقة وموضوعية
        </h2>
        <div className="w-24 h-1.5 bg-[#facc15] mx-auto rounded-full shadow-[0_0_15px_rgba(250,204,21,0.4)]"></div>
        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed italic">
          مشاركتكم الصادقة تساهم بفعالية في تحديد نقاط القوة وفرص التحسين لرفع كفاءة الأداء الشخصي والمهني.
        </p>
      </div>

      {categories.map((cat, idx) => (
        <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-[#30363d] flex justify-between items-center bg-[#1c2128]">
             <div className="bg-[#facc15]/10 p-2.5 rounded-2xl border border-[#facc15]/20">{cat.icon}</div>
             <h3 className="text-2xl font-bold text-[#facc15] tracking-tight">{cat.title}</h3>
          </div>
          <div className="p-10 space-y-14">
            {cat.questions.map((q, qIdx) => (
              <div key={qIdx} className="space-y-8 text-right">
                <p className="text-white text-xl font-medium leading-relaxed">{q}</p>
                <div className="flex justify-start gap-4" dir="ltr">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData({...formData, [cat.fields[qIdx]]: val})}
                      className={`w-14 h-14 rounded-full border-2 transition-all duration-300 font-black text-xl flex items-center justify-center
                        ${formData[cat.fields[qIdx]] === val 
                          ? 'bg-[#facc15] border-[#facc15] text-[#0d1117] shadow-[0_0_25px_rgba(250,204,21,0.4)] scale-110' 
                          : 'bg-transparent border-[#30363d] text-gray-500 hover:border-[#facc15] hover:text-[#facc15]'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-[#161b22] border border-[#30363d] rounded-[2.5rem] overflow-hidden shadow-2xl p-10 space-y-12">
        <div className="flex items-center gap-4 mb-6 border-b border-[#30363d] pb-6">
          <div className="bg-[#facc15]/10 p-3 rounded-2xl border border-[#facc15]/20"><BrainCircuit className="text-[#facc15]" size={28} /></div>
          <h3 className="text-2xl font-black text-[#facc15] tracking-tight">رأيك الشخصي</h3>
        </div>

        {[
          { id: 'p_desc', label: 'كيف تصف شخصية عبداللطيف الشهري بشكل عام؟' },
          { id: 'p_strengths', label: 'ما أبرز نقاط القوة التي تراها فيه؟' },
          { id: 'p_improvements', label: 'ما الجوانب التي يمكنه تطويرها أو تحسينها؟' },
          { id: 'p_notes', label: 'هل لديك أي ملاحظة أو اقتراح إضافي؟' }
        ].map((item) => (
          <div key={item.id} className="space-y-5 text-right">
            <label className="text-white font-bold block text-lg pr-2 leading-relaxed">{item.label}</label>
            <textarea 
              required
              placeholder="اكتب إجابتك هنا..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-3xl p-6 text-white text-lg outline-none focus:border-[#facc15] focus:ring-4 focus:ring-[#facc15]/5 transition-all min-h-[150px] placeholder:text-gray-700"
              onChange={(e) => setFormData({...formData, [item.id]: e.target.value})}
            />
          </div>
        ))}
      </div>

      {!isComplete && (
        <div className="flex items-center justify-center gap-3 text-amber-400 bg-amber-400/5 p-6 rounded-3xl border border-amber-400/20">
          <AlertCircle size={24} />
          <span className="text-base font-bold text-center">يرجى تقييم كافة المحاور وتعبئة الخانات النصية لتفعيل زر الإرسال.</span>
        </div>
      )}

      <button 
        disabled={!isComplete || loading}
        onClick={handleSubmit}
        className={`w-full py-7 rounded-full font-black text-2xl shadow-2xl transition-all duration-500 active:scale-95
          ${isComplete && !loading 
            ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_10px_40px_rgba(16,185,129,0.2)] cursor-pointer' 
            : 'bg-[#161b22] text-gray-700 border border-[#30363d] cursor-not-allowed'}`}
      >
        {loading ? 'جاري معالجة البيانات...' : 'اعتماد وإرسال التقييم'}
      </button>
    </motion.div>
  );
}

function ThankYouView() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-32 space-y-10">
      <div className="relative inline-block">
        <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 relative z-10">
          <CheckCircle2 size={60} className="text-emerald-500" />
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-500 rounded-full blur-3xl opacity-10 animate-pulse"></div>
      </div>
      <div className="space-y-4 text-center">
        <h2 className="text-5xl font-black text-white tracking-tighter">مُمتن لك!</h2>
        <p className="text-gray-400 text-xl max-w-sm mx-auto leading-relaxed">تم استلام تقييمك بنجاح. رأيك الصادق سيصنع فرقاً حقيقياً في رحلة تطوري.</p>
      </div>
    </motion.div>
  );
}

function DashboardView({ responses, isAdmin, setIsVoted }: any) {
  return (
    <div className="text-center py-24 space-y-10">
      <div className="bg-[#161b22] border border-blue-500/20 p-12 rounded-[3rem] shadow-2xl space-y-8">
        <Trophy size={80} className="text-blue-500 mx-auto opacity-20" />
        <h2 className="text-4xl font-black text-white tracking-tight">إحصائيات المشاركة</h2>
        <div className="flex flex-col items-center">
            <span className="text-7xl font-black text-blue-500 leading-none">{responses?.length || 0}</span>
            <span className="text-gray-500 font-bold uppercase tracking-[0.3em] text-xs mt-4">رد مكتمل</span>
        </div>
        
        {isAdmin && (
          <button onClick={() => { localStorage.removeItem('voted_status'); setIsVoted(false); }} className="bg-blue-500/10 text-blue-400 px-6 py-2 rounded-full text-xs font-bold border border-blue-500/20 flex items-center gap-2 mx-auto hover:bg-blue-500 hover:text-white transition-all">
            <RefreshCcw size={14}/> تفعيل وضع المعاينة
          </button>
        )}
      </div>
      <p className="text-gray-600 text-sm italic">لوحة البيانات التحليلية يتم تحديثها الآن...</p>
    </div>
  );
}

function AnalysisView({ responses }: any) {
  return (
    <div className="bg-[#161b22] border border-purple-500/20 p-20 rounded-[4rem] shadow-2xl text-center space-y-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600 rounded-full blur-[120px] opacity-[0.03]"></div>
      <div className="w-28 h-28 bg-purple-600/5 text-purple-500 rounded-[2.5rem] flex items-center justify-center mx-auto border border-purple-500/10">
        <BrainCircuit size={56} />
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-black text-white tracking-tighter">التحليل الذكي</h2>
        <div className="w-12 h-1 bg-purple-500 mx-auto rounded-full"></div>
      </div>
      <p className="text-gray-400 max-w-md mx-auto text-xl leading-relaxed italic opacity-80">
        يتم حالياً معالجة {responses?.length || 0} رد لاستخراج الأنماط السلوكية العميقة.
      </p>
    </div>
  );
}
