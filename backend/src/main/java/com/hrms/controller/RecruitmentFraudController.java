package com.hrms.controller;

import com.hrms.model.RecruitmentFraud;
import com.hrms.service.RecruitmentFraudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fraud")
@CrossOrigin("*")
public class RecruitmentFraudController {

    @Autowired
    private RecruitmentFraudService recruitmentFraudService;

    @GetMapping("/{applicationId}")
    public ResponseEntity<RecruitmentFraud> getFraudReport(@PathVariable Long applicationId) {
        return recruitmentFraudService.getFraudReport(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
