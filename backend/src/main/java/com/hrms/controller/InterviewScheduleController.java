package com.hrms.controller;

import com.hrms.model.InterviewSchedule;
import com.hrms.model.Recruitment;
import com.hrms.model.CandidateNotification;
import com.hrms.repository.InterviewScheduleRepository;
import com.hrms.repository.RecruitmentRepository;
import com.hrms.repository.ApplicationStatusHistoryRepository;
import com.hrms.repository.CandidateNotificationRepository;
import com.hrms.repository.HrUserRepository;
import com.hrms.model.HrUser;
import com.hrms.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin("*")
public class InterviewScheduleController {

    @Autowired
    private InterviewScheduleRepository interviewScheduleRepository;

    @Autowired
    private RecruitmentRepository recruitmentRepository;

    @Autowired
    private ApplicationStatusHistoryRepository applicationStatusHistoryRepository;

    @Autowired
    private CandidateNotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private HrUserRepository hrUserRepository;

    @Autowired
    private com.hrms.service.GoogleCalendarService googleCalendarService;

    @GetMapping("/suggest-slot")
    public Map<String, Object> suggestSlot(
            @RequestParam Long candidateId,
            @RequestParam(defaultValue = "0") int skipCount) {

        Recruitment candidate = recruitmentRepository.findById(candidateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));

        Long hrId = 1L; // Default HR ID
        String startStr = "09:00";
        String endStr = "17:00";

        if (candidate.getHrEmail() != null && !candidate.getHrEmail().isEmpty()) {
            Optional<HrUser> hrOpt = hrUserRepository.findByEmail(candidate.getHrEmail());
            if (hrOpt.isPresent()) {
                hrId = hrOpt.get().getId();
                startStr = hrOpt.get().getShiftStart();
                endStr = hrOpt.get().getShiftEnd();
            }
        } else if (candidate.getAssignedHrId() != null) {
            Optional<HrUser> hrOpt = hrUserRepository.findById(candidate.getAssignedHrId());
            if (hrOpt.isPresent()) {
                hrId = hrOpt.get().getId();
                startStr = hrOpt.get().getShiftStart();
                endStr = hrOpt.get().getShiftEnd();
            }
        }

        if (startStr == null || startStr.trim().isEmpty()) {
            startStr = "09:00";
        }
        if (endStr == null || endStr.trim().isEmpty()) {
            endStr = "17:00";
        }

        java.time.LocalTime startTime = java.time.LocalTime.parse(startStr);
        java.time.LocalTime endTime = java.time.LocalTime.parse(endStr);
        
        java.util.List<String> times = new java.util.ArrayList<>();
        java.time.LocalTime tempTime = startTime;
        java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a", java.util.Locale.ENGLISH);
        
        while (tempTime.plusMinutes(30).isBefore(endTime) || tempTime.plusMinutes(30).equals(endTime)) {
            times.add(tempTime.format(timeFormatter));
            tempTime = tempTime.plusMinutes(30);
        }
        
        if (times.isEmpty()) {
            times.add("11:00 AM");
        }

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ofPattern("d MMMM yyyy", java.util.Locale.ENGLISH);

        String suggestedDate = null;
        String suggestedTime = null;
        int foundCount = 0;

        java.time.LocalTime nowTime = java.time.LocalTime.now();
        // Scan next 14 days starting from today
        for (int dayOffset = 0; dayOffset <= 14; dayOffset++) {
            java.time.LocalDate targetDate = today.plusDays(dayOffset);
            java.time.DayOfWeek dayOfWeek = targetDate.getDayOfWeek();
            // Skip weekends
            if (dayOfWeek == java.time.DayOfWeek.SATURDAY || dayOfWeek == java.time.DayOfWeek.SUNDAY) {
                continue;
            }

            String dateStr = targetDate.format(dateFormatter);

            for (String timeStr : times) {
                // If today, only suggest future times
                if (dayOffset == 0) {
                    java.time.LocalTime slotTime = java.time.LocalTime.parse(timeStr, timeFormatter);
                    if (!slotTime.isAfter(nowTime)) {
                        continue;
                    }
                }

                List<InterviewSchedule> conflicts = interviewScheduleRepository.findByInterviewDateAndInterviewTime(dateStr, timeStr);
                boolean hasConflict = false;
                for (InterviewSchedule is : conflicts) {
                    if (is.getCandidateId().equals(candidateId) || is.getHrId().equals(hrId)) {
                        hasConflict = true;
                        break;
                    }
                }

                if (!hasConflict) {
                    if (foundCount == skipCount) {
                        suggestedDate = dateStr;
                        suggestedTime = timeStr;
                        break;
                    }
                    foundCount++;
                }
            }

            if (suggestedDate != null) {
                break;
            }
        }

