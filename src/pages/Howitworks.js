import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom"; // Added navigate for CTA
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import mpesa from "../assets/mpesapay.png";
import presenter from "../assets/presenter.jpg";
import show from "../assets/show.jpg";
import station from "../assets/station.jpg";
import { CheckCircle } from "lucide-react";
// Note: Suggest adding an influencer-related image here later
// import influencerImg from "../assets/influencer_work.jpg" 

gsap.registerPlugin(ScrollTrigger);

function Howitworks() {
  const stepsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    stepsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: i * 0.1,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reset",
          },
        }
      );
    });
  }, []);

  const setRefs = (el, index) => {
    stepsRef.current[index] = el;
  };

  return (
    <div className="bg-white text-gray-900 min-h-screen overflow-x-hidden">
      <Nav />
      
      {/* Hero Section */}
      <section className="text-center py-24 bg-gradient-to-b from-orange-500 to-red-600 text-white px-6">
        <h1 className="text-4xl md:text-6xl font-black mb-6">
          The Power of Every Wave
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl opacity-90 font-medium">
          Whether you want to air on traditional radio or dominate social media feeds, we make the process digital, transparent, and fast.
        </p>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6 md:px-16 lg:px-32 space-y-32">

        {/* Step 1: Discover */}
        <div ref={(el) => setRefs(el, 0)} className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img src={station} alt="Discover platform" className="rounded-[2.5rem] shadow-2xl" />
          </div>
          <div className="md:w-1/2">
            <span className="text-orange-500 font-black text-xs uppercase tracking-widest mb-2 block">Step 01</span>
            <h2 className="text-4xl font-black mb-6 text-gray-900 leading-tight">
              Choose Your Platform
            </h2>
            <p className="text-lg leading-relaxed text-gray-600">
              Browse through our partnered **Radio Stations** for mass audio reach, or explore our curated network of **Influencers** to tap into digital communities. You can even combine both for a 360° campaign.
            </p>
          </div>
        </div>

        {/* Step 2: Selection */}
        <div ref={(el) => setRefs(el, 1)} className="flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <span className="text-orange-500 font-black text-xs uppercase tracking-widest mb-2 block">Step 02</span>
            <h2 className="text-4xl font-black mb-6 text-gray-900 leading-tight">
              Select Your Talent
            </h2>
            <p className="text-lg leading-relaxed text-gray-600">
              Pick the **Radio Presenter** who matches your brand’s tone, or the **Content Creator** whose audience aligns with your target. See their reach, stats, and "Going Live" schedules before you book.
            </p>
          </div>
          <div className="md:w-1/2">
            <img src={presenter} alt="Select Talent" className="rounded-[2.5rem] shadow-2xl" />
          </div>
        </div>

        {/* Step 3: Customization */}
        <div ref={(el) => setRefs(el, 2)} className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img src={show} alt="Define Campaign" className="rounded-[2.5rem] shadow-2xl" />
          </div>
          <div className="md:w-1/2">
            <span className="text-orange-500 font-black text-xs uppercase tracking-widest mb-2 block">Step 03</span>
            <h2 className="text-4xl font-black mb-6 text-gray-900 leading-tight">
              Define the Campaign
            </h2>
            <p className="text-lg leading-relaxed text-gray-600">
              Provide a clear **Instruction Brief**. Upload scripts for radio ads or media files (images/audio) for influencers to use. Set your quantities—whether it’s 3 live mentions or 1 week of airtime.
            </p>
          </div>
        </div>

        {/* Step 4: Payment */}
        <div ref={(el) => setRefs(el, 3)} className="flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <span className="text-orange-500 font-black text-xs uppercase tracking-widest mb-2 block">Step 04</span>
            <h2 className="text-4xl font-black mb-6 text-gray-900 leading-tight">
              Secure Checkout
            </h2>
            <p className="text-lg leading-relaxed text-gray-600">
              Confirm your booking and pay via M-Pesa. Once paid, the campaign goes to our Admin for instant approval. Your funds are held securely until the work is verified.
            </p>
          </div>
          <div className="md:w-1/2">
            <img src={mpesa} alt="Payment" className="rounded-[2.5rem] shadow-2xl" />
          </div>
        </div>

        {/* Step 5: Verification - NEW FEATURE! */}
        <div ref={(el) => setRefs(el, 4)} className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 bg-orange-100 p-8 rounded-[2.5rem] flex items-center justify-center">
            <div className="text-center">
                <div className="bg-white p-6 rounded-3xl shadow-xl inline-block mb-4">
                    <CheckCircle className="text-green-500 w-16 h-16" />
                </div>
                <p className="font-black text-orange-600 uppercase tracking-widest text-sm">Verified Proof</p>
            </div>
          </div>
          <div className="md:w-1/2">
            <span className="text-orange-500 font-black text-xs uppercase tracking-widest mb-2 block">Step 05</span>
            <h2 className="text-4xl font-black mb-6 text-gray-900 leading-tight">
              Real-Time Verification
            </h2>
            <p className="text-lg leading-relaxed text-gray-600">
              For influencer campaigns, you don't just take our word for it. Review **15-second live video proof** and **analytics screenshots** showing real viewer counts before the campaign is marked as completed.
            </p>
          </div>
        </div>

      </section>

      {/* CTA Section */}
      <section className="text-center py-24 bg-orange-50 mx-4 md:mx-12 rounded-[3rem] mb-20 border border-orange-100">
        <h3 className="text-3xl md:text-5xl font-black mb-6 text-gray-900 leading-tight">
          Ready to Amplify Your Brand?
        </h3>
        <p className="text-lg mb-10 text-gray-500 max-w-2xl mx-auto font-medium">
          Start your campaign today and reach thousands through the airwaves or digital screens.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
            onClick={() => navigate("/post-news")}
            className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all shadow-xl"
            >
            Book Radio Ad
            </button>
            <button
            onClick={() => navigate("/influencer")}
            className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-200"
            >
            Hire Influencers
            </button>
        </div>
      </section>

      <Footer/>
    </div>
  );
}

