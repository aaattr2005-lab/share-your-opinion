import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, LayoutDashboard, BrainCircuit, CheckCircle2, Star, Trophy, MessageCircle, Users, Target, Lightbulb, AlertCircle, RefreshCcw, Handshake } from 'lucide-react';

const supabase = createClient(
  'https://qeqkcvoewqebzqqjmrez.supabase.co',
  'sb_publishable_veEJ6znXaLQgx3MnipR7Gw_ODK46Lmo'
);

// المحاور مع الأيقونات كما في الصور
const categories = [
  { title: "التواصل", icon: <MessageCircle size={24} className="text-[#facc15]" />, fields: ["q1", "q2", "q3"], questions: ["يستمع للآخرين باهتمام وتركيز", "يعبّر عن أفكاره بوضوح تام", "يحترم اختلاف الآراء ويتقبلها"] },
  { title: "الاحترافية", icon: <Star size={24} className="text-[#facc15]" />, fields: ["q4", "q5"], questions: ["يلتزم بالمواعيد ويحترم وقت الآخرين", "يُقدّم عمله بجودة ودقة عالية"] },
  { title: "القيادة", icon: <Trophy size={24} className="text-[#facc15]" />, fields: ["q6", "q7", "q8"], questions: ["يتحمل المسؤولية الكاملة عن أفعاله", "يتخذ القرارات بثقة وثبات", "يُلهم من حوله ويدفعهم نحو التميز"] },
  { title: "العلاقات والتعاون", icon: <Handshake size={24} className="text-[#facc15]" />, fields: ["q9", "q10"], questions: ["يبني علاقات مهنية قائمة على الثقة", "يتعاون بفاعلية مع أعضاء الفريق"] },
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
    const { data } = await supabase.from('responses').select('*');
    if (data) setResponses(data);
  };

  const isFormComplete = () => {
    const allFields = [...categories.flatMap(c => c.fields), "p_desc", "p_strengths", "p_improvements", "p_notes"];
    return allFields.every(f => formData[f] && String(formData[f]).trim() !== "");
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-['IBM_Plex_Sans_Arabic']" dir="rtl">
      {/* شريط التنقل العلوي المماثل للصورة */}
      <nav className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center h-20">
          <div className="flex flex-col items-end">
            <span className="text-[#facc15] font-bold text-2xl">شاركني</span>
            <span className="text-[#facc15] font-bold text-2xl mt-[-8px]">رأيك</span>
          </div>
          <div className="flex gap-2">
            <NavTab active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} icon={<BrainCircuit size={20}/>} label="التحليل" />
            <NavTab active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20}/>} label="النتائج" />
            <NavTab active={activeTab === 'survey'} onClick={() => setActiveTab('survey')} icon={<ClipboardList size={20}/>} label="الاستبيان" />
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-10 px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'survey' ? (
            isVoted ? (
              <ThankYouView />
            ) : (
              <SurveyView formData={formData} setFormData={setFormData} isComplete={isFormComplete()} setIsVoted={setIsVoted} fetchResponses={fetchResponses} />
            )
          ) : activeTab === 'dashboard' ? (
            <DashboardView responses={responses} isAdmin={isAdmin} setIsVoted={setIsVoted} />
          ) : (
            <AnalysisView responses={responses} />
          )}
        </AnimatePresence>
      </main>

      {/* Footer كما في الصورة */}
      <footer className="text-center py-10 border-t border-[#30363d] mt-10">
        <p className="text-gray-400 text-sm">
          صُمّم بعناية من قِبَل <span className="text-[#facc15] font-bold">عبداللطيف الشهري</span> . جميع الحقوق محفوظة © 2025
        </p>
      </footer>
    </div>
  );
}

