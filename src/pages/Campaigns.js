import React, { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../components/firebase";
import { Loader2, X } from "lucide-react";


const serviceLabels = {
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
};

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

   // ✅ Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const q = query(collection(db, "campaigns"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
     <div className="min-h-screen bg-gray-50 py-10 px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">📊 Campaigns Dashboard</h1>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center mt-20 text-gray-500">
          <Loader2 className="animate-spin mr-2" />
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center text-gray-600 mt-20">
          <p>No campaigns found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const date = campaign.createdAt?.toDate
              ? campaign.createdAt.toDate().toLocaleString()
              : "N/A";

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Campaign
                  </h2>
                  <span className="text-sm text-gray-500">{date}</span>
                </div>

                {/* Influencers Summary */}
                <p className="text-gray-600 text-sm mb-3">
                  {campaign.influencers?.length || 0} Influencers
                </p>

                {/* Total */}
                <div className="flex justify-between items-center border-t pt-3 mt-3">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="font-bold text-orange-600">
                    Ksh: {campaign.totalCost?.toFixed(2)}
                  </span>
                </div>

                {/* Status */}
                <p className="text-sm text-gray-500 mt-2">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      campaign.status === "Pending"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {campaign.status || "N/A"}
                  </span>
                </p>

                {/* View Button */}
                <button
                  onClick={() => setSelectedCampaign(campaign)}
                  className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Modal for Campaign Details */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh] animate-fadeIn">
            <button
              onClick={() => setSelectedCampaign(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Campaign Details
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {selectedCampaign.createdAt?.toDate
                ? selectedCampaign.createdAt.toDate().toLocaleString()
                : "N/A"}
            </p>

            {/* Influencers List */}
            <div className="space-y-4">
              {selectedCampaign.influencers?.map((inf, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 flex items-start justify-between"
                >
                  <div className="flex gap-3">
                    <img
                      src={inf.img}
                      alt={inf.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{inf.name}</p>
                      <p className="text-xs text-gray-500">@{inf.username}</p>

                      <ul className="mt-1 text-sm text-gray-600 list-disc pl-4">
                        {inf.selectedServices?.map((srv, idx) => (
                          <li key={idx}>
                            {serviceLabels[srv.name] ||
                                srv.name
                                 .replace(/([A-Z])/g, " $1")
                                 .replace(/^\w/, (c) => c.toUpperCase())}{" "}
                                 – <span className="font-medium">Ksh {srv.price}</span>

                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <span className="font-semibold text-orange-600 whitespace-nowrap">
                    Ksh{" "}
                    {inf.selectedServices
                      ?.reduce((sum, s) => sum + s.price, 0)
                      .toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
             {/* Campaign Description */}
{selectedCampaign.description && (
  <div className="mt-6">
    <h3 className="font-semibold text-gray-800 mb-1">Description</h3>
    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border">
      {selectedCampaign.description}
    </p>
  </div>
)}

{/* Media Preview */}
{selectedCampaign.mediaUrl && (
  <div className="mt-6">
    <h3 className="font-semibold text-gray-800 mb-2">Media Preview</h3>

    {selectedCampaign.mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
      <img
        src={selectedCampaign.mediaUrl}
        alt="Campaign Media"
        className="w-full max-h-72 object-cover rounded-lg border"
      />
    )}

    {selectedCampaign.mediaUrl.match(/\.(mp4|mov|avi|mkv|webm)$/i) && (
      <video
        controls
        className="w-full max-h-72 rounded-lg border"
      >
        <source src={selectedCampaign.mediaUrl} />
        Your browser does not support the video tag.
      </video>
    )}

    {selectedCampaign.mediaUrl.match(/\.(mp3|wav|ogg)$/i) && (
      <audio controls className="w-full mt-2">
        <source src={selectedCampaign.mediaUrl} />
        Your browser does not support the audio element.
      </audio>
    )}
  </div>
)}

            {/* Total */}
            <div className="mt-6 flex justify-between border-t pt-4">
              <span className="font-semibold text-gray-700 text-lg">Total Cost:</span>
              <span className="text-orange-600 font-bold text-lg">
                Ksh {selectedCampaign.totalCost?.toFixed(2)}
              </span>
            </div>

            <div className="mt-4 text-right">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.3s ease-in-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
