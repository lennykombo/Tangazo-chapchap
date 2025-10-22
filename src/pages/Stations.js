import React, { useState, useEffect } from "react";
import { Edit, Trash2, Plus, ImagePlus } from "lucide-react";
import { db } from "../components/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { uploadToCloudinary } from "../utils/CloudinaryUpload";

const Stations = () => {
  const [stations, setStations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
   // frequency: "",
    contact: "",
    image: "",
  });
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState(null);

  // 🔥 Fetch stations in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "stations"), (snapshot) => {
      setStations(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 📸 Handle Cloudinary Upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));

    setUploading(true);
    try {
      const uploadedUrl = await uploadToCloudinary(file, "image");
      setFormData({ ...formData, image: uploadedUrl });
    } catch (err) {
      alert("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  // 💾 Save to Firestore
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.image) {
    alert("Please upload a station image before saving.");
    return;
  }

  try {
    console.log("Saving station:", formData);

    if (editId) {
      const stationRef = doc(db, "stations", editId);
      await updateDoc(stationRef, formData);
      console.log("Station updated successfully");
    } else {
      const docRef = await addDoc(collection(db, "stations"), formData);
      console.log("Station added successfully with ID:", docRef.id);
    }

    // Reset
    setFormData({ name: "", contact: "", image: "" });
    setPreview("");
    setEditId(null);
    setShowModal(false);
  } catch (err) {
    console.error("🔥 Firestore save error:", err);
    alert("Failed to save station.");
  }
};


  // 🗑️ Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this station?")) {
      await deleteDoc(doc(db, "stations", id));
    }
  };

  // 🖋️ Edit
  const handleEdit = (station) => {
    setFormData(station);
    setPreview(station.image);
    setEditId(station.id);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-orange-500">Stations</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          <Plus size={18} /> Add Station
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full text-left text-gray-700">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="py-3 px-4 font-semibold">Image</th>
              <th className="py-3 px-4 font-semibold">Name</th>
              
              <th className="py-3 px-4 font-semibold">Contact</th>
              <th className="py-3 px-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => (
              <tr key={station.id} className="border-b hover:bg-gray-50 transition">
                <td className="py-3 px-4">
                  {station.image ? (
                    <img
                      src={station.image}
                      alt={station.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                      <ImagePlus size={18} />
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">{station.name}</td>
               
                <td className="py-3 px-4">{station.contact}</td>
                <td className="py-3 px-4 text-center space-x-3">
                  <button
                    onClick={() => handleEdit(station)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(station.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {stations.length === 0 && (
          <div className="p-6 text-center text-gray-500">No stations added yet.</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-orange-500">
              {editId ? "Edit Station" : "Add New Station"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Station Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              />
             
              <input
                type="text"
                name="contact"
                placeholder="Contact (e.g. 0722 000 000)"
                value={formData.contact}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              />

              {/* Upload Image */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border rounded-lg p-2"
                />
                {preview && (
                  <div className="mt-3 flex justify-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-24 h-24 rounded-lg object-cover border"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: "", contact: "", image: "" });
                    setPreview("");
                    setEditId(null);
                  }}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  disabled={uploading}
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

export default Stations;
