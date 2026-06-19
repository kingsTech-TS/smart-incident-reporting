import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, MapPin, Users, TrendingUp } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#0b1220] to-[#050816] text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <span className="font-bold text-xl">SmartOps</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <main className="px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <section className="text-center mb-24">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              Smart Incident Response Platform
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-3xl mx-auto">
              Connect citizens, responders, and administrators with a modern,
              real-time incident reporting and management system.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg px-8 py-6 text-lg">
                  Start Reporting
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="ghost" className="text-slate-300 hover:text-white px-8 py-6 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </section>

          <section id="features" className="mb-24">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose SmartOps?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: AlertTriangle, title: "Fast Reporting", desc: "Report incidents in seconds with location, photos, and details." },
                { icon: MapPin, title: "Real-Time Tracking", desc: "Monitor incident progress and responder locations in real time." },
                { icon: Users, title: "Team Collaboration", desc: "Coordinate with responders and administrators seamlessly." },
              ].map((feature, index) => (
                <div key={index} className="bg-[#0b1220] rounded-2xl p-8 border border-slate-800 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-6">
                    <feature.icon className="h-7 w-7 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#0b1220] rounded-3xl p-10 border border-slate-800">
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { num: "1", title: "Report Incident", desc: "Describe the issue, add media, and share your location." },
                { num: "2", title: "Dispatch Responders", desc: "Admins assign the right team immediately." },
                { num: "3", title: "Resolve & Follow Up", desc: "Track progress until the issue is fully resolved." },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
                    <span className="text-2xl font-bold">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t border-slate-800 py-8 px-8 text-center text-slate-500">
        <p>© 2026 SmartOps. All rights reserved.</p>
      </footer>
    </div>
  );
}
