import type { ExerciseEquipment, LibraryExercise, MuscleGroup } from '@/types';

const ex = (
  id: string,
  name: string,
  primary: MuscleGroup,
  secondary: MuscleGroup[],
  equipment: ExerciseEquipment,
  instructions: string[],
): LibraryExercise => ({ id, name, primary, secondary, equipment, instructions });

export const EXERCISES: LibraryExercise[] = [
  // ───────────── CHEST ─────────────
  ex('push-up', 'Push-Up', 'chest', ['triceps', 'shoulders', 'core'], 'bodyweight', [
    'Start in a high plank, hands slightly wider than shoulder-width, body in a straight line.',
    'Brace your core and squeeze your glutes.',
    'Lower your chest towards the floor, elbows at roughly 45° to your body.',
    'Press back up to full arm extension without letting your hips sag.',
  ]),
  ex('incline-push-up', 'Incline Push-Up', 'chest', ['triceps', 'shoulders'], 'bodyweight', [
    'Place your hands on a bench or sturdy surface, slightly wider than shoulders.',
    'Walk your feet back so your body forms a straight line.',
    'Lower your chest to the edge of the surface under control.',
    'Push back to the start. The higher the surface, the easier the movement.',
  ]),
  ex('decline-push-up', 'Decline Push-Up', 'chest', ['shoulders', 'triceps'], 'bodyweight', [
    'Place your feet on a bench and hands on the floor, shoulder-width apart.',
    'Keep a straight line from head to heels.',
    'Lower your chest to just above the floor.',
    'Press back up powerfully, keeping your core tight.',
  ]),
  ex('diamond-push-up', 'Diamond Push-Up', 'triceps', ['chest', 'shoulders'], 'bodyweight', [
    'From a plank, bring your hands together so thumbs and index fingers form a diamond.',
    'Keep elbows tucked close to your sides as you lower.',
    'Touch your chest lightly to your hands.',
    'Press back up to full extension.',
  ]),
  ex('barbell-bench-press', 'Barbell Bench Press', 'chest', ['triceps', 'shoulders'], 'barbell', [
    'Lie on a flat bench, eyes under the bar, feet planted firmly.',
    'Grip slightly wider than shoulder-width, retract and depress your shoulder blades.',
    'Unrack and lower the bar to your mid-chest with elbows around 45–70°.',
    'Press the bar back up and slightly towards your face until arms are locked out.',
    'Always use safety arms or a spotter for heavy sets.',
  ]),
  ex('incline-barbell-press', 'Incline Barbell Press', 'chest', ['shoulders', 'triceps'], 'barbell', [
    'Set the bench to 30–45° and lie back with feet planted.',
    'Grip just wider than shoulder-width and unrack.',
    'Lower the bar to your upper chest, just below the collarbones.',
    'Press back to lockout, keeping shoulder blades pinned.',
  ]),
  ex('db-bench-press', 'Dumbbell Bench Press', 'chest', ['triceps', 'shoulders'], 'dumbbell', [
    'Sit on a flat bench with dumbbells on your thighs, then lie back and bring them to chest level.',
    'Press the dumbbells up until arms are straight, palms facing forward.',
    'Lower slowly until the dumbbells are level with your chest, elbows at ~45°.',
    'Press back up, bringing the dumbbells slightly together at the top.',
  ]),
  ex('incline-db-press', 'Incline Dumbbell Press', 'chest', ['shoulders', 'triceps'], 'dumbbell', [
    'Set a bench to 30–45° and lie back with a dumbbell in each hand at shoulder level.',
    'Press up and slightly inward until arms are extended.',
    'Lower under control to the sides of your upper chest.',
    'Keep your feet planted and back in contact with the bench.',
  ]),
  ex('db-fly', 'Dumbbell Fly', 'chest', ['shoulders'], 'dumbbell', [
    'Lie on a flat bench holding dumbbells above your chest, palms facing each other.',
    'With a slight bend in the elbows, open your arms in a wide arc.',
    'Lower until you feel a stretch across your chest (around chest level).',
    'Squeeze your chest to bring the dumbbells back together above you.',
  ]),
  ex('cable-crossover', 'Cable Crossover', 'chest', ['shoulders'], 'cable', [
    'Set both pulleys high and grab a handle in each hand.',
    'Step forward into a split stance, slight lean forward, soft elbows.',
    'Bring your hands down and together in front of your lower chest.',
    'Return slowly until you feel a stretch, keeping the elbow angle fixed.',
  ]),
  ex('chest-press-machine', 'Machine Chest Press', 'chest', ['triceps', 'shoulders'], 'machine', [
    'Adjust the seat so handles line up with mid-chest.',
    'Sit tall with your back against the pad and grip the handles.',
    'Press forward until arms are nearly straight.',
    'Return slowly, stopping before the weight stack touches down.',
  ]),
  ex('pec-deck', 'Pec Deck', 'chest', ['shoulders'], 'machine', [
    'Adjust the seat so the handles are at chest height.',
    'Sit with your back flat against the pad, elbows slightly bent.',
    'Bring the handles together in front of your chest, squeezing your pecs.',
    'Return under control until you feel a stretch.',
  ]),
  ex('chest-dip', 'Chest Dip', 'chest', ['triceps', 'shoulders'], 'bodyweight', [
    'Support yourself on parallel bars with straight arms.',
    'Lean your torso forward about 30° and let your elbows flare slightly.',
    'Lower until your shoulders are just below your elbows.',
    'Press back up to the start without locking out aggressively.',
  ]),

  // ───────────── BACK ─────────────
  ex('pull-up', 'Pull-Up', 'back', ['biceps', 'core'], 'bodyweight', [
    'Hang from a bar with an overhand grip slightly wider than shoulder-width.',
    'Pull your shoulder blades down and back to initiate.',
    'Pull until your chin clears the bar, driving elbows towards your hips.',
    'Lower all the way to a dead hang under control.',
  ]),
  ex('chin-up', 'Chin-Up', 'back', ['biceps'], 'bodyweight', [
    'Hang from a bar with an underhand grip, shoulder-width apart.',
    'Brace your core and pull your chest towards the bar.',
    'Get your chin over the bar, squeezing your lats and biceps.',
    'Lower slowly to full arm extension.',
  ]),
  ex('inverted-row', 'Inverted Row', 'back', ['biceps', 'core'], 'bodyweight', [
    'Lie under a bar set at waist height (or a sturdy table edge) and grip it overhand.',
    'Keep your body straight from head to heels, heels on the floor.',
    'Pull your chest to the bar, squeezing your shoulder blades together.',
    'Lower to full arm extension. Bend your knees to make it easier.',
  ]),
  ex('superman', 'Superman Hold', 'back', ['glutes', 'core'], 'bodyweight', [
    'Lie face down with arms extended overhead.',
    'Simultaneously lift your arms, chest and legs off the floor.',
    'Hold for 2–3 seconds, squeezing your lower back and glutes.',
    'Lower with control and repeat.',
  ]),
  ex('barbell-row', 'Barbell Bent-Over Row', 'back', ['biceps', 'core'], 'barbell', [
    'Hold a barbell with an overhand grip, feet hip-width apart.',
    'Hinge at the hips until your torso is around 45°, back flat.',
    'Row the bar to your lower ribs, driving elbows back.',
    'Lower under control to full arm extension.',
  ]),
  ex('deadlift', 'Conventional Deadlift', 'back', ['legs', 'glutes', 'core'], 'barbell', [
    'Stand with mid-foot under the bar, feet hip-width apart.',
    'Hinge and grip the bar just outside your legs.',
    'Drop your hips, chest up, flat back, and take the slack out of the bar.',
    'Push the floor away, extending hips and knees together until standing tall.',
    'Return the bar to the floor by hinging at the hips first.',
  ]),
  ex('db-row', 'Single-Arm Dumbbell Row', 'back', ['biceps'], 'dumbbell', [
    'Place one knee and hand on a bench, other foot on the floor.',
    'Hold a dumbbell in your free hand with your arm extended.',
    'Row the dumbbell towards your hip, keeping your elbow close.',
    'Lower slowly to a full stretch. Complete all reps then switch sides.',
  ]),
  ex('lat-pulldown', 'Lat Pulldown', 'back', ['biceps'], 'cable', [
    'Sit with thighs secured under the pads, grip the bar wider than shoulders.',
    'Lean back slightly and pull the bar to your upper chest.',
    'Drive your elbows down towards your hips.',
    'Return slowly to full stretch overhead.',
  ]),
  ex('seated-cable-row', 'Seated Cable Row', 'back', ['biceps'], 'cable', [
    'Sit with feet on the platform and knees slightly bent, grab the handle.',
    'Sit tall with a neutral spine.',
    'Pull the handle to your stomach, squeezing your shoulder blades.',
    'Extend your arms forward slowly without rounding your back.',
  ]),
  ex('t-bar-row', 'T-Bar Row', 'back', ['biceps'], 'barbell', [
    'Straddle the bar and grip the handle with both hands.',
    'Hinge forward with a flat back and soft knees.',
    'Row the weight to your chest, squeezing your mid-back.',
    'Lower with control.',
  ]),
  ex('straight-arm-pulldown', 'Straight-Arm Pulldown', 'back', ['core'], 'cable', [
    'Stand facing a high cable with a straight bar or rope.',
    'Hinge slightly with arms straight in front of you.',
    'Sweep the bar down to your thighs using your lats.',
    'Return slowly to shoulder height.',
  ]),
  ex('rack-pull', 'Rack Pull', 'back', ['glutes', 'legs'], 'barbell', [
    'Set the bar on safety pins at just below knee height.',
    'Set up as for a deadlift: flat back, chest up, grip outside legs.',
    'Drive your hips forward to stand tall, squeezing your upper back.',
    'Lower the bar back to the pins under control.',
  ]),

  // ───────────── SHOULDERS ─────────────
  ex('pike-push-up', 'Pike Push-Up', 'shoulders', ['triceps'], 'bodyweight', [
    'Start in a downward-dog position, hips high, hands shoulder-width.',
    'Bend your elbows to lower the top of your head towards the floor.',
    'Press back up to straight arms.',
    'Elevate your feet to increase difficulty.',
  ]),
  ex('overhead-press', 'Barbell Overhead Press', 'shoulders', ['triceps', 'core'], 'barbell', [
    'Stand with the bar resting on your front shoulders, grip just outside shoulder-width.',
    'Brace your core and squeeze your glutes.',
    'Press the bar straight up, moving your head back slightly to clear it.',
    'Lock out overhead with the bar over mid-foot, then lower to your shoulders.',
  ]),
  ex('db-shoulder-press', 'Dumbbell Shoulder Press', 'shoulders', ['triceps'], 'dumbbell', [
    'Sit or stand holding dumbbells at shoulder height, palms forward.',
    'Press overhead until arms are straight.',
    'Lower slowly back to shoulder level.',
    'Avoid excessively arching your lower back.',
  ]),
  ex('arnold-press', 'Arnold Press', 'shoulders', ['triceps'], 'dumbbell', [
    'Hold dumbbells in front of your shoulders with palms facing you.',
    'As you press up, rotate your palms to face forward.',
    'Finish with arms extended overhead.',
    'Reverse the rotation as you lower.',
  ]),
  ex('lateral-raise', 'Dumbbell Lateral Raise', 'shoulders', [], 'dumbbell', [
    'Stand holding dumbbells at your sides, slight bend in the elbows.',
    'Raise your arms out to the sides to shoulder height.',
    'Lead with your elbows, not your hands.',
    'Lower slowly over 2–3 seconds.',
  ]),
  ex('front-raise', 'Dumbbell Front Raise', 'shoulders', [], 'dumbbell', [
    'Stand holding dumbbells in front of your thighs.',
    'Raise one or both arms forward to shoulder height, arms nearly straight.',
    'Pause briefly at the top.',
    'Lower with control.',
  ]),
  ex('rear-delt-fly', 'Rear Delt Fly', 'shoulders', ['back'], 'dumbbell', [
    'Hinge forward at the hips holding light dumbbells, back flat.',
    'With soft elbows, raise your arms out to the sides.',
    'Squeeze your rear shoulders and upper back at the top.',
    'Lower slowly.',
  ]),
  ex('face-pull', 'Cable Face Pull', 'shoulders', ['back'], 'cable', [
    'Set a rope attachment at upper-chest to face height.',
    'Grip with thumbs pointing back and step away to create tension.',
    'Pull the rope towards your face, separating your hands and flaring elbows high.',
    'Pause, then return under control.',
  ]),
  ex('machine-shoulder-press', 'Machine Shoulder Press', 'shoulders', ['triceps'], 'machine', [
    'Adjust the seat so handles are at shoulder height.',
    'Sit tall and grip the handles.',
    'Press overhead until arms are nearly straight.',
    'Lower slowly to the start.',
  ]),
  ex('upright-row', 'Cable Upright Row', 'shoulders', ['back'], 'cable', [
    'Stand facing a low cable with a straight bar, grip shoulder-width.',
    'Pull the bar up along your body to lower-chest height, elbows leading.',
    'Keep elbows no higher than shoulder level.',
    'Lower slowly.',
  ]),

  // ───────────── BICEPS ─────────────
  ex('db-curl', 'Dumbbell Bicep Curl', 'biceps', [], 'dumbbell', [
    'Stand holding dumbbells at your sides, palms forward.',
    'Keep your elbows pinned to your sides.',
    'Curl the weights up towards your shoulders.',
    'Lower slowly to full extension.',
  ]),
  ex('hammer-curl', 'Hammer Curl', 'biceps', [], 'dumbbell', [
    'Hold dumbbells at your sides with palms facing each other.',
    'Curl up while keeping the neutral grip.',
    'Squeeze at the top.',
    'Lower under control.',
  ]),
  ex('barbell-curl', 'Barbell Curl', 'biceps', [], 'barbell', [
    'Stand holding a barbell with an underhand grip, shoulder-width.',
    'Keep elbows by your sides and torso still.',
    'Curl the bar up to shoulder height.',
    'Lower slowly without swinging.',
  ]),
  ex('preacher-curl', 'Preacher Curl', 'biceps', [], 'machine', [
    'Sit at a preacher bench with the back of your arms on the pad.',
    'Hold an EZ-bar or handles with an underhand grip.',
    'Curl up until your forearms are vertical.',
    'Lower slowly to almost full extension.',
  ]),
  ex('incline-db-curl', 'Incline Dumbbell Curl', 'biceps', [], 'dumbbell', [
    'Sit back on a bench set to 45–60°, arms hanging straight down.',
    'Curl the dumbbells up without moving your upper arms.',
    'Squeeze at the top.',
    'Lower to a full stretch.',
  ]),
  ex('cable-curl', 'Cable Curl', 'biceps', [], 'cable', [
    'Stand facing a low pulley with a straight bar or rope.',
    'Keep elbows tucked and curl the handle up.',
    'Squeeze your biceps at the top.',
    'Return slowly.',
  ]),
  ex('band-curl', 'Resistance Band Curl', 'biceps', [], 'band', [
    'Stand on the middle of a band, holding the ends with palms forward.',
    'Curl your hands towards your shoulders.',
    'Pause at the top.',
    'Lower slowly against the band\'s tension.',
  ]),

  // ───────────── TRICEPS ─────────────
  ex('bench-dip', 'Bench Dip', 'triceps', ['chest', 'shoulders'], 'bodyweight', [
    'Sit on the edge of a bench, hands beside your hips.',
    'Slide off the bench, supporting yourself on your hands.',
    'Bend your elbows to lower until they reach about 90°.',
    'Press back up. Bend your knees to make it easier.',
  ]),
  ex('close-grip-bench', 'Close-Grip Bench Press', 'triceps', ['chest', 'shoulders'], 'barbell', [
    'Lie on a flat bench and grip the bar at shoulder-width.',
    'Lower the bar to your lower chest, elbows close to your body.',
    'Press back up to lockout.',
    'Use a spotter or safety arms.',
  ]),
  ex('skull-crusher', 'EZ-Bar Skull Crusher', 'triceps', [], 'barbell', [
    'Lie on a bench holding an EZ-bar above your chest with arms straight.',
    'Bend only at the elbows to lower the bar towards your forehead.',
    'Stop just above your head.',
    'Extend your arms back to the start.',
  ]),
  ex('overhead-db-extension', 'Overhead Dumbbell Extension', 'triceps', [], 'dumbbell', [
    'Hold one dumbbell with both hands overhead.',
    'Lower it behind your head by bending your elbows.',
    'Keep elbows pointing forward and close to your head.',
    'Extend back up to straight arms.',
  ]),
  ex('tricep-pushdown', 'Cable Tricep Pushdown', 'triceps', [], 'cable', [
    'Stand facing a high pulley with a bar or rope.',
    'Tuck elbows to your sides.',
    'Push down until your arms are fully straight.',
    'Return slowly to about 90° at the elbow.',
  ]),
  ex('db-kickback', 'Dumbbell Kickback', 'triceps', [], 'dumbbell', [
    'Hinge forward with a flat back, upper arm parallel to the floor.',
    'Extend your elbow until your arm is straight behind you.',
    'Squeeze your triceps.',
    'Lower back to 90° under control.',
  ]),
  ex('parallel-bar-dip', 'Tricep Dip (Upright)', 'triceps', ['chest', 'shoulders'], 'bodyweight', [
    'Support yourself on parallel bars with straight arms.',
    'Keep your torso upright and elbows tucked back.',
    'Lower until elbows reach about 90°.',
    'Press back to straight arms.',
  ]),

  // ───────────── LEGS ─────────────
  ex('bodyweight-squat', 'Bodyweight Squat', 'legs', ['glutes', 'core'], 'bodyweight', [
    'Stand with feet shoulder-width apart, toes slightly turned out.',
    'Push your hips back and bend your knees, keeping your chest up.',
    'Lower until thighs are at least parallel to the floor.',
    'Drive through your whole foot to stand up.',
  ]),
  ex('jump-squat', 'Jump Squat', 'legs', ['glutes', 'cardio'], 'bodyweight', [
    'Start in a squat stance.',
    'Lower into a quarter-to-half squat.',
    'Explode upwards into a jump.',
    'Land softly with bent knees and go straight into the next rep.',
  ]),
  ex('walking-lunge', 'Walking Lunge', 'legs', ['glutes'], 'bodyweight', [
    'Stand tall and step forward with one leg.',
    'Lower until both knees are at roughly 90°.',
    'Drive through the front heel and step through into the next lunge.',
    'Hold dumbbells to add load.',
  ]),
  ex('reverse-lunge', 'Reverse Lunge', 'legs', ['glutes'], 'bodyweight', [
    'Stand tall, feet hip-width apart.',
    'Step one foot back and lower your back knee towards the floor.',
    'Keep your front shin fairly vertical.',
    'Push through the front foot to return.',
  ]),
  ex('wall-sit', 'Wall Sit', 'legs', [], 'bodyweight', [
    'Lean your back against a wall and slide down until your knees are at 90°.',
    'Keep your feet flat and knees over ankles.',
    'Hold the position for time.',
    'Stand up slowly to finish.',
  ]),
  ex('back-squat', 'Barbell Back Squat', 'legs', ['glutes', 'core'], 'barbell', [
    'Set the bar on your upper back (traps), grip just outside shoulders.',
    'Unrack and stand with feet shoulder-width, toes slightly out.',
    'Brace, then sit down and back between your hips, knees tracking toes.',
    'Descend to at least parallel, then drive up through mid-foot.',
    'Use safety pins set just below your bottom position.',
  ]),
  ex('front-squat', 'Barbell Front Squat', 'legs', ['core', 'glutes'], 'barbell', [
    'Rest the bar on your front shoulders, elbows high.',
    'Stand with feet shoulder-width apart.',
    'Squat down keeping your torso upright.',
    'Drive up through your heels, keeping elbows high.',
  ]),
  ex('goblet-squat', 'Goblet Squat', 'legs', ['glutes', 'core'], 'dumbbell', [
    'Hold a dumbbell vertically against your chest.',
    'Stand with feet slightly wider than shoulders.',
    'Squat down, keeping your chest tall and elbows inside your knees.',
    'Drive back up to standing.',
  ]),
  ex('bulgarian-split-squat', 'Bulgarian Split Squat', 'legs', ['glutes'], 'dumbbell', [
    'Stand a stride in front of a bench and place your rear foot on it.',
    'Hold dumbbells at your sides.',
    'Lower until your front thigh is parallel to the floor.',
    'Drive through the front heel to stand. Complete all reps then switch.',
  ]),
  ex('romanian-deadlift', 'Romanian Deadlift', 'legs', ['glutes', 'back'], 'barbell', [
    'Hold a barbell at hip height with an overhand grip.',
    'With soft knees, push your hips back and slide the bar down your thighs.',
    'Lower until you feel a strong hamstring stretch, back flat.',
    'Drive your hips forward to stand tall.',
  ]),
  ex('db-rdl', 'Dumbbell Romanian Deadlift', 'legs', ['glutes', 'back'], 'dumbbell', [
    'Hold dumbbells in front of your thighs.',
    'Hinge at the hips with soft knees, sliding the weights down your legs.',
    'Stop at mid-shin or when your hamstrings are fully stretched.',
    'Squeeze your glutes to return to standing.',
  ]),
  ex('leg-press', 'Leg Press', 'legs', ['glutes'], 'machine', [
    'Sit in the machine with feet shoulder-width on the platform.',
    'Release the safeties and lower the platform until knees reach ~90°.',
    'Keep your lower back pressed into the pad.',
    'Press back up without locking your knees.',
  ]),
  ex('leg-extension', 'Leg Extension', 'legs', [], 'machine', [
    'Adjust the pad so it sits on your lower shins.',
    'Extend your knees until your legs are straight.',
    'Squeeze your quads at the top.',
    'Lower slowly.',
  ]),
  ex('leg-curl', 'Lying Leg Curl', 'legs', [], 'machine', [
    'Lie face down with the pad just above your heels.',
    'Curl your heels towards your glutes.',
    'Squeeze your hamstrings at the top.',
    'Lower slowly to full extension.',
  ]),
  ex('standing-calf-raise', 'Standing Calf Raise', 'legs', [], 'machine', [
    'Stand with the balls of your feet on a step or platform.',
    'Lower your heels for a full stretch.',
    'Rise onto your toes as high as possible.',
    'Pause at the top, then lower slowly.',
  ]),
  ex('db-step-up', 'Dumbbell Step-Up', 'legs', ['glutes'], 'dumbbell', [
    'Stand facing a box or bench holding dumbbells.',
    'Step up with one foot and drive through that heel to stand on the box.',
    'Step back down with control.',
    'Alternate legs or complete one side at a time.',
  ]),
  ex('hack-squat', 'Hack Squat', 'legs', ['glutes'], 'machine', [
    'Position your back against the pad and shoulders under the supports.',
    'Place feet shoulder-width on the platform.',
    'Lower until thighs are at least parallel.',
    'Press back up through your whole foot.',
  ]),

  // ───────────── GLUTES ─────────────
  ex('glute-bridge', 'Glute Bridge', 'glutes', ['legs', 'core'], 'bodyweight', [
    'Lie on your back, knees bent, feet flat and hip-width apart.',
    'Press through your heels and lift your hips.',
    'Squeeze your glutes hard at the top; body forms a line from knees to shoulders.',
    'Lower slowly.',
  ]),
  ex('single-leg-glute-bridge', 'Single-Leg Glute Bridge', 'glutes', ['legs'], 'bodyweight', [
    'Lie on your back with one knee bent and the other leg extended.',
    'Drive through the planted heel to lift your hips.',
    'Keep your hips level at the top.',
    'Lower and repeat, then switch sides.',
  ]),
  ex('hip-thrust', 'Barbell Hip Thrust', 'glutes', ['legs'], 'barbell', [
    'Sit with your upper back against a bench and a padded bar over your hips.',
    'Plant your feet hip-width apart, knees bent.',
    'Drive your hips up until your torso is parallel to the floor.',
    'Squeeze your glutes, then lower under control.',
  ]),
  ex('cable-kickback', 'Cable Glute Kickback', 'glutes', [], 'cable', [
    'Attach an ankle strap to a low pulley.',
    'Face the machine and hold on for support.',
    'Kick your leg straight back, squeezing your glute.',
    'Return slowly. Complete all reps then switch.',
  ]),
  ex('sumo-deadlift', 'Sumo Deadlift', 'glutes', ['legs', 'back'], 'barbell', [
    'Stand with a wide stance, toes turned out, bar over mid-foot.',
    'Grip the bar inside your knees with straight arms.',
    'Push your knees out, chest up, and drive through the floor.',
    'Lock out by squeezing your glutes, then lower with control.',
  ]),
  ex('kb-swing', 'Kettlebell Swing', 'glutes', ['legs', 'back', 'cardio'], 'kettlebell', [
    'Stand with feet shoulder-width, kettlebell slightly in front of you.',
    'Hike the bell back between your legs with a hip hinge.',
    'Snap your hips forward to swing the bell to chest height.',
    'Let it fall back into the hinge and repeat. The power comes from the hips, not arms.',
  ]),
  ex('banded-lateral-walk', 'Banded Lateral Walk', 'glutes', ['legs'], 'band', [
    'Place a mini band just above your knees or around your ankles.',
    'Sit into a quarter squat.',
    'Step sideways, keeping tension on the band.',
    'Take 10–15 steps each direction.',
  ]),
  ex('donkey-kick', 'Donkey Kick', 'glutes', [], 'bodyweight', [
    'Start on all fours, hands under shoulders and knees under hips.',
    'Keeping your knee bent at 90°, lift one leg until your thigh is parallel to the floor.',
    'Squeeze your glute at the top.',
    'Lower and repeat, then switch sides.',
  ]),

  // ───────────── CORE ─────────────
  ex('plank', 'Plank', 'core', ['shoulders'], 'bodyweight', [
    'Rest on your forearms and toes, elbows under shoulders.',
    'Form a straight line from head to heels.',
    'Brace your abs and squeeze your glutes.',
    'Hold for time without letting your hips sag.',
  ]),
  ex('side-plank', 'Side Plank', 'core', ['shoulders'], 'bodyweight', [
    'Lie on your side, propped on one forearm, elbow under shoulder.',
    'Lift your hips so your body forms a straight line.',
    'Hold for time, then switch sides.',
    'Drop to your knees for an easier version.',
  ]),
  ex('dead-bug', 'Dead Bug', 'core', [], 'bodyweight', [
    'Lie on your back with arms pointing to the ceiling and knees at 90° above hips.',
    'Press your lower back into the floor.',
    'Slowly extend the opposite arm and leg towards the floor.',
    'Return and switch sides, keeping your back flat throughout.',
  ]),
  ex('crunch', 'Crunch', 'core', [], 'bodyweight', [
    'Lie on your back, knees bent, feet flat.',
    'Place hands lightly by your head.',
    'Curl your shoulders off the floor by contracting your abs.',
    'Lower slowly. Avoid pulling on your neck.',
  ]),
  ex('hanging-leg-raise', 'Hanging Leg Raise', 'core', [], 'bodyweight', [
    'Hang from a pull-up bar with straight arms.',
    'Brace your core and raise your legs (bent or straight) to hip height or higher.',
    'Avoid swinging.',
    'Lower slowly.',
  ]),
  ex('russian-twist', 'Russian Twist', 'core', [], 'bodyweight', [
    'Sit with knees bent and lean back slightly, chest up.',
    'Lift your feet for more challenge.',
    'Rotate your torso to tap the floor beside each hip.',
    'Hold a weight to increase difficulty.',
  ]),
  ex('mountain-climber', 'Mountain Climber', 'core', ['cardio', 'shoulders'], 'bodyweight', [
    'Start in a high plank.',
    'Drive one knee towards your chest.',
    'Quickly switch legs in a running motion.',
    'Keep your hips low and core braced.',
  ]),
  ex('cable-crunch', 'Cable Crunch', 'core', [], 'cable', [
    'Kneel facing a high pulley holding a rope beside your head.',
    'Crunch down by flexing your spine, bringing elbows towards knees.',
    'Keep your hips still.',
    'Return slowly.',
  ]),
  ex('ab-wheel', 'Ab Wheel Rollout', 'core', ['shoulders', 'back'], 'bodyweight', [
    'Kneel holding an ab wheel under your shoulders.',
    'Roll forward slowly, keeping your core tight and back flat.',
    'Go as far as you can without your hips sagging.',
    'Pull back to the start using your abs.',
  ]),
  ex('pallof-press', 'Pallof Press', 'core', [], 'cable', [
    'Stand side-on to a cable at chest height, holding the handle at your chest.',
    'Step away to create tension.',
    'Press the handle straight out, resisting rotation.',
    'Hold for 2 seconds, return. Complete all reps then switch sides.',
  ]),

  // ───────────── CARDIO ─────────────
  ex('running', 'Running', 'cardio', ['legs'], 'bodyweight', [
    'Warm up with 5 minutes of brisk walking or easy jogging.',
    'Run at a pace where you can still speak in short sentences (easy) or as programmed.',
    'Land softly under your hips with a relaxed upper body.',
    'Cool down with 5 minutes of walking.',
  ]),
  ex('burpee', 'Burpee', 'cardio', ['full body', 'chest', 'legs'], 'bodyweight', [
    'From standing, squat down and place your hands on the floor.',
    'Jump your feet back into a plank.',
    'Perform a push-up (optional), then jump your feet back to your hands.',
    'Explode up into a jump with arms overhead.',
  ]),
  ex('jumping-jack', 'Jumping Jacks', 'cardio', [], 'bodyweight', [
    'Stand with feet together and arms by your sides.',
    'Jump your feet out while raising your arms overhead.',
    'Jump back to the start.',
    'Keep a steady rhythm.',
  ]),
  ex('high-knees', 'High Knees', 'cardio', ['core', 'legs'], 'bodyweight', [
    'Run on the spot, driving your knees up to hip height.',
    'Pump your arms.',
    'Stay on the balls of your feet.',
    'Keep your torso upright.',
  ]),
  ex('rowing-machine', 'Rowing Machine', 'cardio', ['back', 'legs'], 'machine', [
    'Strap your feet in and grip the handle.',
    'Drive with your legs first, then lean back slightly and pull the handle to your lower ribs.',
    'Return in reverse order: arms, body, then legs.',
    'Aim for a smooth rhythm — power on the drive, relaxed on the recovery.',
  ]),
  ex('stationary-bike', 'Stationary Bike', 'cardio', ['legs'], 'machine', [
    'Adjust the seat so your knee is slightly bent at the bottom of the pedal stroke.',
    'Warm up at a light resistance for 3–5 minutes.',
    'Ride at the programmed intensity or intervals.',
    'Cool down for 3–5 minutes.',
  ]),
  ex('skipping', 'Skipping Rope', 'cardio', ['legs'], 'bodyweight', [
    'Hold the rope handles at hip height, elbows close.',
    'Turn the rope with your wrists, not your arms.',
    'Make small, quick hops on the balls of your feet.',
    'Work in rounds (e.g. 30–60 seconds on, 30 seconds off).',
  ]),
  ex('incline-walk', 'Incline Treadmill Walk', 'cardio', ['legs', 'glutes'], 'machine', [
    'Set the treadmill incline to 5–12%.',
    'Walk at a brisk pace without holding the handrails.',
    'Keep an upright posture.',
    'Great low-impact option for fat loss and conditioning.',
  ]),

  // ───────────── FULL BODY ─────────────
  ex('thruster', 'Dumbbell Thruster', 'full body', ['legs', 'shoulders'], 'dumbbell', [
    'Hold dumbbells at shoulder height, feet shoulder-width.',
    'Squat down to parallel.',
    'Drive up explosively and use the momentum to press the dumbbells overhead.',
    'Lower the dumbbells to your shoulders as you descend into the next squat.',
  ]),
  ex('clean-and-press', 'Kettlebell Clean & Press', 'full body', ['shoulders', 'legs', 'glutes'], 'kettlebell', [
    'Start with the kettlebell between your feet.',
    'Hinge and drive your hips to pull the bell to the rack position at your shoulder.',
    'Press the bell overhead to lockout.',
    'Lower back to rack, then to the start. Complete all reps then switch.',
  ]),
  ex('farmers-carry', "Farmer's Carry", 'full body', ['core', 'back'], 'dumbbell', [
    'Pick up heavy dumbbells or kettlebells, one in each hand.',
    'Stand tall with shoulders back and core braced.',
    'Walk with short, controlled steps for the set distance or time.',
    'Set the weights down with a flat back.',
  ]),
  ex('turkish-get-up', 'Turkish Get-Up', 'full body', ['shoulders', 'core'], 'kettlebell', [
    'Lie on your back holding a kettlebell straight up in one hand, same-side knee bent.',
    'Roll onto your opposite elbow, then hand, keeping the bell locked overhead.',
    'Bridge your hips, sweep your leg through to a half-kneel, then stand up.',
    'Reverse each step to return to the floor. Learn with a light weight first.',
  ]),
  ex('man-maker', 'Dumbbell Man-Maker', 'full body', ['chest', 'back', 'shoulders', 'legs'], 'dumbbell', [
    'Start in a plank holding dumbbells on the floor.',
    'Do a push-up, then row each dumbbell.',
    'Jump your feet in, clean the dumbbells to your shoulders and stand.',
    'Press overhead, then return to the plank.',
  ]),
  ex('bear-crawl', 'Bear Crawl', 'full body', ['core', 'shoulders'], 'bodyweight', [
    'Start on all fours with knees hovering just off the floor.',
    'Move your opposite hand and foot forward together.',
    'Keep your back flat and hips low.',
    'Crawl forward and backward for distance or time.',
  ]),
];

export const EXERCISES_BY_ID: Record<string, LibraryExercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
