import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-[5%] bg-gradient-to-b from-navy-dark via-navy to-slate-700 text-white relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-gradient-radial from-primary/10 to-transparent rounded-full -top-60 -right-60" />

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="page-enter">
            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight font-display">
              Transform Your Game with{' '}
              <span className="text-primary-light">AI-Powered Analysis</span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed">
              Upload your basketball footage and let advanced computer vision analyze every shot,
              movement, and play. Get instant insights that help you improve faster.
            </p>
            <div className="flex gap-4">
              <Link
                to="/workspace"
                className="bg-primary text-white px-8 py-4 rounded-md font-bold text-base uppercase tracking-wide hover:bg-primary-dark transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 inline-block"
              >
                Start Analyzing
              </Link>
              <a
                href="#how-it-works"
                className="border-2 border-slate-600 text-white px-8 py-4 rounded-md font-bold text-base uppercase tracking-wide hover:border-primary hover:text-primary-light transition-all inline-block"
              >
                See How It Works
              </a>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-10 flex items-center justify-center min-h-[450px]">
            <div className="w-full h-[380px] bg-gradient-to-br from-navy to-navy-dark rounded-lg relative border-2 border-slate-600">
              {/* Animated shot dots */}
              <div className="absolute w-4 h-4 rounded-full bg-success shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse-custom" style={{ top: '20%', left: '30%' }} />
              <div className="absolute w-4 h-4 rounded-full bg-success shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse-custom" style={{ top: '25%', left: '70%', animationDelay: '0.3s' }} />
              <div className="absolute w-4 h-4 rounded-full bg-error shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse-custom" style={{ top: '45%', left: '50%', animationDelay: '0.6s' }} />
              <div className="absolute w-4 h-4 rounded-full bg-success shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse-custom" style={{ top: '60%', left: '25%', animationDelay: '0.9s' }} />
              <div className="absolute w-4 h-4 rounded-full bg-success shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse-custom" style={{ top: '65%', left: '75%', animationDelay: '1.2s' }} />
              <div className="absolute w-4 h-4 rounded-full bg-error shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse-custom" style={{ top: '80%', left: '45%', animationDelay: '1.5s' }} />
              <div className="absolute w-4 h-4 rounded-full bg-success shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse-custom" style={{ top: '35%', left: '55%', animationDelay: '1.8s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-[5%] bg-white">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-navy-dark font-display uppercase tracking-tight">
              Why CourtVision?
            </h2>
            <p className="text-lg text-slate-500">Professional-grade analysis, accessible to everyone</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '▲', title: 'Advanced Shot Analytics', desc: 'Track make/miss rates, shot locations, and shooting patterns. Understand your hot zones and areas that need work.' },
              { icon: '◆', title: 'Form Analysis', desc: 'Computer vision tracks your shooting form, release point, and arc trajectory to identify mechanical improvements.' },
              { icon: '◉', title: 'Instant Processing', desc: "Upload your video and get comprehensive analysis in minutes. No manual logging or data entry required." },
              { icon: '▶', title: 'Track Progress', desc: 'See how your game evolves over time with historical tracking and performance trends.' },
              { icon: '■', title: 'Visual Shot Charts', desc: 'Beautiful, interactive shot charts that make it easy to visualize your performance and share with coaches.' },
              { icon: '●', title: 'AI-Powered Insights', desc: 'Machine learning models identify patterns and suggest personalized drills to target your weaknesses.' },
            ].map((feature, i) => (
              <div key={i} className="card-stagger bg-slate-50 p-8 rounded-lg border border-slate-200 relative group hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-slate-300 transition-all">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-lg scale-y-0 group-hover:scale-y-100 transition-transform" />
                <div className="w-16 h-16 bg-white border-2 border-primary rounded-lg flex items-center justify-center mb-6 text-2xl text-primary font-bold">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy-dark font-display tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-[5%] bg-slate-50">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 text-navy-dark font-display uppercase tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-slate-500">Three simple steps to better basketball</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { num: 1, title: 'Upload Video', desc: 'Record your practice session and upload the footage to CourtVision.' },
              { num: 2, title: 'AI Analysis', desc: 'Our computer vision models detect shots, track movement, and analyze form.' },
              { num: 3, title: 'Get Insights', desc: 'Review detailed statistics, shot charts, and personalized recommendations.' },
            ].map((step) => (
              <div key={step.num} className="text-center group">
                <div className="w-20 h-20 bg-white text-primary border-[3px] border-primary rounded-lg flex items-center justify-center text-4xl font-black mx-auto mb-6 font-display transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-105">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-3 text-navy-dark font-display tracking-tight">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-dark text-slate-400 py-12 px-[5%] text-center">
        <p className="mb-2">
          <strong className="text-primary-light font-bold">COURTVISION</strong> - Built for Alameda Hacks 2026
        </p>
        <p>Transform your game with AI-powered basketball analysis</p>
      </footer>
    </div>
  );
}
