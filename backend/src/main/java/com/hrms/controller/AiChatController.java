package com.hrms.controller;

import com.hrms.service.AiChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin("*")
public class AiChatController {

    @Autowired
    private AiChatService aiChatService;

    @PostMapping("/chat")
    public ResponseEntity<String> chat(
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String apiKey
    ) {
        String message = payload != null ? payload.get("message") : "";
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message query cannot be empty");
        }

        String reply = aiChatService.processChat(message, email, role, apiKey);
        return ResponseEntity.ok(reply);
    }
}
