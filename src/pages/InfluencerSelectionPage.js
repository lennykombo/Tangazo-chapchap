import React, { useState, useEffect } from "react";
import { auth } from "../components/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Search, CheckCircle, X, Radio, PlayCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, orderBy,  } from "firebase/firestore";
import { db } from "../components/firebase";
import Nav from "../components/Nav";
import Footer from "../components/Footer";


// ✅ Utility functions for localStorage
const getCampaign = () => {
  const data = localStorage.getItem("campaignInfluencers");
  return data ? JSON.parse(data) : [];
};

const saveCampaign = (data) => {
  localStorage.setItem("campaignInfluencers", JSON.stringify(data));
};

// ---------- Helper: parse follower counts and format ----------
const parseFollowers = (val) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return val;

  // Normalize strings: remove commas, trim & lower
  const s = String(val).trim().replace(/,/g, "").toLowerCase();

  // Handle 'k' and 'm' suffixes
  const match = s.match(/^([\d,.]+)\s*([km])?$/i);
  if (!match) {
    // Try extracting digits
    const digits = s.match(/[\d]+/g);
    return digits ? Number(digits.join("")) : 0;
  }
  let num = parseFloat(match[1].replace(/,/g, ""));
  const suffix = match[2];

  if (suffix === "k") num = num * 1000;
  else if (suffix === "m") num = num * 1000000;

  return Math.round(num);
};

/*const formatCompact = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
};*/

const formatCompact = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
};

const serviceDisplayNames = {
  tiktokpost: "TikTok Post",
  tiktokmention: "TikTok Mention",
  facebookpost: "Facebook Post",
  facebookmention: "Facebook Mention",
  instagrampost: "Instagram Post",
  instagrammention: "Instagram Mention",
  Youtubepost: "YouTube Post",
  youtubemention: "YouTube Mention",
  promoVideo: "Promo Video",
  voiceOver: "Voice Over",

  // live packages:
  tiktoklive_shoutout: "TikTok Live Quick Mention (30-60 Secs)",
  tiktoklive_segment: "TikTok Live Product Segment (3-5 Mins)",
  tiktoklive_sponsor: "TikTok Live Sponsor (3 Mentions + Pinned Link)",
  iglive_segment: "Instagram Live Product Segment (3-5 Mins)",
  youtubelive_preroll: "YouTube Live Pre-Roll Mention (60 Secs)",
  youtubelive_midroll: "YouTube Live Mid-Roll Integration (2-3 Mins)",
  youtubelive_pinned: "YouTube Live Pinned Chat Link (Entire Stream)",
  facebooklive_mention: "Facebook Live Shoutout (60 Secs)",
  facebooklive_showcase: "Facebook Live Product Showcase (5-10 Mins)",
};

