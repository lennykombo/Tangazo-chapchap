import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaPlayCircle,
  FaFileAlt,
  FaClock,
} from "react-icons/fa";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../components/firebase";

const Ads = () => {
  const [ads, setAds] = useState([]);
  const [selectedAd, setSelectedAd] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

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

  const handleView = (ad) => {
    setSelectedAd(ad);
    setFeedback("");
    setStatus(ad.status || "Pending");
  };

  const handleClose = () => setSelectedAd(null);

  const handleAction = async (newStatus) => {
    if (!selectedAd) return;
    if (!feedback.trim()) {
      alert("⚠️ Please provide feedback before changing the status.");
      return;
    }

    try {
      const adRef = doc(db, "posts", selectedAd.id);
      await updateDoc(adRef, { status: newStatus, feedback });

      const updatedAds = ads.map((ad) =>
        ad.id === selectedAd.id ? { ...ad, status: newStatus, feedback } : ad
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
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-lg sm:text-xl font-bold text-orange-500 mb-4">
        📢 Ads Management
      </h1>

      {loading ? (
        <p className="text-gray-600">Loading posts...</p>
      ) : ads.length === 0 ? (
        <p className="text-gray-600">No ads found.</p>
      ) : (
        <div className="bg-white shadow-md rounded-xl p-4">
          {/* ✅ TABLE FOR DESKTOP */}
          <div className="hidden sm:block overflow-x-auto">
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
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleView(ad)}
                        className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg mx-auto"
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ CARD VIEW FOR MOBILE */}
          <div className="sm:hidden space-y-4">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm bg-gray-50"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {ad.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  <strong>Station:</strong> {ad.radio}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Show:</strong> {ad.show}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Presenter:</strong> {ad.presenter}
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Airtime:</strong> {ad.airtime}
                </p>
                <p
                  className={`text-sm font-semibold mt-1 ${
                    ad.status === "Approved"
                      ? "text-green-600"
                      : ad.status === "Rejected"
                      ? "text-red-500"
                      : "text-yellow-600"
                  }`}
                >
                  Status: {ad.status || "Pending"}
                </p>

                <button
                  onClick={() => handleView(ad)}
                  className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg flex justify-center items-center gap-2"
                >
                  <FaEye /> View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ MODAL */}
      {selectedAd && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:w-[90%] max-w-2xl h-[95vh] sm:h-auto p-4 sm:p-6 relative overflow-y-auto animate-fadeIn flex flex-col">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-3 text-gray-500 hover:text-gray-700 text-xl"
            >
              ✖
            </button>

            <h2 className="text-lg sm:text-2xl font-semibold mb-2 text-gray-800 text-center sm:text-left mt-2">
              {selectedAd.title}
            </h2>

            {/* Info Section */}
            <div className="text-sm sm:text-base text-gray-700 mb-4 space-y-1 bg-gray-50 p-3 rounded-lg">
              <p><strong>Station:</strong> {selectedAd.radio}</p>
              <p><strong>Show:</strong> {selectedAd.show}</p>
              <p><strong>Presenter:</strong> {selectedAd.presenter}</p>
              <p><strong>Airtime:</strong> {selectedAd.airtime}</p>
              <p>
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
            </div>

            {/* Content */}
            <div className="border-t border-gray-200 pt-3">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-base sm:text-lg">
                <FaFileAlt className="text-orange-500" /> Content
              </h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mb-4 leading-relaxed text-sm sm:text-base">
                {selectedAd.description}
              </p>

              {/* Media Preview */}
              {selectedAd.mediaUrl ? (
                selectedAd.mediaUrl.match(/\.(mp3|wav|ogg)$/i) ? (
                  <div className="bg-gray-100 p-3 rounded-lg flex flex-col sm:flex-row items-center sm:justify-between gap-3">
                    <span className="text-gray-600 flex items-center gap-2 text-sm">
                      <FaPlayCircle className="text-orange-500 text-xl" />
                      Audio Preview
                    </span>
                    <audio controls src={selectedAd.mediaUrl} className="w-full sm:w-2/3" />
                  </div>
                ) : selectedAd.mediaUrl.match(/\.(mp4|mov|avi)$/i) ? (
                  <video
                    controls
                    src={selectedAd.mediaUrl}
                    className="rounded-lg shadow-md w-full max-h-60 sm:max-h-72 object-cover"
                  />
                ) : (
                  <img
                    src={selectedAd.mediaUrl}
                    alt="Ad Media"
                    className="rounded-lg shadow-md w-full max-h-60 object-cover mx-auto"
                  />
                )
              ) : (
                <p className="text-gray-400 text-sm">No media uploaded.</p>
              )}
            </div>

            {/* Feedback */}
            <div className="mt-4 flex-1">
              <label className="block text-gray-700 font-medium mb-1">
                Feedback / Notes
              </label>
              <textarea
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your feedback here..."
                className="w-full border border-gray-300 rounded-lg p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              ></textarea>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
              <button
                onClick={() => handleAction("Approved")}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg"
              >
                <FaCheck /> Approve
              </button>

              <button
                onClick={() => handleAction("Pending")}
                className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg"
              >
                <FaClock /> Pending
              </button>

              <button
                onClick={() => handleAction("Rejected")}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
              >
                <FaTimes /> Reject
              </button>

              <button
                onClick={handleClose}
                className="flex items-center justify-center gap-2 bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
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
