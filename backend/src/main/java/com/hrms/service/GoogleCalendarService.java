package com.hrms.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.ConferenceData;
import com.google.api.services.calendar.model.ConferenceSolutionKey;
import com.google.api.services.calendar.model.CreateConferenceRequest;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EntryPoint;
import com.google.api.client.util.DateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;
import java.util.UUID;

@Service
public class GoogleCalendarService {

    private static final String APPLICATION_NAME = "HRMS-App";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Value("${google.calendar.credentials.path:service-account.json}")
    private String credentialsPath;

    @Value("${google.calendar.id:primary}")
    private String calendarId;

    public String createInterviewMeeting(String candidateName, String candidateEmail, String dateStr, String timeStr) {
        try {
            Calendar service = getCalendarService();
            if (service == null) {
                return generateFallbackLink(candidateName);
            }

            Event event = new Event()
                .setSummary("HRMS Interview: " + candidateName)
                .setDescription("Interview scheduled via NextGen HRMS Platform for position application.");

            // Create valid start and end datetimes
            DateTime startDateTime = new DateTime(System.currentTimeMillis() + 86400000); // Tomorrow
            DateTime endDateTime = new DateTime(System.currentTimeMillis() + 86400000 + 3600000); // 1 hour later

            event.setStart(new EventDateTime().setDateTime(startDateTime).setTimeZone("UTC"));
            event.setEnd(new EventDateTime().setDateTime(endDateTime).setTimeZone("UTC"));

            EventAttendee[] attendees = new EventAttendee[] {
                new EventAttendee().setEmail(candidateEmail)
            };
            event.setAttendees(Arrays.asList(attendees));

            // Set up Google Meet Conference Data
            ConferenceSolutionKey conferenceSolutionKey = new ConferenceSolutionKey().setType("hangoutsMeet");
            CreateConferenceRequest createConferenceRequest = new CreateConferenceRequest()
                .setRequestId(UUID.randomUUID().toString())
                .setConferenceSolutionKey(conferenceSolutionKey);
            ConferenceData conferenceData = new ConferenceData()
                .setCreateRequest(createConferenceRequest);
            event.setConferenceData(conferenceData);

            Event createdEvent = service.events().insert(calendarId, event)
                .setConferenceDataVersion(1)
                .execute();

            if (createdEvent.getConferenceData() != null && createdEvent.getConferenceData().getEntryPoints() != null) {
                for (EntryPoint ep : createdEvent.getConferenceData().getEntryPoints()) {
                    if ("video".equals(ep.getEntryPointType())) {
                        return ep.getUri();
                    }
                }
            }

            return createdEvent.getHtmlLink();

        } catch (Exception e) {
            System.err.println("Google Calendar API Event Creation Failed: " + e.getMessage());
            return generateFallbackLink(candidateName);
        }
    }

    private Calendar getCalendarService() {
        try {
            File credentialsFile = new File(credentialsPath);
            if (!credentialsFile.exists()) {
                credentialsFile = new File("src/main/resources/" + credentialsPath);
                if (!credentialsFile.exists()) {
                    System.out.println("Google Calendar credentials file not found at: " + credentialsPath + ". Using fallback.");
                    return null;
                }
            }

            HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            Credential credential = GoogleCredential.fromStream(new FileInputStream(credentialsFile))
                .createScoped(Collections.singleton(CalendarScopes.CALENDAR));

            return new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();
        } catch (Exception e) {
            System.err.println("Failed to initialize Google Calendar client: " + e.getMessage());
            return null;
        }
    }

    private String generateFallbackLink(String candidateName) {
        String cleanName = candidateName.replaceAll("[^a-zA-Z0-9]", "");
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return "https://meet.jit.si/HRMS-Interview-" + cleanName + "-" + uuid;
    }
}
