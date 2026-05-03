import 'dotenv/config';
import { generateQuestion } from './src/services/ai';

(async () => {
  try {
    console.log('🧪 Testing Groq models...');
    console.log('API Keys configured:', {
      gemini: !!process.env.GEMINI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
    });
    
    const q = await generateQuestion({
      subject: 'law_of_contract',
      track: 'undergraduate_track',
      difficulty: 'easy',
      pdfContext: 'Offer and acceptance form a contract.',
    });
    console.log('✅ SUCCESS! A model worked!');
    console.log('Question:', q.question.substring(0, 80));
  } catch (err: any) {
    console.error('❌ Error:', err.message);
  }
  process.exit(0);
})();
