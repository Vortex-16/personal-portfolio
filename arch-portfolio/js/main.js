/**
 * Vikash Arch Portfolio - Main Script
 * Mimics a tiling window manager (Hyprland) environment.
 * VFS + Workspaces + Advanced Shortcuts + Pacman.
 */

// --- Global Config ---
const CONFIG = {
    username: typeof USER_DATA !== 'undefined' ? USER_DATA.username : 'vikash',
    hostname: 'arch',
    termPrompt: typeof USER_DATA !== 'undefined' ? `${USER_DATA.username}@arch` : 'vikash@arch',
    installedPackages: ['neofetch', 'vim', 'nano', 'git'] // Default packages
};

// --- Boot Sequence ---
class BootSequence {
    constructor() {
        this.screen = document.getElementById('boot-screen');
        this.textArea = document.getElementById('boot-text');
        this.bootLines = [
            '[ <span class="ok">OK</span> ] Starting Portfolio Engine...',
            '[ <span class="ok">OK</span> ] Loading UI Modules...',
            '[ <span class="ok">OK</span> ] Mounting Projects...',
            '[ <span class="ok">OK</span> ] Initializing Skills Matrix...',
            '[ <span class="ok">OK</span> ] Connecting GitHub...'
        ];
    }

    async start() {
        if (!this.screen) return;

        // Custom ASCII Logo
        // Custom ASCII Logo
        const logo = `
<span style="color:var(--blue)">          /\\        </span>
<span style="color:var(--blue)">         /  \\       </span>   <span style="color:var(--mauve)">V I K A S H   G U P T A</span>
<span style="color:var(--blue)">        / /\\ \\      </span>   <span style="color:var(--subtext0)">----------------------</span>
<span style="color:var(--blue)">       / ____ \\     </span>   <span style="color:var(--text)">CSE Student | Full-Stack | Web3</span>
<span style="color:var(--blue)">      /_/    \\_\\    </span>
<span style="color:var(--blue)">        ARCH LINUX PORTFOLIO</span>`;

        const logoDiv = document.createElement('div');
        logoDiv.innerHTML = `<pre style="font-size:10px; line-height:1.2; margin-bottom:20px;">${logo}</pre>`;
        this.textArea.appendChild(logoDiv);

        for (const line of this.bootLines) {
            await this.typeLine(line);
        }

        await this.wait(500);
        this.screen.classList.add('hidden');

        VFS.init();
        WindowManager.init();
        setTimeout(() => WelcomeApp.launch(), 400);
    }

