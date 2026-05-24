// Manual i18n dictionary — Indian languages + English
export const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "ur", label: "Urdu", native: "اردو" },
] as const;

export type LangCode = typeof LANGUAGES[number]["code"];

type Dict = Record<string, string>;

const en: Dict = {
  brand_tag: "Intelligent News · Daily Games",
  nav_news: "News",
  nav_games: "Games",
  nav_profile: "Profile",
  nav_signin: "Sign In",
  nav_signout: "Sign Out",
  live: "Live",
  hero_eyebrow: "AI-curated daily briefing",
  hero_title: "News that thinks with you.",
  hero_sub: "Real headlines, AI summaries, and daily games — all in your language.",
  hero_cta_news: "Read the Briefing",
  hero_cta_games: "Play Today's Games",
  featured_title: "Today's Featured",
  categories_title: "Browse by Category",
  games_preview_title: "Daily Games",
  games_preview_sub: "Train your brain. Build a streak.",
  view_all: "View all news",
  trending: "Trending",
  search_news: "Search news…",
  ai_summary: "AI Summary",
  summarize: "Summarize",
  read_more: "Read more",
  no_articles: "No articles found. Try another category.",
  could_not_load: "Could not load news",
  cat_general: "Top Stories",
  cat_world: "World",
  cat_business: "Business",
  cat_technology: "Technology",
  cat_sports: "Sports",
  cat_entertainment: "Entertainment",
  cat_science: "Science",
  cat_health: "Health",
  games_hero_eyebrow: "Daily Puzzles",
  games_hero_title: "Sharpen your mind, every day.",
  games_hero_sub: "Three classic games refresh every 24 hours. Build your streak and climb the leaderboard.",
  streak: "Day Streak",
  leaderboard: "Leaderboard",
  rank: "Rank",
  player: "Player",
  score: "Score",
  games_played: "Games",
  signin_to_track: "Sign in to track your streak and join the leaderboard",
  sudoku: "Sudoku",
  word_search: "Word Search",
  crossword: "Crossword",
};

const hi: Dict = {
  brand_tag: "बुद्धिमान समाचार · दैनिक खेल",
  nav_news: "समाचार",
  nav_games: "खेल",
  nav_profile: "प्रोफ़ाइल",
  nav_signin: "साइन इन",
  nav_signout: "साइन आउट",
  live: "लाइव",
  hero_eyebrow: "एआई-चयनित दैनिक ब्रीफिंग",
  hero_title: "ऐसी ख़बरें जो आपके साथ सोचें।",
  hero_sub: "असली सुर्खियाँ, एआई सारांश और दैनिक खेल — आपकी भाषा में।",
  hero_cta_news: "ब्रीफिंग पढ़ें",
  hero_cta_games: "आज के खेल खेलें",
  featured_title: "आज की मुख्य ख़बरें",
  categories_title: "श्रेणी से देखें",
  games_preview_title: "दैनिक खेल",
  games_preview_sub: "अपना दिमाग़ तेज़ करें। स्ट्रीक बनाएँ।",
  view_all: "सारी ख़बरें देखें",
  trending: "ट्रेंडिंग",
  search_news: "समाचार खोजें…",
  ai_summary: "एआई सारांश",
  summarize: "सारांश बनाएँ",
  read_more: "और पढ़ें",
  no_articles: "कोई लेख नहीं मिला। दूसरी श्रेणी आज़माएँ।",
  could_not_load: "समाचार लोड नहीं हो सका",
  cat_general: "मुख्य ख़बरें",
  cat_world: "विश्व",
  cat_business: "व्यापार",
  cat_technology: "प्रौद्योगिकी",
  cat_sports: "खेल",
  cat_entertainment: "मनोरंजन",
  cat_science: "विज्ञान",
  cat_health: "स्वास्थ्य",
  games_hero_eyebrow: "दैनिक पहेलियाँ",
  games_hero_title: "हर दिन अपना दिमाग़ तेज़ करें।",
  games_hero_sub: "तीन क्लासिक खेल हर 24 घंटे में बदलते हैं। स्ट्रीक बनाएँ और लीडरबोर्ड पर चढ़ें।",
  streak: "दिनों की स्ट्रीक",
  leaderboard: "लीडरबोर्ड",
  rank: "रैंक",
  player: "खिलाड़ी",
  score: "स्कोर",
  games_played: "खेल",
  signin_to_track: "स्ट्रीक ट्रैक करने और लीडरबोर्ड में शामिल होने के लिए साइन इन करें",
  sudoku: "सुडोकू",
  word_search: "शब्द खोज",
  crossword: "क्रॉसवर्ड",
};

