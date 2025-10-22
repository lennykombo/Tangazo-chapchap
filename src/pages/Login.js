import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../components/firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">Admin Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
