import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../components/firebase";

// ✅ Cloudinary upload helper
const uploadMediaToCloudinary = async (file) => {
  if (!file) return "";

  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary env vars missing");
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`; // auto = detect type (image/video/audio)
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Cloudinary upload failed");

  const data = await res.json();
  return data.secure_url;
};

const Campaignpage = () => {
  const navigate = useNavigate();
  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // ✅ Load influencers from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("campaignInfluencers")) || [];
    setSelectedInfluencers(saved);
  }, []);

  const removeInfluencer = (id) => {
    const updated = selectedInfluencers.filter((inf) => inf.id !== id);
    setSelectedInfluencers(updated);
    localStorage.setItem("campaignInfluencers", JSON.stringify(updated));
  };

  const removeService = (influencerId, serviceName) => {
    const updatedInfluencers = selectedInfluencers.map((inf) => {
      if (inf.id === influencerId) {
        const updatedServices = inf.selectedServices.filter(
          (srv) => srv.name !== serviceName
        );
        return { ...inf, selectedServices: updatedServices };
      }
      return inf;
    });

    setSelectedInfluencers(updatedInfluencers);
    localStorage.setItem("campaignInfluencers", JSON.stringify(updatedInfluencers));
  };

  const clearCampaign = () => {
    localStorage.removeItem("campaignInfluencers");
    setSelectedInfluencers([]);
    setDescription("");
    setMediaFile(null);
    setPreviewUrl("");
  };

  const totalCampaignPrice = selectedInfluencers.reduce((sum, inf) => {
    const subtotal = inf.selectedServices
      ? inf.selectedServices.reduce((s, item) => s + item.price, 0)
      : 0;
    return sum + subtotal;
  }, 0);

  // ✅ Confirm Campaign
  const handleConfirmCampaign = async () => {
    if (selectedInfluencers.length === 0) {
      alert("⚠️ No influencers added to the campaign.");
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = "";
      if (mediaFile) {
        mediaUrl = await uploadMediaToCloudinary(mediaFile);
      }

      const campaignData = {
        influencers: selectedInfluencers,
        totalCost: totalCampaignPrice,
        description: description.trim(),
        mediaUrl,
        createdAt: serverTimestamp(),
        status: "Pending",
      };

      await addDoc(collection(db, "campaigns"), campaignData);

      alert("✅ Campaign successfully sent!");
      clearCampaign();
      navigate("/influencer");
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert("❌ Failed to save campaign. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🎯 Campaign Summary</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-orange-600 font-medium hover:underline"
        >
          ← Back to Influencers
        </button>
      </div>

      {/* Empty */}
      {selectedInfluencers.length === 0 ? (
        <div className="text-center mt-20 text-gray-600">
          <p>No influencers added yet.</p>
          <button
            onClick={() => navigate("/influencer")}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Browse Influencers
          </button>
        </div>
      ) : (
        <>
          {/* Influencer List */}
          <div className="grid gap-6">
            {selectedInfluencers.map((inf) => {
              const subtotal = inf.selectedServices
                ? inf.selectedServices.reduce((sum, s) => sum + s.price, 0)
                : 0;

              return (
                <div
                  key={inf.id}
                  className="bg-white rounded-xl shadow-md p-5 border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <img
                        src={inf.img}
                        alt={inf.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="font-semibold text-lg text-gray-800">
                          {inf.name}
                        </h2>
                        <p className="text-sm text-gray-600">@{inf.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeInfluencer(inf.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Selected Services */}
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Selected Services:
                    </h3>
                    {inf.selectedServices && inf.selectedServices.length > 0 ? (
                      <ul className="space-y-2 text-sm text-gray-600">
                        {inf.selectedServices.map((srv, i) => (
                          <li
                            key={i}
                            className="flex justify-between items-center border-b pb-1 last:border-none"
                          >
                            <span>{srv.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-800">
                                Ksh: {srv.price}
                              </span>
                              <button
                                onClick={() => removeService(inf.id, srv.name)}
                                className="text-red-500 hover:underline text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No services selected</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t mt-3 pt-3">
                    <span className="font-semibold text-gray-800">Subtotal:</span>
                    <span className="text-orange-600 font-bold">
                      Ksh: {subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Campaign Details */}
          <div className="mt-10 bg-white border rounded-xl shadow-md p-5 space-y-5">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Campaign Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your campaign goals, message, or target audience..."
                rows="4"
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Upload Media (optional)
              </label>
              <input
                type="file"
                accept="image/*,audio/*,video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setMediaFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                className="border rounded-lg w-full p-2"
              />
              {previewUrl && (
  <div className="mt-3">
    {mediaFile?.type.startsWith("image/") && (
      <img
        src={previewUrl}
        alt="Preview"
        className="w-40 h-40 object-cover rounded-lg border"
      />
    )}

    {mediaFile?.type.startsWith("video/") && (
      <video
        controls
        className="w-60 rounded-lg border"
      >
        <source src={previewUrl} type={mediaFile.type} />
        Your browser does not support the video tag.
      </video>
    )}

    {mediaFile?.type.startsWith("audio/") && (
      <audio controls className="w-full mt-2">
        <source src={previewUrl} type={mediaFile.type} />
        Your browser does not support the audio element.
      </audio>
    )}
  </div>
)}

            </div>

            {/* Total */}
            <div className="flex justify-between items-center border-t pt-4">
              <h2 className="text-xl font-bold text-gray-800">Total Cost</h2>
              <span className="text-2xl font-bold text-orange-600">
                Ksh: {totalCampaignPrice.toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={clearCampaign}
                disabled={loading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Clear All
              </button>
              <button
                onClick={handleConfirmCampaign}
                disabled={loading}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold disabled:opacity-50"
              >
                {loading ? "Saving..." : "Confirm Campaign"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Campaignpage;













/*import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../components/firebase"; // ✅ Ensure firebase is correctly initialized

const Campaignpage = () => {
  const navigate = useNavigate();
  const [selectedInfluencers, setSelectedInfluencers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load influencers from localStorage on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("campaignInfluencers")) || [];
    setSelectedInfluencers(saved);
  }, []);

  // ✅ Remove influencer
  const removeInfluencer = (id) => {
    const updated = selectedInfluencers.filter((inf) => inf.id !== id);
    setSelectedInfluencers(updated);
    localStorage.setItem("campaignInfluencers", JSON.stringify(updated));
  };

  // ✅ Remove single service
  const removeService = (influencerId, serviceName) => {
    const updatedInfluencers = selectedInfluencers.map((inf) => {
      if (inf.id === influencerId) {
        const updatedServices = inf.selectedServices.filter(
          (srv) => srv.name !== serviceName
        );
        return { ...inf, selectedServices: updatedServices };
      }
      return inf;
    });

    setSelectedInfluencers(updatedInfluencers);
    localStorage.setItem("campaignInfluencers", JSON.stringify(updatedInfluencers));
  };

  // ✅ Clear all
  const clearCampaign = () => {
    localStorage.removeItem("campaignInfluencers");
    setSelectedInfluencers([]);
  };

  // ✅ Calculate total price
  const totalCampaignPrice = selectedInfluencers.reduce((sum, inf) => {
    const subtotal = inf.selectedServices
      ? inf.selectedServices.reduce((s, item) => s + item.price, 0)
      : 0;
    return sum + subtotal;
  }, 0);

  // ✅ Confirm and post campaign to Firestore
  const handleConfirmCampaign = async () => {
    if (selectedInfluencers.length === 0) {
      alert("⚠️ No influencers added to the campaign.");
      return;
    }

    setLoading(true);
    try {
      const campaignData = {
        influencers: selectedInfluencers,
        totalCost: totalCampaignPrice,
        createdAt: serverTimestamp(),
        status: "Pending", // optional: for approval tracking
      };

      await addDoc(collection(db, "campaigns"), campaignData);

      alert("✅ Campaign successfully sent!");
      clearCampaign();
      navigate("/influencer");
    } catch (error) {
      console.error("Error saving campaign:", error);
      alert("❌ Failed to save campaign. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      {/* Header *
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🎯 Campaign Summary</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-orange-600 font-medium hover:underline"
        >
          ← Back to Influencers
        </button>
      </div>

      {/* Empty State *
      {selectedInfluencers.length === 0 ? (
        <div className="text-center mt-20 text-gray-600">
          <p>No influencers added yet.</p>
          <button
            onClick={() => navigate("/influencer")}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
          >
            Browse Influencers
          </button>
        </div>
      ) : (
        <>
          {/* Influencer List *
          <div className="grid gap-6">
            {selectedInfluencers.map((inf) => {
              const subtotal = inf.selectedServices
                ? inf.selectedServices.reduce((sum, s) => sum + s.price, 0)
                : 0;

              return (
                <div
                  key={inf.id}
                  className="bg-white rounded-xl shadow-md p-5 border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <img
                        src={inf.img}
                        alt={inf.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h2 className="font-semibold text-lg text-gray-800">
                          {inf.name}
                        </h2>
                        <p className="text-sm text-gray-600">@{inf.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeInfluencer(inf.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  {/* Selected Services *
                  <div className="mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      Selected Services:
                    </h3>
                    {inf.selectedServices && inf.selectedServices.length > 0 ? (
                      <ul className="space-y-2 text-sm text-gray-600">
                        {inf.selectedServices.map((srv, i) => (
                          <li
                            key={i}
                            className="flex justify-between items-center border-b pb-1 last:border-none"
                          >
                            <span>{srv.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-gray-800">
                                Ksh: {srv.price}
                              </span>
                              <button
                                onClick={() =>
                                  removeService(inf.id, srv.name)
                                }
                                className="text-red-500 hover:underline text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No services selected
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t mt-3 pt-3">
                    <span className="font-semibold text-gray-800">Subtotal:</span>
                    <span className="text-orange-600 font-bold">
                      Ksh: {subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total Summary *
          <div className="mt-10 bg-white border rounded-xl shadow-md p-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Total Campaign Cost
              </h2>
              <span className="text-2xl font-bold text-orange-600">
                Ksh: {totalCampaignPrice.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={clearCampaign}
                disabled={loading}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Clear All
              </button>
              <button
                onClick={handleConfirmCampaign}
                disabled={loading}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold disabled:opacity-50"
              >
                {loading ? "Saving..." : "Confirm Campaign"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Campaignpage;*/

