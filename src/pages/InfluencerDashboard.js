import React, { useState, useEffect } from "react";
import { auth, db } from "../components/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs, addDoc, orderBy, deleteDoc } from "firebase/firestore";
import { 
  Calendar, LayoutDashboard, Radio, LogOut, Plus, Trash2, Upload, FileVideo, Image as ImageIcon, 
  AlertCircle, Award, History, Briefcase,
  FileText, PlayCircle, ExternalLink, Headphones
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav";

const InfluencerDashboard = () => {

const submissionRef = React.useRef(null);


  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming"); 
  const [upcomingCampaigns, setUpcomingCampaigns] = useState([]); 
  const [pastCampaigns, setPastCampaigns] = useState([]); 

  const [livePlatform, setLivePlatform] = useState("TikTok");
  const [liveDateTime, setLiveDateTime] = useState("");
  const [liveTopic, setLiveTopic] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [ssPreview, setSsPreview] = useState("");
  const [rejectedSubs, setRejectedSubs] = useState([]);
  const [mySchedules, setMySchedules] = useState([]);
  const [scheduleError, setScheduleError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchInfluencerData(currentUser.uid);
      } else {
        navigate("/login");
      }
    });
    return () => unsub();
  }, [navigate]);


  /*const fetchInfluencerData = async (uid) => {
    try {
      setLoading(true);
      const docRef = doc(db, "influencers", uid);
      const docSnap = await getDoc(docRef);
      let myUsername = "";
      if (docSnap.exists()) {
          const profileData = docSnap.data();
          setProfile(profileData);
          myUsername = profileData.username;
      }

      const querySnapshot = await getDocs(collection(db, "campaigns"));
      const allCampaignsRaw = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      const myCampaigns = allCampaignsRaw.filter(camp => {
        return camp.influencers?.some(inf => 
          inf.id === uid || (myUsername && inf.username === myUsername)
        );
      }).map(camp => {
        const myDetails = camp.influencers.find(inf => 
          inf.id === uid || (myUsername && inf.username === myUsername)
        );
        
        return {
          ...camp,
          myServices: myDetails.selectedServices || [],
          // Added logic to handle quantity if you added that feature
          myEarnings: myDetails.selectedServices?.reduce((sum, s) => sum + (s.price * (s.quantity || 1)), 0) || 0,
        };
      });

      // ✅ CHANGE START: Filter specifically by "Approved" status
      // Tab 1: ONLY show campaigns the Admin has approved.
      // Hide "Pending" and "Rejected" campaigns.
      setUpcomingCampaigns(myCampaigns.filter(c => 
        c.status === "Approved"
      ));

      // Tab 2: Show work that has been finished.
      setPastCampaigns(myCampaigns.filter(c => 
        c.status === "Completed"
      ));
      // ✅ CHANGE END

    } catch (err) { 
        console.error(err); 
    } finally { 
        setLoading(false); 
    }
};*/

