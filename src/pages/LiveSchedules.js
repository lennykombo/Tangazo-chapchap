import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../components/firebase";
import { Calendar, Radio, ExternalLink, Timer, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";

const LiveSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllSchedules = async () => {
      try {
        // Fetch sessions happening from "now" onwards
        const now = new Date().toISOString();
        const q = query(
          collection(db, "liveSchedules"),
          where("time", ">=", now),
          orderBy("time", "asc")
        );
        
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSchedules(data);
      } catch (error) {
        console.error("Error fetching public schedules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSchedules();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="max-w-6xl mx-auto p-6 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Live Session Calendar</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Discover creators going live. Book a mention or a segment during these high-engagement windows.
          </p>
        </header>

        {loading ? (
          <div className="text-center py-20 font-bold text-gray-400 animate-pulse">Loading Live Events...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schedules.map((session) => (
              <div key={session.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group">
                {/* Platform Badge */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                    <Radio size={18} className="animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-widest">{session.platform} LIVE</span>
                  </div>
                  <Timer size={18} className="opacity-50" />
                </div>

                <div className="p-8">
                  <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors">
                    {session.topic}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-500 mb-6">
                    <Calendar size={14} />
                    <span className="text-sm font-bold">
                      {new Date(session.time).toLocaleString([], { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Creator</p>
                        <p className="text-sm font-bold text-gray-800">{session.influencerName}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => navigate('/influencer')} // Direct them to book
                      className="bg-gray-900 text-white p-3 rounded-2xl hover:bg-orange-500 transition-all shadow-lg"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {schedules.length === 0 && !loading && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
             <p className="text-gray-400 font-bold uppercase tracking-widest">No upcoming live sessions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveSchedules;