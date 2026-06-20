import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, MapPin, Users, TrendingUp, CheckCircle2, Zap, Bell, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#0b1220] to-[#050816] text-white overflow-x-hidden relative">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <nav className="flex items-center justify-between px-6 md:px-8 py-6 border-b border-slate-800 relative z-10 backdrop-blur-sm bg-[#050816]/80">
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
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:shadow-cyan-500/40">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <main className="px-6 md:px-8 py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <section className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
              <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400" />
              <span className="text-sm text-cyan-300">Real-time incident management</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent leading-tight">
              Smart Incident Response Platform
            </h1>
            <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect citizens, responders, and administrators with a modern,
              real-time incident reporting and management system that saves time and lives.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:shadow-cyan-500/40 px-8 py-6 text-lg w-full sm:w-auto">
                  Start Reporting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="ghost" className="text-slate-300 hover:text-white px-8 py-6 text-lg w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </section>

          {/* Stats section */}
          {/* <section className="mb-24 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Active Users" },
              { number: "500+", label: "Incidents Resolved" },
              { number: "24/7", label: "Real-Time Support" },
              { number: "98%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-[#0b1220] border border-slate-800">
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </div>
            ))}
          </section> */}

          <section id="features" className="mb-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SmartOps?</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Everything you need for efficient incident management in one place</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: AlertTriangle, title: "Fast Reporting", desc: "Report incidents in seconds with location, photos, and detailed descriptions.", color: "text-cyan-400", bg: "bg-cyan-500/20" },
                { icon: MapPin, title: "Real-Time Tracking", desc: "Monitor incident progress and responder locations with live updates.", color: "text-blue-400", bg: "bg-blue-500/20" },
                { icon: Bell, title: "Instant Notifications", desc: "Get notified immediately about incident status changes and updates.", color: "text-yellow-400", bg: "bg-yellow-500/20" },
                { icon: Users, title: "Team Collaboration", desc: "Coordinate with responders and administrators seamlessly with real-time chat.", color: "text-purple-400", bg: "bg-purple-500/20" },
                { icon: TrendingUp, title: "Analytics Dashboard", desc: "Gain insights with comprehensive analytics and reporting tools.", color: "text-green-400", bg: "bg-green-500/20" },
                { icon: CheckCircle2, title: "Incident History", desc: "Keep track of all past incidents with detailed records and timelines.", color: "text-emerald-400", bg: "bg-emerald-500/20" },
              ].map((feature, index) => (
                <div key={index} className="bg-[#0b1220] rounded-2xl p-8 border border-slate-800 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group">
                  <div className={`h-14 w-14 rounded-xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-b from-[#0b1220] to-[#080f1d] rounded-3xl p-8 md:p-12 border border-slate-800 mb-24">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                { num: "1", title: "Report Incident", desc: "Describe the issue, add media, and share your location instantly." },
                { num: "2", title: "Dispatch Responders", desc: "Admins review and assign the right team to respond immediately." },
                { num: "3", title: "Resolve & Follow Up", desc: "Track progress in real time until the issue is fully resolved." },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl font-bold">{step.num}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-3xl p-10 md:p-16 border border-cyan-500/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">Join thousands of users who trust SmartOps for their incident management needs.</p>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:shadow-cyan-500/40 px-8 py-6 text-lg">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-10 px-6 md:px-8 text-center text-slate-500 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Shield className="h-4 w-4" />
            </div>
            <span className="font-bold text-lg text-white">SmartOps</span>
          </div>
          <p className="mb-4">© 2026 SmartOps. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
