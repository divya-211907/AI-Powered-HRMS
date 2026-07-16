-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: hrmspro
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK47bvqemyk6vlm0w7crc3opdd4` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'admin@hrms.com','System Admin','admin123');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_status_history`
--

DROP TABLE IF EXISTS `application_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_status_history` (
  `application_id` bigint DEFAULT NULL,
  `candidate_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `hr_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) DEFAULT NULL,
  `remarks` text,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_status_history`
--

LOCK TABLES `application_status_history` WRITE;
/*!40000 ALTER TABLE `application_status_history` DISABLE KEYS */;
INSERT INTO `application_status_history` VALUES (5,5,'2026-07-14 11:57:53.480632',1,1,'2026-07-14 11:57:53.480632','Updated status to Selected via Quick Action','Selected'),(8,8,'2026-07-14 14:31:45.641641',1,2,'2026-07-14 14:31:45.641641',NULL,'Selected'),(12,12,'2026-07-14 14:35:17.495991',1,3,'2026-07-14 14:35:17.495991',NULL,'Selected'),(5,5,'2026-07-14 14:57:27.363099',1,4,'2026-07-14 14:57:27.363099','Updated status to Rejected via Quick Action','Rejected'),(5,5,'2026-07-14 14:57:44.236733',1,5,'2026-07-14 14:57:44.236733','Updated status to Selected via Quick Action','Selected'),(5,5,'2026-07-14 15:04:24.066187',1,6,'2026-07-14 15:04:24.066187','Updated status to Selected via Quick Action','Interview Scheduled'),(14,14,'2026-07-14 16:02:47.803946',1,7,'2026-07-14 16:02:47.803946',NULL,'Selected'),(18,18,'2026-07-15 09:11:42.512828',1,8,'2026-07-15 09:11:42.512828',NULL,'Selected'),(20,20,'2026-07-15 09:12:50.085232',1,9,'2026-07-15 09:12:50.085232',NULL,'Selected');
/*!40000 ALTER TABLE `application_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `ot_hours` int DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `check_in` varchar(255) DEFAULT NULL,
  `check_out` varchar(255) DEFAULT NULL,
  `date` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKr7q0h8jfngkyybll6o9r3h9ua` (`employee_id`),
  CONSTRAINT `FKr7q0h8jfngkyybll6o9r3h9ua` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (0,6,3,NULL,NULL,'2026-07-15','24ada52@karpagamtech.ac.in','Absent'),(0,7,4,NULL,NULL,'2026-07-15','24ada52@karpagamtech.ac.in','Absent');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance_ai_insight`
--

