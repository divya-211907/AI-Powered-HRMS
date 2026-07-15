package com.hrms.controller;

import com.hrms.model.JobOpening;
import com.hrms.repository.JobOpeningRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin("*")
public class JobOpeningController {

    @Autowired
    private JobOpeningRepository jobOpeningRepository;

    @Autowired
    private com.hrms.repository.HrUserRepository hrUserRepository;

    @GetMapping
    public List<JobOpening> getAll(
            @RequestHeader(value = "X-HR-Id", required = false) Long hrId,
            @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrId != null) {
            if (hrEmail != null && !hrEmail.isEmpty()) {
                List<JobOpening> byId = jobOpeningRepository.findByHrId(hrId);
                List<JobOpening> byEmail = jobOpeningRepository.findByHrEmail(hrEmail);
                java.util.Set<JobOpening> combined = new java.util.LinkedHashSet<>(byId);
                combined.addAll(byEmail);
                return new java.util.ArrayList<>(combined);
            }
            return jobOpeningRepository.findByHrId(hrId);
        }
        if (hrEmail != null && !hrEmail.isEmpty()) {
            return jobOpeningRepository.findByHrEmail(hrEmail);
        }
        return jobOpeningRepository.findAll();
    }

    @PostMapping
    public JobOpening create(
            @RequestBody JobOpening job,
            @RequestHeader(value = "X-HR-Id", required = false) Long hrId,
            @RequestHeader(value = "X-HR-Name", required = false) String hrName,
            @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        if (hrId != null) {
            job.setHrId(hrId);
        }
        if (hrName != null) {
            job.setHrName(hrName);
        }
        if (hrEmail != null) {
            job.setHrEmail(hrEmail);
        }
        if (job.getHrId() == null && job.getHrEmail() != null) {
            hrUserRepository.findByEmail(job.getHrEmail()).ifPresent(hr -> {
                job.setHrId(hr.getId());
                job.setHrName(hr.getName());
            });
        }
        return jobOpeningRepository.save(job);
    }

    @DeleteMapping("/{id}")
    public String delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-HR-Id", required = false) Long hrId,
            @RequestHeader(value = "X-HR-Email", required = false) String hrEmail) {
        JobOpening job = jobOpeningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job opening not found"));
        if (hrId != null && job.getHrId() != null && !job.getHrId().equals(hrId)) {
            throw new RuntimeException("Unauthorized to delete this job opening");
        }
        if (hrEmail != null && job.getHrEmail() != null && !job.getHrEmail().equalsIgnoreCase(hrEmail)) {
            throw new RuntimeException("Unauthorized to delete this job opening");
        }
        jobOpeningRepository.delete(job);
        return "Job opening deleted successfully";
    }
}
