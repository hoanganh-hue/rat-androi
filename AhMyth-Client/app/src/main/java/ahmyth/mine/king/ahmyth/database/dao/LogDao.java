package ahmyth.mine.king.ahmyth.database.dao;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Query;

import java.util.List;

import ahmyth.mine.king.ahmyth.database.entities.LogEntity;

@Dao
public interface LogDao {
    
    @Insert
    long insert(LogEntity log);
    
    @Query("SELECT * FROM logs WHERE session_id = :sessionId ORDER BY timestamp DESC")
    List<LogEntity> getLogsBySession(long sessionId);
    
    @Query("SELECT * FROM logs WHERE level = :level ORDER BY timestamp DESC LIMIT :limit")
    List<LogEntity> getLogsByLevel(String level, int limit);
    
    @Query("DELETE FROM logs WHERE timestamp < :timestamp")
    void deleteOldLogs(long timestamp);
}

