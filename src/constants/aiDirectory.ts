export interface ExternalAIModel {
  id: string;
  name: string;
  banglaName: string;
  category: 'platform' | 'text-code' | 'reasoning' | 'search' | 'creative' | 'media';
  categoryBangla: string;
  banglaDescription: string;
  bestForBangla: string;
  webUrl: string;
  internalModelId?: string; // If supported for direct in-app chat
  color: string;
  badge: string;
  isSpecialPlatform?: boolean;
}

export const BEST_AI_MODELS: ExternalAIModel[] = [
  // 1. Google AI Studio (গুগল এআই স্টুডিও)
  {
    id: 'aistudio',
    name: 'Google AI Studio',
    banglaName: 'গুগল এআই স্টুডিও',
    category: 'platform',
    categoryBangla: 'ডেভেলপার ও বিল্ড প্ল্যাটফর্ম',
    banglaDescription: 'গুগলের অফিসিয়াল প্রোটোটাইপিং ও বিল্ডার প্ল্যাটফর্ম। এখান থেকে সরাসরি নতুন অ্যাপ তৈরি, প্রম্পট টিউনিং এবং ফ্রি জেমিনাই API Key সংগ্রহ করা যায়।',
    bestForBangla: '🛠️ সরাসরি AI অ্যাপ বানানো (Build), ভাইব কোডিং, ফ্রি API Key নেওয়া এবং জেমিনাই মডেলের সব ফিচার পরীক্ষা করা।',
    webUrl: 'https://aistudio.google.com',
    color: '#4285f4',
    badge: 'অফিসিয়াল স্টুডিও',
    isSpecialPlatform: true,
  },

  // 2. Anthropic Claude (অ্যানথ্রপিক ক্লড)
  {
    id: 'claude',
    name: 'Anthropic Claude (3.7 Sonnet)',
    banglaName: 'ক্লড (অ্যানথ্রপিক)',
    category: 'text-code',
    categoryBangla: 'প্রোগ্রামিং ও নির্ভুল যুক্তি',
    banglaDescription: 'সফটওয়্যার ডেভেলপার ও পেশাদারদের প্রিয় এআই। মানুষের মতো স্বাভাবিক ভাষা, বিশাল কনটেক্সট এবং নির্ভরযোগ্য কোডিং আউটপুট দেয়।',
    bestForBangla: '💻 উন্নত প্রোগ্রামিং, ওয়েব অ্যাপ তৈরি, জটিল কোডের বাগ সমাধান, ডকুমেন্ট সামারি এবং মানবিক শৈলীর লেখা।',
    webUrl: 'https://claude.ai',
    internalModelId: 'claude-3-7-sonnet-20250219',
    color: '#f97316',
    badge: 'সেরা কোডার',
  },

  // 3. Google Gemini (গুগল জেমিনাই)
  {
    id: 'gemini',
    name: 'Google Gemini (3.8 Flash / Pro)',
    banglaName: 'গুগল জেমিনাই',
    category: 'text-code',
    categoryBangla: 'মাল্টিমোডাল ও কোডিং',
    banglaDescription: 'গুগলের দ্রুততম ও বুদ্ধিমান মাল্টিমোডাল এআই। এটি টেক্সট, কোড, ছবি ও ফাইলের নির্ভুল বিশ্লেষণ করে।',
    bestForBangla: '⚡ আল্ট্রা ফাস্ট প্রশ্নোত্তর, ডকুমেন্ট ও ছবি বিশ্লেষণ, দ্রুত কোডিং এবং গুগলের লাইভ সার্চ।',
    webUrl: 'https://gemini.google.com',
    internalModelId: 'gemini-3.8-flash',
    color: '#38bdf8',
    badge: 'গুগল ফ্ল্যাগশিপ',
  },

  // 4. OpenAI ChatGPT (চ্যাটজিপিটি)
  {
    id: 'chatgpt',
    name: 'OpenAI ChatGPT (GPT-4o / o3)',
    banglaName: 'চ্যাটজিপিটি (ওপেনএআই)',
    category: 'text-code',
    categoryBangla: 'লেখালেখি ও বহুমুখী আলোচনা',
    banglaDescription: 'বিশ্বের সবচেয়ে জনপ্রিয় ও শক্তিশালী এআই সহকারী। যেকোনো বিষয়ে সাবলীল প্রশ্নোত্তর ও বিশ্লেষণে অতুলনীয়।',
    bestForBangla: '📝 পেশাদার ইমেইল ও কনটেন্ট রচনা, ডাটা অ্যানালাইসিস, অনুবাদ, গণিত ও দৈনন্দিন সহায়তা।',
    webUrl: 'https://chatgpt.com',
    internalModelId: 'gpt-4o',
    color: '#10b981',
    badge: 'সর্বাধিক জনপ্রিয়',
  },

  // 5. DeepSeek (ডিপসিক)
  {
    id: 'deepseek',
    name: 'DeepSeek (R1 / V3)',
    banglaName: 'ডিপসিক (DeepSeek)',
    category: 'reasoning',
    categoryBangla: 'গণিত ও ডিপ রিজনিং',
    banglaDescription: 'ওপেন-সোর্স বিশ্বের শীর্ষস্থানীয় রিজনিং মডেল। এটি চিন্তা করার ধাপগুলো পুঙ্খানুপুঙ্খ দেখিয়ে সঠিক সিদ্ধান্তে পৌঁছায়।',
    bestForBangla: '🧠 জটিল গাণিতিক সমস্যা, অ্যালগরিদম ডিজাইন, গভীর লজিক্যাল রিজনিং ও নিখুঁত কোড লজিক।',
    webUrl: 'https://chat.deepseek.com',
    internalModelId: 'deepseek/deepseek-r1',
    color: '#06b6d4',
    badge: 'ডিপ রিজনিং',
  },

  // 6. Google NotebookLM (নোটবুক এলএম)
  {
    id: 'notebooklm',
    name: 'Google NotebookLM',
    banglaName: 'গুগল নোটবুক এলএম',
    category: 'platform',
    categoryBangla: 'রিসার্চ ও অডিও পডকাস্ট',
    banglaDescription: 'গুগলের উদ্ভাবনী রিসার্চ এআই। যেকোনো বই, পিডিএফ বা নোট আপলোড করলে তা পড়ে স্বয়ংক্রিয় আকর্ষণীয় রেডিও/পডকাস্ট তৈরি করে দেয়।',
    bestForBangla: '📚 বই ও পিডিএফ পড়া, গবেষণা নোট সাজানো এবং এক ক্লিকে দুইজনের রোমাঞ্চকর অডিও আলোচনা (Podcast) বানানো।',
    webUrl: 'https://notebooklm.google.com',
    color: '#ea4335',
    badge: 'গুগল রিসার্চ',
    isSpecialPlatform: true,
  },

  // 7. Perplexity AI (পারপ্লেক্সিটি)
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    banglaName: 'পারপ্লেক্সিটি এআই',
    category: 'search',
    categoryBangla: 'লাইভ ওয়েব সার্চ ও ফ্যাক্টস',
    banglaDescription: 'ইন্টারনেট তথ্যের সাথে সরাসরি সংযুক্ত এআই সার্চ ইঞ্জিন যা প্রতিটি তথ্যের সাথে লাইভ সোর্স রেফারেন্স প্রদর্শন করে।',
    bestForBangla: '🔍 তাজা খবর অনুসন্ধান, তথ্যসূত্র ও লিংক সহ ফ্যাক্ট-চেক এবং যেকোনো একাডেমিক গবেষণা।',
    webUrl: 'https://www.perplexity.ai',
    color: '#14b8a6',
    badge: 'সেরা সার্চ ইঞ্জিন',
  },

  // 8. Bolt.new (বোল্ট ভাইব কোডিং)
  {
    id: 'bolt',
    name: 'Bolt.new by StackBlitz',
    banglaName: 'বোল্ট ডট নিউ (Bolt.new)',
    category: 'text-code',
    categoryBangla: 'ফুল-স্ট্যাক ওয়েব অ্যাপ বিল্ডার',
    banglaDescription: 'ব্রাউজারে সরাসরি ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন কোড ও লাইভ রান করানোর অত্যাধুনিক ভাইব কোডিং প্ল্যাটফর্ম।',
    bestForBangla: '🚀 শুধু প্রম্পট লিখে পুরো ফুল-স্ট্যাক অ্যাপ তৈরি করা, লাইভ প্রিভিউ দেখা এবং নেটলিফাই/ভার্সেলে ডেপ্লয় করা।',
    webUrl: 'https://bolt.new',
    color: '#3b82f6',
    badge: 'ফুল-স্ট্যাক বিল্ডার',
    isSpecialPlatform: true,
  },

  // 9. v0 by Vercel (ভি-জিরো)
  {
    id: 'v0',
    name: 'v0 by Vercel',
    banglaName: 'ভি-জিরো (v0 Vercel)',
    category: 'text-code',
    categoryBangla: 'ইউআই ও ফ্রন্টএন্ড কোডিং',
    banglaDescription: 'প্রম্পট লিখে আধুনিক মোবাইল ও ওয়েব অ্যাপের জন্য রিয়্যাক্ট এবং টেইলউইন্ড ইউজার ইন্টারফেস তৈরির সেরা টুল।',
    bestForBangla: '🎨 ওয়েবসাইট ডিজাইন, মোবাইল অ্যাপ ইন্টারফেস এবং রেডিমেড ফ্রন্টএন্ড কোড সরাসরি তৈরি করা।',
    webUrl: 'https://v0.dev',
    color: '#8b5cf6',
    badge: 'ভাইব কোডিং',
  },

  // 10. Cursor AI (কার্সার কোড এডিটর)
  {
    id: 'cursor',
    name: 'Cursor AI',
    banglaName: 'কার্সার এআই (Cursor)',
    category: 'text-code',
    categoryBangla: 'স্মার্ট কোড এডিটর',
    banglaDescription: 'ভিএস কোড ভিত্তিক বিশ্বের সবচেয়ে জনপ্রিয় এআই কোড এডিটর যা সম্পূর্ণ কোডবেস বুঝে অটো-কমপ্লিট ও রিফ্যাক্টর করে।',
    bestForBangla: '👨‍💻 পুরো প্রজেক্ট একসাথে বিশ্লেষণ করা, দ্রুত কোডিং, অটোমেশন এবং বাগ রিফ্যাক্টরিং।',
    webUrl: 'https://www.cursor.com',
    color: '#6366f1',
    badge: '১ নম্বর এডিটর',
  },

  // 11. Poe AI (পো - Quora Poe)
  {
    id: 'poe',
    name: 'Poe by Quora',
    banglaName: 'পো এআই (Poe.com)',
    category: 'platform',
    categoryBangla: 'অল-ইন-ওয়ান এআই হাব',
    banglaDescription: 'কোরা-র তৈরি একটিমাত্র অ্যাকাউন্টে ক্লড, চ্যাটজিপিটি, জেমিনাই এবং হাজার হাজার কাস্টম বট ব্যবহারের সুবিধা।',
    bestForBangla: '🌐 একই জায়গায় সকল মডেলের অ্যাক্সেস এবং নিজস্ব কাস্টম প্রম্পট বট তৈরি করা।',
    webUrl: 'https://poe.com',
    color: '#8b5cf6',
    badge: 'অল-ইন-ওয়ান',
    isSpecialPlatform: true,
  },

  // 12. Mistral Le Chat (মিস্ট্রাল এআই)
  {
    id: 'mistral',
    name: 'Mistral Le Chat',
    banglaName: 'মিস্ট্রাল (Le Chat)',
    category: 'text-code',
    categoryBangla: 'ইউরোপীয় ওপেন মডেল',
    banglaDescription: 'ইউরোপের দ্রুততম ওপেন-ওয়েটস মডেল যা উচ্চ বুদ্ধিমত্তা এবং সাবলীল বহুভাষিক টেক্সট প্রসেসিংয়ে সক্ষম।',
    bestForBangla: '⚡ দ্রুত লেখালেখি, ওয়েব ব্রাউজিং, ডকুমেন্ট অ্যানালাইসিস এবং কোডিং সহকারী।',
    webUrl: 'https://chat.mistral.ai',
    color: '#ff7000',
    badge: 'মিস্ট্রাল ওপেন',
  },

  // 13. Midjourney (মিডজার্নি ইমেজ)
  {
    id: 'midjourney',
    name: 'Midjourney',
    banglaName: 'মিডজার্নি (Midjourney)',
    category: 'creative',
    categoryBangla: 'ফটোরিয়ালিস্টিক ছবি ও আর্ট',
    banglaDescription: 'টেক্সট নির্দেশনা থেকে সিনেমাটিক ও আর্ট গ্রেড ছবি তৈরি করার বিশ্বসেরা ইমেজ জেনারেটর।',
    bestForBangla: '🖼️ লোগো ডিজাইন, ফটোরিয়ালিস্টিক ছবি, কনসেপ্ট আর্ট, ব্যানার এবং ডিজিটাল পেইন্টিং।',
    webUrl: 'https://www.midjourney.com',
    color: '#ec4899',
    badge: 'ইমেজ জেনারেশন',
  },

  // 14. Kling AI (ক্লিং ভিডিও এআই)
  {
    id: 'kling',
    name: 'Kling AI',
    banglaName: 'ক্লিং ভিডিও এআই (Kling)',
    category: 'media',
    categoryBangla: 'সিনেমাটিক ভিডিও তৈরি',
    banglaDescription: 'টেক্সট প্রম্পট বা ছবি আপলোড করে হাই-ডেফিনিশন মোশন ভিডিও এবং রিয়্যালিস্টিক সিনেমা ক্লিপ বানানোর এআই।',
    bestForBangla: '🎬 টেক্সট বা ছবি থেকে বাস্তবসম্মত সিনেমাটিক ভিডিও ক্লিপ ও অ্যানিমেশন তৈরি।',
    webUrl: 'https://klingai.com',
    color: '#a855f7',
    badge: 'ভিডিও এআই',
  },

  // 15. Suno AI (সুনো মিউজিক এআই)
  {
    id: 'suno',
    name: 'Suno AI Music',
    banglaName: 'সুনো মিউজিক (Suno AI)',
    category: 'media',
    categoryBangla: 'গান ও অডিও কম্পোজিশন',
    banglaDescription: 'যেকোনো গানের কথা বা জেনার লিখলে তাৎক্ষণিক কণ্ঠ ও মিউজিক সহ সম্পূর্ণ গান তৈরি করে দেয়।',
    bestForBangla: '🎵 সম্পূর্ণ নতুন গান, সুর, ব্যাকগ্রাউন্ড মিউজিক এবং বিভিন্ন ভাষার কণ্ঠ সহ গান তৈরি।',
    webUrl: 'https://suno.com',
    color: '#f43f5e',
    badge: 'মিউজিক এআই',
  },

  // 16. ElevenLabs (ইলেভেনল্যাবস ভয়েস)
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    banglaName: 'ইলেভেনল্যাবস (ElevenLabs)',
    category: 'media',
    categoryBangla: 'ভয়েস ক্লোনিং ও স্পিচ',
    banglaDescription: 'বাস্তব মানুষের কণ্ঠের মতো নিখুঁত টেক্সট-টু-স্পিচ এবং এআই ভয়েস ক্লোনিং প্রযুক্তি।',
    bestForBangla: '🎙️ ইউটিউব ও ভিডিও ভয়েসওভার, পডকাস্ট অডিও এবং বহুভাষিক স্পিচ ডাবিং।',
    webUrl: 'https://elevenlabs.io',
    color: '#f59e0b',
    badge: 'ভয়েস ও অডিও',
  },

  // 17. Microsoft Copilot (কোপাইলট)
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    banglaName: 'মাইক্রোসফট কোপাইলট',
    category: 'search',
    categoryBangla: 'অফিস ও বিং সার্চ',
    banglaDescription: 'উইন্ডোজ এবং অফিস ৩৬৫ এর অফিসিয়াল এআই যা বিং সার্চ ইঞ্জিনের সাথে সমন্বিত।',
    bestForBangla: '📊 অফিস ডকুমেন্ট ড্রাফটিং, এক্সেল টেবিল সহায়তা ও ওয়েব ব্রাউজিং সামারি।',
    webUrl: 'https://copilot.microsoft.com',
    color: '#2563eb',
    badge: 'মাইক্রোসফট',
  },

  // 18. xAI Grok (গ্রক)
  {
    id: 'grok',
    name: 'xAI Grok',
    banglaName: 'গ্রক (ইলন মাস্কের xAI)',
    category: 'search',
    categoryBangla: 'রিয়েল-টাইম এক্স ট্রেন্ডস',
    banglaDescription: 'এক্স (টুইটার) প্ল্যাটফর্মের রিয়েল-টাইম তথ্যে প্রশিক্ষিত স্পষ্টভাষী এআই সহকারী।',
    bestForBangla: '⚡ চলমান ট্রেন্ডিং খবর, তাৎক্ষণিক ফ্যাক্টস ও আনসেন্সরড আলোচনা।',
    webUrl: 'https://x.ai',
    color: '#e2e8f0',
    badge: 'এক্স ট্রেন্ডস',
  },
];
