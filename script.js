/* ========================================
   VIKASH GUPTA - MODERN PORTFOLIO JS
   ======================================== */

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initCursor();
    initNavigation();
    initThemeToggle();
    initMusicToggle();
    initScrollProgress();
    initScrollAnimations();
    initTypingEffect();
    initSkillsTabs();
    initProjectsFilter();
    initSkillBars();
    initGitHubStats();    // Fetch real GitHub stats
    initGitHubGraph();    // Initialize contribution graph with theme support
    initCountUp();
    initContactForm();
    initMascot();
    initScrollTop();
    initMagneticButtons();
});

// Loader with Progress
function initLoader() {
    const loader = document.querySelector('.loader');
    const percentEl = document.getElementById('loader-percent');
    const fillEl = document.getElementById('loader-fill');
    const binaryEl = document.getElementById('binary-text');
    const hexEl = document.getElementById('hex-text');
    
    let progress = 0;
    const totalAssets = document.querySelectorAll('img').length + 5; // images + other assets
    let loadedAssets = 0;
    
    // ASCII binary of "VIKASH GUPTA" - each character converted to 8-bit binary
    const name = "VIKASH GUPTA";
    const binaryChars = name.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0'));
    let binaryIndex = 0;
    
    // Generate scrolling binary from name ASCII
    function generateBinary() {
        // Show 4 characters worth of binary (32 bits) at a time, scrolling through
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += binaryChars[(binaryIndex + i) % binaryChars.length];
        }
        binaryIndex = (binaryIndex + 1) % binaryChars.length;
        return result;
    }
    
    // Generate random hex string
    function generateHex() {
        const hex = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
        return '0x ' + hex;
    }
    
    // Update binary and hex text periodically
    const binaryInterval = setInterval(() => {
        if (binaryEl) binaryEl.textContent = generateBinary();
        if (hexEl) hexEl.textContent = generateHex();
    }, 150);
    
    // Track image loading
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.complete) {
            loadedAssets++;
        } else {
            img.addEventListener('load', () => {
                loadedAssets++;
                updateProgress();
            });
            img.addEventListener('error', () => {
                loadedAssets++;
                updateProgress();
            });
        }
    });
    
    // Simulate progress for non-trackable assets
    function simulateProgress() {
        if (progress < 100) {
            // Speed up as we get closer to completion
            const increment = progress < 70 ? Math.random() * 3 + 1 : Math.random() * 5 + 2;
            progress = Math.min(progress + increment, 100);
            updateDisplay();
            
            if (progress < 100) {
                setTimeout(simulateProgress, 50 + Math.random() * 100);
            } else {
                finishLoading();
            }
        }
    }
    
    function updateProgress() {
        const imageProgress = (loadedAssets / totalAssets) * 100;
        progress = Math.max(progress, imageProgress);
        updateDisplay();
    }
    
    function updateDisplay() {
        const displayProgress = Math.floor(progress);
        if (percentEl) percentEl.textContent = String(displayProgress).padStart(3, '0');
        if (fillEl) fillEl.style.width = progress + '%';
    }
    
    function finishLoading() {
        clearInterval(binaryInterval);
        setTimeout(() => {
            loader.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }, 300);
    }
    
    // Start simulated progress
    simulateProgress();
    
    // Fallback: force hide after max time
    setTimeout(() => {
        progress = 100;
        updateDisplay();
        finishLoading();
    }, 4000);
}

// Custom Cursor
function initCursor() {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    if (!cursor || !follower) return;
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        follower.style.left = followerX + 'px';
        follower.style.top = followerY + 'px';
        
        requestAnimationFrame(animate);
    }
    animate();

    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .magnetic');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            follower.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            follower.classList.remove('hover');
        });
    });
}

// Navigation
function initNavigation() {
    const header = document.querySelector('.header');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll header
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile menu
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
    });

    // Close menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('open');
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(l => l.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    });
}

