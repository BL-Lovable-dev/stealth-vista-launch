#!/usr/bin/env node

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join Our Waitlist - Get Early Access</title>
    <meta name="description" content="Be among the first to experience groundbreaking innovation. Join our exclusive waitlist for early access and special benefits.">
    <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .hero-pattern { background-image: radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0); background-size: 50px 50px; }
        .float-animation { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        .success-animation { animation: successBounce 0.6s ease-out; }
        @keyframes successBounce { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { transform: scale(1); opacity: 1; } }
    </style>
</head>
<body class="min-h-screen gradient-bg hero-pattern">
    <div class="container mx-auto px-4 py-16">
        <div class="max-w-2xl mx-auto text-center">
            <div class="mb-12">
                <div class="float-animation mb-8">
                    <div class="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                </div>
                <h1 class="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">Join the Future</h1>
                <p class="text-xl text-white/90 mb-8 leading-relaxed">Be among the first to experience groundbreaking innovation. Get exclusive early access and special benefits.</p>
            </div>
            
            <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                <div id="form-container">
                    <h2 class="text-2xl font-semibold text-white mb-6">Reserve Your Spot</h2>
                    <form id="waitlist-form" class="space-y-4">
                        <div>
                            <input type="email" id="email" required placeholder="Enter your email address" class="w-full px-4 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all">
                        </div>
                        <button type="submit" id="submit-btn" class="w-full py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-white/90 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                            <span id="btn-text">Join Waitlist</span>
                            <span id="btn-loading" class="hidden">Joining...</span>
                        </button>
                    </form>
                    <div id="error-message" class="hidden mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200"></div>
                </div>
                
                <div id="success-container" class="hidden success-animation">
                    <div class="text-center">
                        <div class="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-semibold text-white mb-2">You're In!</h3>
                        <p class="text-white/80 mb-6">Welcome to our exclusive waitlist. We'll notify you when early access becomes available.</p>
                    </div>
                </div>
            </div>
            
            <div class="mt-12 grid md:grid-cols-3 gap-6">
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-white mb-2">Early Access</h3>
                    <p class="text-white/70 text-sm">Be the first to try new features before anyone else</p>
                </div>
                
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-white mb-2">Exclusive Community</h3>
                    <p class="text-white/70 text-sm">Join a select group of innovators and early adopters</p>
                </div>
                
                <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-white mb-2">Special Benefits</h3>
                    <p class="text-white/70 text-sm">Get exclusive discounts and premium features</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        const supabaseUrl = '${SUPABASE_URL}';
        const supabaseKey = '${SUPABASE_KEY}';
        
        if (!supabaseUrl || !supabaseKey) {
            console.error('Supabase configuration missing');
            document.getElementById('submit-btn').disabled = true;
            document.getElementById('btn-text').textContent = 'Configuration Error';
            return;
        }
        
        const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

        document.getElementById('waitlist-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            if (!email) return;

            const submitBtn = document.getElementById('submit-btn');
            const btnText = document.getElementById('btn-text');
            const btnLoading = document.getElementById('btn-loading');
            const formContainer = document.getElementById('form-container');
            const successContainer = document.getElementById('success-container');
            const errorMessage = document.getElementById('error-message');

            submitBtn.disabled = true;
            btnText.classList.add('hidden');
            btnLoading.classList.remove('hidden');
            errorMessage.classList.add('hidden');

            try {
                const { data, error } = await supabase
                    .from('waitlist_subscribers')
                    .insert([{ email: email }]);

                if (error) throw error;

                formContainer.classList.add('hidden');
                successContainer.classList.remove('hidden');
                
            } catch (error) {
                console.error('Subscription error:', error);
                
                let errorText = 'Something went wrong. Please try again.';
                if (error.message && error.message.includes('duplicate')) {
                    errorText = 'This email is already on our waitlist!';
                }
                
                errorMessage.textContent = errorText;
                errorMessage.classList.remove('hidden');
                
                submitBtn.disabled = false;
                btnText.classList.remove('hidden');
                btnLoading.classList.add('hidden');
            }
        });
    </script>
</body>
</html>`);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Production waitlist server running on port ' + PORT);
  console.log('Health check available at /health');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});