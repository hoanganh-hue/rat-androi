package ahmyth.mine.king.ahmyth.database.dao;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import ahmyth.mine.king.ahmyth.database.entities.SessionEntity;

@Dao
public interface SessionDao {
    
    @Insert
    long insert(SessionEntity session);
    
    @Update
    void update(SessionEntity session);
    
    @Query("SELECT * FROM sessions WHERE token = :token LIMIT 1")
    SessionEntity getByToken(String token);
    
    @Query("SELECT * FROM sessions WHERE status = 'active' ORDER BY start_time DESC LIMIT 1")
    SessionEntity getActiveSession();
    
    @Query("UPDATE sessions SET end_time = :endTime, status = :status WHERE id = :id")
    void closeSession(long id, long endTime, String status);
    
    @Query("DELETE FROM sessions WHERE start_time < :timestamp")
    void deleteOldSessions(long timestamp);
}

