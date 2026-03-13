import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height, nodes = [];
    
    class Node {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 2 + 1;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.fill();
      }
    }

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      nodes = [];
      for (let i = 0; i < 60; i++) nodes.push(new Node());
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      nodes.forEach(node => {
        node.update();
        node.draw();
        
        nodes.forEach(other => {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 * (1 - dist/150)})`;
            ctx.stroke();
          }
        });
      });
      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', init);
    init();
    animate();

    return () => window.removeEventListener('resize', init);
  }, []);

  return (
    <div className="antialiased overflow-x-hidden bg-brand-navy text-slate-100 min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: `
        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .hero-gradient {
          background: radial-gradient(circle at 50% 50%, #1e1b4b 0%, #020617 70%);
        }
        .glow-cyan {
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
        }
        .node-green { fill: #22c55e; filter: drop-shadow(0 0 5px #22c55e); }
        .node-yellow { fill: #eab308; filter: drop-shadow(0 0 5px #eab308); }
        .node-red { fill: #ef4444; filter: drop-shadow(0 0 5px #ef4444); }
        .line-flow {
          stroke-dasharray: 100;
          animation: dash 10s linear infinite;
        }
        @keyframes dash {
          to { stroke-dashoffset: -1000; }
        }
      `}} />

      {/* BEGIN: Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center glow-cyan">
              <svg className="w-5 h-5 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">ThinkMap AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a className="hover:text-white transition-colors" href="#problem">Methodology</a>
            <a className="hover:text-white transition-colors" href="#features">Intelligence</a>
            <a className="hover:text-white transition-colors" href="#dashboard">For Educators</a>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2 bg-brand-cyan text-brand-navy font-bold rounded-full text-sm hover:scale-105 transition-all duration-300"
          >
            Get Access
          </button>
        </div>
      </nav>
      {/* END: Navigation */}

      {/* BEGIN: Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient pt-20 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" id="hero-canvas"></canvas>
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 glass rounded-full text-brand-cyan text-xs font-bold uppercase tracking-widest border border-brand-cyan/20">
            Powered by Multi-Dimensional Reasoning Models
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            Fix Misconceptions.<br/>Unlock True Understanding.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            ThinkMap AI analyzes student reasoning patterns to detect hidden conceptual gaps that traditional multiple-choice systems miss.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-brand-cyan text-brand-navy font-bold rounded-xl shadow-lg shadow-brand-cyan/20 hover:scale-105 transition-transform"
            >
              Start Mapping Now
            </button>
          </div>

          <div className="relative grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="glass p-6 rounded-2xl text-left animate-float">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-slate-500"></div>
                <span className="text-xs font-mono text-slate-400">STUDENT_REASONING_LOG</span>
              </div>
              <p className="text-slate-300 italic text-sm leading-relaxed">
                "I think the object slows down because the force runs out after the push..."
              </p>
            </div>
            <div className="glass p-6 rounded-2xl text-left animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-brand-cyan glow-cyan"></div>
                <span className="text-xs font-mono text-brand-cyan">MISCONCEPTION_DETECTED</span>
              </div>
              <p className="text-brand-cyan text-sm font-semibold">
                Impetus Fallacy Detected. Student lacks understanding of Newton's First Law (Inertia).
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* END: Hero Section */}

      {/* BEGIN: Problem Section */}
      <section className="py-24 bg-brand-navy" id="problem">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Problem With Modern Learning</h2>
            <p className="text-slate-400">Standard assessments treat knowledge as binary. We see the layers beneath.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1 text-slate-200">Binary Grading</h4>
                  <p className="text-slate-400 text-sm">Treating "Wrong" as a simple lack of information, ignoring the logic that led there.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1 text-slate-200">ThinkMap Reasoning Analysis</h4>
                  <p className="text-slate-400 text-sm">Identifying the specific mental model flaw to provide targeted remediation.</p>
                </div>
              </div>
            </div>
            <div className="glass aspect-video rounded-3xl p-8 flex flex-col justify-center border-brand-cyan/10">
              <div className="space-y-4">
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-cyan w-[75%]"></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
                  <span>Reasoning Depth</span>
                  <span>84% Latent Misconception</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: Problem Section */}

      {/* BEGIN: Solution Features */}
      <section className="py-24 relative" id="features">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent"></div>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-3xl group hover:border-brand-cyan/40 transition-all duration-500">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9.663 17h4.674a1 1 0 00.707-.293l4.853-4.853a1 1 0 000-1.414L15.044 5.586a1 1 0 00-.707-.293H9.663a1 1 0 00-.707.293L4.103 10.44a1 1 0 000 1.414l4.853 4.853a1 1 0 00.707.293z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Semantic Analysis</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Our LLMs process unstructured student explanations to map their internal logic against a standard domain model.</p>
            </div>
            <div className="glass p-8 rounded-3xl group hover:border-brand-cyan/40 transition-all duration-500">
              <div className="w-12 h-12 bg-brand-cyan/20 rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Concept Dependencies</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Visualize exactly which foundational concepts are blocking progress on advanced topics using dependency graphs.</p>
            </div>
            <div className="glass p-8 rounded-3xl group hover:border-brand-cyan/40 transition-all duration-500">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.618.309a6 6 0 01-3.86.517l-2.388-.477a2 2 0 00-1.022.547l-1.16 1.16a2 2 0 001.414 3.414h15.656a2 2 0 001.414-3.414l-1.16-1.16z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Dynamic Remediation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Automatically generated micro-lessons tailored to the student's unique "flavor" of misunderstanding.</p>
            </div>
          </div>
        </div>
      </section>
      {/* END: Solution Features */}

      {/* BEGIN: Concept Map Visualizer */}
      <section className="py-24 bg-brand-navy/50 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 italic">Your Knowledge, Visualized</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-12">Real-time mapping of conceptual mastery across your entire curriculum.</p>
          <div className="glass relative aspect-[16/9] rounded-[2rem] overflow-hidden p-12 border border-white/10">
            <svg className="w-full h-full" viewBox="0 0 800 450">
              <defs>
                <marker id="arrow" markerHeight="7" markerWidth="10" orient="auto" refX="0" refY="3.5">
                  <polygon fill="#334155" points="0 0, 10 3.5, 0 7"></polygon>
                </marker>
              </defs>
              <line className="line-flow" stroke="#334155" strokeWidth="2" x1="150" x2="350" y1="225" y2="125"></line>
              <line className="line-flow" stroke="#334155" strokeWidth="2" x1="150" x2="350" y1="225" y2="325"></line>
              <line className="line-flow" stroke="#334155" strokeWidth="2" x1="350" x2="550" y1="125" y2="125"></line>
              <line className="line-flow" stroke="#334155" strokeWidth="2" x1="350" x2="550" y1="325" y2="325"></line>
              <circle className="node-green" cx="150" cy="225" r="30"></circle>
              <text className="text-[12px] fill-slate-400 font-bold" textAnchor="middle" x="150" y="275">Algebra Basics</text>
              <circle className="node-green" cx="350" cy="125" r="30"></circle>
              <text className="text-[12px] fill-slate-400 font-bold" textAnchor="middle" x="350" y="175">Linear Equations</text>
              <circle className="node-yellow" cx="350" cy="325" r="30"></circle>
              <text className="text-[12px] fill-slate-400 font-bold" textAnchor="middle" x="350" y="375">Coordinate Geometry</text>
              <circle className="node-red" cx="550" cy="125" r="30"></circle>
              <text className="text-[12px] fill-slate-400 font-bold" textAnchor="middle" x="550" y="175">Multivariate Calc</text>
              <circle className="node-yellow" cx="550" cy="325" r="30"></circle>
              <text className="text-[12px] fill-slate-400 font-bold" textAnchor="middle" x="550" y="375">Vector Spaces</text>
            </svg>
            <div className="absolute bottom-10 right-10 flex flex-col gap-4">
              <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Mastered</span>
              </div>
              <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Partial</span>
              </div>
              <div className="flex items-center gap-3 glass px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Misconception</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: Concept Map Visualizer */}

      {/* BEGIN: Dashboard Mockup */}
      <section className="py-24" id="dashboard">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">Sleek Analytics for the Modern Educator.</h2>
              <p className="text-slate-400 mb-8">Stop guessing which students need help. Our heatmap identifying "Concept Fragility" tells you exactly where to focus tomorrow's lesson.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  Classroom-wide misconception heatmaps
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  Individual student trajectory projections
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="glass rounded-3xl p-8 relative">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-bold text-lg">Knowledge Heatmap</h4>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {[...Array(28)].map((_, i) => {
                    const colors = ['bg-brand-cyan', 'bg-purple-500', 'bg-indigo-500'];
                    const opacities = ['opacity-20', 'opacity-40', 'opacity-60', 'opacity-80', 'opacity-100'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    const randomOpacity = opacities[Math.floor(Math.random() * opacities.length)];
                    return (
                      <div key={i} className={`aspect-square ${randomColor} ${randomOpacity} rounded-sm`}></div>
                    );
                  })}
                </div>
                <div className="absolute -top-6 -right-6 glass p-4 rounded-2xl shadow-2xl animate-float">
                  <div className="text-[10px] text-brand-cyan font-bold mb-1 uppercase tracking-wider">Alert</div>
                  <div className="text-xs font-medium">85% struggle with 'Inertia'</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: Dashboard Mockup */}

      {/* BEGIN: Tech Stack */}
      <section className="py-12 border-y border-white/5 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-sm font-bold tracking-tighter uppercase">Sentence Transformers</span>
            <span className="text-sm font-bold tracking-tighter uppercase">Faiss Vector DB</span>
            <span className="text-sm font-bold tracking-tighter uppercase">PyTorch</span>
            <span className="text-sm font-bold tracking-tighter uppercase">OpenAI GPT-4o</span>
            <span className="text-sm font-bold tracking-tighter uppercase">HuggingFace</span>
          </div>
        </div>
      </section>
      {/* END: Tech Stack */}

      {/* BEGIN: Final CTA */}
      <footer className="py-32 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-t from-brand-indigo/30 to-transparent blur-3xl -z-10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8">Build True Understanding.</h2>
          <p className="text-xl text-slate-400 mb-12">Join 500+ forward-thinking schools transforming the way we measure human intelligence.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-10 py-5 bg-white text-brand-navy font-bold rounded-2xl hover:bg-brand-cyan transition-all"
            >
              Get Started for Free
            </button>
            <button className="px-10 py-5 glass text-white font-bold rounded-2xl">
              Talk to Sales
            </button>
          </div>
          <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-center items-center gap-6 text-slate-500 text-xs uppercase tracking-widest">
            <span>© 2024 ThinkMap AI. All rights reserved.</span>
          </div>
        </div>
      </footer>
      {/* END: Final CTA */}
    </div>
  );
};

export default LandingPage;
