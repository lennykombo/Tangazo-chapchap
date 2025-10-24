import React, { useState, useEffect } from "react";
import { Search, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
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

const formatCompact = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
};

// -------------------------------------------------------------

const InfluencerSelectionPage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [activeInfluencer, setActiveInfluencer] = useState(null);
  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);

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
                    <button
                      onClick={() => setActiveInfluencer(inf)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setActiveInfluencer(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={activeInfluencer.img}
                alt={activeInfluencer.name}
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-bold flex items-center gap-1">
                  {activeInfluencer.name}
                  {activeInfluencer.verified && <CheckCircle className="text-blue-500" size={18} />}
                </h2>
                <p className="text-gray-600">{activeInfluencer.username}</p>
                {/* Total followers in modal header */}
                <div className="text-sm text-gray-700 mt-1">
                  Total followers: <span className="font-semibold text-orange-600">{formatCompact(getTotalFollowers(activeInfluencer))}</span>
                </div>
              </div>
            </div>

            {/* Socials table */}
            <div className="mb-3">
              <h3 className="text-gray-800 font-semibold mb-2">Followers by Platform</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {activeInfluencer.socials ? (
                  Object.entries(activeInfluencer.socials).map(([platform, value]) => (
                    <div key={platform} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="capitalize">{platform}</span>
                      <span className="font-semibold">{formatCompact(parseFollowers(value))}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No social stats available.</p>
                )}
              </div>
            </div>

            {/* ✅ Dynamic services */}
            <div className="mb-3">
              <h3 className="text-gray-800 font-semibold mb-2">Services & Pricing</h3>
              <div className="space-y-3 text-sm text-gray-700">
                {activeInfluencer.services ? (
                  Object.entries(activeInfluencer.services).map(([name, price]) => (
                    <label
                      key={name}
                      className="flex justify-between items-center cursor-pointer border rounded-lg p-3"
                    >
                      <span>{name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600 font-semibold">Ksh: {price}</span>
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-orange-500"
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setActiveInfluencer((prev) => {
                              const updated = { ...prev };
                              updated.selectedServices = updated.selectedServices || [];
                              if (checked) {
                                updated.selectedServices = [
                                  ...updated.selectedServices.filter((s) => s.name !== name),
                                  { name, price },
                                ];
                              } else {
                                updated.selectedServices = updated.selectedServices.filter(
                                  (s) => s.name !== name
                                );
                              }
                              return updated;
                            });
                          }}
                        />
                      </div>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500">No services listed.</p>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mt-4 border-t pt-3">
              <span className="font-semibold text-gray-800 text-lg">Total:</span>
              <span className="text-xl font-bold text-orange-600">
                Ksh: 
                {activeInfluencer.selectedServices
                  ? activeInfluencer.selectedServices
                      .reduce((sum, s) => sum + s.price, 0)
                      .toFixed(2)
                  : "0.00"}
              </span>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setActiveInfluencer(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
              <button
                onClick={handleAddToCampaign}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Add to Campaign
              </button>
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
    </div>
  );
};

export default InfluencerSelectionPage;








/*import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../components/firebase";
import { Search, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

// ✅ Influencers data
const influencers = [
  {
    id: 1,
    name: "Aldous Copeland",
    username: "@aldous",
    verified: true,
    age: 28,
    niches: ["Family", "Cinema", "News"],
    socials: { instagram: "120K", youtube: "75K", twitter: "40K", tiktok: "200K" },
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Donna Carroll",
    username: "@carroll",
    verified: true,
    age: 22,
    niches: ["Travel", "Lifestyle", "Games"],
    socials: { instagram: "180K", tiktok: "350K", youtube: "95K" },
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    name: "Elizabeth Rowe",
    username: "@rowe",
    verified: true,
    age: 24,
    niches: ["Food", "Fashion", "Photography"],
    socials: { instagram: "200K", facebook: "120K", youtube: "60K" },
    img: "https://randomuser.me/api/portraits/women/55.jpg",
  },
];

const InfluencerSelectionPage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [activeInfluencer, setActiveInfluencer] = useState(null);
  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [influencers, setInfluencers] = useState([]);


  useEffect(() => {
    setSelectedInfluencers(getCampaign());
  }, []);

  const allNiches = Array.from(new Set(influencers.flatMap((inf) => inf.niches)));
  const platforms = ["All", "Instagram", "YouTube", "Twitter", "TikTok", "Facebook"];

  const filteredInfluencers = influencers.filter((inf) => {
    const matchesSearch =
      inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inf.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform =
      selectedPlatform === "All" || inf.socials[selectedPlatform.toLowerCase()];
    const matchesNiche =
      selectedNiche === "All" || inf.niches.includes(selectedNiche);
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 relative">
      <Nav />

      {/* Header *
      <header className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16 px-6 text-center">
        <h1 className="text-4xl font-bold mb-3">Find the Right Influencer for Your Brand</h1>
        <p className="text-lg mb-8 opacity-90">Discover top creators across social platforms and niches.</p>

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

      {/* Filters *
      <div className="max-w-6xl mx-auto mt-8 px-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Platform:</span>
          <select
            className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
            className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
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

      {/* Influencer List *
      <main className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Influencers</h2>

        {filteredInfluencers.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">No influencers found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInfluencers.map((inf) => (
              <div
                key={inf.id}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition p-5 flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img src={inf.img} alt={inf.name} className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-1">
                      {inf.name}
                      {inf.verified && <CheckCircle className="text-blue-500" size={16} />}
                    </h3>
                    <p className="text-sm text-gray-500">{inf.username} • {inf.age} yrs</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {inf.niches.map((niche, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">
                      {niche}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex justify-between">
                  <button
                    onClick={() => setActiveInfluencer(inf)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* ✅ Modal for Influencer *
      {activeInfluencer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => setActiveInfluencer(null)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
              ✕
            </button>

            <div className="flex items-center gap-4 mb-4">
              <img src={activeInfluencer.img} alt={activeInfluencer.name} className="w-20 h-20 rounded-full object-cover" />
              <div>
                <h2 className="text-xl font-bold flex items-center gap-1">
                  {activeInfluencer.name}
                  {activeInfluencer.verified && <CheckCircle className="text-blue-500" size={18} />}
                </h2>
                <p className="text-gray-600">{activeInfluencer.username}</p>
              </div>
            </div>

            {/* ✅ Services with checkbox logic (no double counting) *
            <div className="mb-3">
              <h3 className="text-gray-800 font-semibold mb-2">Services & Pricing</h3>
              <div className="space-y-3 text-sm text-gray-700">
                {[
                  {
                    category: "Mention",
                    options: [
                      { name: "Instagram Mention", price: 60 },
                      { name: "YouTube Mention", price: 80 },
                      { name: "TikTok Mention", price: 50 },
                      { name: "Facebook Mention", price: 45 },
                    ],
                  },
                  {
                    category: "Posting",
                    options: [
                      { name: "Instagram Post", price: 120 },
                      { name: "YouTube Feature", price: 200 },
                      { name: "TikTok Post", price: 150 },
                      { name: "Facebook Post", price: 100 },
                    ],
                  },
                  { category: "Promotional Videos / Reels", price: 180 },
                  { category: "Voice Overs", price: 150 },
                ].map((section, i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <h4 className="font-semibold mb-2 text-gray-800">{section.category}</h4>
                    {section.options ? (
                      section.options.map((opt) => (
                        <label key={opt.name} className="flex justify-between items-center cursor-pointer">
                          <span>{opt.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-blue-600 font-semibold">${opt.price}</span>
                            <input
                              type="checkbox"
                              className="w-4 h-4 accent-orange-500"
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setActiveInfluencer((prev) => {
                                  const updated = { ...prev };
                                  updated.selectedServices = updated.selectedServices || [];
                                  if (checked) {
                                    updated.selectedServices = [
                                      ...updated.selectedServices.filter((s) => s.name !== opt.name),
                                      opt,
                                    ];
                                  } else {
                                    updated.selectedServices = updated.selectedServices.filter((s) => s.name !== opt.name);
                                  }
                                  return updated;
                                });
                              }}
                            />
                          </div>
                        </label>
                      ))
                    ) : (
                      <label className="flex justify-between items-center cursor-pointer">
                        <span>{section.category}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-blue-600 font-semibold">${section.price}</span>
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-orange-500"
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setActiveInfluencer((prev) => {
                                const updated = { ...prev };
                                updated.selectedServices = updated.selectedServices || [];
                                if (checked) {
                                  updated.selectedServices = [
                                    ...updated.selectedServices.filter((s) => s.name !== section.category),
                                    { name: section.category, price: section.price },
                                  ];
                                } else {
                                  updated.selectedServices = updated.selectedServices.filter((s) => s.name !== section.category);
                                }
                                return updated;
                              });
                            }}
                          />
                        </div>
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total *
            <div className="flex justify-between items-center mt-4 border-t pt-3">
              <span className="font-semibold text-gray-800 text-lg">Total:</span>
              <span className="text-xl font-bold text-orange-600">
                $
                {activeInfluencer.selectedServices
                  ? activeInfluencer.selectedServices.reduce((sum, s) => sum + s.price, 0).toFixed(2)
                  : "0.00"}
              </span>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setActiveInfluencer(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                Close
              </button>
              <button
                onClick={handleAddToCampaign}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Add to Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating bar *
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
    </div>
  );
};

export default InfluencerSelectionPage;*/
