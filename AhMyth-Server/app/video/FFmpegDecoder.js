const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { PassThrough } = require('stream');
const { EventEmitter } = require('events');

class FFmpegDecoder extends EventEmitter {
    constructor() {
        super();
        ffmpeg.setFfmpegPath(ffmpegPath);
        this.inputStream = null;
        this.ffmpegProcess = null;
        this.isRunning = false;
    }

    /**
     * Start decoding H.264 stream
     */
    start() {
        if (this.isRunning) {
            console.log('Decoder already running');
            return;
        }

        try {
            // Create input stream for H.264 data
            this.inputStream = new PassThrough();

            // Create FFmpeg process
            this.ffmpegProcess = ffmpeg(this.inputStream)
                .inputFormat('h264')
                .inputOptions([
                    '-probesize 32',
                    '-analyzeduration 0'
                ])
                .outputFormat('rawvideo')
                .outputOptions([
                    '-pix_fmt rgba',
                    '-s 480x480'
                ])
                .on('start', (commandLine) => {
                    console.log('FFmpeg started:', commandLine);
                    this.isRunning = true;
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err.message);
                    this.emit('error', err);
                    this.stop();
                })
                .on('end', () => {
                    console.log('FFmpeg ended');
                    this.isRunning = false;
                });

            // Pipe output to processing
            const outputStream = new PassThrough();
            this.ffmpegProcess.pipe(outputStream);

            // Process decoded frames
            this.processFrames(outputStream);

        } catch (error) {
            console.error('Error starting decoder:', error);
            this.emit('error', error);
        }
    }

    /**
     * Process decoded frames from FFmpeg
     * @param {Stream} stream - Output stream from FFmpeg
     */
    processFrames(stream) {
        const frameSize = 480 * 480 * 4; // RGBA format
        let buffer = Buffer.alloc(0);

        stream.on('data', (chunk) => {
            buffer = Buffer.concat([buffer, chunk]);

            // Extract complete frames
            while (buffer.length >= frameSize) {
                const frameData = buffer.slice(0, frameSize);
                buffer = buffer.slice(frameSize);

                // Convert to ImageData format for canvas
                const imageData = {
                    width: 480,
                    height: 480,
                    data: frameData
                };

                // Emit frame event
                this.emit('frame', imageData);
            }
        });

        stream.on('error', (err) => {
            console.error('Stream error:', err);
            this.emit('error', err);
        });
    }

    /**
     * Push H.264 data to decoder
     * @param {Buffer} data - H.264 encoded data
     */
    pushData(data) {
        if (!this.isRunning || !this.inputStream) {
            console.error('Decoder not running');
            return false;
        }

        try {
            this.inputStream.write(data);
            return true;
        } catch (error) {
            console.error('Error pushing data:', error);
            return false;
        }
    }

    /**
     * Stop decoder
     */
    stop() {
        if (!this.isRunning) {
            return;
        }

        try {
            if (this.inputStream) {
                this.inputStream.end();
                this.inputStream = null;
            }

            if (this.ffmpegProcess) {
                this.ffmpegProcess.kill('SIGKILL');
                this.ffmpegProcess = null;
            }

            this.isRunning = false;
            console.log('Decoder stopped');

        } catch (error) {
            console.error('Error stopping decoder:', error);
        }
    }

    /**
     * Check if decoder is running
     * @returns {boolean}
     */
    isActive() {
        return this.isRunning;
    }
}

module.exports = FFmpegDecoder;

