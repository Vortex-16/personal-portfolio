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


        this.setupDesktopIcons();

        this.setupDock();

        this.positionWindows();

        setTimeout(() => this.openWindow('neofetch'), 100);

        this.currentWorkspace = 1;
        this.windowWorkspaces = new Map(); // windowId -> workspaceNum
        this.switchWorkspace(1);
    }

    switchWorkspace(workspaceNum) {
        if (this.currentWorkspace !== workspaceNum) {
            this.currentWorkspace = workspaceNum;

            document.querySelectorAll('.workspace').forEach(ws => {
                ws.classList.toggle('active', parseInt(ws.textContent) === workspaceNum);
            });
        }

        this.windows.forEach((data, windowId) => {
            const windowWs = this.windowWorkspaces.get(windowId) || 1; // Default to WS 1
            const windowEl = data.element;

            if (windowWs === workspaceNum) {
                windowEl.style.display = 'flex'; 
                if (data.minimized) {
                    windowEl.classList.add('minimized');
                } else {
                    windowEl.classList.remove('workspace-hidden');
                }
            } else {
                windowEl.classList.add('workspace-hidden');
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
        const desktopIcons = document.querySelectorAll('#desktop-icons .desktop-icon');

        desktopIcons.forEach(icon => {
            let tapCount = 0;

            icon.addEventListener('click', (e) => {
                e.preventDefault();
                desktopIcons.forEach(i => i.classList.remove('active'));
                icon.classList.add('active');

                const windowId = icon.dataset.window;

                icon.classList.add('launching');
                setTimeout(() => icon.classList.remove('launching'), 600);

                this.openWindow(windowId);
            });

        });

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

        if (!this.windowWorkspaces.has(windowId)) {
            this.assignWindowToWorkspace(windowId, this.currentWorkspace);
        } else {
            const targetWs = this.windowWorkspaces.get(windowId);
            if (targetWs && targetWs !== this.currentWorkspace) {
                this.switchWorkspace(targetWs);
            }
        }

        if (windowData.minimized) {
            this.restoreWindow(windowId);
            return;
        }

        window.style.display = 'flex';

        window.classList.remove('workspace-hidden');

        window.classList.add('opening');

        // Force reflow
        void window.offsetWidth;

        setTimeout(() => {
            window.classList.add('active');
            window.classList.remove('opening');
        }, 10);

        setTimeout(() => {
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
        window.classList.remove('active');
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
        }, 300);
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
            windowData.position = {
                x: window.offsetLeft,
                y: window.offsetTop
            };
            windowData.size = {
                width: window.offsetWidth,
                height: window.offsetHeight
            };

            window.classList.add('fullscreen', 'maximizing');
            setTimeout(() => window.classList.remove('maximizing'), 200);
            windowData.maximized = true;
        }
    }

    focusWindow(windowId) {
        const windowData = this.windows.get(windowId);
        if (!windowData) return;

        this.windows.forEach((data) => {
            data.element.classList.remove('focused');
        });

        // Focus target window
        this.highestZIndex++;
        windowData.element.style.zIndex = this.highestZIndex;
        windowData.element.classList.add('focused');
        this.activeWindow = windowId;

        this.updateActiveWindowTitle(windowId);
    }

    addDockItem(windowId) {
        const dock = document.getElementById('dock-items');
        if (!dock) return;

        if (dock.querySelector(`[data-window="${windowId}"]`)) return;

        const windowData = this.windows.get(windowId);
        const window = windowData.element;

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
            const iconText = iconEl?.textContent || '🪟';
            dockItem.innerHTML = `<span class="dock-icon">${iconText}</span>`;
        }

        dock.appendChild(dockItem);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons({
                root: dockItem
            });
        }
    }

    restoreWindow(windowId) {
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
        const iconEl = window.querySelector('.window-titlebar .window-icon');

        const title = windowId; 

        titleEl.querySelector('.window-name').textContent = title;
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
        const workspaces = document.querySelectorAll('.workspace');
        workspaces[0]?.classList.add('occupied');
    }
}

window.WindowManager = WindowManager;
