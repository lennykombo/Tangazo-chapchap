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
          <span className="text-orange-500 italic">Through Radio Broadcasts</span>
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          TangazoChapChap connects voices to the airwaves — allowing anyone to share
          news, stories, and promotions directly to partnering radio stations.
          We make radio accessible, digital, and interactive.
        </p>
        <div className="mt-8 space-x-4">
          <button 
          onClick={() => navigate("/post-news")}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600">
            Submit Ad
          </button>
          <button 
            onClick={() => navigate("/post-news")}
            className="border border-orange-500 text-orange-500 px-6 py-3 rounded-lg hover:bg-orange-100">
            Share Story
          </button>
        </div>
      </section>

      {/* ===== WHAT WE DO ===== */}
      <section ref={(el) => setRefs(el, 0)} className="px-6 md:px-12 py-16 text-center">
        <h3 className="text-3xl font-semibold mb-6">What We Do</h3>
        <p className="text-gray-600 max-w-3xl mx-auto">
          At <span className="text-orange-500 font-semibold">TangazoChapChap</span>, we bridge the gap between
          communities and radio stations. Our platform allows people, businesses,
          and organizations to post verified news, community updates, and radio ads
          that reach listeners across the country.
        </p>
        <div className="mt-10 grid md:grid-cols-3 gap-8 text-left">
          {[
            {
              title: "For the Community",
              text: "Share stories, events, and updates that matter. Your voice helps inform and inspire others.",
            },
            {
              title: "For Businesses",
              text: "Reach thousands through radio ads. Promote offers, services, and events with real impact.",
            },
            {
              title: "For Broadcasters",
              text: "Get curated, verified content ready for on-air broadcast — saving time and boosting engagement.",
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
          Posting on TangazoChapChap is simple and transparent. Here’s how your message
          goes from submission to the radio.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Post Your Story or Ad",
              text: "Create an account and submit your ad, story, or announcement directly through our platform.",
            },
            {
              step: "2",
              title: "We Review & Approve",
              text: "Our editors ensure your content meets broadcasting standards and is ready for radio.",
            },
            {
              step: "3",
              title: "Broadcast to Listeners",
              text: "Once approved, your content is sent to partnering stations for live or scheduled broadcast.",
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
        <h3 className="text-3xl font-semibold mb-6">Why Choose TangazoChapChap?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            "Reach wider audiences instantly.",
            "Affordable and easy to use.",
            "Verified content ensures credibility.",
            "Connects digital media with traditional radio.",
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
          Join TangazoChapChap today and amplify your voice through radio. Whether it’s
          an ad, story, or announcement — we help you reach your audience.
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