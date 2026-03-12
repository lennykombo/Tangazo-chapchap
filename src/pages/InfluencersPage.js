import React, { useState, useEffect } from "react";
import { db } from "../components/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";



const serviceLabels = {
  tiktokpostPrice: "TikTok Post Price",
  tiktokmentionPrice: "TikTok Mention Price",
  facebookpostPrice: "Facebook Post Price",
  facebookmentionPrice: "Facebook Mention Price",
  instagrampostPrice: "Instagram Post Price",
  instagrammentionPrice: "Instagram Mention Price",
  YoutubepostPrice: "YouTube Post Price",
  youtubementionPrice: "YouTube Mention Price",
  promoVideoPrice: "Promo Video Price",
  voiceOverPrice: "Voice Over Price",
  tiktoklive_shoutoutPrice: "TikTok Live Quick Mention (30-60s)",
  tiktoklive_segmentPrice: "TikTok Live Product Segment (3-5m)",
  tiktoklive_sponsorPrice: "TikTok Live Sponsor",
  iglive_segmentPrice: "Instagram Live Segment (3-5m)",
  youtubelive_prerollPrice: "YouTube Live Pre-Roll (60s)",
  youtubelive_midrollPrice: "YouTube Live Mid-Roll (2-3m)",
  youtubelive_pinnedPrice: "YouTube Live Pinned Link",
  facebooklive_mentionPrice: "Facebook Live Shoutout (60s)",
  facebooklive_showcasePrice: "Facebook Live Showcase (5-10m)",
};


const serviceDisplayNames = {
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
  tiktoklive_shoutout: "TikTok Live Quick Mention",
  tiktoklive_segment: "TikTok Live Product Segment",
  tiktoklive_sponsor: "TikTok Live Sponsor",
  iglive_segment: "Instagram Live Product Segment",
  youtubelive_preroll: "YouTube Live Pre-Roll",
  youtubelive_midroll: "YouTube Live Mid-Roll",
  youtubelive_pinned: "YouTube Live Pinned Link",
  facebooklive_mention: "Facebook Live Shoutout",
  facebooklive_showcase: "Facebook Live Showcase",
};


