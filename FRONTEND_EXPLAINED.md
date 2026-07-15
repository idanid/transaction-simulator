# הסבר מלא — צד הלקוח (Frontend)

> קרא את הקובץ הזה מהתחלה לסוף. כל חלק מסביר **מה** הקובץ עושה, **למה** הוא קיים, ו**איך** הוא קשור לשאר הפרויקט.

---

## מה זה בכלל "Frontend"?

הפרונטאנד הוא כל מה שהמשתמש **רואה בדפדפן**. הוא לא מחזיק מידע באופן קבוע — הוא מציג מידע שמגיע מהשרת (Backend), ומאפשר למשתמש לבצע פעולות כמו התחברות, בחירת אזור, ושליחת עסקה.

**הטכנולוגיות שבחרנו:**

| טכנולוגיה | תפקיד |
|---|---|
| **React 18** | ספרייה לבניית ממשק משתמש. מחלקת את המסך לרכיבים (components) קטנים. |
| **TypeScript** | JavaScript עם טיפוסים. עוזר לתפוס שגיאות עוד לפני שמריצים את הקוד. |
| **Vite** | כלי פיתוח שמריץ את האפליקציה מהר מאוד ב-dev ומבנה אותה ל-production. |
| **Tailwind CSS** | מאפשר לעצב ישירות ב-HTML עם classNames במקום לכתוב CSS נפרד. |
| **Zustand** | ניהול מצב גלובלי — נתונים שצריכים להיות זמינים בכל האפליקציה (כמו טוקן JWT). |
| **Axios** | שולח בקשות HTTP לשרת (GET, POST וכו'). |
| **react-i18next** | תמיכה בשפות — עברית ואנגלית, כולל RTL/LTR. |
| **react-hot-toast** | הודעות קופאפ (הצלחה / כשלון) בחלק העליון של המסך. |

---

## מבנה התיקיות

```
frontend/
├── src/
│   ├── assets/          ← תמונות וקבצים סטטיים
│   ├── components/      ← רכיבים שמשמשים בכמה מקומות
│   ├── i18n/            ← תרגומים (עברית / אנגלית)
│   ├── lib/             ← פונקציות עזר כלליות
│   ├── pages/           ← עמודים שלמים (Login, Dashboard...)
│   ├── services/        ← כל תקשורת עם השרת
│   ├── store/           ← מצב גלובלי (Zustand)
│   ├── types/           ← הגדרת מבני נתונים (TypeScript)
│   ├── App.tsx          ← נקודת הכניסה הראשית לאפליקציה
│   ├── main.tsx         ← נקודת ההרצה הראשית
│   └── index.css        ← CSS גלובלי
├── vite.config.ts       ← הגדרות Vite (proxy, aliases...)
├── index.html           ← קובץ ה-HTML הבסיסי
└── Dockerfile           ← הוראות לבניית קונטיינר Docker
```

---

## 1. `main.tsx` — נקודת הכניסה

```
src/main.tsx
```

**מה עושה:**
זהו הקובץ הראשון שמריץ React. הוא מחפש את האלמנט עם ה-id `root` בתוך `index.html`, ומציב בתוכו את כל האפליקציה.

**למה צריך:**
React אינה מריצה את עצמה — צריך "להצמיד" אותה ל-HTML. זה הגשר בין HTML טהור לבין האפליקציה.

**פונקציה:**
- `createRoot(...).render(<App />)` — מאתחל את React על גבי ה-DOM ומרנדר את `App`.
- `<StrictMode>` — מצב פיתוח שמדפיס אזהרות נוספות ועוזר לאתר בעיות.

---

## 2. `App.tsx` — לב האפליקציה

```
src/App.tsx
```

**מה עושה:**
מגדיר את כל **ניתוב (routing)** האפליקציה — איזה עמוד מוצג לפי ה-URL — ומטפל בכיוון השפה (RTL/LTR).

**למה צריך:**
בלעדיו אין ניתוב. כשמשתמש נכנס ל-`/login`, אמורה להיפתח דף ההתחברות. כשנכנס ל-`/`, אמורה להיפתח הדשבורד. App.tsx הוא זה שמגדיר מה פותחים.

**פונקציות ורכיבים:**
- `useEffect` (שינוי שפה) — כשהשפה משתנה בין עברית לאנגלית, מעדכן `document.dir` ל-`rtl` או `ltr` כדי שכל ה-HTML ישתנה בהתאם.
- `<BrowserRouter>` — מאפשר ל-React לדעת מה ה-URL הנוכחי.
- `<Routes>` + `<Route>` — מפה של URL → עמוד:
  - `/login` → `LoginPage`
  - `/signup` → `SignupPage`
  - `/` → `DashboardPage` (רק אם מחובר — מוגן על ידי `AuthGuard`)
  - כל URL אחר → הפניה ל-`/`
- `<Header />` — מוצג בכל העמודים
- `<Toaster position="top-center" />` — מכין את מערכת ההודעות הקופאפ כך שתופיע במרכז למעלה

---

## 3. `types/index.ts` — הגדרת מבני נתונים

```
src/types/index.ts
```

**מה עושה:**
מגדיר "תבניות" (interfaces) שמתארות איך נתונים נראים. TypeScript משתמש בהן כדי לוודא שלא טועים בשמות שדות.

**למה צריך:**
בלי types, TypeScript לא יכול לעזור. אם השרת מחזיר `{ token, email }` וכתבנו `data.tokken` — TypeScript יצבע אדום מיד. זה חוסך שגיאות.

**הגדרות:**
- `User` — מייצג משתמש: `{ email: string }`
- `AuthResponse` — מה מחזיר השרת אחרי login/signup: `{ token, email }`
- `TransactionResult` — תוצאת עסקה: `{ status, localTime, region }`
- `ApprovedTransaction` — עסקה מאושרת: `{ id, region, localTime, submittedAtUtc }`

---

## 4. תיקיית `store/` — מצב גלובלי

### `store/authStore.ts`

**מה עושה:**
שומר את פרטי המשתמש המחובר (טוקן + אימייל) זמינים בכל האפליקציה, ושומר אותם ב-`localStorage` כדי שאחרי רענון הדף המשתמש יישאר מחובר.

**למה Zustand ולא useState רגיל?**
`useState` עובד רק בתוך רכיב אחד. כדי לשתף נתונים בין `Header`, `DashboardPage`, ו-`AuthGuard` — צריך מאגר מרכזי.

**פונקציות:**
- `setAuth(token, email)` — שומר את הטוקן והאימייל אחרי התחברות מוצלחת
- `logout()` — מוחק את הטוקן והאימייל (משתמש מנותק)
- `persist(...)` — Zustand middleware שמסנכרן את ה-state עם `localStorage` אוטומטית

---

### `store/transactionStore.ts`

**מה עושה:**
מנהל את כל מצב הדשבורד — האזור שנבחר, השעה שנבחרה, רשימת העסקאות המאושרות, ומצב "שולח כרגע".

**למה store נפרד מ-auth?**
ניהול auth ו-transactions הם תחומים שונים לחלוטין. הפרדה מונעת בלגן.

**שדות ה-state:**
- `selectedRegion` — האזור שבחר המשתמש (ישראל, צרפת...)
- `selectedTime` — השעה שהוזנה
- `approvedTransactions` — רשימת כל העסקאות המאושרות
- `isSubmitting` — true בזמן שליחת עסקה (מונע לחיצה כפולה)
- `isFetching` — true בזמן טעינת עסקאות
- `lastResult` — תוצאת העסקה האחרונה

**פונקציות:**
- `setRegion(region)` — מעדכן האזור שנבחר
- `setTime(time)` — מעדכן השעה שנבחרה
- `submitTransaction()` — שולח בקשת POST לשרת עם האזור והשעה. אם אושרה, טוען מחדש את רשימת העסקאות.
- `fetchApproved()` — שולח GET לשרת ומביא את כל העסקאות המאושרות של המשתמש

---

## 5. תיקיית `services/` — תקשורת עם השרת

### `services/api.ts`

**מה עושה:**
יוצר "לקוח HTTP" מוגדר מראש — `axios.create(...)` — עם URL בסיסי ו-headers. כל בקשה HTTP באפליקציה עוברת דרכו.

**למה צריך קובץ נפרד?**
במקום לכתוב `axios.post('http://localhost:5000/api/...', { headers: { Authorization: ... } })` בכל מקום — מגדירים פעם אחת וכולם עושים `import api`.

**interceptors — מה זה?**
Interceptors הם "מיירטים" — קוד שרץ אוטומטית לפני/אחרי כל בקשה.
- **request interceptor** — לפני כל בקשה: בודק אם יש טוקן ב-store ומוסיף `Authorization: Bearer <token>` ל-headers. בלי זה, השרת ידחה בקשות עם 401.
- **response interceptor** — אחרי כל תגובה: אם השרת החזיר 401 (לא מורשה), מבצע `logout()` אוטומטית ומנתק את המשתמש.

---

### `services/auth.service.ts`

**מה עושה:**
מכיל את הפונקציות לאימות — הרשמה והתחברות.

**פונקציות:**
- `register(email, password)` — שולח POST ל-`/api/auth/register` ומחזיר `{ token, email }`
- `login(email, password)` — שולח POST ל-`/api/auth/login` ומחזיר `{ token, email }`

---

### `services/transaction.service.ts`

**מה עושה:**
מכיל את כל הפונקציות הקשורות לעסקאות.

**פונקציות:**
- `submit(region, time)` — שולח POST ל-`/api/transactions/submit` עם האזור והשעה. מחזיר `{ status, localTime, region }`.
- `getApproved()` — שולח GET ל-`/api/transactions/approved`. מחזיר רשימת עסקאות מאושרות.
- `getCurrentTime(region)` — שולח GET ל-`/api/transactions/current-time/{region}`. מחזיר את השעה הנוכחית באזור כדי למלא את בורר השעה אוטומטית.

---

## 6. תיקיית `i18n/` — תמיכה בשפות

### `i18n/index.ts`

**מה עושה:**
מאתחל את מערכת התרגום. מגדיר אנגלית ועברית, ומשתמש ב-`LanguageDetector` כדי לזהות את שפת הדפדפן אוטומטית.

**פונקציה:**
- `i18n.use(LanguageDetector)` — מזהה את שפת הדפדפן של המשתמש ומגדיר אוטומטית
- `i18n.use(initReactI18next)` — מחבר את i18n לReact כדי שניתן להשתמש ב-`useTranslation` בכל רכיב
- `fallbackLng: 'en'` — אם השפה לא מוכרת, ברירת מחדל היא אנגלית

### `i18n/locales/en/translation.json` ו-`i18n/locales/he/translation.json`

**מה עושה:**
קבצי JSON עם כל הטקסטים של האפליקציה בשפות שונות. כל key זהה בשני הקבצים, הvalue משתנה.

**דוגמה:** הרכיב כותב `t('auth.login_btn')` וקבל "Login" באנגלית ו-"התחבר" בעברית.

---

## 7. `lib/utils.ts`

**מה עושה:**
מכיל פונקציה אחת: `cn(...)`.

**פונקציה `cn`:**
מאחדת classNames של Tailwind בצורה חכמה. פותרת בעיה נפוצה: אם כותבים `className="bg-red-500 bg-blue-500"`, Tailwind לא תמיד מבין מה לנצח. `cn()` מוודא שהclass האחרון מנצח תמיד, ומסיר כפילויות.

```typescript
cn('bg-red-500', condition && 'bg-blue-500')
// → 'bg-blue-500' אם condition=true
```

---

## 8. תיקיית `components/` — רכיבים משותפים

### `components/AuthGuard.tsx`

**מה עושה:**
"שומר" שבודק אם המשתמש מחובר לפני שמאפשר גישה לדשבורד.

**למה צריך:**
בלעדיו, כל משתמש יכול להיכנס ל-`/` ישירות בדפדפן גם בלי להתחבר.

**איך עובד:**
- בודק אם יש `token` ב-`authStore`
- אם אין — מעביר אוטומטית לדף `/login`
- אם יש — מציג את התוכן (`children`) — כלומר הדשבורד

---

### `components/Header.tsx`

**מה עושה:**
הכותרת העליונה שמופיעה בכל עמודי האפליקציה: לוגו Shva, כפתור התנתקות, ובורר שפה.

**פונקציות:**
- מציג לוגו
- `logout()` מה-authStore — לוחץ ומנתק את המשתמש
- `<LanguageToggle />` — בורר שפה

---

### `components/LanguageToggle.tsx`

**מה עושה:**
שני כפתורים: "ENG" ו-"עברית". לחיצה על אחד מהם:
1. משנה את שפת `i18n`
2. משנה את `document.dir` ל-`rtl` או `ltr` — גורם לכל ה-HTML להפוך כיוון
3. משנה את `document.lang`

**למה `dir` חשוב?**
בעברית הטקסט הולך מימין לשמאל. `dir="rtl"` על אלמנט ה-`<html>` גורם לכל הדף להתנהג נכון: flex מתהפך, אייקונים עוברים צד, padding logic properties מתנהגים הפוך.

---

### `components/RegionSelector.tsx`

**מה עושה:**
שדה חיפוש עם dropdown לבחירת אזור (ישראל, צרפת, קפריסין, איטליה). מעוצב בסגנון Material Design 3 עם "floating label" שעולה למעלה כשמתחילים להקליד.

**State פנימי:**
- `query` — מה המשתמש הקליד בשדה
- `open` — האם הdropdown פתוח

**פונקציות:**
- `filtered` — מסנן את רשימת האזורים לפי מה שהוקלד
- `useEffect` (value) — כשהערך מבחוץ משתנה (למשל איפוס), מעדכן את שדה הטקסט
- `useEffect` (mousedown) — סוגר את הdropdown כשלוחצים מחוץ לרכיב
- `onChange(region)` — מעביר את האזור שנבחר למעלה (ל-DashboardPage)

---

### `components/TimePicker.tsx`

**מה עושה:**
כרטיסיית בחירת שעה בסגנון Material Design 3. מציגה שדות שעה ודקות נפרדים עם אנימציה. תומכת במצב "נעול" אחרי לחיצת אישור.

**Props (מה מקבל מבחוץ):**
- `value` — השעה הנוכחית בפורמט "HH:mm"
- `onChange` — פונקציה שקוראים לה כשהשעה משתנה
- `onConfirm` — פונקציה שקוראים לה כשלוחצים "אישור"
- `onCancel` — פונקציה שקוראים לה כשלוחצים "ביטול"
- `locked` — האם הרכיב נעול (לא ניתן לשינוי)

**State פנימי:**
- `activeField` — 'hour' | 'minute' — איזה שדה פעיל כרגע (מסומן בסגול)
- `tempHour`, `tempMinute` — הערכים הזמניים שהמשתמש מקליד לפני לחיצת אישור

**פונקציות:**
- `handleOk()` — כשלוחצים "אישור": מנקה ומסנכרן את הערכים ומפעיל `onConfirm`
- `handleCancel()` — כשלוחצים "ביטול": מחזיר את הערכים למצב הקודם ומפעיל `onCancel`
- `sanitizeHour(v)` — מוודא שהשעה בטווח 00-23. ממיר "9" ל-"09" (padStart)
- `sanitizeMinute(v)` — מוודא שהדקה בטווח 00-59. ממיר "5" ל-"05" (padStart)
- `useEffect([value])` — כשהשעה משתנה מבחוץ (למשל אחרי בחירת אזור), מסנכרן את tempHour/tempMinute
- `dir="ltr"` על שורת הקלט — מונע מ-RTL להפוך את סדר שעה:דקה (שעה תמיד משמאל)
- כשנעול (`locked=true`): רקע הכרטיסייה משתנה, השדות לקריאה בלבד, כפתור "אישור" נעלם, אייקון השעון מוחלף בV

---

### `components/TransactionCard.tsx`

**מה עושה:**
כרטיס קטן שמציג עסקה מאושרת — שעה ואזור.

**מה מקבל:**
- `transaction: ApprovedTransaction` — אובייקט עם `id`, `region`, `localTime`

**למה `dir="auto"` על הטקסט?**
אם האזור כתוב בעברית (כמו "ישראל"), הדפדפן יזהה אוטומטית ויציג אותו מימין לשמאל. אם באנגלית (כמו "France"), יציג משמאל לימין. ה-`auto` עושה זאת חכם.

---

## 9. תיקיית `pages/` — עמודים שלמים

### `pages/LoginPage.tsx`

**מה עושה:**
דף התחברות עם שדות אימייל וסיסמה. אחרי התחברות מוצלחת — שומר את הטוקן ומעביר לדשבורד.

**State פנימי:**
- `email`, `password` — מה הוקלד
- `loading` — האם שליחה בתהליך (מבטיח שהכפתור לא ייפלא פעמיים)

**פונקציות:**
- `handleSubmit(e)` — קורא ל-`authService.login()`. אם הצליח: `setAuth(token, email)` ומעבר ל-`/`. אם נכשל: הודעת שגיאה.

---

### `pages/SignupPage.tsx`

**מה עושה:**
דף הרשמה. דומה ל-LoginPage אבל קורא ל-`authService.register()`.

---

### `pages/DashboardPage.tsx`

**מה עושה:**
העמוד הראשי של האפליקציה. מכיל:
1. בורר אזור + בורר שעה + כפתור שליחה
2. איזור Hero עם תמונת פריסה
3. קרוסלה של עסקאות מאושרות

**State:**
- `carouselIndex` — אינדקס הכרטיס הנוכחי בקרוסלה (0 = התחלה)
- `maxIndex` — כמה צעדים אפשר לגלול (כמות קלפים שלא נראים)
- `timeConfirmed` — האם המשתמש לחץ "אישור" על השעה

**Hooks (useEffect / useLayoutEffect):**
- `useLayoutEffect([approvedTransactions.length])` — מודד את רוחב מיכל הקרוסלה (**אחרי שה-DOM עלה**) ומחשב את `maxIndex`. רץ עם `window.resize` גם כן כדי לתמוך בשינוי גודל חלון. `useLayoutEffect` (ולא `useEffect`) נבחר כדי למנוע "ריצוד" — הוא רץ לפני שהדפדפן צובע את המסך.
- `useEffect([approvedTransactions.length, isRTL])` — מאפס את `carouselIndex` ל-0 כשהרשימה משתנה **או** כשמשתנה שפה. בלי זה, החלפת שפה תשאיר את הקרוסלה באמצע.
- `useEffect([maxIndex])` — מצמצם את `carouselIndex` אם `maxIndex` קטן ממנו (למשל אחרי שינוי גודל חלון).
- `useEffect([fetchApproved])` — טוען את העסקאות המאושרות כשהעמוד נפתח.
- `useEffect([selectedRegion])` — כשהאזור משתנה: מאפס `timeConfirmed` ומביא את השעה הנוכחית באזור.

**לוגיקת הקרוסלה:**

`CARD_UNIT = 304` (280px רוחב קלף + 24px gap)

- `displayedCards` — ברוסית: [כרטיס1, כרטיס2, כרטיס3, כרטיס4]. בעברית: **הפוך** [כרטיס4, כרטיס3, כרטיס2, כרטיס1] כדי שהקלף הראשון יהיה מימין.
- `translateX` — ב-LTR: `-(index * 304)` (מזיז שמאלה). ב-RTL: `+(index * 304)` (מזיז ימינה) — כי המיכל מיישר ימינה (`flex justify-end`).
- מיכל הגלילה ב-RTL מקבל `flex justify-end` כדי שהקלף הראשון יהיה **תמיד** צמוד לצד ימין ללא רווח מהחץ.

**`scrollCarousel(dir)`:**
מזיז את `carouselIndex` ב-1 קדימה או אחורה, עם `Math.min/max` כדי לא לחרוג מ-0 או `maxIndex`.

**`handleSubmit()`:**
שולח עסקה, מציג toast, ואחר כך (ב-`finally`) — מאפס `timeConfirmed` ומביא מחדש את שעת האזור הנוכחית (כמו לחיצה על "ביטול").

---

## 10. `vite.config.ts`

**מה עושה:**
קובץ הגדרות לVite.

**הגדרות חשובות:**
- `plugins: [react(), tailwindcss()]` — מפעיל React ו-Tailwind
- `resolve.alias: { '@': './src' }` — מאפשר לכתוב `import X from '@/components/X'` במקום `../../components/X`. הרבה יותר נוח.
- `server.proxy` — בפיתוח (`npm run dev`): כל בקשה ל-`/api/...` מועברת אוטומטית ל-`http://localhost:5000`. בלי זה, הדפדפן ידחה בקשות בגלל Same-Origin Policy.

---

## 11. `Dockerfile` — בניית קונטיינר Frontend

```
frontend/Dockerfile
```

**שלב 1 — build:**
- מתחיל מ-`node:24-alpine` (Node.js קטן)
- מעתיק `package.json` ומריץ `npm ci` (התקנת תלויות)
- מעתיק את כל הקוד ומריץ `npm run build` → יוצר תיקיית `dist/` עם קבצי HTML/JS/CSS מוכנים ל-production

**שלב 2 — serve:**
- מתחיל מ-`nginx:alpine` (שרת web קטן)
- מעתיק את `dist/` לתוך nginx
- מעתיק `nginx.conf` — הגדרות nginx שמפנה כל בקשת `/api/...` לשרת Backend ומגיש את ה-React app עבור שאר הנתיבים

**למה nginx?**
בפיתוח, Vite עצמו משמש כשרת. ב-production, Vite לא קיים — צריך שרת אמיתי שיגיש קבצים סטטיים. nginx הוא קל, מהיר, ומתאים בדיוק לזה.

---

## סיכום — זרימת נתונים

```
משתמש לוחץ "שלח עסקה"
        ↓
DashboardPage.handleSubmit()
        ↓
transactionStore.submitTransaction()
        ↓
transactionService.submit(region, time)
        ↓
api.ts → POST /api/transactions/submit (עם Authorization header)
        ↓
Backend מחזיר { status, localTime, region }
        ↓
אם Approved → fetchApproved() → עדכון רשימת הכרטיסים
        ↓
toast מוצג במרכז למעלה
        ↓
timeConfirmed מאופס, שעה מתרעננת
```
