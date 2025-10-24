package ahmyth.mine.king.ahmyth.database;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;

import ahmyth.mine.king.ahmyth.database.dao.LogDao;
import ahmyth.mine.king.ahmyth.database.dao.SessionDao;
import ahmyth.mine.king.ahmyth.database.entities.LogEntity;
import ahmyth.mine.king.ahmyth.database.entities.SessionEntity;

@Database(entities = {SessionEntity.class, LogEntity.class}, version = 1, exportSchema = false)
public abstract class AppDatabase extends RoomDatabase {
    
    private static AppDatabase instance;
    
    public abstract SessionDao sessionDao();
    public abstract LogDao logDao();
    
    public static synchronized AppDatabase getInstance(Context context) {
        if (instance == null) {
            instance = Room.databaseBuilder(
                    context.getApplicationContext(),
                    AppDatabase.class,
                    "ahmyth_db"
            )
            .fallbackToDestructiveMigration()
            .build();
        }
        return instance;
    }
}