const Influencers = () => {
  const [influencers, setInfluencers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewInfluencer, setViewInfluencer] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "", 
    password: "",
    verified: false,
    age: "",
    niches: "",
    instagram: "",
    youtube: "",
    twitter: "",
    tiktok: "",
    facebook: "",
    imgFile: null,
    tiktokmentionPrice: "",
    facebookmentionPrice: "",
    instagrammentionPrice: "",
    youtubementionPrice: "",
    facebookpostPrice: "",
    instagrampostPrice: "",
    YoutubepostPrice: "",
    tiktokpostPrice: "",
    promoVideoPrice: "",
    voiceOverPrice: "",
    tiktoklive_shoutoutPrice: "",
  tiktoklive_segmentPrice: "",
  tiktoklive_sponsorPrice: "",
  iglive_segmentPrice: "",
  youtubelive_prerollPrice: "",
  youtubelive_midrollPrice: "",
  youtubelive_pinnedPrice: "",
  facebooklive_mentionPrice: "",
  facebooklive_showcasePrice: "",
  });

  // Load influencers
  useEffect(() => {
    const fetchInfluencers = async () => {
      const snapshot = await getDocs(collection(db, "influencers"));
      setInfluencers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchInfluencers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  // Upload image to Cloudinary (for CRA)
  const uploadImageToCloudinary = async (file) => {
    if (!file) return "";
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset)
      throw new Error("Missing Cloudinary env vars. Please check .env");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  };

  // 💾 Submit and save to Firebase
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    let imageUrl = formData.img || ""; // If editing, keep old image if not changed

    // 🖼️ Upload to Cloudinary only if a new file was selected
    if (formData.imgFile) {
      imageUrl = await uploadImageToCloudinary(formData.imgFile);
    }

    const influencerData = {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      claimed: false, 
      verified: formData.verified,
      age: formData.age,
      niches: formData.niches
        ? formData.niches.split(",").map((n) => n.trim())
        : [],
      socials: {
        instagram: formData.instagram,
        youtube: formData.youtube,
        twitter: formData.twitter,
        tiktok: formData.tiktok,
        facebook: formData.facebook,
      },
      services: {
        tiktokmention: Number(formData.tiktokmentionPrice) || 0,
        facebookmention: Number(formData.facebookmentionPrice) || 0,
        instagrammention: Number(formData.instagrammentionPrice) || 0,
        youtubemention: Number(formData.youtubementionPrice) || 0,
        facebookpost: Number(formData.facebookpostPrice) || 0,
        instagrampost: Number(formData.instagrampostPrice) || 0,
        Youtubepost: Number(formData.YoutubepostPrice) || 0,
        tiktokpost: Number(formData.tiktokpostPrice) || 0,
        promoVideo: Number(formData.promoVideoPrice) || 0,
        voiceOver: Number(formData.voiceOverPrice) || 0,

         tiktoklive_shoutout: Number(formData.tiktoklive_shoutoutPrice) || 0,
        tiktoklive_segment: Number(formData.tiktoklive_segmentPrice) || 0,
        tiktoklive_sponsor: Number(formData.tiktoklive_sponsorPrice) || 0,
        iglive_segment: Number(formData.iglive_segmentPrice) || 0,
        youtubelive_preroll: Number(formData.youtubelive_prerollPrice) || 0,
        youtubelive_midroll: Number(formData.youtubelive_midrollPrice) || 0,
        youtubelive_pinned: Number(formData.youtubelive_pinnedPrice) || 0,
        facebooklive_mention: Number(formData.facebooklive_mentionPrice) || 0,
        facebooklive_showcase: Number(formData.facebooklive_showcasePrice) || 0,
      },
      img: imageUrl || "https://via.placeholder.com/100", // fallback if missing
      createdAt: new Date(),
    };

    if (editingId) {
      // ✏️ Update existing influencer
      await updateDoc(doc(db, "influencers", editingId), influencerData);
      setInfluencers((prev) =>
        prev.map((inf) =>
          inf.id === editingId ? { id: editingId, ...influencerData } : inf
        )
      );
    } else {
      // ➕ Add new influencer
      const docRef = await addDoc(collection(db, "influencers"), influencerData);
      setInfluencers((prev) => [
        ...prev,
        { id: docRef.id, ...influencerData },
      ]);
    }

    resetForm();
  } catch (err) {
    console.error("Error saving influencer:", err);
  }
};


  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      verified: false,
      age: "",
      niches: "",
      instagram: "",
      youtube: "",
      twitter: "",
      tiktok: "",
      facebook: "",
      imgFile: null,
      tiktokmentionPrice: "",
      facebookmentionPrice: "",
      instagrammentionPrice: "",
      youtubementionPrice: "",
      facebookpostPrice: "",
      instagrampostPrice: "",
      YoutubepostPrice: "",
      tiktokpostPrice: "",
      promoVideoPrice: "",
      voiceOverPrice: "",

      tiktoklive_shoutoutPrice: "",
    tiktoklive_segmentPrice: "",
    tiktoklive_sponsorPrice: "",
    iglive_segmentPrice: "",
    youtubelive_prerollPrice: "",
    youtubelive_midrollPrice: "",
    youtubelive_pinnedPrice: "",
    facebooklive_mentionPrice: "",
    facebooklive_showcasePrice: "",
    });
    setPreviewUrl("");
    setShowModal(false);
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "influencers", id));
    setInfluencers((prev) => prev.filter((i) => i.id !== id));
  };

 const handleEdit = (inf) => {
  setFormData({
    ...inf,
    niches: inf.niches ? inf.niches.join(", ") : "",
    instagram: inf.socials?.instagram || "",
    youtube: inf.socials?.youtube || "",
    twitter: inf.socials?.twitter || "",
    tiktok: inf.socials?.tiktok || "",
    facebook: inf.socials?.facebook || "",
    // 🔹 Map services into form fields for editing
    tiktokmentionPrice: inf.services?.tiktokmention || "",
    facebookmentionPrice: inf.services?.facebookmention || "",
    instagrammentionPrice: inf.services?.instagrammention || "",
    youtubementionPrice: inf.services?.youtubemention || "",
    facebookpostPrice: inf.services?.facebookpost || "",
    instagrampostPrice: inf.services?.instagrampost || "",
    YoutubepostPrice: inf.services?.Youtubepost || "",
    tiktokpostPrice: inf.services?.tiktokpost || "",
    promoVideoPrice: inf.services?.promoVideo || "",
    voiceOverPrice: inf.services?.voiceOver || "",

     tiktoklive_shoutoutPrice: inf.services?.tiktoklive_shoutout || "",
    tiktoklive_segmentPrice: inf.services?.tiktoklive_segment || "",
    tiktoklive_sponsorPrice: inf.services?.tiktoklive_sponsor || "",
    iglive_segmentPrice: inf.services?.iglive_segment || "",
    youtubelive_prerollPrice: inf.services?.youtubelive_preroll || "",
    youtubelive_midrollPrice: inf.services?.youtubelive_midroll || "",
    youtubelive_pinnedPrice: inf.services?.youtubelive_pinned || "",
    facebooklive_mentionPrice: inf.services?.facebooklive_mention || "",
    facebooklive_showcasePrice: inf.services?.facebooklive_showcase || "",
    
    imgFile: null, // reset file input
    img: inf.img || "", // keep existing image URL
  });

  // 🔹 Set preview to existing image URL
  setPreviewUrl(inf.img || "");
  setEditingId(inf.id);
  setShowModal(true);
};



  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-500">Influencers</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow"
        >
          + Add Influencer
        </button>
      </div>

          {/* Influencers List (Responsive Table) */}
