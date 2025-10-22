import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../components/firebase";
import { useNavigate } from "react-router-dom";

function Signup() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 

  const handleSignup = async (e) => {
  e.preventDefault();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful!");

    // ✅ Clear form fields
    setEmail("");
    setPassword("");

    // ✅ Optional: redirect to dashboard or login
    navigate("/dashboard"); // if using react-router
  } catch (error) {
    console.error(error.message);
    alert(error.message);
  }
};


  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">Create Admin Account</h2>
        {message && <p className="text-sm text-center mb-4">{message}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default Signup;
