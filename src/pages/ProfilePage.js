import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../components/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { CheckCircle, Instagram, Youtube, Twitter, Facebook, ArrowLeft, ExternalLink, Award, TrendingUp, Users, PlayCircle } from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfluencer = async () => {
      try {
        const q = query(collection(db, "influencers"), where("username", "==", username));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setInfluencer({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        }
      } catch (error) {
        console.error("Error fetching influencer profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencer();
  }, [username]);

  const handleBookNow = () => {
  // Navigate to the selection page and pass the ID of this influencer
  navigate("/influencer", { state: { autoOpenId: influencer.id } });
};

const handleBack = () => {
  navigate("/influencer");
};

  const formatCompact = (n) => {
    if (!n) return "0";
    const num = typeof n === 'string' ? parseFloat(n.replace(/[^\d.]/g, "")) : n;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;
  if (!influencer) return <div className="min-h-screen flex items-center justify-center">Influencer not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-gray-900 h-64 md:h-80">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-40" 
          alt="Banner"
        />
        <button 
          onClick={handleBack}
          className="absolute top-6 left-6 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-2 rounded-full transition"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-32 relative z-10 pb-20">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-24 md:-mt-28">
            <img 
              src={influencer.img} 
              alt={influencer.name} 
              className="w-40 h-40 md:w-48 md:h-48 rounded-[2rem] object-cover border-8 border-white shadow-xl bg-white"
            />
            <div className="flex-1 text-center md:text-left mb-4">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-4xl font-black text-gray-900">{influencer.name}</h1>
                {influencer.verified && <CheckCircle className="text-blue-500" size={28} fill="currentColor" />}
              </div>
              <p className="text-xl text-orange-600 font-bold">{influencer.username}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                {influencer.niches?.map((n, i) => (
                  <span key={i} className="bg-orange-50 text-orange-700 px-4 py-1 rounded-full text-sm font-bold border border-orange-100">
                    {n}
                  </span>
                ))}
              </div>
            </div>
            {/*<button 
              onClick={() => navigate('/influencers')}
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-orange-600 transition shadow-lg shadow-gray-200"
            >
              Book for Campaign
            </button>*/}
            <button 
              onClick={handleBookNow}
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-orange-600 transition"
               >
              Book for Campaign
            </button>
          </div>

          {/* 2. STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center">
              <Users className="mx-auto text-orange-500 mb-2" size={24} />
              <p className="text-2xl font-black text-gray-900">{influencer.engagementRate || "5.4%"}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Engagement</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center">
              <TrendingUp className="mx-auto text-blue-500 mb-2" size={24} />
              <p className="text-2xl font-black text-gray-900">{formatCompact(Object.values(influencer.socials || {}).reduce((a,b) => a + (parseInt(b) || 0), 0))}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Reach</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center">
              <Award className="mx-auto text-purple-500 mb-2" size={24} />
              <p className="text-2xl font-black text-gray-900">{influencer.previousBrands?.length || "12"}+</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Collaborations</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={24} />
              <p className="text-2xl font-black text-gray-900">100%</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Completion</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
          {/* 3. LEFT CONTENT: Portfolio & Brands */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Portfolio Gallery */}
            {/*<section>
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                Content Portfolio
                <div className="h-1 flex-1 bg-gray-100 rounded-full"></div>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Fallback items if no portfolio links exist yet *//*
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="aspect-[9/16] bg-gray-100 rounded-3xl overflow-hidden group relative cursor-pointer">
                    <img src={`https://picsum.photos/400/700?random=${i}`} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" alt="Work" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-xs font-bold flex items-center gap-1">View Post <ExternalLink size={12}/></p>
                    </div>
                  </div>
                ))}
              </div>
            </section>*/}
            {/* Portfolio Gallery */}
<section>
  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
    Content Portfolio
    <div className="h-1 flex-1 bg-gray-100 rounded-full"></div>
  </h2>
  {/*<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {influencer.portfolioLinks && influencer.portfolioLinks.length > 0 ? (
      influencer.portfolioLinks.map((link, i) => {
        // Simple platform detection for icons
        const isTikTok = link.includes("tiktok.com");
        const isInstagram = link.includes("instagram.com");
        const isYoutube = link.includes("youtube.com") || link.includes("youtu.be");

        return (
          <div 
            key={i} 
            onClick={() => window.open(link, "_blank")}
            className="aspect-[9/16] bg-gray-900 rounded-3xl overflow-hidden group relative cursor-pointer border border-gray-100 shadow-md"
          >
            {/* Dark Overlay Background *//*
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
            
            {/* Platform Icon Overlay *//*
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 transition-transform duration-500 group-hover:scale-110">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-2 border border-white/20">
                {isTikTok ? (
                   <span className="text-white font-black text-xs">TikTok</span>
                ) : isInstagram ? (
                  <Instagram className="text-white" size={24} />
                ) : isYoutube ? (
                  <Youtube className="text-white" size={24} />
                ) : (
                  <PlayCircle className="text-white" size={24} />
                )}
              </div>
              <p className="text-white/50 text-[9px] font-black uppercase tracking-widest">View Work</p>
            </div>

            {/* View Post Label (Visible on Hover) *//*
            <div className="absolute bottom-6 left-0 right-0 text-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-xs font-bold flex items-center justify-center gap-1">
                Open Original <ExternalLink size={12}/>
              </p>
            </div>
          </div>
        );
      })
    ) : (
      /* EMPTY STATE: If no links are added yet *//*
      <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
        <PlayCircle className="mx-auto text-gray-300 mb-4" size={48} />
        <p className="text-gray-400 font-bold tracking-tight">Portfolio items coming soon</p>
        <p className="text-gray-300 text-xs mt-1">Check back later to see latest collaborations</p>
      </div>
    )}
  </div>*/}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  {influencer.portfolioLinks && influencer.portfolioLinks.length > 0 ? (
    influencer.portfolioLinks.map((link, i) => {
      // 1. Detection logic for icons
      const isTikTok = link.includes("tiktok.com");
      const isInstagram = link.includes("instagram.com");
      const isYoutube = link.includes("youtube.com") || link.includes("youtu.be");

      // 2. Get the corresponding screenshot from your new array
      const screenshot = influencer.portfolioImages?.[i];

      return (
        <div 
          key={i} 
          onClick={() => window.open(link, "_blank")}
          className="aspect-[9/16] bg-gray-900 rounded-3xl overflow-hidden group relative cursor-pointer border border-gray-100 shadow-md"
        >
          {/* 🖼️ NEW: THE ACTUAL IMAGE SCREENSHOT */}
          {screenshot ? (
            <img 
              src={screenshot} 
              alt={`Work ${i + 1}`} 
              className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"
            />
          ) : (
            /* Fallback if no screenshot was uploaded */
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
               <PlayCircle className="text-white/10" size={48} />
            </div>
          )}

          {/* Dark Overlay Background - This makes the icons readable over the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>
          
          {/* Platform Icon Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 transition-transform duration-500 group-hover:scale-110">
            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-2 border border-white/20">
              {isTikTok ? (
                 <span className="text-white font-black text-[10px]">TikTok</span>
              ) : isInstagram ? (
                <Instagram className="text-white" size={24} />
              ) : isYoutube ? (
                <Youtube className="text-white" size={24} />
              ) : (
                <PlayCircle className="text-white" size={24} />
              )}
            </div>
            <p className="text-white/50 text-[9px] font-black uppercase tracking-widest">View Work</p>
          </div>

          {/* View Post Label (Visible on Hover) */}
          <div className="absolute bottom-6 left-0 right-0 text-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-xs font-bold flex items-center justify-center gap-1">
              Open Original <ExternalLink size={12}/>
            </p>
          </div>
        </div>
      );
    })
  ) : (
    /* EMPTY STATE: If no links are added yet */
    <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
      <PlayCircle className="mx-auto text-gray-300 mb-4" size={48} />
      <p className="text-gray-400 font-bold tracking-tight">Portfolio items coming soon</p>
      <p className="text-gray-300 text-xs mt-1">Check back later to see latest collaborations</p>
    </div>
  )}
</div>
</section>

            {/* Brands Worked With */}
            {/*<section>
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                Brand History
                <div className="h-1 flex-1 bg-gray-100 rounded-full"></div>
              </h2>
              <div className="flex flex-wrap gap-4">
                {influencer.previousBrands?.map((brand, i) => (
                  <div key={i} className="px-6 py-4 bg-white border border-gray-100 rounded-2xl font-black text-gray-400 shadow-sm hover:text-orange-500 transition-colors uppercase tracking-widest text-sm">
                    {brand}
                  </div>
                )) || <p className="text-gray-400 italic">History coming soon...</p>}
              </div>
            </section>*/}

              {/* Brands Worked With */}
<section>
  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
    Brand History
    <div className="h-1 flex-1 bg-gray-100 rounded-full"></div>
  </h2>
  <div className="flex flex-wrap gap-3">
    {influencer.previousBrands && influencer.previousBrands.length > 0 ? (
      influencer.previousBrands.map((brand, i) => (
        <div key={i} className="px-6 py-3 bg-white border-2 border-gray-50 rounded-2xl font-black text-gray-400 shadow-sm hover:border-orange-200 hover:text-orange-500 transition-all duration-300 uppercase tracking-widest text-[11px]">
          {brand}
        </div>
      ))
    ) : (
      <div className="w-full p-8 bg-gray-50 rounded-[2rem] text-center border border-gray-100">
        <p className="text-gray-400 text-sm font-medium italic">Verified brand history under review...</p>
      </div>
    )}
  </div>
</section>
          </div>

          {/* 4. RIGHT CONTENT: Social Channels & Services */}
          <div className="space-y-8">
            <section className="bg-gray-900 rounded-[2rem] p-8 text-white">
              <h3 className="text-xl font-black mb-6">Social Channels</h3>
              <div className="space-y-4">
                {influencer.socials?.instagram && (
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Instagram size={20} className="text-pink-500" />
                      <span className="font-bold">Instagram</span>
                    </div>
                    <span className="font-black">{formatCompact(influencer.socials.instagram)}</span>
                  </div>
                )}
                {influencer.socials?.tiktok && (
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center"><span className="text-black font-black text-[10px]">d</span></div>
                      <span className="font-bold">TikTok</span>
                    </div>
                    <span className="font-black">{formatCompact(influencer.socials.tiktok)}</span>
                  </div>
                )}
                {influencer.socials?.youtube && (
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Youtube size={20} className="text-red-500" />
                      <span className="font-bold">YouTube</span>
                    </div>
                    <span className="font-black">{formatCompact(influencer.socials.youtube)}</span>
                  </div>
                )}
              </div>
            </section>

            <section className="bg-orange-50 rounded-[2rem] p-8 border border-orange-100">
              <h3 className="text-xl font-black text-orange-900 mb-2">Hire {influencer.name.split(' ')[0]}</h3>
              <p className="text-sm text-orange-700 mb-6 font-medium">Professional content delivery within 3-5 days.</p>
              <div className="space-y-3">
                 <button 
                   onClick={handleBookNow}
                 className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black hover:bg-orange-600 transition shadow-lg shadow-orange-200">
                    Create Campaign
                 </button>
                 <button 
                   onClick={handleBookNow}
                 className="w-full py-4 bg-white text-orange-600 border border-orange-200 rounded-2xl font-black hover:bg-orange-50 transition">
                    Message US
                 </button>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;