    typeLine(text) {
        return new Promise(resolve => {
            const div = document.createElement('div');
            div.className = 'boot-line';
            div.innerHTML = text;
            this.textArea.appendChild(div);
            this.screen.scrollTop = this.screen.scrollHeight;
            setTimeout(resolve, 30 + Math.random() * 50);
        });
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// --- Virtual File System (VFS) ---
class VirtualFileSystem {
    constructor() {
        this.fs = {};
        this.root = '/';
    }

    init() {
        const rawFS = typeof FILE_SYSTEM !== 'undefined' ? FILE_SYSTEM : {};
        this.fs = JSON.parse(JSON.stringify(rawFS));

        this.mkdir('/home');
        this.mkdir('/home/vikash');
        this.mkdir('/home/vikash/projects');
        this.mkdir('/home/vikash/skills');
        this.mkdir('/home/vikash/Pictures');
        this.mkdir('/home/vikash/Downloads');
        this.mkdir('/home/vikash/Documents');
        this.mkdir('/home/vikash/.config');


        // Populate Projects
        if (typeof PROJECTS_DATA !== 'undefined') {
            PROJECTS_DATA.forEach(p => {
                const safeName = p.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                const projectPath = `/home/vikash/projects/${safeName}`;
                this.mkdir(projectPath);
                this.writeFile(`${projectPath}/README.md`, `# ${p.title}\n\n${p.description}\n\nTags: ${p.tags.join(', ')}\n\n[Live Link](${p.liveUrl || '#'})`);

                if (p.image) {
                    this.writeFile(`${projectPath}/preview.jpg`, `[Image]`, { isImage: true, url: p.image });
                    // Also link to Pictures
                    this.writeFile(`/home/vikash/Pictures/${safeName}.jpg`, `[Image]`, { isImage: true, url: p.image });
                }
            });
        }

        // Populate Skills
        if (typeof SKILLS_DATA !== 'undefined') {
            const skillsContent = Object.entries(SKILLS_DATA).map(([cat, skills]) => {
                return `## ${cat.toUpperCase()}\n` + skills.map(s => `- ${s.name} (${s.levelText})`).join('\n');
            }).join('\n\n');
            this.writeFile('/home/vikash/skills/summary.md', skillsContent);
        }

        // About Me
        if (typeof ABOUT_DATA !== 'undefined') {
            this.writeFile('/home/vikash/Documents/about.md', `# About Me\n\n${ABOUT_DATA.whoAmI}\n\n${ABOUT_DATA.journey}`);
        }

        this.writeFile('/home/vikash/.bashrc', '# .bashrc\nalias ll="ls -la"\nalias neofetch="fastfetch"\n');
    }

    resolvePath(cwd, path) {
        if (path.startsWith('/')) cwd = '/';
        const parts = cwd.split('/').filter(Boolean);
        const pathParts = path.split('/').filter(Boolean);
        for (const p of pathParts) {
            if (p === '.') continue;
            if (p === '..') parts.pop();
            else parts.push(p);
        }
        const resolved = '/' + parts.join('/');
        return resolved === '//' ? '/' : resolved;
    }

    getNode(path) {
        if (path === '/') return this.fs['/'];
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        return this.fs[path];
    }

    exists(path) { return !!this.getNode(path); }
    mkdir(path) {
        if (this.exists(path)) return;
        this.fs[path] = { type: 'dir', children: [] };
        const parent = this.getParentPath(path);
        if (parent && this.fs[parent]) {
            const index = path.lastIndexOf('/');
            const dirname = path.slice(index + 1);
            if (!this.fs[parent].children.includes(dirname)) this.fs[parent].children.push(dirname);
        }
    }
    writeFile(path, content, meta = {}) {
        this.fs[path] = { type: 'file', content, ...meta };
        const parent = this.getParentPath(path);
        if (parent && this.fs[parent]) {
            const index = path.lastIndexOf('/');
            const filename = path.slice(index + 1);
            if (!this.fs[parent].children) this.fs[parent].children = [];
            if (!this.fs[parent].children.includes(filename)) this.fs[parent].children.push(filename);
        }
    }
    getParentPath(path) {
        if (path === '/') return null;
        const index = path.lastIndexOf('/');
        if (index === 0) return '/';
        return path.slice(0, index);
    }
    readdir(path) {
        const node = this.getNode(path);
        return (node && node.type === 'dir') ? node.children || [] : null;
    }
    readFile(path) {
        const node = this.getNode(path);
        return (node && node.type === 'file') ? node : null;
    }
    isFile(path) { return this.getNode(path)?.type === 'file'; }
    isDir(path) { return this.getNode(path)?.type === 'dir'; }
}
const VFS = new VirtualFileSystem();

// --- Window Manager ---
class WindowManager {
    static windows = [];
    static activeWindow = null;
    static container = document.getElementById('workspaces-container');
    static currentWorkspace = 1;

    static init() {
        this.renderWorkspaces();
        setInterval(() => this.updateClock(), 1000);
        this.updateClock();
    }

    static switchToWorkspace(id) {
        if (id < 1 || id > 5) return;
        this.currentWorkspace = id;
        this.windows.forEach(win => {
            if (win.minimized) {
                win.el.style.display = 'none';
            } else {
                win.el.style.display = (win.workspace === id) ? 'flex' : 'none';
            }
        });
        this.renderWorkspaces();
        this.tileWindows();
    }

    static toggleMinimize(id) {
        const win = this.windows.find(w => w.id === id);
        if (!win) return;
        win.minimized = !win.minimized;
        if (win.minimized) {
            win.el.classList.add('minimized');
            win.el.style.display = 'none';
            if (this.activeWindow === win) {
                this.activeWindow = null;
                const others = this.windows.filter(w => !w.minimized && w.workspace === this.currentWorkspace);
                if (others.length > 0) this.focusWindow(others[others.length - 1]);
            }
        } else {
            win.el.classList.remove('minimized');
            win.el.style.display = 'flex';
            this.focusWindow(win);
        }
        this.tileWindows();
    }

    static openWindow(appId, contentGenerator, title = 'Application') {
        const id = `win-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const winEl = document.createElement('div');
        winEl.className = 'window focused';
        winEl.id = id;
        winEl.dataset.app = appId;

        winEl.innerHTML = `
            <div class="window-decoration">
                <div class="window-title-box">
                    <i data-lucide="${this.getIconForApp(appId)}"></i>
                    <span>${title}</span>
                </div>
                <div class="window-controls">
                    <button class="control-btn minimize"></button>
                    <button class="control-btn maximize" onclick="WindowManager.toggleFullscreen('${id}')"></button>
                    <button class="control-btn close" onclick="WindowManager.closeWindowById('${id}')"></button>
                </div>
            </div>
            <div class="window-content">
                ${contentGenerator(id)}
            </div>
        `;

        this.container.appendChild(winEl);
        const winObj = { id, el: winEl, app: appId, workspace: this.currentWorkspace };
        this.windows.push(winObj);
        if (window.lucide) lucide.createIcons();
        this.focusWindow(winObj);
        this.tileWindows();
        winEl.addEventListener('mousedown', () => this.focusWindow(winObj));
    }

    static cycleFocus() {
        const workspaceWindows = this.windows.filter(w => w.workspace === this.currentWorkspace);
        if (workspaceWindows.length < 2) return;
        const currentIndex = workspaceWindows.findIndex(w => w.id === this.activeWindow?.id);
        const nextIndex = (currentIndex + 1) % workspaceWindows.length;
        this.focusWindow(workspaceWindows[nextIndex]);
    }

    static getIconForApp(appId) {
        const map = { 'terminal': 'terminal', 'file-manager': 'folder-open', 'image-viewer': 'image', 'welcome': 'smile', 'editor': 'file-edit', 'browser': 'globe', 'settings': 'settings' };
        return map[appId] || 'app-window';
    }

    static closeWindowById(id) {
        const win = this.windows.find(w => w.id === id);
        if (win) this.closeWindow(win);
    }

    static closeWindow(winObj) {
        if (!winObj) winObj = this.activeWindow;
        if (!winObj) return;
        winObj.el.remove();
        this.windows = this.windows.filter(w => w.id !== winObj.id);
        const workspaceWindows = this.windows.filter(w => w.workspace === this.currentWorkspace);
        if (workspaceWindows.length > 0) this.focusWindow(workspaceWindows[workspaceWindows.length - 1]);
        else this.activeWindow = null;
        this.tileWindows();
    }

    static focusWindow(winObj) {
        if (this.activeWindow) this.activeWindow.el.classList.remove('focused');
        this.activeWindow = winObj;
        winObj.el.classList.add('focused');
        const input = winObj.el.querySelector('input');
        if (input) input.focus();
    }

    static tileWindows() {
        const workspaceWindows = this.windows.filter(w => w.workspace === this.currentWorkspace);
        const count = workspaceWindows.length;
        if (count === 0) return;
        const gap = 5;
        const wC = this.container.offsetWidth;
        const hC = this.container.offsetHeight;

        workspaceWindows.forEach((win, index) => {
            if (win.el.classList.contains('fullscreen')) {
                win.el.style.width = '100%'; win.el.style.height = '100%'; win.el.style.transform = 'translate(0, 0)';
                return;
            }
            let x, y, w, h;
            if (count === 1) { x = 0; y = 0; w = wC; h = hC; }
            else if (count === 2) { w = (wC - gap) / 2; h = hC; x = index * (w + gap); y = 0; }
            else {
                const masterW = (wC - gap) * 0.55;
                const stackW = wC - masterW - gap;
                if (index === 0) { x = 0; y = 0; w = masterW; h = hC; }
                else {
                    const sCount = count - 1;
                    const sH = (hC - (gap * (sCount - 1))) / sCount;
                    x = masterW + gap; w = stackW; h = sH; y = (index - 1) * (sH + gap);
                }
            }
            win.el.style.width = `${w}px`; win.el.style.height = `${h}px`; win.el.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    static toggleFullscreen(id) {
        const win = id ? this.windows.find(w => w.id === id) : this.activeWindow;
        if (!win) return;
        win.el.classList.toggle('fullscreen');
        this.tileWindows();
    }

    static renderWorkspaces() {
        document.getElementById('workspaces').innerHTML = [1, 2, 3, 4, 5].map(i => `
            <div class="workspace-dot ${i === this.currentWorkspace ? 'active' : ''}" 
                 onclick="WindowManager.switchToWorkspace(${i})">
            </div>
        `).join('');
    }

    static updateClock() {
        const now = new Date();
        document.getElementById('clock').textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + now.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

// --- Apps ---
class TerminalApp {
    static instances = {};

    static launch() {
        WindowManager.openWindow('terminal', (winId) => {
            this.instances[winId] = { cwd: '/home/vikash', history: [], historyIndex: -1, isSudo: false, runningApp: null };
            return `
                <div class="terminal-window" id="term-container-${winId}" onclick="document.getElementById('input-${winId}').focus()">
                    <div class="term-output" id="output-${winId}">
                         <div style="margin-bottom:10px">Welcome to Vikash Arch. Kernel 6.7.0-arch1-1</div>
                    </div>
                    <div class="input-line" id="input-line-${winId}">
                        <span class="prompt" id="prompt-${winId}">${this.getPrompt(winId)}</span>
                        <input type="text" class="term-input" id="input-${winId}" autocomplete="off" 
                            onkeydown="TerminalApp.handleInput(event, '${winId}', this)">
                    </div>
                </div>
            `;
        }, 'Terminal - Kitty');
    }

    static getPrompt(winId) {
        const state = this.instances[winId];
        const displayPath = state.cwd.replace('/home/vikash', '~');
        const user = state.isSudo ? 'root' : CONFIG.username;
        const color = state.isSudo ? 'red' : 'green';

        // Fish-like powerline prompt
        return `<span style="background:${color}; color:#000; padding:2px 8px; border-radius:3px 0 0 3px; font-weight:bold;">${user}</span><span style="background:var(--blue); color:#000; padding:2px 8px; border-radius:0 3px 3px 0; font-weight:bold;">${displayPath}</span> <span style="color:var(--text); font-weight:bold; margin-left:5px;">❯</span>`;
    }

    static handleInput(e, winId, input) {
        const state = this.instances[winId];
        if (state.runningApp) return; // Block input if app running

        if (e.key === 'Tab') {
            e.preventDefault();
            this.handleAutocomplete(input.value, state, input);
            return;
        }

        if (e.key === 'Enter') {
            const cmd = input.value;
            const outputDiv = document.getElementById(`output-${winId}`);

            const echo = document.createElement('div');
            echo.innerHTML = `${this.getPrompt(winId)} ${cmd}`;
            outputDiv.appendChild(echo);

            if (cmd.trim()) {
                this.execute(cmd.trim(), winId, outputDiv);
                state.history.push(cmd.trim());
                state.historyIndex = state.history.length;
            }

            input.value = '';
            document.getElementById(`prompt-${winId}`).innerHTML = this.getPrompt(winId);
            document.getElementById(`term-container-${winId}`).scrollTop = document.getElementById(`term-container-${winId}`).scrollHeight;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (state.historyIndex > 0) {
                state.historyIndex--;
                input.value = state.history[state.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (state.historyIndex < state.history.length - 1) {
                state.historyIndex++;
                input.value = state.history[state.historyIndex];
            } else {
                state.historyIndex = state.history.length;
                input.value = '';
            }
        }
    }

    static handleAutocomplete(currentVal, state, inputEl) {
        const parts = currentVal.trim().split(/\s+/);
        const lastArg = parts[parts.length - 1] || '';
        const children = VFS.readdir(state.cwd) || [];
        const matches = children.filter(c => c.startsWith(lastArg));
        if (matches.length === 1) {
            const newVal = currentVal.slice(0, currentVal.lastIndexOf(lastArg)) + matches[0];
            inputEl.value = newVal;
        }
    }

    static execute(cmdStr, winId, output) {
        const state = this.instances[winId];
        const parts = cmdStr.split(/\s+/);
        // Handle sudo
        if (parts[0] === 'sudo') {
            const subCmd = parts.slice(1).join(' ');
            if (!subCmd) { this.print(output, 'sage: sudo <command>'); return; }
            this.print(output, '[sudo] password for vikash: **********');
            setTimeout(() => {
                state.isSudo = true;
                this.executeLogic(subCmd, winId, output, parts.slice(1));
                state.isSudo = false;
            }, 300);
            return;
        }
        this.executeLogic(cmdStr, winId, output, parts);
    }

    static executeLogic(cmdStr, winId, output, parts) {
        const cmd = parts[0];
        const args = parts.slice(1);
        const state = this.instances[winId];

        switch (cmd) {
            case 'clear': output.innerHTML = ''; break;
            case 'pwd': this.print(output, state.cwd); break;
            case 'whoami': this.print(output, state.isSudo ? 'root' : CONFIG.username); break;
            case 'users': this.print(output, CONFIG.username); break;
            case 'date': this.print(output, new Date().toString()); break;
            case 'uptime': this.print(output, 'up 1337 days, 4 hours, 20 minutes'); break;
            case 'exit': WindowManager.closeWindowById(winId); break;

            case 'cd':
                const t = args[0] || '/home/vikash';
                const np = VFS.resolvePath(state.cwd, t);
                if (VFS.isDir(np)) state.cwd = np;
                else this.print(output, `cd: no such file or directory: ${t}`, 'var(--red)');
                break;

            case 'ls':
                const lt = args[0] || state.cwd;
                const lp = VFS.resolvePath(state.cwd, lt);
                if (VFS.isDir(lp)) {
                    const c = VFS.readdir(lp) || [];
                    const html = c.map(ch => {
                        const fp = lp === '/' ? `/${ch}` : `${lp}/${ch}`;
                        const isD = VFS.isDir(fp);
                        return `<span style="color:${isD ? 'var(--blue)' : 'var(--text)'}; margin-right:15px">${ch}${isD ? '/' : ''}</span>`;
                    }).join('');
                    this.print(output, html || '(empty)');
                } else this.print(output, `ls: cannot access '${lt}'`, 'var(--red)');
                break;

            case 'cat':
                if (!args[0]) this.print(output, 'Usage: cat <filename>');
                else {
                    const cp = VFS.resolvePath(state.cwd, args[0]);
                    const f = VFS.readFile(cp);
                    if (f) this.print(output, f.content.replace(/\n/g, '<br>'));
                    else this.print(output, `cat: ${args[0]}: No such file`, 'var(--red)');
                }
                break;

            case 'mkdir':
                if (args[0]) VFS.mkdir(VFS.resolvePath(state.cwd, args[0]));
                break;

            case 'help':
                this.print(output, `
                    <div style="color:var(--text); line-height:1.5;">
                        <span style="color:var(--blue)">Vikash Arch Shell v1.0</span><br>
                        Available commands:<br>
                        - <b style="color:var(--green)">Core</b>: cd, ls, cat, mkdir, clear, exit<br>
                        - <b style="color:var(--green)">System</b>: whoami, date, uptime, sudo, neofetch<br>
                        - <b style="color:var(--green)">Pacman</b>: <span style="color:var(--yellow)">pacman -S &lt;pkg&gt;</span> (try: cava, asciiquarium)<br>
                        - <b style="color:var(--green)">Apps</b>: fastfetch, cava, asciiquarium (install first!)
                    </div>
                `);
                break;

            case 'pacman':
                if (args[0] === '-S' && args[1]) {
                    const pkg = args[1];
                    if (CONFIG.installedPackages.includes(pkg)) {
                        this.print(output, `warning: ${pkg} is already installed`);
                    } else {
                        this.runPacman(pkg, output, () => {
                            CONFIG.installedPackages.push(pkg);
                            this.print(output, `${pkg} installed successfully.`);
                        });
                    }
                } else {
                    this.print(output, 'usage: pacman -S <package_name>');
                }
                break;

            case 'nano':
            case 'vim':
                if (args[0]) {
                    let cp = VFS.resolvePath(state.cwd, args[0]);
                    if (VFS.isDir(cp)) {
                        this.print(output, `${cmd}: ${args[0]}: Is a directory`, 'var(--red)');
                    } else {
                        if (!VFS.exists(cp)) {
                            VFS.writeFile(cp, ''); // Create empty file
                        }
                        EditorApp.launch(cp);
                    }
                } else {
                    this.print(output, `Usage: ${cmd} <filename>`);
                }
                break;

            case 'neofetch':
            case 'fastfetch':
                this.print(output, this.getNeofetch());
                break;

            case 'cava':
                if (!CONFIG.installedPackages.includes('cava')) { this.print(output, 'cava not found. Try: sudo pacman -S cava', 'var(--red)'); break; }
                this.runCava(winId, output);
                break;

            case 'asciiquarium':
                if (!CONFIG.installedPackages.includes('asciiquarium')) { this.print(output, 'asciiquarium not found. Try: sudo pacman -S asciiquarium', 'var(--red)'); break; }
                this.runAsciiquarium(winId, output);
                break;

            case 'matrix': // Easter egg
                this.runmatrix(winId, output);
                break;

            default: this.print(output, `zsh: command not found: ${cmd}`, 'var(--red)');
        }
    }

    static print(output, html, color) {
        const d = document.createElement('div');
        if (color) d.style.color = color;
        d.innerHTML = html;
        output.appendChild(d);
    }

    // --- Visual Apps Impl ---

    static runPacman(pkg, output, done) {
        // Simple progress simulation
        const bars = ['[>          ]', '[==>        ]', '[====>      ]', '[======>    ]', '[========>  ]', '[==========>]'];
        let i = 0;
        const line = document.createElement('div');
        output.appendChild(line);

        const int = setInterval(() => {
            if (i >= bars.length) {
                clearInterval(int);
                line.textContent = `(1/1) installing ${pkg}... [OK]`;
                done();
            } else {
                line.textContent = `resolving dependencies... ${bars[i]} 100%`;
                i++;
            }
        }, 150);
    }

    static runCava(winId, output) {
        const container = document.getElementById(`term-container-${winId}`);
        const originalContent = container.innerHTML;

        container.innerHTML = `<div id="cava-${winId}" style="display:flex; align-items:flex-end; gap:2px; height:100%; padding:20px 0; justify-content:center; background:var(--base);"></div>`;
        const cavaEl = document.getElementById(`cava-${winId}`);

        // Generate bars
        const bars = [];
        for (let i = 0; i < 30; i++) {
            const b = document.createElement('div');
            b.style.width = '10px';
            b.style.background = 'linear-gradient(to top, var(--blue), var(--mauve))';
            cavaEl.appendChild(b);
            bars.push(b);
        }

        const int = setInterval(() => {
            if (!document.getElementById(`cava-${winId}`)) { clearInterval(int); return; }
            bars.forEach(b => {
                b.style.height = Math.floor(Math.random() * 80) + '%';
            });
        }, 80);

        // Exit listener
        const exit = (e) => {
            if (e.key === 'q' || e.key === 'c' && e.ctrlKey) {
                document.removeEventListener('keydown', exit);
                clearInterval(int);
                container.innerHTML = originalContent;
                // Re-bind input
                const inp = container.querySelector('input');
                if (inp) inp.focus();
                // We lost the output reference, but that's okay for reset
                this.instances[winId].runningApp = null;
            }
        };
        document.addEventListener('keydown', exit);
    }

    static runAsciiquarium(winId, output) {
        const container = document.getElementById(`term-container-${winId}`);
        const originalContent = container.innerHTML;

        container.innerHTML = `<pre id="fish-${winId}" style="height:100%; display:flex; align-items:center; justify-content:center; color:var(--blue); font-size:12px;"></pre>`;
        const fishEl = document.getElementById(`fish-${winId}`);

        const frames = [
            `>))'>     <'))<`,
            `  >))'> <'))<  `,
            `    >))'>   <'))<`
        ];
        let f = 0;

        const int = setInterval(() => {
            if (!document.getElementById(`fish-${winId}`)) { clearInterval(int); return; }
            fishEl.textContent = frames[f];
            f = (f + 1) % frames.length;
        }, 200);

        const exit = (e) => {
            if (e.key === 'q' || e.key === 'c' && e.ctrlKey) {
                document.removeEventListener('keydown', exit);
                clearInterval(int);
                container.innerHTML = originalContent;
                this.instances[winId].runningApp = null;
            }
        };
        document.addEventListener('keydown', exit);
    }

    static getNeofetch() {
        return `
            <div style="display:flex; gap: 30px; color: var(--text); padding:10px;">
                 <pre style="color:var(--blue); font-size:10px; line-height:1.1; font-weight:bold;">
   _    ____   ____ _   _ 
  / \\  |  _ \\ / ___| | | |
 / _ \\ | |_) | |   | |_| |
