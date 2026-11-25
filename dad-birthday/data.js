// Personalise the birthday page here. You can edit this file without changing the HTML or CSS.

// Replace with your father's full name, nickname, or the way your family addresses him.
const DAD_NAME = "Byomakesh (Muna)";

// Replace with your name or the name you want shown at the bottom of the page.
const MY_NAME = "Your Family";

// Replace with a short line that sounds like something your family would say.
const INTRO_LINE = "A little page, made just for you";

// Replace with your own birthday message. Keep it personal and natural.
const BIRTHDAY_MESSAGE = "Thank you for all the things you do, big and small. We hope today brings you the same happiness you bring to everyone around you.";

// Replace with a personal note for the section below the opening screen.
const NOTE_MESSAGE = "This page is a small way of saying thank you. For the advice, the laughs, the everyday things, and the memories we keep making. We love you, and we're very glad we get to celebrate you.";

// Replace the six photo filenames with your own. Put the matching photos in the images folder.
// The page will show a friendly placeholder until each image file is added.
const PHOTOS = [
  { src: "images/photo1.jpg", caption: "One of those days we'll always remember.", alt: "Family memory, photo 1" },
  { src: "images/photo2.jpg", caption: "A moment that still makes us smile.", alt: "Family memory, photo 2" },
  { src: "images/photo3.jpg", caption: "The people, the place, the feeling.", alt: "Family memory, photo 3" },
  { src: "images/photo4.jpg", caption: "A little piece of our story.", alt: "Family memory, photo 4" },
  { src: "images/photo5.jpg", caption: "One for the family album.", alt: "Family memory, photo 5" },
  { src: "images/photo6.jpg", caption: "More memories still to come.", alt: "Family memory, photo 6" }
];

// Replace these with real things you love or admire about Dad. A little family humour is welcome.
const REASONS = [
  { emoji: "☕", text: "You somehow make an ordinary day feel a little better." },
  { emoji: "🧡", text: "You show up for the people you love, in ways both big and small." },
  { emoji: "😄", text: "Your jokes are sometimes questionable. We laugh anyway." },
  { emoji: "🛠️", text: "You always find a way to fix things — or at least give it a try." },
  { emoji: "🏡", text: "You make home feel like home." },
  { emoji: "🍽️", text: "You have very strong opinions about good food." },
  { emoji: "💬", text: "Your advice stays with us long after the conversation ends." },
  { emoji: "❤️", text: "Most of all, you're our Dad. That's reason enough." }
];

// Replace this with a private joke, a family memory, or a message you have not said out loud yet.
const SURPRISE_MESSAGE = "Muna, thank you for being you. We may not say it every day, but we're lucky to have you. Happy birthday — we love you!";

// Replace the sample milestones with meaningful years and events from his life.
const TIMELINE = [
  { year: "The beginning", title: "A story starts", text: "Add a favourite memory from his early years here." },
  { year: "A new chapter", title: "Big steps and new beginnings", text: "Add an important moment, achievement, or turning point." },
  { year: "Family days", title: "The family grows", text: "Add a memory that means a lot to your family." },
  { year: "Along the way", title: "A moment we still talk about", text: "Add a funny story, trip, celebration, or everyday memory." },
  { year: "Today", title: "Still making memories", text: "And there are many more good days still ahead." }
];

// Replace the questions, choices, answerIndex (0–3), and funFact with facts your family knows.
const QUIZ = [
  { question: "Which food would Dad happily choose?", options: ["His favourite home-cooked meal", "Something spicy", "A sweet treat", "Anything served with love"], answerIndex: 0, funFact: "Replace this with the story behind his real favourite food." },
  { question: "What is Dad most likely to say?", options: ["Have you eaten?", "Switch off the lights", "Let me check", "All of the above"], answerIndex: 3, funFact: "Every family has a few classic Dad lines. Add one here." },
  { question: "What is his perfect kind of day?", options: ["A peaceful day at home", "A family outing", "Meeting old friends", "A little bit of everything"], answerIndex: 3, funFact: "Replace this with what he really enjoys doing." },
  { question: "What is Dad secretly very good at?", options: ["Giving advice", "Finding things nobody else can find", "Making people laugh", "All three"], answerIndex: 3, funFact: "You know the answer. Add a real example here." },
  { question: "What matters most to Dad?", options: ["Family time", "Good food", "A little peace and quiet", "All of these"], answerIndex: 3, funFact: "The people who know him best will know this one." }
];

// Add family messages here. Replace the sample names and text with real wishes.
const WISHES = [
  { name: "Your family", message: "Wishing you good health, happy days, and plenty of reasons to smile. We love you!" },
  { name: "Someone who loves you", message: "Thank you for all the little things that mean more than words can say. Have the happiest birthday." },
  { name: "All of us", message: "Here's to more stories, more laughter, and many more birthdays together." }
];

// Optional: paste a Google Form URL here. Leave empty to keep the button hidden.
const WISH_FORM_URL = "";

// Optional: add audio/song.mp3 to the audio folder. The music toggle stays hidden if the file is missing.
const MUSIC_FILE = "audio/song.mp3";
