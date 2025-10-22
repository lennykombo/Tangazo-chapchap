import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaPlayCircle,
  FaFileAlt,
  FaClock,
} from "react-icons/fa";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../components/firebase";

const Ads = () => {
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch posts from Firestore
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const snapshot = await getDocs(collection(db, "posts"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAds(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // 🔹 View Ad
  const handleView = (ad) => {
    setSelectedAd(ad);
    setFeedback("");
    setStatus(ad.status || "Pending");
  };

  // 🔹 Close modal
  const handleClose = () => {
    setSelectedAd(null);
  };

  // 🔹 Approve / Reject / Pending
  const handleAction = async (newStatus) => {
    if (!selectedAd) return;
    if (!feedback.trim()) {
      alert("⚠️ Please provide feedback before changing the status.");
      return;
    }

    try {
      // Update Firestore
      const adRef = doc(db, "posts", selectedAd.id);
      await updateDoc(adRef, {
        status: newStatus,
        feedback,
      });

      // Update UI
      const updatedAds = ads.map((ad) =>
        ad.id === selectedAd.id
          ? { ...ad, status: newStatus, feedback }
          : ad
      );
      setAds(updatedAds);

      alert(`✅ "${selectedAd.title}" marked as ${newStatus}.`);
      setSelectedAd(null);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("❌ Failed to update status.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold text-orange-500 mb-4">
        📢 Ads Management
      </h1>

      {loading ? (
        <p className="text-gray-600">Loading posts...</p>
      ) : ads.length === 0 ? (
        <p className="text-gray-600">No ads found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-xl p-4">
          <table className="min-w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Station</th>
                <th className="py-3 px-4 text-left">Show</th>
                <th className="py-3 px-4 text-left">Presenter</th>
                <th className="py-3 px-4 text-left">Airtime</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{ad.title}</td>
                  <td className="py-3 px-4">{ad.radio}</td>
                  <td className="py-3 px-4">{ad.show}</td>
                  <td className="py-3 px-4">{ad.presenter}</td>
                  <td className="py-3 px-4">{ad.airtime}</td>
                  <td
                    className={`py-3 px-4 text-center font-semibold ${
                      ad.status === "Approved"
                        ? "text-green-600"
                        : ad.status === "Rejected"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {ad.status || "Pending"}
                  </td>
                  <td className="py-3 px-4 flex justify-center gap-3">
                    <button
                      onClick={() => handleView(ad)}
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg"
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {selectedAd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">
              {selectedAd.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Station:</strong> {selectedAd.radio} <br />
              <strong>Show:</strong> {selectedAd.show} <br />
              <strong>Presenter:</strong> {selectedAd.presenter} <br />
              <strong>Airtime:</strong> {selectedAd.airtime} <br />
              <strong>Status:</strong>{" "}
              <span
                className={`${
                  status === "Approved"
                    ? "text-green-600"
                    : status === "Rejected"
                    ? "text-red-500"
                    : "text-yellow-600"
                } font-semibold`}
              >
                {status}
              </span>
            </p>

            <div className="border-t border-gray-200 pt-3">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FaFileAlt className="text-orange-500" /> Content
              </h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mb-4 leading-relaxed">
                {selectedAd.description}
              </p>

              {/* Media Preview */}
              {selectedAd.mediaUrl ? (
                selectedAd.mediaUrl.match(/\.(mp3|wav|ogg)$/i) ? (
                  <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FaPlayCircle className="text-orange-500 text-xl" />
                      Audio Preview
                    </span>
                    <audio controls src={selectedAd.mediaUrl} className="w-2/3" />
                  </div>
                ) : selectedAd.mediaUrl.match(/\.(mp4|mov|avi)$/i) ? (
                  <video
                    controls
                    src={selectedAd.mediaUrl}
                    className="rounded-lg shadow-md max-h-60 w-full object-cover"
                  />
                ) : (
                  <img
                    src={selectedAd.mediaUrl}
                    alt="Ad Media"
                    className="rounded-lg shadow-md max-h-60 object-cover mx-auto"
                  />
                )
              ) : (
                <p className="text-gray-400 text-sm">No media uploaded.</p>
              )}
            </div>

            {/* Feedback Section */}
            <div className="mt-4">
              <label className="block text-gray-700 font-medium mb-1">
                Feedback / Notes
              </label>
              <textarea
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your feedback here before taking action..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap justify-between mt-6 gap-3">
              <button
                onClick={() => handleAction("Approved")}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg"
              >
                <FaCheck /> Approve
              </button>

              <button
                onClick={() => handleAction("Pending")}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg"
              >
                <FaClock /> Mark Pending
              </button>

              <button
                onClick={() => handleAction("Rejected")}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
              >
                <FaTimes /> Reject
              </button>

              <button
                onClick={handleClose}
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
            .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Ads;
