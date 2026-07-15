package com.hrms.service;

import com.hrms.model.LeaveRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LeaveService {
	@Autowired
	private EmailService emailService;

    private final List<LeaveRequest> leaves = new ArrayList<>();
    private Long idCounter = 1L;

    // APPLY LEAVE
    public LeaveRequest apply(LeaveRequest leave) {
        leave.setId(idCounter++);
        leave.setStatus("PENDING");
        leaves.add(leave);
        return leave;
    }

    // GET ALL
    public List<LeaveRequest> getAll() {
        return leaves;
    }

    // UPDATE
    public LeaveRequest update(Long id, LeaveRequest updated) {
        for (int i = 0; i < leaves.size(); i++) {
            if (leaves.get(i).getId().equals(id)) {
                updated.setId(id);
                leaves.set(i, updated);
                return updated;
            }
        }
        return null;
    }

    // DELETE
    public void delete(Long id) {
        leaves.removeIf(l -> l.getId().equals(id));
    }

    // APPROVE
    public LeaveRequest approve(Long id) {
        for (LeaveRequest l : leaves) {
            if (l.getId().equals(id)) {
                l.setStatus("APPROVED");
                return l;
            }
        }
        return null;
    }

    // REJECT
    public LeaveRequest reject(Long id) {
        for (LeaveRequest l : leaves) {
            if (l.getId().equals(id)) {
                l.setStatus("REJECTED");
                return l;
            }
        }
        return null;
    }
}