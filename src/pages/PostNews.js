import React, { useState } from "react";
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

            {/* Word Counter */}
            <p
              className={`text-sm mt-1 ${
                wordCount >= 160 ? "text-red-500 font-semibold" : "text-gray-500"
              }`}
            >
              {wordCount} / 160 words {wordCount >= 160 && "(Exceeded limit!)"}
            </p>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 text-sm font-semibold mt-1">{error}</p>
            )}
          </div>

          {/* Radio Selection */}
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

          {/* Show & Airtime */}
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

          {/* Presenter */}
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

          {/* Upload */}
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

          {/* Submit */}
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

export default PostNews;
