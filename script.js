/* =========================================================
   1) FIREBASE SOZLAMALARI
   ========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyAnVhvWLzneU01NOA7M7V8OE0uRT5bSLwY",
  authDomain: "trainer-ai-a9a70.firebaseapp.com",
  projectId: "trainer-ai-a9a70",
  storageBucket: "trainer-ai-a9a70.firebasestorage.app",
  messagingSenderId: "959871382890",
  appId: "1:959871382890:web:a034d14d462b20b0bb6113",
  measurementId: "G-VHYF31LJPG"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* =========================================================
   2) MASHQLAR VA ELEMENTLAR
   ========================================================= */
const EXERCISES = [
  { name: "Turnikda osilib turish", desc: "Bajarilishi: Dastlab turnikda osilib, mushak va umurtqalarni cho'zasiz." },
  { name: "Turnikga tortinish", desc: "Miqdori: 3 tadan 2 yondashuv (patxot)." },
  { name: "Ikkita qo'lida tosh ko'tarish", desc: "Holati: Pastdan tepaga qarab.\nMiqdori: 15 marta." },
  { name: "Atjimaniya", desc: "Miqdori: 15 ta yoki 20 ta." },
  { name: "Belni cho'zish gimnastikasi", desc: "Bajarilishi: Belni egib, cho'zish va yoyish mashqlarini bajarish." },
  { name: "Yondan tepaga tosh ko'tarish", desc: "Miqdori: 10 ta yoki 15 ta." },
  { name: "Tomirga ishlash (mashg'ulot yakuni)", desc: "Bajarilishi: Qon aylanishini me'yorlashtirish va nafasni rostlash uchun harakatlar (yengil silkintirish)." }
];

const loginScreen = document.getElementById('loginScreen');
const profileScreen = document.getElementById('profileScreen');
const appScreen = document.getElementById('appScreen');
const googleBtn = document.getElementById('googleBtn');
const logoutBtn = document.getElementById('logoutBtn');

// ... (barcha const elementlaringizni shu yerga qo'yishda davom eting)
// (saveProfileBtn, workoutTime va boshqalar...)

/* =========================================================
   3) AUTH (TUZATILGAN: signInWithPopup)
   ========================================================= */
googleBtn.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    // Redirect o'rniga Popup ishlatamiz - bu ms-cortana xatosini oldini oladi
    await auth.signInWithPopup(provider);
  } catch (err) {
    console.error("Auth Xatosi:", err);
    if (err.code === 'auth/popup-blocked') {
      alert("Iltimos, brauzeringizda qalqib chiquvchi oynalarga (pop-up) ruxsat bering.");
    } else {
      alert("Kirishda xatolik: " + err.message);
    }
  }
});

logoutBtn.addEventListener('click', () => {
  if (notifyTimer) clearInterval(notifyTimer);
  auth.signOut();
});

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    userDocRef = db.collection('users').doc(user.uid);
    const snap = await userDocRef.get();
    if (!snap.exists || !snap.data().profileDone) {
      showScreen('profile');
    } else {
      userData = snap.data();
      await renderApp();
      showScreen('app');
    }
  } else {
    currentUser = null;
    showScreen('login');
  }
});

// ... (qolgan barcha funksiyalaringiz: showScreen, renderApp, buildExerciseGrid va b.)
// Ularni o'zgartirmasdan, shu kodning pastidan qo'shib ketavering.
