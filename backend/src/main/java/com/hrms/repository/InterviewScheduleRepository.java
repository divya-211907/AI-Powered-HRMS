package com.hrms.repository;

import com.hrms.model.InterviewSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InterviewScheduleRepository extends JpaRepository<InterviewSchedule, Long> {
    List<InterviewSchedule> findByCandidateId(Long candidateId);
    List<InterviewSchedule> findByHrId(Long hrId);
    List<InterviewSchedule> findByInterviewDateAndInterviewTime(String interviewDate, String interviewTime);
}
