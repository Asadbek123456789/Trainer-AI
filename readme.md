# IronDaily — O'rnatish qo'llanmasi
 
Bu sayt **Firebase** (Google'ning bepul xizmati) orqali ishlaydi. Server sotib olish, backend yozish shart emas. Faqat quyidagi qadamlarni bajaring:
 
## 1. Firebase loyihasini yarating
1. https://console.firebase.google.com ga kiring
2. "Add project" -> nom bering (masalan "irondaily")
3. Google Analytics — shart emas, o'tkazib yuborishingiz mumkin
## 2. Authentication (Google login) yoqish
1. Chap menyudan **Build -> Authentication** -> "Get started"
2. **Sign-in method** bo'limidan **Google**ni tanlang -> Enable -> Save
## 3. Firestore Database yaratish
1. **Build -> Firestore Database** -> "Create database"
2. **Production mode**ni tanlang, location — eng yaqinini tanlang
3. **Rules** bo'limiga o'tib, quyidagini joylashtiring (har bir user faqat o'z ma'lumotini ko'radi/yozadi):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
 
## 4. Web App qo'shish va config olish
1. Loyiha sozlamalari (gear icon) -> "Project settings"
2. "Your apps" -> **Web (</>) ikonkasi** -> nom bering -> Register
3. Sizga `firebaseConfig` obyekti beriladi — uni nusxalab **app.js** faylining eng yuqorisidagi `firebaseConfig` o'rniga qo'ying
## 5. Saytni serverga joylash (hosting)
Eng oson yo'l — **Firebase Hosting** (bepul):
 
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```
 
`firebase init` paytida loyiha papkangizni `public` qilib ko'rsating (yoki fayllarni `public/` papkaga ko'chiring).
 
Boshqa variant: GitHub Pages, Netlify, Vercel — barchasi statik HTML/CSS/JS uchun bepul va Google login (Firebase Auth) ular bilan ham muammosiz ishlaydi. Faqat Firebase Console -> Authentication -> Settings -> **Authorized domains** ga o'z domeningizni (masalan `username.github.io`) qo'shing.
 
## 6. Sinab ko'rish
`firebaseConfig` to'g'ri kiritilgandan so'ng saytni ochib, "Google orqali kirish" tugmasini bosing. Birinchi marta yosh/bo'y/vazn so'raladi, keyin ma'lumotlar Firestore'ga saqlanadi — boshqa qurilmadan ham o'sha akkaunt bilan kirsangiz, barchasi tayyor turadi.
 
## Eslatma: bildirishnomalar
Brauzer bildirishnomalari faqat **sayt ochiq turgan vaqtda** ishlaydi (chunki backend server yo'q). Agar telefon yopilganda ham push-xabar kerak bo'lsa, kelajakda **Firebase Cloud Messaging + Cloud Functions** qo'shish kerak bo'ladi — bu uchun alohida murojaat qiling.