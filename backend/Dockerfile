# Etap 1: Budowanie aplikacji przy użyciu obrazu z Mavenem i Javą 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Kopiujemy najpierw pom.xml, żeby pobrać zależności (optymalizacja warstw dockera)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Kopiujemy kod źródłowy i budujemy plik .jar
COPY src ./src
RUN mvn clean package -DskipTests

# Etap 2: Tworzenie lekkiego obrazu końcowego z JRE (wersja oparta o glibc - jammy, dla Firebase Admin/gRPC)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Kopiujemy zbudowany .jar z poprzedniego etapu
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Render dynamicznie przypisuje port w zmiennej środowiskowej PORT.
# Przekazujemy ten port do Spring Boota używając domyślnej konwencji zmiennych
ENV PORT=8080
ENV SERVER_PORT=${PORT}

# Uruchamiamy aplikację
ENTRYPOINT ["java", "-jar", "app.jar"]
