# הסבר מלא — צד השרת (Backend) + Docker

> קרא את הקובץ הזה מהתחלה לסוף. כל חלק מסביר **מה** הקובץ עושה, **למה** הוא קיים, ו**איך** הוא קשור לשאר הפרויקט.

---

## מה זה בכלל "Backend"?

הBackend הוא השרת — קוד שרץ על מחשב (לא בדפדפן). הוא:
- מקבל בקשות מהFrontend (HTTP)
- מוודא שהמשתמש מורשה (JWT)
- מבצע לוגיקה עסקית (האם העסקה מאושרת?)
- שומר ומשחזר נתונים ממסד הנתונים

**הטכנולוגיות:**

| טכנולוגיה | תפקיד |
|---|---|
| **.NET 10** | פלטפורמת פיתוח של Microsoft. מהיר, בטוח, מתאים לWeb API. |
| **ASP.NET Core** | מסגרת לבניית Web APIs. מטפלת בניתוב, middleware, DI. |
| **Entity Framework Core** | ORM — ממיר אובייקטי C# לשאילתות SQL ובחזרה. |
| **MSSQL / SQLite** | מסדי נתונים. MSSQL בDocker, SQLite לפיתוח מקומי. |
| **JWT (JSON Web Token)** | מנגנון אימות — הFrontend מקבל "אסימון" ושולח אותו בכל בקשה. |
| **BCrypt** | ספריה להצפנת סיסמאות (לעולם לא שומרים סיסמא בטקסט רגיל). |
| **TimeZoneConverter** | ממיר IANA timezone IDs (כמו "Asia/Jerusalem") לאובייקטי TimeZoneInfo. עובד גם על Linux. |

---

## ארכיטקטורת Clean Architecture — למה 4 פרויקטים?

הBackend מחולק ל-4 שכבות. כל שכבה מכירה רק את השכבה שתחתיה — לא את מה שמעליה.

```
TransactionApp.API          ← שכבה 1: כניסה (HTTP Controllers, Middleware)
    ↓ uses
TransactionApp.Application  ← שכבה 2: לוגיקה עסקית (Services, Interfaces, DTOs)
    ↓ uses
TransactionApp.Domain       ← שכבה 3: ליבת העסק (Entities, Enums)
TransactionApp.Infrastructure ← שכבה 4: גישה לנתונים (Repositories, DB, Services חיצוניים)
```

**למה כל הסיבוך הזה?**
בפרויקט קטן זה נראה מוגזם, אבל זה תבנית תעשייתית חשובה:
- אפשר להחליף את מסד הנתונים (מSQLite לMSSQL) בלי לגעת בלוגיקה
- אפשר לבדוק את הלוגיקה בלי DB כלל (Unit Tests)
- הקוד מאורגן — ברור איפה לחפש כל דבר

---

## מבנה הקבצים

```
backend/
└── src/
    ├── TransactionApp.Domain/           ← ליבת העסק
    │   ├── Entities/
    │   │   ├── User.cs                  ← מבנה משתמש
    │   │   └── Transaction.cs           ← מבנה עסקה
    │   └── Enums/
    │       └── TransactionStatus.cs     ← Approved / Rejected
    │
    ├── TransactionApp.Application/      ← לוגיקה עסקית
    │   ├── Auth/Services/
    │   │   └── AuthService.cs           ← הרשמה, התחברות, יצירת JWT
    │   ├── Transactions/Services/
    │   │   └── TransactionService.cs    ← שליחה ובדיקת עסקאות
    │   └── Common/
    │       ├── DTOs/                    ← מבני נתונים לתקשורת
    │       │   ├── AuthDtos.cs
    │       │   └── TransactionDtos.cs
    │       └── Interfaces/              ← חוזים (interfaces)
    │           ├── IAuthService.cs
    │           ├── ITransactionService.cs
    │           ├── IUserRepository.cs
    │           ├── ITransactionRepository.cs
    │           └── ITimezoneService.cs
    │
    ├── TransactionApp.Infrastructure/   ← גישה לנתונים
    │   ├── Data/
    │   │   └── AppDbContext.cs          ← חיבור ל-DB, הגדרת טבלאות
    │   ├── Repositories/
    │   │   ├── UserRepository.cs        ← שאילתות למשתמשים
    │   │   └── TransactionRepository.cs ← שאילתות לעסקאות
    │   └── Services/
    │       └── TimezoneService.cs       ← חישוב שעון ואישור עסקה
    │
    └── TransactionApp.API/              ← כניסה לשרת
        ├── Controllers/
        │   ├── AuthController.cs        ← routes: /api/auth/*
        │   └── TransactionController.cs ← routes: /api/transactions/*
        ├── Middleware/
        │   └── ExceptionMiddleware.cs   ← ניהול שגיאות גלובלי
        ├── Program.cs                   ← הגדרת כל השרת
        └── appsettings*.json            ← הגדרות סביבה
```

