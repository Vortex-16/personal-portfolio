/* ============================================
   WINDOW MANAGER
   Hyprland-style window management system
   ============================================ */

class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.highestZIndex = 10;
        this.dragState = null;
        this.resizeState = null;
        
        this.init();
    }
    
    init() {
        // Initialize all windows
        document.querySelectorAll('.window').forEach(window => {
            const windowId = window.dataset.window;
            this.windows.set(windowId, {
                element: window,
                minimized: false,
                maximized: false,
                position: { x: 0, y: 0 },
                size: { width: 0, height: 0 }
            });
            
            this.setupWindowControls(window);
            this.setupDragging(window);
            this.addResizeHandles(window);
        });
        
        // Setup desktop icons
        this.setupDesktopIcons();
        
        // Setup dock
        this.setupDock();
        
        // Position windows initially
        this.positionWindows();
        
        // Open neofetch by default
        setTimeout(() => this.openWindow('neofetch'), 100);
    }
    
    setupWindowControls(window) {
        const closeBtn = window.querySelector('.control.close');
        const minBtn = window.querySelector('.control.minimize');
        const maxBtn = window.querySelector('.control.maximize');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeWindow(window.dataset.window);
            });
        }
        
        if (minBtn) {
            minBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.minimizeWindow(window.dataset.window);
            });
        }
        
        if (maxBtn) {
            maxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMaximize(window.dataset.window);
            });
        }
        
        // Focus on click
        window.addEventListener('mousedown', () => {
            this.focusWindow(window.dataset.window);
        });
        
        // Double click titlebar to maximize
        const titlebar = window.querySelector('.window-titlebar');
        if (titlebar) {
            titlebar.addEventListener('dblclick', () => {
                this.toggleMaximize(window.dataset.window);
            });
        }
    }
    
    setupDragging(window) {
        const titlebar = window.querySelector('.window-titlebar');
        if (!titlebar) return;
        
        titlebar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.titlebar-controls')) return;
            
            const windowData = this.windows.get(window.dataset.window);
            if (windowData.maximized) return;
            
            this.dragState = {
                windowId: window.dataset.window,
                startX: e.clientX,
                startY: e.clientY,
                windowX: window.offsetLeft,
                windowY: window.offsetTop
            };
            
            document.addEventListener('mousemove', this.handleDrag);
            document.addEventListener('mouseup', this.stopDrag);
        });
    }
    
    handleDrag = (e) => {
        if (!this.dragState) return;
        
        const window = this.windows.get(this.dragState.windowId).element;
        const deltaX = e.clientX - this.dragState.startX;
        const deltaY = e.clientY - this.dragState.startY;
        
        const newX = Math.max(0, Math.min(
            this.dragState.windowX + deltaX,
            document.documentElement.clientWidth - 100
        ));
        const newY = Math.max(40, Math.min(
            this.dragState.windowY + deltaY,
            document.documentElement.clientHeight - 100
        ));
        
        window.style.left = newX + 'px';
        window.style.top = newY + 'px';
    }
    
    stopDrag = () => {
        this.dragState = null;
        document.removeEventListener('mousemove', this.handleDrag);
        document.removeEventListener('mouseup', this.stopDrag);
    }
    
    addResizeHandles(window) {
        const handles = ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
        
        handles.forEach(handle => {
            const div = document.createElement('div');
            div.className = `resize-handle ${handle}`;
            div.addEventListener('mousedown', (e) => this.startResize(e, window, handle));
            window.appendChild(div);
        });
    }
    
    startResize(e, window, handle) {
        e.preventDefault();
        
        const windowData = this.windows.get(window.dataset.window);
        if (windowData.maximized) return;
        
        this.resizeState = {
            windowId: window.dataset.window,
            handle,
            startX: e.clientX,
            startY: e.clientY,
            startWidth: window.offsetWidth,
            startHeight: window.offsetHeight,
            startLeft: window.offsetLeft,
            startTop: window.offsetTop
        };
        
        document.addEventListener('mousemove', this.handleResize);
        document.addEventListener('mouseup', this.stopResize);
    }
    
    handleResize = (e) => {
        if (!this.resizeState) return;
        
        const window = this.windows.get(this.resizeState.windowId).element;
        const deltaX = e.clientX - this.resizeState.startX;
        const deltaY = e.clientY - this.resizeState.startY;
        const handle = this.resizeState.handle;
        
        let newWidth = this.resizeState.startWidth;
        let newHeight = this.resizeState.startHeight;
        let newLeft = this.resizeState.startLeft;
        let newTop = this.resizeState.startTop;
        
        if (handle.includes('right')) {
            newWidth = Math.max(300, this.resizeState.startWidth + deltaX);
        }
        if (handle.includes('left')) {
            newWidth = Math.max(300, this.resizeState.startWidth - deltaX);
            newLeft = this.resizeState.startLeft + deltaX;
        }
        if (handle.includes('bottom')) {
            newHeight = Math.max(200, this.resizeState.startHeight + deltaY);
        }
        if (handle.includes('top')) {
            newHeight = Math.max(200, this.resizeState.startHeight - deltaY);
            newTop = this.resizeState.startTop + deltaY;
        }
        
        window.style.width = newWidth + 'px';
        window.style.height = newHeight + 'px';
        window.style.left = newLeft + 'px';
        window.style.top = newTop + 'px';
    }
    
    stopResize = () => {
        this.resizeState = null;
        document.removeEventListener('mousemove', this.handleResize);
        document.removeEventListener('mouseup', this.stopResize);
    }
    
    setupDesktopIcons() {
        // Desktop icons only (not mobile drawer)
        const desktopIcons = document.querySelectorAll('#desktop-icons .desktop-icon');
        
        desktopIcons.forEach(icon => {
            // Double-click to open
            icon.addEventListener('dblclick', (e) => {
                e.preventDefault();
                const windowId = icon.dataset.window;
                icon.classList.add('launching');
                setTimeout(() => icon.classList.remove('launching'), 600);
                this.openWindow(windowId);
            });
            
            // Single click to select
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                desktopIcons.forEach(i => i.classList.remove('active'));
                icon.classList.add('active');
            });
        });
        
        // Mobile: single tap to open (handled in main.js initMobileDrawer)
        
        // Deselect on desktop click
        const desktopArea = document.getElementById('desktop-area');
        if (desktopArea) {
            desktopArea.addEventListener('click', (e) => {
                if (e.target.id === 'desktop-area' || e.target.classList.contains('windows-container')) {
                    desktopIcons.forEach(i => i.classList.remove('active'));
                }
            });
        }
    }
    
    setupDock() {
        const dock = document.getElementById('dock-items');
        if (!dock) return;
        
        dock.addEventListener('click', (e) => {
            const dockItem = e.target.closest('.dock-item');
            if (dockItem) {
                const windowId = dockItem.dataset.window;
                this.restoreWindow(windowId);
            }
        });
    }
    
    positionWindows() {
        let offsetX = 150;
        let offsetY = 80;
        
        this.windows.forEach((data, id) => {
            const window = data.element;
            window.style.left = offsetX + 'px';
            window.style.top = offsetY + 'px';
            
            offsetX += 30;
            offsetY += 30;
            
            if (offsetX > 400) {
                offsetX = 150;
                offsetY = 80;
            }
        });
    }
    
    openWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        
        if (windowData.minimized) {
            this.restoreWindow(windowId);
            return;
        }
        
        window.style.display = 'flex';
        window.classList.add('opening');
        
        setTimeout(() => {
            window.classList.remove('opening');
        }, 300);
        
        this.focusWindow(windowId);
        this.updateActiveWindowTitle(windowId);
        this.updateWorkspaces(windowId);
    }
    
    closeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        window.classList.add('closing');
        
        setTimeout(() => {
            window.style.display = 'none';
            window.classList.remove('closing');
            windowData.minimized = false;
            windowData.maximized = false;
            window.classList.remove('fullscreen');
            this.removeDockItem(windowId);
            
            if (this.activeWindow === windowId) {
                this.activeWindow = null;
                this.updateActiveWindowTitle(null);
            }
        }, 200);
    }
    
    minimizeWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        window.classList.add('minimizing');
        
        setTimeout(() => {
            window.style.display = 'none';
            window.classList.remove('minimizing');
            windowData.minimized = true;
            this.addDockItem(windowId);
            
            if (this.activeWindow === windowId) {
                this.activeWindow = null;
                this.updateActiveWindowTitle(null);
            }
        }, 300);
    }
    
    restoreWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        window.style.display = 'flex';
        window.classList.add('restoring');
        
        setTimeout(() => {
            window.classList.remove('restoring');
        }, 300);
        
        windowData.minimized = false;
        this.removeDockItem(windowId);
        this.focusWindow(windowId);
    }
    
    toggleMaximize(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        
        if (windowData.maximized) {
            // Restore
            window.classList.remove('fullscreen');
            window.style.left = windowData.position.x + 'px';
            window.style.top = windowData.position.y + 'px';
            window.style.width = windowData.size.width + 'px';
            window.style.height = windowData.size.height + 'px';
            windowData.maximized = false;
        } else {
            // Save current position/size
            windowData.position = {
                x: window.offsetLeft,
                y: window.offsetTop
            };
            windowData.size = {
                width: window.offsetWidth,
                height: window.offsetHeight
            };
            
            // Maximize
            window.classList.add('fullscreen', 'maximizing');
            setTimeout(() => window.classList.remove('maximizing'), 200);
            windowData.maximized = true;
        }
    }
    
    focusWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        // Remove focus from all windows
        this.windows.forEach((data) => {
            data.element.classList.remove('focused');
        });
        
        // Focus the target window
        this.highestZIndex++;
        windowData.element.style.zIndex = this.highestZIndex;
        windowData.element.classList.add('focused');
        this.activeWindow = windowId;
        
        this.updateActiveWindowTitle(windowId);
    }
    
    addDockItem(windowId) {
        const dock = document.getElementById('dock-items');
        if (!dock) return;
        
        // Check if already exists
        if (dock.querySelector(`[data-window="${windowId}"]`)) return;
        
        const windowData = this.windows.get(windowId);
        const window = windowData.element;
        const icon = window.querySelector('.window-icon')?.textContent || '󰣇';
        const title = window.querySelector('.window-title')?.textContent || windowId;
        
        const dockItem = document.createElement('div');
        dockItem.className = 'dock-item';
        dockItem.dataset.window = windowId;
        dockItem.title = title;
        dockItem.innerHTML = `<span class="dock-icon">${icon}</span>`;
        
        dock.appendChild(dockItem);
    }
    
    removeDockItem(windowId) {
        const dock = document.getElementById('dock-items');
        if (!dock) return;
        
        const item = dock.querySelector(`[data-window="${windowId}"]`);
        if (item) {
            item.remove();
        }
    }
    
    updateActiveWindowTitle(windowId) {
        const titleEl = document.getElementById('active-window-title');
        if (!titleEl) return;
        
        if (!windowId) {
            titleEl.querySelector('.window-name').textContent = 'Desktop';
            titleEl.querySelector('.window-icon').textContent = '󰣇';
            return;
        }
        
        const windowData = this.windows.get(windowId);
        if (!windowData) return;
        
        const window = windowData.element;
        const icon = window.querySelector('.window-icon')?.textContent || '󰣇';
        const title = windowId;
        
        titleEl.querySelector('.window-name').textContent = title;
        titleEl.querySelector('.window-icon').textContent = icon;
    }
    
    updateWorkspaces(windowId) {
        // Mark workspace 1 as occupied when any window is open
        const workspaces = document.querySelectorAll('.workspace');
        workspaces[0]?.classList.add('occupied');
    }
}

// Initialize window manager
let windowManager;

document.addEventListener('DOMContentLoaded', () => {
    // Wait for boot sequence
    setTimeout(() => {
        windowManager = new WindowManager();
    }, 2500);
});

// Export for global access
window.WindowManager = WindowManager;