const ta: Dict = {
  brand_tag: "புத்திசாலி செய்திகள் · தினசரி விளையாட்டுகள்",
  nav_news: "செய்திகள்",
  nav_games: "விளையாட்டுகள்",
  nav_profile: "சுயவிவரம்",
  nav_signin: "உள்நுழை",
  nav_signout: "வெளியேறு",
  live: "நேரலை",
  hero_eyebrow: "AI தேர்ந்தெடுத்த தினசரி சுருக்கம்",
  hero_title: "உங்களுடன் சிந்திக்கும் செய்திகள்.",
  hero_sub: "உண்மையான தலைப்புச் செய்திகள், AI சுருக்கங்கள் மற்றும் தினசரி விளையாட்டுகள் — உங்கள் மொழியில்.",
  hero_cta_news: "சுருக்கத்தைப் படிக்கவும்",
  hero_cta_games: "இன்றைய விளையாட்டுகள்",
  featured_title: "இன்றைய சிறப்பு",
  categories_title: "பிரிவு வாரியாகப் பார்க்கவும்",
  games_preview_title: "தினசரி விளையாட்டுகள்",
  games_preview_sub: "உங்கள் மூளையைப் பயிற்சி செய்யுங்கள்.",
  view_all: "அனைத்து செய்திகளும்",
  trending: "டிரெண்டிங்",
  search_news: "செய்திகளைத் தேடு…",
  ai_summary: "AI சுருக்கம்",
  summarize: "சுருக்கம்",
  read_more: "மேலும் படிக்க",
  no_articles: "கட்டுரைகள் இல்லை.",
  could_not_load: "செய்திகளை ஏற்ற முடியவில்லை",
  cat_general: "முக்கிய செய்திகள்",
  cat_world: "உலகம்",
  cat_business: "வணிகம்",
  cat_technology: "தொழில்நுட்பம்",
  cat_sports: "விளையாட்டு",
  cat_entertainment: "பொழுதுபோக்கு",
  cat_science: "அறிவியல்",
  cat_health: "ஆரோக்கியம்",
  games_hero_eyebrow: "தினசரி புதிர்கள்",
  games_hero_title: "ஒவ்வொரு நாளும் உங்கள் மனதைக் கூர்மைப்படுத்துங்கள்.",
  games_hero_sub: "மூன்று கிளாசிக் விளையாட்டுகள் ஒவ்வொரு 24 மணி நேரத்திற்கும் புதுப்பிக்கப்படும்.",
  streak: "நாள் ஸ்ட்ரீக்",
  leaderboard: "லீடர்போர்டு",
  rank: "தரம்",
  player: "வீரர்",
  score: "மதிப்பெண்",
  games_played: "விளையாட்டுகள்",
  signin_to_track: "ஸ்ட்ரீக்கைக் கண்காணிக்க உள்நுழையவும்",
  sudoku: "சுடோகு",
  word_search: "சொல் தேடல்",
  crossword: "குறுக்கெழுத்து",
};

const te: Dict = { ...hi, brand_tag: "తెలివైన వార్తలు · రోజువారీ ఆటలు", nav_news: "వార్తలు", nav_games: "ఆటలు", nav_signin: "సైన్ ఇన్", nav_signout: "సైన్ అవుట్", live: "ప్రత్యక్ష", hero_title: "మీతో ఆలోచించే వార్తలు.", hero_sub: "నిజమైన వార్తలు, AI సారాంశాలు, రోజువారీ ఆటలు — మీ భాషలో.", hero_cta_news: "బ్రీఫింగ్ చదవండి", hero_cta_games: "ఈ రోజు ఆటలు", featured_title: "నేటి ముఖ్యాంశాలు", categories_title: "వర్గం వారీగా", games_preview_title: "రోజువారీ ఆటలు", view_all: "అన్ని వార్తలు", trending: "ట్రెండింగ్", streak: "రోజుల స్ట్రీక్", leaderboard: "లీడర్‌బోర్డు", rank: "ర్యాంక్", player: "ప్లేయర్", score: "స్కోర్", games_played: "ఆటలు" };

const bn: Dict = { ...hi, brand_tag: "বুদ্ধিমান সংবাদ · দৈনিক গেম", nav_news: "সংবাদ", nav_games: "গেম", nav_signin: "সাইন ইন", nav_signout: "সাইন আউট", live: "লাইভ", hero_title: "আপনার সাথে চিন্তা করে এমন সংবাদ।", hero_sub: "সত্যিকারের শিরোনাম, AI সারাংশ এবং দৈনিক গেম — আপনার ভাষায়।", hero_cta_news: "ব্রিফিং পড়ুন", hero_cta_games: "আজকের গেম", featured_title: "আজকের বিশেষ", categories_title: "বিভাগ অনুসারে", games_preview_title: "দৈনিক গেম", view_all: "সব সংবাদ দেখুন", trending: "ট্রেন্ডিং", streak: "দিনের স্ট্রিক", leaderboard: "লিডারবোর্ড", rank: "র‍্যাঙ্ক", player: "খেলোয়াড়", score: "স্কোর", games_played: "গেম" };

