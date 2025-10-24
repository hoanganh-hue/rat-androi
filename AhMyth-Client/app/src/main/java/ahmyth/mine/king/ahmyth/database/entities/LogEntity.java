package ahmyth.mine.king.ahmyth.database.entities;

import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.ForeignKey;
import androidx.room.PrimaryKey;

@Entity(tableName = "logs",
        foreignKeys = @ForeignKey(
                entity = SessionEntity.class,
                parentColumns = "id",
                childColumns = "session_id",
                onDelete = ForeignKey.CASCADE
        ))
public class LogEntity {
    
    @PrimaryKey(autoGenerate = true)
    public long id;
    
    @ColumnInfo(name = "session_id")
    public long sessionId;
    
    @ColumnInfo(name = "level")
    public String level; // "INFO", "WARN", "ERROR"
    
    @ColumnInfo(name = "message")
    public String message;
    
    @ColumnInfo(name = "timestamp")
    public long timestamp;
    
    public LogEntity() {
    }
    
    public LogEntity(long sessionId, String level, String message, long timestamp) {
        this.sessionId = sessionId;
        this.level = level;
        this.message = message;
        this.timestamp = timestamp;
    }
}

