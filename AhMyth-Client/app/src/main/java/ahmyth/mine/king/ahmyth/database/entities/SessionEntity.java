package ahmyth.mine.king.ahmyth.database.entities;

import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "sessions")
public class SessionEntity {
    
    @PrimaryKey(autoGenerate = true)
    public long id;
    
    @ColumnInfo(name = "token")
    public String token;
    
    @ColumnInfo(name = "start_time")
    public long startTime;
    
    @ColumnInfo(name = "end_time")
    public Long endTime;
    
    @ColumnInfo(name = "status")
    public String status; // "active", "closed", "error"
    
    public SessionEntity() {
    }
    
    public SessionEntity(String token, long startTime, String status) {
        this.token = token;
        this.startTime = startTime;
        this.status = status;
    }
}

