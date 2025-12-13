"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("vpn")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll(".scroll-animate")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50 animate-fade-in-up">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 group">
            <img
              src="/images/design-mode/KSFLvLJ.png"
              alt="Your Logo"
              className="w-8 h-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
            />
            <span className="text-xl font-mono font-bold text-green-400 transition-all duration-300 group-hover:text-green-300">
              {"<OpenNET>"}
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="font-mono text-slate-300 hover:text-green-400 transition-all duration-300 text-sm hover:scale-105 hover:-translate-y-0.5"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="font-mono text-slate-300 hover:text-green-400 transition-all duration-300 text-sm hover:scale-105 hover:-translate-y-0.5"
            >
              Pricing
            </Link>
            <Link
              href="#protocols"
              className="font-mono text-slate-300 hover:text-green-400 transition-all duration-300 text-sm hover:scale-105 hover:-translate-y-0.5"
            >
              Protocols
            </Link>
            <Link
              href="#locations"
              className="font-mono text-slate-300 hover:text-green-400 transition-all duration-300 text-sm hover:scale-105 hover:-translate-y-0.5"
            >
              Locations
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Link
              href="https://x.com/OpenNetVPN"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-green-400 transition-all duration-300 hover:scale-110"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-label="X (Twitter)">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-slate-300 hover:text-green-400 hover:bg-transparent text-sm transition-all duration-300 hover:scale-105"
              >
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold text-sm px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="relative">
            {/* Mobile: Image above text */}
            <div className="block lg:hidden mb-8">
              <div className="w-full max-w-md mx-auto relative animate-scale-in">
                <img
                  src="/images/design-mode/homepage.png"
                  alt="Key to Privacy Illustration"
                  className="w-full h-auto animate-float"
                />
                {/* Overlapping text on mobile */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-6">
                  <h1 className="text-4xl font-mono font-bold leading-tight text-center animate-fade-in-up animate-delay-200">
                    Key to Your
                    <br />
                    <span className="text-green-400 animate-glow">{"<Privacy>"}</span>
                  </h1>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center max-w-5xl mx-auto">
              <div className="flex-1 text-center pr-8">
                <div
                  className={`inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-white mb-8 transition-all duration-500 hover:bg-green-500/20 hover:scale-105 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
                >
                  🎯 Get 3 days FREE on registration - No payment required
                </div>

                <h1
                  className={`text-5xl md:text-6xl font-mono font-bold mb-6 leading-tight ${isVisible ? "animate-fade-in-up animate-delay-200" : "opacity-0"}`}
                >
                  Key to Your
                  <br />
                  <span className="text-green-400 animate-glow">{"<Privacy>"}</span>
                </h1>

                <p
                  className={`text-xl text-slate-300 mb-8 leading-relaxed ${isVisible ? "animate-fade-in-up animate-delay-300" : "opacity-0"}`}
                >
                  Silence censorship. Protect your privacy and bypass restrictions with OpenNet VPN.
                </p>

                <div
                  className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${isVisible ? "animate-fade-in-up animate-delay-400" : "opacity-0"}`}
                >
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                    >
                      Create Account →
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex-shrink-0">
                <img
                  src="/images/design-mode/homepage.png"
                  alt="Key to Privacy Illustration"
                  className={`w-80 h-auto animate-float ${isVisible ? "animate-fade-in-right animate-delay-500" : "opacity-0"}`}
                />
              </div>
            </div>

            {/* Mobile: Content below image */}
            <div className="block lg:hidden text-center">
              <div className="inline-block px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-sm text-white mb-6 animate-fade-in-up animate-delay-300">
                🎯 Get 3 days FREE on registration - No payment required
              </div>

              <p className="text-lg text-slate-300 mb-8 leading-relaxed animate-fade-in-up animate-delay-400">
                Silence censorship. Protect your privacy and bypass restrictions with OpenNet VPN.
              </p>

              <div className="flex flex-col gap-4 animate-fade-in-up animate-delay-500">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 w-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                  >
                    Create Account →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 scroll-animate">
        <div className="container mx-auto">
          <h2 className="text-3xl font-mono font-bold mb-12 text-center">How It Works</h2>

          <div className="max-w-6xl mx-auto">
            <Card className="bg-slate-900/30 border-slate-700/30 p-8 transition-all duration-500 hover:bg-slate-900/50 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10">
              <div className="flex justify-center mb-8">
                <div className="flex bg-slate-800/50 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("vpn")}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      activeTab === "vpn"
                        ? "bg-green-500 text-black scale-105 shadow-lg shadow-green-500/25"
                        : "text-slate-300 hover:text-green-400 hover:scale-105"
                    }`}
                  >
                    Virtual Private Network
                  </button>
                  <button
                    onClick={() => setActiveTab("proxy")}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      activeTab === "proxy"
                        ? "bg-green-500 text-black scale-105 shadow-lg shadow-green-500/25"
                        : "text-slate-300 hover:text-green-400 hover:scale-105"
                    }`}
                  >
                    {"Protocols"}
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-12">
                <div className="animate-fade-in-left">
                  {activeTab === "vpn" ? (
                    <>
                      <h3 className="text-2xl font-mono font-bold text-green-400 mb-6">Virtual Private Network</h3>
                      <p className="text-slate-300 mb-4 leading-relaxed">
                        By encrypting the traffic, your internet provider won't be able to monitor and log which
                        websites you have visited.
                      </p>
                      <p className="text-slate-300 mb-4 leading-relaxed">
                        Your real IP address will be hidden from your data for many years. This data can be used to see
                        what content you prefer and what you do online.
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        With VPN you can bypass blocked internet resources or geographical restrictions.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-mono font-bold text-green-400 mb-6">Stealth Proxy</h3>
                      <p className="text-slate-300 mb-4 leading-relaxed">
                        Stealth Proxies are designed to bypass advanced censorship and restrictions imposed by
                        authoritarian regimes.
                      </p>
                      <p className="text-slate-300 leading-relaxed">
                        Stealth Proxies obfuscate traffic by making it appear as common internet protocols such as
                        HTTPS.
                      </p>
                    </>
                  )}
                </div>
                <div className="flex justify-center animate-fade-in-right">
                  <div className="flex justify-center">
                    <img
                      src={activeTab === "vpn" ? "/images/vpn-desktop.svg" : "/images/stealth-proxy.svg"}
                      alt={activeTab === "vpn" ? "VPN Desktop Illustration" : "Stealth Proxy Illustration"}
                      className="w-full h-auto transition-all duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Why OpenNet */}
      <section className="py-16 px-4 scroll-animate">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-slate-900/30 border-slate-700/30 p-8 relative overflow-hidden transition-all duration-500 hover:bg-slate-900/50 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div className="text-center lg:text-left animate-fade-in-left">
                  <h2 className="text-3xl font-mono font-bold mb-2 text-center lg:text-left">3 Countries</h2>
                  <h3 className="text-xl font-mono font-semibold text-green-400 mb-6 text-center lg:text-left">
                    10 Servers
                  </h3>
                  <p className="text-slate-300 mb-8 leading-relaxed text-center lg:text-left">
                    We focus on quality over quantity.
                  </p>
                </div>
                <div className="flex justify-center animate-fade-in-right">
                  <img
                    src="/images/design-mode/globe.png"
                    alt="Globe Illustration"
                    className="w-64 h-64 object-contain opacity-80 animate-float"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4 scroll-animate">
        <div className="container mx-auto">
          <h2 className="text-3xl font-mono font-bold mb-12 text-center">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 1 Month Plan */}
            <Card className="relative bg-slate-900/30 border-slate-700/30 overflow-hidden pt-48 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 animate-fade-in-up">
              <div className="absolute top-0 left-0 w-full h-48">
                <img
                  src="/images/design-mode/plan-1month.png"
                  alt="1 Month Plan"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>

              <div className="relative z-10 p-8 text-center">
                <h3 className="text-xl font-mono font-semibold text-green-400 mb-2 border-b border-green-500/30 pb-2">
                  1 Month
                </h3>
                <div className="text-3xl font-bold mb-4">$4.99/mo</div>
                <p className="text-slate-300 text-sm mb-6">Perfect for trying out our service</p>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25">
                  Get Started
                </Button>
              </div>
            </Card>

            {/* 6 Months Plan */}
            <Card className="relative bg-slate-900/30 border-slate-700/30 border-green-500/50 overflow-hidden pt-48 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 animate-fade-in-up animate-delay-100">
              <div className="absolute top-0 left-0 w-full h-48">
                <img
                  src="/images/design-mode/plan-6months.png"
                  alt="6 Months Plan"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-4 right-4">
                  <div className="inline-block px-3 py-1 bg-green-500/20 text-white text-xs rounded-full animate-pulse">
                    POPULAR
                  </div>
                </div>
              </div>

              <div className="relative z-10 p-8 text-center">
                <h3 className="text-xl font-mono font-semibold text-green-400 mb-2 border-b border-green-500/30 pb-2">
                  6 Months
                </h3>
                <div className="text-3xl font-bold mb-4">$3.99/mo</div>
                <p className="text-slate-300 text-sm mb-6">Best value for regular users</p>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25">
                  Get Started
                </Button>
              </div>
            </Card>

            {/* 12 Months Plan */}
            <Card className="relative bg-slate-900/30 border-slate-700/30 overflow-hidden pt-48 transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20 animate-fade-in-up animate-delay-200">
              <div className="absolute top-0 left-0 w-full h-48">
                <img
                  src="/images/design-mode/plan-12months.png"
                  alt="12 Months Plan"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>

              <div className="relative z-10 p-8 text-center">
                <h3 className="text-xl font-mono font-semibold text-green-400 mb-2 border-b border-green-500/30 pb-2">
                  12 Months
                </h3>
                <div className="text-3xl font-bold mb-4">$2.99/mo</div>
                <p className="text-slate-300 text-sm mb-6">Maximum savings for long-term users</p>
                <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25">
                  Get Started
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 scroll-animate">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card
              className="bg-slate-900/30 border-slate-700/30 p-8 md:p-12 text-center relative overflow-hidden transition-all duration-500 hover:bg-slate-900/50 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20"
              style={{
                backgroundImage: "url('/images/homepage.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 bg-slate-900/70"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-mono font-bold mb-6 md:mb-8 text-center animate-fade-in-up">
                  Got Questions?
                </h2>
                <div className="flex justify-center animate-fade-in-up animate-delay-200">
                  <Button
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent px-6 py-2 text-sm sm:text-base sm:px-8 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25"
                    asChild
                  >
                    <a href="mailto:info@opennetvpn.com">Contact Us</a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/50 py-12 px-4 animate-fade-in-up">
        <div className="container mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-8 group">
            <img
              src="/images/design-mode/KSFLvLJ.png"
              alt="OpenNet VPN Logo"
              className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
            />
            <span className="font-mono font-bold text-green-400 transition-colors duration-300 group-hover:text-green-300">
              {"<OPENNET VPN>"}
            </span>
          </div>

          <div className="text-center mb-8"></div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto text-center md:text-left">
            <div className="animate-fade-in-up">
              <h4 className="font-semibold text-green-400 mb-4">CONNECT</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a
                    href="https://x.com/OpenNetVPN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Twitter / X
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@opennetvpn.com"
                    className="hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Email Support
                  </a>
                </li>
              </ul>
            </div>
            <div className="animate-fade-in-up animate-delay-100">
              <h4 className="font-semibold text-green-400 mb-4">PRODUCT</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#protocols"
                    className="hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Protocols
                  </Link>
                </li>
              </ul>
            </div>
            <div className="animate-fade-in-up animate-delay-200">
              <h4 className="font-semibold text-green-400 mb-4">ACCOUNT</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Log In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-green-400 transition-colors duration-300 hover:translate-x-1 inline-block"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-8 pt-8 border-t border-slate-800/50 animate-fade-in-up animate-delay-400">
            <p className="text-slate-400 text-sm">© 2025 OpenNet VPN - Maximum Privacy & Anonymity</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