const mr: Dict = { ...hi, brand_tag: "बुद्धिमान बातम्या · दैनिक खेळ", nav_news: "बातम्या", nav_games: "खेळ", nav_signin: "साइन इन", nav_signout: "साइन आउट", live: "लाइव्ह", hero_title: "तुमच्यासोबत विचार करणाऱ्या बातम्या.", hero_sub: "खऱ्या बातम्या, AI सारांश आणि दैनिक खेळ — तुमच्या भाषेत.", hero_cta_news: "ब्रीफिंग वाचा", hero_cta_games: "आजचे खेळ", featured_title: "आजचे विशेष", categories_title: "श्रेणीनुसार", games_preview_title: "दैनिक खेळ", view_all: "सर्व बातम्या", streak: "दिवसांचा स्ट्रीक", leaderboard: "लीडरबोर्ड" };

const gu: Dict = { ...hi, brand_tag: "બુદ્ધિશાળી સમાચાર · દૈનિક રમતો", nav_news: "સમાચાર", nav_games: "રમતો", nav_signin: "સાઇન ઇન", nav_signout: "સાઇન આઉટ", live: "લાઇવ", hero_title: "તમારી સાથે વિચારતા સમાચાર.", featured_title: "આજનું વિશેષ", view_all: "બધા સમાચાર", streak: "દિવસોનો સ્ટ્રીક", leaderboard: "લીડરબોર્ડ" };

const pa: Dict = { ...hi, brand_tag: "ਬੁੱਧੀਮਾਨ ਖ਼ਬਰਾਂ · ਰੋਜ਼ਾਨਾ ਖੇਡਾਂ", nav_news: "ਖ਼ਬਰਾਂ", nav_games: "ਖੇਡਾਂ", nav_signin: "ਸਾਈਨ ਇਨ", nav_signout: "ਸਾਈਨ ਆਉਟ", live: "ਲਾਈਵ", hero_title: "ਤੁਹਾਡੇ ਨਾਲ ਸੋਚਣ ਵਾਲੀਆਂ ਖ਼ਬਰਾਂ।", featured_title: "ਅੱਜ ਦਾ ਵਿਸ਼ੇਸ਼", view_all: "ਸਾਰੀਆਂ ਖ਼ਬਰਾਂ", streak: "ਦਿਨਾਂ ਦੀ ਸਟ੍ਰੀਕ", leaderboard: "ਲੀਡਰਬੋਰਡ" };

const kn: Dict = { ...hi, brand_tag: "ಬುದ್ಧಿವಂತ ಸುದ್ದಿ · ದೈನಂದಿನ ಆಟಗಳು", nav_news: "ಸುದ್ದಿ", nav_games: "ಆಟಗಳು", nav_signin: "ಸೈನ್ ಇನ್", nav_signout: "ಸೈನ್ ಔಟ್", live: "ಲೈವ್", hero_title: "ನಿಮ್ಮೊಂದಿಗೆ ಯೋಚಿಸುವ ಸುದ್ದಿ.", featured_title: "ಇಂದಿನ ವಿಶೇಷ", view_all: "ಎಲ್ಲಾ ಸುದ್ದಿ", streak: "ದಿನಗಳ ಸ್ಟ್ರೀಕ್", leaderboard: "ಲೀಡರ್‌ಬೋರ್ಡ್" };

const ml: Dict = { ...hi, brand_tag: "ബുദ്ധിമാന്‍ വാര്‍ത്തകള്‍ · ദൈനംദിന ഗെയിമുകള്‍", nav_news: "വാർത്തകൾ", nav_games: "ഗെയിമുകൾ", nav_signin: "സൈൻ ഇൻ", nav_signout: "സൈൻ ഔട്ട്", live: "ലൈവ്", hero_title: "നിങ്ങളോടൊപ്പം ചിന്തിക്കുന്ന വാർത്തകൾ.", featured_title: "ഇന്നത്തെ പ്രത്യേക", view_all: "എല്ലാ വാർത്തകളും", streak: "ദിവസ സ്ട്രീക്ക്", leaderboard: "ലീഡർബോർഡ്" };

const ur: Dict = { ...hi, brand_tag: "ذہین خبریں · روزانہ کھیل", nav_news: "خبریں", nav_games: "کھیل", nav_signin: "سائن ان", nav_signout: "سائن آؤٹ", live: "براہ راست", hero_title: "آپ کے ساتھ سوچنے والی خبریں۔", featured_title: "آج کی خصوصی", view_all: "تمام خبریں", streak: "دنوں کی اسٹریک", leaderboard: "لیڈر بورڈ" };

const DICTS: Record<string, Dict> = { en, hi, ta, te, bn, mr, gu, pa, kn, ml, ur };

export const t = (lang: string, key: string): string => {
  return DICTS[lang]?.[key] ?? DICTS.en[key] ?? key;
};

// Map our internal codes to Google News (gl/hl) supported codes
export const newsLangCode = (lang: string): string => {
  const map: Record<string, string> = {
    en: "en", hi: "hi", ta: "ta", te: "te", bn: "bn",
    mr: "mr", gu: "gu", pa: "pa", kn: "kn", ml: "ml", ur: "ur",
  };
  return map[lang] || "en";
};

export const isRtl = (lang: string) => lang === "ur";
