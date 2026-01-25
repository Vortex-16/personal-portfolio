const USER_DATA = {
    name: 'Vikash Gupta',
    username: 'vikash',
    hostname: 'arch',
    title: 'Full Stack Developer',
    tagline: 'DEVELOPER • CREATOR • EXPLORER',
    email: 'vikasharmy811@gmail.com',
    location: 'Kolkata, India',
    availability: 'Available for work',
    experience: '7+ years coding',
    education: {
        degree: 'B.Tech in Computer Science',
        institution: 'STCET',
        location: 'Kolkata',
        period: '2024 - Present'
    }
};

const SOCIAL_LINKS = {
    github: {
        url: 'https://github.com/Vortex-16',
        username: 'Vortex-16',
        icon: '󰊤'
    },
    linkedin: {
        url: 'https://www.linkedin.com/in/vikash-gupta-16devlop/',
        username: 'vikash-gupta-16devlop',
        icon: '󰌻'
    },
    twitter: {
        url: 'https://x.com/GUPTA16VIKASH',
        username: 'GUPTA16VIKASH',
        icon: '󰕄'
    },
    instagram: {
        url: 'https://www.instagram.com/gupta.16.vikash/',
        username: 'gupta.16.vikash',
        icon: '󰋾'
    }
};

const ABOUT_DATA = {
    whoAmI: "Hey there! I am a Computer Science Engineer and Full Stack Developer with a burning passion for building digital solutions.",
    journey: "Currently pursuing engineering at STCET. From crafting pixel-perfect UIs to architecting robust backend systems, I love every aspect of development.",
    whatDrivesMe: "I believe in writing clean, maintainable code and creating experiences users love.",
    tags: [
        { icon: '󰆍', label: 'Linux Enthusiast' },
        { icon: '󰎙', label: 'MERN Stack' },
        { icon: '󰘦', label: 'Problem Solver' },
        { icon: '󰛊', label: 'Coffee Addict' }
    ]
};

const SKILLS_DATA = {
    languages: [
        { name: 'java', version: '17.0.1-1', desc: 'High-level, class-based, object-oriented language', level: 85, levelText: 'Advanced' },
        { name: 'python', version: '3.11.4-1', desc: 'High-level programming language for general-purpose', level: 80, levelText: 'Advanced' },
        { name: 'javascript', version: 'ES2024-1', desc: 'High-level, interpreted scripting language', level: 90, levelText: 'Advanced' },
        { name: 'c-cpp', version: '20-1', desc: 'Low-level systems programming language', level: 75, levelText: 'Intermediate' },
        { name: 'typescript', version: '5.0-1', desc: 'Typed superset of JavaScript', level: 70, levelText: 'Beginner' }
    ],
    frontend: [
        { name: 'react', version: '18.2.0-1', desc: 'JavaScript library for building user interfaces', level: 88, levelText: 'Advanced' },
        { name: 'html5', version: '5.3-1', desc: 'Markup language for structuring web content', level: 95, levelText: 'Expert' },
        { name: 'css3-scss', version: '3.0-1', desc: 'Stylesheet language with SCSS preprocessor', level: 92, levelText: 'Expert' },
        { name: 'tailwindcss', version: '3.4-1', desc: 'Utility-first CSS framework', level: 85, levelText: 'Advanced' },
        { name: 'bootstrap', version: '5.3-1', desc: 'CSS framework for responsive design', level: 80, levelText: 'Advanced' }
    ],
    backend: [
        { name: 'nodejs', version: '20.10.0-1', desc: 'JavaScript runtime built on Chrome\'s V8 engine', level: 82, levelText: 'Advanced' },
        { name: 'expressjs', version: '4.18-1', desc: 'Fast, unopinionated web framework for Node.js', level: 80, levelText: 'Advanced' },
        { name: 'mongodb', version: '7.0-1', desc: 'Document-oriented NoSQL database', level: 78, levelText: 'Intermediate' },
        { name: 'rest-api', version: '2.0-1', desc: 'RESTful API design and implementation', level: 85, levelText: 'Advanced' },
        { name: 'firebase', version: '10.0-1', desc: 'Backend-as-a-Service platform by Google', level: 72, levelText: 'Intermediate' }
    ],
    tools: [
        { name: 'git', version: '2.43-1', desc: 'Distributed version control system', level: 88, levelText: 'Advanced' },
        { name: 'github', version: 'cli-2.40-1', desc: 'Web-based Git repository hosting', level: 90, levelText: 'Expert' },
        { name: 'vscode', version: '1.85-1', desc: 'Code editor by Microsoft', level: 95, levelText: 'Expert' },
        { name: 'linux', version: '6.7-arch1', desc: 'Unix-like operating system', level: 80, levelText: 'Intermediate' }
    ]
};

