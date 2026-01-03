<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>AI Job Tracker Dashboard</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Config -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#38696b",
                        "primary-hover": "#2e5658",
                        "background-light": "#f6f7f7",
                        "background-dark": "#161c1c",
                        "card-dark": "rgba(30, 38, 38, 0.6)",
                        "border-dark": "rgba(255, 255, 255, 0.08)",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "2xl": "2rem", "full": "9999px"},
                    backdropBlur: {
                        'xs': '2px',
                    }
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar for a cleaner look */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #161c1c; 
        }
        ::-webkit-scrollbar-thumb {
            background: #2f3c3d; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #38696b; 
        }
        
        .glass-panel {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        .glass-btn:hover {
            background: rgba(255, 255, 255, 0.08);
        }

        /* Subtle gradient background */
        .bg-gradient-app {
            background: radial-gradient(circle at 50% 0%, #1f2a2a 0%, #161c1c 60%);
        }
    </style>

</head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-white font-display antialiased selection:bg-primary selection:text-white overflow-hidden">
<div class="relative flex h-screen w-full flex-col bg-gradient-app overflow-hidden">
<!-- Header -->
<header class="flex items-center justify-between px-8 py-5 border-b border-border-dark bg-[#161c1c]/80 backdrop-blur-md z-20">
<div class="flex items-center gap-3">
<div class="flex items-center justify-center size-9 rounded-xl bg-gradient-to-br from-primary to-[#2a4f50] text-white shadow-lg shadow-primary/20">
<span class="material-symbols-outlined text-[20px]">bubble_chart</span>
</div>
<h1 class="text-lg font-bold tracking-tight text-white">JobTracker AI</h1>
</div>
<div class="flex items-center gap-4">
<!-- Theme Toggle -->
<button class="flex items-center justify-center size-9 rounded-full text-slate-400 hover:text-white transition-colors glass-btn">
<span class="material-symbols-outlined text-[20px]">dark_mode</span>
</button>
<div class="h-6 w-px bg-white/10 mx-1"></div>
<!-- Logout (Ghost Style) -->
<button class="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all hover:bg-white/5 border border-transparent hover:border-white/10">
<span>Logout</span>
<span class="material-symbols-outlined text-[18px]">logout</span>
</button>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 overflow-y-auto p-8 relative">
<!-- Decorative blurred orb for ambiance -->
<div class="absolute top-10 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
<div class="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#2a4f50]/10 rounded-full blur-[120px] pointer-events-none"></div>
<div class="layout-content-container max-w-6xl mx-auto h-full flex flex-col justify-center">
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
<!-- Left Column: Job Tracking Card -->
<div class="glass-panel rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-primary/30 transition-colors duration-500 shadow-2xl shadow-black/20">
<!-- Subtle gradient overlay -->
<div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
<div class="flex items-center justify-between relative z-10">
<h2 class="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                                Job Applications
                            </h2>
<div class="bg-primary/20 border border-primary/30 text-primary-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm shadow-primary/10">
                                124 TRACKED
                            </div>
</div>
<!-- Main Stats Display -->
<div class="py-4 relative z-10">
<div class="flex items-end gap-2 mb-1">
<span class="text-5xl font-bold text-white tracking-tight">12</span>
<span class="text-lg text-emerald-400 font-medium mb-1.5">+3 today</span>
</div>
<p class="text-slate-400 text-sm">Applications detected this week</p>
</div>
<div class="flex flex-col gap-4 relative z-10 mt-auto">
<button class="relative w-full h-14 bg-primary hover:bg-primary-hover text-white text-base font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.99] flex items-center justify-center gap-2 group/btn overflow-hidden">
<span class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></span>
<span class="material-symbols-outlined">radar</span>
<span>Track Now</span>
</button>
<div class="flex items-center justify-between pt-2">
<a class="text-slate-400 hover:text-primary transition-colors text-sm font-medium flex items-center gap-1 group/link" href="#">
<span>Open Google Sheet</span>
<span class="material-symbols-outlined text-[16px] transition-transform group-hover/link:translate-x-0.5">arrow_forward</span>
</a>
<span class="text-xs text-slate-500 font-mono">Synced: 2m ago</span>
</div>
</div>
</div>
<!-- Right Column: Automation Card -->
<div class="glass-panel rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-primary/30 transition-colors duration-500 shadow-2xl shadow-black/20">
<div class="flex items-center justify-between relative z-10">
<h2 class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
<span class="material-symbols-outlined text-primary">smart_toy</span>
                                Automated Processing
                            </h2>
<!-- Live Indicator -->
<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c2424] border border-white/5">
<span class="relative flex h-2 w-2">
<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
<span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
</span>
<span class="text-[10px] font-bold uppercase tracking-wider text-slate-300">Active</span>
</div>
</div>
<div class="relative z-10 flex-1 flex flex-col justify-center py-2">
<label class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 block">Sync Frequency</label>
<div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
<!-- Manual -->
<button class="group relative flex items-center justify-center py-2.5 px-2 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
<span class="text-xs font-medium text-slate-400 group-hover:text-white">Manual</span>
</button>
<!-- Daily -->
<button class="group relative flex items-center justify-center py-2.5 px-2 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
<span class="text-xs font-medium text-slate-400 group-hover:text-white">Daily</span>
</button>
<!-- Every 3h -->
<button class="group relative flex items-center justify-center py-2.5 px-2 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
<span class="text-xs font-medium text-slate-400 group-hover:text-white">Every 3h</span>
</button>
<!-- Hourly (Active) -->
<button class="relative flex items-center justify-center py-2.5 px-2 rounded-lg bg-primary border border-primary text-white shadow-lg shadow-primary/20 transition-all">
<span class="text-xs font-bold">Hourly</span>
</button>
</div>
</div>
<div class="mt-auto pt-2 relative z-10 border-t border-white/5">
<div class="flex items-center justify-between mt-4">
<div class="flex flex-col">
<span class="text-xs text-slate-500 mb-0.5">Next run</span>
<span class="text-sm font-mono text-white">14:00 PM</span>
</div>
<div class="text-right flex flex-col">
<span class="text-xs text-slate-500 mb-0.5">Last processed</span>
<span class="text-sm font-mono text-white">13:00 PM</span>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Status Bar -->
<footer class="w-full bg-[#111616] border-t border-white/5 py-2 px-6">
<div class="max-w-6xl mx-auto flex items-center justify-between text-xs">
<div class="text-slate-500 font-medium tracking-wide">SYSTEM STATUS</div>
<div class="flex items-center gap-6">
<div class="flex items-center gap-1.5 text-emerald-500">
<span class="material-symbols-outlined text-[14px]" fill="">check_circle</span>
<span class="font-medium">Gmail Connected</span>
</div>
<div class="flex items-center gap-1.5 text-emerald-500">
<span class="material-symbols-outlined text-[14px]" fill="">check_circle</span>
<span class="font-medium">Sheets Linked</span>
</div>
</div>
</div>
</footer>
<!-- Toast Notification (Example) -->
<div class="absolute top-24 right-8 pointer-events-none">
<div class="animate-[slideIn_0.5s_ease-out] glass-panel bg-[#161c1c]/90 border-l-4 border-l-emerald-500 px-4 py-3 rounded-r-lg shadow-xl flex items-center gap-3 min-w-[280px]">
<span class="material-symbols-outlined text-emerald-500">task_alt</span>
<div>
<h4 class="text-sm font-bold text-white">Sync Complete</h4>
<p class="text-xs text-slate-400">3 new applications added.</p>
</div>
</div>
</div>
</div>
<!-- Animation Keyframes -->
<style>
        @keyframes shimmer {
            100% {
                transform: translateX(100%);
            }
        }
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    </style>
</body></html>