const fetchInfluencerData = async (uid) => {
    try {
      setLoading(true);
      
      // 1. Fetch profile
      const docRef = doc(db, "influencers", uid);
      const docSnap = await getDoc(docRef);
      let myUsername = "";
      if (docSnap.exists()) {
          const profileData = docSnap.data();
          setProfile(profileData);
          myUsername = profileData.username;
      }

      // 2. Fetch all campaigns
      const querySnapshot = await getDocs(collection(db, "campaigns"));
      const allCampaignsRaw = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // 3. Filter campaigns where user is a participant
      const myCampaigns = allCampaignsRaw.filter(camp => {
        return camp.influencers && Array.isArray(camp.influencers) && 
               camp.influencers.some(inf => inf.id === uid || (myUsername && inf.username === myUsername));
      }).map(camp => {
        const myDetails = camp.influencers.find(inf => inf.id === uid || (myUsername && inf.username === myUsername));
        return {
          ...camp,
          myServices: myDetails.selectedServices || [],
          myEarnings: myDetails.selectedServices?.reduce((sum, s) => sum + (s.price * (s.quantity || 1)), 0) || 0,
        };
      });

      // 4. Fetch Rejected Submissions
      const subQuery = query(
        collection(db, "submissions"), 
        where("influencerId", "==", uid), 
        where("status", "==", "rejected")
      );
      const subSnap = await getDocs(subQuery);
      setRejectedSubs(subSnap.docs.map(d => d.data()));

      // 5. Fetch Schedules (Wrapped in try/catch in case Index is missing)
      try {
        const scheduleQuery = query(
          collection(db, "liveSchedules"), 
          where("influencerId", "==", uid),
          orderBy("time", "asc")
        );
        const scheduleSnap = await getDocs(scheduleQuery);
        setMySchedules(scheduleSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (scheduleErr) {
        console.warn("Schedule fetch failed (Check Firebase Indexes):", scheduleErr);
        // If it fails, still fetch without order to keep app running
        const simpleQuery = query(collection(db, "liveSchedules"), where("influencerId", "==", uid));
        const simpleSnap = await getDocs(simpleQuery);
        setMySchedules(simpleSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }

      // 6. Set Campaigns with CASE-INSENSITIVE checks
      setUpcomingCampaigns(myCampaigns.filter(c => 
        c.status?.toLowerCase() === "approved"
      ));

      setPastCampaigns(myCampaigns.filter(c => 
        c.status?.toLowerCase() === "completed"
      ));

    } catch (err) { 
        console.error("Critical Error in Dashboard:", err); 
    } finally { 
        setLoading(false); 
    }
};

  // --- Helper to detect media type for icons ---
  const getMediaIcon = (url) => {
    if (!url) return null;
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.match(/\.(mp4|mov|webm)$/)) return <PlayCircle className="text-purple-500" size={20} />;
    if (lowerUrl.match(/\.(mp3|wav|ogg)$/)) return <Headphones className="text-blue-500" size={20} />;
    return <ImageIcon className="text-green-500" size={20} />;
  };


  /*const handleAddSchedule = async (e) => {
  e.preventDefault();
  if (!liveDateTime || !liveTopic) return alert("Please fill all fields");

  try {
    await addDoc(collection(db, "liveSchedules"), {
      influencerId: user.uid,
      influencerName: profile.name,
      platform: livePlatform,
      time: liveDateTime, // or convert to Firebase Timestamp
      topic: liveTopic,
      createdAt: new Date()
    });

    alert("Schedule Added!");
    setLiveTopic("");
    setLiveDateTime("");
    fetchInfluencerData(user.uid); // Refresh the list
  } catch (err) {
    console.error("Error adding schedule:", err);
  }
};*/

const handleAddSchedule = async (e) => {
  e.preventDefault();
  setScheduleError(""); // Reset error

  // 🛡️ SECURITY REGEX CHECKS
  const hasNumbers = /\d/.test(liveTopic); // Detects 0-9
  const hasLinks = /(https?:\/\/|www\.|[a-z0-9]+\.(com|net|org|ke|me|co|io|biz))/gi.test(liveTopic); // Detects links
  const hasHandles = /@\w+/.test(liveTopic); // Detects @usernames

  if (hasNumbers) {
    setScheduleError("Phone numbers or digits are not allowed.");
    return;
  }
  if (hasLinks) {
    setScheduleError("External links or websites are not allowed.");
    return;
  }
  if (hasHandles) {
    setScheduleError("Social media handles (@) are not allowed.");
    return;
  }
  if (!liveDateTime || !liveTopic) {
    setScheduleError("Please fill all fields.");
    return;
  }

  try {
    await addDoc(collection(db, "liveSchedules"), {
      influencerId: user.uid,
      influencerName: profile.name,
      platform: livePlatform,
      time: liveDateTime,
      topic: liveTopic.trim(),
      createdAt: new Date()
    });

    alert("Schedule Added!");
    setLiveTopic("");
    setLiveDateTime("");
    fetchInfluencerData(user.uid); 
  } catch (err) {
    console.error("Error adding schedule:", err);
  }
};

 /* const removeSchedule = async (id) => {
    const updatedLives = profile.upcomingLives.filter(item => item.id !== id);
    try {
      await updateDoc(doc(db, "influencers", user.uid), { upcomingLives: updatedLives });
      setProfile({ ...profile, upcomingLives: updatedLives });
    } catch (err) { console.error(err); }
  };*/

  const removeSchedule = async (id) => {
  try {
    await deleteDoc(doc(db, "liveSchedules", id));
    setMySchedules(prev => prev.filter(item => item.id !== id));
  } catch (err) {
    console.error("Error deleting:", err);
  }
};

  /*const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      if (video.duration > 4.5) { alert("Max 3 seconds allowed!"); setVideoFile(null); }
      else { setVideoFile(file); setVideoPreview(URL.createObjectURL(file)); }
    };
    video.src = URL.createObjectURL(file);
  };*/

   const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      
      if (video.duration > 15.5) { 
        alert("Video too long! Please record a maximum of 15 seconds.");
        setVideoFile(null);
        setVideoPreview("");
      } else {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
      }
    };
    video.src = URL.createObjectURL(file);
  };

  const uploadFile = async (file, resourceType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, { method: "POST", body: formData });
    return (await res.json()).secure_url;
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!selectedCampaign || !videoFile || !screenshotFile) return alert("Missing files");
    setIsSubmitting(true);
    try {
      const vUrl = await uploadFile(videoFile, "video");
      const sUrl = await uploadFile(screenshotFile, "image");
      await addDoc(collection(db, "submissions"), {
        influencerId: user.uid, influencerName: profile.name, campaignId: selectedCampaign, videoUrl: vUrl, screenshotUrl: sUrl, status: "pending", submittedAt: new Date()
      });
      alert("Proof submitted!");
      setVideoPreview(""); setSsPreview(""); setSelectedCampaign("");
    } catch (err) { alert("Upload failed"); } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Synchronizing...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Nav />
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* WELCOME HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <img src={profile?.img} className="w-16 h-16 rounded-full object-cover border-2 border-orange-500" alt="" />
            <div>
              {/*<h1 className="text-2xl font-black text-gray-900 leading-tight">Creator Studio</h1>
              <p className="text-gray-500 text-sm font-medium">{profile?.name} ({profile?.username})</p>*/}
              <h1 className="text-2xl font-black text-gray-900 leading-tight">Hello, {profile?.name}!</h1>
              <p className="text-gray-500 text-sm font-medium">{profile?.username} • {profile?.niches?.join(", ")}</p>
            </div>
          </div>
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 px-6 py-3 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition">
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-8 rounded-[2rem] text-white shadow-xl">
              <LayoutDashboard className="mb-4 opacity-50" size={40} />
              <h3 className="text-lg font-bold opacity-90">Work Status</h3>
              <div className="flex gap-4 mt-4">
                <div><p className="text-3xl font-black">{upcomingCampaigns.length}</p><p className="text-[10px] uppercase font-bold opacity-70">Active Tasks</p></div>
                <div className="border-l border-white/20 pl-4"><p className="text-3xl font-black">{pastCampaigns.length}</p><p className="text-[10px] uppercase font-bold opacity-70">Completed</p></div>
              </div>
            </div>

            <div className="bg-black p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                <Award className="absolute -right-4 -bottom-4 opacity-10" size={120} />
                <h3 className="text-xs font-bold opacity-50 uppercase tracking-widest">Lifetime Earnings</h3>
                <p className="text-4xl font-black mt-2">
                    <span className="text-orange-500 text-xl mr-1">Ksh</span>
                    {pastCampaigns.reduce((sum, c) => sum + (c.myEarnings || 0), 0).toLocaleString()}
                </p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
              <button onClick={() => setActiveTab('upcoming')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'upcoming' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>
                <Briefcase size={14} /> ACTIVE WORK
              </button>
              <button onClick={() => setActiveTab('past')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition ${activeTab === 'past' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>
                <History size={14} /> HISTORY
              </button>
            </div>

            {/* CAMPAIGN LIST */}
            <div className="space-y-6">
              {(activeTab === 'upcoming' ? upcomingCampaigns : pastCampaigns).map((campaign) => (
                <div key={campaign.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 transition hover:border-orange-200">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">{campaign.name || "Untitled Campaign"}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Ref: {campaign.id.slice(0,8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-orange-600">Ksh {campaign.myEarnings?.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Your Share</p>
                    </div>
                  </div>
                  {/* --- Inside upcomingCampaigns.map --- */}
{rejectedSubs.find(s => s.campaignId === campaign.id) && (
  <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-3xl flex gap-3 animate-bounce">
    <AlertCircle className="text-red-600 shrink-0" size={24} />
    <div>
      <h4 className="text-xs font-black text-red-600 uppercase">Action Required: Work Rejected</h4>
      <p className="text-sm text-red-900 font-medium mt-1">
        Reason: "{rejectedSubs.find(s => s.campaignId === campaign.id).rejectionReason}"
      </p>
      <p className="text-[10px] text-red-500 mt-2 font-bold underline">Please re-upload proof below.</p>
    </div>
  </div>
)}

                  {/* 📝 DESCRIPTION / BRIEF */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText size={16} className="text-gray-400" />
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instruction Brief</h4>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      {campaign.description || "No specific instructions provided."}
                    </p>
                  </div>

                  {/* 🎧 MEDIA RESOURCES */}
                  {campaign.mediaUrl && (
                    <div className="mb-6">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Resource Files</h4>
                        <a 
                          href={campaign.mediaUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-3 bg-white border-2 border-gray-50 p-3 rounded-2xl hover:bg-gray-50 transition w-fit"
                        >
                          {getMediaIcon(campaign.mediaUrl)}
                          <span className="text-xs font-bold text-gray-700">Open Reference Media</span>
                          <ExternalLink size={14} className="text-gray-400" />
                        </a>
                    </div>
                  )}

                  {/* ✅ SERVICES & QUANTITY */}
                  <div className="mb-8">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Required Work</h4>
                    <div className="flex flex-wrap gap-2">
                        {campaign.myServices?.map((service, index) => (
                        <div key={index} className="flex items-center gap-2 bg-orange-50 border border-orange-100 px-4 py-2 rounded-full">
                            <span className="text-xs font-black text-orange-600 uppercase italic">{service.name}</span>
                            <span className="bg-orange-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">x{service.quantity || 1}</span>
                        </div>
                        ))}
                    </div>
                  </div>

                  {activeTab === 'upcoming' && (
                    <button 
                      //onClick={() => {setSelectedCampaign(campaign.id); window.scrollTo({top: 400, behavior: 'smooth'})}} 
                       onClick={() => {setSelectedCampaign(campaign.id);
                             submissionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }} 
                      className="w-full py-4 bg-black text-white rounded-2xl flex items-center justify-center gap-2 text-sm font-black hover:bg-gray-800 transition shadow-lg"
                    >
                      <Upload size={18} /> SUBMIT PROOF FOR REVIEW
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* PROOF SUBMISSION FORM */}
            {activeTab === 'upcoming' && upcomingCampaigns.length > 0 && (
              <div  ref={submissionRef} 
                   className="bg-white p-8 rounded-[2rem] shadow-xl border-2 border-orange-50">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><Upload className="text-green-500" /> Upload Campaign Proof</h2>
                <form onSubmit={handleSubmitProof} className="space-y-6">
                  <select required value={selectedCampaign} onChange={(e) => setSelectedCampaign(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold">
                    <option value="">Select Campaign to Submit</option>
                    {upcomingCampaigns.map(c => <option key={c.id} value={c.id}>{c.name || "Untitled"}</option>)}
                  </select>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="border-2 border-dashed border-gray-200 rounded-3xl p-6 text-center cursor-pointer hover:bg-gray-50 transition relative overflow-hidden">
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
                      {videoPreview ? <video src={videoPreview} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop /> : <div className="py-4"><FileVideo className="mx-auto text-orange-500 mb-2" /><p className="text-xs font-black">15s VIDEO PROOF</p></div>}
                    </label>
                    <label className="border-2 border-dashed border-gray-200 rounded-3xl p-6 text-center cursor-pointer hover:bg-gray-50 transition relative overflow-hidden">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {setScreenshotFile(e.target.files[0]); setSsPreview(URL.createObjectURL(e.target.files[0]))}} />
                      {ssPreview ? <img src={ssPreview} className="absolute inset-0 w-full h-full object-cover" alt="ss" /> : <div className="py-4"><ImageIcon className="mx-auto text-blue-500 mb-2" /><p className="text-xs font-black">ANALYTICS SS</p></div>}
                    </label>
                  </div>
                  <button disabled={isSubmitting} className="w-full bg-orange-500 text-white font-black py-5 rounded-[2rem] hover:bg-orange-600 transition shadow-xl disabled:bg-gray-300">
                    {isSubmitting ? "UPLOADING..." : "SEND PROOF TO ADMIN"}
                  </button>
                </form>
              </div>
            )}

            {/* LIVE SCHEDULE */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><Radio className="text-red-600 animate-pulse" /> My Live Schedule</h2>
              <form onSubmit={handleAddSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
  {/* Platform Select */}
  <select 
    value={livePlatform} 
    onChange={(e) => setLivePlatform(e.target.value)} 
    className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none"
  >
    <option>TikTok</option>
    <option>Instagram</option>
    <option>YouTube</option>
    <option>Facebook</option>
  </select>

  {/* Date/Time Picker */}
  <input 
    type="datetime-local" 
    value={liveDateTime} 
    onChange={(e) => setLiveDateTime(e.target.value)} 
    className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none" 
  />

  {/* Subject Field with Security styling */}
  <div className="col-span-full">
    <input 
      type="text" 
      placeholder="Subject: (No numbers, links, or handles allowed)" 
      className={`w-full p-4 bg-gray-50 border rounded-2xl text-xs font-bold outline-none transition-all ${
        scheduleError ? 'border-red-500 bg-red-50' : 'border-gray-100'
      }`} 
      value={liveTopic} 
      onChange={(e) => {
        setLiveTopic(e.target.value);
        setScheduleError(""); // Clear error as they type
      }} 
    />
    
    {/* 🚩 Error Message Alert */}
    {scheduleError && (
      <div className="mt-2 flex items-center gap-2 text-red-600 font-black text-[10px] uppercase px-2">
        <AlertCircle size={14} /> {scheduleError}
      </div>
    )}
  </div>

  <button 
    type="submit" 
    className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black text-xs hover:bg-orange-600 flex items-center justify-center gap-2 col-span-full shadow-lg transition-all"
  >
    <Plus size={16} /> ADD TO PUBLIC SCHEDULE
  </button>
</form>
              {/*<div className="space-y-4">
                {profile?.upcomingLives?.map((live) => (
                  <div key={live.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-orange-100 transition">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm text-orange-600"><Calendar size={20} /></div>
                      <div><p className="font-bold text-gray-900">{live.topic}</p><p className="text-xs text-gray-500 font-bold uppercase"><span className="text-red-500">{live.platform}</span> • {new Date(live.time).toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}</p></div>
                    </div>
                    <button onClick={() => removeSchedule(live.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>*/}
              <div className="space-y-4">
  {mySchedules.map((live) => (
    <div key={live.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="bg-white p-3 rounded-xl shadow-sm text-orange-600"><Calendar size={20} /></div>
        <div>
          <p className="font-bold text-gray-900">{live.topic}</p>
          <p className="text-xs text-gray-500 font-bold uppercase">
            <span className="text-red-500">{live.platform}</span> • {new Date(live.time).toLocaleString()}
          </p>
        </div>
      </div>
      <button onClick={() => removeSchedule(live.id)} className="text-gray-300 hover:text-red-500 transition">
        <Trash2 size={20} />
      </button>
    </div>
  ))}
</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