/ ___ \\|  _ <| |___|  _  |
_/   \\_\\_| \\_\\\\____|_| |_|
                 </pre>
                <div style="font-size:13px; line-height:1.4;">
                    <div style="color:var(--mauve); font-weight:bold; margin-bottom:5px;">VIKASH GUPTA :: DEV MODE</div>
                    <div style="color:var(--subtext1); margin-bottom:10px;">-----------------------</div>
                    
                    <div style="display:flex; gap:10px;">
                        <span style="color:var(--green)">$ whoami</span>
                        <span>> vikash</span>
                    </div>
                    
                    <div style="display:flex; gap:10px;">
                        <span style="color:var(--green)">$ tech-stack --list</span>
                        <span>> MERN, C, Java, HTML, CSS, JS, Web3</span>
                    </div>

                    <div style="display:flex; gap:10px;">
                        <span style="color:var(--green)">$ status</span>
                        <span>> Building. Learning. Shipping.</span>
                    </div>
                </div>
            </div>
        `;
    }
}


class FileManagerApp {
    static launch(path = '/home/vikash') {
        WindowManager.openWindow('file-manager', (id) => `
            <div class="file-manager" id="fm-${id}" data-path="${path}">
                ${this.renderContent(path, id)}
            </div>
        `, 'File Manager - Thunar');
    }

    static renderContent(path, winId) {
        const children = VFS.readdir(path);
        let itemsHtml = '';
        if (children) {
            children.forEach(name => {
                const fullPath = path === '/' ? `/${name}` : `${path}/${name}`;
                const isDir = VFS.isDir(fullPath);
                let icon = isDir ? 'folder' : (name.match(/\.(jpg|png)$/) ? 'image' : 'file-text');
                itemsHtml += `
                    <div class="fm-item" onclick="FileManagerApp.handleClick('${fullPath}', ${isDir}, '${winId}')">
                        <i data-lucide="${icon}" class="fm-icon"></i>
                        <span class="fm-label">${name}</span>
                    </div>`;
            });
        }
        let upHtml = '';
        if (path !== '/') {
            const parent = VFS.getParentPath(path);
            upHtml = `<div class="fm-item" onclick="FileManagerApp.handleClick('${parent}', true, '${winId}')">
                    <i data-lucide="arrow-up-left" class="fm-icon" style="color:var(--subtext0)"></i>
                    <span class="fm-label">..</span>
                </div>`;
        }
        return `
            <div class="fm-toolbar">
                <button class="control-btn" style="background:var(--surface1); width:28px; height:28px;" onclick="FileManagerApp.handleClick('/home/vikash', true, '${winId}')">
                    <i data-lucide="home" style="width:14px;"></i>
                </button>
                <div class="fm-path">${path}</div>
            </div>
            <div class="fm-grid">${upHtml}${itemsHtml}</div>
        `;
    }

    static handleClick(path, isDir, winId) {
        if (isDir) {
            const container = document.getElementById(`fm-${winId}`);
            if (container) {
                container.dataset.path = path;
                container.innerHTML = this.renderContent(path, winId);
                if (window.lucide) lucide.createIcons();
            }
        } else {
            const fileObj = VFS.readFile(path);
            if (path.match(/\.(jpg|jpeg|png)$/)) {
                ImageViewerApp.launch(path, fileObj.url);
            } else if (path.match(/\.pdf$/) && fileObj && fileObj.downloadUrl) {
                const link = document.createElement('a');
                link.href = fileObj.downloadUrl;
                link.download = path.split('/').pop();
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                EditorApp.launch(path);
            }
        }
    }
}

class ImageViewerApp {
    static launch(path, url) {
        WindowManager.openWindow('image-viewer', () => `<div class="image-viewer"><img src="${url || '#'}" alt="Image"></div>`, `Viewnior - ${path.split('/').pop()}`);
    }
}

class WelcomeApp {
    static launch() {
        WindowManager.openWindow('welcome', () => `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; text-align:center; padding:30px; background: linear-gradient(135deg, rgba(30,30,46,0.9), rgba(17,17,27,0.9)); overflow-y: auto;">
                <i data-lucide="monitor" style="width:64px; height:64px; color:var(--blue); margin-bottom:20px;"></i>
                <h1 style="color:var(--mauve); margin-bottom:10px; font-size: 2rem;">Welcome to Vikash Arch</h1>
                <p style="color:var(--subtext0); margin-bottom:20px; max-width: 400px; line-height: 1.6;">
                    Interactive Portfolio OS <br>
                    Explore by double-clicking icons or using the terminal. Try <b>sudo pacman -S cava</b> for magic!
                </p>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; width: 100%; max-width: 400px;">
                    <button onclick="TerminalApp.launch()" class="welcome-btn">
                        <i data-lucide="terminal"></i> Terminal
                    </button>
                    <button onclick="FileManagerApp.launch()" class="welcome-btn">
                        <i data-lucide="folder"></i> Files
                    </button>
                </div>
                <div style="margin-top:25px;">
                    <button onclick="WelcomeApp.showGuidePopup()" style="padding: 10px 20px; border-radius: 8px; border: 1px solid var(--blue); background: rgba(137, 180, 250, 0.1); color: var(--blue); cursor: pointer; font-weight: 600; display:flex; align-items:center; gap:8px;">
                        <i data-lucide="book-open"></i> Open Guide
                    </button>
                </div>
            </div>
            <style>
                .welcome-btn { padding:15px; border-radius:12px; border: 1px solid var(--surface1); background:var(--surface0); color:var(--text); cursor:pointer; font-weight:600; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: all 0.2s; }
                .welcome-btn:hover { background: var(--surface1); transform: translateY(-2px); border-color: var(--blue); }
                .guide-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.9); opacity: 0; background: var(--mantle); border: 1px solid var(--surface1); padding: 30px; border-radius: 12px; z-index: 9999; box-shadow: 0 20px 50px rgba(0,0,0,0.5); transition: all 0.3s; color: var(--text); min-width: 300px; pointer-events: none; }
                .guide-popup.active { transform: translate(-50%, -50%) scale(1); opacity: 1; pointer-events: auto; }
                .guide-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9998; opacity: 0; transition: opacity 0.3s; pointer-events: none; }
                .guide-overlay.active { opacity: 1; pointer-events: auto; }
            </style>
        `, 'Welcome');
    }

    static showGuidePopup() {
        if (!document.getElementById('guide-popup')) {
            const popup = document.createElement('div');
            popup.id = 'guide-popup';
            popup.className = 'guide-popup';
            popup.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom: 1px solid var(--surface1); padding-bottom: 10px;">
                    <h2 style="color:var(--blue); font-size:18px; margin:0; display:flex; align-items:center; gap:8px;"><i data-lucide="book-open"></i> User Guide</h2>
                    <button onclick="WelcomeApp.closeGuidePopup()" style="background:transparent; border:none; color:var(--text); cursor:pointer;"><i data-lucide="x"></i></button>
                </div>
                <ul style="list-style:none; padding:0; margin:0; font-size:14px; line-height:1.8; color:var(--subtext1);">
                    <li><b style="color:var(--text);">Alt+Enter:</b> Open terminal quickly.</li>
                    <li><b style="color:var(--text);">Drag:</b> Grab the top bar to move windows.</li>
                    <li><b style="color:var(--text);">Maximize:</b> Double-click any window's top bar.</li>
                    <li><b style="color:var(--text);">Commands:</b> Run <b>help</b>, <b>projects</b>, or <b>ls</b>.</li>
                </ul>
            `;
            const overlay = document.createElement('div');
            overlay.id = 'guide-overlay';
            overlay.className = 'guide-overlay';
            overlay.onclick = WelcomeApp.closeGuidePopup;

            document.body.appendChild(overlay);
            document.body.appendChild(popup);
            if (window.lucide) window.lucide.createIcons();
        }
        
        setTimeout(() => {
            document.getElementById('guide-popup').classList.add('active');
            document.getElementById('guide-overlay').classList.add('active');
        }, 10);
    }

    static closeGuidePopup() {
        const popup = document.getElementById('guide-popup');
        const overlay = document.getElementById('guide-overlay');
        if (popup && overlay) {
            popup.classList.remove('active');
            overlay.classList.remove('active');
            setTimeout(() => {
                popup.remove();
                overlay.remove();
            }, 300);
        }
    }
}

