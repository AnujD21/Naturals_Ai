import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, CheckCircle2, Trophy, ChevronRight,
  ChevronLeft, Clock, Zap, Shield, Palette, Droplets, Scissors,
  ArrowLeft, Star, RotateCcw, Lock, Play, AlertTriangle, Sparkles
} from 'lucide-react';
import { useSalon } from '../context/SalonContext';

/* ── Course Data ───────────────────────────────────────────── */
const COURSES = [
  {
    id: 'w1',
    week: 1,
    title: 'Color Theory Fundamentals',
    category: 'Color',
    color: '#C9A84C',
    icon: Palette,
    duration: '15 min',
    description: 'Master the foundations of professional hair color — wheel, levels, and developer volumes.',
    sections: [
      {
        title: 'The Color Wheel & Undertones',
        body: 'Hair color is built on the color wheel. Primary colors (red, yellow, blue) mix to form secondaries. Neutralizing unwanted tones requires using the opposite color — violet cancels yellow/brass, blue cancels orange, green cancels red.',
        tip: 'Always identify the underlying pigment before choosing a toner. Natural hair level 7 releases orange-yellow; level 9 releases pale yellow.',
      },
      {
        title: 'Hair Level System (1–10)',
        body: 'The level system measures lightness from 1 (black) to 10 (lightest blonde). Each lift requires breaking down melanin. Going more than 2 levels in a single session on dark hair risks uneven results and damage.',
        tip: 'When in doubt, do a strand test. It takes 10 minutes but saves a 3-hour correction appointment.',
      },
      {
        title: 'Developer Volumes Explained',
        body: '10Vol deposits only. 20Vol lifts 1–2 levels — standard for most color services. 30Vol lifts 2–3 levels and is used on resistant hair. 40Vol gives maximum lift but must never be used with bleach or on previously colored hair.',
        tip: 'Grey coverage always needs at least 20Vol. On fine or damaged hair, never exceed 20Vol to avoid breakage.',
      },
      {
        title: 'Colour Ratios & Mixing',
        body: 'Standard cream color ratio is 1:1 (60g color : 60g developer). Lighteners use 1:2 or 1:3. Glosses and toners use 1:2 with 10Vol. Weigh on a scale — estimating by eye leads to inconsistent results.',
        tip: 'Label your mixing bowl with client name and formula. It prevents errors when juggling multiple clients.',
      },
    ],
    quiz: [
      { q: 'Which color neutralises brassy/yellow tones in highlighted hair?', options: ['Green', 'Violet/Purple', 'Orange', 'Red'], correct: 1, explain: 'Violet sits opposite yellow on the color wheel, making it the correct neutraliser for brass and yellow tones.' },
      { q: 'What developer volume provides 1–2 levels of lift?', options: ['10Vol', '20Vol', '30Vol', '40Vol'], correct: 1, explain: '20Vol is the industry standard — it lifts 1–2 levels and is safe for most hair types.' },
      { q: 'A client has natural level 6 (dark blonde) hair. What underlying pigment will you see after lightening?', options: ['Pale yellow', 'Orange-red', 'Red-orange', 'Pale orange-yellow'], correct: 1, explain: 'Level 6 reveals orange-red underlying pigment during the lifting process.' },
      { q: 'What is the standard cream color-to-developer mixing ratio?', options: ['1:2', '2:1', '1:1', '1:3'], correct: 2, explain: 'Cream colors use a 1:1 ratio (equal parts color and developer) for optimal consistency and coverage.' },
      { q: 'When should 40Vol developer be avoided?', options: ['On dark hair only', 'On all grey hair', 'When mixed with bleach or on damaged hair', 'Only on fine hair'], correct: 2, explain: '40Vol combined with bleach is extremely dangerous and can cause severe breakage and scalp burns.' },
    ],
  },
  {
    id: 'w2',
    week: 2,
    title: 'Balayage & Freehand Techniques',
    category: 'Color',
    color: '#DFC06A',
    icon: Zap,
    duration: '18 min',
    description: 'Learn the art of freehand painting, sectioning strategies, and achieving a natural grow-out.',
    sections: [
      {
        title: 'What Makes Balayage Different',
        body: 'Unlike traditional foil highlights, balayage is painted freehand directly onto the hair surface without foil. This creates softer, less defined transitions that mimic natural sun-lightening. The technique works on all lengths and textures.',
        tip: 'Less is more at the root. Heavy root saturation ruins the natural grow-out effect that clients pay for.',
      },
      {
        title: 'Sectioning & Panel Placement',
        body: 'Divide hair into 3 sections: top, mid, and nape. Work from the nape up. Take thin diagonal-back sections and paint from mid-length to ends, with slightly more product at the tips. Vary panel width for a natural look.',
        tip: 'Use a tail comb handle to "flick" product upward from the mid-shaft — this creates the characteristic soft root shadow.',
      },
      {
        title: 'Backcombing & Saturation',
        body: 'Backcomb lightly before painting to create the blended root shadow. Heavy backcombing gives a harder edge; light backcombing gives a softer melt. Always saturate the ends fully — under-saturated ends look patchy after toning.',
        tip: 'Work on dry hair for balayage. Wet hair causes the product to run and creates unintended bleed.',
      },
      {
        title: 'Toning After Balayage',
        body: 'Balayage always needs a toner. After rinsing bleach, apply Olaplex No.2, shampoo gently, then apply your chosen toner on damp hair. Processing time is 5–20 minutes depending on depth. Check every 5 minutes.',
        tip: 'Use a violet or pearl toner for cool blondes. For warm, lived-in results use a beige or honey toner.',
      },
    ],
    quiz: [
      { q: 'What is the key difference between balayage and foil highlights?', options: ['Balayage uses heat; foil does not', 'Balayage is painted freehand without foil', 'Balayage lifts more levels', 'Foil gives softer results'], correct: 1, explain: 'Balayage is a freehand painting technique that creates soft, natural-looking results without the use of foils.' },
      { q: 'Should you apply balayage on wet or dry hair?', options: ['Wet — for better product spread', 'Dry — to prevent product running', 'Either — it does not matter', 'Damp — for even coverage'], correct: 1, explain: 'Dry hair is required for balayage. Wet hair causes the lightener to run and bleed into unwanted areas.' },
      { q: 'What technique creates the soft shadow at the root in balayage?', options: ['Heavy bleach application', 'Leaving roots untouched only', 'Light backcombing before painting', 'Using 40Vol at the root'], correct: 2, explain: 'Light backcombing before painting creates a natural-looking root shadow and ensures a seamless blend.' },
      { q: 'After rinsing bleach in a balayage service, what should be applied first?', options: ['Toner immediately', 'Olaplex No.2', 'Deep conditioner', 'Nothing — proceed to style'], correct: 1, explain: 'Olaplex No.2 is a bond-perfector applied after bleach removal to rebuild disulfide bonds before toning.' },
      { q: 'Which toner is best for achieving a cool, ashy blonde result?', options: ['Honey/beige toner', 'Copper toner', 'Violet or pearl toner', 'Gold toner'], correct: 2, explain: 'Violet and pearl toners neutralise yellow/warm tones, delivering the cool, ashy result clients request.' },
    ],
  },
  {
    id: 'w3',
    week: 3,
    title: 'Hair Health & Damage Assessment',
    category: 'Treatment',
    color: '#A0B89A',
    icon: Droplets,
    duration: '14 min',
    description: 'Assess porosity, identify damage levels, and recommend the right bond repair treatments.',
    sections: [
      {
        title: 'The Porosity Test',
        body: 'Drop a clean, dry strand into a glass of water. Low porosity hair floats (cuticle is tight, resists moisture). High porosity hair sinks quickly (cuticle is open, absorbs everything fast but loses it just as fast). Medium porosity floats then slowly sinks.',
        tip: 'High porosity hair needs sealing treatments like Olaplex No.3 and K18. Low porosity needs heat to open the cuticle first.',
      },
      {
        title: 'Identifying Damage Levels',
        body: 'Mild: slight loss of shine, minor frizz. Moderate: visible breakage, uneven texture, elasticity reduced. Severe: snapping when stretched, gummy when wet, extreme porosity. Severe damage requires a treatment plan before any chemical service.',
        tip: 'The wet stretch test reveals elasticity. Healthy hair stretches 30% and returns. Damaged hair either does not stretch or snaps.',
      },
      {
        title: 'Bond Repair: Olaplex vs K18',
        body: 'Olaplex targets disulfide bonds (broken by bleach and chemical services). It works during the service (No.1 in mix, No.2 post-rinse) and at home. K18 repairs keratin chains with a peptide molecule — applied post-shampoo, no rinse, works in 4 minutes. Best for structural keratin damage.',
        tip: 'Combine both for severely damaged hair: Olaplex in the service, K18 as a leave-in at the end.',
      },
      {
        title: 'Protein vs Moisture Treatments',
        body: 'Over-moisturised hair feels mushy and limp; it needs protein. Over-proteined hair feels stiff and snaps; it needs moisture. Hair needs a protein-moisture balance. Always assess before recommending a treatment.',
        tip: 'After a protein treatment, always follow with a light moisturising conditioner to keep the balance.',
      },
    ],
    quiz: [
      { q: 'In the porosity float test, what does hair that sinks quickly indicate?', options: ['Low porosity', 'Normal porosity', 'High porosity', 'Healthy hair'], correct: 2, explain: 'High porosity hair has an open cuticle that absorbs water rapidly, causing it to sink quickly in the float test.' },
      { q: 'Which treatment is applied INTO the color formula during a service?', options: ['K18', 'Olaplex No.3', 'Olaplex No.1', 'Deep conditioner'], correct: 2, explain: 'Olaplex No.1 (Bond Multiplier) is added directly to the color or bleach formula to protect bonds during processing.' },
      { q: 'A client\'s hair stretches when wet but does not return to normal length. What does this indicate?', options: ['Good elasticity', 'Low porosity', 'Over-proteined hair', 'Damaged elasticity — moisture overload'], correct: 3, explain: 'Hair that stretches excessively without returning indicates a lack of protein and compromised elasticity.' },
      { q: 'What does K18 repair that Olaplex does not primarily target?', options: ['Disulfide bonds', 'Cuticle damage', 'Keratin chains', 'Scalp health'], correct: 2, explain: 'K18 is a biomimetic peptide that repairs keratin chains — a different structural component than the disulfide bonds Olaplex targets.' },
      { q: 'Hair that feels stiff and snaps easily after a treatment session likely needs:', options: ['More protein', 'A stronger toner', 'Moisture/hydration treatment', 'Higher developer'], correct: 2, explain: 'Stiff, brittle hair after a treatment indicates protein overload — the balance must be restored with moisture.' },
    ],
  },
  {
    id: 'w4',
    week: 4,
    title: 'Client Consultation Mastery',
    category: 'Consult',
    color: '#7BA7BC',
    icon: BookOpen,
    duration: '12 min',
    description: 'Build trust, set realistic expectations, and master patch test protocol in every consultation.',
    sections: [
      {
        title: 'Active Listening & Discovery',
        body: 'Start every consultation by asking open-ended questions: "What do you love about your hair? What would you change?" Listen twice as much as you speak. Show client reference images and confirm verbally that you share the same vision before picking up any tools.',
        tip: 'Repeat back what the client said in your own words. This confirms understanding and builds trust instantly.',
      },
      {
        title: 'Managing Expectations',
        body: 'Never promise a result that cannot be achieved in one session. If a client wants to go from level 3 (dark brown) to level 9 (light blonde), explain the multi-step process clearly. Show them a realistic outcome image. Clients who understand the journey are the most loyal.',
        tip: 'Phrase limitations positively: "We will get you there in two sessions for the healthiest result" rather than "That is not possible today."',
      },
      {
        title: 'Patch Test Protocol',
        body: 'A patch test must be done 48 hours before any color service containing PPD (paraphenylenediamine). Apply a small amount of mixed color behind the ear or in the elbow crease. If redness, swelling, or itching occurs, the service cannot proceed. Document all results.',
        tip: 'Always check if the client has had a new color brand used since their last visit — even regular clients need a new patch test if the formula changes.',
      },
      {
        title: 'Building a Rebooking Habit',
        body: 'Rebook at checkout, not via follow-up messages. After every service say: "Shall we book your next appointment now? Root retouches look best every 6–8 weeks." A confirmed rebooking rate above 60% is a sign of strong client relationships.',
        tip: 'Recommend the next service during the consultation, not at the end. Plant the seed early: "Today we will do X; next time we can add Y for even better results."',
      },
    ],
    quiz: [
      { q: 'How long before a color service should a patch test be performed?', options: ['24 hours', '48 hours', '1 week', '30 minutes'], correct: 1, explain: 'A patch test must be performed 48 hours in advance to allow any allergic reaction time to develop and be assessed.' },
      { q: 'A client shows you a picture of platinum blonde hair but has level 2 (near-black) natural hair. What is the best response?', options: ['Attempt the full result in one session', 'Refuse the service', 'Explain the multi-step journey and book accordingly', 'Use 40Vol bleach for maximum lift'], correct: 2, explain: 'Managing expectations honestly while outlining a realistic plan builds trust and creates loyal long-term clients.' },
      { q: 'What is the correct description of active listening in a consultation?', options: ['Talking through your plan immediately', 'Asking open-ended questions and reflecting back what you hear', 'Only looking at reference photos', 'Letting the client talk while preparing tools'], correct: 1, explain: 'Active listening means asking open-ended questions, truly hearing the answers, and reflecting back to confirm shared understanding.' },
      { q: 'When is the best moment to rebook a client?', options: ['Via a follow-up text next day', 'At checkout before they leave', 'At the start of the next visit', 'Mid-service'], correct: 1, explain: 'Rebooking at checkout has the highest conversion rate — the client is satisfied and present, making it the natural moment.' },
      { q: 'Which ingredient in permanent hair color most commonly causes allergic reactions?', options: ['Hydrogen peroxide', 'Ammonia', 'PPD (paraphenylenediamine)', 'Keratin'], correct: 2, explain: 'PPD is the most common contact allergen in permanent hair dye and is the primary reason patch tests are legally required.' },
    ],
  },
  {
    id: 'w5',
    week: 5,
    title: 'Bleaching Safety & Protocols',
    category: 'Bleach',
    color: '#E8DDD0',
    icon: Shield,
    duration: '16 min',
    description: 'Safe bleaching practices, processing timelines, and how to handle unexpected reactions.',
    sections: [
      {
        title: 'Pre-Bleach Hair Assessment',
        body: 'Never bleach over relaxed, permed, or heavily damaged hair without a full structural assessment. Check for breakage, elasticity, and previous chemical history. Assess whether the hair can handle the lift required. If in doubt, do a strand test on a hidden section first.',
        tip: 'Work on dry, unwashed hair. Natural scalp oils act as a barrier and reduce irritation during bleaching.',
      },
      {
        title: 'Mixing & Developer Selection',
        body: 'For scalp bleach on virgin hair: 20Vol for subtle lift, 30Vol for significant lift. Never use 40Vol directly on the scalp. For off-scalp bleach (foils, balayage): 20Vol or 30Vol depending on the desired lift. Always add a bond protector (Olaplex No.1 or FIBREPLEX) to the mix.',
        tip: 'Measure precisely: 1:2 ratio (bleach:developer) by weight, not volume, for consistent results.',
      },
      {
        title: 'Processing & Monitoring',
        body: 'Check development every 10 minutes. Never leave a bleach client unattended. Look for even lift across all sections. If one area is lifting faster, check for heat source or product inconsistency. Maximum processing time is 50 minutes — beyond this, remove regardless.',
        tip: 'Use a timer. Every time you check, wipe a small section with a damp cloth to see the true lift without product distorting colour perception.',
      },
      {
        title: 'Handling Scalp Reactions',
        body: 'If a client reports burning or tingling during processing, remove the bleach immediately from that area with a damp towel and cool water. Do not rinse the entire head yet — check the affected area first. Document everything and advise the client to see a GP if irritation persists beyond 24 hours.',
        tip: 'Never dismiss complaints of burning — even minor scalp burns can become serious if left untreated.',
      },
    ],
    quiz: [
      { q: 'What is the maximum recommended bleach processing time?', options: ['30 minutes', '40 minutes', '50 minutes', '60 minutes'], correct: 2, explain: 'Processing beyond 50 minutes significantly increases the risk of breakage and scalp damage with no meaningful additional lift.' },
      { q: 'Which developer volume is safe for a direct scalp bleach application on virgin hair?', options: ['40Vol', '30Vol', '10Vol', '50Vol'], correct: 1, explain: '30Vol is the maximum recommended for scalp bleach on virgin hair — 40Vol on the scalp risks chemical burns.' },
      { q: 'What should you add to a bleach formula to protect the hair structure during lifting?', options: ['Extra developer', 'Olaplex No.1 or FIBREPLEX', 'Toner', 'Clarifying shampoo'], correct: 1, explain: 'Bond protectors like Olaplex No.1 are added to the bleach formula to protect and rebuild disulfide bonds during the lightening process.' },
      { q: 'Why is bleach applied to dry, unwashed hair?', options: ['For better colour accuracy', 'Natural scalp oils protect against irritation', 'Wet hair dilutes the bleach', 'It lifts faster on dry hair'], correct: 1, explain: 'Natural sebum (scalp oil) creates a protective barrier that reduces chemical irritation during bleach processing.' },
      { q: 'A client reports scalp burning mid-service. What is the correct immediate action?', options: ['Reassure them and continue', 'Add more developer to dilute', 'Remove bleach from that area with cool water immediately', 'Rinse the entire head under cold water'], correct: 2, explain: 'Localised burning should be addressed immediately by removing bleach from that area only — then assess the full situation before deciding next steps.' },
    ],
  },
  {
    id: 'w6',
    week: 6,
    title: 'Scalp Treatments & Retail',
    category: 'Treatment',
    color: '#A0B89A',
    icon: Sparkles,
    duration: '13 min',
    description: 'Diagnose scalp conditions, select the right treatment, and confidently recommend retail products.',
    sections: [
      {
        title: 'Scalp Analysis Techniques',
        body: 'Use a magnifying glass or scalp camera to assess: sebum level (oily/dry), flaking (dandruff vs. dry scalp), sensitivity (redness, raised follicles), and hair density. Understanding the scalp condition is essential before recommending any treatment.',
        tip: 'An oily scalp with dry ends is the most common combination. Treat the scalp and ends differently in the same service.',
      },
      {
        title: 'Matching Treatment to Condition',
        body: 'Dandruff (malassezia fungus): antifungal treatments (zinc pyrithione, selenium sulphide). Dry scalp: hydrating treatments (hyaluronic acid, ceramides). Oily scalp: sebum-regulating treatments (salicylic acid, niacinamide). Hair loss: scalp-stimulating treatments with caffeine or minoxidil-adjacent ingredients.',
        tip: 'Never diagnose medical conditions. If you see severe inflammation, pustules, or persistent hair loss, refer the client to a trichologist or GP.',
      },
      {
        title: 'Application Protocol',
        body: 'Always apply scalp treatments to a clean, shampooed scalp. Section hair into 4 quadrants. Apply with a dropper or applicator tip directly to the scalp, not the hair shaft. Massage for 2–3 minutes to stimulate circulation. Leave on for the specified processing time.',
        tip: 'A thorough scalp massage not only helps product penetration — it increases blood flow, stimulates growth, and is one of the most memorable parts of a salon visit.',
      },
      {
        title: 'Retail Recommendations',
        body: 'Retail is part of professional care, not a sales pitch. Recommend 2–3 products maximum per visit with specific usage instructions. "Use this twice a week after shampooing, leave for 5 minutes." Clients who buy retail have a 70% higher retention rate — they continue the salon results at home.',
        tip: 'Mention the product during the service when it is relevant — not awkwardly at the till. "I am using X on you today, you can get this to use at home."',
      },
    ],
    quiz: [
      { q: 'Which ingredient is most effective for an oily, sebum-overproducing scalp?', options: ['Hyaluronic acid', 'Ceramides', 'Salicylic acid', 'Castor oil'], correct: 2, explain: 'Salicylic acid is a keratolytic agent that dissolves excess sebum, unblocks follicles, and regulates oil production.' },
      { q: 'Where should a scalp treatment product be applied?', options: ['Throughout the hair length', 'Only to dry ends', 'Directly to the scalp in quadrant sections', 'To damp hair before shampooing'], correct: 2, explain: 'Scalp treatments must be applied directly to the scalp tissue, not the hair shaft, for maximum efficacy.' },
      { q: 'What should a stylist do if they observe pustules or severe inflammation on a client\'s scalp?', options: ['Recommend an anti-dandruff shampoo', 'Proceed with the planned service', 'Refer the client to a trichologist or GP', 'Apply a stronger treatment'], correct: 2, explain: 'Medical conditions are outside a stylist\'s scope of practice — always refer to qualified healthcare professionals.' },
      { q: 'How many retail products should be recommended per visit for the highest conversion?', options: ['1 product only', '2–3 specific products', '5 or more for a full routine', 'As many as possible'], correct: 1, explain: 'Recommending 2–3 targeted products with specific usage instructions is far more effective than overwhelming clients with a full product range.' },
      { q: 'What is the primary benefit of a scalp massage during treatment application?', options: ['It replaces the need for shampooing', 'It stimulates blood flow and aids product absorption', 'It removes product faster', 'It reduces processing time'], correct: 1, explain: 'Scalp massage increases circulation, stimulates hair follicles, and improves product penetration — and is one of the highest-rated client experiences.' },
    ],
  },
];