DROP TABLE IF EXISTS `attendance_ai_insight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance_ai_insight` (
  `late_logs_flagged` int DEFAULT NULL,
  `punctuality_rate` double DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `recommendations` text,
  `warnings` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance_ai_insight`
--

LOCK TABLES `attendance_ai_insight` WRITE;
/*!40000 ALTER TABLE `attendance_ai_insight` DISABLE KEYS */;
INSERT INTO `attendance_ai_insight` VALUES (1,0,'2026-07-14 14:49:44.081367',NULL,1,NULL,'24ada52@karpagamtech.ac.in','Today\'s late arrivals flagged for: Divya. Coordinate on check-in policy expectations. | Unexcused absences flagged today for: Divya, SARMILA S, Jane Miller. Follow up to verify check-in logs.','Divya absent today, SARMILA S absent today, Jane Miller absent today'),(1,0,'2026-07-14 14:49:44.081367',NULL,2,NULL,'24ada52@karpagamtech.ac.in','Today\'s late arrivals flagged for: Divya. Coordinate on check-in policy expectations. | Unexcused absences flagged today for: Divya, SARMILA S, Jane Miller. Follow up to verify check-in logs.','Divya absent today, SARMILA S absent today, Jane Miller absent today'),(2,0,'2026-07-15 10:49:35.176360',NULL,3,NULL,'24ada52@karpagamtech.ac.in','Today\'s late arrivals flagged for: SARMILA S, nisha. Coordinate on check-in policy expectations. | Unexcused absences flagged today for: SARMILA S, nisha. Follow up to verify check-in logs.','SARMILA S absent today, nisha absent today'),(2,0,'2026-07-15 10:49:35.176360',NULL,4,NULL,'24ada52@karpagamtech.ac.in','Today\'s late arrivals flagged for: SARMILA S, nisha. Coordinate on check-in policy expectations. | Unexcused absences flagged today for: SARMILA S, nisha. Follow up to verify check-in logs.','SARMILA S absent today, nisha absent today'),(2,0,'2026-07-15 11:58:48.783759',NULL,5,NULL,'24ada52@karpagamtech.ac.in','Today\'s late arrivals flagged for: SARMILA S, nisha. Coordinate on check-in policy expectations. | Unexcused absences flagged today for: SARMILA S, nisha, sathish, rakshaya. Follow up to verify check-in logs.','SARMILA S absent today, nisha absent today, sathish absent today, rakshaya absent today'),(2,0,'2026-07-15 11:58:48.783759',NULL,6,NULL,'24ada52@karpagamtech.ac.in','Today\'s late arrivals flagged for: SARMILA S, nisha. Coordinate on check-in policy expectations. | Unexcused absences flagged today for: SARMILA S, nisha, sathish, rakshaya. Follow up to verify check-in logs.','SARMILA S absent today, nisha absent today, sathish absent today, rakshaya absent today'),(2,0,'2026-07-15 14:13:23.696095',NULL,7,NULL,'24ada52@karpagamtech.ac.in','Today\'s late arrivals flagged for: SARMILA S, nisha. Coordinate on check-in policy expectations. | Unexcused absences flagged today for: SARMILA S, nisha, sathish, rakshaya. Follow up to verify check-in logs.','SARMILA S absent today, nisha absent today, sathish absent today, rakshaya absent today'),(2,0,'2026-07-15 14:13:23.696095',NULL,8,NULL,'24ada52@karpagamtech.ac.in','Today\'s late arrivals flagged for: SARMILA S, nisha. Coordinate on check-in policy expectations. | Unexcused absences flagged today for: SARMILA S, nisha, sathish, rakshaya. Follow up to verify check-in logs.','SARMILA S absent today, nisha absent today, sathish absent today, rakshaya absent today');
/*!40000 ALTER TABLE `attendance_ai_insight` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_ai_insight`
--

DROP TABLE IF EXISTS `candidate_ai_insight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_ai_insight` (
  `ai_score` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `candidate_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `interview_questions` text,
  `position` varchar(255) DEFAULT NULL,
  `recommendations` text,
  `skills_matched` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_ai_insight`
--

LOCK TABLES `candidate_ai_insight` WRITE;
/*!40000 ALTER TABLE `candidate_ai_insight` DISABLE KEYS */;
/*!40000 ALTER TABLE `candidate_ai_insight` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_applications`
--

DROP TABLE IF EXISTS `candidate_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_applications` (
  `ai_score` int NOT NULL,
  `assigned_hr_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `job_opening_id` bigint DEFAULT NULL,
  `application_date` varchar(255) DEFAULT NULL,
  `candidate_name` varchar(255) DEFAULT NULL,
  `certifications` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `github_url` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `interview_details` text,
  `joining_date` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `portfolio_links` varchar(255) DEFAULT NULL,
  `portfolio_url` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `remarks` text,
  `resume_name` varchar(255) DEFAULT NULL,
  `resume_path` varchar(255) DEFAULT NULL,
  `skills` text,
  `status` varchar(255) DEFAULT NULL,
  `ai_explanation` text,
  `candidate_risk` varchar(255) DEFAULT NULL,
  `current_location` varchar(255) DEFAULT NULL,
  `duplicate_candidate_id` bigint DEFAULT NULL,
  `duplicate_similarity` int DEFAULT NULL,
  `education_score` int DEFAULT NULL,
  `experience_score` int DEFAULT NULL,
  `hiring_recommendation` varchar(255) DEFAULT NULL,
  `interview_readiness_score` int DEFAULT NULL,
  `match_category` varchar(255) DEFAULT NULL,
  `overall_score` int DEFAULT NULL,
  `project_score` int DEFAULT NULL,
  `projects` varchar(255) DEFAULT NULL,
  `skill_gap_analysis` text,
  `skill_score` int DEFAULT NULL,
  `suggested_department` varchar(255) DEFAULT NULL,
  `first_login` bit(1) DEFAULT NULL,
  `password_history` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_applications`
--

LOCK TABLES `candidate_applications` WRITE;
/*!40000 ALTER TABLE `candidate_applications` DISABLE KEYS */;
INSERT INTO `candidate_applications` VALUES (50,NULL,4,NULL,'2026-07-14','SARMILA S','CERTIFICATIONS, Cisco, NPTEL','sarmisarmi2811@gmail.com','2 Years','Female','https://github.com/sarmila2811',NULL,NULL,NULL,'https://linkedin.com/in/sarmila2811','8925223176',NULL,'','','Software Engineer','B.Tech in Artificial Intelligence & Data Science | Aspiring Software & AI Engineer',NULL,'1784009925669_RESUME - Copy.pdf','/uploads/1784009925669_RESUME - Copy.pdf','Java, React, Javascript, Python, Sql, Git, Html, Css','APPLIED',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(50,1,5,1,'2026-07-14','SARMILA S','CERTIFICATIONS, Cisco, NPTEL','sarmisarmi2811@gmail.com','2 Years','Female','https://github.com/sarmila2811','24ada52@karpagamtech.ac.in','Date: 14 July 2026\nTime: 03:30 PM\nMeeting Link: https://meet.jit.si/HRMS-Interview-SARMILAS-b33b1944',NULL,'https://linkedin.com/in/sarmila2811','8925223176',NULL,'','','java developer','B.Tech in Artificial Intelligence & Data Science | Aspiring Software & AI Engineer','Updated status to Selected via Quick Action','1784010435521_RESUME - Copy.pdf','/uploads/1784010435521_RESUME - Copy.pdf','Java, React, Javascript, Python, Sql, Git, Html, Css','Selected',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `candidate_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_notification`
--

DROP TABLE IF EXISTS `candidate_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_read` bit(1) NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_notification`
--

LOCK TABLES `candidate_notification` WRITE;
/*!40000 ALTER TABLE `candidate_notification` DISABLE KEYS */;
INSERT INTO `candidate_notification` VALUES (1,'2026-07-06 12:16:23.815327','dd0604084@gmail.com',_binary '','Your application status has been updated to: Interview Scheduled. Check interview details for schedule information.'),(2,'2026-07-07 10:19:14.575804','dd0604084@gmail.com',_binary '','Application Submitted: Your application for Java Developer has been submitted successfully.'),(3,'2026-07-07 10:47:48.476227','24ada13@karpagamtech.ac.in',_binary '','Application Submitted: Your application for Software Engineer has been submitted successfully.'),(4,'2026-07-07 11:01:27.879017','24ada13@karpagamtech.ac.in',_binary '\0','Application Submitted: Your application for Software Engineer has been submitted successfully.'),(5,'2026-07-07 11:04:17.823355','24mea25@karpagamtech.ac.in',_binary '\0','Application Submitted: Your application for Java Developer has been submitted successfully.'),(6,'2026-07-07 11:04:17.846431','24ada52@karpagamtech.ac.in',_binary '\0','New candidate application received. Name: kavi, Job: Java Developer.'),(7,'2026-07-07 11:04:58.365199','24mea25@karpagamtech.ac.in',_binary '\0','Your application status has been updated to: Selected'),(8,'2026-07-07 11:26:08.480108','24ada13@karpagamtech.ac.in',_binary '\0','Application Submitted: Your application for Java Developer has been submitted successfully.'),(9,'2026-07-07 11:26:08.498579','24ada52@karpagamtech.ac.in',_binary '\0','New candidate application received. Name: DIVYA R, Job: Java Developer.'),(10,'2026-07-07 11:26:53.876221','24ada13@karpagamtech.ac.in',_binary '\0','Your application status has been updated to: Shortlisted'),(11,'2026-07-07 11:27:01.187569','24ada13@karpagamtech.ac.in',_binary '\0','Your application status has been updated to: Shortlisted'),(12,'2026-07-07 11:27:53.992940','24ada13@karpagamtech.ac.in',_binary '\0','Your application status has been updated to: Selected');
/*!40000 ALTER TABLE `candidate_notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `candidate_status`
--

DROP TABLE IF EXISTS `candidate_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_status` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `interview_details` varchar(255) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_status`
--

LOCK TABLES `candidate_status` WRITE;
/*!40000 ALTER TABLE `candidate_status` DISABLE KEYS */;
INSERT INTO `candidate_status` VALUES (1,'2026-07-14 11:57:53.446709','sarmisarmi2811@gmail.com',NULL,'Updated status to Selected via Quick Action','Selected'),(2,'2026-07-14 14:31:45.632486','jane.miller@example.com',NULL,NULL,'Selected'),(3,'2026-07-14 14:35:17.478285','jane.miller3@example.com',NULL,NULL,'Selected'),(4,'2026-07-14 14:57:27.343092','sarmisarmi2811@gmail.com',NULL,'Updated status to Rejected via Quick Action','Rejected'),(5,'2026-07-14 14:57:44.200641','sarmisarmi2811@gmail.com',NULL,'Updated status to Selected via Quick Action','Selected'),(6,'2026-07-14 15:04:24.050194','sarmisarmi2811@gmail.com','Date: 14 July 2026\nTime: 03:30 PM\nMeeting Link: https://meet.jit.si/HRMS-Interview-SARMILAS-b33b1944','Updated status to Selected via Quick Action','Interview Scheduled'),(7,'2026-07-14 16:02:47.777864','jane.miller3@example.com',NULL,NULL,'Selected'),(8,'2026-07-15 09:11:42.485839','jane.miller3@example.com',NULL,NULL,'Selected'),(9,'2026-07-15 09:12:50.052718','jane.miller3@example.com',NULL,NULL,'Selected');
/*!40000 ALTER TABLE `candidate_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dashboard_ai_insight`
--

DROP TABLE IF EXISTS `dashboard_ai_insight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dashboard_ai_insight` (
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `alerts` text,
  `daily_summary` text,
  `hr_email` varchar(255) DEFAULT NULL,
  `recommendations` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=96 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dashboard_ai_insight`
--

LOCK TABLES `dashboard_ai_insight` WRITE;
/*!40000 ALTER TABLE `dashboard_ai_insight` DISABLE KEYS */;
INSERT INTO `dashboard_ai_insight` VALUES ('2026-07-14 11:49:27.470812',1,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 1 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 11:49:27.470812',2,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 1 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 11:49:28.271801',3,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 1 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 11:54:51.014172',4,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 1 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 11:54:51.014172',5,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 1 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 14:28:52.147311',6,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 14:28:52.147311',7,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 14:31:35.759644',8,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 14:31:47.753294',9,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 14:34:41.737227',10,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 14:35:17.766071',11,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 18:08:03.389908',12,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 18:08:03.389908',13,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-14 18:08:03.556592',14,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:01:24.603619',15,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:01:24.603619',16,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:01:24.908650',17,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:17:15.414130',18,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:17:15.414130',19,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:27:01.418412',20,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:27:36.605919',21,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:27:36.604169',22,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:27:36.744656',23,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:30:11.995357',24,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:31:02.650410',25,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:39:05.444050',26,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:39:18.237978',27,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:39:23.655347',28,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:41:30.107111',29,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:41:53.085222',30,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:45:04.606728',31,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:46:26.905895',32,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:46:47.162653',33,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:49:12.958057',34,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:52:20.381687',35,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:52:29.333594',36,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:52:41.502163',37,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:52:41.505919',38,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:55:18.764614',39,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','dd0604084@gmail.com','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 09:55:18.761316',40,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','dd0604084@gmail.com','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:08:44.859210',41,'Leave requests are higher than usual and may require workforce balancing.','Today\'s workforce health is strong with 0 employees present, 1 employees on approved leave, and 3 absences recorded. Recruitment activity is active with 1 new applications, 1 shortlisted candidates, and 0 interviews scheduled.','dd0604084@gmail.com','Resolve 1 pending leaves and process pending payroll logs.'),('2026-07-15 10:13:10.134610',42,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:13:33.367425',43,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:13:33.375314',44,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:14:47.166191',45,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:14:47.180820',46,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:17:44.897099',47,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:20:26.230108',48,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:20:26.230108',49,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:23:33.771846',50,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:23:33.771132',51,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:23:54.384471',52,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:23:54.386474',53,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:24:12.645432',54,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:24:12.650426',55,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:24:27.693252',56,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:24:27.693252',57,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:24:44.515409',58,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:24:44.524062',59,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:24:44.977993',60,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:47:28.139795',61,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:47:28.139795',62,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:49:32.284234',63,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 10:49:32.288238',64,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 2 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:05:19.264474',65,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:05:19.367992',66,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 3 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:05:19.264474',67,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:08:23.906318',68,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:08:23.914247',69,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:08:24.098891',70,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:14:50.262321',71,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:14:50.261318',72,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:29:13.247934',73,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:29:13.249908',74,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:57:34.659017',75,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:57:34.659017',76,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:59:50.239448',77,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 11:59:50.240449',78,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 14:13:21.018343',79,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 14:13:21.018343',80,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 14:15:45.848839',81,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 14:15:45.848839',82,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 14:22:59.961667',83,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 14:22:59.966665',84,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 14:32:50.069657',85,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 14:32:50.076457',86,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 15:15:24.389825',87,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 15:15:24.389825',88,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 15:58:04.208129',89,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 15:58:04.204128',90,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 15:58:18.399726',91,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-15 15:58:18.401730',92,'Attendance has dropped below expected levels today (0.0%).','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-16 00:21:37.975471',93,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-16 00:21:37.975471',94,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. Recruitment activity is active with 1 new applications, 0 shortlisted candidates, and 0 interviews scheduled.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.'),('2026-07-16 00:21:39.207675',95,'Operational efficiency and workforce telemetry trends are currently stable.','Today\'s workforce health is strong with 0 employees present, 0 employees on approved leave, and 4 absences recorded. No candidate applications are currently awaiting review.','24ada52@karpagamtech.ac.in','Resolve 0 pending leaves and process pending payroll logs.');
/*!40000 ALTER TABLE `dashboard_ai_insight` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `employee_count` int NOT NULL,
  `department_name` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `manager` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department`
--

LOCK TABLES `department` WRITE;
/*!40000 ALTER TABLE `department` DISABLE KEYS */;
INSERT INTO `department` VALUES (1,30,'it','24ada52@karpagamtech.ac.in','sarmila'),(2,100,'FINANCE','24ada52@karpagamtech.ac.in','KAVIN S');
/*!40000 ALTER TABLE `department` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `department_ai_insight`
--

DROP TABLE IF EXISTS `department_ai_insight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `department_ai_insight` (
  `health_score` double DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `department_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ai_recommendations` text,
  `department_name` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `workload_analysis` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `department_ai_insight`
--

LOCK TABLES `department_ai_insight` WRITE;
/*!40000 ALTER TABLE `department_ai_insight` DISABLE KEYS */;
INSERT INTO `department_ai_insight` VALUES (50,'2026-07-14 11:44:20.294865',1,1,'Maintain current operational parameters. Continue standard support.','it','24ada52@karpagamtech.ac.in','Optimal workload distribution. Staff allocation and check-in schedules meet target output.'),(50,'2026-07-15 14:26:35.607889',1,2,'Maintain current operational parameters. Continue standard support.','it','24ada52@karpagamtech.ac.in','Optimal workload distribution. Staff allocation and check-in schedules meet target output.'),(50,'2026-07-15 14:26:39.851343',2,3,'Maintain current operational parameters. Continue standard support.','FINANCE','24ada52@karpagamtech.ac.in','Optimal workload distribution. Staff allocation and check-in schedules meet target output.'),(50,'2026-07-15 14:27:47.870326',1,4,'Maintain current operational parameters. Continue standard support.','it','24ada52@karpagamtech.ac.in','Optimal workload distribution. Staff allocation and check-in schedules meet target output.'),(50,'2026-07-15 14:30:00.657403',1,5,'Maintain current operational parameters. Continue standard support.','it','24ada52@karpagamtech.ac.in','Optimal workload distribution. Staff allocation and check-in schedules meet target output.'),(50,'2026-07-15 14:30:07.554432',2,6,'Maintain current operational parameters. Continue standard support.','FINANCE','24ada52@karpagamtech.ac.in','Optimal workload distribution. Staff allocation and check-in schedules meet target output.'),(50,'2026-07-15 14:30:11.632322',1,7,'Maintain current operational parameters. Continue standard support.','it','24ada52@karpagamtech.ac.in','Optimal workload distribution. Staff allocation and check-in schedules meet target output.'),(82,'2026-07-15 15:58:09.235918',1,8,'Leave score is 100/100. Training completion is 89%. Attrition risk score is 89%.','it','24ada52@karpagamtech.ac.in','it attendance rate is healthy at 50%.'),(0,'2026-07-15 15:58:12.442554',2,9,'Leave score is 0/100. Training completion is 0%. Attrition risk score is 0%.','FINANCE','24ada52@karpagamtech.ac.in','Insufficient data to calculate department health score.');
/*!40000 ALTER TABLE `department_ai_insight` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `department_id` int DEFAULT NULL,
  `salary` double DEFAULT NULL,
  `candidate_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `employee_id` varchar(255) DEFAULT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `mobile_number` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profile_information` varchar(255) DEFAULT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `skills` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `first_login` bit(1) DEFAULT NULL,
  `password_history` varchar(2000) DEFAULT NULL,
  `email_sent` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKbejtwvg9bxus2mffsm3swj3u9` (`department_id`),
  CONSTRAINT `FKbejtwvg9bxus2mffsm3swj3u9` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,50000,5,6,'','java developer','sarmisarmi2811@gmail.com','EMP-2026-IT-9659','2 Years','Female','24ada52@karpagamtech.ac.in','8925223176','SARMILA S','$2a$10$5XJpoiHq.Q3hNrotUUpUeeqFXRDyWbaPs7xLoqFeLsXbTekvXGGJG','Qualifications: B.Tech in Artificial Intelligence & Data Science | Aspiring Software & AI Engineer','/uploads/1784010435521_RESUME - Copy.pdf','Java, React, Javascript, Python, Sql, Git, Html, Css','sarmila.s',NULL,_binary '','$2a$10$5XJpoiHq.Q3hNrotUUpUeeqFXRDyWbaPs7xLoqFeLsXbTekvXGGJG',_binary ''),(1,10000,NULL,7,'','','24ada13@karpagamtech.ac.in','EMP-2026-DEPT-6858','',NULL,'24ada52@karpagamtech.ac.in','','nisha','$2a$10$m1u.0jyjvNJCf.d/K.QFc.VOKl1mpjyk30UBOa4FtGxQNMCVQVr9m','','','','nisha',NULL,_binary '','$2a$10$m1u.0jyjvNJCf.d/K.QFc.VOKl1mpjyk30UBOa4FtGxQNMCVQVr9m',_binary ''),(1,123456,NULL,14,'','software engineer','dd0604084@gmail.com','EMP-2026-DEPT-4707','',NULL,'24ada52@karpagamtech.ac.in','7418749155','sathish','$2a$10$jDBAIVi/cAiNu851xMgnPOXtVUX4rO0ZwzsQ9T/9v7nOt3PRi9qR.','','','','sathish','Active',_binary '','$2a$10$jDBAIVi/cAiNu851xMgnPOXtVUX4rO0ZwzsQ9T/9v7nOt3PRi9qR.',NULL),(1,50000,NULL,15,'','java developer','24ada42@karpagamtech.ac.in','EMP-2026-DEPT-3815','',NULL,'24ada52@karpagamtech.ac.in','9345491130','rakshaya','$2a$10$nONy5/Y/ZdFewf8JN8AeCO.cCdXfLj5FrNbgd1jFii7bKmbqXgd1G','','','','rakshaya','Active',_binary '','$2a$10$nONy5/Y/ZdFewf8JN8AeCO.cCdXfLj5FrNbgd1jFii7bKmbqXgd1G',_binary '');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_audit_logs`
--

DROP TABLE IF EXISTS `employee_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(255) DEFAULT NULL,
  `details` varchar(255) DEFAULT NULL,
  `employee_id` varchar(255) DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_audit_logs`
--

LOCK TABLES `employee_audit_logs` WRITE;
/*!40000 ALTER TABLE `employee_audit_logs` DISABLE KEYS */;
INSERT INTO `employee_audit_logs` VALUES (1,'Credentials Sent','Welcome credentials sent successfully.','EMP-2026-DEPT-3815','2026-07-15 11:06:17.721168'),(2,'Employee Created','Employee account provisioned in database.','EMP-2026-DEPT-3815','2026-07-15 11:06:17.785404'),(3,'Credentials Resent','Resent welcome credentials email.','EMP-2026-DEPT-3815','2026-07-15 11:15:09.070287'),(4,'Credentials Resent','Resent welcome credentials email.','EMP-2026-DEPT-3815','2026-07-15 11:15:10.767915'),(5,'Credentials Resent','Resent welcome credentials email.','EMP-2026-DEPT-6858','2026-07-15 11:15:13.419069'),(6,'Credentials Resent','Resent welcome credentials email.','EMP-2026-IT-9659','2026-07-15 11:15:14.625950');
/*!40000 ALTER TABLE `employee_audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_performance_ai_insight`
--

DROP TABLE IF EXISTS `employee_performance_ai_insight`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_performance_ai_insight` (
  `rating` double DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employee_name` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `performance_summary` text,
  `training_recommendations` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_performance_ai_insight`
--

LOCK TABLES `employee_performance_ai_insight` WRITE;
/*!40000 ALTER TABLE `employee_performance_ai_insight` DISABLE KEYS */;
INSERT INTO `employee_performance_ai_insight` VALUES (4.3,'2026-07-14 11:45:06.956948',1,1,'Divya','24ada52@karpagamtech.ac.in','Divya shows strong technical capability and dedication in the it team.','Advanced hands-on program in Cloud Deployments | Professional Communication & Leadership Essentials'),(4.3,'2026-07-14 14:55:12.129875',1,2,'Divya','24ada52@karpagamtech.ac.in','Divya shows strong technical capability and dedication in the it team.','Advanced hands-on program in Cloud Deployments | Professional Communication & Leadership Essentials'),(4.3,'2026-07-15 09:15:55.805898',7,3,'nisha','24ada52@karpagamtech.ac.in','nisha shows strong technical capability and dedication in the it team.','Advanced hands-on program in Cloud Deployments | Professional Communication & Leadership Essentials'),(4.3,'2026-07-15 09:16:04.409063',7,4,'nisha','24ada52@karpagamtech.ac.in','nisha shows strong technical capability and dedication in the it team.','Advanced hands-on program in Cloud Deployments | Professional Communication & Leadership Essentials'),(4.3,'2026-07-15 09:16:16.579946',1,5,'Divya','24ada52@karpagamtech.ac.in','Divya shows strong technical capability and dedication in the it team.','Advanced hands-on program in Cloud Deployments | Professional Communication & Leadership Essentials'),(4.3,'2026-07-15 11:14:59.026435',7,6,'nisha','24ada52@karpagamtech.ac.in','nisha shows strong technical capability and dedication in the it team.','Advanced hands-on program in Cloud Deployments | Professional Communication & Leadership Essentials'),(4.3,'2026-07-15 11:15:15.866876',7,7,'nisha','24ada52@karpagamtech.ac.in','nisha shows strong technical capability and dedication in the it team.','Advanced hands-on program in Cloud Deployments | Professional Communication & Leadership Essentials'),(4.3,'2026-07-15 11:15:21.048589',14,8,'sathish','24ada52@karpagamtech.ac.in','sathish shows strong technical capability and dedication in the it team.','Advanced hands-on program in Cloud Deployments | Professional Communication & Leadership Essentials'),(2.6,'2026-07-15 11:29:22.511292',7,9,'nisha','24ada52@karpagamtech.ac.in','Attendance needs improvement. Work continuity and output are impacted by low presence.','Enforce standard attendance improvement plan. | Recommend refresher training programs and close performance mentoring.'),(2.6,'2026-07-15 11:29:28.640728',6,10,'SARMILA S','24ada52@karpagamtech.ac.in','Attendance needs improvement. Work continuity and output are impacted by low presence.','Enforce standard attendance improvement plan. | Recommend refresher training programs and close performance mentoring.'),(2.6,'2026-07-15 11:29:34.164421',15,11,'rakshaya','24ada52@karpagamtech.ac.in','Attendance needs improvement. Work continuity and output are impacted by low presence.','Enforce standard attendance improvement plan. | Recommend refresher training programs and close performance mentoring.'),(4.5,'2026-07-15 11:57:41.317001',14,12,'sathish','24ada52@karpagamtech.ac.in','Excellent productivity and consistent performance. Exceeds expectations in major deliverables.','Recommend for leadership acceleration program. | Consider for promotion in the next appraisal cycle.'),(3.35,'2026-07-15 14:13:45.268234',7,13,'nisha','24ada52@karpagamtech.ac.in','Attendance needs improvement. Work continuity and output are impacted by low presence.','Enforce standard attendance improvement plan. | Recommend refresher training programs and close performance mentoring.'),(4.5,'2026-07-15 14:13:50.627853',14,14,'sathish','24ada52@karpagamtech.ac.in','Excellent productivity and consistent performance. Exceeds expectations in major deliverables.','Recommend for leadership acceleration program. | Consider for promotion in the next appraisal cycle.');
/*!40000 ALTER TABLE `employee_performance_ai_insight` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_request`
--

DROP TABLE IF EXISTS `employee_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_request` (
  `created_at` datetime(6) DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `details` text,
  `employee_email` varchar(255) DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `remarks` text,
  `request_type` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_request`
--

LOCK TABLES `employee_request` WRITE;
/*!40000 ALTER TABLE `employee_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_accounts`
--

DROP TABLE IF EXISTS `hr_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `approved_by_admin` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `hr_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKmxk70fljuac1de7s7lqd51cds` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_accounts`
--

LOCK TABLES `hr_accounts` WRITE;
/*!40000 ALTER TABLE `hr_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `hr_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hr_user`
--

DROP TABLE IF EXISTS `hr_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hr_user` (
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `shift_end` varchar(255) DEFAULT NULL,
  `shift_start` varchar(255) DEFAULT NULL,
  `first_login` bit(1) DEFAULT NULL,
  `password_history` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKo6vrs5l21q9mhppg2k4hntwp9` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hr_user`
--

LOCK TABLES `hr_user` WRITE;
/*!40000 ALTER TABLE `hr_user` DISABLE KEYS */;
INSERT INTO `hr_user` VALUES ('2026-07-14 11:11:19.573469',1,'Karpagam Tech','24ada52@karpagamtech.ac.in','Divya R','$2a$10$l.lvpLODZEQVKd6OP2C2g.1b1QjW8wOz4JsuTFmP0KDADQjiwdVYW','17:00','09:00',_binary '\0','$2a$10$l.lvpLODZEQVKd6OP2C2g.1b1QjW8wOz4JsuTFmP0KDADQjiwdVYW'),('2026-07-15 09:54:46.801479',2,'abc','dd0604084@gmail.com','SARMILA S','Divya@123','17:00','09:00',NULL,NULL),('2026-07-16 00:04:37.266555',3,'abc','24mea25@karpagamtech.ac.in','SARMILA S','$2a$10$dJFNET7nnBnSkZB8jJOPRuT4kVKKnA9YjFpMCTrw9WKO119azV/GO','17:00','09:00',_binary '','$2a$10$dJFNET7nnBnSkZB8jJOPRuT4kVKKnA9YjFpMCTrw9WKO119azV/GO');
/*!40000 ALTER TABLE `hr_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interview_schedules`
--

DROP TABLE IF EXISTS `interview_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `interview_schedules` (
  `ai_generated` bit(1) NOT NULL,
  `candidate_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `hr_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `interview_date` varchar(255) DEFAULT NULL,
  `interview_time` varchar(255) DEFAULT NULL,
  `interview_type` varchar(255) DEFAULT NULL,
  `meeting_link` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interview_schedules`
--

LOCK TABLES `interview_schedules` WRITE;
/*!40000 ALTER TABLE `interview_schedules` DISABLE KEYS */;
INSERT INTO `interview_schedules` VALUES (_binary '',5,'2026-07-14 15:04:23.984272',1,1,'14 July 2026','03:30 PM','Online','https://meet.jit.si/HRMS-Interview-SARMILAS-b33b1944','UPCOMING');
/*!40000 ALTER TABLE `interview_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_opening`
--

DROP TABLE IF EXISTS `job_opening`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_opening` (
  `created_at` datetime(6) DEFAULT NULL,
  `hr_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `department` varchar(255) DEFAULT NULL,
  `description` text,
  `hr_email` varchar(255) DEFAULT NULL,
  `hr_name` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_opening`
--

LOCK TABLES `job_opening` WRITE;
/*!40000 ALTER TABLE `job_opening` DISABLE KEYS */;
INSERT INTO `job_opening` VALUES ('2026-07-14 11:56:36.167901',1,1,'Sales & Marketing','Developed Java-based web applications using Spring Boot and REST APIs.\nImplemented CRUD operations and integrated MySQL/MongoDB databases.\nCollaborated with cross-functional teams to build scalable and maintainable software solutions.','24ada52@karpagamtech.ac.in','24ada52','java developer');
/*!40000 ALTER TABLE `job_opening` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_ai_analysis`
--

DROP TABLE IF EXISTS `leave_ai_analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_ai_analysis` (
  `confidence_score` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `leave_request_id` bigint DEFAULT NULL,
  `ai_reason` text,
  `recommendation` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_ai_analysis`
--

LOCK TABLES `leave_ai_analysis` WRITE;
/*!40000 ALTER TABLE `leave_ai_analysis` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_ai_analysis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_request`
--

DROP TABLE IF EXISTS `leave_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_request` (
  `created_at` datetime(6) DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employee_email` varchar(255) DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `from_date` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `leave_type` varchar(255) DEFAULT NULL,
  `reason` text,
  `remarks` text,
  `status` varchar(255) DEFAULT NULL,
  `to_date` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_request`
--

LOCK TABLES `leave_request` WRITE;
/*!40000 ALTER TABLE `leave_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `is_read` bit(1) DEFAULT NULL,
  `application_id` bigint DEFAULT NULL,
  `candidate_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `message` text,
  `title` varchar(255) DEFAULT NULL,
  `dtype` varchar(31) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (_binary '\0',NULL,NULL,'2026-07-14 09:37:36.870117',1,'jane.doe@example.com','Application Submitted: Your application for Software Engineer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 09:37:36.885344',2,'admin@workspace.com','New candidate application received. Name: Jane Doe, Job: Software Engineer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 10:15:32.919092',3,'jane.doe@example.com','Application Submitted: Your application for Software Engineer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 10:15:32.933785',4,'admin@workspace.com','New candidate application received. Name: Jane Doe, Job: Software Engineer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 10:59:48.208248',5,'jane.doe@example.com','Application Submitted: Your application for Software Engineer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 10:59:48.221199',6,'admin@workspace.com','New candidate application received. Name: Jane Doe, Job: Software Engineer.',NULL,'',NULL,NULL,NULL),(_binary '',NULL,NULL,'2026-07-14 11:46:26.348077',7,'dd0604084@gmail.com','Attendance Checked In successfully. Status: Absent.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 11:48:45.932552',8,'sarmisarmi2811@gmail.com','Application Submitted: Your application for Software Engineer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 11:57:15.746091',9,'sarmisarmi2811@gmail.com','Application Submitted: Your application for java developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '',NULL,NULL,'2026-07-14 11:57:15.766067',10,'24ada52@karpagamtech.ac.in','New candidate application received. Name: SARMILA S, Job: java developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',5,5,'2026-07-14 11:57:53.516699',11,'sarmisarmi2811@gmail.com','? Congratulations! You have been selected and your employee account has been created.','Application Selected','',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:29:18.280319',12,'jane.doe@example.com','Application Submitted: Your application for Software Engineer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:29:18.288946',13,'admin@workspace.com','New candidate application received. Name: Jane Doe, Job: Software Engineer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:30:21.011951',14,'jane.miller@example.com','Application Submitted: Your application for React Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:30:21.020538',15,'admin@workspace.com','New candidate application received. Name: Jane Miller, Job: React Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:31:33.282133',16,'jane.miller@example.com','Application Submitted: Your application for React Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '',NULL,NULL,'2026-07-14 14:31:33.289239',17,'24ada52@karpagamtech.ac.in','New candidate application received. Name: Jane Miller, Job: React Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:31:33.446246',18,'jane.miller@example.com','Application Submitted: Your application for Java Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:31:33.455000',19,'admin@workspace.com','New candidate application received. Name: Jane Miller Duplicate, Job: Java Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',8,8,'2026-07-14 14:31:45.652502',20,'jane.miller@example.com','? Congratulations! You have been selected and your employee account has been created.','Application Selected','',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:33:10.370349',21,'jane.miller@example.com','Application Submitted: Your application for React Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '',NULL,NULL,'2026-07-14 14:33:10.379955',22,'24ada52@karpagamtech.ac.in','New candidate application received. Name: Jane Miller, Job: React Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:33:10.547349',23,'jane.miller@example.com','Application Submitted: Your application for Java Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:33:10.556561',24,'admin@workspace.com','New candidate application received. Name: Jane Miller Duplicate, Job: Java Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:34:40.143858',25,'jane.miller3@example.com','Application Submitted: Your application for React Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '',NULL,NULL,'2026-07-14 14:34:40.152473',26,'24ada52@karpagamtech.ac.in','New candidate application received. Name: Jane Miller Three, Job: React Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:34:40.295455',27,'jane.miller3@example.com','Application Submitted: Your application for Java Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 14:34:40.302287',28,'admin@workspace.com','New candidate application received. Name: Jane Miller Duplicate, Job: Java Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',12,12,'2026-07-14 14:35:17.505164',29,'jane.miller3@example.com','? Congratulations! You have been selected and your employee account has been created.','Application Selected','',NULL,NULL,NULL),(_binary '\0',5,5,'2026-07-14 14:57:27.381074',30,'sarmisarmi2811@gmail.com','Thank you for applying. After careful review, we are unable to proceed further with your application.','Application Status Update','',NULL,NULL,NULL),(_binary '\0',5,5,'2026-07-14 14:57:44.275726',31,'sarmisarmi2811@gmail.com','? Congratulations! You have been selected and your employee account has been created.','Application Selected','',NULL,NULL,NULL),(_binary '\0',5,5,'2026-07-14 15:04:24.081219',32,'sarmisarmi2811@gmail.com','Your interview has been scheduled.','Interview Scheduled','',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 16:02:24.310313',33,'jane.miller3@example.com','Application Submitted: Your application for React Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '',NULL,NULL,'2026-07-14 16:02:24.368501',34,'24ada52@karpagamtech.ac.in','New candidate application received. Name: Jane Miller Three, Job: React Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 16:02:25.170458',35,'jane.miller3@example.com','Application Submitted: Your application for Java Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 16:02:25.199900',36,'admin@workspace.com','New candidate application received. Name: Jane Miller Duplicate, Job: Java Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',14,14,'2026-07-14 16:02:47.828927',37,'jane.miller3@example.com','? Congratulations! You have been selected and your employee account has been created.','Application Selected','',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 17:54:33.575876',38,'jane.doe@example.com','Application Submitted: Your application for Software Engineer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 17:54:33.591377',39,'admin@workspace.com','New candidate application received. Name: Jane Doe, Job: Software Engineer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 18:01:44.482267',40,'jane.doe@example.com','Application Submitted: Your application for Software Engineer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-14 18:01:44.492039',41,'admin@workspace.com','New candidate application received. Name: Jane Doe, Job: Software Engineer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-15 09:11:35.298026',42,'jane.miller3@example.com','Application Submitted: Your application for React Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '',NULL,NULL,'2026-07-15 09:11:35.318049',43,'24ada52@karpagamtech.ac.in','New candidate application received. Name: Jane Miller Three, Job: React Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-15 09:11:35.745467',44,'jane.miller3@example.com','Application Submitted: Your application for Java Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-15 09:11:35.758260',45,'admin@workspace.com','New candidate application received. Name: Jane Miller Duplicate, Job: Java Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',18,18,'2026-07-15 09:11:42.538847',46,'jane.miller3@example.com','? Congratulations! You have been selected and your employee account has been created.','Application Selected','',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-15 09:12:40.524382',47,'jane.miller3@example.com','Application Submitted: Your application for React Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '',NULL,NULL,'2026-07-15 09:12:40.534097',48,'24ada52@karpagamtech.ac.in','New candidate application received. Name: Jane Miller Three, Job: React Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-15 09:12:40.922894',49,'jane.miller3@example.com','Application Submitted: Your application for Java Developer has been submitted successfully.',NULL,'',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-15 09:12:40.933627',50,'admin@workspace.com','New candidate application received. Name: Jane Miller Duplicate, Job: Java Developer.',NULL,'',NULL,NULL,NULL),(_binary '\0',20,20,'2026-07-15 09:12:50.101061',51,'jane.miller3@example.com','? Congratulations! You have been selected and your employee account has been created.','Application Selected','',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-15 09:31:00.074443',52,'dd0604084@gmail.com','You have been marked Absent because no check-in was recorded before 09:30 AM.','Absent Alert','',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-15 09:31:00.098152',53,'sarmisarmi2811@gmail.com','You have been marked Absent because no check-in was recorded before 09:30 AM.','Absent Alert','',NULL,NULL,NULL),(_binary '\0',NULL,NULL,'2026-07-15 09:31:00.119729',54,'24ada13@karpagamtech.ac.in','You have been marked Absent because no check-in was recorded before 09:30 AM.','Absent Alert','',NULL,NULL,NULL);
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payroll`
--

DROP TABLE IF EXISTS `payroll`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payroll` (
  `basic_salary` double NOT NULL,
  `bonus` double NOT NULL,
  `deductions` double NOT NULL,
  `net_salary` double NOT NULL,
  `employee_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `hr_email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5o7fr6cbvrkgud2unv0p5rqlm` (`employee_id`),
  CONSTRAINT `FK5o7fr6cbvrkgud2unv0p5rqlm` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payroll`
--

LOCK TABLES `payroll` WRITE;
/*!40000 ALTER TABLE `payroll` DISABLE KEYS */;
/*!40000 ALTER TABLE `payroll` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `employee_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date` varchar(255) DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `from_time` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `to_time` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recruitment`
--

DROP TABLE IF EXISTS `recruitment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recruitment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ai_score` int NOT NULL,
  `application_date` varchar(255) DEFAULT NULL,
  `candidate_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `interview_details` text,
  `joining_date` varchar(255) DEFAULT NULL,
  `mobile` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `position` varchar(255) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `remarks` text,
  `resume_name` varchar(255) DEFAULT NULL,
  `resume_path` varchar(255) DEFAULT NULL,
  `skills` text,
  `status` varchar(255) DEFAULT NULL,
  `job_opening_id` bigint DEFAULT NULL,
  `assigned_hr_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recruitment`
--

LOCK TABLES `recruitment` WRITE;
/*!40000 ALTER TABLE `recruitment` DISABLE KEYS */;
INSERT INTO `recruitment` VALUES (1,75,'2026-07-06','divya','dd0604084@gmail.com','2 Years',NULL,NULL,NULL,'9025645921',NULL,'Java Developer','Bachelor of Science in Computer Science',NULL,'1783399754466_divyaresume.pdf','/uploads/1783399754466_divyaresume.pdf','Java, Spring Boot, MySQL, REST API, Git','APPLIED',NULL,NULL),(2,75,'2026-07-07','kavi','24ada13@karpagamtech.ac.in','2 Years',NULL,NULL,NULL,'9025645921',NULL,'Software Engineer','Bachelor of Science in Computer Science',NULL,'1783402287633_divyaresume.pdf','/uploads/1783402287633_divyaresume.pdf','Java, Spring Boot, MySQL, REST API, Git','APPLIED',NULL,NULL),(3,75,'2026-07-07','kavi','24mea25@karpagamtech.ac.in','2 Years','24ada52@karpagamtech.ac.in',NULL,NULL,'9025645921',NULL,'Java Developer','Bachelor of Science in Computer Science','Updated status to Selected via Quick Action','1783402457664_divyaresume.pdf','/uploads/1783402457664_divyaresume.pdf','Java, Spring Boot, MySQL, REST API, Git','Selected',1,2);
/*!40000 ALTER TABLE `recruitment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recruitment_fraud`
--

DROP TABLE IF EXISTS `recruitment_fraud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recruitment_fraud` (
  `duplicate_score` int NOT NULL,
  `fraud_score` int NOT NULL,
  `application_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `ai_analysis` text,
  `candidate_id` varchar(255) DEFAULT NULL,
  `risk_level` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recruitment_fraud`
--

LOCK TABLES `recruitment_fraud` WRITE;
/*!40000 ALTER TABLE `recruitment_fraud` DISABLE KEYS */;
INSERT INTO `recruitment_fraud` VALUES (0,10,1,'2026-07-14 09:37:36.849993',1,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.doe@example.com','Low'),(0,10,2,'2026-07-14 10:15:32.880530',2,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.doe@example.com','Low'),(0,10,3,'2026-07-14 10:59:48.169827',3,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.doe@example.com','Low'),(0,10,4,'2026-07-14 11:48:45.886550',4,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','sarmisarmi2811@gmail.com','Low'),(100,60,5,'2026-07-14 11:57:15.717970',5,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 60/100\n- **Risk Level**: **Medium**\n- **Duplicate Profile Score**: 100%\n\n#### Warnings Found:\n- ⚠️ Resume/profile metadata overlaps with an existing application (100% similarity). Conflict found with candidate: SARMILA S (sarmisarmi2811@gmail.com)\n','sarmisarmi2811@gmail.com','Medium'),(0,10,6,'2026-07-14 14:29:18.271244',6,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.doe@example.com','Low'),(0,10,7,'2026-07-14 14:30:21.001244',7,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.miller@example.com','Low'),(0,10,8,'2026-07-14 14:31:33.272466',8,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.miller@example.com','Low'),(90,55,9,'2026-07-14 14:31:33.437733',9,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 55/100\n- **Risk Level**: **Medium**\n- **Duplicate Profile Score**: 90%\n\n#### Warnings Found:\n- ⚠️ Resume/profile metadata overlaps with an existing application (90% similarity). Conflict found with candidate: Jane Miller (jane.miller@example.com)\n','jane.miller@example.com','Medium'),(0,10,10,'2026-07-14 14:33:10.359833',10,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.miller@example.com','Low'),(90,55,11,'2026-07-14 14:33:10.538914',11,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 55/100\n- **Risk Level**: **Medium**\n- **Duplicate Profile Score**: 90%\n\n#### Warnings Found:\n- ⚠️ Resume/profile metadata overlaps with an existing application (90% similarity). Conflict found with candidate: Jane Miller (jane.miller@example.com)\n','jane.miller@example.com','Medium'),(0,10,12,'2026-07-14 14:34:40.135302',12,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.miller3@example.com','Low'),(90,55,13,'2026-07-14 14:34:40.287890',13,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 55/100\n- **Risk Level**: **Medium**\n- **Duplicate Profile Score**: 90%\n\n#### Warnings Found:\n- ⚠️ Resume/profile metadata overlaps with an existing application (90% similarity). Conflict found with candidate: Jane Miller Three (jane.miller3@example.com)\n','jane.miller3@example.com','Medium'),(0,10,14,'2026-07-14 16:02:24.145152',14,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.miller3@example.com','Low'),(90,55,15,'2026-07-14 16:02:25.124613',15,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 55/100\n- **Risk Level**: **Medium**\n- **Duplicate Profile Score**: 90%\n\n#### Warnings Found:\n- ⚠️ Resume/profile metadata overlaps with an existing application (90% similarity). Conflict found with candidate: Jane Miller Three (jane.miller3@example.com)\n','jane.miller3@example.com','Medium'),(0,10,16,'2026-07-14 17:54:33.553677',16,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.doe@example.com','Low'),(0,10,17,'2026-07-14 18:01:44.430888',17,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.doe@example.com','Low'),(0,10,18,'2026-07-15 09:11:35.269020',18,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.miller3@example.com','Low'),(90,55,19,'2026-07-15 09:11:35.730452',19,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 55/100\n- **Risk Level**: **Medium**\n- **Duplicate Profile Score**: 90%\n\n#### Warnings Found:\n- ⚠️ Resume/profile metadata overlaps with an existing application (90% similarity). Conflict found with candidate: Jane Miller Three (jane.miller3@example.com)\n','jane.miller3@example.com','Medium'),(0,10,20,'2026-07-15 09:12:40.476072',20,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 10/100\n- **Risk Level**: **Low**\n- **Duplicate Profile Score**: 0%\n\n#### Warnings Found:\n✓ No suspicious patterns detected in this application.\n','jane.miller3@example.com','Low'),(90,55,21,'2026-07-15 09:12:40.910456',21,'### ? AI Recruitment Fraud Report (System Fallback)\n\n- **Fraud Risk Score**: 55/100\n- **Risk Level**: **Medium**\n- **Duplicate Profile Score**: 90%\n\n#### Warnings Found:\n- ⚠️ Resume/profile metadata overlaps with an existing application (90% similarity). Conflict found with candidate: Jane Miller Three (jane.miller3@example.com)\n','jane.miller3@example.com','Medium');
/*!40000 ALTER TABLE `recruitment_fraud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resume_analysis`
--

DROP TABLE IF EXISTS `resume_analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resume_analysis` (
  `match_score` int DEFAULT NULL,
  `analysis_id` bigint NOT NULL AUTO_INCREMENT,
  `candidate_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `certifications` text,
  `education` text,
  `email` varchar(255) DEFAULT NULL,
  `experience` text,
  `full_name` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `github_url` text,
  `linkedin_url` text,
  `matching_skills` text,
  `missing_skills` text,
  `mobile` varchar(255) DEFAULT NULL,
  `portfolio_url` text,
  `skills` text,
  `suitability` text,
  `summary` text,
  `ai_explanation` text,
  `candidate_risk` varchar(255) DEFAULT NULL,
  `current_location` varchar(255) DEFAULT NULL,
  `duplicate_candidate_id` bigint DEFAULT NULL,
  `duplicate_similarity` int DEFAULT NULL,
  `education_score` int DEFAULT NULL,
  `experience_score` int DEFAULT NULL,
  `hiring_recommendation` varchar(255) DEFAULT NULL,
  `interview_readiness_score` int DEFAULT NULL,
  `match_category` varchar(255) DEFAULT NULL,
  `overall_score` int DEFAULT NULL,
  `project_score` int DEFAULT NULL,
  `projects` varchar(255) DEFAULT NULL,
  `skill_gap_analysis` text,
  `skill_score` int DEFAULT NULL,
  `suggested_department` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`analysis_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resume_analysis`
--

LOCK TABLES `resume_analysis` WRITE;
/*!40000 ALTER TABLE `resume_analysis` DISABLE KEYS */;
INSERT INTO `resume_analysis` VALUES (0,1,1,'2026-07-14 09:37:36.915744','','Degree: B.Tech in Computer Science','jane.doe@example.com','Experience: 3 Years','Jane Doe','','https://github.com/johndoe','https://linkedin.com/in/johndoe','','','9988776655','https://linkedin.com/in/johndoe','Java, Spring Boot, React, Javascript, SQL','Candidate matches 0% of skills.','Candidate matches 0% of skills.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(0,2,2,'2026-07-14 10:15:32.968421','Certifications: AWS Solutions Architect, Oracle Java Certification','Degree: B.Tech in Computer Science','jane.doe@example.com','','Jane Doe','Female','https://github.com/johndoe','https://linkedin.com/in/johndoe','','','9988776655','https://janedoe.dev','Java, Spring Boot, React, Javascript, SQL, B.Tech in Computer Science, National Institute of Technology','Candidate matches 0% of skills.','Candidate matches 0% of skills.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(0,3,3,'2026-07-14 10:59:48.249632','AWS Solutions Architect, Oracle Java Certification','B.Tech in Computer Science','jane.doe@example.com','','Jane Doe','Female','https://github.com/johndoe','https://linkedin.com/in/johndoe','','','9988776655','https://janedoe.dev','Java, Spring Boot, React, Javascript, SQL, B.Tech in Computer Science, National Institute of Technology','Candidate matches 0% of skills.','Candidate matches 0% of skills.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(0,4,4,'2026-07-14 11:48:55.634772','','',NULL,'','','','','','','',NULL,'','','Candidate matches 0% of skills.','Candidate matches 0% of skills.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(0,5,5,'2026-07-14 11:57:19.752653','','',NULL,'','','','','','','',NULL,'','','Candidate matches 0% of skills.','Candidate matches 0% of skills.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(80,6,6,'2026-07-14 14:29:18.310660','AWS Solutions Architect, Oracle Java Certification','B.Tech in Computer Science','jane.doe@example.com','','Jane Doe','Female','https://github.com/johndoe','https://linkedin.com/in/johndoe','','','9988776655','https://janedoe.dev','Java, Spring Boot, React, Javascript, SQL, B.Tech in Computer Science, National Institute of Technology','Candidate matches 80% of skills.','Candidate matches 80% of skills.','Candidate recommended because overall score is 63% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)','Not Specified',NULL,0,85,40,'Needs Review',58,'Average Match',63,50,'No specific projects detailed in resume.','No critical skill gaps identified.',80,'Frontend Department'),(80,7,7,'2026-07-14 14:30:21.041766','Location: San Francisco, CA','B.Tech in IT','jane.miller@example.com','','Jane Miller','','','','','','9000000001','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 80% of skills.','Candidate matches 80% of skills.','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',NULL,0,85,40,'Recommended',67,'Good Match',72,85,'Portfolio Website, Chat Application','No critical skill gaps identified.',80,'Frontend Department'),(11,8,8,'2026-07-14 14:31:33.317462','Location: San Francisco, CA','B.Tech in IT','jane.miller@example.com','','Jane Miller','','','','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','9000000001','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 11% of skills.','Candidate matches 11% of skills.','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',NULL,0,85,40,'Needs Review',50,'Average Match',55,85,'Portfolio Website, Chat Application','Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,9,9,'2026-07-14 14:31:33.481171','Location: San Francisco, CA','B.Tech in IT','jane.miller@example.com','','Jane Miller','','','','','','9000000001','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 80% of skills.','Candidate matches 80% of skills.','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',8,100,85,40,'Recommended',67,'Good Match',72,85,'Portfolio Website, Chat Application','No critical skill gaps identified.',80,'Frontend Department'),(11,10,10,'2026-07-14 14:33:10.417740','Location: San Francisco, CA','B.Tech in IT','jane.miller@example.com','','Jane Miller','','','','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','9000000001','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 11% of skills.','Candidate matches 11% of skills.','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',NULL,0,85,40,'Needs Review',50,'Average Match',55,85,'Portfolio Website, Chat Application','Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,11,11,'2026-07-14 14:33:10.582995','Location: San Francisco, CA','B.Tech in IT','jane.miller@example.com','','Jane Miller','','','','','','9000000001','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 80% of skills.','Candidate matches 80% of skills.','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',10,100,85,40,'Recommended',67,'Good Match',72,85,'Portfolio Website, Chat Application','No critical skill gaps identified.',80,'Frontend Department'),(11,12,12,'2026-07-14 14:34:40.179601','Location: San Francisco, CA','B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','','','','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','9000000003','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 11% of skills.','Candidate matches 11% of skills.','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',NULL,0,85,40,'Needs Review',50,'Average Match',55,85,'Portfolio Website, Chat Application','Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,13,13,'2026-07-14 14:34:40.325069','Location: San Francisco, CA','B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','','','','','','9000000003','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 80% of skills.','Candidate matches 80% of skills.','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',12,100,85,40,'Recommended',67,'Good Match',72,85,'Portfolio Website, Chat Application','No critical skill gaps identified.',80,'Frontend Department'),(11,14,14,'2026-07-14 16:02:24.545168','Location: San Francisco, CA','B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','','','','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','9000000003','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 11% of skills.','Candidate matches 11% of skills.','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',NULL,0,85,40,'Needs Review',50,'Average Match',55,85,'Portfolio Website, Chat Application','Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,15,15,'2026-07-14 16:02:25.263844','Location: San Francisco, CA','B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','','','','','','9000000003','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 80% of skills.','Candidate matches 80% of skills.','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',14,100,85,40,'Recommended',67,'Good Match',72,85,'Portfolio Website, Chat Application','No critical skill gaps identified.',80,'Frontend Department'),(80,16,16,'2026-07-14 17:54:33.620821','AWS Solutions Architect, Oracle Java Certification','B.Tech in Computer Science','jane.doe@example.com','','Jane Doe','Female','https://github.com/johndoe','https://linkedin.com/in/johndoe','','','9988776655','https://janedoe.dev','Java, Spring Boot, React, Javascript, SQL, B.Tech in Computer Science, National Institute of Technology','Candidate matches 80% of skills.','Candidate matches 80% of skills.','Candidate recommended because overall score is 63% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)','Not Specified',NULL,0,85,40,'Needs Review',58,'Average Match',63,50,'No specific projects detailed in resume.','No critical skill gaps identified.',80,'Frontend Department'),(80,17,17,'2026-07-14 18:01:44.511452','AWS Solutions Architect, Oracle Java Certification','B.Tech in Computer Science','jane.doe@example.com','','Jane Doe','Female','https://github.com/johndoe','https://linkedin.com/in/johndoe','','','9988776655','https://janedoe.dev','Java, Spring Boot, React, Javascript, SQL, B.Tech in Computer Science, National Institute of Technology','Candidate matches 80% of skills.','Candidate matches 80% of skills.','Candidate recommended because overall score is 63% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)','Not Specified',NULL,0,85,40,'Needs Review',58,'Average Match',63,50,'No specific projects detailed in resume.','No critical skill gaps identified.',80,'Frontend Department'),(11,18,18,'2026-07-15 09:11:35.397877','Location: San Francisco, CA','B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','','','','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','9000000003','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 11% of skills.','Candidate matches 11% of skills.','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',NULL,0,85,40,'Needs Review',50,'Average Match',55,85,'Portfolio Website, Chat Application','Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,19,19,'2026-07-15 09:11:35.804279','Location: San Francisco, CA','B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','','','','','','9000000003','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 80% of skills.','Candidate matches 80% of skills.','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',18,100,85,40,'Recommended',67,'Good Match',72,85,'Portfolio Website, Chat Application','No critical skill gaps identified.',80,'Frontend Department'),(11,20,20,'2026-07-15 09:12:40.567369','Location: San Francisco, CA','B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','','','','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','9000000003','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 11% of skills.','Candidate matches 11% of skills.','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',NULL,0,85,40,'Needs Review',50,'Average Match',55,85,'Portfolio Website, Chat Application','Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,21,21,'2026-07-15 09:12:40.964623','Location: San Francisco, CA','B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','','','','','','9000000003','','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','Candidate matches 80% of skills.','Candidate matches 80% of skills.','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)','San Francisco, CA',20,100,85,40,'Recommended',67,'Good Match',72,85,'Portfolio Website, Chat Application','No critical skill gaps identified.',80,'Frontend Department');
/*!40000 ALTER TABLE `resume_analysis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resume_extraction`
--

DROP TABLE IF EXISTS `resume_extraction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resume_extraction` (
  `match_score` int DEFAULT NULL,
  `candidate_id` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `ai_analysis` text,
  `certifications` varchar(255) DEFAULT NULL,
  `college` varchar(255) DEFAULT NULL,
  `companies` varchar(255) DEFAULT NULL,
  `degree` varchar(255) DEFAULT NULL,
  `designations` varchar(255) DEFAULT NULL,
  `extracted_education` text,
  `extracted_email` varchar(255) DEFAULT NULL,
  `extracted_experience` text,
  `extracted_name` varchar(255) DEFAULT NULL,
  `extracted_phone` varchar(255) DEFAULT NULL,
  `extracted_skills` text,
  `gender` varchar(255) DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `graduation_year` varchar(255) DEFAULT NULL,
  `languages` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `matching_skills` text,
  `missing_skills` text,
  `portfolio_links` varchar(255) DEFAULT NULL,
  `preferred_job_role` varchar(255) DEFAULT NULL,
  `projects` varchar(255) DEFAULT NULL,
  `ai_explanation` text,
  `candidate_risk` varchar(255) DEFAULT NULL,
  `education_score` int DEFAULT NULL,
  `experience_score` int DEFAULT NULL,
  `hiring_recommendation` varchar(255) DEFAULT NULL,
  `interview_readiness_score` int DEFAULT NULL,
  `match_category` varchar(255) DEFAULT NULL,
  `overall_score` int DEFAULT NULL,
  `project_score` int DEFAULT NULL,
  `skill_gap_analysis` text,
  `skill_score` int DEFAULT NULL,
  `suggested_department` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resume_extraction`
--

LOCK TABLES `resume_extraction` WRITE;
/*!40000 ALTER TABLE `resume_extraction` DISABLE KEYS */;
INSERT INTO `resume_extraction` VALUES (0,1,'2026-07-14 09:37:36.900616',1,NULL,'Candidate matches 0% of skills.','','Institute of Technology\nExperience',NULL,'Degree: B.Tech in Computer Science',NULL,'Degree: B.Tech in Computer Science','jane.doe@example.com','Experience: 3 Years','Jane Doe','9988776655','Java, Spring Boot, React, Javascript, SQL','','https://github.com/johndoe','',NULL,'https://linkedin.com/in/johndoe','','','https://linkedin.com/in/johndoe',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(0,2,'2026-07-14 10:15:32.949785',2,NULL,'Candidate matches 0% of skills.','Certifications: AWS Solutions Architect, Oracle Java Certification','Institute of Technology\nExperience',NULL,'Degree: B.Tech in Computer Science',NULL,'Degree: B.Tech in Computer Science','jane.doe@example.com','','Jane Doe','9988776655','Java, Spring Boot, React, Javascript, SQL, B.Tech in Computer Science, National Institute of Technology','Female','https://github.com/johndoe','',NULL,'https://linkedin.com/in/johndoe','','','https://janedoe.dev',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(0,3,'2026-07-14 10:59:48.235261',3,NULL,'Candidate matches 0% of skills.','AWS Solutions Architect, Oracle Java Certification','Institute of Technology\nExperience',NULL,'B.Tech in Computer Science',NULL,'B.Tech in Computer Science','jane.doe@example.com','','Jane Doe','9988776655','Java, Spring Boot, React, Javascript, SQL, B.Tech in Computer Science, National Institute of Technology','Female','https://github.com/johndoe','',NULL,'https://linkedin.com/in/johndoe','','','https://janedoe.dev',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(0,4,'2026-07-14 11:48:55.534777',4,NULL,'Candidate matches 0% of skills.','','',NULL,'',NULL,'',NULL,'','',NULL,'','','','',NULL,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(0,5,'2026-07-14 11:57:19.688202',5,NULL,'Candidate matches 0% of skills.','','',NULL,'',NULL,'',NULL,'','',NULL,'','','','',NULL,'','','','',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(80,6,'2026-07-14 14:29:18.297996',6,'Not Specified','Candidate matches 80% of skills.','AWS Solutions Architect, Oracle Java Certification','Institute of Technology\nExperience',NULL,'B.Tech in Computer Science',NULL,'B.Tech in Computer Science','jane.doe@example.com','','Jane Doe','9988776655','Java, Spring Boot, React, Javascript, SQL, B.Tech in Computer Science, National Institute of Technology','Female','https://github.com/johndoe','',NULL,'https://linkedin.com/in/johndoe','','','https://janedoe.dev','Software Engineer','No specific projects detailed in resume.','Candidate recommended because overall score is 63% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Needs Review',58,'Average Match',63,50,'No critical skill gaps identified.',80,'Frontend Department'),(80,7,'2026-07-14 14:30:21.029386',7,'San Francisco, CA','Candidate matches 80% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller@example.com','','Jane Miller','9000000001','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','','','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Recommended',67,'Good Match',72,85,'No critical skill gaps identified.',80,'Frontend Department'),(11,8,'2026-07-14 14:31:33.306840',8,'San Francisco, CA','Candidate matches 11% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller@example.com','','Jane Miller','9000000001','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Needs Review',50,'Average Match',55,85,'Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,9,'2026-07-14 14:31:33.469449',9,'San Francisco, CA','Candidate matches 80% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller@example.com','','Jane Miller','9000000001','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','','','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Recommended',67,'Good Match',72,85,'No critical skill gaps identified.',80,'Frontend Department'),(11,10,'2026-07-14 14:33:10.392694',10,'San Francisco, CA','Candidate matches 11% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller@example.com','','Jane Miller','9000000001','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Needs Review',50,'Average Match',55,85,'Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,11,'2026-07-14 14:33:10.573318',11,'San Francisco, CA','Candidate matches 80% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller@example.com','','Jane Miller','9000000001','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','','','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Recommended',67,'Good Match',72,85,'No critical skill gaps identified.',80,'Frontend Department'),(11,12,'2026-07-14 14:34:40.169423',12,'San Francisco, CA','Candidate matches 11% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','9000000003','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Needs Review',50,'Average Match',55,85,'Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,13,'2026-07-14 14:34:40.315977',13,'San Francisco, CA','Candidate matches 80% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','9000000003','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','','','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Recommended',67,'Good Match',72,85,'No critical skill gaps identified.',80,'Frontend Department'),(11,14,'2026-07-14 16:02:24.413945',14,'San Francisco, CA','Candidate matches 11% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','9000000003','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Needs Review',50,'Average Match',55,85,'Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,15,'2026-07-14 16:02:25.230443',15,'San Francisco, CA','Candidate matches 80% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','9000000003','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','','','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Recommended',67,'Good Match',72,85,'No critical skill gaps identified.',80,'Frontend Department'),(80,16,'2026-07-14 17:54:33.604149',16,'Not Specified','Candidate matches 80% of skills.','AWS Solutions Architect, Oracle Java Certification','Institute of Technology\nExperience',NULL,'B.Tech in Computer Science',NULL,'B.Tech in Computer Science','jane.doe@example.com','','Jane Doe','9988776655','Java, Spring Boot, React, Javascript, SQL, B.Tech in Computer Science, National Institute of Technology','Female','https://github.com/johndoe','',NULL,'https://linkedin.com/in/johndoe','','','https://janedoe.dev','Software Engineer','No specific projects detailed in resume.','Candidate recommended because overall score is 63% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Needs Review',58,'Average Match',63,50,'No critical skill gaps identified.',80,'Frontend Department'),(80,17,'2026-07-14 18:01:44.499501',17,'Not Specified','Candidate matches 80% of skills.','AWS Solutions Architect, Oracle Java Certification','Institute of Technology\nExperience',NULL,'B.Tech in Computer Science',NULL,'B.Tech in Computer Science','jane.doe@example.com','','Jane Doe','9988776655','Java, Spring Boot, React, Javascript, SQL, B.Tech in Computer Science, National Institute of Technology','Female','https://github.com/johndoe','',NULL,'https://linkedin.com/in/johndoe','','','https://janedoe.dev','Software Engineer','No specific projects detailed in resume.','Candidate recommended because overall score is 63% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Needs Review',58,'Average Match',63,50,'No critical skill gaps identified.',80,'Frontend Department'),(11,18,'2026-07-15 09:11:35.355548',18,'San Francisco, CA','Candidate matches 11% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','9000000003','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Needs Review',50,'Average Match',55,85,'Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,19,'2026-07-15 09:11:35.781982',19,'San Francisco, CA','Candidate matches 80% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','9000000003','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','','','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Recommended',67,'Good Match',72,85,'No critical skill gaps identified.',80,'Frontend Department'),(11,20,'2026-07-15 09:12:40.550790',20,'San Francisco, CA','Candidate matches 11% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','9000000003','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','CA','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 55% and skills match 11% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Needs Review',50,'Average Match',55,85,'Missing skills: React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco',11,'Frontend Department'),(80,21,'2026-07-15 09:12:40.952197',21,'San Francisco, CA','Candidate matches 80% of skills.','Location: San Francisco, CA','',NULL,'B.Tech in IT',NULL,'B.Tech in IT','jane.miller3@example.com','','Jane Miller Three','9000000003','React, Redux, Javascript, HTML, CSS, Git, B.Tech in IT, San Francisco, CA','','','',NULL,'','','','','Software Engineer','Portfolio Website, Chat Application','Candidate recommended because overall score is 72% and skills match 80% of job requirements.','High Risk (Entry level - no professional experience)',85,40,'Recommended',67,'Good Match',72,85,'No critical skill gaps identified.',80,'Frontend Department');
/*!40000 ALTER TABLE `resume_extraction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salary_increment_recommendation`
--

DROP TABLE IF EXISTS `salary_increment_recommendation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salary_increment_recommendation` (
  `attendance_rate` double NOT NULL,
  `current_salary` double NOT NULL,
  `is_eligible` bit(1) NOT NULL,
  `new_estimated_salary` double NOT NULL,
  `original_suggested_increment` double NOT NULL,
  `overtime_hours` double NOT NULL,
  `performance_rating` int NOT NULL,
  `suggested_increment` double NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `employee_id` bigint DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `updated_at` datetime(6) DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `experience` varchar(255) DEFAULT NULL,
  `hr_email` varchar(255) DEFAULT NULL,
  `reason` text,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salary_increment_recommendation`
--

LOCK TABLES `salary_increment_recommendation` WRITE;
/*!40000 ALTER TABLE `salary_increment_recommendation` DISABLE KEYS */;
INSERT INTO `salary_increment_recommendation` VALUES (0,10000,_binary '',10200,2,0,3,2,'2026-07-15 09:16:58.941722',1,1,'2026-07-15 09:16:58.941722','Divya','','24ada52@karpagamtech.ac.in','Eligible for Salary Increment due to average performance (Rating: 3/5). Attendance rate of 0% and consistent contributions.','PENDING'),(0,50000,_binary '',51249.99999999999,2,0,4,2.5,'2026-07-15 09:16:59.021890',6,2,'2026-07-15 14:14:01.469186','SARMILA S','2 Years','24ada52@karpagamtech.ac.in','Average Performer: Performance is stable. Moderate salary revision recommended.','PENDING'),(0,10000,_binary '',10250,2,0,4,2.5,'2026-07-15 09:16:59.079603',7,3,'2026-07-15 14:14:01.601247','nisha','','24ada52@karpagamtech.ac.in','Average Performer: Performance is stable. Moderate salary revision recommended.','PENDING'),(100,123456,_binary '',134567.04,5,0,5,9,'2026-07-15 11:58:54.104933',14,4,'2026-07-15 14:14:01.716944','sathish','','24ada52@karpagamtech.ac.in','Outstanding Performer: Consistently exceeds expectations. Recommended for promotion and salary revision.','PENDING'),(100,50000,_binary '',56000.00000000001,5,0,5,12,'2026-07-15 11:58:54.168583',15,5,'2026-07-15 14:14:01.812204','rakshaya','','24ada52@karpagamtech.ac.in','Outstanding Performer: Consistently exceeds expectations. Recommended for promotion and salary revision.','PENDING');
/*!40000 ALTER TABLE `salary_increment_recommendation` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-16 11:54:22