---

## שכבה 1: Domain — ליבת העסק

### `Domain/Entities/User.cs`

**מה עושה:**
מגדיר מה זה "משתמש" בעיני הקוד.

**שדות:**
- `Id` — מזהה ייחודי (מספר שה-DB מייצר אוטומטית)
- `Email` — כתובת אימייל (ייחודי בDB)
- `PasswordHash` — הסיסמה **אחרי הצפנה** (BCrypt). לעולם לא שומרים סיסמה טקסטואלית!
- `CreatedAt` — מתי הרשם
- `Transactions` — רשימת כל העסקאות שלו (navigation property ב-EF Core)

---

### `Domain/Entities/Transaction.cs`

**מה עושה:**
מגדיר מה זה "עסקה".

**שדות:**
- `Id` — מזהה ייחודי
- `UserId` — למי שייכת העסקה (foreign key)
- `User` — אובייקט המשתמש (navigation property)
- `Region` — האזור שנבחר ("France", "Israel"...)
- `SubmittedAtUtc` — מתי נשלחה בזמן UTC
- `LocalTime` — השעה המקומית שהוזנה על ידי המשתמש
- `Status` — `Approved` או `Rejected`
- `CreatedAt` — מתי נוצרה בDB

---

### `Domain/Enums/TransactionStatus.cs`

**מה עושה:**
הגדרת enum פשוטה עם שתי אפשרויות: `Approved` ו-`Rejected`.

**למה enum ולא string?**
Enum מונע טעויות כתיב — אי אפשר לכתוב "Approvd" בטעות. הC# יתלונן בזמן קומפילציה.

---

## שכבה 2: Application — לוגיקה עסקית

### `Application/Common/Interfaces/` — החוזים

**מה זה interface?**
הגדרה של "מה מישהו יכול לעשות" בלי לפרט "איך". השכבת Application אומרת "אני צריך repository שיכול לשמור משתמש" — בלי לדעת אם זה SQLite או MSSQL.

- `IUserRepository` — מגדיר: `GetByEmailAsync`, `CreateAsync`, `ExistsAsync`
- `ITransactionRepository` — מגדיר: `CreateAsync`, `GetApprovedByUserAsync`
- `IAuthService` — מגדיר: `RegisterAsync`, `LoginAsync`
- `ITransactionService` — מגדיר: `SubmitAsync`, `GetApprovedAsync`
- `ITimezoneService` — מגדיר: `Evaluate`, `GetCurrentLocalTime`, `GetSupportedRegions`

---

### `Application/Common/DTOs/AuthDtos.cs`

**מה עושה:**
מגדיר את מבני הנתונים שעוברים בין Frontend לBackend לאימות.

**DTOs (Data Transfer Objects):**
- `RegisterDto` — מה מגיע מהFrontend: `{ Email, Password }`
- `LoginDto` — מה מגיע מהFrontend: `{ Email, Password }`
- `AuthResponseDto` — מה מחזיר לFrontend: `{ Token, Email }`

**למה DTO ולא Entity ישירות?**
ה-Entity (`User`) מכיל `PasswordHash` ושדות פנימיים. לא רוצים לשלוח אותם לFrontend. ה-DTO מכיל רק מה שצריך לחשוף.

---

### `Application/Common/DTOs/TransactionDtos.cs`

- `SubmitTransactionDto` — מה מגיע: `{ Region, Time }`
- `TransactionResultDto` — מה מחזיר: `{ Status, LocalTime, Region }`
- `ApprovedTransactionDto` — עסקה מאושרת לתצוגה: `{ Id, Region, LocalTime, SubmittedAtUtc }`

---

### `Application/Auth/Services/AuthService.cs`

