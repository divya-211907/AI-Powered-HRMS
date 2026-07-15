package com.hrms.controller;

import com.hrms.model.Candidate;
import com.hrms.service.CandidateService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/")
@CrossOrigin("*")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @PostMapping("candidate/apply")
    public Candidate applyJob(
            @RequestBody Candidate candidate) {

        return candidateService.applyJob(
                candidate);
    }

    @GetMapping("hr/recruitment/all")
    public List<Candidate> getAllCandidates() {

        return candidateService
                .getAllCandidates();
    }

    @PutMapping("hr/recruitment/select/{id}")
    public Candidate selectCandidate(
            @PathVariable int id) {

        return candidateService
                .selectCandidate(id);
    }

    @PutMapping("hr/recruitment/reject/{id}")
    public Candidate rejectCandidate(
            @PathVariable int id) {

        return candidateService
                .rejectCandidate(id);
    }
}