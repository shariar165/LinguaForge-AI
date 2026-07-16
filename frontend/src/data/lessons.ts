// Relative import so the seed script (run outside Next.js) can resolve it too.
import type { Lesson } from "../lib/types";

/**
 * Seed lesson content for LinguaVerse AI (English course, units 1-3).
 * Lessons are stored in Supabase; this module is the source of truth used by
 * `npm run seed`. Adding a lesson here and re-running the seed is all it takes
 * to publish new content.
 */
export const lessons: Lesson[] = [
  // ============================ UNIT 1 — FIRST STEPS ============================
  {
    id: "u1-l1-greetings",
    unit: 1,
    unit_title: "First Steps",
    level: "A1",
    order: 1,
    title: "Greetings & Introductions",
    description: "Say hello, introduce yourself, and ask someone's name.",
    xp_reward: 20,
    content: {
      vocabulary: [
        {
          word: "hello",
          ipa: "/həˈloʊ/",
          syllables: "hel·lo",
          definition: "A word you say when you meet someone.",
          example: "Hello! My name is Sara.",
        },
        {
          word: "morning",
          ipa: "/ˈmɔːr.nɪŋ/",
          syllables: "morn·ing",
          definition: "The early part of the day, before noon.",
          example: "Good morning! Did you sleep well?",
        },
        {
          word: "name",
          ipa: "/neɪm/",
          syllables: "name",
          definition: "The word people call you.",
          example: "My name is David.",
        },
        {
          word: "meet",
          ipa: "/miːt/",
          syllables: "meet",
          definition: "To see and speak to someone for the first time.",
          example: "Nice to meet you!",
        },
        {
          word: "friend",
          ipa: "/frend/",
          syllables: "friend",
          definition: "A person you like and know well.",
          example: "This is my friend Anna.",
        },
      ],
      grammar: {
        title: "The verb 'to be' (I am / you are)",
        explanation:
          "Use 'am' with I, 'are' with you, and 'is' with he, she, or it. We often make short forms: I am → I'm, you are → you're.",
        examples: [
          { text: "I am a student.", note: "Short form: I'm a student." },
          { text: "You are my friend.", note: "Short form: You're my friend." },
          { text: "She is a teacher.", note: "Short form: She's a teacher." },
        ],
      },
      listening: {
        title: "Meeting someone new",
        text:
          "Good morning! My name is Emma. I am a student. Nice to meet you. This is my friend Tom. He is a teacher.",
        questions: [
          {
            question: "What is the woman's name?",
            options: ["Anna", "Emma", "Sara", "Maria"],
            answerIndex: 1,
            explanation: "She says: 'My name is Emma.'",
          },
          {
            question: "Who is Tom?",
            options: ["Her brother", "Her student", "Her friend", "Her father"],
            answerIndex: 2,
            explanation: "She says: 'This is my friend Tom.'",
          },
        ],
      },
      quiz: [
        {
          question: "Choose the correct sentence.",
          options: ["I is a student.", "I am a student.", "I are a student.", "I be a student."],
          answerIndex: 1,
          explanation: "Use 'am' with 'I': I am a student.",
        },
        {
          question: "What do you say when you meet someone for the first time?",
          options: ["Goodbye!", "Nice to meet you!", "See you later!", "You're welcome!"],
          answerIndex: 1,
          explanation: "'Nice to meet you' is the polite phrase for a first meeting.",
        },
        {
          question: "Complete: 'Good ______! Did you sleep well?'",
          options: ["night", "morning", "name", "friend"],
          answerIndex: 1,
          explanation: "'Good morning' is the greeting for the early part of the day.",
        },
        {
          question: "Complete: 'You ______ my friend.'",
          options: ["is", "am", "are", "be"],
          answerIndex: 2,
          explanation: "Use 'are' with 'you': You are my friend.",
        },
        {
          question: "Which short form is correct?",
          options: ["I'm = I am", "I'm = I is", "You're = you is", "She's = she am"],
          answerIndex: 0,
          explanation: "I'm is the short form of 'I am'.",
        },
      ],
      speaking: {
        sentences: [
          "Hello, my name is Anna.",
          "Nice to meet you.",
          "Good morning, how are you?",
        ],
      },
    },
  },
  {
    id: "u1-l2-numbers",
    unit: 1,
    unit_title: "First Steps",
    level: "A1",
    order: 2,
    title: "Numbers & Age",
    description: "Count from one to twenty and talk about age.",
    xp_reward: 20,
    content: {
      vocabulary: [
        {
          word: "three",
          ipa: "/θriː/",
          syllables: "three",
          definition: "The number 3.",
          example: "I have three brothers.",
        },
        {
          word: "seven",
          ipa: "/ˈsev.ən/",
          syllables: "sev·en",
          definition: "The number 7.",
          example: "The shop opens at seven.",
        },
        {
          word: "twelve",
          ipa: "/twelv/",
          syllables: "twelve",
          definition: "The number 12.",
          example: "There are twelve months in a year.",
        },
        {
          word: "twenty",
          ipa: "/ˈtwen.ti/",
          syllables: "twen·ty",
          definition: "The number 20.",
          example: "She is twenty years old.",
        },
        {
          word: "old",
          ipa: "/oʊld/",
          syllables: "old",
          definition: "Used to talk about age: 'years old'.",
          example: "How old are you?",
        },
      ],
      grammar: {
        title: "Asking and telling age",
        explanation:
          "To ask about age, say 'How old are you?'. To answer, say 'I am ... years old.' You can drop 'years old' in casual speech: 'I'm nineteen.'",
        examples: [
          { text: "How old are you?" },
          { text: "I am nineteen years old.", note: "Casual: I'm nineteen." },
          { text: "My sister is twelve." },
        ],
      },
      listening: {
        title: "A birthday",
        text:
          "Today is my birthday. I am twenty years old now. My brother is seventeen. My sister is only twelve. We eat cake at seven in the evening.",
        questions: [
          {
            question: "How old is the speaker now?",
            options: ["Twelve", "Seventeen", "Twenty", "Seven"],
            answerIndex: 2,
            explanation: "They say: 'I am twenty years old now.'",
          },
          {
            question: "When do they eat cake?",
            options: ["At twelve", "At seven in the evening", "In the morning", "At five"],
            answerIndex: 1,
            explanation: "They say: 'We eat cake at seven in the evening.'",
          },
        ],
      },
      quiz: [
        {
          question: "Which question asks about age?",
          options: ["How are you?", "How old are you?", "What is your name?", "Where are you?"],
          answerIndex: 1,
          explanation: "'How old are you?' asks about a person's age.",
        },
        {
          question: "What number is 'twelve'?",
          options: ["2", "12", "20", "7"],
          answerIndex: 1,
          explanation: "Twelve = 12.",
        },
        {
          question: "Complete: 'I am nineteen ______ old.'",
          options: ["year", "years", "age", "old"],
          answerIndex: 1,
          explanation: "We say 'years old' with a plural 's'.",
        },
        {
          question: "Which is the correct order counting up?",
          options: [
            "three, seven, twelve, twenty",
            "seven, three, twenty, twelve",
            "twelve, twenty, three, seven",
            "twenty, twelve, seven, three",
          ],
          answerIndex: 0,
          explanation: "3 → 7 → 12 → 20.",
        },
        {
          question: "Complete: 'My sister ______ twelve.'",
          options: ["am", "are", "is", "be"],
          answerIndex: 2,
          explanation: "Use 'is' with he, she, or it: My sister is twelve.",
        },
      ],
      speaking: {
        sentences: [
          "How old are you?",
          "I am twenty years old.",
          "There are twelve months in a year.",
        ],
      },
    },
  },
  {
    id: "u1-l3-family",
    unit: 1,
    unit_title: "First Steps",
    level: "A1",
    order: 3,
    title: "Family",
    description: "Talk about your family members.",
    xp_reward: 20,
    content: {
      vocabulary: [
        {
          word: "mother",
          ipa: "/ˈmʌð.ər/",
          syllables: "moth·er",
          definition: "A female parent.",
          example: "My mother cooks dinner every day.",
        },
        {
          word: "father",
          ipa: "/ˈfɑː.ðər/",
          syllables: "fa·ther",
          definition: "A male parent.",
          example: "My father works in a bank.",
        },
        {
          word: "brother",
          ipa: "/ˈbrʌð.ər/",
          syllables: "broth·er",
          definition: "A boy or man with the same parents as you.",
          example: "My brother plays football.",
        },
        {
          word: "sister",
          ipa: "/ˈsɪs.tər/",
          syllables: "sis·ter",
          definition: "A girl or woman with the same parents as you.",
          example: "My sister loves music.",
        },
        {
          word: "parents",
          ipa: "/ˈper.ənts/",
          syllables: "par·ents",
          definition: "Your mother and father together.",
          example: "My parents live in Dhaka.",
        },
      ],
      grammar: {
        title: "Possessives: my, your, his, her",
        explanation:
          "Possessive words show who something belongs to. Use 'my' for yourself, 'your' for the listener, 'his' for a man, and 'her' for a woman.",
        examples: [
          { text: "My mother is a doctor." },
          { text: "Is this your brother?" },
          { text: "His sister is very kind.", note: "'His' because we talk about a man's sister." },
        ],
      },
      listening: {
        title: "My family",
        text:
          "This is a photo of my family. My father is tall. My mother has short hair. My brother is ten years old, and my sister is a student. I love my parents very much.",
        questions: [
          {
            question: "How old is the brother?",
            options: ["Seven", "Ten", "Twelve", "Twenty"],
            answerIndex: 1,
            explanation: "They say: 'My brother is ten years old.'",
          },
          {
            question: "Who has short hair?",
            options: ["The father", "The sister", "The mother", "The brother"],
            answerIndex: 2,
            explanation: "They say: 'My mother has short hair.'",
          },
        ],
      },
      quiz: [
        {
          question: "Your mother and father together are your ______.",
          options: ["brothers", "friends", "parents", "sisters"],
          answerIndex: 2,
          explanation: "'Parents' means mother and father.",
        },
        {
          question: "Complete: '______ sister is very kind.' (talking about a man)",
          options: ["Her", "His", "My", "Your"],
          answerIndex: 1,
          explanation: "Use 'his' for something that belongs to a man.",
        },
        {
          question: "Which word means a female parent?",
          options: ["father", "brother", "mother", "sister"],
          answerIndex: 2,
          explanation: "A mother is a female parent.",
        },
        {
          question: "Complete: 'Is this ______ brother?' (asking the listener)",
          options: ["my", "his", "her", "your"],
          answerIndex: 3,
          explanation: "Use 'your' when talking about the listener.",
        },
        {
          question: "Choose the correct sentence.",
          options: [
            "My brother play football.",
            "My brother plays football.",
            "My brother playing football.",
            "My brothers plays football.",
          ],
          answerIndex: 1,
          explanation: "With he/she/it, add -s to the verb: he plays.",
        },
      ],
      speaking: {
        sentences: [
          "My mother cooks dinner every day.",
          "My brother plays football.",
          "I love my parents very much.",
        ],
      },
    },
  },

  // ============================ UNIT 2 — EVERYDAY LIFE ============================
  {
    id: "u2-l1-food",
    unit: 2,
    unit_title: "Everyday Life",
    level: "A1",
    order: 1,
    title: "Food & Drinks",
    description: "Order food, talk about meals, and say what you like.",
    xp_reward: 20,
    content: {
      vocabulary: [
        {
          word: "breakfast",
          ipa: "/ˈbrek.fəst/",
          syllables: "break·fast",
          definition: "The first meal of the day.",
          example: "I eat eggs for breakfast.",
        },
        {
          word: "water",
          ipa: "/ˈwɔː.tər/",
          syllables: "wa·ter",
          definition: "A clear liquid that we drink.",
          example: "Can I have a glass of water, please?",
        },
        {
          word: "rice",
          ipa: "/raɪs/",
          syllables: "rice",
          definition: "Small white or brown grains that people cook and eat.",
          example: "We eat rice with fish.",
        },
        {
          word: "delicious",
          ipa: "/dɪˈlɪʃ.əs/",
          syllables: "de·li·cious",
          definition: "Very good to eat or drink.",
          example: "This soup is delicious!",
        },
        {
          word: "hungry",
          ipa: "/ˈhʌŋ.ɡri/",
          syllables: "hun·gry",
          definition: "Wanting to eat.",
          example: "I am hungry. Let's have lunch.",
        },
      ],
      grammar: {
        title: "I like / I don't like",
        explanation:
          "Use 'like' + noun to talk about things you enjoy. For the negative, use 'don't like'. With he/she, use 'likes' and 'doesn't like'.",
        examples: [
          { text: "I like mangoes." },
          { text: "I don't like cold coffee." },
          { text: "She likes tea, but she doesn't like milk." },
        ],
      },
      listening: {
        title: "At a café",
        text:
          "Good afternoon! I am very hungry. I would like rice with chicken, please. And a glass of water. My friend likes tea. The food here is delicious.",
        questions: [
          {
            question: "What does the speaker order to drink?",
            options: ["Tea", "Coffee", "A glass of water", "Juice"],
            answerIndex: 2,
            explanation: "They say: 'And a glass of water.'",
          },
          {
            question: "What does the friend like?",
            options: ["Coffee", "Tea", "Milk", "Water"],
            answerIndex: 1,
            explanation: "They say: 'My friend likes tea.'",
          },
        ],
      },
      quiz: [
        {
          question: "The first meal of the day is ______.",
          options: ["dinner", "lunch", "breakfast", "snack"],
          answerIndex: 2,
          explanation: "Breakfast is the morning meal.",
        },
        {
          question: "Complete: 'She ______ tea.'",
          options: ["like", "likes", "liking", "is like"],
          answerIndex: 1,
          explanation: "With she, add -s: she likes.",
        },
        {
          question: "Which word means 'very good to eat'?",
          options: ["hungry", "delicious", "cold", "big"],
          answerIndex: 1,
          explanation: "'Delicious' describes food that tastes very good.",
        },
        {
          question: "Complete: 'I ______ like cold coffee.'",
          options: ["don't", "doesn't", "am not", "no"],
          answerIndex: 0,
          explanation: "With 'I', the negative is 'don't like'.",
        },
        {
          question: "What is a polite way to order?",
          options: [
            "Give me rice.",
            "Rice. Now.",
            "I would like rice, please.",
            "You bring rice.",
          ],
          answerIndex: 2,
          explanation: "'I would like ..., please' is the polite form.",
        },
      ],
      speaking: {
        sentences: [
          "I would like rice with chicken, please.",
          "This soup is delicious.",
          "Can I have a glass of water, please?",
        ],
      },
    },
  },
  {
    id: "u2-l2-routines",
    unit: 2,
    unit_title: "Everyday Life",
    level: "A1",
    order: 2,
    title: "Daily Routines",
    description: "Describe your day from morning to night.",
    xp_reward: 20,
    content: {
      vocabulary: [
        {
          word: "wake up",
          ipa: "/weɪk ʌp/",
          syllables: "wake up",
          definition: "To stop sleeping.",
          example: "I wake up at six every day.",
        },
        {
          word: "shower",
          ipa: "/ˈʃaʊ.ər/",
          syllables: "show·er",
          definition: "Washing your body under falling water.",
          example: "He takes a shower in the morning.",
        },
        {
          word: "work",
          ipa: "/wɜːrk/",
          syllables: "work",
          definition: "A job; the place or activity you do to earn money.",
          example: "She goes to work by bus.",
        },
        {
          word: "study",
          ipa: "/ˈstʌd.i/",
          syllables: "stud·y",
          definition: "To learn about something.",
          example: "I study English in the evening.",
        },
        {
          word: "sleep",
          ipa: "/sliːp/",
          syllables: "sleep",
          definition: "To rest with your eyes closed at night.",
          example: "I sleep eight hours every night.",
        },
      ],
      grammar: {
        title: "Present simple for routines",
        explanation:
          "Use the present simple for things you do regularly. Add time words like 'every day', 'usually', or 'at seven'. Remember: with he/she/it the verb gets -s.",
        examples: [
          { text: "I wake up at six every day." },
          { text: "She takes a shower at seven." },
          { text: "We study English in the evening." },
        ],
      },
      listening: {
        title: "Rina's day",
        text:
          "Rina wakes up at six in the morning. She takes a shower and eats breakfast. She goes to work by bus. In the evening, she studies English for one hour. She sleeps at eleven.",
        questions: [
          {
            question: "How does Rina go to work?",
            options: ["By car", "By bus", "By train", "On foot"],
            answerIndex: 1,
            explanation: "The text says: 'She goes to work by bus.'",
          },
          {
            question: "How long does she study English?",
            options: ["Two hours", "Thirty minutes", "One hour", "All evening"],
            answerIndex: 2,
            explanation: "The text says: 'she studies English for one hour.'",
          },
        ],
      },
      quiz: [
        {
          question: "Complete: 'I ______ up at six every day.'",
          options: ["wake", "wakes", "waking", "woke"],
          answerIndex: 0,
          explanation: "With 'I', use the base form: I wake up.",
        },
        {
          question: "Complete: 'She ______ a shower at seven.'",
          options: ["take", "takes", "taking", "is take"],
          answerIndex: 1,
          explanation: "With she, add -s: she takes.",
        },
        {
          question: "Which word means 'to stop sleeping'?",
          options: ["sleep", "study", "wake up", "work"],
          answerIndex: 2,
          explanation: "'Wake up' means to stop sleeping.",
        },
        {
          question: "Choose the correct sentence.",
          options: [
            "We studies English in the evening.",
            "We study English in the evening.",
            "We studying English in the evening.",
            "We is study English in the evening.",
          ],
          answerIndex: 1,
          explanation: "With 'we', use the base form: we study.",
        },
        {
          question: "Which time word fits a routine?",
          options: ["yesterday", "right now", "every day", "last week"],
          answerIndex: 2,
          explanation: "'Every day' shows a repeated routine — perfect for present simple.",
        },
      ],
      speaking: {
        sentences: [
          "I wake up at six every day.",
          "She goes to work by bus.",
          "I study English in the evening.",
        ],
      },
    },
  },
  {
    id: "u2-l3-town",
    unit: 2,
    unit_title: "Everyday Life",
    level: "A1",
    order: 3,
    title: "Around Town",
    description: "Name places in a city and say where things are.",
    xp_reward: 20,
    content: {
      vocabulary: [
        {
          word: "hospital",
          ipa: "/ˈhɑː.spɪ.təl/",
          syllables: "hos·pi·tal",
          definition: "A place where sick people get help from doctors.",
          example: "The hospital is next to the park.",
        },
        {
          word: "market",
          ipa: "/ˈmɑːr.kɪt/",
          syllables: "mar·ket",
          definition: "A place where people buy and sell things.",
          example: "We buy vegetables at the market.",
        },
        {
          word: "school",
          ipa: "/skuːl/",
          syllables: "school",
          definition: "A place where children learn.",
          example: "The school is near my house.",
        },
        {
          word: "park",
          ipa: "/pɑːrk/",
          syllables: "park",
          definition: "An open green place in a city where people walk and relax.",
          example: "We play in the park on Fridays.",
        },
        {
          word: "near",
          ipa: "/nɪr/",
          syllables: "near",
          definition: "Close to; not far from.",
          example: "The bank is near the market.",
        },
      ],
      grammar: {
        title: "There is / There are + prepositions of place",
        explanation:
          "Use 'there is' for one thing and 'there are' for more than one. Use 'in', 'on', 'next to', and 'near' to say where things are.",
        examples: [
          { text: "There is a park near my house." },
          { text: "There are two markets in this town." },
          { text: "The hospital is next to the school." },
        ],
      },
      listening: {
        title: "My neighborhood",
        text:
          "I live in a small town. There is a big park near my house. There are two markets on my street. The school is next to the park, and the hospital is near the bus station.",
        questions: [
          {
            question: "How many markets are on the street?",
            options: ["One", "Two", "Three", "None"],
            answerIndex: 1,
            explanation: "The text says: 'There are two markets on my street.'",
          },
          {
            question: "Where is the school?",
            options: [
              "Near the bus station",
              "Next to the hospital",
              "Next to the park",
              "On the street",
            ],
            answerIndex: 2,
            explanation: "The text says: 'The school is next to the park.'",
          },
        ],
      },
      quiz: [
        {
          question: "Complete: 'There ______ a park near my house.'",
          options: ["are", "is", "am", "be"],
          answerIndex: 1,
          explanation: "One park → 'there is'.",
        },
        {
          question: "Complete: 'There ______ two markets in this town.'",
          options: ["is", "am", "are", "was"],
          answerIndex: 2,
          explanation: "Two markets → 'there are'.",
        },
        {
          question: "Where do sick people go?",
          options: ["The market", "The park", "The school", "The hospital"],
          answerIndex: 3,
          explanation: "People go to the hospital when they are sick.",
        },
        {
          question: "Which word means 'close to'?",
          options: ["far", "near", "big", "next"],
          answerIndex: 1,
          explanation: "'Near' means close to something.",
        },
        {
          question: "Choose the correct sentence.",
          options: [
            "The bank are near the market.",
            "The bank is near the market.",
            "The bank near is the market.",
            "The bank be near the market.",
          ],
          answerIndex: 1,
          explanation: "One bank → 'is': The bank is near the market.",
        },
      ],
      speaking: {
        sentences: [
          "There is a big park near my house.",
          "We buy vegetables at the market.",
          "The hospital is next to the school.",
        ],
      },
    },
  },

  // ============================ UNIT 3 — GETTING COMFORTABLE ============================
  {
    id: "u3-l1-shopping",
    unit: 3,
    unit_title: "Getting Comfortable",
    level: "A2",
    order: 1,
    title: "Shopping",
    description: "Ask about prices, sizes, and pay for things.",
    xp_reward: 25,
    content: {
      vocabulary: [
        {
          word: "expensive",
          ipa: "/ɪkˈspen.sɪv/",
          syllables: "ex·pen·sive",
          definition: "Costing a lot of money.",
          example: "This jacket is too expensive for me.",
        },
        {
          word: "cheap",
          ipa: "/tʃiːp/",
          syllables: "cheap",
          definition: "Costing little money.",
          example: "The vegetables here are very cheap.",
        },
        {
          word: "price",
          ipa: "/praɪs/",
          syllables: "price",
          definition: "The amount of money something costs.",
          example: "What is the price of this shirt?",
        },
        {
          word: "size",
          ipa: "/saɪz/",
          syllables: "size",
          definition: "How big or small something is.",
          example: "Do you have this in a smaller size?",
        },
        {
          word: "discount",
          ipa: "/ˈdɪs.kaʊnt/",
          syllables: "dis·count",
          definition: "A lower price than usual.",
          example: "There is a twenty percent discount today.",
        },
      ],
      grammar: {
        title: "How much...? and comparatives",
        explanation:
          "Ask 'How much is/are...?' for prices. To compare things, add -er to short adjectives: cheap → cheaper. For long adjectives, use 'more': more expensive.",
        examples: [
          { text: "How much is this shirt?" },
          { text: "This shop is cheaper than the market." },
          { text: "The blue jacket is more expensive than the black one." },
        ],
      },
      listening: {
        title: "Buying a shirt",
        text:
          "Excuse me, how much is this shirt? It is five hundred taka. That is a little expensive. Do you have a cheaper one? Yes, this one is three hundred taka, and today there is a ten percent discount.",
        questions: [
          {
            question: "How much is the first shirt?",
            options: ["Three hundred taka", "Five hundred taka", "Ten taka", "One hundred taka"],
            answerIndex: 1,
            explanation: "The seller says: 'It is five hundred taka.'",
          },
          {
            question: "What discount is there today?",
            options: ["Twenty percent", "No discount", "Ten percent", "Fifty percent"],
            answerIndex: 2,
            explanation: "The seller says: 'there is a ten percent discount.'",
          },
        ],
      },
      quiz: [
        {
          question: "Which question asks about a price?",
          options: [
            "How old is this shirt?",
            "How much is this shirt?",
            "Where is this shirt?",
            "Whose shirt is this?",
          ],
          answerIndex: 1,
          explanation: "'How much is...?' asks about the price.",
        },
        {
          question: "The opposite of 'expensive' is ______.",
          options: ["big", "cheap", "small", "new"],
          answerIndex: 1,
          explanation: "Cheap means costing little money.",
        },
        {
          question: "Complete: 'This shop is ______ than the market.'",
          options: ["cheap", "cheapest", "cheaper", "more cheap"],
          answerIndex: 2,
          explanation: "Short adjective + -er: cheaper than.",
        },
        {
          question: "Complete: 'The blue jacket is ______ expensive than the black one.'",
          options: ["much", "more", "most", "very"],
          answerIndex: 1,
          explanation: "Long adjectives use 'more': more expensive.",
        },
        {
          question: "A lower price than usual is a ______.",
          options: ["size", "discount", "receipt", "market"],
          answerIndex: 1,
          explanation: "A discount is a reduction in price.",
        },
      ],
      speaking: {
        sentences: [
          "How much is this shirt?",
          "Do you have this in a smaller size?",
          "This jacket is too expensive for me.",
        ],
      },
    },
  },
  {
    id: "u3-l2-directions",
    unit: 3,
    unit_title: "Getting Comfortable",
    level: "A2",
    order: 2,
    title: "Travel & Directions",
    description: "Ask for and give directions in a city.",
    xp_reward: 25,
    content: {
      vocabulary: [
        {
          word: "straight",
          ipa: "/streɪt/",
          syllables: "straight",
          definition: "In one direction, without turning.",
          example: "Go straight for two blocks.",
        },
        {
          word: "turn",
          ipa: "/tɜːrn/",
          syllables: "turn",
          definition: "To change direction.",
          example: "Turn left at the bank.",
        },
        {
          word: "corner",
          ipa: "/ˈkɔːr.nər/",
          syllables: "cor·ner",
          definition: "The place where two streets meet.",
          example: "The pharmacy is on the corner.",
        },
        {
          word: "station",
          ipa: "/ˈsteɪ.ʃən/",
          syllables: "sta·tion",
          definition: "A place where buses or trains stop.",
          example: "The train station is ten minutes away.",
        },
        {
          word: "across",
          ipa: "/əˈkrɑːs/",
          syllables: "a·cross",
          definition: "On the other side of.",
          example: "The café is across from the park.",
        },
      ],
      grammar: {
        title: "Imperatives for directions",
        explanation:
          "To give directions, use the base verb with no subject: 'Go straight', 'Turn left', 'Take the second street'. For negatives, use 'Don't': 'Don't turn here.'",
        examples: [
          { text: "Go straight and turn right at the corner." },
          { text: "Take the first street on the left." },
          { text: "Don't cross the bridge." },
        ],
      },
      listening: {
        title: "Finding the station",
        text:
          "Excuse me, where is the train station? Go straight for two blocks, then turn left at the corner. The station is across from a big market. It is about ten minutes on foot.",
        questions: [
          {
            question: "Where should you turn left?",
            options: ["At the market", "At the corner", "At the station", "At the bridge"],
            answerIndex: 1,
            explanation: "The directions say: 'turn left at the corner.'",
          },
          {
            question: "What is across from the station?",
            options: ["A park", "A school", "A big market", "A bank"],
            answerIndex: 2,
            explanation: "The text says: 'The station is across from a big market.'",
          },
        ],
      },
      quiz: [
        {
          question: "Complete: '______ straight for two blocks.'",
          options: ["Going", "Goes", "Go", "Went"],
          answerIndex: 2,
          explanation: "Imperatives use the base verb: Go straight.",
        },
        {
          question: "The place where two streets meet is a ______.",
          options: ["station", "corner", "block", "bridge"],
          answerIndex: 1,
          explanation: "A corner is where two streets meet.",
        },
        {
          question: "Complete: '______ turn here — it's a one-way street.'",
          options: ["No", "Not", "Don't", "Doesn't"],
          answerIndex: 2,
          explanation: "Negative imperative: Don't turn here.",
        },
        {
          question: "'The café is across from the park' means...",
          options: [
            "The café is inside the park.",
            "The café is on the other side of the street from the park.",
            "The café is far from the park.",
            "The café is behind the park.",
          ],
          answerIndex: 1,
          explanation: "'Across from' means on the opposite side.",
        },
        {
          question: "Where do trains stop?",
          options: ["At the corner", "At the station", "At the market", "At the park"],
          answerIndex: 1,
          explanation: "Trains stop at a station.",
        },
      ],
      speaking: {
        sentences: [
          "Excuse me, where is the train station?",
          "Go straight and turn right at the corner.",
          "The café is across from the park.",
        ],
      },
    },
  },
  {
    id: "u3-l3-weather",
    unit: 3,
    unit_title: "Getting Comfortable",
    level: "A2",
    order: 3,
    title: "Weather & Small Talk",
    description: "Talk about the weather and make friendly conversation.",
    xp_reward: 25,
    content: {
      vocabulary: [
        {
          word: "sunny",
          ipa: "/ˈsʌn.i/",
          syllables: "sun·ny",
          definition: "Bright with sunshine.",
          example: "It is sunny today — let's go outside.",
        },
        {
          word: "rainy",
          ipa: "/ˈreɪ.ni/",
          syllables: "rain·y",
          definition: "With a lot of rain.",
          example: "Take an umbrella; it's a rainy day.",
        },
        {
          word: "cloudy",
          ipa: "/ˈklaʊ.di/",
          syllables: "cloud·y",
          definition: "With many clouds in the sky.",
          example: "The sky is cloudy this morning.",
        },
        {
          word: "warm",
          ipa: "/wɔːrm/",
          syllables: "warm",
          definition: "A little hot, in a pleasant way.",
          example: "The weather is warm in spring.",
        },
        {
          word: "forecast",
          ipa: "/ˈfɔːr.kæst/",
          syllables: "fore·cast",
          definition: "A report that says what the weather will be.",
          example: "The forecast says rain tomorrow.",
        },
      ],
      grammar: {
        title: "Talking about now: present continuous",
        explanation:
          "Use am/is/are + verb-ing for things happening right now: 'It is raining.' Compare with present simple for general facts: 'It rains a lot in July.'",
        examples: [
          { text: "It is raining right now.", note: "Happening at this moment." },
          { text: "It rains a lot in July.", note: "A general fact." },
          { text: "The sun is shining and we are walking in the park." },
        ],
      },
      listening: {
        title: "A phone call about the weather",
        text:
          "Hi Mina! How is the weather in Sylhet? It is raining right now, and it is a little cold. Really? Here in Dhaka it is sunny and warm. The forecast says it will be cloudy tomorrow.",
        questions: [
          {
            question: "What is the weather like in Sylhet?",
            options: ["Sunny and warm", "Raining and a little cold", "Cloudy", "Windy"],
            answerIndex: 1,
            explanation: "Mina says: 'It is raining right now, and it is a little cold.'",
          },
          {
            question: "What does the forecast say about tomorrow?",
            options: ["Sunny", "Rainy", "Cloudy", "Warm"],
            answerIndex: 2,
            explanation: "The text says: 'The forecast says it will be cloudy tomorrow.'",
          },
        ],
      },
      quiz: [
        {
          question: "Complete: 'It ______ raining right now.'",
          options: ["is", "are", "am", "be"],
          answerIndex: 0,
          explanation: "Present continuous: It is raining.",
        },
        {
          question: "Which sentence is a general fact?",
          options: [
            "It is raining right now.",
            "It rains a lot in July.",
            "It is sunny at the moment.",
            "We are walking now.",
          ],
          answerIndex: 1,
          explanation: "Present simple ('it rains') describes general facts.",
        },
        {
          question: "A report about future weather is a ______.",
          options: ["cloud", "forecast", "storm", "season"],
          answerIndex: 1,
          explanation: "A forecast predicts the weather.",
        },
        {
          question: "Complete: 'Take an umbrella; it's a ______ day.'",
          options: ["sunny", "warm", "rainy", "dry"],
          answerIndex: 2,
          explanation: "You need an umbrella on a rainy day.",
        },
        {
          question: "Choose the correct sentence.",
          options: [
            "The sun shining is.",
            "The sun is shining.",
            "The sun are shining.",
            "The sun is shine.",
          ],
          answerIndex: 1,
          explanation: "Present continuous: is + shining.",
        },
      ],
      speaking: {
        sentences: [
          "It is sunny today.",
          "The forecast says rain tomorrow.",
          "How is the weather in your city?",
        ],
      },
    },
  },
];

export const achievements = [
  {
    id: "first-lesson",
    title: "First Steps",
    description: "Complete your first lesson.",
    icon: "graduation-cap",
    requirement_kind: "lessons_completed",
    requirement_value: 1,
  },
  {
    id: "five-lessons",
    title: "Getting Serious",
    description: "Complete 5 lessons.",
    icon: "book-open",
    requirement_kind: "lessons_completed",
    requirement_value: 5,
  },
  {
    id: "streak-3",
    title: "On Fire",
    description: "Keep a 3-day streak.",
    icon: "flame",
    requirement_kind: "streak_days",
    requirement_value: 3,
  },
  {
    id: "streak-7",
    title: "Unstoppable",
    description: "Keep a 7-day streak.",
    icon: "zap",
    requirement_kind: "streak_days",
    requirement_value: 7,
  },
  {
    id: "xp-100",
    title: "Century",
    description: "Earn 100 XP.",
    icon: "star",
    requirement_kind: "xp_total",
    requirement_value: 100,
  },
  {
    id: "words-10",
    title: "Word Collector",
    description: "Save 10 words to your Word Bank.",
    icon: "bookmark",
    requirement_kind: "words_saved",
    requirement_value: 10,
  },
] as const;
