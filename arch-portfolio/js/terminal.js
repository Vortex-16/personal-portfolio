/* ============================================
   TERMINAL.JS
   Interactive terminal emulator
   ============================================ */

class Terminal {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.history = document.getElementById('terminal-history');
        this.input = document.getElementById('terminal-input');
        this.commandHistory = [];
        this.historyIndex = -1;
        this.currentPath = '/home/vikash';

        if (this.input) {
            this.init();
        }
    }

    init() {
        this.input.addEventListener('keydown', (e) => this.handleInput(e));
        this.container?.addEventListener('click', () => this.input.focus());
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            this.input.value = '';

            if (command) {
                this.commandHistory.push(command);
                this.historyIndex = this.commandHistory.length;
                this.executeCommand(command);
            } else {
                this.addPrompt();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.commandHistory[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.input.value = '';
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.autoComplete();
        } else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            this.clearTerminal();
        } else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            this.input.value = '';
            this.addOutput('^C');
            this.addPrompt();
        }
    }

    executeCommand(cmdLine) {
        // Add command to history display
        this.addCommand(cmdLine);

        // Parse command and arguments
        const parts = cmdLine.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Execute command
        switch (cmd) {
            case 'help':
                this.cmdHelp(args);
                break;
            case 'neofetch':
                this.cmdNeofetch();
                break;
            case 'ls':
                this.cmdLs(args);
                break;
            case 'cat':
                this.cmdCat(args);
                break;
            case 'cd':
                this.cmdCd(args);
                break;
            case 'pwd':
                this.cmdPwd();
                break;
            case 'clear':
                this.clearTerminal();
                return;
            case 'whoami':
                this.cmdWhoami();
                break;
            case 'date':
                this.cmdDate();
                break;
            case 'uptime':
                this.cmdUptime();
                break;
            case 'skills':
                this.cmdSkills(args);
                break;
            case 'projects':
                this.cmdProjects(args);
                break;
            case 'contact':
                this.cmdContact();
                break;
            case 'github':
                this.cmdGithub();
                break;
            case 'resume':
                this.cmdResume();
                break;
            case 'social':
                this.cmdSocial();
                break;
            case 'open':
                this.cmdOpen(args);
                break;
            case 'exit':
                this.cmdExit();
                break;
            case 'sudo':
                this.cmdSudo(args);
                break;
            case 'cowsay':
                this.cmdCowsay(args);
                break;
            case 'fortune':
                this.cmdFortune();
                break;
            case 'matrix':
                this.cmdMatrix();
                break;
            case 'echo':
                this.cmdEcho(args);
                break;
            case 'uname':
                this.cmdUname(args);
                break;
            case 'pacman':
                this.cmdPacman(args);
                break;
            case 'poweroff':
            case 'shutdown':
                this.cmdPoweroff();
                return;
            case 'reboot':
            case 'restart':
                this.cmdReboot();
                return;
            default:
                this.addOutput(`bash: ${cmd}: command not found\nType 'help' for available commands.`, 'error');
        }

        this.scrollToBottom();
    }

    addCommand(cmd) {
        const entry = document.createElement('div');
        entry.className = 'history-entry';
        entry.innerHTML = `
            <div class="history-command">
                <span class="prompt-user">${USER_DATA.username}@${USER_DATA.hostname}</span>:<span class="prompt-path">${this.getShortPath()}</span>$ ${this.escapeHtml(cmd)}
            </div>
        `;
        this.history.appendChild(entry);
    }

    addOutput(content, type = '') {
        const lastEntry = this.history.lastElementChild;
        if (lastEntry) {
            const output = document.createElement('div');
            output.className = `history-output ${type}`;
            output.innerHTML = content;
            lastEntry.appendChild(output);
        }
    }

    addPrompt() {
        // Just scroll to bottom, prompt is always visible
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.history.scrollTop = this.history.scrollHeight;
    }

    clearTerminal() {
        this.history.innerHTML = '';
    }

    getShortPath() {
        return this.currentPath.replace('/home/vikash', '~');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    autoComplete() {
        const currentValue = this.input.value;
        const commands = Object.keys(TERMINAL_COMMANDS);
        const matches = commands.filter(cmd => cmd.startsWith(currentValue));

        if (matches.length === 1) {
            this.input.value = matches[0] + ' ';
        } else if (matches.length > 1) {
            this.addCommand(currentValue);
            this.addOutput(matches.join('  '));
        }
    }

    // ============================================
    // COMMAND IMPLEMENTATIONS
    // ============================================

    cmdHelp(args) {
        if (args.length > 0 && TERMINAL_COMMANDS[args[0]]) {
            const cmd = TERMINAL_COMMANDS[args[0]];
            this.addOutput(`
<div class="help-output">
    <div class="help-section">
        <div class="help-title">${args[0]}</div>
        <div class="help-cmd">
            <span class="desc">${cmd.description}</span>
        </div>
        <div class="help-cmd">
            <span class="cmd">Usage:</span>
            <span class="desc">${cmd.usage}</span>
        </div>
    </div>
</div>
            `);
            return;
        }

        let output = `
<div class="help-output">
    <div class="help-section">
        <div class="help-title">Available Commands</div>
`;

        Object.entries(TERMINAL_COMMANDS).forEach(([cmd, info]) => {
            output += `
        <div class="help-cmd">
            <span class="cmd">${cmd}</span>
            <span class="desc">${info.description}</span>
        </div>
`;
        });

        output += `
    </div>
</div>
        `;

        this.addOutput(output);
    }

    cmdNeofetch() {
        this.addOutput(`
<div class="neofetch-output" style="display: flex; gap: 20px;">
    <pre class="ascii-art arch-logo" style="color: var(--accent); font-size: 6px; line-height: 1.1;">
                   -\`                    
                  .o+\`                   
                 \`ooo/                   
                \`+oooo:                  
               \`+oooooo:                 
               -+oooooo+:                
             \`/:-:++oooo+:               
            \`/++++/+++++++:              
           \`/++++++++++++++:             
          \`/+++ooooooooooooo/\`           
         ./ooosssso++osssssso+\`          
        .oossssso-\`\`\`\`/ossssss+\`         
       -osssssso.      :ssssssso.        
      :osssssss/        osssso+++.       
     /ossssssss/        +ssssooo/-       
   \`/ossssso+/:-        -:/+osssso+-     
  \`+sso+:-\`                 \`.-/+oso:    
 \`++:.                           \`-/+/   
 .\`                                 \`/   
    </pre>
    <div style="flex: 1;">
        <div><span style="color: var(--green); font-weight: 600;">vikash</span><span style="color: var(--subtext0);">@</span><span style="color: var(--lavender); font-weight: 600;">arch</span></div>
        <div style="color: var(--surface2);">----------------</div>
        <div><span style="color: var(--accent); font-weight: 600;">OS:</span> Arch Linux x86_64</div>
        <div><span style="color: var(--accent); font-weight: 600;">Host:</span> ${USER_DATA.title}</div>
        <div><span style="color: var(--accent); font-weight: 600;">Kernel:</span> MERN Stack v3.0+</div>
        <div><span style="color: var(--accent); font-weight: 600;">Uptime:</span> ${USER_DATA.experience}</div>
        <div><span style="color: var(--accent); font-weight: 600;">Shell:</span> zsh 5.9</div>
        <div><span style="color: var(--accent); font-weight: 600;">DE:</span> Hyprland</div>
        <div><span style="color: var(--accent); font-weight: 600;">Location:</span> ${USER_DATA.location}</div>
        <div><span style="color: var(--accent); font-weight: 600;">Status:</span> <span style="color: var(--green);">● ${USER_DATA.availability}</span></div>
    </div>
</div>
        `);
    }

    cmdLs(args) {
        const path = args[0] || this.currentPath;
        const fullPath = this.resolvePath(path);
        const dir = FILE_SYSTEM[fullPath];

        if (!dir || dir.type !== 'dir') {
            this.addOutput(`ls: cannot access '${path}': No such file or directory`, 'error');
            return;
        }

        let output = '<div class="ls-output">';
        dir.children.forEach(item => {
            const itemPath = fullPath + '/' + item;
            const itemData = FILE_SYSTEM[itemPath];
            const isDir = item.endsWith('/') || (itemData && itemData.type === 'dir');

            output += `<span class="ls-item ${isDir ? 'dir' : 'file'}">${item}${isDir && !item.endsWith('/') ? '/' : ''}</span>`;
        });
        output += '</div>';

        this.addOutput(output);
    }

    cmdCat(args) {
        if (args.length === 0) {
            this.addOutput('cat: missing file operand', 'error');
            return;
        }

        const path = this.resolvePath(args[0]);
        const file = FILE_SYSTEM[path];

        if (!file) {
            this.addOutput(`cat: ${args[0]}: No such file or directory`, 'error');
            return;
        }

        if (file.type === 'dir') {
            this.addOutput(`cat: ${args[0]}: Is a directory`, 'error');
            return;
        }

        this.addOutput(`<div class="cat-output">${this.escapeHtml(file.content)}</div>`);
    }

    cmdCd(args) {
        if (args.length === 0 || args[0] === '~') {
            this.currentPath = '/home/vikash';
            return;
        }

        const newPath = this.resolvePath(args[0]);
        const dir = FILE_SYSTEM[newPath];

        if (!dir || dir.type !== 'dir') {
            this.addOutput(`cd: ${args[0]}: No such file or directory`, 'error');
            return;
        }

        this.currentPath = newPath;
    }

    cmdPwd() {
        this.addOutput(this.currentPath);
    }

    cmdWhoami() {
        this.addOutput(USER_DATA.username);
    }

    cmdDate() {
        this.addOutput(new Date().toString());
    }

    cmdUptime() {
        this.addOutput(`up ${USER_DATA.experience}, 1 user, load average: 0.42, 0.38, 0.35`);
    }

    cmdSkills(args) {
        const category = args[0] || 'all';
        let skills = [];

        if (category === 'all') {
            skills = [
                ...SKILLS_DATA.languages,
                ...SKILLS_DATA.frontend,
                ...SKILLS_DATA.backend,
                ...SKILLS_DATA.tools
            ];
        } else if (SKILLS_DATA[category]) {
            skills = SKILLS_DATA[category];
        } else {
            this.addOutput(`skills: unknown category '${category}'\nAvailable: languages, frontend, backend, tools, all`, 'error');
            return;
        }

        let output = `
<table class="table-output">
    <tr>
        <th>Package</th>
        <th>Version</th>
        <th>Level</th>
    </tr>
`;

        skills.forEach(skill => {
            output += `
    <tr>
        <td>${skill.name}</td>
        <td style="color: var(--green)">${skill.version}</td>
        <td>${skill.levelText}</td>
    </tr>
`;
        });

        output += '</table>';
        this.addOutput(output);
    }

    cmdProjects(args) {
        const filter = args[0] || 'all';
        let projects = PROJECTS_DATA;

        if (filter !== 'all') {
            projects = PROJECTS_DATA.filter(p => p.category === filter);
        }

        if (projects.length === 0) {
            this.addOutput(`No projects found for filter: ${filter}`, 'warning');
            return;
        }

        let output = `Found ${projects.length} projects:\n\n`;

        projects.forEach((p, i) => {
            output += `<span style="color: var(--accent)">${i + 1}.</span> <span style="color: var(--text); font-weight: 600;">${p.title}</span>\n`;
            output += `   ${p.description}\n`;
            output += `   <span style="color: var(--overlay0)">Tags: ${p.tags.join(', ')}</span>\n`;
            if (p.liveUrl && p.liveUrl !== '#') {
                output += `   <a href="${p.liveUrl}" target="_blank" style="color: var(--green)">→ Live Demo</a>\n`;
            }
            output += '\n';
        });

        this.addOutput(output);
    }

    cmdContact() {
        this.addOutput(`
<div style="padding: 10px 0;">
    <div style="color: var(--accent); font-weight: 600; margin-bottom: 10px;">Contact Information</div>
    <div><span style="color: var(--mauve)">Email:</span> <a href="mailto:${USER_DATA.email}" style="color: var(--text)">${USER_DATA.email}</a></div>
    <div><span style="color: var(--mauve)">Location:</span> ${USER_DATA.location}</div>
    <div><span style="color: var(--mauve)">Status:</span> <span style="color: var(--green)">${USER_DATA.availability}</span></div>
</div>
        `);
    }

    cmdGithub() {
        window.open(SOCIAL_LINKS.github.url, '_blank');
        this.addOutput(`Opening GitHub profile: ${SOCIAL_LINKS.github.url}`, 'success');
    }

    cmdResume() {
        const link = document.createElement('a');
        link.href = '../assests/doc/Vikash-Kr-Gupta-Resume (2).pdf';
        link.download = 'Vikash-Gupta-Resume.pdf';
        link.click();
        this.addOutput('Downloading resume...', 'success');
    }

    cmdSocial() {
        let output = '<div style="padding: 10px 0;">';
        output += '<div style="color: var(--accent); font-weight: 600; margin-bottom: 10px;">Social Links</div>';

        Object.entries(SOCIAL_LINKS).forEach(([name, data]) => {
            output += `<div><span style="color: var(--mauve)">${name}:</span> <a href="${data.url}" target="_blank" style="color: var(--text)">${data.url}</a></div>`;
        });

        output += '</div>';
        this.addOutput(output);
    }

    cmdOpen(args) {
        if (args.length === 0) {
            this.addOutput('open: missing window name\nUsage: open <neofetch|terminal|skills|projects|github|mail|files|experience>', 'error');
            return;
        }

        const windowId = args[0].toLowerCase();
        if (windowManager && windowManager.windows.has(windowId)) {
            windowManager.openWindow(windowId);
            this.addOutput(`Opening ${windowId}...`, 'success');
        } else {
            this.addOutput(`open: window '${windowId}' not found`, 'error');
        }
    }

    cmdExit() {
        if (windowManager) {
            windowManager.closeWindow('terminal');
        }
    }

    cmdSudo(args) {
        if (args.length === 0) {
            this.addOutput('sudo: missing command', 'error');
            return;
        }

        const cmd = args.join(' ');

        if (cmd.includes('rm -rf /')) {
            this.addOutput(`
<span style="color: var(--red);">Nice try! 😏</span>
<pre style="color: var(--yellow); font-size: 10px; line-height: 1.2;">
    (\\_/)
    ( •_•)
    / > 🛡️ System protected
</pre>
            `);
            return;
        }

        this.addOutput(`[sudo] password for ${USER_DATA.username}: `, '');
        setTimeout(() => {
            this.addOutput(`
<span style="color: var(--green)">vikash is in the sudoers file. This incident will be reported. 😄</span>
            `);
        }, 500);
    }

    cmdCowsay(args) {
        const message = args.join(' ') || 'Moo! Hire Vikash!';
        this.addOutput(`
<pre style="color: var(--text);">
 ${'_'.repeat(message.length + 2)}
< ${message} >
 ${'-'.repeat(message.length + 2)}
        \\   ^__^                   ||   || ||----  |        |             @
         \\  (oo)\\_______          ||   || ||      |        |         (      )
            (__)\\       )\\/  //   ||___|| ||----  |        |      (           )
                ||----w |   \\//    ||   || ||      |        |         (     )
                ||     ||           ||   || ||----  |_______ |______      u
</pre>
        `);
    }

    cmdFortune() {
        const fortune = FORTUNE_MESSAGES[Math.floor(Math.random() * FORTUNE_MESSAGES.length)];
        this.addOutput(`<div style="color: var(--text); font-style: italic; padding: 10px 0;">"${fortune}"</div>`);
    }

    cmdMatrix() {
        this.addOutput('<span style="color: var(--green);">Wake up, Neo...</span>');
        setTimeout(() => {
            this.addOutput('<span style="color: var(--green);">The Matrix has you...</span>');
        }, 1000);
        setTimeout(() => {
            this.addOutput('<span style="color: var(--green);">Follow the white rabbit. 🐰</span>');
        }, 2000);
    }

    cmdEcho(args) {
        this.addOutput(args.join(' '));
    }

    cmdUname(args) {
        if (args.includes('-a')) {
            this.addOutput('Linux arch 6.7.0-arch1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux');
        } else {
            this.addOutput('Linux');
        }
    }

    cmdPacman(args) {
        if (args[0] === '-Qi') {
            this.cmdSkills(args.slice(1));
        } else if (args[0] === '-Syu') {
            this.addOutput(`
:: Synchronizing package databases...
 core is up to date
 extra is up to date
 community is up to date
:: Starting full system upgrade...
 there is nothing to do

<span style="color: var(--green);">All skills up to date! 📚</span>
            `);
        } else {
            this.addOutput(`
Usage: pacman <operation> [...]
Operations:
    -Qi <package>    Query package info (try: pacman -Qi skills)
    -Syu             Full system upgrade
            `);
        }
    }

    cmdPoweroff() {
        this.addOutput(`
<span style="color: var(--yellow);">::  Stopping all running processes...</span>
<span style="color: var(--green);">[  OK  ]</span> Stopped portfolio services.
<span style="color: var(--green);">[  OK  ]</span> Saved session state.
<span style="color: var(--text);">::  System is powering off...</span>
        `);

        setTimeout(() => {
            document.body.style.transition = 'all 1.5s ease';
            document.body.style.opacity = '0';
            document.body.style.filter = 'brightness(0)';

            setTimeout(() => {
                document.body.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #000; color: #888; font-family: monospace;"><div style="font-size: 14px; margin-bottom: 20px;">System is powered off.</div><button onclick="location.reload()" style="padding: 10px 24px; background: #1a1a2e; color: #cdd6f4; border: 1px solid #45475a; border-radius: 6px; cursor: pointer; font-family: monospace;">⏻ Power On</button></div>';
                document.body.style.opacity = '1';
                document.body.style.filter = '';
            }, 1500);
        }, 800);
    }

    cmdReboot() {
        this.addOutput(`
<span style="color: var(--yellow);">::  Rebooting system...</span>
<span style="color: var(--green);">[  OK  ]</span> Stopped portfolio services.
<span style="color: var(--green);">[  OK  ]</span> Saved session state.
<span style="color: var(--text);">::  System is rebooting...</span>
        `);

        setTimeout(() => {
            location.reload();
        }, 1200);
    }

    resolvePath(path) {
        if (path.startsWith('/')) {
            return path;
        }

        if (path.startsWith('~')) {
            return '/home/vikash' + path.slice(1);
        }

        if (path === '..') {
            const parts = this.currentPath.split('/');
            parts.pop();
            return parts.join('/') || '/';
        }

        return this.currentPath + '/' + path;
    }
}

// Initialize terminal when window opens
let terminal;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        terminal = new Terminal('interactive-terminal');
    }, 3000);
});

// Export for global access
window.Terminal = Terminal;