class EditorApp {
    static launch(path) {
        const file = VFS.readFile(path);
        WindowManager.openWindow('editor', (id) => `
            <div style="padding:0; height:100%; display:flex; flex-direction:column;">
                <div style="display:flex; justify-content: space-between; padding: 5px 10px; background: var(--surface0); border-bottom: 1px solid var(--surface1);">
                    <span style="font-size: 12px; color: var(--subtext1);">Editing: ${path}</span>
                    <button onclick="VFS.writeFile('${path}', document.getElementById('textarea-${id}').value); this.innerText='Saved!'; setTimeout(()=>this.innerText='Save', 1000);" style="background: var(--blue); color: var(--crust); border: none; border-radius: 4px; padding: 2px 10px; cursor: pointer; font-size: 11px; font-weight: bold;">Save</button>
                </div>
                <textarea id="textarea-${id}" style="flex:1; background:var(--base); color:var(--text); border:none; padding:15px; font-family:var(--font-mono); resize:none; outline:none;">${file ? file.content : ''}</textarea>
            </div>
        `, `Nano - ${path.split('/').pop()}`);
    }
}

class ShortcutManager {
    static init() {
        document.addEventListener('keydown', (e) => {
            const isMod = e.metaKey || e.altKey;
            if (isMod) {
                if (['1', '2', '3', '4', '5'].includes(e.key)) { e.preventDefault(); WindowManager.switchToWorkspace(parseInt(e.key)); }
                if (e.key === 'Enter') { e.preventDefault(); TerminalApp.launch(); }
                if (e.key === 'q') WindowManager.closeWindow();
                if (e.key === ' ') { e.preventDefault(); Rofi.toggle(); }
                if (e.key === 'f') WindowManager.toggleFullscreen();
                if (e.key === 'Tab') { e.preventDefault(); WindowManager.cycleFocus(); }
            }
            if (e.key === 'Escape' && Rofi.isOpen) Rofi.toggle();
        });
    }
}