export default Howitworks;









/*import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
//import mikerophone from "../assets/mikerophone.jpg"
import mpesa from "../assets/mpesapay.png"
import presenter from "../assets/presenter.jpg"
import show from "../assets/show.jpg"
import station from "../assets/station.jpg"

gsap.registerPlugin(ScrollTrigger);

function Howitworks() {

     const stepsRef = useRef([]);

  useEffect(() => {
    stepsRef.current.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: i * 0.2,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reset",
          },
        }
      );
    });
  }, []);

  const setRefs = (el, index) => {
    stepsRef.current[index] = el;
  };

  return (
     <div className="bg-white text-gray-900 min-h-screen">
        <Nav/>
      {/* Hero Section *//*
      <section className="text-center py-24 bg-gradient-to-b from-orange-500 to-orange-600 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          How It Works
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl opacity-90">
          Post your ad or news in minutes — choose your radio station, presenter, and airtime slot effortlessly.
        </p>
      </section>

      {/* Steps Section *//*
      <section className="py-20 px-6 md:px-16 lg:px-32 space-y-24">

        {/* Step 1: Choose Radio *//*
        <div
          ref={(el) => setRefs(el, 0)}
          className="flex flex-col md:flex-row items-center gap-12"
        >
          <div className="md:w-1/2">
            <img
              src={station}
              alt="Choose radio station"
              className="rounded-2xl shadow-xl"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-semibold mb-4 text-orange-500">
              1. Choose Your Radio Station
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Select the radio station you want your ad or news to air on.
              TangazoChapChap partners with popular stations across the country to
              help you reach your ideal audience.
            </p>
          </div>
        </div>

        {/* Step 2: Choose Presenter *//*
        <div
          ref={(el) => setRefs(el, 1)}
          className="flex flex-col-reverse md:flex-row items-center gap-12"
        >
          <div className="md:w-1/2">
            <h2 className="text-3xl font-semibold mb-4 text-orange-500">
              2. Select a Presenter
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Choose your preferred radio host or presenter — someone who connects
              best with your target audience. Whether it’s the morning show or a
              drive-time favorite, the choice is yours.
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src={presenter}
              alt="Choose presenter"
              className="rounded-2xl shadow-xl"
            />
          </div>
        </div>

        {/* Step 3: Pick Show & Time *//*
        <div
          ref={(el) => setRefs(el, 2)}
          className="flex flex-col md:flex-row items-center gap-12"
        >
          <div className="md:w-1/2">
            <img
              src={show}
              alt="Pick show and time"
              className="rounded-2xl shadow-xl"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-semibold mb-4 text-orange-500">
              3. Pick the Show & Time
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Choose the show and airtime that works best for you — whether it’s
              morning prime time, midday, or evening broadcasts.
            </p>
          </div>
        </div>

        {/* Step 4: Confirm & Pay *//*
        <div
          ref={(el) => setRefs(el, 3)}
          className="flex flex-col-reverse md:flex-row items-center gap-12"
        >
          <div className="md:w-1/2">
            <h2 className="text-3xl font-semibold mb-4 text-orange-500">
              4. Confirm & Pay
            </h2>
            <p className="text-lg leading-relaxed text-gray-700">
              Review your selections and confirm your booking. Securely pay online
              — once approved, your ad will automatically be queued for broadcast.
            </p>
          </div>
          <div className="md:w-1/2">
            <img
              src={mpesa}
              alt="Confirm and pay"
              className="rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* CTA Section *//*
      <section className="text-center py-20 bg-orange-50">
        <h3 className="text-3xl md:text-4xl font-semibold mb-6 text-gray-900">
          Ready to Air Your Message?
        </h3>
        <p className="text-lg mb-8 text-gray-600">
          Start today and get your news or ad live on air. Reach thousands of listeners instantly.
        </p>
        <a
          href="/post-news"
          className="bg-orange-500 text-white px-8 py-3 rounded-full text-lg hover:bg-orange-600 transition"
        >
          Get Started
        </a>
      </section>

      <Footer/>
    </div>
  )
}

export default Howitworks*/