<div className="bg-white rounded-2xl shadow-md border border-orange-100 mt-6">
  {/* Desktop Table */}
  <div className="hidden sm:block overflow-x-auto">
    <table className="min-w-full border-collapse">
      <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <tr>
          <th className="py-3 px-4 text-left font-semibold">Image</th>
          <th className="py-3 px-4 text-left font-semibold">Name</th>
          <th className="py-3 px-4 text-left font-semibold">Followers</th>
          <th className="py-3 px-4 text-left font-semibold">Status</th>
          <th className="py-3 px-4 text-center font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {influencers.length > 0 ? (
          influencers.map((inf) => {
            const totalFollowers = Object.values(inf.socials || {}).reduce((sum, val) => {
              const num = parseFloat(val.replace(/[^\d.]/g, ""));
              return sum + (val.includes("k") ? num * 1000 : num);
            }, 0);

            return (
              <tr key={inf.id} className="hover:bg-orange-50 border-b border-gray-100 transition-colors">
                <td className="py-3 px-4">
                  <img
                    src={inf.img}
                    alt={inf.name}
                    className="w-12 h-12 rounded-full object-cover border border-orange-200"
                  />
                </td>
                <td className="py-3 px-4 font-medium text-gray-800 flex items-center gap-2">
                  {inf.name}
                  {inf.verified && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      ✔
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-700 font-semibold">
                  {totalFollowers.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  {inf.claimed ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Joined</span>
                     ) : (
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-bold">Pending</span>
                   )}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setViewInfluencer(inf)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(inf)}
                      className="border border-orange-400 text-orange-600 hover:bg-orange-50 px-3 py-1 rounded-lg text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(inf.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="4" className="text-center py-6 text-gray-500">
              No influencers found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Mobile Cards */}
  <div className="sm:hidden divide-y divide-gray-200">
    {influencers.length > 0 ? (
      influencers.map((inf) => {
        const totalFollowers = Object.values(inf.socials || {}).reduce((sum, val) => {
          const num = parseFloat(val.replace(/[^\d.]/g, ""));
          return sum + (val.includes("k") ? num * 1000 : num);
        }, 0);

        return (
          <div key={inf.id} className="p-4 flex flex-col gap-3 hover:bg-orange-50 transition">
            <div className="flex items-center gap-3">
              <img
                src={inf.img}
                alt={inf.name}
                className="w-14 h-14 rounded-full border border-orange-200 object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800 flex items-center gap-1">
                  {inf.name}
                  {inf.verified && (
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      ✔
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">@{inf.username}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 font-medium">
              Followers: <span className="text-orange-600">{totalFollowers.toLocaleString()}</span>
            </p>

            <div className="mt-1">
              {inf.claimed ? (
             <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Account Joined</span>
               ) : (
             <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">Pending Claim</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewInfluencer(inf)}
                className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs flex-1"
              >
                View
              </button>
              <button
                onClick={() => handleEdit(inf)}
                className="border border-orange-400 text-orange-600 px-3 py-1 rounded-lg text-xs flex-1"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(inf.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })
    ) : (
      <p className="text-center py-6 text-gray-500">No influencers found</p>
    )}
  </div>
</div>


      {/* Modal for Add/Edit */}
{showModal && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
      {/* Close Button */}
      <button
        onClick={resetForm}
        className="absolute right-4 top-3 text-orange-600 text-2xl font-bold hover:text-orange-700 transition"
      >
        ✖
      </button>

      <h3 className="text-2xl font-semibold text-center mb-5 text-orange-500">
        {editingId ? "Edit Influencer" : "Add New Influencer"}
      </h3>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* --- Basic Info --- */}
        <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
    <input
      name="email"
      type="email"
      value={formData.email}
      onChange={handleChange}
      placeholder="influencer@email.com"
      className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-orange-400"
      required
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
    <input
      name="password"
      type="password"
      value={formData.password}
      onChange={handleChange}
      placeholder="Min 6 characters"
      className="border p-2 rounded-lg w-full focus:ring-2 focus:ring-orange-400"
      required={!editingId} // Only required when adding new, not editing
    />
  </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username (@handle)</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            name="age"
            type="number"
            value={formData.age}
            onChange={handleChange}
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Niches (comma separated)</label>
          <input
            name="niches"
            value={formData.niches}
            onChange={handleChange}
            className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <label className="flex items-center space-x-2 col-span-full">
          <input
            type="checkbox"
            name="verified"
            checked={formData.verified}
            onChange={handleChange}
          />
          <span className="text-gray-700">Verified</span>
        </label>

        {/* --- Image Upload --- */}
        <div className="col-span-full">
  <label className="block mb-1 font-medium">Profile Image</label>
  <input
    type="file"
    name="imgFile"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        setFormData((prev) => ({ ...prev, imgFile: file }));
        setPreviewUrl(URL.createObjectURL(file)); // temporary preview
      }
    }}
    className="border p-2 rounded w-full"
  />

  {/* Show preview if either a file was selected or an image already exists */}
  {(previewUrl || formData.img) && (
    <div className="mt-2 flex justify-center">
      <img
        src={previewUrl || formData.img}
        alt="Preview"
        className="w-24 h-24 rounded-full object-cover border shadow"
      />
    </div>
  )}
 </div>


        {/* --- Social Followers --- */}
        <h4 className="col-span-full font-semibold mt-4 text-gray-700">
          Social Followers
        </h4>
        {["instagram", "youtube", "twitter", "tiktok", "facebook"].map((platform) => (
          <div key={platform}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {platform} Followers
            </label>
            <input
              name={platform}
              value={formData[platform]}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        ))}

        {/* --- Service Pricing --- */}
        <h4 className="col-span-full font-semibold mt-4 text-gray-700">
          Service Pricing (KSH)
        </h4>
        {/*[
          "tiktokmentionPrice",
          "facebookmentionPrice",
          "instagrammentionPrice",
          "youtubementionPrice",
          "facebookpostPrice",
          "instagrampostPrice",
          "YoutubepostPrice",
          "tiktokpostPrice",
          "promoVideoPrice",
          "voiceOverPrice",
        ].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {serviceLabels[field] || field}
            </label>
            <input
              type="number"
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        ))*/}
        {/* --- Standard Service Pricing --- */}
        <h4 className="col-span-full font-bold mt-6 text-orange-600 border-b pb-2">
          Standard Service Pricing (KSH)
        </h4>
        {[
          "tiktokmentionPrice",
          "facebookmentionPrice",
          "instagrammentionPrice",
          "youtubementionPrice",
          "facebookpostPrice",
          "instagrampostPrice",
          "YoutubepostPrice",
          "tiktokpostPrice",
          "promoVideoPrice",
          "voiceOverPrice",
        ].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {serviceLabels[field] || field}
            </label>
            <input
              type="number"
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        ))}

        {/* --- Live Streaming Services --- */}
        <h4 className="col-span-full font-bold mt-6 text-red-600 border-b pb-2">
          Live Streaming Services (KSH)
        </h4>
        {[
          "tiktoklive_shoutoutPrice",
          "tiktoklive_segmentPrice",
          "tiktoklive_sponsorPrice",
          "iglive_segmentPrice",
          "youtubelive_prerollPrice",
          "youtubelive_midrollPrice",
          "youtubelive_pinnedPrice",
          "facebooklive_mentionPrice",
          "facebooklive_showcasePrice"
        ].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {serviceLabels[field] || field}
            </label>
            <input
              type="number"
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        ))}

        <button
          type="submit"
          className="col-span-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition"
        >
          {editingId ? "Update Influencer" : "Save Influencer"}
        </button>
      </form>
    </div>
  </div>
)}



      {/* View Modal */}
{viewInfluencer && (
  <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full relative overflow-y-auto max-h-[90vh] border border-orange-100">
      {/* Close Button */}
      <button
        onClick={() => setViewInfluencer(null)}
        className="absolute top-4 right-4 text-gray-500 hover:text-orange-600 text-2xl"
      >
        ✖
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-2xl py-6 text-center">
        <img
          src={viewInfluencer.img}
          alt={viewInfluencer.name}
          className="w-28 h-28 rounded-full object-cover border-4 border-white mx-auto shadow-lg"
        />
        <h3 className="text-2xl font-bold mt-3 flex justify-center items-center gap-2">
          {viewInfluencer.name}
          {viewInfluencer.verified && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">
              ✔ Verified
            </span>
          )}
        </h3>
        <p className="text-white/90">{viewInfluencer.username}</p>
        <p className="text-white/70 text-sm mt-1">
          Age: {viewInfluencer.age || "N/A"} •{" "}
          {viewInfluencer.createdAt?.toDate
            ? viewInfluencer.createdAt.toDate().toLocaleString()
            : "Recently Added"}
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Niches */}
        <div>
          <h4 className="text-lg font-semibold text-orange-600 mb-2">Niches</h4>
          <div className="flex flex-wrap gap-2">
            {viewInfluencer.niches?.length > 0 ? (
              viewInfluencer.niches.map((n, i) => (
                <span
                  key={i}
                  className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                >
                  {n}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No niches listed</p>
            )}
          </div>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-lg font-semibold text-orange-600 mb-2">Social Followers</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(viewInfluencer.socials || {}).map(([platform, value]) => (
              <div
                key={platform}
                className="bg-gray-50 border border-gray-100 rounded-lg p-3 shadow-sm text-center"
              >
                <p className="text-sm font-medium capitalize text-gray-700">
                  {platform}
                </p>
                <p className="text-lg font-bold text-orange-600">{value || "N/A"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-lg font-semibold text-orange-600 mb-3">
            Service Pricing (Ksh)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(viewInfluencer.services || {}).map(([service, price]) => (
  <div
    key={service}
    className="flex justify-between items-center bg-gray-50 border border-gray-100 p-3 rounded-lg shadow-sm"
  >
    <span className="text-gray-700 font-medium">
      {/*serviceLabels[service] || service*/}
        {serviceDisplayNames[service] || service}
    </span>
    <span className="font-semibold text-orange-600">
      Ksh: {price || 0}
    </span>
  </div>
))}

          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => setViewInfluencer(null)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Influencers;
