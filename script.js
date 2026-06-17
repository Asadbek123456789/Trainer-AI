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
   2) ELEMENTLARNI ANIQLASH
   ========================================================= */
const loginScreen = document.getElementById('loginScreen');
const profileScreen = document.getElementById('profileScreen');
const appScreen = document.getElementById('appScreen');
const googleBtn = document.getElementById('googleBtn');
const logoutBtn = document.getElementById('logoutBtn');

/* =========================================================
   3) AUTH (TUZATILGAN QISM)
   ========================================================= */
googleBtn.addEventListener('click', () => {
  console.log("Google tugmasi bosildi, autentifikatsiya boshlanmoqda...");
  const provider = new firebase.auth.GoogleAuthProvider();
  
  // signInWithPopup foydalanish uchun qulayroq
  auth.signInWithPopup(provider)
    .then((result) => {
      console.log("Muvaffaqiyatli kirildi:", result.user.email);
    })
    .catch((error) => {
      console.error("Auth xatosi:", error.code, error.message);
      alert("Kirishda xatolik: " + error.message);
    });
});

logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    window.location.reload();
  });
});

/* =========================================================
   4) AUTH HOLATINI KUZATISH
   ========================================================= */
auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log("Foydalanuvchi tizimda:", user.email);
    const userDocRef = db.collection('users').doc(user.uid);
    const snap = await userDocRef.get();

    if (!snap.exists || !snap.data().profileDone) {
      showScreen('profile');
    } else {
      userData = snap.data();
      await renderApp();
      showScreen('app');
    }
  } else {
    console.log("Foydalanuvchi tizimdan chiqdi.");
    showScreen('login');
  }
});

function showScreen(name) {
  loginScreen.classList.add('hidden');
  profileScreen.classList.add('hidden');
  appScreen.classList.add('hidden');
  
  if (name === 'login') loginScreen.classList.remove('hidden');
  if (name === 'profile') profileScreen.classList.remove('hidden');
  if (name === 'app') appScreen.classList.remove('hidden');
}

/* =========================================================
   5) BOSHQA FUNKSIYALAR (Oldingi kodlaringizni shu yerga qo'shing)
   ========================================================= */
// Qolgan renderApp, buildExerciseGrid, saveProfileBtn kabi 
// funksiyalaringizni mana shu joydan pastga davom ettirib joylashtiring.
