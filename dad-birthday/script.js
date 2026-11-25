document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const setText = (id, value) => { const el = $(id); if (el) el.textContent = value; };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  setText("dad-name", DAD_NAME);
  setText("intro-line", INTRO_LINE);
  setText("birthday-message", BIRTHDAY_MESSAGE);
  setText("note-message", NOTE_MESSAGE);
  setText("signature", "— With love, " + MY_NAME);
  setText("footer-credit", "Made with love by " + MY_NAME);

  // Use friendly placeholders whenever a personal photo has not been added yet.
  const heroImage = $("hero-photo");
  heroImage.addEventListener("error", () => { heroImage.hidden = true; heroImage.closest(".photo-frame").classList.add("image-missing"); }, { once: true });
  heroImage.addEventListener("load", () => heroImage.closest(".photo-frame").classList.add("image-loaded"), { once: true });

  // Photo gallery and keyboard-accessible lightbox.
  const lightbox = $("lightbox");
  const closeLightbox = () => { lightbox.hidden = true; document.body.classList.remove("no-scroll"); };
  PHOTOS.forEach((photo, index) => {
    const card = document.createElement("figure"); card.className = "memory-card reveal";
    const frame = document.createElement("div"); frame.className = "memory-frame";
    const img = document.createElement("img"); img.src = photo.src; img.alt = photo.alt || photo.caption || ("Family memory " + (index + 1)); img.loading = "lazy"; img.decoding = "async";
    img.addEventListener("error", () => { img.hidden = true; frame.classList.add("image-missing"); }, { once: true });
    img.addEventListener("load", () => frame.classList.add("image-loaded"), { once: true });
    const fallback = document.createElement("div"); fallback.className = "memory-fallback";
    const number = document.createElement("span"); number.textContent = String(index + 1).padStart(2, "0");
    const hint = document.createElement("p"); hint.textContent = "A photo from the family album goes here.";
    fallback.append(number, hint); frame.append(img, fallback);
    const button = document.createElement("button"); button.type = "button"; button.className = "memory-open"; button.setAttribute("aria-label", "Open photo: " + photo.caption); button.append(frame);
    button.addEventListener("click", () => {
      if (!img.complete || !img.naturalWidth) return;
      $("lightbox-image").src = photo.src; $("lightbox-image").alt = img.alt; $("lightbox-caption").textContent = photo.caption;
      lightbox.hidden = false; document.body.classList.add("no-scroll"); $("lightbox-close").focus();
    });
    const caption = document.createElement("figcaption"); caption.textContent = photo.caption;
    card.append(button, caption); $("photo-grid").append(card);
  });
  $("lightbox-close").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !lightbox.hidden) closeLightbox(); });

  // Reasons cards.
  REASONS.forEach((reason, index) => {
    const card = document.createElement("article"); card.className = "reason-card reveal tone-" + ((index % 4) + 1);
    const emoji = document.createElement("span"); emoji.className = "reason-emoji"; emoji.setAttribute("aria-hidden", "true"); emoji.textContent = reason.emoji;
    const text = document.createElement("p"); text.textContent = reason.text;
    const count = document.createElement("small"); count.textContent = String(index + 1).padStart(2, "0");
    card.append(emoji, text, count); $("reasons-grid").append(card);
  });

  // Surprise note and optional confetti.
  const confettiReady = () => typeof window.confetti === "function";
  const celebrate = () => {
    if (reducedMotion || !confettiReady()) return;
    window.confetti({ particleCount: 55, spread: 62, startVelocity: 34, origin: { y: 0.68 }, colors: ["#9e5139", "#d9ad70", "#ece1cf", "#716b5c"] });
  };
  $("surprise-button").addEventListener("click", () => {
    $("surprise-message").textContent = SURPRISE_MESSAGE; $("surprise-message").hidden = false; $("surprise-button").hidden = true; celebrate();
  });
  if (!reducedMotion) window.addEventListener("load", () => {
    if (confettiReady()) window.confetti({ particleCount: 20, spread: 48, startVelocity: 24, origin: { y: 0.7 }, colors: ["#9e5139", "#d9ad70", "#716b5c"] });
  }, { once: true });

  // Vertical / alternating family timeline.
  TIMELINE.forEach((item) => {
    const card = document.createElement("article"); card.className = "timeline-item reveal";
    const marker = document.createElement("span"); marker.className = "timeline-marker"; marker.setAttribute("aria-hidden", "true");
    const year = document.createElement("p"); year.className = "timeline-year"; year.textContent = item.year;
    const title = document.createElement("h3"); title.textContent = item.title;
    const text = document.createElement("p"); text.textContent = item.text;
    card.append(marker, year, title, text); $("timeline-list").append(card);
  });

  // Five-question quiz with instant feedback and a restart screen.
  let quizIndex = 0, score = 0, answered = false, finished = false;
  const renderQuiz = () => {
    answered = false; finished = false; $("quiz-feedback").textContent = ""; $("quiz-feedback").className = "quiz-feedback";
    $("quiz-next").disabled = true; $("quiz-next").textContent = quizIndex === QUIZ.length - 1 ? "See my score" : "Next question";
    $("quiz-progress").textContent = "Question " + (quizIndex + 1) + " of " + QUIZ.length;
    $("quiz-progress-fill").style.width = (quizIndex / QUIZ.length * 100) + "%";
    const q = QUIZ[quizIndex], host = $("quiz-content"); host.replaceChildren();
    const heading = document.createElement("h3"); heading.className = "quiz-question"; heading.textContent = q.question;
    const options = document.createElement("div"); options.className = "quiz-options";
    q.options.forEach((option, optionIndex) => {
      const choice = document.createElement("button"); choice.type = "button"; choice.className = "quiz-option"; choice.textContent = option;
      choice.addEventListener("click", () => {
        if (answered) return; answered = true;
        const correct = optionIndex === q.answerIndex; if (correct) score++;
        [...options.children].forEach((button, i) => { button.disabled = true; if (i === q.answerIndex) button.classList.add("correct"); else if (i === optionIndex) button.classList.add("incorrect"); });
        $("quiz-feedback").textContent = (correct ? "That's right! " : "Not quite! ") + (q.funFact || "");
        $("quiz-feedback").classList.add(correct ? "is-correct" : "is-incorrect"); $("quiz-next").disabled = false;
      });
      options.append(choice);
    });
    host.append(heading, options);
  };
  const renderScore = () => {
    finished = true; $("quiz-progress").textContent = "All done"; $("quiz-progress-fill").style.width = "100%"; $("quiz-content").replaceChildren();
    const title = document.createElement("h3"); title.className = "quiz-question score-title"; title.textContent = "You scored " + score + " out of " + QUIZ.length + ".";
    const note = document.createElement("p"); note.className = "score-note";
    note.textContent = score === QUIZ.length ? "Full marks! You know Muna very well." : score >= Math.ceil(QUIZ.length / 2) ? "Not bad at all. You clearly know him pretty well." : "Looks like it's time for a few more family conversations.";
    $("quiz-content").append(title, note); $("quiz-feedback").textContent = "Thanks for playing. The real prize is getting to celebrate him.";
    $("quiz-next").disabled = false; $("quiz-next").textContent = "Try again";
  };
  $("quiz-next").addEventListener("click", () => {
    if (finished) { quizIndex = 0; score = 0; renderQuiz(); }
    else if (answered && quizIndex < QUIZ.length - 1) { quizIndex++; renderQuiz(); }
    else if (answered) renderScore();
  });
  renderQuiz();

  // Family wishes and optional Google Form button.
  WISHES.forEach((wish, index) => {
    const card = document.createElement("article"); card.className = "wish-card wish-" + ((index % 3) + 1) + " reveal";
    const message = document.createElement("p"); message.textContent = "“" + wish.message + "”";
    const name = document.createElement("p"); name.className = "wish-name"; name.textContent = "— " + wish.name;
    card.append(message, name); $("wishes-grid").append(card);
  });
  if (WISH_FORM_URL.trim()) { $("wish-form-button").href = WISH_FORM_URL; $("wish-form-button").hidden = false; }

  // Music is optional and never autoplays. Hide the toggle if no file exists.
  const music = $("background-music"), musicButton = $("music-toggle");
  music.src = MUSIC_FILE; music.load();
  music.addEventListener("canplay", () => { musicButton.hidden = false; }, { once: true });
  music.addEventListener("error", () => { musicButton.hidden = true; }, { once: true });
  musicButton.addEventListener("click", async () => {
    if (music.paused) { try { await music.play(); musicButton.textContent = "♪ Music: on"; } catch { musicButton.textContent = "♪ Music unavailable"; } }
    else { music.pause(); musicButton.textContent = "♪ Music: off"; }
  });

  // Share the live page through the phone's share sheet or WhatsApp Web.
  $("share-button").addEventListener("click", async () => {
    const share = { title: "A little something for " + DAD_NAME, text: "A birthday page made with love for " + DAD_NAME + " ♥", url: window.location.href };
    if (navigator.share) { try { await navigator.share(share); } catch { /* The share sheet was dismissed. */ } }
    else window.open("https://wa.me/?text=" + encodeURIComponent(share.text + " " + share.url), "_blank", "noopener,noreferrer");
  });

  // Fade items in on scroll unless reduced motion is enabled.
  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) revealItems.forEach((item) => item.classList.add("is-visible"));
  else {
    const observer = new IntersectionObserver((entries, activeObserver) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); activeObserver.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  }
});