**מה עושה:**
הלוגיקה של הרשמה והתחברות.

**פונקציות:**

`RegisterAsync(dto)`:
1. בודק אם האימייל כבר קיים ב-DB (`ExistsAsync`) — אם כן, זורק שגיאה
2. מצפין את הסיסמה עם BCrypt: `BCrypt.HashPassword(password)` — הצפנה חד-כיוונית
3. יוצר אובייקט `User` ושומר אותו ב-DB
4. מייצר JWT ומחזיר `{ Token, Email }`

`LoginAsync(dto)`:
1. מחפש את המשתמש לפי אימייל
2. אם לא נמצא — שגיאה (מכוונת מעורפלת: "Invalid credentials" — לא מסגיר אם המייל לא קיים)
3. מוודא סיסמה עם `BCrypt.Verify(password, hash)`
4. מייצר JWT ומחזיר `{ Token, Email }`

`GenerateToken(user)` — **יצירת JWT:**
- יוצר "חתימה" בעזרת המפתח הסודי (`Jwt:Secret`)
- הטוקן מכיל: `userId`, `email`, ותוקף של 7 ימים
- חתום עם `HmacSha256` — אי אפשר לזייף בלי המפתח הסודי

---

### `Application/Transactions/Services/TransactionService.cs`

**מה עושה:**
הלוגיקה של שליחה ושאילת עסקאות.

**`SubmitAsync(userId, dto)`:**
1. מפרסר את השעה מהפורמט "HH:mm" לאובייקט `TimeOnly`
2. קורא ל-`timezoneService.Evaluate(region, time)` — מחזיר `(status, localTime)`
3. יוצר אובייקט `Transaction` ושומר ב-DB
4. מחזיר `{ status, localTime, region }` לFrontend

**`GetApprovedAsync(userId)`:**
1. שולף מה-DB את כל העסקאות המאושרות של אותו משתמש
2. ממיר ל-`ApprovedTransactionDto` (בלי שדות פנימיים)
3. מחזיר רשימה

---

## שכבה 3: Infrastructure — גישה לנתונים

### `Infrastructure/Data/AppDbContext.cs`

**מה עושה:**
ה"שער" לDB. EF Core משתמש בו כדי לדעת אילו טבלאות קיימות ומה מבנן.

**מה מגדיר:**
- `Users` ו-`Transactions` — DbSets (טבלאות)
- `OnModelCreating` — הגדרות נוספות:
  - `Email` — unique index (אי אפשר שני משתמשים עם אותו מייל)
  - `Status` — נשמר כ-string ("Approved") ולא כמספר
  - קשר בין `Transaction` ל-`User` — foreign key עם cascade delete

**EF Core migrations — מה זה?**
EF Core מסוגל לקרוא את ה-`AppDbContext` ולייצר שאילתות SQL שיוצרות את הטבלאות. "Migration" זה קובץ SQL שנוצר אוטומטית. כשה-App עולה, מריצים `db.Database.Migrate()` שיוצר את הטבלאות אם לא קיימות.

---

### `Infrastructure/Repositories/UserRepository.cs`

**מה עושה:**
מממש את `IUserRepository` — שאילתות DB למשתמשים.

**פונקציות:**
- `GetByEmailAsync(email)` — `db.Users.FirstOrDefaultAsync(u => u.Email == email)` — מחפש משתמש לפי מייל
- `CreateAsync(user)` — `db.Users.Add(user)` + `SaveChangesAsync()` — שומר משתמש חדש
- `ExistsAsync(email)` — `db.Users.AnyAsync(...)` — בודק אם מייל כבר קיים (יעיל — לא טוען את כל האובייקט)

---

### `Infrastructure/Repositories/TransactionRepository.cs`

**מה עושה:**
מממש את `ITransactionRepository`.

**פונקציות:**
- `CreateAsync(transaction)` — שומר עסקה ב-DB
- `GetApprovedByUserAsync(userId)` — מחזיר רק עסקאות מאושרות של אותו משתמש, ממוינות מהחדשה לישנה

---

### `Infrastructure/Services/TimezoneService.cs`

**מה עושה:**
הלוגיקה של בדיקת שעות עסקים וחישוב שעון אזורי.

