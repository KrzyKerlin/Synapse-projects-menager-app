# Synapse API (server)

Node.js + Express + SQLite backend: rejestracja/logowanie (JWT), CRUD dla
projektów/katalogów/zadań/commitów oraz AI chat (odpowiedzi na pytania,
komendy „dodaj zadanie", pamięć kontekstu rozmowy).

## Szybki start

```bash
cd server
npm install
cp .env.example .env   # i ewentualnie zmień JWT_SECRET
npm run dev             # nodemon, przeładowuje przy zmianach
```

Serwer wystartuje na `http://localhost:4000`. Baza SQLite tworzy się
automatycznie w `server/data/synapse.sqlite` przy pierwszym uruchomieniu.

## Endpointy

| Metoda | Ścieżka | Opis |
| --- | --- | --- |
| POST | `/api/auth/register` | Rejestracja (username, password) |
| POST | `/api/auth/login` | Logowanie, zwraca JWT |
| GET | `/api/auth/me` | Dane zalogowanego użytkownika |
| GET/POST | `/api/projects` | Lista / tworzenie projektów |
| GET/PUT/DELETE | `/api/projects/:id` | Odczyt / edycja / usunięcie projektu |
| GET/POST | `/api/folders` | Katalogi |
| PUT/DELETE | `/api/folders/:id` | Edycja / usunięcie katalogu |
| GET/POST | `/api/tasks` | Zadania |
| PUT/DELETE | `/api/tasks/:id` | Edycja (w tym oznaczanie jako ukończone) / usunięcie |
| GET/POST | `/api/commits` | Log commitów per projekt |
| GET | `/api/chat/messages` | Historia czatu |
| POST | `/api/chat/messages` | Wyślij wiadomość do AI asystenta |

Wszystkie endpointy poza `/api/health` i `/api/auth/*` wymagają nagłówka
`Authorization: Bearer <token>`.
