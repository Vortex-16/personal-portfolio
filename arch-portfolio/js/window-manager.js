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

        // Workspace State
        this.currentWorkspace = 1;
        this.windowWorkspaces = new Map(); // windowId -> workspaceNum
        this.switchWorkspace(1);
    }

    switchWorkspace(workspaceNum) {
        if (this.currentWorkspace !== workspaceNum) {
            this.currentWorkspace = workspaceNum;

            // Update Waybar UI
            document.querySelectorAll('.workspace').forEach(ws => {
                ws.classList.toggle('active', parseInt(ws.textContent) === workspaceNum);
            });
        }

        // Show/Hide windows based on workspace
        this.windows.forEach((data, windowId) => {
            const windowWs = this.windowWorkspaces.get(windowId) || 1; // Default to WS 1
            const windowEl = data.element;

            if (windowWs === workspaceNum) {
                windowEl.style.display = 'flex'; // Restore display
                if (data.minimized) {
                    windowEl.classList.add('minimized');
                } else {
                    windowEl.classList.remove('workspace-hidden');
                    // data.visible check is managed by open/close logic, 
                    // but we ensure it's not hidden by display:none unless closed
                }
            } else {
                // Hide window from other workspaces
                windowEl.classList.add('workspace-hidden');
                // We don't change 'display' to none directly if we want to keep animations, 
                // but for simple hiding, a class is best.
            }
        });
    }

    assignWindowToWorkspace(windowId, workspaceNum) {
        this.windowWorkspaces.set(windowId, workspaceNum);
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
            // Mobile tap support & Desktop selection
            let tapCount = 0;

            icon.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove active class from other icons
                desktopIcons.forEach(i => i.classList.remove('active'));
                // Add active class to clicked icon
                icon.classList.add('active');

                // Open window on single click (Dock/Launcher behavior)
                const windowId = icon.dataset.window;

                // Add launch animation class
                icon.classList.add('launching');
                setTimeout(() => icon.classList.remove('launching'), 600);

                this.openWindow(windowId);
            });

            // Removed double-click listener as we now use single-click
        });

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
        if (!this.windows.has(windowId)) return;
        const windowData = this.windows.get(windowId);

        const window = windowData.element;

        // Assign to current workspace if not assigned
        if (!this.windowWorkspaces.has(windowId)) {
            this.assignWindowToWorkspace(windowId, this.currentWorkspace);
        } else {
            // If already assigned, switch to that workspace
            const targetWs = this.windowWorkspaces.get(windowId);
            if (targetWs && targetWs !== this.currentWorkspace) {
                this.switchWorkspace(targetWs);
            }
        }

        if (windowData.minimized) {
            // restoreWindow handles workspace switching too, but redundant check doesn't hurt
            this.restoreWindow(windowId);
            return;
        }

        window.style.display = 'flex';

        // Remove workspace-hidden if it was there (should be handled by switchWorkspace but safe to ensure)
        window.classList.remove('workspace-hidden');

        window.classList.add('opening');

        setTimeout(() => {
            window.classList.add('visible');
            window.classList.remove('opening', 'closed');
        }, 10);

        setTimeout(() => {
            // Cleanup animation class if needed, strictly
        }, 300);

        this.focusWindow(windowId);
        this.updateActiveWindowTitle(windowId);
        this.updateWorkspaces(windowId);
        this.addDockItem(windowId);
    }

    closeWindow(windowId) {
        if (!this.windows.has(windowId)) return;
        const windowData = this.windows.get(windowId);

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
        if (!this.windows.has(windowId)) return;
        const windowData = this.windows.get(windowId);

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
        if (!this.windows.has(windowId)) return;
        const windowData = this.windows.get(windowId);

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

        // Get icon name from data-lucide attribute
        const iconEl = window.querySelector('.window-icon');
        const iconName = iconEl?.getAttribute('data-lucide');
        const title = window.querySelector('.window-title')?.textContent || windowId;

        const dockItem = document.createElement('div');
        dockItem.className = 'dock-item';
        dockItem.dataset.window = windowId;
        dockItem.title = title;

        if (iconName) {
            dockItem.innerHTML = `<i data-lucide="${iconName}" class="dock-icon"></i>`;
        } else {
            // Fallback for non-lucide or text icons
            const iconText = iconEl?.textContent || '󰣇';
            dockItem.innerHTML = `<span class="dock-icon">${iconText}</span>`;
        }

        dock.appendChild(dockItem);

        // Render the new icon
        if (typeof lucide !== 'undefined') {
            lucide.createIcons({
                root: dockItem
            });
        }
    }

    restoreWindow(windowId) {
        // Switch to window's workspace if needed
        const targetWs = this.windowWorkspaces.get(windowId);
        if (targetWs && targetWs !== this.currentWorkspace) {
            this.switchWorkspace(targetWs);
        }

        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        const window = windowData.element;
        window.classList.remove('minimized');
        windowData.minimized = false;

        this.focusWindow(windowId);
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
        // Looking for icon inside window-titlebar -> titlebar-left -> window-icon (lucide)
        const iconEl = window.querySelector('.window-titlebar .window-icon');
        // We need to clone it or get its content. Lucide icons are SVGs. 
        // We can just grab the outerHTML or if it's text content (legacy).
        // Since we switched to Lucide, we should copy the SVG or create a new one.
        // For simplicity in this text context, we'll try to match the data-lucide attribute.

        const title = windowId; // Or get from window title text

        titleEl.querySelector('.window-name').textContent = title;
        // For icon, if it's lucide, we need to re-render or copy.
        // Simplified: just update text if it was text, or re-run lucide if needed.
        // But active-window-title has an i tag with data-lucide presumably. 
        // We'll update that data-lucide attribute.

        // Let's check what the window icon has.
        const winIconAttr = iconEl?.getAttribute('data-lucide');
        const targetIcon = titleEl.querySelector('.window-icon');

        if (winIconAttr && targetIcon) {
            targetIcon.setAttribute('data-lucide', winIconAttr);
            if (typeof lucide !== 'undefined') {
                lucide.createIcons({
                    nameAttr: 'data-lucide',
                    attrs: {
                        class: 'window-icon'
                    }
                });
            }
        }
    }

    updateWorkspaces(windowId) {
        // Mark workspace 1 as occupied when any window is open
        const workspaces = document.querySelectorAll('.workspace');
        workspaces[0]?.classList.add('occupied');
    }
}

// Export for global access
window.WindowManager = WindowManager;
