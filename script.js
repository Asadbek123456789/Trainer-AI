/* 1) FIREBASE SOZLAMALARI */
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

/* 2) AUTH - "IDIAL" VA XATOSIZ YONDASHUV */
const googleBtn = document.getElementById('googleBtn');

googleBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  // Tizim xatosini chetlab o'tish uchun maxsus parametr
  provider.setCustomParameters({
    'prompt': 'select_account' // Har doim hisob tanlashni so'raydi
  });

  // Windows 'ms-cortana' xatosini oldini olish uchun:
  // Firebase'ga popup ishlatishni majburlaymiz
  auth.signInWithPopup(provider)
    .then((result) => {
      console.log("Muvaffaqiyatli kirdi!");
    })
    .catch((error) => {
      console.error("Xatolik:", error);
      if (error.code === 'auth/popup-blocked') {
        alert("Brauzer oynani blokladi. Iltimos, manzil satridagi belgiga bosib ruxsat bering.");
      } else {
        alert("Kirishda xatolik yuz berdi. Iltimos, boshqa brauzerni sinab ko'ring.");
      }
    });
});

/* 3) APP LOGIKASI */
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    // Profil tekshiruvi va boshqalar shu yerda davom etadi
  } else {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appScreen').classList.add('hidden');
  }
});
