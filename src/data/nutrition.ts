import type { Goal, NutritionCategory, NutritionTip } from '@/types';

/**
 * All nutrition copy is pre-written by the ProjectBuilt coach (qualified personal
 * trainer with a nutrition qualification). No AI-generated content.
 * This is general guidance only — not individual dietary advice.
 */

export const NUTRITION_CATEGORIES: { id: NutritionCategory; title: string; icon: string }[] = [
  { id: 'goal', title: 'For your goal', icon: 'flag-outline' },
  { id: 'protein', title: 'Protein', icon: 'egg-outline' },
  { id: 'carbs', title: 'Carbohydrates', icon: 'nutrition-outline' },
  { id: 'hydration', title: 'Hydration', icon: 'water-outline' },
  { id: 'meal_timing', title: 'Meal timing', icon: 'time-outline' },
  { id: 'supplements', title: 'Supplements', icon: 'flask-outline' },
];

export const GOAL_LABELS: Record<Goal, string> = {
  fat_loss: 'Fat loss',
  build_muscle: 'Build muscle',
  general_fitness: 'General fitness',
  endurance: 'Improve endurance',
};

export const NUTRITION_TIPS: NutritionTip[] = [
  // ───────── Goal: Fat loss ─────────
  {
    id: 'fl-deficit',
    category: 'goal',
    goals: ['fat_loss'],
    premium: false,
    title: 'A modest deficit wins',
    body:
      'Fat loss comes down to eating slightly less energy than you burn. Aim for a deficit of roughly 300–500 kcal a day — enough to lose around 0.5–1% of your body weight per week. Bigger deficits feel great for a fortnight, then hunger, poor sleep and flat training catch up with you. Slow and steady keeps your muscle and your sanity.',
  },
  {
    id: 'fl-volume',
    category: 'goal',
    goals: ['fat_loss'],
    premium: false,
    title: 'Eat for volume',
    body:
      'Build meals around foods that fill you up for few calories: vegetables, salad, fruit, potatoes, soups, lean meat, fish, eggs and Greek yoghurt. Half your plate as veg is a simple rule that makes a deficit far easier to stick to.',
  },
  {
    id: 'fl-liquid',
    category: 'goal',
    goals: ['fat_loss'],
    premium: false,
    title: 'Watch liquid calories',
    body:
      'Fancy coffees, fruit juices, fizzy drinks and alcohol add up quickly and barely touch your hunger. Swapping two sugary drinks a day for water or diet versions can easily save 200–300 kcal without changing a single meal.',
  },
  {
    id: 'fl-diet-break',
    category: 'goal',
    goals: ['fat_loss'],
    premium: true,
    title: 'Plan diet breaks',
    body:
      'After 8–12 weeks of dieting, take 1–2 weeks eating at maintenance. Keep protein high and keep training. It restores energy, training performance and adherence, and research suggests you lose no more slowly overall. Think of it as a pit stop, not quitting.',
  },
  {
    id: 'fl-weekends',
    category: 'goal',
    goals: ['fat_loss'],
    premium: true,
    title: 'Fix your weekends',
    body:
      'Many clients are "on plan" Monday to Friday and undo it all by Sunday. Average your intake across 7 days — if weekends are 1,000 kcal over, your weekday deficit has gone. Plan one meal out, keep breakfast and lunch normal, and decide your drinks before you go out.',
  },

  // ───────── Goal: Build muscle ─────────
  {
    id: 'bm-surplus',
    category: 'goal',
    goals: ['build_muscle'],
    premium: false,
    title: 'A small surplus is enough',
    body:
      'To build muscle efficiently, eat around 200–300 kcal above maintenance. Aim to gain roughly 0.25–0.5% of body weight per month if you\'re experienced, or a little faster as a beginner. Gaining much quicker than that is mostly fat.',
  },
  {
    id: 'bm-progress',
    category: 'goal',
    goals: ['build_muscle'],
    premium: false,
    title: 'Food fuels progressive overload',
    body:
      'Nutrition supports muscle growth, but training drives it. Make sure your weights or reps are going up over time — log every session in ProjectBuilt and try to beat last week. If your lifts stall for 3+ weeks and your weight isn\'t moving, add 100–150 kcal a day.',
  },
  {
    id: 'bm-hardgainer',
    category: 'goal',
    goals: ['build_muscle'],
    premium: true,
    title: 'Struggling to eat enough?',
    body:
      'Use calorie-dense foods: whole milk, nut butters, oats, olive oil, rice, dried fruit and granola. Add a fourth meal or a shake (milk, oats, banana, peanut butter, whey) — easily 700+ kcal. Eat on a schedule rather than waiting to feel hungry.',
  },
  {
    id: 'bm-bulk-length',
    category: 'goal',
    goals: ['build_muscle'],
    premium: true,
    title: 'Run long, lean bulks',
    body:
      'Muscle builds slowly. A lean gaining phase of 4–6 months will produce far better results than short, aggressive "dirty bulks". Track your waist measurement alongside your weight — if your waist is climbing quickly, reduce your surplus.',
  },

  // ───────── Goal: General fitness ─────────
  {
    id: 'gf-plate',
    category: 'goal',
    goals: ['general_fitness'],
    premium: false,
    title: 'Build a balanced plate',
    body:
      'A simple template for most meals: a palm or two of protein, a fist or two of vegetables, a cupped hand of carbs and a thumb of fats. It\'s not perfect science, but it gets most people 80% of the way there without tracking anything.',
  },
  {
    id: 'gf-8020',
    category: 'goal',
    goals: ['general_fitness'],
    premium: false,
    title: 'The 80/20 approach',
    body:
      'Aim for around 80% of your food to be minimally processed — meat, fish, eggs, dairy, fruit, veg, whole grains, beans — and enjoy the other 20% guilt-free. Consistency over perfection beats any strict diet you can\'t sustain.',
  },
  {
    id: 'gf-fibre',
    category: 'goal',
    goals: ['general_fitness'],
    premium: true,
    title: 'Don\'t forget fibre',
    body:
      'The NHS recommends 30g of fibre a day, and most UK adults eat around 20g. Add oats, beans, lentils, wholegrain bread, berries and veg. Better digestion, steadier energy and better appetite control are all linked to higher fibre intake.',
  },

  // ───────── Goal: Endurance ─────────
  {
    id: 'en-carbs',
    category: 'goal',
    goals: ['endurance'],
    premium: false,
    title: 'Carbs are your fuel',
    body:
      'Endurance training runs on carbohydrate. On heavy training days aim for around 5–7g of carbs per kg of body weight; on lighter days 3–5g/kg. Under-fuelling is the most common reason runners and cyclists feel flat.',
  },
  {
    id: 'en-long',
    category: 'goal',
    goals: ['endurance'],
    premium: false,
    title: 'Fuel long sessions',
    body:
      'For sessions over 75–90 minutes, take on 30–60g of carbohydrate per hour — gels, sports drinks, bananas or jelly sweets. Practise this in training, never try something new on race day.',
  },
  {
    id: 'en-recovery',
    category: 'goal',
    goals: ['endurance'],
    premium: true,
    title: 'Recovery between sessions',
    body:
      'If you train twice in a day or have back-to-back hard days, eat carbs plus protein (roughly 1g/kg carbs and 20–30g protein) within an hour after training. Chocolate milk is a genuinely effective, cheap option.',
  },
  {
    id: 'en-iron',
    category: 'goal',
    goals: ['endurance'],
    premium: true,
    title: 'Keep an eye on iron',
    body:
      'Endurance athletes — particularly women — are at higher risk of low iron, which shows up as fatigue and poor performance. Include red meat, dark leafy greens, beans and fortified cereals. If you feel persistently tired, ask your GP for a blood test rather than self-supplementing.',
  },

  // ───────── Protein ─────────
  {
    id: 'pr-how-much',
    category: 'protein',
    goals: 'all',
    premium: false,
    title: 'How much protein?',
    body:
      'For people who train, around 1.6–2.2g of protein per kg of body weight per day is a solid target. For an 80kg person that\'s 130–175g. If you\'re carrying a lot of body fat, base it on your goal weight instead.',
  },
  {
    id: 'pr-sources',
    category: 'protein',
    goals: 'all',
    premium: false,
    title: 'Best protein sources',
    body:
      'Chicken, turkey, lean beef, fish, eggs, Greek yoghurt, cottage cheese, skyr and milk are all excellent. Plant-based? Tofu, tempeh, seitan, lentils, edamame and a pea/soy protein powder will get you there — combine sources across the day.',
  },
  {
    id: 'pr-spread',
    category: 'protein',
    goals: 'all',
    premium: false,
    title: 'Spread it out',
    body:
      'Split your protein across 3–5 meals of roughly 25–40g each. Breakfast is where most people fall short — eggs, Greek yoghurt or a protein porridge make an easy win.',
  },
  {
    id: 'pr-timing',
    category: 'protein',
    goals: 'all',
    premium: true,
    title: 'Does post-workout timing matter?',
    body:
      'The "anabolic window" is much wider than gym folklore suggests. If you\'ve eaten a protein-containing meal within a few hours before training, there\'s no need to rush a shake. Total daily protein matters far more than precise timing. If you train fasted first thing, eat soon after.',
  },
  {
    id: 'pr-satiety',
    category: 'protein',
    goals: ['fat_loss'],
    premium: true,
    title: 'Protein keeps you full',
    body:
      'Protein is the most filling macronutrient and helps you keep muscle while dieting. When fat loss stalls because of hunger, increasing protein (towards 2.2g/kg) is usually the first lever I pull with clients.',
  },

  // ───────── Carbohydrates ─────────
  {
    id: 'cb-pre',
    category: 'carbs',
    goals: 'all',
    premium: false,
    title: 'Pre-workout fuel',
    body:
      'Eat a meal with carbs and some protein 2–3 hours before training — e.g. chicken, rice and veg, or porridge with yoghurt. Short on time? A banana, rice cakes with jam or a slice of toast 30–60 minutes before is plenty.',
  },
  {
    id: 'cb-post',
    category: 'carbs',
    goals: 'all',
    premium: false,
    title: 'Post-workout refuel',
    body:
      'After training, a normal meal with carbs and protein is all you need: think wraps, rice bowls, potatoes, pasta or a bagel with eggs. Carbs replenish muscle glycogen; protein kick-starts repair.',
  },
  {
    id: 'cb-not-enemy',
    category: 'carbs',
    goals: 'all',
    premium: false,
    title: 'Carbs aren\'t the enemy',
    body:
      'Carbs don\'t make you gain fat — a calorie surplus does. Low-carb diets can work if you prefer them, but most people training hard perform and recover better with carbs in the diet. Choose mostly whole-food sources: oats, potatoes, rice, fruit, wholegrain bread.',
  },
  {
    id: 'cb-periodise',
    category: 'carbs',
    goals: ['endurance', 'build_muscle'],
    premium: true,
    title: 'Match carbs to your training',
    body:
      'Put more of your carbohydrate on hard training days and around your sessions, and a bit less on rest days. Your total calories can stay similar — just shift some carbs to fats/protein on easy days.',
  },

  // ───────── Hydration ─────────
  {
    id: 'hy-daily',
    category: 'hydration',
    goals: 'all',
    premium: false,
    title: 'Daily target',
    body:
      'The NHS recommends 6–8 glasses (around 1.5–2 litres) of fluid a day, and you\'ll need more when training or in warm weather. A practical guide: roughly 30–35ml per kg of body weight, plus extra for exercise.',
  },
  {
    id: 'hy-urine',
    category: 'hydration',
    goals: 'all',
    premium: false,
    title: 'Use the colour check',
    body:
      'Pale straw-coloured urine generally means you\'re well hydrated. Dark yellow means drink more. Keep a bottle with you — it\'s the simplest habit to build.',
  },
  {
    id: 'hy-training',
    category: 'hydration',
    goals: 'all',
    premium: false,
    title: 'Drink around training',
    body:
      'Have 400–600ml of water in the 2 hours before training, sip during the session, and rehydrate afterwards. Even 2% dehydration can noticeably reduce strength and endurance.',
  },
  {
    id: 'hy-electrolytes',
    category: 'hydration',
    goals: ['endurance'],
    premium: true,
    title: 'Electrolytes for heavy sweaters',
    body:
      'For sessions longer than an hour, or in hot conditions, add electrolytes (especially sodium) to your drinks. If you finish sessions with white salt marks on your clothes, you\'re a salty sweater and will benefit most.',
  },

  // ───────── Meal timing ─────────
  {
    id: 'mt-consistency',
    category: 'meal_timing',
    goals: 'all',
    premium: false,
    title: 'Consistency beats timing',
    body:
      'There\'s no magic number of meals. Three meals or five — choose the rhythm that fits your life and keeps you in control of your appetite. Total intake across the day matters most.',
  },
  {
    id: 'mt-breakfast',
    category: 'meal_timing',
    goals: 'all',
    premium: false,
    title: 'Breakfast: optional, but useful',
    body:
      'Skipping breakfast is fine if it suits you. But if you find yourself overeating in the evening, a protein-rich breakfast often helps control appetite for the rest of the day.',
  },
  {
    id: 'mt-evening',
    category: 'meal_timing',
    goals: 'all',
    premium: false,
    title: 'Eating late at night',
    body:
      'Eating late doesn\'t automatically cause fat gain. That said, a very large meal right before bed can affect sleep quality. Aim to finish big meals 2–3 hours before bed, and choose something light like yoghurt or cottage cheese if you\'re hungry later.',
  },
  {
    id: 'mt-fasting',
    category: 'meal_timing',
    goals: ['fat_loss'],
    premium: true,
    title: 'Intermittent fasting — worth it?',
    body:
      'Intermittent fasting works for some people because it reduces the time window in which you can eat, which lowers total intake. It has no unique fat-burning magic. If it helps you stay consistent, use it; if it makes you binge later, drop it.',
  },
  {
    id: 'mt-prep',
    category: 'meal_timing',
    goals: 'all',
    premium: true,
    title: 'Batch cook twice a week',
    body:
      'Cook 2–3 proteins and 2 carb sources on Sunday and Wednesday. Mix and match with fresh veg and sauces through the week. The people who make the most progress are rarely the most disciplined — they\'re the most prepared.',
  },

  // ───────── Supplements ─────────
  {
    id: 'sp-creatine',
    category: 'supplements',
    goals: 'all',
    premium: false,
    title: 'Creatine — worth it',
    body:
      'Creatine monohydrate is the most researched supplement in sport. 3–5g a day, every day, at any time. No need to "load" or cycle it. It helps strength, power and muscle gain. Plain monohydrate is all you need — ignore fancy versions.',
  },
  {
    id: 'sp-vitd',
    category: 'supplements',
    goals: 'all',
    premium: false,
    title: 'Vitamin D in UK winters',
    body:
      'The NHS advises everyone in the UK to consider 10 micrograms (400 IU) of vitamin D daily during autumn and winter, as we can\'t make enough from sunlight between October and March.',
  },
  {
    id: 'sp-whey',
    category: 'supplements',
    goals: 'all',
    premium: false,
    title: 'Protein powder is just food',
    body:
      'Whey or plant protein is a convenient way to hit your protein target — not a requirement. If you get enough from food, you don\'t need it. Choose a brand with third-party testing (e.g. Informed Sport) if you compete.',
  },
  {
    id: 'sp-caffeine',
    category: 'supplements',
    goals: 'all',
    premium: true,
    title: 'Caffeine — useful, with limits',
    body:
      'Caffeine (around 3mg/kg, 30–60 minutes before training) can improve performance. A strong coffee does the same job as most pre-workouts at a fraction of the price. Avoid it within 8 hours of bed, and stay under 400mg a day.',
  },
  {
    id: 'sp-skip',
    category: 'supplements',
    goals: 'all',
    premium: true,
    title: 'What to skip',
    body:
      'BCAAs (pointless if you eat enough protein), fat burners, detox teas, testosterone boosters and most "proprietary blends". They\'re expensive and largely unsupported by evidence. Spend that money on good food instead.',
  },
  {
    id: 'sp-omega',
    category: 'supplements',
    goals: 'all',
    premium: true,
    title: 'Omega-3 if you don\'t eat fish',
    body:
      'The NHS recommends two portions of fish a week, one oily (salmon, mackerel, sardines). If you rarely eat fish, an omega-3 fish oil or algae oil supplement is a reasonable choice. Speak to your GP first if you take blood-thinning medication.',
  },
];

export const NUTRITION_DISCLAIMER =
  'This content is general information written by a qualified personal trainer and is not a substitute for individual advice from a registered dietitian or your GP — particularly if you are pregnant, have a medical condition or take medication.';
