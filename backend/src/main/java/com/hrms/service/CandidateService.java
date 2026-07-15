package com.hrms.service;

import com.hrms.model.Candidate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class CandidateService {

    private final List<Candidate> candidates = new ArrayList<>();

    private final AtomicInteger idCounter = new AtomicInteger(1);

    // Apply for job (Candidate creates application)
    public Candidate applyJob(Candidate candidate) {

        candidate.setId(idCounter.getAndIncrement());
        candidate.setStatus("APPLIED");

        candidates.add(candidate);

        return candidate;
    }

    // Get all candidates (HR view)
    public List<Candidate> getAllCandidates() {
        return candidates;
    }

    // Get candidate by ID
    public Candidate getCandidateById(int id) {

        for (Candidate c : candidates) {
            if (c.getId() == id) {
                return c;
            }
        }

        return null;
    }

    // Select candidate
    public Candidate selectCandidate(int id) {

        for (Candidate c : candidates) {
            if (c.getId() == id) {
                c.setStatus("SELECTED");
                return c;
            }
        }

        return null;
    }

    // Reject candidate
    public Candidate rejectCandidate(int id) {

        for (Candidate c : candidates) {
            if (c.getId() == id) {
                c.setStatus("REJECTED");
                return c;
            }
        }

        return null;
    }

    // Delete candidate (optional HR action)
    public boolean deleteCandidate(int id) {

        return candidates.removeIf(c -> c.getId() == id);
    }
}