class Rofi {
    static isOpen = false;
    static init() {
        const overlay = document.getElementById('rofi');
        if (!overlay) return;
        this.overlay = overlay;
        const input = document.getElementById('rofi-input');
        this.apps = [
            { label: 'Terminal', icon: 'terminal', cmd: () => TerminalApp.launch() },
            { label: 'File Manager', icon: 'folder', cmd: () => FileManagerApp.launch() },
            { label: 'Editor', icon: 'file-edit', cmd: () => EditorApp.launch('/home/vikash/Documents/about.md') },
            { label: 'Firefox', icon: 'globe', cmd: () => window.open('https://google.com') }
        ];
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const term = input.value.toLowerCase();
                const app = this.apps.find(a => a.label.toLowerCase().includes(term));
                if (app) { app.cmd(); this.toggle(); }
            }
            if (e.key === 'Escape') this.toggle();
        });
        overlay.addEventListener('click', (e) => { if (e.target === overlay) this.toggle(); });
    }
    static toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) { this.overlay.classList.remove('hidden'); document.getElementById('rofi-input').focus(); }
        else { this.overlay.classList.add('hidden'); }
    }
}

class SoundManager {
    static ctx = null;
    static unlocked = false;

    static init() {
        const unlock = () => {
            if (this.unlocked) return;
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.ctx.resume().then(() => {
                this.unlocked = true;

            });
        };

        document.addEventListener('click', unlock);
        document.addEventListener('keydown', (e) => {
            if (this.unlocked) this.playClick();
        });
    }

