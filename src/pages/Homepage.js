import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Nav from "../components/Nav";

gsap.registerPlugin(ScrollTrigger);

function Homepage() {

 const sectionsRef = useRef([]);
 const navigate = useNavigate();

  useEffect(() => {
    sectionsRef.current.forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 40,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
        },
      });
      gsap.to(section, {
  opacity: 1,
  y: 0,
  duration: 1,
  scrollTrigger: {
    trigger: section,
    start: "top 85%",
  },
});

    });
  }, []);

  const setRefs = (el, i) => {
    sectionsRef.current[i] = el;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ===== HEADER ===== */}
      <Nav/>

      {/* ===== HERO SECTION ===== */}
      <section 
       ref={(el) => setRefs(el, 0)}
      className="text-center py-20 bg-orange-50 px-4 md:px-0">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Empowering Communities <br />
          <span className="text-orange-500 italic">Through Through Media</span>
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          HustleWave360 connects voices to the airwaves — allowing anyone to share
          news, stories, and promotions directly to partnering radio and influencer marketing.
          We make advertising accessible, digital, and community-driven — bridging traditional media with modern influence.
        </p>
        <div className="mt-8 space-x-4">
          <button 
          onClick={() => navigate("/post-news")}
          className="bg-orange-500 text-white px-6 py-3 m-1 rounded-lg hover:bg-orange-600">
            Submit Ad /Story
          </button>
         {/* <button 
            onClick={() => navigate("/post-news")}
            className="border border-orange-500 text-orange-500 px-6 py-3 rounded-lg hover:bg-orange-100">
            Share Story
          </button>*/}
           <button 
            onClick={() => navigate("/influencer")}
            className="bg-orange-500 text-white px-6 py-3 m-1 rounded-lg hover:bg-orange-600">
            Create Influencer Campaign
          </button>
        </div>
      </section>

      {/* ===== WHAT WE DO ===== */}
      <section ref={(el) => setRefs(el, 0)} className="px-6 md:px-12 py-16 text-center">
        <h3 className="text-3xl font-semibold mb-6">What We Do</h3>
        <p className="text-gray-600 max-w-3xl mx-auto">
          At <span className="text-orange-500 font-semibold">HustleWave360</span>, we bridge the gap between communities, broadcasters, and brands.
          Our platform empowers people, businesses, and organizations to share verified news, community updates, radio and even influencer campaigns
           — all reaching audiences across the country.
        </p>
        <div className="mt-10 grid md:grid-cols-3 gap-8 text-left">
          {[
            {
              title: "For the Community",
              text: "Share stories, events, and updates that matter. Your voice helps inform, inspire, and connect people through trusted media channels.",
            },
            {
              title: "For Businesses",
              text: "Promote your offers, services, and events with real impact. Reach thousands through radio, TV, and influencer marketing — all from one simple platform.",
            },
            {
              title: "For Broadcasters",
              text: "Access curated, verified content ready for on-air broadcast — saving time, increasing engagement, and growing community trust.",
            },
          ].map((item, i) => (
            <div key={i} className="p-6 border rounded-2xl hover:shadow-lg transition">
              <h4 className="font-bold text-lg mb-2 text-orange-500">{item.title}</h4>
              <p className="text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section ref={(el) => setRefs(el, 1)} className="px-6 md:px-12 py-16 bg-gray-50 text-center">
        <h3 className="text-3xl font-semibold mb-6">How It Works</h3>
        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          Posting on HustleWave360 is simple, transparent and fast. Here’s how your message
          goes from submission to the audience.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Post Your Story or Ad",
              text: "Create an account and submit your ad, story, or announcement directly on our platform.",
            },
            {
              step: "2",
              title: "We Review & Approve",
              text: "Our editorial team ensures your content meets broadcast and platform standards.",
            },
            {
              step: "3",
              title: "Broadcast to Listeners",
              text: "Once approved, your message goes live — on radio, or through influencers — reaching the right audience at the right time.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-orange-500 text-white rounded-full text-lg font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
              <p className="text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section ref={(el) => setRefs(el, 2)} className="px-6 md:px-12 py-16 text-center">
        <h3 className="text-3xl font-semibold mb-6">Why Choose HustleWave360?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            "Reach wider audiences instantly.",
            "Affordable and easy to use.",
            "Verified content ensures credibility.",
            "Connects digital and radio media",
            "Perfect for small businesses and communities.",
            "Fast approval and broadcast turnaround.",
          ].map((text, i) => (
            <div key={i} className="p-6 border rounded-2xl bg-white hover:bg-orange-50 transition">
              <p className="text-gray-700">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="text-center py-20 bg-orange-500 text-white">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">
          Ready to Get Your Message on Air?
        </h2>
        <p className="mb-8 max-w-xl mx-auto">
          Join HustleWave360 today and amplify your voice across radio and social media.
            Whether it’s an ad, story, or community update — we help you reach, engage, and grow your audience.
        </p>
        <button 
        onClick={() => navigate("/post-news")}
        className="bg-white text-orange-500 px-6 py-3 rounded-lg font-medium hover:bg-orange-100">
          Start Posting →
        </button>
      </section>

      {/* ===== FOOTER ===== */}
     <Footer/>
    </div>
  );
}

export default Homepage