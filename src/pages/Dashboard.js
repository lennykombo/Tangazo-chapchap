import React from "react";
//import { signOut } from "firebase/auth";
//import { auth } from "../components/firebase";
//import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

function Dashboard() {
  //const navigate = useNavigate();

  /*const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };*/

   // Mock data (replace with Firestore data later)
  const stats = {
    stations: 8,
    activeShows: 22,
    presenters: 15,
    pendingAds: 5,
  };

  const adsData = [
    { week: "Week 1", ads: 10 },
    { week: "Week 2", ads: 15 },
    { week: "Week 3", ads: 8 },
    { week: "Week 4", ads: 20 },
  ];

  const upcomingShows = [
    { id: 1, title: "Morning Vibes", presenter: "DJ Karanja", time: "8:00 AM - 10:00 AM" },
    { id: 2, title: "Midday Mix", presenter: "Sarah Mwaura", time: "12:00 PM - 2:00 PM" },
    { id: 3, title: "Evening Drive", presenter: "DJ Timo", time: "5:00 PM - 7:00 PM" },
  ];

  return (
      <div className="space-y-8">
        {/* Dashboard Header */}
        <h1 className="text-xl font-bold text-orange-500">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-gray-500 font-medium">Total Stations</h2>
            <p className="text-3xl font-bold text-orange-500">{stats.stations}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-gray-500 font-medium">Active Shows</h2>
            <p className="text-3xl font-bold text-orange-500">{stats.activeShows}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-gray-500 font-medium">Presenters</h2>
            <p className="text-3xl font-bold text-orange-500">{stats.presenters}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h2 className="text-gray-500 font-medium">Pending Ads</h2>
            <p className="text-3xl font-bold text-orange-500">{stats.pendingAds}</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Ads Per Week
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={adsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ads" fill="#f97316" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Upcoming Shows Table */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Upcoming Shows
          </h2>
          <table className="min-w-full text-left text-gray-600">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 font-semibold">Show Title</th>
                <th className="py-3 px-4 font-semibold">Presenter</th>
                <th className="py-3 px-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {upcomingShows.map((show) => (
                <tr key={show.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{show.title}</td>
                  <td className="py-3 px-4">{show.presenter}</td>
                  <td className="py-3 px-4">{show.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
   
  );
}

export default Dashboard;