const InfluencerSelectionPage = () => {

  const provider = new GoogleAuthProvider();


  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [activeInfluencer, setActiveInfluencer] = useState(null);
  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingInfluencer, setPendingInfluencer] = useState(null);
  const [activeSchedules, setActiveSchedules] = useState([]);
  const [allLiveSessions, setAllLiveSessions] = useState([]);


  // ✅ Fetch influencers from Firestore
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "influencers"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInfluencers(data);
      } catch (error) {
        console.error("Error fetching influencers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencers();
    setSelectedInfluencers(getCampaign());
  }, []);


  useEffect(() => {
  const fetchActiveSchedules = async () => {
    if (!activeInfluencer) {
      setActiveSchedules([]); // Clear if modal is closed
      return;
    }

    try {
      // Create a query to get upcoming lives for this specific influencer
      const q = query(
        collection(db, "liveSchedules"),
        where("influencerId", "==", activeInfluencer.id),
        orderBy("time", "asc")
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveSchedules(data);
    } catch (error) {
      console.error("Error fetching schedules for this creator:", error);
    }
  };

  fetchActiveSchedules();
}, [activeInfluencer]); 


/*useEffect(() => {
  const fetchAllUpcomingLives = async () => {
    try {
      const now = new Date().toISOString();
      // Fetch all lives from the new collection
      const q = query(
        collection(db, "liveSchedules"),
        where("time", ">=", now),
        orderBy("time", "asc")
      );
      const snap = await getDocs(q);
      setAllLiveSessions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching global live schedule:", err);
    }
  };
  fetchAllUpcomingLives();
}, []);*/

useEffect(() => {
  const fetchAllUpcomingLives = async () => {
    try {
      // 🕒 Calculate a "Cutoff" time (e.g., 2 hours ago)
      // This ensures that if someone is live for 1.5 hours, the card stays up.
      const cutoff = new Date();
      cutoff.setHours(cutoff.getHours() - 2); 
      const cutoffISO = cutoff.toISOString();

      const q = query(
        collection(db, "liveSchedules"),
        where("time", ">=", cutoffISO), // Fetch sessions from 2 hours ago onwards
        orderBy("time", "asc")
      );
      
      const snap = await getDocs(q);
      const sessions = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 🧹 Local Filter: Remove sessions that are officially "Expired"
      // A session is expired if current time > (Start Time + 2 hours)
      const activeSessions = sessions.filter(session => {
        const startTime = new Date(session.time).getTime();
        const expiryTime = startTime + (2 * 60 * 60 * 1000); // 2 hours window
        return new Date().getTime() < expiryTime;
      });

      setAllLiveSessions(activeSessions);
    } catch (err) {
      console.error("Error fetching live schedule:", err);
    }
  };

  fetchAllUpcomingLives();
  
  // Refresh every 5 minutes to remove expired cards automatically
  const interval = setInterval(fetchAllUpcomingLives, 300000); 
  return () => clearInterval(interval);
}, []);

  const allNiches = Array.from(new Set(influencers.flatMap((inf) => inf.niches || [])));
  const platforms = ["All", "Instagram", "YouTube", "Twitter", "TikTok", "Facebook"];

  const filteredInfluencers = influencers.filter((inf) => {
    const matchesSearch =
      inf.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inf.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform =
      selectedPlatform === "All" ||
      (inf.socials && inf.socials[selectedPlatform.toLowerCase()]);
    const matchesNiche =
      selectedNiche === "All" || (inf.niches && inf.niches.includes(selectedNiche));
    return matchesSearch && matchesPlatform && matchesNiche;
  });

  const handleAddToCampaign = () => {
    if (!activeInfluencer) return;

    const existing = getCampaign().filter((i) => i.id !== activeInfluencer.id);
    const updated = [
      ...existing,
      {
        id: activeInfluencer.id,
        name: activeInfluencer.name,
        username: activeInfluencer.username,
        img: activeInfluencer.img,
        selectedServices: activeInfluencer.selectedServices || [],
      },
    ];

    saveCampaign(updated);
    setSelectedInfluencers(updated);
    setActiveInfluencer(null);
  };

  // Compute total followers (sum across socials) for a given influencer
  const getTotalFollowers = (inf) => {
    if (!inf || !inf.socials) return 0;
    return Object.values(inf.socials).reduce((sum, v) => sum + parseFollowers(v), 0);
  };

 /* const isLiveNow = (sessionTime) => {
  if (!sessionTime) return false;
  const startTime = new Date(sessionTime).getTime();
  const now = new Date().getTime();
  const oneHourInMs = 60 * 60 * 1000;
  
  // Returns true if the current time is between the start time and 1 hour later
  return now >= startTime && now <= (startTime + oneHourInMs);
};*/

const isLiveNow = (sessionTime) => {
  const startTime = new Date(sessionTime).getTime();
  const now = new Date().getTime();
  
  // Define "Live Now" as: Started in the last 90 minutes
  const liveWindow = 90 * 60 * 1000; 
  
  return now >= startTime && now <= (startTime + liveWindow);
};

  const handleGoogleLogin = async () => {
  try {
    await signInWithPopup(auth, provider);

    // Close modal
    setShowLoginModal(false);

    // If user clicked something before login — open it now
    if (pendingInfluencer) {
      setActiveInfluencer(pendingInfluencer);
      setPendingInfluencer(null);
    }

  } catch (error) {
    console.error("Login error:", error);
  }
};


const renderServiceItem = (name, price) => {
  // 1. Find the selected service to get the current quantity
  const selectedItem = activeInfluencer.selectedServices?.find(s => s.name === name);
  const isSelected = !!selectedItem;
  const quantity = selectedItem?.quantity || 1;

  // Dynamic label logic
  let unitLabel = "Unit"; 
  if (name.includes("post") || name.includes("mention") || name.includes("Video") || name.includes("Voice")) {
    unitLabel = quantity === 1 ? "Post" : "Posts";
  } else if (name.includes("live")) {
    unitLabel = quantity === 1 ? "Stream" : "Streams";
  } else if (name.includes("pinned") || name.includes("link")) {
    unitLabel = quantity === 1 ? "Day" : "Days";
  }

  // 2. Handle Quantity changes
  const updateQuantity = (e, delta) => {
    e.preventDefault();
    e.stopPropagation(); // ❗ CRITICAL: Prevents the label from being "clicked" and unchecking the service
    setActiveInfluencer((prev) => ({
      ...prev,
      selectedServices: (prev.selectedServices || []).map(s => 
        s.name === name ? { ...s, quantity: Math.max(1, s.quantity + delta) } : s
      )
    }));
  };

  // 3. Handle Toggle (Check/Uncheck)
  const handleToggle = () => {
    setActiveInfluencer((prev) => {
      const currentServices = prev.selectedServices || [];
      const exists = currentServices.some(s => s.name === name);

      if (exists) {
        // UNCHECK: Remove from array
        return {
          ...prev,
          selectedServices: currentServices.filter(s => s.name !== name)
        };
      } else {
        // CHECK: Add to array
        return {
          ...prev,
          selectedServices: [...currentServices, { name, price, quantity: 1 }]
        };
      }
    });
  };

  return (
    <div
      key={name}
      onClick={handleToggle} 
      className={`flex justify-between items-center cursor-pointer border-2 rounded-xl p-3 transition-all duration-200 ${
        isSelected ? "border-orange-500 bg-orange-50/50 shadow-sm" : "border-gray-100 bg-white hover:border-orange-200"
      }`}
    >
      <div className="flex flex-col flex-1">
        <span className={`text-sm font-semibold leading-tight ${isSelected ? "text-orange-900" : "text-gray-700"}`}>
          {serviceDisplayNames[name] || name}
        </span>
        <span className={`text-sm font-bold mt-1 ${isSelected ? "text-orange-600" : "text-gray-900"}`}>
          Ksh {price.toLocaleString()} <span className="text-gray-400 font-normal text-xs">/ {unitLabel.replace(/s$/, '')}</span>
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Quantity Controls */}
        {isSelected && (
          <div className="flex items-center bg-white border-2 border-orange-200 rounded-lg overflow-hidden" 
               onClick={(e) => e.stopPropagation()} // ❗ Prevents unchecking when clicking between buttons
          >
            <button 
              onClick={(e) => updateQuantity(e, -1)}
              className="px-2 py-1 hover:bg-orange-100 text-orange-600 font-bold border-r border-orange-100"
            > - </button>
            <div className="px-2 flex flex-col items-center justify-center min-w-[45px]">
              <span className="text-xs font-black text-orange-700 leading-none">{quantity}</span>
              <span className="text-[9px] text-gray-500 uppercase font-bold">{unitLabel}</span>
            </div>
            <button 
              onClick={(e) => updateQuantity(e, 1)}
              className="px-2 py-1 hover:bg-orange-100 text-orange-600 font-bold border-l border-orange-100"
            > + </button>
          </div>
        )}

        {/* The visual checkmark */}
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          isSelected ? "bg-orange-500 border-orange-500" : "border-gray-300 bg-white"
        }`}>
          {isSelected && <CheckCircle size={14} className="text-white" />}
        </div>
      </div>
    </div>
  );
};


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 relative">
      <Nav />

      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-3">Find the Right Influencer for Your Brand</h1>
        <p className="text-lg mb-8 opacity-90">
          Discover top creators across social platforms and niches.
        </p>

        <div className="max-w-lg mx-auto flex items-center bg-white rounded-full shadow-md px-4 py-2">
          <Search className="text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search influencers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-gray-700 focus:outline-none rounded-full"
          />
        </div>
      </header>

      {/* --- 🟢 NEW: HORIZONTAL LIVE SESSIONS TICKER 🟢 --- */}
{allLiveSessions.length > 0 && (
  <div className="max-w-6xl mx-auto px-6 mt-10">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
        Live Now & Upcoming
      </h2>
      <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">Scroll to explore →</span>
    </div>
    
    <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar custom-scrollbar">
      {allLiveSessions.map((session) => {
        // ⚡ 1. Check if this specific session is currently active
        const live = isLiveNow(session.time);

        return (
          <div 
            key={session.id} 
            className={`min-w-[280px] p-5 rounded-[2rem] shadow-sm border transition-all cursor-pointer group relative overflow-hidden ${
              live 
                ? "bg-red-600 border-red-500 shadow-xl shadow-red-100" 
                : "bg-white border-gray-100 hover:border-orange-200"
            }`}
            onClick={() => {
              // 🔍 2. Find the influencer object from the main list
              const inf = influencers.find(i => i.id === session.influencerId);
              if (!inf) return;

              // 🛡️ 3. SECURITY CHECK: Requires login to view profile
              if (auth.currentUser) {
                setActiveInfluencer(inf);
              } else {
                setPendingInfluencer(inf);  // Save for auto-open after login
                setShowLoginModal(true);    // Trigger Google Login modal
              }
            }}
          >
            <div className="flex justify-between items-start mb-3">
              {/* Platform Badge */}
              <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${
                live ? "bg-white/20 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {session.platform}
              </span>
              
              {/* Date */}
              <span className={`text-[10px] font-bold ${live ? "text-white/70" : "text-gray-400"}`}>
                {new Date(session.time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            {/* Topic Title */}
            <h4 className={`font-bold leading-tight mb-1 transition-colors ${
              live ? "text-white" : "text-orange-600 group-hover:text-orange-600"
            }`}>
              {session.topic}
            </h4>
            
            {/* Influencer Name */}
            <p className={`text-xs mb-4 ${live ? "text-white/80" : "text-gray-500"}`}>
              by {session.influencerName}
            </p>
            
            {/*live && (
               <a 
                href={session.liveLink} 
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()} // ❗ Prevents opening the profile modal when clicking the link
                className="mb-4 flex items-center justify-center gap-2 w-full py-2 bg-white text-red-600 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-transform"
                 >
                <PlayCircle size={14} /> Watch Stream Now
               </a>
              )*/}
              {live ? (
  <button 
    onClick={(e) => {
      e.stopPropagation(); // Prevents opening the profile modal
      
      // 🛡️ SECURITY CHECK: Check if logged in before opening the external stream
      if (auth.currentUser) {
        window.open(session.liveLink, "_blank");
      } else {
        setShowLoginModal(true); // Force them to sign in first
      }
    }}
    className="mb-4 flex items-center justify-center gap-2 w-full py-2 bg-white text-red-600 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition-transform border border-red-100"
  >
    <PlayCircle size={14} /> Watch Stream Now
  </button>
) : (
  <div className="mb-4 text-[10px] font-bold text-gray-400 bg-gray-50 p-2 rounded-xl text-center border border-gray-100">
    Waiting for start...
  </div>
)}

            <div className={`flex justify-between items-center border-t pt-3 ${
              live ? "border-white/10" : "border-gray-50"
            }`}>
              <div className="flex items-center gap-2">
                 {/* 🔴 The Status Dot */}
                 <div className={`w-2 h-2 rounded-full ${live ? "bg-white animate-ping" : "bg-gray-300"}`}></div>
                 <span className={`text-[10px] font-black uppercase tracking-tighter ${
                   live ? "text-white" : "text-gray-400"
                 }`}>
                   {live ? "LIVE NOW" : "Upcoming"}
                 </span>
              </div>

              {/* Time Label */}
              <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                live ? "bg-white text-red-600 shadow-sm" : "bg-gray-50 text-gray-800"
              }`}>
                {new Date(session.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
      {/* Filters */}
      <div className="max-w-6xl mx-auto mt-8 px-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Platform:</span>
          <select
            className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            {platforms.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Niche:</span>
          <select
            className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500"
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
          >
            <option>All</option>
            {allNiches.map((niche) => (
              <option key={niche}>{niche}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Influencer List */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Influencers</h2>

        {loading ? (
          <p className="text-gray-500 text-center mt-20">Loading influencers...</p>
        ) : filteredInfluencers.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">No influencers found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInfluencers.map((inf) => {
              const total = getTotalFollowers(inf);
              return (
                <div
                  key={inf.id}
                  className="bg-white rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={inf.img}
                      alt={inf.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold flex items-center gap-1">
                        {inf.name}
                        {inf.verified && <CheckCircle className="text-blue-500" size={16} />}
                      </h3>
                      {/*<p className="text-sm text-gray-500">
                        {inf.username} • {inf.age} yrs
                      </p>*/}
                    </div>

                    {/* Total followers badge */}
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-sm font-bold text-orange-600">
                        {formatCompact(total)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {(inf.niches || []).map((niche, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                      >
                        {niche}
                      </span>
                    ))}
                  </div>

                  {/* Small socials summary */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-4">
                    {inf.socials &&
                      Object.entries(inf.socials).map(([platform, value]) => (
                        <div key={platform} className="flex items-center gap-2">
                          <span className="font-semibold">{platform.charAt(0).toUpperCase() + platform.slice(1)}:</span>
                          <span>{formatCompact(parseFollowers(value))}</span>
                        </div>
                      ))}
                  </div>

                  <div className="mt-auto flex justify-between">
                    {/*<button
                      onClick={() => setActiveInfluencer(inf)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
                    >
                      View Profile
                    </button>*/}
                  <button
                    onClick={() => {
               if (auth.currentUser) {
      setActiveInfluencer(inf);
    } else {
      setPendingInfluencer(inf);  // Save what the user tried to open
      setShowLoginModal(true);
    }
  }}
  className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
>
  View Profile
</button>


                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* ✅ Influencer Modal */}
   {activeInfluencer && (
   <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4 sm:p-6">
    {/* MODAL BOX - Increased width to max-w-4xl for 2 columns */}
    <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full relative overflow-hidden flex flex-col max-h-[95vh]">
      
      {/* 1. NON-SCROLLING HEADER SECTION */}
      <div className="relative">
        {/* Gradient Cover */}
        <div className="h-24 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"></div>
        
        {/* Close Button */}
        <button
          onClick={() => setActiveInfluencer(null)}
          className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors backdrop-blur-md z-20"
        >
          <X size={20} />
        </button>

        {/* Profile Info Row */}
        <div className="px-6 flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-4 relative z-10">
          <img
            src={activeInfluencer.img}
            alt={activeInfluencer.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-white"
          />
          <div className="flex-1 text-center sm:text-left pb-1">
            <h2 className="text-2xl font-extrabold flex items-center justify-center sm:justify-start gap-1.5 text-gray-900 mt-3">
              {activeInfluencer.name}
              {activeInfluencer.verified && <CheckCircle className="text-blue-500" size={20} />}
            </h2>
            <p className="text-gray-500 font-medium">{activeInfluencer.username}</p>
          </div>
          <div className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm mb-1">
            Total Reach: {formatCompact(getTotalFollowers(activeInfluencer))}
          </div>
        </div>
      </div>

      {/* 2. SCROLLABLE BODY SECTION */}
      <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar bg-gray-50/30">
        
        {/* Platform Stats Summary (Smaller) */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center sm:justify-start">
           {activeInfluencer.socials && Object.entries(activeInfluencer.socials).map(([platform, value]) => (
              <div key={platform} className="px-3 py-1 bg-white border border-gray-200 rounded-lg flex items-center gap-2">
                <span className="capitalize text-[10px] text-gray-400 font-bold">{platform}</span>
                <span className="font-bold text-xs text-gray-800">{formatCompact(parseFollowers(value))}</span>
              </div>
           ))}
        </div>

        {/* --- 🟢 ADDED: LIVE SESSIONS CALENDAR 🟢 --- */}
{activeSchedules.length > 0 && (
  <div className="mb-8 p-6 bg-red-50 rounded-[2rem] border border-red-100">
    <h4 className="text-red-600 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
      <Radio size={16} className="animate-pulse" /> Upcoming Live Calendar
    </h4>
    <div className="space-y-3">
      {activeSchedules.map((live) => (
        <div key={live.id} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-red-50 shadow-sm">
          <div className="flex flex-col">
            <span className="text-sm font-black text-gray-800 leading-tight">{live.topic}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">{live.platform}</span>
             <a href={live.liveLink} target="_blank" rel="noreferrer" className="text-[9px] text-blue-500 font-bold underline flex items-center gap-1">
              Open Platform <ExternalLink size={8} />
              </a>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg">
              {new Date(live.time).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
{/* --- 🟢 END ADDED SECTION 🟢 --- */}

        {/* SERVICE GRID: LIVE ON LEFT, STANDARD ON RIGHT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: LIVE STREAMING */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Streaming Packages</p>
            </div>
            
            <div className="space-y-3">
              {Object.entries(activeInfluencer.services || {})
                .filter(([name, price]) => price > 0 && name.toLowerCase().includes("live"))
                .map(([name, price]) => renderServiceItem(name, price))}
              
              {/* Fallback if empty */}
              {Object.entries(activeInfluencer.services || {}).filter(([n, p]) => p > 0 && n.toLowerCase().includes("live")).length === 0 && (
                <p className="text-gray-400 text-xs italic text-center py-4 border border-dashed rounded-xl">No live services listed</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: STANDARD SERVICES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Standard Content</p>
            </div>

            <div className="space-y-3">
              {Object.entries(activeInfluencer.services || {})
                .filter(([name, price]) => price > 0 && !name.toLowerCase().includes("live"))
                .map(([name, price]) => renderServiceItem(name, price))}
              
              {/* Fallback if empty */}
              {Object.entries(activeInfluencer.services || {}).filter(([n, p]) => p > 0 && !n.toLowerCase().includes("live")).length === 0 && (
                <p className="text-gray-400 text-xs italic text-center py-4 border border-dashed rounded-xl">No standard services listed</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. STICKY FOOTER */}
      <div className="bg-white border-t border-gray-100 p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] block mb-1">Total Campaign Cost</span>
            <span className="text-3xl font-black text-orange-600">
              <span className="text-lg mr-1">Ksh</span>
              {activeInfluencer.selectedServices
                ? activeInfluencer.selectedServices.reduce((sum, s) => sum + (s.price * (s.quantity || 1)), 0).toLocaleString()
                : "0"}
            </span>
          </div>
          <button
            onClick={handleAddToCampaign}
            disabled={!activeInfluencer.selectedServices || activeInfluencer.selectedServices.length === 0}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-30"
          >
            Add to Campaign Box
          </button>
        </div>
      </div>
      
    </div>
  </div>
)}

      {/* Floating bar */}
      {selectedInfluencers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 flex justify-between items-center z-40">
          <p className="text-gray-700">
            <strong>{selectedInfluencers.length}</strong> influencer(s) added
          </p>
          <button
            onClick={() => navigate("/campaign")}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Proceed to Campaign
          </button>
        </div>
      )}

      {showLoginModal && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-6 w-80 text-center">
      <h2 className="text-xl font-bold mb-2 text-gray-800">Login Required</h2>
      <p className="text-gray-600 mb-5">
        Please sign in with Google to view influencer profiles.
      </p>

      <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 w-full rounded-lg hover:bg-blue-700"
      >
        <img
          src="https://www.google.com/favicon.ico"
          alt="Google"
          className="w-5 h-5"
        />
        Continue with Google
      </button>

      <button
        onClick={() => setShowLoginModal(false)}
        className="mt-4 text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </div>
  </div>
)}

    </div>
  );
};


export default InfluencerSelectionPage;

