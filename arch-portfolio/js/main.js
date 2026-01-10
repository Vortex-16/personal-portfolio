/* ============================================
   MAIN.JS
   Core application initialization
   ============================================ */

// ============================================
// BOOT SEQUENCE
// ============================================

const bootMessages = [
    { text: ':: Booting Arch Linux...', delay: 300 },
    { text: ':: Loading kernel modules...', delay: 200 },
    { text: ':: Starting systemd services...', delay: 250 },
    { text: '[  <span class="ok">OK</span>  ] Started User Login Management.', delay: 200 },
    { text: '[  <span class="ok">OK</span>  ] Started Hyprland Wayland Compositor.', delay: 200 },
    { text: '[  <span class="ok">OK</span>  ] Loading portfolio data for vikash...', delay: 250 },
    { text: '[  <span class="ok">OK</span>  ] Initialized window manager.', delay: 200 },
    { text: '<span class="success">::</span> <span class="success">System ready. Welcome, vikash!</span>', delay: 500, success: true }
];

class BootSequence {
    constructor() {
        this.powerScreen = document.getElementById('power-on-screen');
        this.powerBtn = document.getElementById('power-on-btn');
        this.bootScreen = document.getElementById('boot-screen');
        this.bootText = document.getElementById('boot-text');
        this.progressBar = document.getElementById('boot-progress');
        this.desktop = document.getElementById('desktop');
    }

    async start() {
        if (!this.bootScreen || !this.bootText || !this.desktop) {
            console.error('Boot elements not found');
            this.skipBoot();
            return;
        }

        // If power screen exists, wait for power button click
        if (this.powerScreen && this.powerBtn) {
            this.powerBtn.addEventListener('click', () => this.powerOn());
        } else {
            // No power screen, go directly to boot
            await this.runBootSequence();
        }
    }

    async powerOn() {
        // Hide power screen with animation
        this.powerScreen.classList.add('hidden');

        // Show and run boot sequence
        this.bootScreen.style.display = 'flex';
        await this.delay(500);
        await this.runBootSequence();
    }

    async runBootSequence() {
        const totalMessages = bootMessages.length;

        // Display boot messages
        for (let i = 0; i < totalMessages; i++) {
            const msg = bootMessages[i];
            await this.displayMessage(msg);

            // Update progress bar
            if (this.progressBar) {
                const progress = ((i + 1) / totalMessages) * 100;
                this.progressBar.style.width = `${progress}%`;
            }
        }

        // Complete boot
        await this.delay(800);
        this.complete();
    }

    async displayMessage(msg) {
        const line = document.createElement('div');
        line.className = 'boot-line' + (msg.success ? ' success' : '');
        line.innerHTML = msg.text;

        this.bootText.appendChild(line);
        this.bootText.scrollTop = this.bootText.scrollHeight;

        await this.delay(msg.delay);
    }

    complete() {
        this.bootScreen.classList.add('fade-out');

        setTimeout(() => {
            this.bootScreen.style.display = 'none';
            this.desktop.classList.add('loaded');

            // Initialize terminal after boot
            if (typeof Terminal !== 'undefined') {
                window.terminal = new Terminal('interactive-terminal');
            }

            // Initialize Window Manager
            if (typeof WindowManager !== 'undefined') {
                window.windowManager = new WindowManager();
            }

            // Start background tasks
            if (typeof initializeDesktop === 'function') {
                initializeDesktop();
            }
        }, 500);
    }