**`RegionTimezones`:**
Dictionary שממפה שמות אזורים ל-IANA timezone IDs:
- "France" → "Europe/Paris"
- "Israel" → "Asia/Jerusalem"
- "Cyprus" → "Asia/Nicosia"
- "Italy" → "Europe/Rome"

**`Evaluate(region, enteredTime)`:**
בודק האם השעה שהוזנה נמצאת בשעות עסקים 08:00–18:00:
```
isBankingHours = enteredTime.Hour >= 8 && enteredTime.Hour < 18
→ Approved אם כן, Rejected אם לא
```

**`GetCurrentLocalTime(region)`:**
1. מוצא את ה-timezone ID לפי שם האזור
2. ממיר `DateTime.UtcNow` לשעון המקומי של האזור
3. מחזיר את השעה בלבד — לשימוש בTimePicker

**למה TimeZoneConverter ולא TimeZoneInfo.FindSystemTimeZoneById?**
`TimeZoneInfo.FindSystemTimeZoneById` עם IANA IDs עובד בWindows אבל לא ביניקס/Linux (Docker). `TimeZoneConverter` מטפל בשני המקרים.

---

## שכבה 4: API — כניסה לשרת

### `API/Program.cs`

**מה עושה:**
מגדיר ומאתחל את **כל** השרת. זה הקובץ שקוראים לו כשהשרת עולה.

**שלב אחר שלב:**

**1. AddControllers** — מאפשר לASP.NET Core למצוא Controllers ולנתב בקשות HTTP.

**2. הגדרת DB:**
```csharp
var dbProvider = config["DatabaseProvider"] ?? "SqlServer"
```
אם `appsettings.Development.json` מגדיר `"DatabaseProvider": "Sqlite"` — משתמשים בSQLite.
אחרת — MSSQL. מאפשר עבודה מקומית ללא Docker.

**3. הגדרת JWT:**
מגדיר כיצד לאמת טוקנים:
- `ValidateIssuerSigningKey: true` — כל טוקן חייב להיות חתום עם המפתח הסודי
- `ValidateIssuer: false` — לא בודק מאיפה הטוקן (פשוט יותר)
- `ClockSkew: TimeSpan.Zero` — הטוקן פג בזמן מדויק (בלי גמישות של דקות)

**4. CORS:**
מאפשר לFrontend (שרץ בport 3000) לפנות לBackend (port 5000). בלי זה, הדפדפן חוסם את הבקשות.

**5. Dependency Injection (DI):**
```csharp
builder.Services.AddScoped<IUserRepository, UserRepository>()
```
אומר לASP.NET: "כשמישהו מבקש `IUserRepository`, תיצור `UserRepository`". זה מה שמאפשר לControllors לקבל services בConstructor בלי `new`.

**6. Auto-migrate:**
כשהשרת עולה, מריץ את כל המigrations שטרם הורצו. אם הטבלאות לא קיימות — יוצר אותן.

**7. Middleware pipeline:**
סדר ה-middleware חשוב מאוד:
```
ExceptionMiddleware → CORS → Authentication → Authorization → Controllers
```

---

### `API/Controllers/AuthController.cs`

**מה עושה:**
מגדיר שני endpoints לאימות.

**`POST /api/auth/register`:**
מקבל `{ email, password }`, קורא ל-`authService.RegisterAsync()`, מחזיר 201 Created עם `{ token, email }`.

**`POST /api/auth/login`:**
מקבל `{ email, password }`, קורא ל-`authService.LoginAsync()`, מחזיר 200 עם `{ token, email }`.

**למה `[ApiController]`?**
Attribute שמוסיף התנהגות אוטומטית — אם הbody לא תואם ל-DTO, מחזיר 400 אוטומטית, בלי לכתוב קוד בדיקה ידני.

---

### `API/Controllers/TransactionController.cs`

**מה עושה:**
מגדיר endpoints לניהול עסקאות. **כולם מוגנים ב-JWT** (`[Authorize]` על הclass).

**`POST /api/transactions/submit`:**
מקבל `{ region, time }`. מוצא את ה-userId מתוך הטוקן (`GetUserId()`), קורא ל-`transactionService.SubmitAsync()`.

**`GET /api/transactions/approved`:**
מוצא userId מהטוקן, מחזיר רשימת עסקאות מאושרות של אותו משתמש בלבד.

