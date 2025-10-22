import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../components/firebase";
import { Edit, Trash2, Plus } from "lucide-react";

const Shows = () => {
  const [shows, setShows] = useState([]);
  const [stations, setStations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    stationId: "",
    startTime: "",
    endTime: "",
  });

  // 🟢 Fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      const snapshot = await getDocs(collection(db, "stations"));
      setStations(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchStations();
  }, []);

  // 🟢 Fetch shows
  useEffect(() => {
    const fetchShows = async () => {
      const snapshot = await getDocs(collection(db, "shows"));
      const showsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let stationName = "";
          if (data.stationId) {
            const stationDoc = await getDoc(doc(db, "stations", data.stationId));
            stationName = stationDoc.exists() ? stationDoc.data().name : "Unknown Station";
          }
          return { id: docSnap.id, ...data, stationName };
        })
      );
      setShows(showsData);
    };
    fetchShows();
  }, []);

  // 🟢 Handlers
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateDoc(doc(db, "shows", editId), formData);
      } else {
        await addDoc(collection(db, "shows"), formData);
      }
      setFormData({ name: "", stationId: "", startTime: "", endTime: "" });
      setEditId(null);
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      console.error("Error saving show:", err);
      alert("Failed to save show.");
    }
  };

  const handleEdit = (show) => {
    setFormData({
      name: show.name,
      stationId: show.stationId,
      startTime: show.startTime,
      endTime: show.endTime,
    });
    setEditId(show.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this show?")) {
      await deleteDoc(doc(db, "shows", id));
      setShows(shows.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <h1 className="text-lg sm:text-xl font-bold text-orange-500">🎙️ Shows</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-orange-500 text-white text-sm sm:text-base px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-600 transition w-full sm:w-auto"
        >
          <Plus size={16} /> Add Show
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto sm:overflow-x-visible">
        <table className="w-full text-left text-gray-700 text-sm sm:text-base">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="py-2 sm:py-3 px-2 sm:px-2 font-semibold">Show</th>
              <th className="py-2 sm:py-3 px-2 sm:px-2 font-semibold">Station</th>
              <th className="py-2 sm:py-3 px-2 sm:px-2 font-semibold">Time</th>
              <th className="py-2 sm:py-3 px-2 sm:px-2 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shows.map((show) => (
              <tr key={show.id} className="border-b hover:bg-gray-50">
                <td className="py-2 sm:py-3 px-2 sm:px-2 truncate">{show.name}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-2 truncate">{show.stationName}</td>
                <td className="py-2 sm:py-3 px-2 sm:px-2">
                  {show.startTime && show.endTime ? `${show.startTime} - ${show.endTime}` : "N/A"}
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-2 text-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => handleEdit(show)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(show.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {shows.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-5 text-gray-500 text-sm">
                  Loading shows....
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-3 sm:p-4 overflow-y-auto">
    <div className="bg-white w-full max-w-sm sm:max-w-md rounded-2xl shadow-xl p-5 sm:p-4 mx-auto transform transition-all scale-100">
      {/* Title */}
      <h2 className="text-lg sm:text-xl font-bold mb-4 text-orange-500 text-center">
        {editId ? "Edit Show" : "Add New Show"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Show name */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-600 mb-1">Show Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter show name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
            required
          />
        </div>

        {/* Station select */}
        <div>
          <label className="block text-xs sm:text-sm text-gray-600 mb-1">Station</label>
          <select
            name="stationId"
            value={formData.stationId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
            required
          >
            <option value="">Select Station</option>
            {stations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs sm:text-sm text-gray-600 mb-1 block">Start Time</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-2 w-full text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="text-xs sm:text-sm text-gray-600 mb-1 block">End Time</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-2 w-full text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-row sm:flex-row justify-end sm:justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setShowModal(false);
              setFormData({ name: "", stationId: "", startTime: "", endTime: "" });
              setEditId(null);
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition"
          >
            {editId ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default Shows;
