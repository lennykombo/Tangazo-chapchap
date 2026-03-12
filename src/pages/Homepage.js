import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { Users, Radio as RadioIcon, Globe, CheckCircle, Zap } from "lucide-react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";

gsap.registerPlugin(ScrollTrigger);

function Homepage() {
  const sectionsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    sectionsRef.current.forEach((section) => {
      if (!section) return;
      gsap.fromTo(
        section,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
          },
        }
      );
    });
  }, []);

  const setRefs = (el, i) => {
    sectionsRef.current[i] = el;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      <Nav />

      {/* ===== HERO SECTION ===== */}
      <section 
        ref={(el) => setRefs(el, 0)}
        className="text-center py-24 bg-gradient-to-b from-orange-50 to-white px-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Zap size={14} /> Radio & Influencer Network
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
            Amplify Your Message <br />
            <span className="text-orange-500 italic">Across Every Wave</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect your brand to the airwaves and social feeds. We bridge 
            <span className="font-bold text-gray-800"> Traditional Radio</span> with 
            <span className="font-bold text-gray-800"> Modern Influence</span>, 
            making advertising digital, accessible, and community-driven.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate("/post-news")}
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition shadow-xl flex items-center justify-center gap-2"
            >
              <RadioIcon size={20} /> Submit Radio Ad
            </button>
            <button 
              onClick={() => navigate("/influencer")}
              className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-600 transition shadow-xl shadow-orange-100 flex items-center justify-center gap-2"
            >
              <Users size={20} /> Hire Influencers
            </button>
          </div>
        </div>
      </section>

      {/* ===== WHAT WE DO ===== */}
      <section ref={(el) => setRefs(el, 1)} className="px-6 md:px-12 py-20 text-center">
        <h3 className="text-sm font-black text-orange-500 uppercase tracking-[0.3em] mb-4">Our Ecosystem</h3>
        <h2 className="text-3xl md:text-4xl font-black mb-12">The Future of Local Promotion</h2>
        
        <div className="mt-10 grid md:grid-cols-3 gap-8 text-left max-w-6xl mx-auto">
          {[
            {
              title: "Community Voices",
              icon: <Globe className="text-orange-500" />,
              text: "Share verified news and local stories directly to broadcasters. We ensure community updates get the airtime they deserve.",
            },
            {
              title: "Digital Creators",
              icon: <Users className="text-orange-500" />,
              text: "Book top-tier influencers for Live sessions, TikTok posts, and Instagram mentions. Real-time engagement with verified proof of work.",
            },
            {
              title: "Broadcasters",
              icon: <RadioIcon className="text-orange-500" />,
              text: "Traditional media meets digital speed. Access curated content ready for on-air broadcast, saving time and increasing reach.",
            },
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] hover:shadow-2xl hover:border-orange-200 transition-all group">
              <div className="mb-4 p-3 bg-orange-50 w-fit rounded-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <h4 className="font-black text-xl mb-3 text-gray-900">{item.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section ref={(el) => setRefs(el, 2)} className="px-6 md:px-12 py-24 bg-gray-900 text-white rounded-[3rem] mx-4 md:mx-10 my-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full"></div>
        
        <h3 className="text-3xl md:text-4xl font-black mb-16 text-center">How to Get Started</h3>
        
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto relative z-10">
          {[
            {
              step: "01",
              title: "Choose Your Channel",
              text: "Select between Radio Broadcasting for mass reach or Influencer Marketing for targeted social engagement.",
            },
            {
              step: "02",
              title: "Select Talent or Station",
              text: "Browse our list of verified radio presenters and digital creators. See their reach, stats, and live schedules before you book.",
            },
            {
              step: "03",
              title: "Verify & Complete",
              text: "Track your campaign in real-time. Review live proof videos and analytics screenshots before releasing final payments.",
            },
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="text-6xl font-black text-white/10 absolute -top-8 left-0">{item.step}</div>
              <h4 className="font-bold text-xl mb-4 text-orange-500">{item.title}</h4>
              <p className="text-gray-400 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section ref={(el) => setRefs(el, 3)} className="px-6 md:px-12 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-12">Why Brands Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            "Cross-platform reach (Radio + Social).",
            "Verified 15s video proof of work.",
            "Real-time viewer analytics data.",
            "Affordable for small-scale businesses.",
            "Curated network of verified influencers.",
            "Fast approval and live broadcast.",
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3 p-6 bg-gray-50 rounded-2xl hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-100">
              <CheckCircle className="text-orange-500 shrink-0" size={20} />
              <p className="text-gray-800 font-bold text-sm text-left">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="text-center py-24 bg-orange-500 text-white mx-4 md:mx-10 rounded-[3rem] mb-20 shadow-2xl shadow-orange-200">
        <h2 className="text-3xl md:text-5xl font-black mb-6 px-4">
          Ready to Amplify Your Brand?
        </h2>
        <p className="mb-10 max-w-xl mx-auto text-orange-100 px-6 text-lg">
          Join hundreds of businesses using HustleWave360 to dominate the local airwaves and digital feeds.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-6">
            <button 
                onClick={() => navigate("/influencer")}
                className="bg-white text-orange-600 px-10 py-4 rounded-2xl font-black hover:bg-orange-50 transition-all shadow-xl"
            >
            Start Your Campaign →
            </button>
            <button 
                onClick={() => navigate("/influencer-signup")}
                className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-orange-700 transition-all border border-orange-400"
            >
            Join as a Creator
            </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Homepage;












/*import React, { useEffect, useRef } from "react";
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
      {/* ===== HEADER ===== *//*
      <Nav/>

      {/* ===== HERO SECTION ===== *//*
      <section 
       ref={(el) => setRefs(el, 0)}
      className="text-center py-20 bg-orange-50 px-4 md:px-0">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Empowering Communities <br />
          <span className="text-orange-500 italic">Through Media</span>
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
          </button>*//*
           <button 
            onClick={() => navigate("/influencer")}
            className="bg-orange-500 text-white px-6 py-3 m-1 rounded-lg hover:bg-orange-600">
            Create Influencer Campaign
          </button>
        </div>
      </section>

      {/* ===== WHAT WE DO ===== *//*
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

      {/* ===== HOW IT WORKS ===== *//*
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

      {/* ===== BENEFITS ===== *//*
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

      {/* ===== CTA ===== *//*
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

      {/* ===== FOOTER ===== *//*
     <Footer/>
    </div>
  );
}

export default Homepage*/