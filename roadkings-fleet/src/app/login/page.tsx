"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Crown, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
      {/* Custom Scoped CSS Animations */}
      <style>{`
        @keyframes spin-wheel {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-cab {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.8px); }
        }
        @keyframes bounce-trailer {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-1.2px); }
        }
        @keyframes move-road {
          from { background-position-x: 0; }
          to { background-position-x: -80px; }
        }
        @keyframes move-parallax {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes sun-glow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.05); opacity: 0.95; }
        }
        @keyframes drop-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .wheel {
          transform-box: fill-box;
          transform-origin: center;
          animation: spin-wheel 0.45s linear infinite;
        }
        .truck-body-cab {
          animation: bounce-cab 0.15s ease-in-out infinite;
        }
        .truck-body-trailer {
          animation: bounce-trailer 0.18s ease-in-out infinite;
        }
        .animated-road {
          background-image: linear-gradient(to right, #f97316 65%, transparent 65%);
          background-size: 80px 4px;
          animation: move-road 0.35s linear infinite;
        }
        .floating-card {
          animation: gentle-float 7s ease-in-out infinite;
        }
        .sun-element {
          transform-box: fill-box;
          transform-origin: center;
          animation: sun-glow-pulse 4s ease-in-out infinite;
        }
        .stagger-1 { animation: drop-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
        .stagger-2 { animation: drop-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.08s; opacity: 0; }
        .stagger-3 { animation: drop-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.16s; opacity: 0; }
        .stagger-4 { animation: drop-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.24s; opacity: 0; }
        .stagger-5 { animation: drop-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.32s; opacity: 0; }
        .stagger-6 { animation: drop-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards 0.4s; opacity: 0; }

        @media (prefers-reduced-motion: reduce) {
          .wheel, .truck-body-cab, .truck-body-trailer, .animated-road, .floating-card, .sun-element,
          .stagger-1, .stagger-2, .stagger-3, .stagger-4, .stagger-5, .stagger-6 {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* Background Sky & Gradients */}
      <div className="absolute inset-0 bg-slate-50 pointer-events-none">
        {/* Sky glow from horizon (Warm Sunset/Sunrise Amber Glow) */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-100/40 via-amber-50/20 to-white" />
        
        {/* Soft floating warm dust/cloud elements in background */}
        {Array.from({ length: 15 }).map((_, i) => {
          const top = Math.random() * 50; // keep in top half
          const left = Math.random() * 100;
          const size = Math.random() * 120 + 60;
          const opacity = Math.random() * 0.15 + 0.05;
          return (
            <div
              key={i}
              className="absolute bg-orange-200/50 rounded-full blur-[40px] pointer-events-none"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                opacity: opacity,
              }}
            />
          );
        })}
      </div>

      {/* Grid Overlay for depth (Spatial Design) - Styled in light orange */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(249,115,22,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(249,115,22,0.025)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_40%,transparent_100%)] pointer-events-none" />

      {/* Landscape Scenery & Parallax */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] w-full pointer-events-none overflow-hidden">
        {/* Glowing Horizon Line */}
        <div 
          className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-400/30 to-transparent z-10" 
        />

        {/* Far Background Parallax Mountains with Snowy Caps and Sun in between */}
        <div 
          className="absolute top-[-30px] left-0 w-[200%] h-[120px] opacity-35 flex" 
          style={{ animation: 'move-parallax 55s linear infinite' }}
        >
          {/* Repeating Scenery Block 1 */}
          <div className="w-1/2 h-full flex-shrink-0 relative">
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#cbd5e1" /> {/* slate-300 */}
                  <stop offset="100%" stopColor="#94a3b8" /> {/* slate-400 */}
                </linearGradient>
                <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" /> {/* orange-500 */}
                  <stop offset="100%" stopColor="#f59e0b" /> {/* amber-500 */}
                </linearGradient>
                <filter id="sunGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              {/* Sun rising between the mountains */}
              <circle cx="500" cy="45" r="22" fill="url(#sunGrad)" filter="url(#sunGlow)" className="sun-element" />

              {/* Mountains */}
              {/* Left Mountain Range */}
              <polygon points="100,100 350,30 600,100" fill="url(#mountainGrad)" />
              {/* Icy cap for Left Mountain */}
              <polygon points="302,45 350,30 398,45 372,40 350,45 328,40" fill="#ffffff" />

              {/* Right Mountain Range */}
              <polygon points="400,100 650,25 900,100" fill="url(#mountainGrad)" />
              {/* Icy cap for Right Mountain */}
              <polygon points="602,41 650,25 698,41 672,36 650,41 628,36" fill="#ffffff" />
            </svg>
          </div>
          {/* Repeating Scenery Block 2 */}
          <div className="w-1/2 h-full flex-shrink-0 relative">
            <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full">
              {/* Sun rising between the mountains */}
              <circle cx="500" cy="45" r="22" fill="url(#sunGrad)" filter="url(#sunGlow)" className="sun-element" />

              {/* Mountains */}
              {/* Left Mountain Range */}
              <polygon points="100,100 350,30 600,100" fill="url(#mountainGrad)" />
              {/* Icy cap for Left Mountain */}
              <polygon points="302,45 350,30 398,45 372,40 350,45 328,40" fill="#ffffff" />

              {/* Right Mountain Range */}
              <polygon points="400,100 650,25 900,100" fill="url(#mountainGrad)" />
              {/* Icy cap for Right Mountain */}
              <polygon points="602,41 650,25 698,41 672,36 650,41 628,36" fill="#ffffff" />
            </svg>
          </div>
        </div>

        {/* Midground Parallax Scenery (Utility Poles) */}
        <div 
          className="absolute top-[10px] left-0 w-[200%] h-[120px] opacity-20 flex" 
          style={{ animation: 'move-parallax 14s linear infinite' }}
        >
          <div className="w-1/2 h-full flex-shrink-0 flex justify-around items-end pb-1 pr-[10%] pl-[10%]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative w-8 h-[80px] flex flex-col justify-end">
                <div className="w-[2px] h-full bg-slate-400" />
                <div className="absolute top-4 -left-3 w-7 h-[2px] bg-slate-400" />
                <div className="absolute top-2 -left-2 w-5 h-[1px] bg-slate-300" />
              </div>
            ))}
          </div>
          <div className="w-1/2 h-full flex-shrink-0 flex justify-around items-end pb-1 pr-[10%] pl-[10%]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative w-8 h-[80px] flex flex-col justify-end">
                <div className="w-[2px] h-full bg-slate-400" />
                <div className="absolute top-4 -left-3 w-7 h-[2px] bg-slate-400" />
                <div className="absolute top-2 -left-2 w-5 h-[1px] bg-slate-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Highway Asphalt Road (Clean Light Grey) */}
        <div className="absolute top-[80px] left-0 w-full h-[100px] bg-slate-200 border-y border-slate-300 flex items-center shadow-[inset_0_10px_20px_rgba(0,0,0,0.05)]">
          {/* Animated road divider stripes */}
          <div className="w-full h-[3px] animated-road opacity-85" />
        </div>

        {/* Dynamic Truck Container */}
        <div className="absolute top-[45px] left-[5%] md:left-[10%] lg:left-[15%] w-[280px] h-[95px] z-20 pointer-events-none">
          <svg viewBox="0 0 280 90" className="w-full h-auto drop-shadow-[0_8px_16px_rgba(249,115,22,0.18)]">
            <defs>
              <linearGradient id="cabGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="trailerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </linearGradient>
              <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="lightBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(253, 224, 71, 0.45)" />
                <stop offset="30%" stopColor="rgba(253, 224, 71, 0.2)" />
                <stop offset="100%" stopColor="rgba(253, 224, 71, 0)" />
              </linearGradient>
            </defs>

            {/* Headlight beam */}
            <polygon points="266,58 350,30 350,90" fill="url(#lightBeam)" />

            {/* Underglow neon aura */}
            <ellipse cx="140" cy="80" rx="110" ry="6" fill="#f97316" opacity="0.25" filter="blur(6px)" />

            {/* Trailer Body */}
            <g className="truck-body-trailer">
              {/* Connector bar to cab */}
              <rect x="180" y="65" width="20" height="5" fill="#94a3b8" />
              
              {/* Cargo box container */}
              <rect x="10" y="10" width="170" height="55" rx="3" fill="url(#trailerGrad)" stroke="rgba(203,213,225,0.8)" strokeWidth="1.5" />
              
              {/* Vertical panel ribs */}
              <line x1="38" y1="10" x2="38" y2="65" stroke="rgba(203,213,225,0.5)" strokeWidth="1.5" />
              <line x1="66" y1="10" x2="66" y2="65" stroke="rgba(203,213,225,0.5)" strokeWidth="1.5" />
              <line x1="94" y1="10" x2="94" y2="65" stroke="rgba(203,213,225,0.5)" strokeWidth="1.5" />
              <line x1="122" y1="10" x2="122" y2="65" stroke="rgba(203,213,225,0.5)" strokeWidth="1.5" />
              <line x1="150" y1="10" x2="150" y2="65" stroke="rgba(203,213,225,0.5)" strokeWidth="1.5" />

              {/* ROADKINGS brand logotype */}
              <text x="95" y="42" fill="#f97316" fontSize="15" fontWeight="bold" fontFamily="'Segoe UI', Roboto, sans-serif" letterSpacing="2.5" textAnchor="middle" fontStyle="italic">
                ROADKINGS
              </text>
              <text x="95" y="52" fill="#475569" fontSize="6.5" fontWeight="semibold" letterSpacing="2" textAnchor="middle" opacity="0.6">
                FLEET MANAGEMENT
              </text>
            </g>

            {/* Cabin Body */}
            <g className="truck-body-cab">
              {/* Cab frame structure */}
              <path d="M190,65 L270,65 L268,52 L250,52 L238,26 L190,26 Z" fill="url(#cabGrad)" />
              
              {/* Roof spoiler/deflector */}
              <path d="M190,26 L212,18 L232,26 Z" fill="#ea580c" />
              
              {/* Front Windshield */}
              <path d="M239,30 L249,50 L237,50 Z" fill="#334155" opacity="0.75" />
              
              {/* Cabin side window */}
              <path d="M205,32 L230,32 L230,48 L205,48 Z" fill="#1e293b" rx="1.5" />
              
              {/* Grille details */}
              <rect x="268" y="52" width="2" height="10" fill="#475569" />
              
              {/* Glowing headlamp fixture */}
              <circle cx="266" cy="58" r="3" fill="#fef08a" />
              
              {/* Rear brake light fixture */}
              <rect x="8" y="60" width="3" height="6" fill="#ef4444" />
            </g>

            {/* Wheel Assemblies */}
            {/* Front Wheel */}
            <g className="wheel wheel-front">
              <circle cx="252" cy="69" r="11" fill="url(#wheelGrad)" stroke="#1e293b" strokeWidth="2" />
              <circle cx="252" cy="69" r="5" fill="#cbd5e1" />
              <line x1="252" y1="58" x2="252" y2="80" stroke="#000" strokeWidth="1.5" />
              <line x1="241" y1="69" x2="263" y2="69" stroke="#000" strokeWidth="1.5" />
            </g>
            
            {/* Cabin Mid Wheel */}
            <g className="wheel wheel-mid">
              <circle cx="202" cy="69" r="11" fill="url(#wheelGrad)" stroke="#1e293b" strokeWidth="2" />
              <circle cx="202" cy="69" r="5" fill="#cbd5e1" />
              <line x1="202" y1="58" x2="202" y2="80" stroke="#000" strokeWidth="1.5" />
              <line x1="191" y1="69" x2="213" y2="69" stroke="#000" strokeWidth="1.5" />
            </g>

            {/* Trailer Rear Wheel 1 */}
            <g className="wheel wheel-rear1">
              <circle cx="55" cy="69" r="11" fill="url(#wheelGrad)" stroke="#1e293b" strokeWidth="2" />
              <circle cx="55" cy="69" r="5" fill="#cbd5e1" />
              <line x1="55" y1="58" x2="55" y2="80" stroke="#000" strokeWidth="1.5" />
              <line x1="44" y1="69" x2="66" y2="69" stroke="#000" strokeWidth="1.5" />
            </g>

            {/* Trailer Rear Wheel 2 */}
            <g className="wheel wheel-rear2">
              <circle cx="30" cy="69" r="11" fill="url(#wheelGrad)" stroke="#1e293b" strokeWidth="2" />
              <circle cx="30" cy="69" r="5" fill="#cbd5e1" />
              <line x1="30" y1="58" x2="30" y2="80" stroke="#000" strokeWidth="1.5" />
              <line x1="19" y1="69" x2="41" y2="69" stroke="#000" strokeWidth="1.5" />
            </g>
          </svg>
        </div>
      </div>

      {/* Floating Glassmorphic Login Card (White & Orange Scheme) */}
      <div className="relative z-30 max-w-md w-full px-6 py-12">
        <div className="floating-card backdrop-blur-xl bg-white/75 border border-white/60 rounded-3xl p-8 md:p-10 shadow-[0_30px_60px_rgba(249,115,22,0.06)] hover:shadow-[0_30px_60px_rgba(249,115,22,0.1)] transition-all duration-500">
          
          {/* Card Top Logo / Branding */}
          <div className="stagger-1 text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">RoadKings</h1>
            <p className="text-orange-500 text-[11px] font-bold tracking-widest uppercase mt-1">
              Fleet Management System
            </p>
          </div>

          <div className="stagger-2 mb-6 text-center">
            <h2 className="text-lg font-semibold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 text-xs mt-1">
              Enter your credentials to dispatch your fleet
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="stagger-3 p-3.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold border border-red-150 animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="stagger-3 space-y-2">
              <Label htmlFor="email" className="text-slate-700 text-xs font-medium pl-1">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="manager@roadkings.com"
                defaultValue="manager@roadkings.com"
                className="h-11 rounded-xl bg-white/95 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-200"
                required
              />
            </div>

            {/* Password Field */}
            <div className="stagger-4 space-y-2">
              <div className="flex items-center justify-between pl-1">
                <Label htmlFor="password" className="text-slate-700 text-xs font-medium">Password</Label>
                <button
                  type="button"
                  className="text-xs text-orange-500 hover:text-orange-600 hover:underline font-semibold transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  defaultValue="password123"
                  className="h-11 rounded-xl bg-white/95 border-slate-200 text-slate-900 placeholder-slate-400 pr-10 focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/50 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="stagger-5 w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/10 hover:shadow-orange-500/25 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Sign in to Dashboard"}
            </Button>
          </form>

          {/* Footer info */}
          <div className="stagger-6 mt-8 text-center">
            <p className="text-xs text-slate-500">
              Need assistance?{" "}
              <span className="text-orange-500 hover:text-orange-600 font-semibold cursor-pointer hover:underline transition-colors">
                Contact Fleet Admin
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
