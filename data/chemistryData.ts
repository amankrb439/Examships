
import { Question } from '../types';

const chemBase: Record<string, { q: string, o: string[], a: number, e: string }[]> = {
  "1. Nature": [{ q: "पदार्थ की चौथी अवस्था कौन सी है?", o: ["ठोस", "तरल", "गैस", "प्लाज्मा"], a: 3, e: "प्लाज्मा उच्च ताप पर आयनित गैस है।" }],
  "2. Atomic": [{ q: "प्रोटॉन की खोज किसने की?", o: ["थॉमसन", "गोल्डस्टीन", "चैडविक", "बोहर"], a: 1, e: "गोल्डस्टीन ने प्रोटॉन की खोज की थी।" }],
  "3. Periodic": [{ q: "आधुनिक आवर्त सारणी का आधार क्या है?", o: ["द्रव्यमान", "क्रमांक", "घनत्व", "आकार"], a: 1, e: "परमाणु क्रमांक पर आधारित है।" }],
  "4. Bonding": [{ q: "NaCl में कौन सा बंध होता है?", o: ["आयनिक", "सहसंयोजक", "उपसहसंयोजक", "धात्विक"], a: 0, e: "इलेक्ट्रॉन स्थानांतरण से आयनिक बंध बनता है।" }],
  "5. Acid": [{ q: "शुद्ध जल का pH मान कितना है?", o: ["6", "7", "8", "9"], a: 1, e: "शुद्ध जल उदासीन (7) होता है।" }],
  "6. Metal": [{ q: "द्रव अवस्था में पाई जाने वाली धातु?", o: ["सोना", "पारा", "सोडियम", "लोहा"], a: 1, e: "पारा (Hg) द्रव धातु है।" }],
  "7. Organic": [{ q: "मार्स गैस किसे कहते हैं?", o: ["एथेन", "मेथेन", "प्रोपेन", "ब्यूटेन"], a: 1, e: "Methane (CH4) को मार्स गैस कहते हैं।" }],
  "8. Fuel": [{ q: "LPG का मुख्य घटक क्या है?", o: ["मेथेन", "एथेन", "ब्यूटेन", "हाइड्रोजन"], a: 2, e: "ब्यूटेन LPG का मुख्य घटक है।" }],
  "9. Daily": [{ q: "खाने के सोडे का नाम क्या है?", o: ["सोडियम कार्बोनेट", "सोडियम बाइकार्बोनेट", "NaCl", "NaOH"], a: 1, e: "सोडियम बाइकार्बोनेट (NaHCO3)।" }],
  "10. Eco": [{ q: "अम्ल वर्षा के लिए जिम्मेदार गैसें?", o: ["SO2, NO2", "CO2, CO", "CH4, O3", "N2, Ar"], a: 0, e: "सल्फर और नाइट्रोजन के ऑक्साइड।" }]
};

const factory = (topicKey: string, code: string): Question[] => {
  const pool = chemBase[topicKey] || [{ q: "Standard Question", o: ["A","B","C","D"], a: 0, e: "Logic" }];
  const questions: Question[] = [];
  const labels = ["Standard", "Advanced", "Conceptual", "Exam PYQ", "Fast Mode", "Challenge", "Logic", "Focus", "High-Res", "Elite"];

  for (let i = 0; i < 150; i++) {
    const b = pool[i % pool.length];
    const label = labels[i % labels.length];
    questions.push({
      id: `chm-${code}-${i}`,
      text: "[" + label + " #C" + (i + 1) + "] " + b.q + (i >= pool.length ? " (Set " + i + ")" : ""),
      options: [...b.o],
      correctAnswerIndex: b.a,
      explanation: b.e + " [ID: CH" + i + "]"
    });
  }
  return questions;
};

export const STATIC_CHEMISTRY_QUESTIONS: Record<string, Question[]> = {
  "1. पदार्थ की प्रकृति (Matter)": factory("1. Nature", "N"),
  "2. परमाणु संरचना (Atomic)": factory("2. Atomic", "A"),
  "3. आवर्त वर्गीकरण (Periodic)": factory("3. Periodic", "P"),
  "4. रासायनिक बंधन (Bonding)": factory("4. Bonding", "B"),
  "5. अम्ल, क्षार एवं लवण (Acid)": factory("5. Acid", "AS"),
  "6. धातु एवं अधातु (Metal)": factory("6. Metal", "M"),
  "7. कार्बनिक रसायन (Organic)": factory("7. Organic", "O"),
  "8. ईंधन एवं दहन (Fuel)": factory("8. Fuel", "F"),
  "9. दैनिक जीवन में रसायन (Daily)": factory("9. Daily", "D"),
  "10. पर्यावरण रसायन (Eco)": factory("10. Eco", "E")
};
