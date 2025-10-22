import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../components/firebase"
import { uploadToCloudinary } from "../utils/CloudinaryUpload";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Terms from "./Terms";

function PostNews() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    radio: "",
    presenter: "",
    show: "",
    airtime: "",
    contact: "",
    file: null,
    previewUrl: null,
  });

  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [error, setError] = useState("");
  const [presenters, setPresenters] = useState([]);
  const [loadingPresenters, setLoadingPresenters] = useState(false);
  const [availableShows, setAvailableShows] = useState([]);
  const [loading, setLoading] = useState(false);


  // ✅ Fetch stations from Firestore
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const snapshot = await getDocs(collection(db, "stations"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStations(data);
      } catch (err) {
        console.error("Error fetching stations:", err);
        setError("Failed to load stations.");
      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, []);

  /*useEffect(() => {
  const fetchPresenters = async () => {
    if (!formData.radio) return;

    const selectedStation = stations.find((s) => s.name === formData.radio);
    if (!selectedStation?.id) return;

    setLoadingPresenters(true);

    try {
      const q = query(
        collection(db, "presenters"),
        where("stationId", "==", selectedStation.id)
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPresenters(fetched);
    } catch (err) {
      console.error("Error fetching presenters:", err);
    } finally {
      setLoadingPresenters(false);
    }
  };

  fetchPresenters();
}, [formData.radio, stations]);*/

// 🔹 Fetch presenters for the selected station
useEffect(() => {
  const fetchPresenters = async () => {
    if (!formData.radio) return;
    const selectedStation = stations.find((s) => s.name === formData.radio);
    if (!selectedStation) return;

    setLoadingPresenters(true);
    try {
      const q = query(
        collection(db, "presenters"),
        where("stationId", "==", selectedStation.id)
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPresenters(fetched);
    } catch (err) {
      console.error("Error fetching presenters:", err);
    } finally {
      setLoadingPresenters(false);
    }
  };

  fetchPresenters();
}, [formData.radio, stations]);

// 🔹 Fetch shows after selecting a presenter
useEffect(() => {
  const fetchShows = async () => {
    const selectedPresenter = presenters.find((p) => p.name === formData.presenter);
    if (!selectedPresenter || !selectedPresenter.shows?.length) return;

    try {
      const q = query(
        collection(db, "shows"),
        where("stationId", "==", selectedPresenter.stationId)
      );
      const snapshot = await getDocs(q);
      const allShows = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter to only shows this presenter hosts
      const presenterShows = allShows.filter((s) =>
        selectedPresenter.shows.includes(s.name)
      );
      setAvailableShows(presenterShows);
    } catch (err) {
      console.error("Error fetching shows:", err);
    }
  };

  fetchShows();
}, [formData.presenter, presenters]);


  // ✅ Word count logic (same as before)
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "description") {
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (words.length <= 160) {
        setFormData((prev) => ({ ...prev, description: value }));
        setError("");
      } else {
        setError("⚠️ Description not added since it exceeded 160 words.");
        const limited = words.slice(0, 160).join(" ");
        setFormData((prev) => ({ ...prev, description: limited }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const currentWords = formData.description.trim().split(/\s+/).filter(Boolean);
    const pastedWords = paste.trim().split(/\s+/).filter(Boolean);

    if (currentWords.length + pastedWords.length > 160) {
      e.preventDefault();
      setError("⚠️ Description not added since it exceeded 160 words.");
    } else {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    let uploadedUrl = null;

    // 🔹 1. Upload file if provided
    if (formData.file) {
      console.log("Uploading to Cloudinary...");
      uploadedUrl = await uploadToCloudinary(formData.file);
      console.log("✅ Uploaded:", uploadedUrl);
    }

    // 🔹 2. Build post object
    const postData = {
      title: formData.title,
      description: formData.description,
      radio: formData.radio,
      presenter: formData.presenter,
      show: formData.show,
      airtime: formData.airtime,
      contact: formData.contact,
      mediaUrl: uploadedUrl || "",
      createdAt: serverTimestamp(),
      status: "pending", // you can filter in dashboard later
    };

    // 🔹 3. Save to Firestore
    await addDoc(collection(db, "posts"), postData);

    alert("✅ Your post has been submitted for review!");
    console.log("Post saved:", postData);

    // Reset form
    setFormData({
      title: "",
      description: "",
      radio: "",
      presenter: "",
      show: "",
      airtime: "",
      contact: "",
      file: null,
      previewUrl: null,
    });
  } catch (err) {
    console.error("❌ Error submitting post:", err);
    setError("Failed to submit post. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const wordCount = formData.description.trim().split(/\s+/).filter(Boolean).length;

  // 🧡 Find selected station for display
  const selectedStation = stations.find((s) => s.name === formData.radio);

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Nav />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-500 to-orange-600 text-white text-center py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Post Your News or Ad</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
          Share your story or promote your ad — choose your radio, show, and airtime slot easily.
        </p>
      </section>

      {/* Form Section */}
      <section className="py-16 px-6 md:px-16 lg:px-32">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-6 max-w-3xl mx-auto border"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center text-orange-500">
            Submit Your Post
          </h2>

          {/* Title */}
          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter post title"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onPaste={handlePaste}
              required
              rows="5"
              placeholder="Write your story or ad details (max 160 words)..."
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-orange-500"
              }`}
            ></textarea>

            <p
              className={`text-sm mt-1 ${
                wordCount >= 160 ? "text-red-500 font-semibold" : "text-gray-500"
              }`}
            >
              {wordCount} / 160 words
            </p>

            {error && (
              <p className="text-red-600 text-sm font-semibold mt-1">{error}</p>
            )}
          </div>

          {/* ✅ Radio Station Selection (Firestore-based) */}
          <div>
            <label className="block text-gray-700 mb-2">Radio Station</label>
            {loadingStations ? (
              <p className="text-gray-500">Loading stations...</p>
            ) : (
              <select
                name="radio"
                value={formData.radio}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a radio station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.name}>
                    {station.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 🧡 Show selected station info (logo + contact) */}
          {selectedStation && (
            <div className="flex items-center space-x-4 border p-3 rounded-lg shadow-sm bg-gray-50">
              <img
                src={selectedStation.image}
                alt={selectedStation.name}
                className="w-16 h-16 object-cover rounded-full border"
              />
              <div>
                <h3 className="font-semibold text-gray-800">{selectedStation.name}</h3>
                <p className="text-sm text-gray-600">{selectedStation.contact}</p>
              </div>
            </div>
          )}

                {/* Presenter */}
<div>
  <label className="block text-gray-700 mb-2">Presenter</label>

  {loadingPresenters ? (
    <p className="text-sm text-gray-500">Loading presenters...</p>
  ) : presenters.length > 0 ? (
    <select
      name="presenter"
      value={formData.presenter}
      onChange={handleChange}
      required
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
    >
      <option value="">Select a presenter</option>
      {presenters.map((p) => (
        <option key={p.id} value={p.name}>
          {p.name}
        </option>
      ))}
    </select>
  ) : (
    <p className="text-sm text-gray-500">No presenters found for this station.</p>
  )}
</div>

{/* Show selection */}
{formData.presenter && availableShows.length > 0 && (
  <div>
    <label className="block text-gray-700 mb-2">Show</label>
    <select
      name="show"
      value={formData.show}
      onChange={(e) => {
        const value = e.target.value;
        const selected = availableShows.find((s) => s.name === value);
        setFormData((prev) => ({
          ...prev,
          show: value,
          airtime: selected ? `${selected.startTime} - ${selected.endTime}` : "",
        }));
      }}
      required
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
    >
      <option value="">Select a show</option>
      {availableShows.map((show) => (
        <option key={show.id} value={show.name}>
          {show.name} — {show.startTime} to {show.endTime}
        </option>
      ))}
    </select>
  </div>
)}


              {/* Upload Section */}
<div>
  <label className="block text-gray-700 mb-2">Upload Image or Audio (optional)</label>
  <input
    type="file"
    name="file"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, file, previewUrl }));
      }
    }}
    accept="image/*,audio/*"
    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
  />

  {/* Preview Section */}
  {formData.previewUrl && (
    <div className="mt-4 p-3 border rounded-lg bg-gray-50 text-center relative">
      {/* Remove Button */}
      <button
        type="button"
        onClick={() => {
          setFormData((prev) => ({ ...prev, file: null, previewUrl: null }));
        }}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow-md"
      >
        ✕
      </button>

      {/* Conditional Preview */}
      {formData.file?.type.startsWith("image/") ? (
        <img
          src={formData.previewUrl}
          alt="Preview"
          className="max-h-60 mx-auto rounded-lg shadow-md object-cover"
        />
      ) : formData.file?.type.startsWith("audio/") ? (
        <div className="flex flex-col items-center">
          <audio controls src={formData.previewUrl} className="w-full mt-2" />
          <p className="text-sm text-gray-500 mt-1">
            {formData.file.name}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Preview not available</p>
      )}
    </div>
  )}
</div>

          {/* Contact */}
          <div>
            <label className="block text-gray-700 mb-2">Contact Info</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              placeholder="Email or phone number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <Terms />

          <div className="flex items-start space-x-2 mt-3">
            <input
              type="checkbox"
              id="agree"
              required
              className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="agree" className="text-gray-700 text-sm">
              I have read and agree to the Terms and Conditions above.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition ${
            loading ? "opacity-60 cursor-not-allowed" : "hover:bg-orange-600"
             }`}
             >
             {loading ? "Submitting..." : "Submit Post"}
          </button>

        </form>
      </section>

      <Footer />
    </div>
  );
}

export default PostNews;






/*import React, { useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Terms from "./Terms";

function PostNews() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    radio: "",
    presenter: "",
    show: "",
    airtime: "",
    contact: "",
    file: null,
  });
  const [error, setError] = useState("");

  // Example radio stations, shows, and airtime slots
  const radioData = {
    "Radio Citizen": {
      shows: [
        { name: "Morning Express", airtimes: ["6:00 AM - 9:00 AM"] },
        { name: "Midday Vibes", airtimes: ["12:00 PM - 2:00 PM"] },
        { name: "Drive Show", airtimes: ["4:00 PM - 7:00 PM"] },
      ],
    },
    "Kiss FM": {
      shows: [
        { name: "Breakfast with Kamene", airtimes: ["7:00 AM - 10:00 AM"] },
        { name: "The Buzz", airtimes: ["1:00 PM - 3:00 PM"] },
        { name: "Evening Fix", airtimes: ["5:00 PM - 8:00 PM"] },
      ],
    },
    "Classic 105": {
      shows: [
        { name: "Maina & King’ang’i", airtimes: ["6:00 AM - 10:00 AM"] },
        { name: "Classic Drive", airtimes: ["4:00 PM - 7:00 PM"] },
      ],
    },
    "Radio Maisha": {
      shows: [
        { name: "Jambo Kenya", airtimes: ["6:00 AM - 10:00 AM"] },
        { name: "Maisha Countdown", airtimes: ["12:00 PM - 2:00 PM"] },
      ],
    },
  };

  // ✅ Handle typing with strict word limit enforcement
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "description") {
      const words = value.trim().split(/\s+/).filter(Boolean);

      // Block input beyond 160 words
      if (words.length <= 160) {
        setFormData((prev) => ({ ...prev, description: value }));
        setError("");
      } else {
        // Prevent any update beyond limit
        setError("⚠️ Description not added since it has exceeded 160 words.");
        const limited = words.slice(0, 160).join(" ");
        setFormData((prev) => ({ ...prev, description: limited }));
      }
      return;
    }

    // Handle other fields normally
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
      ...(name === "radio" ? { show: "", airtime: "" } : {}),
      ...(name === "show" ? { airtime: "" } : {}),
    }));
  };

  // ✅ Handle paste events to block if too long
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const currentWords = formData.description.trim().split(/\s+/).filter(Boolean);
    const pastedWords = paste.trim().split(/\s+/).filter(Boolean);

    if (currentWords.length + pastedWords.length > 160) {
      e.preventDefault();
      setError("⚠️ Description not added since it has exceeded 160 words.");
    } else {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted:", formData);
    alert("Your post has been submitted for review!");
  };

  const selectedRadio = formData.radio ? radioData[formData.radio] : null;
  const selectedShow =
    selectedRadio?.shows.find((s) => s.name === formData.show) || null;

  const wordCount = formData.description.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Nav />

      {/* Hero Section *
      <section className="bg-gradient-to-b from-orange-500 to-orange-600 text-white text-center py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Post Your News or Ad</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
          Share your story or promote your ad — choose your radio, show, and airtime slot easily.
        </p>
      </section>

      {/* Form Section *
      <section className="py-16 px-6 md:px-16 lg:px-32">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-6 max-w-3xl mx-auto border"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center text-orange-500">
            Submit Your Post
          </h2>

          {/* Title *
          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter post title"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Description *
          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onPaste={handlePaste}
              required
              rows="5"
              placeholder="Write your story or ad details (max 160 words)..."
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-orange-500"
              }`}
            ></textarea>

            {/* Word Counter *
            <p
              className={`text-sm mt-1 ${
                wordCount >= 160 ? "text-red-500 font-semibold" : "text-gray-500"
              }`}
            >
              {wordCount} / 160 words {wordCount >= 160 && "(Exceeded limit!)"}
            </p>

            {/* Error Message *
            {error && (
              <p className="text-red-600 text-sm font-semibold mt-1">{error}</p>
            )}
          </div>

          {/* Radio Selection *
          <div>
            <label className="block text-gray-700 mb-2">Radio Station</label>
            <select
              name="radio"
              value={formData.radio}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select a radio station</option>
              {Object.keys(radioData).map((radio) => (
                <option key={radio} value={radio}>
                  {radio}
                </option>
              ))}
            </select>
          </div>

          {/* Show & Airtime *
          {selectedRadio && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Select Show</label>
                <select
                  name="show"
                  value={formData.show}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a show</option>
                  {selectedRadio.shows.map((show) => (
                    <option key={show.name} value={show.name}>
                      {show.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Airtime Slot</label>
                <select
                  name="airtime"
                  value={formData.airtime}
                  onChange={handleChange}
                  required
                  disabled={!selectedShow}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                >
                  <option value="">Select airtime</option>
                  {selectedShow?.airtimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Presenter *
          <div>
            <label className="block text-gray-700 mb-2">Presenter</label>
            <input
              type="text"
              name="presenter"
              value={formData.presenter}
              onChange={handleChange}
              placeholder="Enter presenter’s name"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Upload *
          <div>
            <label className="block text-gray-700 mb-2">Upload Image or Audio (optional)</label>
            <input
              type="file"
              name="file"
              onChange={handleChange}
              accept="image/*,audio/*"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Contact *
          <div>
            <label className="block text-gray-700 mb-2">Contact Info</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
              placeholder="Email or phone number"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <Terms />

          <div className="flex items-start space-x-2 mt-3">
            <input
              type="checkbox"
              id="agree"
              required
              className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="agree" className="text-gray-700 text-sm">
              I have read and agree to the Terms and Conditions above.
            </label>
          </div>

          {/* Submit *
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Submit Post
          </button>
        </form>
      </section>

      <Footer />
    </div>
  );
}

export default PostNews;*/
