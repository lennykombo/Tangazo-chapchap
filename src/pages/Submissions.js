import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, query, where, orderBy } from "firebase/firestore";
import { db } from "../components/firebase";
import { CheckCircle, XCircle, Eye, User, ExternalLink, Play, AlertCircle, ImageIcon } from "lucide-react";

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);


  const handleAction = async (subId, campaignId, action) => {
  if (action === "reject" && !rejectionReason.trim()) {
    alert("Please provide a reason for rejection.");
    return;
  }

  const confirmAction = window.confirm(`Confirm ${action}?`);
  if (!confirmAction) return;

  try {
    const subRef = doc(db, "submissions", subId);
    
    // Data to save
    const updateData = {
      status: action === "approve" ? "approved" : "rejected",
      reviewedAt: new Date(),
    };

    if (action === "reject") {
      updateData.rejectionReason = rejectionReason; // Save the reason
    }

    await updateDoc(subRef, updateData);

    if (action === "approve") {
      const campaignRef = doc(db, "campaigns", campaignId);
      await updateDoc(campaignRef, { status: "Completed" });
    }

    alert(`Work ${action} successful!`);
    setRejectionReason("");
    setIsRejecting(false);
    setSelectedSub(null);
    fetchSubmissions();
  } catch (error) {
    console.error(error);
  }
};

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // 🔥 Fetching based on your data example (status is lowercase "pending")
      const q = query(
        collection(db, "submissions"), 
        where("status", "==", "pending"), 
        orderBy("submittedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  /*const handleAction = async (subId, campaignId, action) => {
    const confirmAction = window.confirm(`Are you sure you want to ${action} this work?`);
    if (!confirmAction) return;

    try {
      // 1. Update the Submission record
      const subRef = doc(db, "submissions", subId);
      await updateDoc(subRef, { 
        status: action === "approve" ? "approved" : "rejected",
        reviewedAt: new Date()
      });

      // 2. If approved, update the Campaign to "Completed" 
      // This triggers the payment reflection on the influencer's dashboard
      if (action === "approve") {
        const campaignRef = doc(db, "campaigns", campaignId);
        await updateDoc(campaignRef, { status: "Completed" });
      }

      alert(`Work ${action === "approve" ? "Approved" : "Rejected"}!`);
      setSelectedSub(null);
      fetchSubmissions(); // Refresh the list
    } catch (error) {
      console.error("Action error:", error);
      alert("Failed to process action. Check console for details.");
    }
  };*/

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-500 font-bold">Fetching Submissions...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
            <h1 className="text-3xl font-black text-gray-900">Work Verification</h1>
            <p className="text-gray-500">Review influencer proof of work and release payments.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
                    <User size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Submitted On</p>
                    <p className="text-xs font-bold text-gray-700">
                        {sub.submittedAt?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-gray-900 leading-tight">{sub.influencerName}</h3>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">
                  Campaign: {sub.campaignId.slice(0, 10)}...
                </p>

                <div className="mt-6 space-y-3">
                  <button 
                    onClick={() => setSelectedSub(sub)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black hover:bg-orange-600 transition"
                  >
                    <Eye size={14} /> REVIEW PROOF FILES
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => handleAction(sub.id, sub.campaignId, "approve")}
                  className="flex-1 bg-green-50 text-green-600 py-3 rounded-2xl font-black text-[10px] border border-green-100 hover:bg-green-600 hover:text-white transition-all"
                >
                  APPROVE
                </button>
                <button 
                  onClick={() => handleAction(sub.id, sub.campaignId, "reject")}
                  className="flex-1 bg-red-50 text-red-600 py-3 rounded-2xl font-black text-[10px] border border-red-100 hover:bg-red-600 hover:text-white transition-all"
                >
                  REJECT
                </button>
              </div>
            </div>
          ))}
        </div>

        {submissions.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
            <CheckCircle className="mx-auto text-green-200 mb-4" size={64} />
            <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
            <p className="text-gray-400">No pending submissions require your attention.</p>
          </div>
        )}
      </div>

      {/* --- PROOF VIEWER MODAL --- */}
      {selectedSub && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] max-w-5xl w-full max-h-[95vh] overflow-y-auto relative animate-in fade-in zoom-in duration-300">
            
            <button 
              onClick={() => setSelectedSub(null)} 
              className="absolute top-6 right-6 z-10 bg-gray-100 text-gray-500 hover:text-red-500 p-2 rounded-full transition"
            >
              <XCircle size={24} />
            </button>

            <div className="p-8 sm:p-12">
                <div className="mb-8">
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        Evidence Review
                    </span>
                    <h2 className="text-3xl font-black text-gray-900 mt-2">Work by {selectedSub.influencerName}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Video Player Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        <Play size={14}/> Video Verification (15s Max)
                    </div>
                    <div className="aspect-[9/16] bg-black rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-50">
                        <video 
                            src={selectedSub.videoUrl} 
                            controls 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                </div>

                {/* Screenshot Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                        <ImageIcon size={14}/> Analytics Screenshot
                    </div>
                    <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-gray-50 bg-gray-100">
                        <img 
                            src={selectedSub.screenshotUrl} 
                            className="w-full h-auto object-contain max-h-[600px]" 
                            alt="Analytics Proof" 
                        />
                    </div>
                    <a 
                        href={selectedSub.screenshotUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center justify-center gap-2 text-orange-600 font-black text-xs hover:underline pt-2"
                    >
                        <ExternalLink size={14} /> View Original Full-Size Image
                    </a>
                </div>
                </div>

                {/* Modal Footer Actions */}
                {/*<div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                        <AlertCircle size={16} />
                        Confirm that video matches the campaign brief.
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <button 
                            onClick={() => handleAction(selectedSub.id, selectedSub.campaignId, "reject")}
                            className="flex-1 sm:flex-none px-8 py-4 font-black text-red-500 hover:bg-red-50 rounded-2xl transition"
                        >
                            REJECT WORK
                        </button>
                        <button 
                            onClick={() => handleAction(selectedSub.id, selectedSub.campaignId, "approve")}
                            className="flex-1 sm:flex-none px-12 py-4 bg-green-500 text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-600 transition"
                        >
                            APPROVE & RELEASE PAY
                        </button>
                    </div>
                </div>*/}
                <div className="mt-12 pt-8 border-t">
  {isRejecting ? (
    <div className="space-y-4 animate-in slide-in-from-bottom-4">
      <div className="bg-red-50 p-4 rounded-3xl border border-red-100">
        <label className="text-xs font-black text-red-600 uppercase tracking-widest mb-2 block">
          Why are you rejecting this work?
        </label>
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="e.g. The brand name isn't visible, or video is blurry..."
          className="w-full p-4 rounded-2xl border-none focus:ring-2 focus:ring-red-500 text-sm h-32"
        />
      </div>
      <div className="flex gap-4">
        <button onClick={() => setIsRejecting(false)} className="px-8 py-4 font-bold text-gray-400">Back</button>
        <button 
          onClick={() => handleAction(selectedSub.id, selectedSub.campaignId, "reject")}
          className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black shadow-lg"
        >
          CONFIRM REJECTION
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2 text-gray-400 italic text-sm">
        <AlertCircle size={16} /> Check if the services and quantity match the brief.
      </div>
      <div className="flex gap-4 w-full sm:w-auto">
        <button 
          onClick={() => setIsRejecting(true)} // Open the reason box
          className="flex-1 sm:flex-none px-8 py-4 font-black text-red-500 hover:bg-red-50 rounded-2xl transition"
        >
          REJECT WORK
        </button>
        <button 
          onClick={() => handleAction(selectedSub.id, selectedSub.campaignId, "approve")}
          className="flex-1 sm:flex-none px-12 py-4 bg-green-500 text-white rounded-2xl font-black shadow-xl shadow-green-100 hover:bg-green-600 transition"
        >
          APPROVE & RELEASE PAY
        </button>
      </div>
    </div>
  )}
</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;