    skipBoot() {
        if (this.bootScreen) this.bootScreen.style.display = 'none';
        if (this.desktop) this.desktop.classList.add('loaded');
        initializeDesktop();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================
// CLOCK & WAYBAR
// ============================================

function updateClock() {
    const timeEl = document.getElementById('waybar-time');
    const dateEl = document.getElementById('waybar-date');

    if (timeEl && dateEl) {
        const now = new Date();

        timeEl.textContent = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        dateEl.textContent = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }
}

// ============================================
// GITHUB STATS
// ============================================

const GITHUB_CACHE_KEY = 'github_stats_cache';
const GITHUB_CACHE_DURATION = GITHUB_CONFIG.cacheDuration;

async function fetchGitHubStats() {
    // Check cache first
    const cached = localStorage.getItem(GITHUB_CACHE_KEY);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < GITHUB_CACHE_DURATION) {
            displayGitHubStats(data);
            return;
        }
    }

    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_CONFIG.username}`);
        if (!response.ok) throw new Error('GitHub API error');

        const data = await response.json();

        // Fetch additional repos data for languages/contributions
        const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_CONFIG.username}/repos?per_page=100`);
        const repos = await reposResponse.json();

        // Calculate stats
        const stats = {
            repos: data.public_repos,
            followers: data.followers,
            following: data.following,
            stars: repos.reduce((acc, repo) => acc + repo.stargazers_count, 0),
            forks: repos.reduce((acc, repo) => acc + repo.forks_count, 0),
            languages: getTopLanguages(repos),
            topRepos: repos
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 5)
                .map(r => ({
                    name: r.name,
                    stars: r.stargazers_count,
                    language: r.language,
                    description: r.description
                }))
        };

        // Cache the data
        localStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify({
            data: stats,
            timestamp: Date.now()
        }));

        displayGitHubStats(stats);
    } catch (error) {
        console.error('Failed to fetch GitHub stats:', error);
        displayGitHubFallback();
    }
}

function getTopLanguages(repos) {
    const langs = {};
    repos.forEach(repo => {
        if (repo.language) {
            langs[repo.language] = (langs[repo.language] || 0) + 1;
        }
    });

    return Object.entries(langs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({ name, count }));
}

function displayGitHubStats(stats) {
    // Update stat values - matching HTML element IDs
    const reposEl = document.getElementById('github-repos');
    const commitsEl = document.getElementById('github-commits');
    const starsEl = document.getElementById('github-stars');
    const prsEl = document.getElementById('github-prs');

    if (reposEl) reposEl.textContent = stats.repos;
    if (commitsEl) commitsEl.textContent = stats.followers; // Using followers as proxy
    if (starsEl) starsEl.textContent = stats.stars;
    if (prsEl) prsEl.textContent = stats.forks; // Using forks as proxy

    // Animate meter bars
    const reposMeter = document.getElementById('repos-meter');
    const commitsMeter = document.getElementById('commits-meter');
    const starsMeter = document.getElementById('stars-meter');
    const prsMeter = document.getElementById('prs-meter');

    if (reposMeter) reposMeter.style.width = Math.min(stats.repos * 2, 100) + '%';
    if (commitsMeter) commitsMeter.style.width = Math.min(stats.followers * 5, 100) + '%';
    if (starsMeter) starsMeter.style.width = Math.min(stats.stars * 10, 100) + '%';
    if (prsMeter) prsMeter.style.width = Math.min(stats.forks * 5, 100) + '%';

    // Update languages bar
    const langBar = document.getElementById('gh-languages-bar');
    if (langBar && stats.languages) {
        langBar.innerHTML = '';
        const total = stats.languages.reduce((acc, l) => acc + l.count, 0);

        const colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#3178c6',
            'Python': '#3572A5',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'Shell': '#89e051'
        };

        stats.languages.forEach(lang => {
            const percent = (lang.count / total * 100).toFixed(1);
            const bar = document.createElement('div');
            bar.className = 'lang-segment';
            bar.style.width = `${percent}%`;
            bar.style.backgroundColor = colors[lang.name] || '#8b949e';
            bar.title = `${lang.name}: ${percent}%`;
            langBar.appendChild(bar);
        });
    }

    // Update repo list
    const repoList = document.getElementById('github-repos-list');
    if (repoList && stats.topRepos) {
        repoList.innerHTML = '';
        stats.topRepos.forEach((repo, i) => {
            const row = document.createElement('div');
            row.className = 'htop-row';
            row.innerHTML = `
                <span class="htop-pid">${i + 1}</span>
                <span class="htop-user">vikash</span>
                <span class="htop-cmd">${repo.name}</span>
                <span class="htop-cpu">${repo.language || 'N/A'}</span>
                <span class="htop-mem">⭐ ${repo.stars}</span>
                <span class="htop-time">--:--</span>
                <span class="htop-desc">${(repo.description || '').slice(0, 30)}</span>
            `;
            repoList.appendChild(row);
        });
    }
}

