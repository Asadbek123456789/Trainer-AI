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
   2) MASHQLAR RO'YXATI
   ========================================================= */
const EXERCISES = [
  {
    name: "Turnikda osilib turish",
    desc: "Bajarilishi: Dastlab turnikda osilib, mushak va umurtqalarni cho'zasiz."
  },
  {
    name: "Turnikga tortinish",
    desc: "Miqdori: 3 tadan 2 yondashuv (patxot)."
  },
  {
    name: "Ikkita qo'lida tosh ko'tarish",
    desc: "Holati: Pastdan tepaga qarab.\nMiqdori: 15 marta."
  },
  {
    name: "Atjimaniya",
    desc: "Miqdori: 15 ta yoki 20 ta."
  },
  {
    name: "Belni cho'zish gimnastikasi",
    desc: "Bajarilishi: Belni egib, cho'zish va yoyish mashqlarini bajarish."
  },
  {
    name: "Yondan tepaga tosh ko'tarish",
    desc: "Miqdori: 10 ta yoki 15 ta."
  },
  {
    name: "Tomirga ishlash (mashg'ulot yakuni)",
    desc: "Bajarilishi: Qon aylanishini me'yorlashtirish va nafasni rostlash uchun harakatlar (yengil silkintirish)."
  }
];
 
const AI_ADVICE_TEXT =
`🏋️‍♂️ Kundalik mashqlar ketma-ketligi:
 
Turnikda osilib turish
Bajarilishi: Dastlab turnikda osilib, mushak va umurtqalarni cho'zasiz.
 
Turnikga tortinish
Miqdori: 3 tadan 2 yondashuv (patxot).
 
Ikkita qo'lida tosh ko'tarish
Holati: Pastdan tepaga qarab.
Miqdori: 15 marta.
 
Atjimaniya
Miqdori: 15 ta yoki 20 ta.
 
Belni cho'zish gimnastikasi
Bajarilishi: Belni egib, cho'zish va yoyish mashqlarini bajarish.
 
Yondan tepaga tosh ko'tarish
Miqdori: 10 ta yoki 15 ta.
 
Tomirga ishlash (mashg'ulot yakuni)
Bajarilishi: Qon aylanishini me'yorlashtirish va nafasni rostlash uchun harakatlar (yoki yengil silkintirish mashqlari).`;
 
/* =========================================================
   3) ELEMENTLAR
   ========================================================= */
const loginScreen = document.getElementById('loginScreen');
const profileScreen = document.getElementById('profileScreen');
const appScreen = document.getElementById('appScreen');
 
const googleBtn = document.getElementById('googleBtn');
const logoutBtn = document.getElementById('logoutBtn');
 
const saveProfileBtn = document.getElementById('saveProfileBtn');
const ageInput = document.getElementById('ageInput');
const heightInput = document.getElementById('heightInput');
const weightInput = document.getElementById('weightInput');
 
const userPhoto = document.getElementById('userPhoto');
const userName = document.getElementById('userName');
const userStats = document.getElementById('userStats');
 
const workoutTime = document.getElementById('workoutTime');
const saveTimeBtn = document.getElementById('saveTimeBtn');
const timeHint = document.getElementById('timeHint');
const notifPermBtn = document.getElementById('notifPermBtn');
 
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const finishDayBtn = document.getElementById('finishDayBtn');
const lastFinished = document.getElementById('lastFinished');
 
const exerciseGrid = document.getElementById('exerciseGrid');
const aiAdviceBtn = document.getElementById('aiAdviceBtn');
const aiOutput = document.getElementById('aiOutput');
 
let currentUser = null;
let userDocRef = null;
let userData = null;
let notifyTimer = null;
 
/* =========================================================
   4) AUTH
   ========================================================= */
googleBtn.addEventListener('click', () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => alert("Xatolik: " + err.message));
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
      // Birinchi marta -> profil so'raladi
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
 
function showScreen(name) {
  loginScreen.classList.add('hidden');
  profileScreen.classList.add('hidden');
  appScreen.classList.add('hidden');
  if (name === 'login') loginScreen.classList.remove('hidden');
  if (name === 'profile') profileScreen.classList.remove('hidden');
  if (name === 'app') appScreen.classList.remove('hidden');
}
 
/* =========================================================
   5) PROFIL SAQLASH (yosh, bo'y, vazn)
   ========================================================= */
saveProfileBtn.addEventListener('click', async () => {
  const age = parseInt(ageInput.value);
  const height = parseInt(heightInput.value);
  const weight = parseInt(weightInput.value);
 
  if (!age || !height || !weight) {
    alert("Iltimos, barcha maydonlarni to'ldiring.");
    return;
  }
 
  const todayKey = getTodayKey();
  userData = {
    name: currentUser.displayName,
    email: currentUser.email,
    photo: currentUser.photoURL,
    age, height, weight,
    profileDone: true,
    workoutTime: "07:00",
    progress: {},          // { "2026-06-12": { exercises: [bool x7], finished: bool } }
    lastFinishedDay: null,
    createdAt: new Date().toISOString()
  };
 
  await userDocRef.set(userData);
  await renderApp();
  showScreen('app');
});
 
