
import React, { useState, useCallback } from 'react';
import { ShieldCheck, Search, Building, User, LayoutDashboard, MessageSquare, Sparkles, X, MapPin, ArrowLeft, Trash2, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import { AppView, College, VerificationResult, ChatMessage, Student } from './types';
import { INITIAL_COLLEGES, NTA_MOCK_DATABASE } from './constants';
import { getCounselorResponse } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [colleges, setColleges] = useState<College[]>(INITIAL_COLLEGES);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  // Admin State
  const [currentAdminCollege, setCurrentAdminCollege] = useState<College | null>(null);
  const [verifyIds, setVerifyIds] = useState<string[]>(['']);
  const [batchResults, setBatchResults] = useState<VerificationResult[]>([]);
  const [newCollegeData, setNewCollegeData] = useState({
    name: '',
    location: '',
    fees: '',
    phone: '',
    hostel: 'yes'
  });

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'Hello! I am your EduVerify AI Counselor. How can I help you choose the right path today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Business Logic
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) setHasSearched(true);
  };

  const getSortedColleges = () => {
    return colleges
      .filter(c => c.location.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.students.length - a.students.length || parseInt(a.fees.replace(/\D/g, '')) - parseInt(b.fees.replace(/\D/g, '')));
  };

  const resetSearch = () => {
    setHasSearched(false);
    setSearchQuery('');
  };

  const handleBatchVerify = () => {
    const results: VerificationResult[] = verifyIds.map(id => {
      const cleanId = id.trim();
      if (!cleanId) return { id: '', status: 'error', message: 'Empty field' };

      // Malpractice Check
      const otherClaims = colleges.find(c => 
        c.students.some(s => s.id === cleanId) && (!currentAdminCollege || c.id !== currentAdminCollege.id)
      );
      
      if (otherClaims) {
        return { 
          id: cleanId, 
          status: 'malpractice', 
          message: `Double Claim Detected! Already listed by "${otherClaims.name}".` 
        };
      }

      const ntaData = NTA_MOCK_DATABASE[cleanId];
      if (!ntaData) return { id: cleanId, status: 'error', message: 'Invalid Roll Number' };

      return { ...ntaData, id: cleanId, status: 'success' };
    }).filter(r => r.id !== '');

    setBatchResults(results);
  };

  const addStudentToProfile = (res: VerificationResult) => {
    if (!currentAdminCollege) return;
    
    const newStudent: Student = {
      id: res.id,
      name: res.name || 'Unknown',
      score: res.percentile ? `${res.percentile}%tile` : `AIR ${res.rank}`,
      type: res.exam || 'JEE Mains'
    };

    const updated = {
      ...currentAdminCollege,
      students: [...currentAdminCollege.students, newStudent]
    };

    setColleges(prev => prev.map(c => c.id === currentAdminCollege.id ? updated : c));
    setCurrentAdminCollege(updated);
    setBatchResults(prev => prev.filter(r => r.id !== res.id));
  };

  const handleChat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem('chatInput') as HTMLInputElement).value;
    if (!input) return;

    const newMsgs: ChatMessage[] = [...chatMessages, { role: 'user', text: input }];
    setChatMessages(newMsgs);
    e.currentTarget.reset();
    setIsTyping(true);

    const context = `Available Institutes: ${colleges.map(c => `${c.name} in ${c.location} with ${c.students.length} verified achievers`).join(', ')}`;
    const reply = await getCounselorResponse(input, context);
    
    setChatMessages(prev => [...prev, { role: 'bot', text: reply }]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => { setView(AppView.LANDING); resetSearch(); }}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">EduVerify</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => { setView(AppView.STUDENT); resetSearch(); }}
              className={`text-sm font-semibold transition-colors ${view === AppView.STUDENT ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-500'}`}
            >
              For Students
            </button>
            <button 
              onClick={() => setView(AppView.ADMIN)}
              className={`text-sm font-semibold transition-colors ${view === AppView.ADMIN ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-500'}`}
            >
              Admin Portal
            </button>
            <button className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-slate-800 transition">
              Join Protocol
            </button>
          </div>
          
          <div className="md:hidden">
            {/* Mobile menu could go here */}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {view === AppView.LANDING && (
          <div className="relative overflow-hidden pt-16 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold mb-8 animate-bounce">
                  <Sparkles size={14} />
                  Trusted by 50,000+ Parents
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8">
                  Verify Results. <br />
                  <span className="text-indigo-600">Secure Your Future.</span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-slate-500 mb-12 leading-relaxed">
                  Stop the cycle of fake result claims. Our blockchain-inspired integrity protocol ensures that every coaching center achiever is unique and authentic.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => setView(AppView.STUDENT)}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition duration-300 flex items-center justify-center gap-2"
                  >
                    <Search size={20} /> Find Verified Colleges
                  </button>
                  <button 
                    onClick={() => setView(AppView.ADMIN)}
                    className="bg-white text-slate-900 border-2 border-slate-200 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition duration-300 flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={20} /> Admin Dashboard
                  </button>
                </div>
              </div>
              
              <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { icon: <ShieldCheck className="text-green-500" />, title: "Integrity Protocol", desc: "No student can be claimed by two institutes. Our cross-verification prevents duplicate result marketing." },
                  { icon: <MapPin className="text-orange-500" />, title: "Local Discovery", desc: "Search institutes in your city and see exactly who performed the best last year." },
                  { icon: <CheckCircle2 className="text-blue-500" />, title: "Official NTA/NBE Link", desc: "Verify scores directly against official databases in real-time." }
                ].map((feature, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition">
                    <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">{feature.icon}</div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === AppView.STUDENT && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {!hasSearched ? (
              <div className="max-w-3xl mx-auto py-20 text-center">
                <div className="bg-indigo-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-10 text-indigo-600">
                  <MapPin size={40} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-6">Where are you looking to study?</h2>
                <p className="text-slate-500 text-lg mb-10">We'll filter the top-performing institutes in your preferred city.</p>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <input 
                    autoFocus
                    className="flex-1 p-5 rounded-2xl border-2 border-slate-200 focus:border-indigo-600 outline-none text-xl transition shadow-sm"
                    placeholder="Enter city (e.g. Hyderabad, Kota, Delhi...)"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                    Search
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                  <div>
                    <button 
                      onClick={resetSearch}
                      className="text-indigo-600 font-bold text-sm flex items-center gap-1 mb-2 hover:underline"
                    >
                      <ArrowLeft size={16} /> Change Location
                    </button>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">
                      Verified Institutes in <span className="text-indigo-600 capitalize">"{searchQuery}"</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 text-[10px] text-white font-black px-4 py-2 rounded-xl tracking-widest uppercase">
                    Sorted by Performance
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {getSortedColleges().length > 0 ? (
                    getSortedColleges().map((college, idx) => (
                      <div key={college.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-shadow relative group">
                        {idx === 0 && (
                          <div className="absolute -top-3 left-8 bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
                            #1 Top Ranked
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{college.name}</h3>
                            <div className="flex items-center gap-1 text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill={i < Math.floor(college.rating) ? 'currentColor' : 'none'} />
                              ))}
                              <span className="text-slate-400 text-sm font-bold ml-1">{college.rating}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-1">Annual Fee</p>
                            <p className="text-xl font-bold text-slate-900">{college.fees}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                          <div className="bg-slate-50 p-3 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Students</p>
                            <p className="font-bold text-slate-700">{college.students.length} Verified</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hostel</p>
                            <p className="font-bold text-slate-700">{college.hostel ? 'Available' : 'N/A'}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-4">Top Achievers (Authenticity Verified)</p>
                          <div className="space-y-2">
                            {college.students.slice(0, 3).map(student => (
                              <div key={student.id} className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 group-hover:bg-indigo-50 transition">
                                <span className="font-bold text-slate-700 text-sm">{student.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-slate-400 px-2 py-0.5 bg-white rounded-md border border-slate-100 uppercase">{student.type}</span>
                                  <span className="font-black text-indigo-600 text-sm">{student.score}</span>
                                </div>
                              </div>
                            ))}
                            {college.students.length > 3 && (
                              <p className="text-center text-xs font-bold text-indigo-600 mt-2 cursor-pointer hover:underline">
                                + {college.students.length - 3} more verified achievers
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <button className="w-full mt-8 bg-slate-900 text-white p-4 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition flex items-center justify-center gap-2">
                          Get Contact Details
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 py-32 text-center bg-white rounded-[2rem] border border-slate-100">
                       <AlertTriangle className="mx-auto text-slate-300 mb-4" size={48} />
                       <p className="text-slate-500 font-bold">No verified institutes found in "{searchQuery}" yet.</p>
                       <p className="text-slate-400 text-sm">Be the first to report an institute from this area.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {view === AppView.ADMIN && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* College Setup Sidebar */}
              <div className="lg:col-span-1 space-y-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Building className="text-indigo-600" size={20} />
                    Institute Setup
                  </h3>
                  
                  {!currentAdminCollege ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const c: College = {
                          ...newCollegeData,
                          id: Date.now().toString(),
                          hostel: newCollegeData.hostel === 'yes',
                          students: [],
                          rating: 4.5
                        } as any;
                        setColleges([...colleges, c]);
                        setCurrentAdminCollege(c);
                      }} 
                      className="space-y-4"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Name</label>
                        <input required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition" placeholder="e.g. Chaitanya IIT" value={newCollegeData.name} onChange={e => setNewCollegeData({...newCollegeData, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Location</label>
                          <input required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" placeholder="City" value={newCollegeData.location} onChange={e => setNewCollegeData({...newCollegeData, location: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fees</label>
                          <input required className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl outline-none" placeholder="₹1.5L" value={newCollegeData.fees} onChange={e => setNewCollegeData({...newCollegeData, fees: e.target.value})} />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition">
                        Register Institute
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-1 bg-indigo-600 text-white"><CheckCircle2 size={12} /></div>
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Active Profile</p>
                        <p className="font-bold text-indigo-900 text-lg">{currentAdminCollege.name}</p>
                        <p className="text-xs text-indigo-600 font-medium">{currentAdminCollege.location}</p>
                      </div>
                      <button 
                        onClick={() => { setCurrentAdminCollege(null); setBatchResults([]); }}
                        className="w-full text-center text-xs font-bold text-slate-400 hover:text-red-500 transition underline underline-offset-4"
                      >
                        Sign Out / Switch Profile
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
                  <h4 className="font-bold text-lg mb-2">Protocol Guidelines</h4>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    All students added must be verified against roll numbers. Any attempt to claim a student already listed by another institute will trigger a "Double-Claim" violation.
                  </p>
                  <ul className="space-y-3 text-xs font-medium text-slate-300">
                    <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 mt-0.5" size={14} /> Official Marksheets required for audit.</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 mt-0.5" size={14} /> Result must be unique to your center.</li>
                  </ul>
                </div>
              </div>

              {/* Verification Area */}
              <div className="lg:col-span-2">
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[600px]">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900">Result Verification</h2>
                      <p className="text-slate-400 font-medium">Bulk verify and add your achievers to the protocol.</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
                      <ShieldCheck size={32} />
                    </div>
                  </div>

                  {!currentAdminCollege ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-40">
                      <AlertTriangle size={48} className="mb-4" />
                      <p className="text-lg font-bold">Register your institute first</p>
                      <p className="text-sm">Verification portal unlocks after registration.</p>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="space-y-4">
                        {verifyIds.map((id, index) => (
                          <div key={index} className="flex gap-2 group">
                            <input 
                              placeholder="Enter Student Roll Number / Application ID"
                              className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 transition font-mono"
                              value={id}
                              onChange={e => {
                                const newIds = [...verifyIds];
                                newIds[index] = e.target.value;
                                setVerifyIds(newIds);
                              }}
                            />
                            {verifyIds.length > 1 && (
                              <button 
                                onClick={() => setVerifyIds(verifyIds.filter((_, i) => i !== index))}
                                className="p-4 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={20} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button 
                          onClick={() => setVerifyIds([...verifyIds, ''])}
                          className="text-indigo-600 font-bold text-sm px-4 py-2 hover:bg-indigo-50 rounded-xl transition inline-flex items-center gap-2"
                        >
                          + Add Another Achiever
                        </button>
                      </div>

                      <button 
                        onClick={handleBatchVerify}
                        className="w-full bg-slate-900 text-white p-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition flex items-center justify-center gap-3"
                      >
                        <ShieldCheck size={24} /> Run Verification Protocol
                      </button>

                      {batchResults.length > 0 && (
                        <div className="space-y-4 pt-8 border-t border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Status Reports</h4>
                          {batchResults.map((res, i) => (
                            <div 
                              key={i} 
                              className={`p-6 rounded-3xl border animate-in slide-in-from-left duration-300 ${
                                res.status === 'success' ? 'bg-green-50/50 border-green-100' : 
                                res.status === 'malpractice' ? 'bg-orange-50 border-orange-200 ring-4 ring-orange-50' : 
                                'bg-red-50 border-red-100'
                              }`}
                              style={{ animationDelay: `${i * 100}ms` }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  {res.status === 'success' ? (
                                    <CheckCircle2 className="text-green-600" size={24} />
                                  ) : res.status === 'malpractice' ? (
                                    <AlertTriangle className="text-orange-600" size={24} />
                                  ) : (
                                    <X className="text-red-600" size={24} />
                                  )}
                                  <div>
                                    <p className="font-bold text-slate-800">
                                      {res.status === 'success' ? `${res.name} (Verified)` : res.message}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500">
                                      {res.status === 'success' ? `${res.exam} | ${res.percentile ? res.percentile + '%tile' : 'AIR ' + res.rank}` : `Roll ID: ${res.id}`}
                                    </p>
                                  </div>
                                </div>
                                {res.status === 'success' && (
                                  <button 
                                    onClick={() => addStudentToProfile(res)}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-xs hover:bg-indigo-700 transition"
                                  >
                                    Add to Wall
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Chatbot */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end z-50">
        {isChatOpen && (
          <div className="w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
            <div className="bg-indigo-600 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                <span className="font-bold tracking-tight text-lg">AI Counselor</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="bg-white/20 p-1.5 rounded-lg hover:bg-white/30 transition">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleChat} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input 
                name="chatInput" 
                autoComplete="off"
                className="flex-1 p-3 bg-slate-50 rounded-xl text-sm font-medium border border-transparent focus:border-indigo-100 focus:bg-white outline-none transition" 
                placeholder="Ask about verified colleges..." 
              />
              <button className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition">
                <MessageSquare size={20} />
              </button>
            </form>
          </div>
        )}
        
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-indigo-600 text-white p-5 rounded-3xl shadow-2xl shadow-indigo-300 transition-all hover:scale-110 active:scale-95 group relative"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></div>
          {isChatOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </button>
      </div>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
            <ShieldCheck size={20} />
            <span className="font-bold text-lg">EduVerify Integrity Protocol</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            &copy; {new Date().getFullYear()} EduVerify. Supporting JEE, NEET, and Professional Exams Authenticity.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