const PROJECTS_DATA = [
    {
        id: 1,
        category: 'web',
        title: 'Modern Portfolio Website',
        description: 'Responsive portfolio with dark/light mode, smooth animations, and interactive 3D background effects.',
        image: '../assests/images/Project/modernPortfolio.jpeg',
        tags: ['React', 'Tailwind', '3D Effects'],
        liveUrl: 'https://vikash.is-a.dev',
        githubUrl: null
    },
    {
        id: 2,
        category: 'web',
        title: 'Alpha Chats Platform',
        description: 'Private chat platform for Alpha Coders to discuss projects securely.',
        image: '../assests/images/Project/AlphaChat.png',
        tags: ['React', 'Real-time', 'Private'],
        liveUrl: 'https://alpha-chats.vercel.app',
        githubUrl: null
    },

    {
        id: 3,
        category: 'web 3',
        title: 'Chain Torque',
        description: 'Revolutionary platform with Web3 Marketplace, in-browser CAD editor & AI Copilot.',
        image: null,
        placeholder: { icon: '⛓️', text: 'CAD Service' },
        tags: ['Web3', 'CAD Editor', 'AI Copilot'],
        liveUrl: '#',
        githubUrl: null
    },
    {
        id: 4,
        category: 'web',
        title: 'AI News Web App',
        description: 'AI-powered news aggregator that helps users save time with smart summaries.',
        image: null,
        placeholder: { icon: '󰘦', text: 'AI News' },
        tags: ['AI', 'News', 'Time-Saver'],
        liveUrl: 'https://ktj-ass-4.vercel.app',
        githubUrl: null
    },
    {
        id: 5,
        category: 'web',
        title: 'Maa Janki Hospital',
        description: 'Hospital website with clean UI, animations, bilingual support & embedded Google Maps.',
        image: '../assests/images/Project/MaaJankDrAmrit.png',
        tags: ['Bilingual', 'Healthcare', 'Maps'],
        liveUrl: 'https://maa-janki-hospital-dr-amrit.vercel.app',
        githubUrl: null
    },
    {
        id: 6,
        category: 'web',
        title: 'Alpha Coders Platform',
        description: 'A project done for the Alpha Coders team community.',
        image: '../assests/images/Project/alpha.png',
        tags: ['React', 'Team', 'Community'],
        liveUrl: 'https://alpha-coders.vercel.app',
        githubUrl: null
    },
    {
        id: 7,
        category: 'web',
        title: 'Codigo - Coding Platform',
        description: 'Competitive coding challenge platform for programmers.',
        image: '../assests/images/Project/CODIGO.png',
        tags: ['Competitive', 'Coding', 'Challenges'],
        liveUrl: 'https://codigo-94nz.onrender.com/',
        githubUrl: null
    },
    {
        id: 8,
        category: 'web',
        title: 'QuizMaster App',
        description: 'Interactive quiz application built with React.js.',
        image: '../assests/images/Project/KTJ3.png',
        tags: ['React.js', 'Interactive', 'Quiz'],
        liveUrl: 'https://quizmaster-ktj.netlify.app/',
        githubUrl: null
    },
    {
        id: 9,
        category: 'web',
        title: 'Sudoku Game',
        description: 'Interactive Sudoku puzzle game with clean UI.',
        image: '../assests/images/Project/KTJ2.jpeg',
        tags: ['JavaScript', 'Game', 'Logic'],
        liveUrl: 'https://Vortex-16.github.io/KTJ-ASS2/',
        githubUrl: null
    },
    {
        id: 10,
        category: 'web',
        title: 'AIMS 2.0 - Education Platform',
        description: 'Modern educational platform for study materials, user access & class assignments.',
        image: '../assests/images/Project/AIMS.png',
        tags: ['Next.js', 'Clerk', 'Firebase'],
        liveUrl: 'https://aims-2-0.vercel.app/',
        githubUrl: null
    },
    {
        id: 11,
        category: 'web',
        title: 'Kshitij Summer Camp',
        description: 'Summer camp website for Kshitij 2025 Web Development & AI Workshop.',
        image: '../assests/images/Project/KTJ1.jpeg',
        tags: ['Web Dev', 'AI', 'Workshop'],
        liveUrl: 'https://Vortex-16.github.io/KTJ-ASS1/',
        githubUrl: null
    },
    {
        id: 12,
        category: 'web',
        title: 'PragatiPath',
        description: 'AI-powered personalized learning platform for farmers with progress tracking.',
        image: '../assests/images/Project/PragtiPath.jpg',
        tags: ['AI', 'EdTech', 'Farmers'],
        liveUrl: 'https://pragatipath.onrender.com/',
        githubUrl: null
    },
    {
        id: 13,
        category: 'app',
        title: 'Python Calculator',
        description: 'Feature-rich calculator application built with Python.',
        image: '../assests/images/Project/Python.png',
        tags: ['Python', 'GUI', 'Math'],
        liveUrl: null,
        githubUrl: 'https://github.com/Vortex-16'
    },
    {
        id: 14,
        category: 'app',
        title: 'Student Data Management',
        description: 'Student data management application with Python.',
        image: '../assests/images/Project/Python.png',
        tags: ['Python', 'Database', 'CRUD'],
        liveUrl: null,
        githubUrl: 'https://github.com/Vortex-16'
    },
    {
        id: 15,
        category: 'app',
        title: 'Java Code Repository',
        description: 'Coming soon: Java & C applications.',
        image: '../assests/images/java.png',
        tags: ['Java', 'OOP', 'DSA'],
        liveUrl: null,
        githubUrl: 'https://github.com/Vortex-16/JAVA.git'
    },
    {
        id: 16,
        category: 'app',
        title: 'C Programming Projects',
        description: 'Low-level programming with memory management.',
        image: '../assests/images/Project/c.png',
        tags: ['C', 'Systems', 'Algorithms'],
        liveUrl: null,
        githubUrl: 'https://github.com/Vortex-16/C'
    },
    {
        id: 18,
        category: 'web',
        title: 'DevTrack',
        description: 'AI-powered developer growth platform that combines GitHub analytics, learning streaks, and intelligent insights to showcase consistency, real-world progress, and engineering maturity.',
        image: null,
        placeholder: { icon: '📊', text: 'DevTrack' },
        tags: ['Web', 'AI/ML', 'App'],
        liveUrl: 'https://devtrack-pwkj.onrender.com/',
        githubUrl: 'https://github.com/Alpha4Coders/DevTrack'
    },
    {
        id: 17,
        category: 'other',
        title: 'Software Solutions',
        description: 'Coming soon: End-to-end software development solutions.',
        image: '../assests/images/software.png',
        tags: ['GUI', 'Solutions'],
        liveUrl: null,
        githubUrl: null,
        comingSoon: true
    }
];