function displayGitHubFallback() {
    // Show placeholder data if API fails
    const reposEl = document.getElementById('github-repos');
    const commitsEl = document.getElementById('github-commits');
    const starsEl = document.getElementById('github-stars');
    const prsEl = document.getElementById('github-prs');

    if (reposEl) reposEl.textContent = '--';
    if (commitsEl) commitsEl.textContent = '--';
    if (starsEl) starsEl.textContent = '--';
    if (prsEl) prsEl.textContent = '--';
}

// ============================================
// PROJECTS GRID
// ============================================

function renderProjects(filter = 'all') {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = '';

    let projects = PROJECTS_DATA;
    if (filter !== 'all') {
        projects = PROJECTS_DATA.filter(p => p.category === filter);
    }

    projects.forEach((project, index) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="project-icon">${project.icon || '📁'}</div>
            <div class="project-info">
                <div class="project-title">${project.title}</div>
                <div class="project-desc">${project.description}</div>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div class="project-actions">
                ${project.liveUrl && project.liveUrl !== '#' ? `
                    <a href="${project.liveUrl}" target="_blank" class="action-btn live" title="Live Demo">
                        <span>🔗</span>
                    </a>
                ` : ''}
                ${project.githubUrl && project.githubUrl !== '#' ? `
                    <a href="${project.githubUrl}" target="_blank" class="action-btn github" title="Source Code">
                        <span>📂</span>
                    </a>
                ` : ''}
            </div>
        `;

        grid.appendChild(card);
    });
}

function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.project-filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            renderProjects(filter);
        });
    });
}

// ============================================
// SKILLS TABS
// ============================================

function renderSkills() {
    const categories = ['languages', 'frontend', 'backend', 'tools'];

    categories.forEach(category => {
        const container = document.getElementById(`skills-${category}`);
        if (!container) return;

        container.innerHTML = '';

        SKILLS_DATA[category].forEach(skill => {
            const row = document.createElement('div');
            row.className = 'pacman-pkg';
            row.innerHTML = `
                <div class="pkg-row">
                    <span class="pkg-label">Name</span>
                    <span class="pkg-value">${skill.name}</span>
                </div>
                <div class="pkg-row">
                    <span class="pkg-label">Version</span>
                    <span class="pkg-value version">${skill.version}</span>
                </div>
                <div class="pkg-row">
                    <span class="pkg-label">Level</span>
                    <span class="pkg-value">${skill.levelText}</span>
                </div>
                <div class="pkg-row skill-bar">
                    <div class="skill-fill" style="width: ${skill.level}%"></div>
                </div>
            `;
            container.appendChild(row);
        });
    });
}

function initSkillsTabs() {
    const tabs = document.querySelectorAll('.skill-tab');
    const contents = document.querySelectorAll('.skill-group');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`skills-${category}`)?.classList.add('active');
        });
    });
}

// ============================================
// CONTACT FORM (EmailJS)
// ============================================

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Show loading state
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Sending...';
        submitBtn.disabled = true;

        const formData = {
            from_name: document.getElementById('sender-name')?.value || '',
            from_email: document.getElementById('sender-email')?.value || '',
            subject: document.getElementById('mail-subject')?.value || 'Portfolio Contact',
            message: document.getElementById('mail-message')?.value || ''
        };

        try {
            if (typeof emailjs !== 'undefined') {
                await emailjs.send(
                    EMAILJS_CONFIG.serviceId,
                    EMAILJS_CONFIG.templateId,
                    formData,
                    EMAILJS_CONFIG.publicKey
                );
            } else {
                throw new Error('EmailJS not loaded');
            }

            // Success
            showNotification('Message sent successfully! 📨', 'success');
            form.reset();
        } catch (error) {
            console.error('Email error:', error);
            showNotification('Failed to send message. Please try again.', 'error');
        }

        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// ============================================
// NOTIFICATIONS
// ============================================

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container') || createNotificationContainer();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

    notification.innerHTML = `
        <span class="notif-icon">${icon}</span>
        <span class="notif-message">${message}</span>
        <button class="notif-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// ============================================
// EXPERIENCE TIMELINE
// ============================================

function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    container.innerHTML = '';

    EXPERIENCE_DATA.forEach((item, index) => {
        const entry = document.createElement('div');
        entry.className = 'timeline-entry';
        entry.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-period">${item.period}</div>
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-company">${item.company || item.institution}</div>
                <div class="timeline-desc">${item.description}</div>
            </div>
        `;
        container.appendChild(entry);
    });
}

// ============================================
// DESKTOP INITIALIZATION
// ============================================

function initializeDesktop() {
    updateClock();
    setInterval(updateClock, 1000);

    fetchGitHubStats();
    renderProjects();
    initProjectFilters();
    renderSkills();
    initSkillsTabs();
    initContactForm();
    renderTimeline();

    // Desktop icons initialized by WindowManager now

    initKeyboardShortcuts();
    initWaybar();
    initContextMenu();
    initMobileDrawer();
    initPowerMenu();
    initMusicToggle();

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
// ============================================
// KEYBOARD SHORTCUTS
// ============================================

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Super + T = Terminal
        if (e.metaKey && e.key === 't') {
            e.preventDefault();
            windowManager?.openWindow('terminal');
        }

        // Super + E = Files
        if (e.metaKey && e.key === 'e') {
            e.preventDefault();
            windowManager?.openWindow('files');
        }

        // Escape = Close focused window
        if (e.key === 'Escape') {
            const focused = document.querySelector('.window.focused');
            if (focused) {
                windowManager?.closeWindow(focused.id);
            }
        }

        // Super + D = Toggle all windows (show desktop)
        if (e.metaKey && e.key === 'd') {
            e.preventDefault();
            windowManager?.minimizeAll();
        }
    });
}

// ============================================
// WAYBAR INTERACTIONS
// ============================================

function initWaybar() {
    // Workspaces click
    const workspaces = document.querySelectorAll('.workspace');
    workspaces.forEach((ws, i) => {
        ws.addEventListener('click', () => {
            const workspaceNum = i + 1;
            if (typeof windowManager !== 'undefined') {
                windowManager.switchWorkspace(workspaceNum);
            }
        });
    });

    // System tray icons
    const volumeBtn = document.querySelector('.volume-btn');
    if (volumeBtn) {
        volumeBtn.addEventListener('click', () => {
            showNotification('Volume controls would go here 🔊', 'info');
        });
    }

    const wifiBtn = document.querySelector('.wifi-btn');
    if (wifiBtn) {
        wifiBtn.addEventListener('click', () => {
            showNotification('Connected to: GitHub_5G 📶', 'info');
        });
    }

    const batteryBtn = document.querySelector('.battery-btn');
    if (batteryBtn) {
        batteryBtn.addEventListener('click', () => {
            showNotification('Battery: 100% (Always plugged in to passion!) ⚡', 'info');
        });
    }
}

// ============================================
// RIGHT-CLICK CONTEXT MENU
// ============================================

function initContextMenu() {
    const desktop = document.getElementById('desktop-area');
    if (!desktop) return;

    desktop.addEventListener('contextmenu', (e) => {
        e.preventDefault();

        // Remove existing menu
        document.querySelectorAll('.context-menu').forEach(m => m.remove());

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;

        menu.innerHTML = `
            <div class="context-item" data-action="terminal">
                <span class="ctx-icon">🖥️</span> Open Terminal
            </div>
            <div class="context-item" data-action="neofetch">
                <span class="ctx-icon">👤</span> About Me
            </div>
            <div class="context-item" data-action="projects">
                <span class="ctx-icon">📁</span> Projects
            </div>
            <div class="context-separator"></div>
            <div class="context-item" data-action="refresh">
                <span class="ctx-icon">🔄</span> Refresh
            </div>
            <div class="context-item" data-action="settings">
                <span class="ctx-icon">⚙️</span> Settings
            </div>
        `;

        document.body.appendChild(menu);

        // Handle clicks
        menu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;

                switch (action) {
                    case 'terminal':
                        windowManager?.openWindow('terminal');
                        break;
                    case 'neofetch':
                        windowManager?.openWindow('neofetch');
                        break;
                    case 'projects':
                        windowManager?.openWindow('projects');
                        break;
                    case 'refresh':
                        location.reload();
                        break;
                    case 'settings':
                        showNotification('Settings panel coming soon! ⚙️', 'info');
                        break;
                }

                menu.remove();
            });
        });

        // Close menu on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            });
        }, 0);
    });
}

// ============================================
// MOBILE APP DRAWER
// ============================================

function initMobileDrawer() {
    const drawer = document.getElementById('mobile-drawer');
    const toggleBtn = document.getElementById('mobile-menu-btn');

    if (!drawer || !toggleBtn) return;

    // Toggle drawer
    toggleBtn.addEventListener('click', () => {
        drawer.classList.toggle('open');
    });

    // Close drawer when clicking app
    drawer.querySelectorAll('.desktop-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const windowId = icon.dataset.window;
            if (windowId && windowManager) {
                windowManager.openWindow(windowId);
                drawer.classList.remove('open');
            }
        });
    });

    // Swipe to close (touch)
    let startY = 0;
    drawer.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });

    drawer.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        if (currentY - startY > 50) {
            drawer.classList.remove('open');
        }
    });
}

// ============================================
// POWER MENU
// ============================================

function initPowerMenu() {
    const powerBtn = document.getElementById('power-btn');
    const powerModal = document.getElementById('power-modal');

    if (!powerBtn || !powerModal) return;

    powerBtn.addEventListener('click', () => {
        powerModal.classList.toggle('active');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!powerBtn.contains(e.target) && !powerModal.contains(e.target)) {
            powerModal.classList.remove('active');
        }
    });

    // Power options
    powerModal.querySelectorAll('.power-option').forEach(option => {
        option.addEventListener('click', () => {
            const action = option.dataset.action;

            switch (action) {
                case 'logout':
                    showNotification('Logging out... (Just kidding! 😄)', 'info');
                    break;
                case 'reboot':
                    showNotification('Rebooting...', 'info');
                    setTimeout(() => location.reload(), 1000);
                    break;
                case 'shutdown':
                    showNotification('Shutting down... Visit again soon! 👋', 'info');
                    setTimeout(() => {
                        document.body.style.transition = 'opacity 1s';
                        document.body.style.opacity = '0';
                    }, 500);
                    break;
            }

            powerModal.classList.remove('active');
        });
    });
}

// ============================================
// MUSIC TOGGLE
// ============================================

function initMusicToggle() {
    const musicBtn = document.getElementById('music-toggle');
    const audio = document.getElementById('lofi-music');

    if (!musicBtn || !audio) return;

    let isPlaying = false;

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            musicBtn.classList.remove('active');
            showNotification('Music paused 🔇', 'info');
        } else {
            audio.play().catch(() => {
                showNotification('Click again to play music 🎵', 'info');
            });
            musicBtn.classList.add('active');
            showNotification('Playing Lo-Fi music 🎵', 'success');
        }
        isPlaying = !isPlaying;
    });
}

// ============================================
// STARTUP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Start boot sequence
    const boot = new BootSequence();
    boot.start();
});

// Export for global access
window.showNotification = showNotification;
window.renderProjects = renderProjects;
window.fetchGitHubStats = fetchGitHubStats;