/* =========================================================
   6) ASOSIY SAYTNI RENDER QILISH
   ========================================================= */
async function renderApp() {
  userPhoto.src = userData.photo || '';
  userName.textContent = userData.name || currentUser.email;
  userStats.textContent = `${userData.age} yosh • ${userData.height} sm • ${userData.weight} kg`;
 
  workoutTime.value = userData.workoutTime || "07:00";
  timeHint.textContent = `Joriy belgilangan vaqt: ${userData.workoutTime || "07:00"}`;
 
  buildExerciseGrid();
  updateProgressUI();
  startNotificationLoop();
}
 
function getTodayKey() {
  const d = new Date();
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}
 
function getTodayProgress() {
  const key = getTodayKey();
  if (!userData.progress[key]) {
    userData.progress[key] = { exercises: new Array(EXERCISES.length).fill(false), finished: false };
  }
  return userData.progress[key];
}
 
/* ===== Mashqlar gridini chizish ===== */
function buildExerciseGrid() {
  exerciseGrid.innerHTML = '';
  const today = getTodayProgress();
 
  EXERCISES.forEach((ex, i) => {
    const card = document.createElement('div');
    card.className = 'exercise-card' + (today.exercises[i] ? ' done' : '');
    card.innerHTML = `
      <h3>${ex.name}</h3>
      <p>${ex.desc.replace(/\n/g, '<br>')}</p>
      <label class="check">
        <input type="checkbox" data-index="${i}" ${today.exercises[i] ? 'checked' : ''}>
        Bajarildi
      </label>
    `;
    exerciseGrid.appendChild(card);
  });
 
  exerciseGrid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', async (e) => {
      const idx = parseInt(e.target.dataset.index);
      const today = getTodayProgress();
      today.exercises[idx] = e.target.checked;
      e.target.closest('.exercise-card').classList.toggle('done', e.target.checked);
      await saveProgress();
      updateProgressUI();
    });
  });
}
 
/* ===== Progress UI ===== */
function updateProgressUI() {
  const today = getTodayProgress();
  const done = today.exercises.filter(Boolean).length;
  const total = EXERCISES.length;
  progressFill.style.width = `${(done / total) * 100}%`;
  progressText.textContent = `${done} / ${total} mashq bajarildi`;
 
  finishDayBtn.disabled = today.finished;
  finishDayBtn.textContent = today.finished ? "✅ Bugungi mashq yakunlandi!" : "✅ Kunlik mashqni yakunlash";
 
  if (userData.lastFinishedDay) {
    lastFinished.textContent = `So'nggi yakunlangan kun: ${userData.lastFinishedDay}`;
  } else {
    lastFinished.textContent = '';
  }
}
 
finishDayBtn.addEventListener('click', async () => {
  const today = getTodayProgress();
  today.finished = true;
  userData.lastFinishedDay = getTodayKey();
  await saveProgress();
  await userDocRef.update({ lastFinishedDay: userData.lastFinishedDay });
  updateProgressUI();
});
 
async function saveProgress() {
  await userDocRef.update({ progress: userData.progress });
}
 
/* =========================================================
   7) TABLAR
   ========================================================= */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});
 
/* =========================================================
   8) TRENIROVKA VAQTINI SAQLASH
   ========================================================= */
saveTimeBtn.addEventListener('click', async () => {
  const val = workoutTime.value;
  if (!val) return;
  userData.workoutTime = val;
  await userDocRef.update({ workoutTime: val });
  timeHint.textContent = `Joriy belgilangan vaqt: ${val}`;
  startNotificationLoop();
  alert("Vaqt saqlandi! Endi har kuni shu vaqtda eslatma keladi.");
});
 
/* =========================================================
   9) BILDIRISHNOMALAR
   ========================================================= */
notifPermBtn.addEventListener('click', () => {
  if (!("Notification" in window)) {
    alert("Brauzeringiz bildirishnomani qo'llamaydi.");
    return;
  }
  Notification.requestPermission().then(perm => {
    if (perm === "granted") {
      new Notification("IronDaily", { body: "Bildirishnomalar yoqildi! 💪" });
    }
  });
});
 
function startNotificationLoop() {
  if (notifyTimer) clearInterval(notifyTimer);
  let notifiedToday = false;
 
  notifyTimer = setInterval(() => {
    if (!userData.workoutTime) return;
    const now = new Date();
    const current = now.toTimeString().slice(0, 5); // HH:MM
    if (current === userData.workoutTime && !notifiedToday) {
      notifiedToday = true;
      if (Notification.permission === "granted") {
        new Notification("⏰ Mashg'ulot vaqti keldi!", {
          body: "Bugungi mashqlarni boshlash vaqti. Omad! 💪",
          icon: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=100"
        });
      }
    }
    if (current === "00:00") notifiedToday = false; // ertangi kunga reset
  }, 30000); // har 30 sekundda tekshiradi
}
 
/* =========================================================
   10) AI MASLAHAT
   ========================================================= */
aiAdviceBtn.addEventListener('click', () => {
  aiOutput.textContent = AI_ADVICE_TEXT;
  aiOutput.classList.add('show');
});