import React, { useState } from "react";
import { auth, db } from "../components/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, deleteDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { UserCircle, Lock, Mail, ArrowRight } from "lucide-react";

const InfluencerSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create the Auth Account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Check if an Admin already created a placeholder for this email
      const q = query(collection(db, "influencers"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // MATCH FOUND: Move the data to the new UID
        const existingDoc = querySnapshot.docs[0];
        const existingData = existingDoc.data();

        await setDoc(doc(db, "influencers", user.uid), {
          ...existingData,
          uid: user.uid,
          claimed: true,
          joinedAt: new Date(),
        });

        // Delete the old placeholder document
        await deleteDoc(doc(db, "influencers", existingDoc.id));
      } else {
        // NO MATCH: Create a fresh influencer profile
        await setDoc(doc(db, "influencers", user.uid), {
          email: email,
          uid: user.uid,
          claimed: true,
          name: email.split("@")[0], // Default name from email
          joinedAt: new Date(),
          services: {},
          socials: {},
        });
      }

      navigate("/influencer/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle className="text-orange-600" size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Join as Creator</h2>
          <p className="text-gray-500 mt-2">Claim your profile and start earning</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs mb-4 border border-red-100">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Create Password"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 group"
          >
            {loading ? "Processing..." : "Claim My Profile"}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 text-sm">
          Already have an account? <Link to="/login" className="text-orange-600 font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default InfluencerSignup;