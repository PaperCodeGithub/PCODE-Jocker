// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  increment,
  doc,
  limit,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCfu4CT_lRGlD05-6KJL3hnhL_8N7nZpQA",
  authDomain: "jocker-5ce97.firebaseapp.com",
  projectId: "jocker-5ce97",
  storageBucket: "jocker-5ce97.appspot.com",
  messagingSenderId: "672281897782",
  appId: "1:672281897782:web:10d52c1427259f4f12a197"
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const submitJokeBtn = document.getElementById("submit-btn");
submitJokeBtn.addEventListener('click', submitJoke);
async function submitJoke() {
  const input = document.getElementById('jokeInput');
  const text = input.value.trim();
  const inputName = document.getElementById('name');
  const name = inputName.value.trim();

  const bannedWords = ['sohini', 'prithiv', 'sohinii', 'sohiniii', 'ssohini'];
  const loweredText = text.toLowerCase();
  const loweredName = name.toLowerCase();

  for (let word of bannedWords) {
    if (loweredText.includes(word) || loweredName.includes(word)) {
      alert("Your joke contains blocked words!");
      return;
    }
  }

  if (!text) return alert("Enter a joke first!");

  try {
    await addDoc(collection(db, "jokes"), {
      name: name,
      text: text,
      upvotes: 0,
      downvotes: 0,
      timestamp: Date.now()
    });
    input.value = '';
    inputName.value = '';
  } catch (e) {
    alert(e);
  }
}

document.getElementById('sortMode').addEventListener('change', checkJokes);

function checkJokes() {
  const mode = document.getElementById('sortMode').value;

  let q;
  if (mode === 'top') {
    q = query(collection(db, "jokes"), orderBy("upvotes", "desc"), orderBy("downvotes", "asc"));
    loadJokes(q);
  } else if (mode === 'latest') {
    q = query(collection(db, "jokes"), orderBy("timestamp", "desc"));
    loadJokes(q);
  } else {
    document.getElementById('jokeFeed').style.display = 'none';
  }
}

function loadJokes(q) {
  document.getElementById('jokeFeed').style.display = 'block';
  onSnapshot(q, (snapshot) => {
    const jokeFeed = document.getElementById('jokeFeed');
    jokeFeed.innerHTML = '';

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const jokeId = docSnap.id;

      const card = document.createElement('div');
      card.className = 'joke-card';
      card.innerHTML = `
        <div class="joke-text">
          <p>@${data.name}</p>
          ${data.text}
        </div>
        <div class="vote-buttons">
          <button onclick="vote('${jokeId}', 'up', this)">😂 LOL (${data.upvotes})</button>
          <button onclick="vote('${jokeId}', 'down', this)">😐 Meh (${data.downvotes})</button>
        </div>
      `;
      jokeFeed.appendChild(card);
    });
  });
}

checkJokes();

async function loadLeaderboard() {
  const leaderboardList = document.querySelector('.leaderboard ol');
  leaderboardList.innerHTML = '';

  const q = query(collection(db, "jokes"), orderBy("upvotes", "desc"), limit(10));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement('li');
    li.textContent = `@${data.name || "anonymous"} – ${data.upvotes || 0} votes`;
    leaderboardList.appendChild(li);
  });
}

loadLeaderboard();




const voted = new Set(); 

window.vote = async function (id, type, btn) {
  if (voted.has(id)) return alert("You already voted!");
  voted.add(id);

  const jokeRef = doc(db, "jokes", id);
  await updateDoc(jokeRef, {
    [type === 'up' ? 'upvotes' : 'downvotes']: increment(1)
  });

  btn.innerText = type === 'up' ? "✅ Voted LOL" : "✅ Voted Meh";
  btn.disabled = true;
  btn.nextElementSibling?.setAttribute('disabled', true);
  btn.previousElementSibling?.setAttribute('disabled', true);
};