    static playClick() {
        if (!this.ctx || this.ctx.state !== 'running') return;

        try {
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(t + 0.06);
        } catch (e) {
            // Ignore
        }
    }
}

window.addEventListener('load', () => {
    if (window.innerWidth <= 768) {
        document.body.innerHTML = '<div style="background:#1e1e2e; color:#cdd6f4; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center;"><h1>Not Made for Mobile</h1><a href="https://vikash.is-a.dev" style="color:#89b4fa; margin-top:20px;">Visit Mobile Site</a></div>';
        return;
    }
    const boot = new BootSequence();
    boot.start();
    ShortcutManager.init();
    Rofi.init();
    SoundManager.init();
    IslandManager.init();
    if (window.lucide) lucide.createIcons();
    window.addEventListener('resize', () => WindowManager.tileWindows());
});

class IslandManager {
    static audio = new Audio('assets/audio/minimal-technology.mp3');

    static init() {
        const audioBtn = document.getElementById('audio-indicator');
        const island = document.getElementById('dynamic-island');
        const playWrapper = document.getElementById('island-play-wrapper');
        const volSlider = document.querySelector('.volume-slider');

        this.audio.loop = true;
        this.audio.volume = 0.7;

        audioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleIsland();
        });

        document.addEventListener('click', (e) => {
            if (island.classList.contains('expanded') && !island.contains(e.target) && e.target !== audioBtn) {
                this.closeIsland();
            }
        });

        playWrapper.addEventListener('click', () => {
            if (this.audio.paused) {
                const playPromise = this.audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(_ => {
                        // Update Icon
                        playWrapper.innerHTML = `<i data-lucide="pause" class="control-icon"></i>`;
                        if (window.lucide) lucide.createIcons();
                    })
                        .catch(error => {
                            // Silent fail or minimal log
                        });
                }
            } else {
                this.audio.pause();
                // Update Icon
                playWrapper.innerHTML = `<i data-lucide="play" class="control-icon"></i>`;
                if (window.lucide) lucide.createIcons();
            }
        });

        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                this.audio.volume = e.target.value / 100;
            });
        }
    }

    static toggleIsland() {
        const island = document.getElementById('dynamic-island');
        island.classList.toggle('visible');
        setTimeout(() => {
            island.classList.toggle('expanded');
        }, 10); // Slight delay for transition
    }

    static closeIsland() {
        const island = document.getElementById('dynamic-island');
        island.classList.remove('expanded');
        setTimeout(() => {
            island.classList.remove('visible');
        }, 300);
    }
}