function NavTab({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center w-20 h-16 rounded-xl transition-all ${active ? 'bg-[#facc15] text-[#0d1117]' : 'text-gray-400 hover:text-white'}`}
    >
      {icon}
      <span className="text-xs font-bold mt-1">{label}</span>
    </button>
  );
}

function SurveyView({ formData, setFormData, isComplete, setIsVoted, fetchResponses }: any) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('responses').insert([formData]);
    if (!error) {
      localStorage.setItem('voted_status', 'true');
      setIsVoted(true);
      fetchResponses();
    } else {
      alert("خطأ في الإرسال");
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* قسم الهيدر */}
      <div className="text-center space-y-6 mb-12">
        <div className="inline-block px-4 py-1 rounded-full border border-[#facc15]/30 text-[#facc15] text-sm mb-4 bg-[#facc15]/5">تقييم شخصي وأداء مهني</div>
        <h2 className="text-3xl font-black leading-snug">
          أنا <span className="text-[#facc15]">عبداللطيف الشهري</span>، <br />
          وقد صممت هذا الموقع للحصول على آراء صادقة وموضوعية
        </h2>
        <div className="w-24 h-1 bg-[#facc15] mx-auto rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
          من الأشخاص الذين تعاملوا معي — مشاركتكم الصادقة تساهم بفاعلية في تحديد نقاط القوة وفرص التحسين لرفع كفاءة الأداء الشخصي والمهني.
        </p>
      </div>

      {categories.map((cat, idx) => (
        <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-[2rem] overflow-hidden shadow-lg">
          <div className="p-6 border-b border-[#30363d] flex justify-between items-center">
             <div className="bg-[#facc15]/10 p-2 rounded-xl">{cat.icon}</div>
             <h3 className="text-xl font-bold text-[#facc15]">{cat.title}</h3>
          </div>
          <div className="p-8 space-y-12">
            {cat.questions.map((q, qIdx) => (
              <div key={qIdx} className="space-y-6">
                <p className="text-white text-lg font-medium text-right leading-relaxed">{q}</p>
                <div className="flex justify-start gap-3" dir="ltr">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setFormData({...formData, [cat.fields[qIdx]]: val})}
                      className={`w-12 h-12 rounded-full border-2 transition-all font-bold text-lg flex items-center justify-center
                        ${formData[cat.fields[qIdx]] === val 
                          ? 'bg-[#facc15] border-[#facc15] text-[#0d1117] shadow-[0_0_15px_rgba(250,204,21,0.4)]' 
                          : 'bg-transparent border-[#30363d] text-gray-400 hover:border-[#facc15]'}`}
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

      {/* قسم رأيك الشخصي */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-[2rem] overflow-hidden shadow-lg p-8 space-y-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#facc15]/10 p-2 rounded-xl"><BrainCircuit className="text-[#facc15]" /></div>
          <h3 className="text-xl font-bold text-[#facc15]">رأيك الشخصي</h3>
        </div>

        {[
          { id: 'p_desc', label: 'كيف تصف شخصية عبداللطيف الشهري بشكل عام؟' },
          { id: 'p_strengths', label: 'ما أبرز نقاط القوة التي تراها فيه؟' },
          { id: 'p_improvements', label: 'ما الجوانب التي يمكنه تطويرها أو تحسينها؟' },
          { id: 'p_notes', label: 'هل لديك أي ملاحظة أو اقتراح إضافي؟' }
        ].map((item) => (
          <div key={item.id} className="space-y-4">
            <label className="text-white font-medium block text-lg pr-2">{item.label}</label>
            <textarea 
              required
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl p-5 text-white outline-none focus:border-[#facc15] transition-all min-h-[120px]"
              onChange={(e) => setFormData({...formData, [item.id]: e.target.value})}
            />
          </div>
        ))}
      </div>

      {!isComplete && (
        <div className="flex items-center gap-3 text-[#facc15] bg-[#facc15]/5 p-5 rounded-2xl border border-[#facc15]/20">
          <AlertCircle size={20} />
          <span className="text-sm font-bold">يرجى تقييم كافة المحاور وتعبئة الخانات النصية لتفعيل زر الإرسال.</span>
        </div>
      )}

      <button 
        disabled={!isComplete || loading}
        onClick={handleSubmit}
        className={`w-full py-6 rounded-full font-black text-xl shadow-2xl transition-all active:scale-95
          ${isComplete && !loading 
            ? 'bg-[#facc15] text-[#0d1117] hover:bg-[#eab308]' 
            : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'}`}
      >
        {loading ? 'جاري الإرسال...' : 'إرسال التقييم'}
      </button>
      <p className="text-center text-gray-500 text-sm">جميع الإجابات سرية ومجهولة الهوية</p>
    </motion.div>
  );
}

function ThankYouView() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
      <div className="w-24 h-24 bg-[#facc15]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#facc15]/20">
        <CheckCircle2 size={50} className="text-[#facc15]" />
      </div>
      <h2 className="text-4xl font-black mb-4">شكراً لك!</h2>
      <p className="text-gray-400 text-lg">تم استلام تقييمك بنجاح. رأيك يساعدني على التطور.</p>
    </motion.div>
  );
}

function DashboardView({ responses, isAdmin, setIsVoted }: any) {
  return (
    <div className="text-center py-20 space-y-8">
      <Trophy size={60} className="text-[#facc15] mx-auto opacity-50" />
      <h2 className="text-3xl font-bold">لوحة النتائج</h2>
      <p className="text-gray-400 text-lg italic">إجمالي الردود المستلمة: <span className="text-[#facc15] font-black">{responses.length}</span></p>
      {isAdmin && (
        <button onClick={() => { localStorage.removeItem('voted_status'); setIsVoted(false); }} className="text-[#facc15] text-sm underline flex items-center gap-2 mx-auto">
          <RefreshCcw size={14}/> وضع المعاينة
        </button>
      )}
      <div className="bg-[#161b22] border border-[#30363d] p-10 rounded-3xl text-gray-500 italic">
        الرسوم البيانية قيد المعالجة الآن بناءً على الردود المستلمة.
      </div>
    </div>
  );
}

function AnalysisView({ responses }: any) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] p-16 rounded-[3.5rem] shadow-2xl text-center space-y-8">
      <div className="w-24 h-24 bg-[#facc15]/10 text-[#facc15] rounded-3xl flex items-center justify-center mx-auto border border-[#facc15]/20 shadow-[0_0_30px_rgba(250,204,21,0.1)]">
        <BrainCircuit size={48} />
      </div>
      <h2 className="text-3xl font-black">التحليل الذكي</h2>
      <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed italic">
        يتم حالياً معالجة {responses.length} رد لاستخراج الأنماط السلوكية وتحديد سمات الشخصية بدقة.
      </p>
    </div>
  );
}