const EXPERIENCE_DATA = [
    {
        period: '2024 - Present',
        title: 'Computer Science Student',
        place: 'STCET, Kolkata',
        icon: '🎓',
        description: 'Pursuing B.Tech in CSE. Active in coding clubs, technical events, and hackathons.',
        tags: ['DSA', 'Web Dev', 'Open Source']
    },
    {
        period: '2025 - Present',
        title: 'Hackathon Participant',
        place: 'Multiple Events',
        icon: '󰆧',
        description: 'Built innovative solutions under time constraints. Experience in rapid prototyping.',
        tags: ['Team Lead', 'Innovation', 'Problem Solving']
    },
    {
        period: '2025',
        title: 'Alpha Coders Core Team Member',
        place: 'Coding Community',
        icon: '󰡉',
        description: 'Contributing to community projects, mentoring beginners, organizing sessions.',
        tags: ['Community', 'Mentoring', 'Collaboration']
    },
    {
        period: '2024 - 2025',
        title: 'Self-Taught Developer',
        place: 'Online Learning',
        icon: '󰌢',
        description: 'Started coding journey with web development. Built 12+ projects in 3 months.',
        tags: ['Self-Learning', 'Projects', 'Growth']
    }
];

const GITHUB_CONFIG = {
    username: 'Vortex-16',
    apiBase: 'https://api.github.com',
    cacheDuration: 30 * 60 * 1000,
    graphUrl: 'https://github-readme-activity-graph.vercel.app/graph'
};

const EMAILJS_CONFIG = {
    serviceId: 'service_vikash__gupta',
    templateId: 'template_u8mh7fk',
    publicKey: 'jS_OjCoYjCk6NEZxd'
};

const TYPING_TEXTS = [
    'modern web apps',
    'beautiful UIs',
    'scalable backends',
    'cool experiences',
    'clean code'
];

