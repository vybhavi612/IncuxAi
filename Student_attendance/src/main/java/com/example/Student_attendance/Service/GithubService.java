package com.example.Student_attendance.Service;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Service
public class GithubService {
    public int getPushCountLast24hours(String username){
        RestTemplate restTemplate=new RestTemplate();
        String url="https://api.github.com/users/"+username+"/events/public";
        try{
            ResponseEntity<List> response=restTemplate.getForEntity(url,List.class);
            List<Map<String,Object>> events=response.getBody();
            if(events==null){
                return 0;
            }
            Instant twentyfourhoursago=Instant.now().minus(24, ChronoUnit.HOURS);
            int pushcount=0;
            for(Map<String,Object> event:events){
                String type=(String) event.get("type");
                if("PushEvent".equals(type)){
                   String createdAt=(String) event.get("created_at");
                   Instant pushtime=Instant.parse(createdAt);
                   if(pushtime.isAfter(twentyfourhoursago)){
                       pushcount++;
                   }
                }
            }
            return pushcount;
        }
        catch(Exception e){
            e.printStackTrace();
            return 0;
        }
    }
}
