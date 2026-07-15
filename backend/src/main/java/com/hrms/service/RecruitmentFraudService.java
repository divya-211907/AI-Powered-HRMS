package com.hrms.service;

import com.hrms.model.Recruitment;
import com.hrms.model.RecruitmentFraud;
import com.hrms.repository.RecruitmentRepository;
import com.hrms.repository.RecruitmentFraudRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class RecruitmentFraudService {

    @Autowired
    private RecruitmentRepository recruitmentRepository;

    @Autowired
    private RecruitmentFraudRepository recruitmentFraudRepository;

    public RecruitmentFraud runFraudCheck(Recruitment current, String geminiApiKey) {
        List<Recruitment> allCandidates = recruitmentRepository.findAll();
        
        // 1. DUPLICATE RESUME / DETAILS DETECTION
        int maxDuplicateScore = 0;
        String duplicateDetails = "";
        
        for (Recruitment other : allCandidates) {
            if (other.getId().equals(current.getId())) continue;
            
            int duplicateScore = 0;
            
            // Check identical or highly similar contact details
            if (current.getMobile() != null && other.getMobile() != null 
                && current.getMobile().replaceAll("\\s+", "").equalsIgnoreCase(other.getMobile().replaceAll("\\s+", ""))) {
                duplicateScore += 70;
            }
            if (current.getEmail() != null && other.getEmail() != null 
                && current.getEmail().trim().equalsIgnoreCase(other.getEmail().trim())) {
                duplicateScore += 90;
            }
            
            // Check skill overlap (Jaccard similarity)
            double skillSim = calculateSkillsSimilarity(current.getSkills(), other.getSkills());
            if (skillSim > 0.8) {
                duplicateScore += (int)(skillSim * 100);
            }
            
            // Cap score at 100
            duplicateScore = Math.min(duplicateScore, 100);
            if (duplicateScore > maxDuplicateScore) {
                maxDuplicateScore = duplicateScore;
                duplicateDetails = "Conflict found with candidate: " + other.getCandidateName() + " (" + other.getEmail() + ")";
            }
        }

        // 2. FAKE EXPERIENCE DETECTION
        boolean timelineFlagged = false;
        int parsedExperienceYears = parseExperienceYears(current.getExperience());
        int graduationYear = extractGraduationYear(current.getQualification());
        int currentYear = LocalDateTime.now().getYear();
        
        if (graduationYear > 0) {
            int yearsSinceGraduation = currentYear - graduationYear;
            if (parsedExperienceYears > yearsSinceGraduation && yearsSinceGraduation >= 0) {
                timelineFlagged = true;
            }
        }

        // 3. IF GEMINI KEY IS PROVIDED, CALL GEMINI API
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            RecruitmentFraud aiReport = callGeminiFraudApi(current, geminiApiKey, maxDuplicateScore, duplicateDetails, parsedExperienceYears, graduationYear, timelineFlagged);
            if (aiReport != null) {
                return recruitmentFraudRepository.save(aiReport);
            }
        }

        // 4. FALLBACK TO SYSTEM DYNAMIC CALCULATION
        RecruitmentFraud fallbackReport = runJavaFallbackFraudCheck(current, maxDuplicateScore, duplicateDetails, parsedExperienceYears, graduationYear, timelineFlagged);
        return recruitmentFraudRepository.save(fallbackReport);
    }

    private double calculateSkillsSimilarity(String skills1, String skills2) {
        if (skills1 == null || skills2 == null) return 0.0;
        
        Set<String> set1 = parseSkillsToSet(skills1);
        Set<String> set2 = parseSkillsToSet(skills2);
        
        if (set1.isEmpty() && set2.isEmpty()) return 1.0;
        if (set1.isEmpty() || set2.isEmpty()) return 0.0;
        
        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);
        
        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);
        
        return (double) intersection.size() / union.size();
    }

    private Set<String> parseSkillsToSet(String skills) {
        Set<String> set = new HashSet<>();
        String[] tokens = skills.toLowerCase().split("[,;|]+");
        for (String t : tokens) {
            if (!t.trim().isEmpty()) {
                set.add(t.trim());
            }
        }
        return set;
    }

    private int parseExperienceYears(String experience) {
        if (experience == null) return 0;
        Pattern p = Pattern.compile("\\d+");
        Matcher m = p.matcher(experience);
        if (m.find()) {
            try {
                return Integer.parseInt(m.group());
            } catch (Exception e) {}
        }
        return 0;
    }

    private int extractGraduationYear(String qualification) {
        if (qualification == null) return 0;
        Pattern p = Pattern.compile("\\b(19|20)\\d{2}\\b");
        Matcher m = p.matcher(qualification);
        int maxYear = 0;
        while (m.find()) {
            try {
                int yr = Integer.parseInt(m.group());
                if (yr > maxYear) maxYear = yr;
            } catch (Exception e) {}
        }
        return maxYear;
    }

    private RecruitmentFraud runJavaFallbackFraudCheck(
            Recruitment current,
            int maxDuplicateScore,
            String duplicateDetails,
            int experienceYears,
            int graduationYear,
            boolean timelineFlagged
    ) {
        int fraudScore = 10; // Base score
        List<String> warnings = new ArrayList<>();

        if (maxDuplicateScore > 50) {
            fraudScore += (maxDuplicateScore * 0.5);
            warnings.add("Resume/profile metadata overlaps with an existing application (" + maxDuplicateScore + "% similarity). " + duplicateDetails);
        }

        if (timelineFlagged) {
            fraudScore += 45;
            warnings.add("Experience timeline inconsistency flagged: claims " + experienceYears + " years of experience, but graduation details specify " + graduationYear + ".");
        }

        // Check empty contact fields
        if (current.getMobile() == null || current.getMobile().trim().isEmpty()) {
            fraudScore += 10;
            warnings.add("Incomplete application: mobile contact field is empty.");
        }

        fraudScore = Math.min(fraudScore, 100);
        String riskLevel = (fraudScore >= 61) ? "High" : (fraudScore >= 31) ? "Medium" : "Low";

        StringBuilder aiAnalysis = new StringBuilder();
        aiAnalysis.append("### 🔍 AI Recruitment Fraud Report (System Fallback)\n\n");
        aiAnalysis.append("- **Fraud Risk Score**: ").append(fraudScore).append("/100\n");
        aiAnalysis.append("- **Risk Level**: **").append(riskLevel).append("**\n");
        aiAnalysis.append("- **Duplicate Profile Score**: ").append(maxDuplicateScore).append("%\n\n");
        aiAnalysis.append("#### Warnings Found:\n");
        if (warnings.isEmpty()) {
            aiAnalysis.append("✓ No suspicious patterns detected in this application.\n");
        } else {
            for (String w : warnings) {
                aiAnalysis.append("- ⚠️ ").append(w).append("\n");
            }
        }

        return new RecruitmentFraud(
                current.getEmail(),
                current.getId(),
                fraudScore,
                riskLevel,
                maxDuplicateScore,
                aiAnalysis.toString()
        );
    }

    private RecruitmentFraud callGeminiFraudApi(
            Recruitment current,
            String geminiApiKey,
            int maxDuplicateScore,
            String duplicateDetails,
            int experienceYears,
            int graduationYear,
            boolean timelineFlagged
    ) {
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            String prompt = "Perform a real-time recruitment fraud check on this candidate application:\n" +
                    "- Name: " + current.getCandidateName() + "\n" +
                    "- Email: " + current.getEmail() + "\n" +
                    "- Mobile: " + current.getMobile() + "\n" +
                    "- Qualification/Education: " + current.getQualification() + "\n" +
                    "- Skills: " + current.getSkills() + "\n" +
                    "- Experience: " + current.getExperience() + " (" + experienceYears + " years parsed)\n" +
                    "- Position: " + current.getPosition() + "\n\n" +
                    "DB Metadata Conflicts:\n" +
                    "- Max Duplicate Resume/Contact Score found: " + maxDuplicateScore + "%\n" +
                    "- Conflict detail: " + duplicateDetails + "\n" +
                    "- Timeline Inconsistency Flagged: " + (timelineFlagged ? "Yes" : "No") + " (Graduation Year: " + graduationYear + ")\n\n" +
                    "Return a JSON response object with exactly these fields: " +
                    "{\"fraudScore\": <int 0-100>, \"riskLevel\": <\"Low\"|\"Medium\"|\"High\">, \"duplicateScore\": <int 0-100>, \"aiAnalysis\": \"<brief markdown explanation of risk factors and consistency analysis>\"}. " +
                    "Ensure response is raw JSON only, no markdown wrapping, no backticks.";

            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contentsList = new ArrayList<>();
            Map<String, Object> contentsMap = new HashMap<>();
            List<Map<String, Object>> partsList = new ArrayList<>();
            Map<String, Object> partsMap = new HashMap<>();

            partsMap.put("text", prompt);
            partsList.add(partsMap);
            contentsMap.put("parts", partsList);
            contentsList.add(contentsMap);
            requestBody.put("contents", contentsList);

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map body = response.getBody();
                List candidates = (List) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    if (content != null) {
                        List parts = (List) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map part = (Map) parts.get(0);
                            String responseText = (String) part.get("text");
                            return parseGeminiJsonResponse(responseText, current, maxDuplicateScore, duplicateDetails, experienceYears, graduationYear, timelineFlagged);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Gemini API call failed: " + e.getMessage());
        }
        return null;
    }

    private RecruitmentFraud parseGeminiJsonResponse(
            String text,
            Recruitment current,
            int maxDuplicateScore,
            String duplicateDetails,
            int experienceYears,
            int graduationYear,
            boolean timelineFlagged
    ) {
        try {
            String cleanJson = text;
            int startIndex = text.indexOf("{");
            int endIndex = text.lastIndexOf("}");
            if (startIndex >= 0 && endIndex >= 0) {
                cleanJson = text.substring(startIndex, endIndex + 1);
            }
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(cleanJson);
            
            int fraudScore = root.path("fraudScore").asInt(10);
            String riskLevel = root.path("riskLevel").asText("Low");
            int duplicateScore = root.path("duplicateScore").asInt(maxDuplicateScore);
            String aiAnalysis = root.path("aiAnalysis").asText("No detailed analysis generated.");
            
            return new RecruitmentFraud(
                    current.getEmail(),
                    current.getId(),
                    fraudScore,
                    riskLevel,
                    duplicateScore,
                    aiAnalysis
            );
        } catch (Exception e) {
            System.err.println("JSON Parsing of Gemini response failed, using fallback: " + e.getMessage());
            return runJavaFallbackFraudCheck(current, maxDuplicateScore, duplicateDetails, experienceYears, graduationYear, timelineFlagged);
        }
    }

    public Optional<RecruitmentFraud> getFraudReport(Long applicationId) {
        return recruitmentFraudRepository.findFirstByApplicationIdOrderByCreatedAtDesc(applicationId);
    }
}
