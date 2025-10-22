import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, } from "firebase/firestore";
import { db } from "../components/firebase";
import { FaPlus, FaEdit, FaTrash, FaImage } from "react-icons/fa";

const Presenters = () => {
  const [presenters, setPresenters] = useState([]);
  const [shows, setShows] = useState([]);
  const [stations, setStations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPresenter, setNewPresenter] = useState({
    name: "",
    contact: "",
    photo: "",     // will hold Cloudinary URL after upload
    station: "",
    stationId: "",
    shows: [],
  });
  const [preview, setPreview] = useState(""); // local preview while uploading
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editId, setEditId] = useState(null);

  /*useEffect(() => {
    const fetchData = async () => {
      try {
        const showsSnap = await getDocs(collection(db, "shows"));
        const stationsSnap = await getDocs(collection(db, "stations"));

        setShows(showsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setStations(
          stationsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);*/

  useEffect(() => {
  const fetchData = async () => {
    try {
      const showsSnap = await getDocs(collection(db, "shows"));
      const stationsSnap = await getDocs(collection(db, "stations"));
      const presentersSnap = await getDocs(collection(db, "presenters"));

      setShows(showsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setStations(stationsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setPresenters(presentersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };
  fetchData();
}, []);


  // Upload to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    if (!file) return "";
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary env vars missing. Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET."
      );
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    // data.secure_url is the Cloudinary image URL
    return data.secure_url;
  };

  // Handle image selection — create local preview and upload to Cloudinary
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // show local preview immediately (blob) so UX feels snappy
    setPreview(URL.createObjectURL(file));

    try {
      setUploadingPhoto(true);
      const secureUrl = await uploadImageToCloudinary(file);
      // set Cloudinary URL as the presenter's photo
      setNewPresenter((prev) => ({ ...prev, photo: secureUrl }));
      // replace preview with the final URL (optional)
      setPreview(secureUrl);
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Failed to upload image. See console for details.");
      // keep the blob preview so user can re-upload if they want
    } finally {
      setUploadingPhoto(false);
    }
  };

  /*const handleAddPresenter = async (e) => {
    e.preventDefault();

    if (!newPresenter.name || !newPresenter.contact || !newPresenter.station) {
      alert("Please fill in all required fields.");
      return;
    }

    if (uploadingPhoto) {
      alert("Please wait for the image to finish uploading.");
      return;
    }

    try {
      const presenterData = {
        name: newPresenter.name,
        contact: newPresenter.contact,
        photo: newPresenter.photo || "", // Cloudinary URL (not blob)
        station: newPresenter.station,
        stationId: newPresenter.stationId || "",
        shows: newPresenter.shows,
        createdAt: new Date(),
      };

      await addDoc(collection(db, "presenters"), presenterData);

      alert("Presenter added successfully!");
      setNewPresenter({
        name: "",
        contact: "",
        photo: "",
        station: "",
        stationId: "",
        shows: [],
      });
      setPreview("");
      setShowModal(false);
    } catch (err) {
      console.error("Error saving presenter:", err);
      alert("Failed to save presenter.");
    }
  };*/

  const handleAddPresenter = async (e) => {
  e.preventDefault();
  try {
    if (!newPresenter.name || !newPresenter.contact || !newPresenter.station) {
      alert("Please fill in all required fields.");
      return;
    }

    const presenterData = {
      ...newPresenter,
      photo: preview || "",
      createdAt: new Date(),
    };

    if (editId) {
      // ✅ Edit existing presenter
      await updateDoc(doc(db, "presenters", editId), presenterData);
      alert("Presenter updated successfully!");
    } else {
      // 🆕 Add new presenter
      await addDoc(collection(db, "presenters"), presenterData);
      alert("Presenter added successfully!");
    }

    // Reset form
    setNewPresenter({
      name: "",
      contact: "",
      photo: "",
      station: "",
      shows: [],
    });
    setPreview("");
    setEditId(null);
    setShowModal(false);

    // Optional: refresh list
    window.location.reload();

  } catch (err) {
    console.error("Error saving presenter:", err);
    alert("Failed to save presenter.");
  }
};

const handleEdit = (presenter) => {
  setNewPresenter({
    name: presenter.name,
    contact: presenter.contact,
    photo: presenter.photo,
    station: presenter.station,
    shows: presenter.shows || [],
  });
  setPreview(presenter.photo || "");
  setEditId(presenter.id);
  setShowModal(true);
};


const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this presenter?")) return;
  try {
    await deleteDoc(doc(db, "presenters", id));
    alert("Presenter deleted successfully!");
    window.location.reload();
  } catch (err) {
    console.error("Error deleting presenter:", err);
    alert("Failed to delete presenter.");
  }
};

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h1 className="text-xl font-semibold text-orange-500">Presenters</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto"
        >
          <FaPlus className="mr-2" /> Add Presenter
        </button>
      </div>

         {/* Presenters List (Responsive) */}