**`GET /api/transactions/current-time/{region}`:**
ללא אימות (`[AllowAnonymous]`) — מחזיר את השעה הנוכחית באזור. משמש לאתחול הTimePicker.

**`GetUserId()`:**
מחלץ את ה-userId מתוך ה-JWT claims. הJWT שיצרנו מכיל `ClaimTypes.NameIdentifier = userId`. אם אין — זורק שגיאה.

---

### `API/Middleware/ExceptionMiddleware.cs`

**מה עושה:**
"רשת ביטחון" — תופסת כל exception שלא טופל, ומחזירה תגובת JSON מסודרת במקום crash.

**איך עובד:**
עוטף את כל הבקשה ב-try/catch. אם נזרקת שגיאה:

| סוג Exception | HTTP Status | מה מחזיר |
|---|---|---|
| `UnauthorizedAccessException` | 401 | הודעת השגיאה |
| `InvalidOperationException` | 409 Conflict | הודעת השגיאה |
| `ArgumentException` | 400 Bad Request | הודעת השגיאה |
| כל שגיאה אחרת | 500 | "An unexpected error occurred." |

**למה middleware ולא try/catch בכל controller?**
חוסך כפילות. במקום לכתוב try/catch ב-10 controllers, כותבים פעם אחת ומגן על הכל.

---

### `API/appsettings.json` ו-`appsettings.Development.json`

**`appsettings.json`** — הגדרות production. מכיל placeholder ריק — הערכים האמיתיים מגיעים ממשתני סביבה.

**`appsettings.Development.json`** — הגדרות לפיתוח מקומי:
```json
{
  "DatabaseProvider": "Sqlite",
  "ConnectionStrings": { "Default": "Data Source=../../../db/transaction.db" },
  "Jwt": { "Secret": "dev-local-jwt-secret..." }
}
```
SQLite שורף קובץ `transaction.db` בתיקיית `db/` — לא צריך Docker להריץ מקומית.

---

## Docker — מה זה ולמה צריך?

### הבעיה שDocker פותר

דמיין שאמרת לחבר: "הפרוייקט שלי עובד מעולה". הוא מנסה להריץ ומקבל שגיאות — כי אצלו גרסת Node שונה, אין לו .NET, אין מסד נתונים, משתני הסביבה חסרים.

Docker פותר את ה"אצלי זה עובד" בעיה.

### מה זה Container?

Container הוא "קופסא" שמכילה:
- את הקוד שלך
- את כל התלויות (Node, .NET, nginx...)
- הגדרות הסביבה

ה-Container רץ **אותו דבר** על כל מחשב — Mac, Windows, Linux, שרת בענן.

### `Dockerfile` — Backend

```
backend/Dockerfile
```

**שלב 1 (build):**
- מתחיל מ-.NET SDK (כלי פיתוח מלא)
- מעתיק קבצי `.csproj` ומריץ `dotnet restore` (מוריד NuGet packages)
- מעתיק את כל הקוד ומריץ `dotnet publish` — בונה את ה-DLL הסופי

**שלב 2 (final):**
- מתחיל מ-.NET runtime בלבד (הרבה יותר קטן מה-SDK)
- מעתיק רק את ה-DLL שנבנה
- `ENTRYPOINT ["dotnet", "TransactionApp.API.dll"]` — הפקודה שרצה כשהcontainer עולה

**למה שני שלבים (multi-stage build)?**
ה-SDK (כלי הבנייה) שוקל ~800MB. הRuntime שוקל ~200MB. בproduction צריך רק runtime. Multi-stage בונה עם SDK ומייצר image קטן עם runtime בלבד.

---

### `Dockerfile` — Frontend

```
frontend/Dockerfile
```

**שלב 1 (build):**
- Node.js מריץ `npm ci` (התקנת packages בצורה נקייה ומדויקת)
- `npm run build` → יוצר תיקיית `dist/` עם קבצי HTML/JS/CSS מוכנים

**שלב 2 (serve):**
- nginx מגיש את הקבצים הסטטיים
- `nginx.conf` מגדיר:
  - כל בקשה ל-`/api/...` → מועברת לshরת Backend
  - שאר הבקשות → `index.html` (כדי שReact Router יעבוד)

---

### `docker-compose.yml` — הניצוח הכולל

**מה עושה:**
מגדיר **3 שירותים** שעולים יחד עם פקודה אחת: `docker-compose up --build`.