const TERMINAL_COMMANDS = {
    help: {
        description: 'Show available commands',
        usage: 'help [command]'
    },
    neofetch: {
        description: 'Display system information',
        usage: 'neofetch'
    },
    ls: {
        description: 'List directory contents',
        usage: 'ls [directory]'
    },
    cat: {
        description: 'Display file contents',
        usage: 'cat <filename>'
    },
    cd: {
        description: 'Change directory',
        usage: 'cd <directory>'
    },
    clear: {
        description: 'Clear terminal screen',
        usage: 'clear'
    },
    whoami: {
        description: 'Display current user',
        usage: 'whoami'
    },
    pwd: {
        description: 'Print working directory',
        usage: 'pwd'
    },
    date: {
        description: 'Display current date and time',
        usage: 'date'
    },
    uptime: {
        description: 'Show system uptime',
        usage: 'uptime'
    },
    skills: {
        description: 'List installed skill packages',
        usage: 'skills [category]'
    },
    projects: {
        description: 'Browse project portfolio',
        usage: 'projects [filter]'
    },
    contact: {
        description: 'Show contact information',
        usage: 'contact'
    },
    github: {
        description: 'Open GitHub profile',
        usage: 'github'
    },
    resume: {
        description: 'Download resume',
        usage: 'resume'
    },
    social: {
        description: 'List social media links',
        usage: 'social'
    },
    open: {
        description: 'Open a window',
        usage: 'open <window-name>'
    },
    exit: {
        description: 'Close terminal window',
        usage: 'exit'
    },
    sudo: {
        description: 'Execute with elevated privileges',
        usage: 'sudo <command>'
    },
    cowsay: {
        description: 'Cow says something',
        usage: 'cowsay <message>'
    },
    fortune: {
        description: 'Display a random fortune',
        usage: 'fortune'
    },
    matrix: {
        description: 'Enter the matrix',
        usage: 'matrix'
    }
};

const FORTUNE_MESSAGES = [
    "The best code is no code at all.",
    "First, solve the problem. Then, write the code.",
    "Code is like humor. When you have to explain it, it's bad.",
    "Clean code always looks like it was written by someone who cares.",
    "Programming isn't about what you know; it's about what you can figure out.",
    "The only way to learn a new programming language is by writing programs in it.",
    "Experience is the name everyone gives to their mistakes.",
    "Fix the cause, not the symptom.",
    "Simplicity is the soul of efficiency.",
    "Make it work, make it right, make it fast.",
    "Any fool can write code that a computer can understand.",
    "Debugging is twice as hard as writing the code in the first place.",
    "The best error message is the one that never shows up.",
    "Talk is cheap. Show me the code. — Linus Torvalds",
    "It works on my machine. ¯\\_(ツ)_/¯"
];

const FILE_SYSTEM = {
    '/': {
        type: 'dir',
        children: ['home', 'usr', 'etc', 'var']
    },
    '/home': {
        type: 'dir',
        children: ['vikash']
    },
    '/home/vikash': {
        type: 'dir',
        children: ['Documents', 'Downloads', 'Pictures', 'projects', '.config']
    },
    '/home/vikash/Documents': {
        type: 'dir',
        children: ['resume.pdf', 'about.md', 'contact.txt']
    },
    '/home/vikash/projects': {
        type: 'dir',
        children: PROJECTS_DATA.map(p => p.title.toLowerCase().replace(/\s+/g, '-'))
    },
    '/home/vikash/Documents/resume.pdf': {
        type: 'file',
        content: 'Resume file - Download available',
        downloadUrl: '../assests/doc/Vikash-Kr-Gupta-Resume (2).pdf'
    },
    '/home/vikash/Documents/about.md': {
        type: 'file',
        content: `# About Vikash Gupta\n\n${ABOUT_DATA.whoAmI}\n\n${ABOUT_DATA.journey}\n\n${ABOUT_DATA.whatDrivesMe}`
    },
    '/home/vikash/Documents/contact.txt': {
        type: 'file',
        content: `Contact Information\n==================\nEmail: ${USER_DATA.email}\nLocation: ${USER_DATA.location}\nGitHub: ${SOCIAL_LINKS.github.url}\nLinkedIn: ${SOCIAL_LINKS.linkedin.url}`
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        USER_DATA,
        SOCIAL_LINKS,
        ABOUT_DATA,
        SKILLS_DATA,
        PROJECTS_DATA,
        EXPERIENCE_DATA,
        GITHUB_CONFIG,
        EMAILJS_CONFIG,
        TYPING_TEXTS,
        TERMINAL_COMMANDS,
        FORTUNE_MESSAGES,
        FILE_SYSTEM
    };
}
