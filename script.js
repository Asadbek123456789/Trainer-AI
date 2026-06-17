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

const AI_ADVICE_TEXT = `🏋️‍♂️ Kundalik mashqlar ketma-ketligi: Turnikda osilib turish, Turnikga tortinish, Tosh ko'tarish, Atjimaniya, Belni cho'zish, Yondan tosh ko'tarish, Tomirga ishlash.`;

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
   3) AUTH (TUZATILGAN: signInWithPopup va parametrlash)
   ========================================================= */
googleBtn.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  // Windows'dagi 'ms-cortana' xatosini oldini olish uchun qo'shimcha parametrlar
  provider.setCustomParameters({
    'display': 'popup'
  });

  try {
    await auth.signInWithPopup(provider);
  } catch (err) {
    console.error("Auth Xatosi:", err);
    if (err.code === 'auth/popup-blocked') {
      alert("Iltimos, brauzerda pop-up oynalarga ruxsat bering (manzil satri o'ng tomoniga qarang).");
    } else {
      alert("Kirishda xatolik: " + err.message);
    }
  }
});

logoutBtn.addEventListener('click', () => {
  if (notifyTimer) clearInterval(notifyTimer);
  auth.signOut().then(() => window.location.reload());
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

function showScreen(name) {
  loginScreen.classList.add('hidden');
  profileScreen.classList.add('hidden');
  appScreen.classList.add('hidden');
  if (name === 'login') loginScreen.classList.remove('hidden');
  if (name === 'profile') profileScreen.classList.remove('hidden');
  if (name === 'app') appScreen.classList.remove('hidden');
}

/* =========================================================
   4) YORDAMCHI FUNKSIYALAR
   ========================================================= */
saveProfileBtn.addEventListener('click', async () => {
  const age = parseInt(ageInput.value);
  const height = parseInt(heightInput.value);
  const weight = parseInt(weightInput.value);
  if (!age || !height || !weight) return alert("Barcha maydonlarni to'ldiring.");

  userData = { name: currentUser.displayName, email: currentUser.email, photo: currentUser.photoURL, age, height, weight, profileDone: true, workoutTime: "07:00", progress: {}, lastFinishedDay: null };
  await userDocRef.set(userData);
  await renderApp();
  showScreen('app');
});

async function renderApp() {
  userPhoto.src = userData.photo || '';
  userName.textContent = userData.name || currentUser.email;
  userStats.textContent = `${userData.age} yosh • ${userData.height} sm • ${userData.weight} kg`;
  workoutTime.value = userData.workoutTime || "07:00";
  buildExerciseGrid();
  updateProgressUI();
}

function buildExerciseGrid() {
  exerciseGrid.innerHTML = '';
  const today = getTodayProgress();
  EXERCISES.forEach((ex, i) => {
    const card = document.createElement('div');
    card.className = 'exercise-card' + (today.exercises[i] ? ' done' : '');
    card.innerHTML = `<h3>${ex.name}</h3><p>${ex.desc}</p><label><input type="checkbox" data-index="${i}" ${today.exercises[i] ? 'checked' : ''}> Bajarildi</label>`;
    exerciseGrid.appendChild(card);
  });
  exerciseGrid.querySelectorAll('input').forEach(cb => cb.addEventListener('change', async (e) => {
    getTodayProgress().exercises[parseInt(e.target.dataset.index)] = e.target.checked;
    await userDocRef.update({ progress: userData.progress });
    updateProgressUI();
  }));
}

function getTodayProgress() {
  const key = new Date().toISOString().split('T')[0];
  if (!userData.progress[key]) userData.progress[key] = { exercises: new Array(EXERCISES.length).fill(false), finished: false };
  return userData.progress[key];
}

function updateProgressUI() {
  const today = getTodayProgress();
  const done = today.exercises.filter(Boolean).length;
  progressFill.style.width = `${(done / EXERCISES.length) * 100}%`;
  progressText.textContent = `${done} / ${EXERCISES.length} mashq bajarildi`;
}

finishDayBtn.addEventListener('click', async () => {
  getTodayProgress().finished = true;
  await userDocRef.update({ progress: userData.progress });
  updateProgressUI();
});

aiAdviceBtn.addEventListener('click', () => { aiOutput.textContent = AI_ADVICE_TEXT; });