<div className="bg-white shadow rounded-lg p-4">
  <h2 className="text-lg font-semibold text-orange-500 mb-3">Presenters</h2>

  {presenters.length === 0 ? (
    <p className="text-gray-500 text-center">Loading Presenters...</p>
  ) : (
    <div
     className="
      grid grid-cols-2 gap-3
        sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
        overflow-x-auto sm:overflow-visible
        scrollbar-thin scrollbar-thumb-gray-300
        w-full
      "
    >

      {presenters.map((presenter) => (
        <div
          key={presenter.id}
          className="
           relative bg-gray-50 border rounded-xl p-3
           flex flex-col items-center text-center hover:shadow-md transition group
           w-full sm:min-w-[180px] flex-shrink-0
           "
        >
          {/* Hover action buttons */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
            <button
              onClick={() => handleEdit(presenter)}
              className="text-blue-500 hover:text-blue-700"
              title="Edit"
            >
              <FaEdit size={14} />
            </button>
            <button
              onClick={() => handleDelete(presenter.id)}
              className="text-red-500 hover:text-red-700"
              title="Delete"
            >
              <FaTrash size={14} />
            </button>
          </div>

          {/* Presenter image */}
          <img
            src={presenter.photo || "https://via.placeholder.com/100"}
            alt={presenter.name}
            className="w-20 h-20 rounded-full object-cover mb-2"
          />

          {/* Presenter details */}
          <h3 className="font-medium text-gray-800">{presenter.name}</h3>
          <p className="text-sm text-gray-500">{presenter.contact}</p>
          <p className="text-xs text-orange-500 mt-1">{presenter.station}</p>

          {/* Shows */}
          {presenter.shows?.length > 0 && (
            <ul className="text-xs text-gray-600 mt-2">
              {presenter.shows.map((show, i) => (
                <li key={i}>• {show}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )}
</div>


      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-orange-500">
              Add Presenter
            </h2>

            <form onSubmit={handleAddPresenter} className="space-y-3">
              <div className="flex flex-col items-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover mb-2"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                    <FaImage className="text-gray-400 text-3xl" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm"
                />
                {uploadingPhoto && (
                  <p className="text-xs text-gray-500 mt-1">Uploading image…</p>
                )}
              </div>

              <input
                type="text"
                placeholder="Full Name"
                value={newPresenter.name}
                onChange={(e) =>
                  setNewPresenter({ ...newPresenter, name: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                placeholder="Contact"
                value={newPresenter.contact}
                onChange={(e) =>
                  setNewPresenter({ ...newPresenter, contact: e.target.value })
                }
                className="w-full border p-2 rounded"
              />

              {/* Station Selection */}
              <select
                value={newPresenter.station}
                onChange={(e) => {
                  const selectedStation = stations.find(
                    (st) => st.name === e.target.value
                  );
                  setNewPresenter({
                    ...newPresenter,
                    station: e.target.value,
                    stationId: selectedStation?.id || "",
                    shows: [], // reset when station changes
                  });
                }}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.name}>
                    {station.name}
                  </option>
                ))}
              </select>

              {/* Shows Selection (filtered by stationId) */}
              <div>
                <p className="font-medium text-sm mb-2">Assign Shows</p>
                <div className="grid grid-cols-2 gap-2">
                  {shows
                    .filter((show) => show.stationId === newPresenter.stationId)
                    .map((show) => (
                      <label
                        key={show.id}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          value={show.name}
                          checked={newPresenter.shows.includes(show.name)}
                          onChange={(e) => {
                            const { value, checked } = e.target;
                            if (checked) {
                              setNewPresenter({
                                ...newPresenter,
                                shows: [...newPresenter.shows, value],
                              });
                            } else {
                              setNewPresenter({
                                ...newPresenter,
                                shows: newPresenter.shows.filter(
                                  (s) => s !== value
                                ),
                              });
                            }
                          }}
                        />
                        <span>{show.name}</span>
                      </label>
                    ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingPhoto}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Presenters;