**`frontend` service:**
- מבנה את ה-Docker image לפי `./frontend/Dockerfile`
- חושף port 3000 (מחוץ) → 80 (בתוך הcontainer)
- מחכה לbackend לפני שעולה (`depends_on`)

**`backend` service:**
- מבנה image לפי `./backend/Dockerfile`
- חושף port 5000 → 8080
- מקבל משתני סביבה:
  - `ConnectionStrings__Default` — כתובת MSSQL בתוך הDocker network
  - `Jwt__Secret` — מהקובץ `.env` (לא כתוב בקוד!)
- מחכה לmssql **עד שהוא בריא** (`service_healthy`)

**`mssql` service:**
- Image רשמי של Microsoft SQL Server 2022
- `healthcheck` — בודק כל 10 שניות אם MSSQL מוכן לקבל חיבורים
- `volumes: mssql_data` — שומר את ה-DB על הדיסק של המחשב המארח, כך שהנתונים לא נמחקים כשהcontainer עוצר

**`.env` קובץ:**
מכיל את הסיסמאות והמפתחות הסודיים. **לא מועלה ל-Git** (נמצא ב-.gitignore). כל מפתח מגדיר `.env` משלו. `.env.example` מראה מה המשתנים הדרושים.

---

## JWT — איך מנגנון ההזדהות עובד?

```
1. משתמש נכנס עם email + password
         ↓
2. Backend מוצא את המשתמש ב-DB ומאמת סיסמה (BCrypt.Verify)
         ↓
3. Backend מייצר JWT:
   Header:  { alg: "HS256" }
   Payload: { userId: 5, email: "user@example.com", exp: 7 ימים }
   Signature: HMAC(Header + Payload, secret_key)
         ↓
4. Frontend מקבל את הטוקן ושומר ב-localStorage (Zustand persist)
         ↓
5. כל בקשה עתידית: Authorization: Bearer <token>
         ↓
6. Backend מוודא את החתימה עם המפתח הסודי
   → אם תקין: מאפשר גישה
   → אם לא תקין / פג: 401 Unauthorized
```

**למה JWT ולא session?**
Session שומר מידע **בשרת** (בזיכרון או DB). JWT שומר הכל **בטוקן** — השרת stateless לחלוטין. זה מאפשר לשרת לרוץ בכמה instances בלי סנכרון.

---

## BCrypt — למה לא שומרים סיסמה רגילה?

אם DB יידלף — כולם רואים את הסיסמאות. עם BCrypt:
1. **Hashing** — `"password123"` הופך ל-`"$2a$12$x7Gy3..."` (60 תווים)
2. **חד-כיווני** — אי אפשר "לפרוס" את ה-hash בחזרה לסיסמה
3. **Salt** — BCrypt מוסיף מחרוזת אקראית לכל hash, כך שאותה סיסמה מייצרת hash שונה בכל פעם
4. **Slow** — BCrypt מכוון להיות **איטי** (12 rounds) כדי להקשות על מתקפות brute-force

---

## סיכום — זרימת בקשת שליחת עסקה

```
משתמש לוחץ "שלח עסקה" ב-Browser
        ↓
POST /api/transactions/submit
Headers: { Authorization: Bearer <JWT> }
Body: { region: "Israel", time: "14:30" }
        ↓
ExceptionMiddleware (עוטף הכל)
        ↓
Authentication Middleware — מוודא JWT, ממלא HttpContext.User
        ↓
TransactionController.Submit()
        ↓
GetUserId() → חולץ userId=5 מה-JWT claims
        ↓
transactionService.SubmitAsync(userId=5, { region="Israel", time="14:30" })
        ↓
TimeOnly.TryParse("14:30") → TimeOnly(14, 30)
        ↓
timezoneService.Evaluate("Israel", 14:30) → (Approved, 14:30)
 ← 14:30 בשעות עסקים (08:00-18:00) → Approved
        ↓
יוצר Transaction { UserId=5, Region="Israel", LocalTime=14:30, Status=Approved }
transactionRepository.CreateAsync(transaction) → שומר ב-DB
        ↓
מחזיר 200 OK { status: "Approved", localTime: "14:30", region: "Israel" }
        ↓
Frontend מציג toast "העסקה אושרה ✓"
```