const PASSING_SCORE = 60; // %

function getCatStyle(category) {
  const map = {
    Color:    { bg: 'rgba(201,168,76,0.10)',  border: 'rgba(201,168,76,0.22)',  text: '#C9A84C' },
    Bleach:   { bg: 'rgba(232,221,208,0.08)', border: 'rgba(232,221,208,0.18)', text: '#E8DDD0' },
    Treatment:{ bg: 'rgba(160,184,154,0.10)', border: 'rgba(160,184,154,0.22)', text: '#A0B89A' },
    Consult:  { bg: 'rgba(123,167,188,0.10)', border: 'rgba(123,167,188,0.22)', text: '#7BA7BC' },
  };
  return map[category] || map.Color;
}

/* ── Progress helpers ─────────────────────────────────────── */
function loadProgress(stylistId) {
  try { return JSON.parse(localStorage.getItem(`training_${stylistId}`) || '{}'); }
  catch { return {}; }
}
function saveProgress(stylistId, data) {
  localStorage.setItem(`training_${stylistId}`, JSON.stringify(data));
}

/* ── Quiz Component ───────────────────────────────────────── */
function Quiz({ course, onComplete }) {
  const [qIdx, setQIdx]         = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);

  const q = course.quiz[qIdx];
  const total = course.quiz.length;
  const pct = Math.round((score / total) * 100);
  const passed = pct >= PASSING_SCORE;

  const pick = (i) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === q.correct) setScore(s => s + 1);
    setTimeout(() => {
      if (qIdx + 1 < total) {
        setQIdx(q => q + 1);
        setSelected(null);
        setAnswered(false);
      } else {
        setDone(true);
      }
    }, 1400);
  };

  const retry = () => { setQIdx(0); setSelected(null); setAnswered(false); setScore(0); setDone(false); };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center py-10 px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: passed ? 'rgba(74,112,85,0.12)' : 'rgba(155,59,59,0.10)', border: `1px solid ${passed ? 'rgba(74,112,85,0.30)' : 'rgba(155,59,59,0.25)'}` }}>
          {passed ? <Trophy size={32} className="text-sage" /> : <RotateCcw size={32} className="text-ruby" />}
        </motion.div>
        <h3 className="text-xl font-display text-cream-200 mb-1">{passed ? 'Well Done!' : 'Keep Practising'}</h3>
        <p className="text-sm text-warm-500 mb-2">You scored</p>
        <p className="text-4xl font-bold mb-1" style={{ color: passed ? '#A0B89A' : '#9B3B3B' }}>{pct}%</p>
        <p className="text-2xs text-warm-700 mb-6">{score} of {total} correct · {passed ? `Pass (≥${PASSING_SCORE}%)` : `Fail (<${PASSING_SCORE}%)`}</p>
        {passed && (
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl mb-6"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)' }}>
            <Star size={12} className="text-gold" />
            <span className="text-2xs text-gold font-medium">Week {course.week} complete — Certificate earned</span>
          </div>
        )}
        <div className="flex gap-3">
          {!passed && (
            <button onClick={retry} className="btn-ghost">
              <RotateCcw size={13} /> Retry Quiz
            </button>
          )}
          <button onClick={() => onComplete(pct)} className="btn-gold">
            {passed ? <><CheckCircle2 size={13} /> Finish</> : <><ArrowLeft size={13} /> Back to Course</>}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xs text-warm-700">Question {qIdx + 1} of {total}</span>
          <span className="text-2xs text-warm-700">{Math.round(((qIdx) / total) * 100)}% complete</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #C9A84C, #DFC06A)' }}
            animate={{ width: `${((qIdx) / total) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div key={qIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }} className="space-y-4">
          <div className="rounded-2xl px-5 py-4" style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[14px] font-semibold text-cream-200 leading-relaxed">{q.q}</p>
          </div>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              let borderColor = 'rgba(255,255,255,0.07)';
              let bg = '#1C1A17';
              let textColor = 'text-warm-400';
              if (answered) {
                if (i === q.correct) { borderColor = 'rgba(74,112,85,0.50)'; bg = 'rgba(74,112,85,0.10)'; textColor = 'text-sage'; }
                else if (i === selected) { borderColor = 'rgba(155,59,59,0.50)'; bg = 'rgba(155,59,59,0.10)'; textColor = 'text-ruby'; }
              } else if (selected === i) {
                borderColor = 'rgba(201,168,76,0.40)'; bg = 'rgba(201,168,76,0.07)'; textColor = 'text-cream-200';
              }
              return (
                <motion.button key={i} onClick={() => pick(i)} disabled={answered}
                  whileTap={!answered ? { scale: 0.98 } : {}}
                  className={`w-full text-left px-4 py-3 rounded-xl text-[13px] transition-all duration-300 ${textColor} ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                  style={{ background: bg, border: `1px solid ${borderColor}` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'inherit' }}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    {opt}
                    {answered && i === q.correct && <CheckCircle2 size={14} className="ml-auto text-sage shrink-0" />}
                    {answered && i === selected && i !== q.correct && <AlertTriangle size={14} className="ml-auto text-ruby shrink-0" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
          {answered && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl px-4 py-3 text-[12px] text-warm-500 leading-relaxed"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              💡 {q.explain}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Course Card ──────────────────────────────────────────── */
function CourseCard({ course, progress, isCurrent, onClick, delay }) {
  const p = progress[course.id];
  const done  = p?.quizDone && p?.score >= PASSING_SCORE;
  const tried = p?.quizDone;
  const cat   = getCatStyle(course.category);
  const Icon  = course.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className="relative rounded-2xl p-5 cursor-pointer transition-all duration-200 group overflow-hidden"
      style={{ background: '#161412', border: `1px solid ${isCurrent ? 'rgba(201,168,76,0.22)' : 'rgba(255,255,255,0.06)'}` }}
      whileHover={{ borderColor: `${course.color}30` }}>
      {isCurrent && (
        <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 80%)' }} />
      )}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
            <Icon size={18} style={{ color: cat.text }} strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-1.5">
            {isCurrent && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C' }}>
                THIS WEEK
              </span>
            )}
            {done && <CheckCircle2 size={16} className="text-sage" />}
            {tried && !done && <AlertTriangle size={15} className="text-ruby" />}
          </div>
        </div>
        <p className="text-[10px] font-bold tracking-wider mb-1" style={{ color: cat.text }}>WEEK {course.week}</p>
        <h3 className="text-[14px] font-semibold text-cream-200 mb-1 leading-snug group-hover:text-cream-100 transition-colors">{course.title}</h3>
        <p className="text-2xs text-warm-700 leading-relaxed mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-2xs text-warm-700">
            <Clock size={11} /> {course.duration}
          </div>
          {done
            ? <span className="text-2xs text-sage font-medium">{p.score}% — Passed</span>
            : <div className="flex items-center gap-1 text-2xs" style={{ color: course.color }}>
                <Play size={10} fill="currentColor" /> {tried ? 'Retry' : 'Start'}
              </div>
          }
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Page ────────────────────────────────────────────── */
export default function Training() {
  const { loggedInStylist } = useSalon();
  const stylistId = loggedInStylist?.id || 'guest';

  const [progress, setProgress]           = useState(() => loadProgress(stylistId));
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab]         = useState('learn');
  const [quizKey, setQuizKey]             = useState(0);

  // Determine this week's course (cycles through the 6)
  const weekOfYear = Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (7 * 864e5));
  const currentCourseId = COURSES[(weekOfYear - 1) % COURSES.length].id;

  const completedCount = COURSES.filter(c => progress[c.id]?.quizDone && progress[c.id]?.score >= PASSING_SCORE).length;

  const openCourse = (course) => { setSelectedCourse(course); setActiveTab('learn'); };
  const back = () => { setSelectedCourse(null); };

  const handleQuizComplete = useCallback((score) => {
    const updated = { ...progress, [selectedCourse.id]: { quizDone: true, score, completedAt: Date.now() } };
    setProgress(updated);
    saveProgress(stylistId, updated);
    setQuizKey(k => k + 1);
    if (score >= PASSING_SCORE) setActiveTab('learn');
  }, [selectedCourse, progress, stylistId]);

  const cat = selectedCourse ? getCatStyle(selectedCourse.category) : null;
  const Icon = selectedCourse?.icon;
  const p = selectedCourse ? progress[selectedCourse.id] : null;
  const courseDone = p?.quizDone && p?.score >= PASSING_SCORE;

  return (
    <div className="space-y-6">

      {/* ── Course List ── */}
      <AnimatePresence mode="wait">
        {!selectedCourse && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="section-label mb-1.5">Staff Development</p>
                <h1 className="text-2xl font-display text-cream-200 tracking-tight">Weekly Training</h1>
                <p className="text-sm text-warm-600 mt-1">
                  {completedCount} of {COURSES.length} courses completed
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  {[...Array(COURSES.length)].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full transition-all"
                      style={{ background: i < completedCount ? '#A0B89A' : 'rgba(255,255,255,0.08)' }} />
                  ))}
                </div>
                <p className="text-2xs text-warm-700 mt-1">{Math.round((completedCount / COURSES.length) * 100)}% complete</p>
              </div>
            </div>

            {/* Featured this-week course */}
            {(() => {
              const featured = COURSES.find(c => c.id === currentCourseId);
              const fp = progress[featured.id];
              const FIcon = featured.icon;
              const fcat = getCatStyle(featured.category);
              const fdone = fp?.quizDone && fp?.score >= PASSING_SCORE;
              return (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => openCourse(featured)}
                  className="relative rounded-2xl p-6 mb-5 cursor-pointer overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, #161412 60%)', border: '1px solid rgba(201,168,76,0.20)' }}>
                  <div className="absolute top-0 right-0 bottom-0 w-1/3 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at right center, rgba(201,168,76,0.06), transparent 70%)' }} />
                  <div className="relative z-10 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: fcat.bg, border: `1px solid ${fcat.border}` }}>
                      <FIcon size={24} style={{ color: fcat.text }} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold tracking-wider text-gold">THIS WEEK · WEEK {featured.week}</span>
                        {fdone && <CheckCircle2 size={13} className="text-sage" />}
                      </div>
                      <h2 className="text-[16px] font-semibold text-cream-200 mb-0.5">{featured.title}</h2>
                      <p className="text-2xs text-warm-700 leading-relaxed line-clamp-1">{featured.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-2xs text-warm-700 flex items-center gap-1"><Clock size={10} /> {featured.duration}</span>
                        <span className="text-2xs" style={{ color: fcat.text }}>{featured.category}</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-warm-700 shrink-0" />
                  </div>
                </motion.div>
              );
            })()}

            {/* All courses grid */}
            <p className="section-label mb-3">All Modules</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COURSES.map((course, i) => (
                <CourseCard key={course.id} course={course} progress={progress}
                  isCurrent={course.id === currentCourseId}
                  onClick={() => openCourse(course)} delay={i * 0.06} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Course Detail ── */}
        {selectedCourse && (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}>

            {/* Course header */}
            <div className="flex items-start gap-4 mb-6">
              <button onClick={back} className="mt-1 btn-ghost px-2.5 py-1.5 shrink-0">
                <ArrowLeft size={14} />
              </button>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                  <Icon size={20} style={{ color: cat.text }} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold tracking-wider mb-0.5" style={{ color: cat.text }}>
                    WEEK {selectedCourse.week} · {selectedCourse.category.toUpperCase()}
                  </p>
                  <h1 className="text-xl font-display text-cream-200 tracking-tight truncate">{selectedCourse.title}</h1>
                </div>
                {courseDone && (
                  <div className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(74,112,85,0.10)', border: '1px solid rgba(74,112,85,0.25)' }}>
                    <Trophy size={12} className="text-sage" />
                    <span className="text-2xs text-sage font-medium">{p.score}% Passed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-1 p-1 rounded-xl mb-5 w-fit"
              style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
              {[{ id: 'learn', label: 'Learn', icon: BookOpen }, { id: 'quiz', label: 'Quiz', icon: GraduationCap }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200"
                  style={activeTab === tab.id
                    ? { background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.05))', color: '#DFC06A', border: '1px solid rgba(201,168,76,0.18)' }
                    : { color: '#7A6452', border: '1px solid transparent' }}>
                  <tab.icon size={13} /> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">

              {/* Learn tab */}
              {activeTab === 'learn' && (
                <motion.div key="learn" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} className="space-y-4">
                  {selectedCourse.sections.map((section, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="rounded-2xl p-5 sm:p-6"
                      style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                          style={{ background: cat.bg, color: cat.text }}>{i + 1}</div>
                        <h3 className="text-[14px] font-semibold text-cream-200">{section.title}</h3>
                      </div>
                      <p className="text-[13px] text-warm-500 leading-relaxed mb-4">{section.body}</p>
                      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                        style={{ background: `${selectedCourse.color}08`, border: `1px solid ${selectedCourse.color}18` }}>
                        <Zap size={12} style={{ color: selectedCourse.color }} className="mt-0.5 shrink-0" />
                        <p className="text-[12px] leading-relaxed" style={{ color: selectedCourse.color }}>{section.tip}</p>
                      </div>
                    </motion.div>
                  ))}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                    className="flex justify-center pt-2">
                    <button onClick={() => setActiveTab('quiz')} className="btn-gold">
                      <GraduationCap size={14} /> Take the Quiz
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* Quiz tab */}
              {activeTab === 'quiz' && (
                <motion.div key="quiz" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl p-5 sm:p-6"
                  style={{ background: '#161412', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-[15px] font-semibold text-cream-200">Knowledge Check</h2>
                      <p className="text-2xs text-warm-700 mt-0.5">{selectedCourse.quiz.length} questions · Pass mark {PASSING_SCORE}%</p>
                    </div>
                    {p?.quizDone && (
                      <span className="text-2xs px-2.5 py-1 rounded-lg"
                        style={courseDone
                          ? { background: 'rgba(74,112,85,0.10)', color: '#A0B89A', border: '1px solid rgba(74,112,85,0.25)' }
                          : { background: 'rgba(155,59,59,0.08)', color: '#C47C7C', border: '1px solid rgba(155,59,59,0.20)' }}>
                        Last: {p.score}%
                      </span>
                    )}
                  </div>
                  <Quiz key={quizKey} course={selectedCourse} onComplete={handleQuizComplete} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