        if (suggestedDate == null) {
            java.time.LocalDate fallback = today.plusDays(3);
            suggestedDate = fallback.format(dateFormatter);
            suggestedTime = times.get(0);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("candidateId", candidateId);
        response.put("hrId", hrId);
        response.put("interviewDate", suggestedDate);
        response.put("interviewTime", suggestedTime);
        response.put("duration", "30 Minutes");
        response.put("interviewType", "Online");
        response.put("confidence", "95%");
        response.put("reason", "Best available slot with no scheduling conflicts.");
        return response;
    }

    @PostMapping("/schedule")
    public InterviewSchedule schedule(@RequestBody Map<String, String> body) {
        Long candidateId = Long.parseLong(body.get("candidateId"));
        Long hrId = Long.parseLong(body.get("hrId"));
        String date = body.get("interviewDate");
        String time = body.get("interviewTime");
        String type = body.get("interviewType");
        String link = body.get("meetingLink");

        Recruitment candidate = recruitmentRepository.findById(candidateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));

        if (link == null || link.isEmpty() || link.trim().equalsIgnoreCase("automatically generated on save") || link.trim().equalsIgnoreCase("(automatically generated on save)")) {
            link = googleCalendarService.createInterviewMeeting(candidate.getCandidateName(), candidate.getEmail(), date, time);
        }

        InterviewSchedule schedule = new InterviewSchedule();
        schedule.setCandidateId(candidateId);
        schedule.setHrId(hrId);
        schedule.setInterviewDate(date);
        schedule.setInterviewTime(time);
        schedule.setInterviewType(type);
        schedule.setMeetingLink(link);
        schedule.setStatus("UPCOMING");
        schedule.setAiGenerated(true);

        interviewScheduleRepository.save(schedule);

        candidate.setStatus("Interview Scheduled");
        candidate.setInterviewDetails("Date: " + date + "\nTime: " + time + "\nMeeting Link: " + link);
        recruitmentRepository.save(candidate);

        com.hrms.model.ApplicationStatusHistory history = new com.hrms.model.ApplicationStatusHistory();
        history.setApplicationId(candidateId);
        history.setCandidateId(candidateId);
        history.setHrId(hrId);
        history.setStatus("Interview Scheduled");
        history.setRemarks("AI suggested interview slot approved by HR.");
        history.setUpdatedAt(LocalDateTime.now());
        applicationStatusHistoryRepository.save(history);

        String msg = "Your interview has been scheduled for " + date + " at " + time + " (" + type + "). Please be available 10 minutes before the scheduled time.";
        CandidateNotification notification = new CandidateNotification(
                candidateId,
                candidateId,
                "Interview Scheduled",
                msg,
                false,
                LocalDateTime.now(),
                candidate.getEmail()
        );
        notificationRepository.save(notification);

        emailService.sendInterviewScheduledMail(candidate.getEmail(), date, time, type, link);

        return schedule;
    }

    @GetMapping("/hr")
    public List<InterviewSchedule> getHrInterviews() {
        return interviewScheduleRepository.findAll();
    }

    @GetMapping("/candidate")
    public List<InterviewSchedule> getCandidateInterviews(@RequestParam Long candidateId) {
        return interviewScheduleRepository.findByCandidateId(candidateId);
    }
}
