export const uploadToCloudinary = async (file) => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary configuration");
  }

  // 🔹 Detect file type automatically
  let resourceType = "auto";
  if (file.type.startsWith("image/")) resourceType = "image";
  else if (file.type.startsWith("video/")) resourceType = "video";
  else if (file.type.startsWith("audio/")) resourceType = "video"; // Cloudinary uses video for audio uploads too

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  const data = await response.json();
  if (!response.ok || !data.secure_url) throw new Error(data.error?.message || "Upload failed");

  return data.secure_url;
};





/*export const uploadToCloudinary = async (file, resourceType = "auto") => {
  // Load from .env file
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error("❌ Missing Cloudinary environment variables");
    throw new Error("Cloudinary config missing");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (response.ok && data.secure_url) {
      return data.secure_url;
    } else {
      console.error("Cloudinary upload error:", data);
      throw new Error(data.error?.message || "Upload failed");
    }
  } catch (err) {
    console.error("Upload failed:", err);
    throw err;
  }
};*/
