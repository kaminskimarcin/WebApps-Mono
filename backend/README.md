# TaskBoard Backend

Backend napisany w technologii Java (Spring Boot) będący częścią studenckiego projektu (aplikacja PWA i mobilna). Dostarcza REST API i komunikuje się z bazą danych Cloud Firestore z uwierzytelnianiem na podstawie Google Firebase Auth.

## Wymagania

- Java 17+
- Maven 3.6+
- Projekt w panelu Google Firebase z aktywnym Firebase Authentication (Google) oraz bazą Firestore w trybie native.

## Konfiguracja Firebase

Zanim uruchomisz aplikację, musisz uwierzytelnić Firebase Admin SDK:
1. Zaloguj się do panelu Firebase, wybierz swój projekt.
2. Przejdź do **Project settings** (Ustawienia projektu) -> **Service accounts** (Konta usług).
3. Kliknij **Generate new private key** (Wygeneruj nowy klucz prywatny).
4. Pobrany plik `.json` wrzuć do głównego katalogu aplikacji lub do katalogu `src/main/resources/` pod nazwą `firebase-service-account.json`.

> Alternatywnie, możesz ustawić ścieżkę do pliku jako zmienną środowiskową:
> `set FIREBASE_CREDENTIALS=C:\sciezka\do\pliku\klucz.json`

**UWAGA: Nie commituj tego pliku do repozytorium git (jest on zignorowany w .gitignore)!**

## Uruchomienie

Aby uruchomić aplikację lokalnie, wywołaj w konsoli (w katalogu `backend`):

```bash
mvn clean install
mvn spring-boot:run
```

Domyślnie aplikacja podnosi się na porcie `8080`.

## API Endpoints

### Teams
- `POST /api/teams` - Tworzenie zespołu. (Body: `{ "name": "Nazwa" }`)
- `GET /api/teams` - Zwraca listę zespołów zalogowanego użytkownika.
- `POST /api/teams/{teamId}/join` - Użytkownik dołącza do danego zespołu.

### Tasks
- `GET /api/teams/{teamId}/tasks` - Zwraca zadania w danym zespole.
- `POST /api/teams/{teamId}/tasks` - Tworzy nowe zadanie.
- `PUT /api/teams/{teamId}/tasks/{taskId}` - Aktualizuje zadanie (np. zmiana statusu).
- `DELETE /api/teams/{teamId}/tasks/{taskId}` - Usuwa zadanie z bazy.

## Autoryzacja żądań

Do każdego zapytańnika API (poza ewentualnie odblokowanymi w `SecurityConfig.java`) musisz podać header:
`Authorization: Bearer <TOKEN_Z_FIREBASE_AUTH>`
Token ten jest pozyskiwany po stronie PWA/React Native podczas logowania użytkownika przez Google.
