# Multi-stage Docker build for monorepo Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY backend/pom.xml ./backend/
COPY backend/src ./backend/src

# Build package inside backend directory
WORKDIR /app/backend
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/backend/target/hrms-0.0.1-SNAPSHOT.jar app.jar

# Expose server port
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