// Theme Toggle
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const body = document.body;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        themeIcon.classList.replace('bx-moon', 'bx-sun');
    }
    
    // Update graph on initial load
    updateGitHubGraph(savedTheme);

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        body.classList.toggle('light-mode');
        
        if (body.classList.contains('light-mode')) {
            themeIcon.classList.replace('bx-moon', 'bx-sun');
            localStorage.setItem('theme', 'light');
            updateGitHubGraph('light');
        } else {
            themeIcon.classList.replace('bx-sun', 'bx-moon');
            localStorage.setItem('theme', 'dark');
            updateGitHubGraph('dark');
        }
    });
}

// Music Toggle
function initMusicToggle() {
    const musicToggle = document.querySelector('.music-toggle');
    const musicIcon = document.getElementById('music-icon');
    const audio = document.getElementById('lofi-music');
    let isPlaying = false;

    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            musicIcon.classList.replace('bx-volume-full', 'bx-volume-mute');
        } else {
            audio.play();
            musicIcon.classList.replace('bx-volume-mute', 'bx-volume-full');
        }
        isPlaying = !isPlaying;
    });
}

// Scroll Progress
function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        progressBar.style.width = progress + '%';
    });
}

// Scroll Animations
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.animate, .animate-left, .animate-right');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animateElements.forEach(el => observer.observe(el));
}

// Typing Effect
function initTypingEffect() {
    const typedText = document.querySelector('.typed-text');
    if (!typedText) return;

    const texts = [
        'modern web apps',
        'beautiful UIs',
        'scalable backends',
        'cool experiences',
        'clean code'
    ];
    
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            typedText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typedText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typingSpeed = 500; // Pause before next word
        }

        setTimeout(type, typingSpeed);
    }
    
    setTimeout(type, 1000);
}

// Skills Tabs
function initSkillsTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(tab).classList.add('active');
            
            // Trigger skill bar animation
            setTimeout(() => initSkillBars(), 100);
        });
    });
}

// Projects Filter
function initProjectsFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            projectCards.forEach(card => {
                const category = card.dataset.category;
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeIn 0.5s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// Skill Bars Animation
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progress = entry.target.dataset.progress;
                entry.target.style.width = progress + '%';
            }
        });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => {
        bar.style.width = '0';
        observer.observe(bar);
    });
}

// ========================================
// GITHUB API INTEGRATION
// ========================================

const GITHUB_USERNAME = 'Vortex-16';
const GITHUB_API_BASE = 'https://api.github.com';

// Cache for GitHub data (localStorage with expiry)
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getCachedData(key) {
    const cached = localStorage.getItem(`github_${key}`);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
    }
    return null;
}

function setCachedData(key, data) {
    localStorage.setItem(`github_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
    }));
}

// Fetch GitHub Stats
async function initGitHubStats() {
    try {
        // Check cache first
        const cachedStats = getCachedData('stats');
        if (cachedStats) {
            updateStatsUI(cachedStats);
            return;
        }

        // Fetch user data
        const userResponse = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}`);
        const userData = await userResponse.json();

        // Fetch all repositories to calculate stars
        const reposResponse = await fetch(`${GITHUB_API_BASE}/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`);
        const reposData = await reposResponse.json();

        // Calculate total stars
        const totalStars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);

        // Fetch commits count (using search API for current year)
        const currentYear = new Date().getFullYear();
        const commitsResponse = await fetch(
            `${GITHUB_API_BASE}/search/commits?q=author:${GITHUB_USERNAME}+committer-date:${currentYear}-01-01..${currentYear}-12-31`,
            { headers: { 'Accept': 'application/vnd.github.cloak-preview' } }
        );
        const commitsData = await commitsResponse.json();

        // Fetch PRs count
        const prsResponse = await fetch(
            `${GITHUB_API_BASE}/search/issues?q=author:${GITHUB_USERNAME}+type:pr`
        );
        const prsData = await prsResponse.json();

        const stats = {
            repos: userData.public_repos || 0,
            stars: totalStars,
            commits: commitsData.total_count || 0,
            prs: prsData.total_count || 0
        };

        // Cache the data
        setCachedData('stats', stats);
        updateStatsUI(stats);

    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        // Use fallback values if API fails
        updateStatsUI({ repos: 20, stars: 15, commits: 500, prs: 30 }, true);
    }
}

