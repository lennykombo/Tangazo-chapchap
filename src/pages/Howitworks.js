import React, { useEffect, useRef } from "react";
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
      {/* Hero Section */}
      <section className="text-center py-24 bg-gradient-to-b from-orange-500 to-orange-600 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          How It Works
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl opacity-90">
          Post your ad or news in minutes — choose your radio station, presenter, and airtime slot effortlessly.
        </p>
      </section>

      {/* Steps Section */}
      <section className="py-20 px-6 md:px-16 lg:px-32 space-y-24">

        {/* Step 1: Choose Radio */}
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

        {/* Step 2: Choose Presenter */}
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

        {/* Step 3: Pick Show & Time */}
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

        {/* Step 4: Confirm & Pay */}
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

      {/* CTA Section */}
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

export default Howitworks