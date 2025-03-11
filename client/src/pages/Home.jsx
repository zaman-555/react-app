import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20 flex-grow">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to MyApp
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Build amazing web applications with ease.
          </p>
          <div className="space-x-4">
            <a
              href="/about"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Learn More
            </a>
            <a
              href="/contact"
              className="bg-transparent border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;