function updateStatsUI(stats, isFallback = false) {
    const reposEl = document.getElementById('github-repos');
    const starsEl = document.getElementById('github-stars');
    const commitsEl = document.getElementById('github-commits');
    const prsEl = document.getElementById('github-prs');

    if (reposEl) {
        reposEl.dataset.count = stats.repos;
        animateCountUp(reposEl, stats.repos);
    }
    if (starsEl) {
        starsEl.dataset.count = stats.stars;
        animateCountUp(starsEl, stats.stars);
    }
    if (commitsEl) {
        commitsEl.dataset.count = stats.commits;
        animateCountUp(commitsEl, stats.commits);
    }
    if (prsEl) {
        prsEl.dataset.count = stats.prs;
        animateCountUp(prsEl, stats.prs);
    }

    // Add fallback indicator if using cached/fallback data
    if (isFallback) {
        document.querySelectorAll('.stat-card').forEach(card => {
            card.title = 'Using cached data';
        });
    }
}

function animateCountUp(element, target) {
    element.innerHTML = '0';
    let current = 0;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString() + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, stepTime);
}

// GitHub Activity Graph (using github-readme-activity-graph)
function initGitHubGraph() {
    const graphImg = document.getElementById('github-activity-graph');
    if (!graphImg) return;
    
    // Set initial theme based on saved preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    updateGitHubGraph(savedTheme);
}

function updateGitHubGraph(theme) {
    const graphImg = document.getElementById('github-activity-graph');
    if (!graphImg) return;
    
    const username = 'Vortex-16';
    const baseUrl = 'https://github-readme-activity-graph.vercel.app/graph';
    
    if (theme === 'light') {
        graphImg.src = `${baseUrl}?username=${username}&theme=github-light&hide_border=true&area=true`;
    } else {
        graphImg.src = `${baseUrl}?username=${username}&theme=github-dark&hide_border=true&area=true&bg_color=1a1a1a`;
    }
}

// Count Up Animation (legacy support for non-GitHub stats)
function initCountUp() {
    // GitHub stats are handled by initGitHubStats
    // This function now only handles non-GitHub counters if any exist
    const counters = document.querySelectorAll('.stat-num:not([id^="github-"])');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                if (target > 0) {
                    animateCountUp(entry.target, target);
                }
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// Contact Form
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = form.querySelector('#name').value;
        const email = form.querySelector('#email').value;
        const subject = form.querySelector('#subject').value;
        const message = form.querySelector('#message').value;

        if (!name || !email || !message) {
            swal({
                title: 'Oops!',
                text: 'Please fill in all required fields',
                icon: 'error'
            });
            return;
        }

        // Send email using EmailJS
        emailjs.send('service_vikash__gupta', 'template_u8mh7fk', {
            from_name: name,
            from_email: email,
            subject: subject,
            message: message
        }).then(() => {
            swal({
                title: 'Success!',
                text: 'Your message has been sent. I will get back to you soon!',
                icon: 'success'
            });
            form.reset();
        }).catch(() => {
            swal({
                title: 'Error',
                text: 'Something went wrong. Please try again later.',
                icon: 'error'
            });
        });
    });
}

// Mascot Animation
function initMascot() {
    const mascot = document.getElementById('form-mascot');
    const mascotMsg = document.getElementById('mascot-msg');
    const formInputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    
    if (!mascot || !mascotMsg) return;

    const messages = [
        'Type away! ',
        'Looking good! ',
        'Almost there! ',
        'Great job! ',
        'Keep going! ',
        'Vroom vroom! '
    ];

    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            mascotMsg.textContent = messages[Math.floor(Math.random() * messages.length)];
        });
        
        input.addEventListener('input', () => {
            if (input.value.length > 0 && input.value.length % 10 === 0) {
                mascotMsg.textContent = messages[Math.floor(Math.random() * messages.length)];
            }
        });
    });
}

// Scroll Top Button
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scroll-top');
    
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Magnetic Buttons
function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0, 0)';
        });
    });
}

// Fade In Animation Keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
