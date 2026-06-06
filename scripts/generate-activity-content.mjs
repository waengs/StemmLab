import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'src/i18n/locales');

const en = {
  shared: {
    postQuizTitle: 'Post-Experiment Quiz',
    postQuizSubtitlePrimary: {
      'parachute-drop': 'Quick check — what did you learn about parachutes?',
      'hand-fan': 'Quick check — what did you learn about your fan?',
      'human-performance': 'Quick check — what did you notice about your movements?',
      'reaction-board': 'Quick check — what did you learn about reaction time?',
      'breathing-pace': 'Quick check — what did you learn about breathing?',
      'sound-pollution': 'Quick check — what did you learn about sound?',
      earthquake: 'Quick check — what did you learn about earthquakes?',
    },
    postQuizSubtitleHighSchool: {
      'parachute-drop': 'Test your knowledge on the science behind parachute drops!',
      'hand-fan': 'Test your knowledge on the science behind the hand fan!',
      'human-performance': 'Test your knowledge on biomechanics and human movement!',
      'reaction-board': 'Test your knowledge on neuroscience and motor skills!',
      'breathing-pace': 'Test your knowledge on breathing and exercise physiology!',
      'sound-pollution': 'Test your knowledge on sound levels and hearing safety!',
      earthquake: 'Test your knowledge on earthquake engineering!',
    },
    submitQuiz: 'Submit Quiz',
    continueDiscussion: 'Continue to Discussion',
    retakeQuiz: 'Retake Quiz',
    quizScore: 'You scored {{score}} out of {{total}}!',
    quizIncomplete:
      'Please answer all multiple choice and reflection questions before submitting.',
    quizIncompleteReflection: 'Please answer all reflection questions before continuing.',
    reflectionHeading: 'Reflection questions',
    answerPlaceholder: 'Write your answer…',
    discussionTitle: 'Discussion',
    activityDiscussionTitle: 'Activity Discussion',
    talkAboutLabel: 'Talk about: ',
    didYouKnowLabel: 'Did You Know? ',
    importantLabel: 'Important: ',
    reflectionTitle: 'Reflection',
    reflectionNotes: 'Reflection notes',
    formulasTitle: 'Formulas',
    mapTapHint: 'Tap anywhere on the map to log a sound reading.',
    questionProgress: 'Question {{current}} of {{total}}',
    quizCompletedTitle: 'Quiz Completed!',
    quizCompletedDesc: 'You previously scored {{score}} / {{total}}',
    quizResultsTitle: 'Quiz Results',
    wizardDidYouKnowTitle: 'Did you know?',
    wizardDidYouKnowSound:
      'Sound intensity varies depending on energy and surfaces. Prolonged loud noise can impact health and concentration.',
    wizardDidYouKnowEarthquake:
      'Earthquakes cause ground vibrations that can collapse poorly designed structures. Engineers design buildings to absorb and distribute energy safely.',
  },
  instructions: {
    'parachute-drop': [
      'Measure and record the mass of your toy.',
      'Set up a drop zone with a known height.',
      'Construct your first parachute design.',
      'Record a slow-motion video of the drop.',
      'Use the video playback to measure exact fall time.',
      'Calculate forces or use instant calculation (with penalty).',
    ],
    'hand-fan': [
      'Stand paper upright on a table.',
      'Fan air from the distance specified in your current trial.',
      'Observe and record movement.',
      'Pause the video in slow motion and record the bend angle using the screen and a protractor.',
      'Repeat this process for all 4 preset fan designs (Paper Wide, Paper Narrow, Cardboard Wide, Cardboard Narrow).',
      'For each design, test the 3 different fan distances (15cm, 30cm, 45cm). Keep the target material as Paper for all trials.',
    ],
    'sound-pollution': [
      'Measure noise from different actions (e.g., dropping objects, talking, walking, stamping feet).',
      'Record sound levels (in decibels) and locations for each action.',
      'Map out the loud and quiet zones in your area.',
      'Tap anywhere on the map to log a sound reading.',
    ],
    earthquake: [
      'Build an anti-vibration layer by folding paper/cardboard.',
      'Place a flat cardboard platform on top.',
      "Place the phone in the centre and use the Earthquake Simulator below to activate the phone's vibration motor.",
      'Modify the structure to reduce phone movement (e.g. more pillars, more folds).',
    ],
    'human-performance': [
      'Hold the phone firmly in one hand. Activate the App vibration sensor.',
      'Round 1: record each movement silently (sensor only).',
      'Round 2: repeat with live feedback — screen turns red and says "Slow" if too shaky.',
      'Review smoothness and range-of-motion data; calculate speed yourself.',
      'Upload results and complete the post-experiment quiz.',
    ],
    'reaction-board': [
      'Phase 1: Tap the screen as soon as the hidden button appears.',
      'Phase 2: Repeat using your non-dominant hand.',
      'Phase 3: Trace a moving shape on the screen to measure your coordination.',
    ],
    'breathing-pace': [
      'Place the phone gently on your chest.',
      'Record breathing at rest for 1 minute. Count each breath.',
      'Jog on the spot for 1 minute, then record breathing again.',
      'Do 100 star jumps, then record breathing again.',
      'Compare breaths per minute and chest movement. Complete the quiz.',
    ],
  },
  quizOpen: {
    'parachute-drop': {
      primary: [
        'Did your parachute work the way you expected?',
        'Which design did you like best? Why?',
        'What would you change if you tested again?',
      ],
      highSchool: [
        'Were your predicted fall times close to your measured times?',
        'Which design performed best, and why do you think so?',
        'What would you improve in your next prototype?',
      ],
    },
    'hand-fan': {
      primary: [
        'Which fan moved the paper the most?',
        'What surprised you during the experiment?',
        'If you could try one more design, what would it be?',
      ],
      highSchool: [
        'How did material stiffness affect your results?',
        'Which variable (design, distance, or fanning speed) had the biggest effect on bend angle?',
        'What would you improve in your next prototype?',
      ],
    },
    'sound-pollution': {
      primary: [
        'Which sound was loudest in your data?',
        'Why should we protect our ears from very loud noise?',
        'Where in daily life do you hear similar loud sounds?',
      ],
      highSchool: [
        'How did your predicted loudest action compare to your measurements?',
        'At what dB levels might hearing damage occur, based on what you learned?',
        'What habits or policies could reduce harmful noise exposure?',
      ],
    },
    earthquake: {
      primary: [
        'What helped your tower stay up the longest?',
        'What made it fall faster?',
        'If you built again, what one change would you try first?',
      ],
      highSchool: [
        'Which design features absorbed vibration best?',
        'How did base width or bracing affect survival time?',
        'What real-world building features do engineers use for earthquakes?',
      ],
    },
    'human-performance': {
      primary: [
        'Which movement was hardest to keep smooth?',
        'Did live feedback help you improve on the second attempt?',
        'What did you learn about moving slowly and smoothly?',
      ],
      highSchool: [
        'Which movement produced the highest vibration readings?',
        'Did sensory feedback reduce vibration magnitude? Explain.',
        'How might athletes or physical therapists use similar sensors?',
      ],
    },
    'reaction-board': {
      primary: [
        'What helped you react faster?',
        'When was it hardest to tap the right color?',
        'What would you do differently on a second try?',
      ],
      highSchool: [
        'How did accuracy and reaction time trade off in your results?',
        'What factors might change your reaction time between trials?',
        'How is reaction time useful in real life?',
      ],
    },
    'breathing-pace': {
      primary: [
        'When did you breathe fastest, and why do you think so?',
        'When did the phone move the most on your chest?',
        'What was hardest about keeping the phone steady?',
      ],
      highSchool: [
        'How did exercise affect breaths per minute compared to your predictions?',
        'How did chest movement relate to breathing rate?',
        'What could affect sensor readings besides breathing?',
      ],
    },
  },
  quiz: {
    'parachute-drop': {
      primary: [
        {
          question: 'What pulls the parachute and toy downward?',
          options: ['Gravity', 'Wind only', 'Glue', 'Magnets'],
          answerIndex: 0,
        },
        {
          question: 'What helps the parachute fall more slowly?',
          options: ['Air pushing upward', 'Extra weight', 'Making it smaller', 'Turning off gravity'],
          answerIndex: 0,
        },
        {
          question: 'A bigger parachute usually makes the toy fall…',
          options: ['More slowly', 'More quickly', 'Not at all', 'Sideways only'],
          answerIndex: 0,
        },
        {
          question: 'A very hard landing is usually…',
          options: ['Rougher and more jarring', 'Softer and safer', 'The same as a soft landing', 'Impossible'],
          answerIndex: 0,
        },
        {
          question: 'Why do teams try more than one parachute design?',
          options: ['To learn which works best', 'To use up all the tape', 'Because one is never fun', 'To make it heavier'],
          answerIndex: 0,
        },
      ],
      highSchool: [
        {
          question: 'What force pulls the parachute downward?',
          options: ['Gravity', 'Air Resistance', 'Magnetism', 'Friction'],
          answerIndex: 0,
        },
        {
          question: 'What force acts upward to slow the parachute down?',
          options: ['Gravity', 'Air Resistance (Drag)', 'Tension', 'Normal Force'],
          answerIndex: 1,
        },
        {
          question: 'How does increasing the parachute size affect the fall time?',
          options: ['It decreases fall time', 'It increases fall time', 'It has no effect', 'It makes the toy heavier'],
          answerIndex: 1,
        },
        {
          question: 'What happens to the G-Force if the stopping time is very short (e.g. a hard landing)?',
          options: ['It decreases', 'It increases', 'It stays the same', 'It becomes negative'],
          answerIndex: 1,
        },
        {
          question: 'Why do engineers build multiple prototypes?',
          options: ['To waste materials', 'To test and improve performance', 'Because one is never enough', 'To make the toy look better'],
          answerIndex: 1,
        },
      ],
    },
    'hand-fan': {
      primary: [
        {
          question: 'What does moving air do to the paper?',
          options: ['Pushes it', 'Melts it', 'Makes it invisible', 'Stops all sound'],
          answerIndex: 0,
        },
        {
          question: 'A bigger fan usually moves…',
          options: ['More air', 'Less air', 'No air', 'Only water'],
          answerIndex: 0,
        },
        {
          question: 'When the paper is farther from the fan, it usually bends…',
          options: ['Less', 'More', 'The same every time', 'Not at all'],
          answerIndex: 0,
        },
        {
          question: 'Fanning faster usually makes the paper move…',
          options: ['More', 'Less', 'Not at all', 'Backward only'],
          answerIndex: 0,
        },
        {
          question: 'Why try different fan shapes?',
          options: ['To see which works best', 'To break the paper', 'Because tape is heavy', 'No reason'],
          answerIndex: 0,
        },
      ],
      highSchool: [
        {
          question: 'How does material stiffness affect the bend angle?',
          options: [
            'Stiffer materials bend more easily',
            'Stiffer materials require more force to bend, resulting in a smaller angle',
            'Stiffness has no effect on the bend angle',
            'Stiffer materials only bend if the distance is greater',
          ],
          answerIndex: 1,
        },
        {
          question: 'How does fan design influence air velocity and resulting paper movement?',
          options: [
            'A fan that captures and directs more air creates higher velocity and more movement',
            'Smaller fans always create more air velocity',
            'Fan design does not affect air velocity',
            'Air velocity is solely determined by the material of the fan',
          ],
          answerIndex: 0,
        },
        {
          question: 'How does distance from the fan affect bending?',
          options: [
            'The bending increases as distance increases',
            'Distance does not affect the bending angle',
            'Air pressure dissipates over distance, so bending decreases as distance increases',
            'The fan only works at exactly 30cm',
          ],
          answerIndex: 2,
        },
        {
          question: 'What force causes the upright paper to bend when fanning?',
          options: ['Magnetic force', 'Gravity pulling it down', 'Air pressure applying a force to the surface', 'Thermal expansion'],
          answerIndex: 2,
        },
        {
          question: 'Why does repeated bending weaken the paper?',
          options: [
            'It loses mass over time',
            'Repeated stress alters its structure due to plasticity, making it more flexible',
            'It gains stiffness the more it bends',
            'It absorbs moisture from the moving air',
          ],
          answerIndex: 1,
        },
      ],
    },
    'human-performance': {
      primary: [
        {
          question: 'When you move quickly, the phone often feels…',
          options: ['Shakier', 'Completely still', 'Heavier', 'Colder'],
          answerIndex: 0,
        },
        {
          question: 'Your muscles and joints help you…',
          options: ['Move your body', 'Charge the phone', 'Change the weather', 'Grow taller instantly'],
          answerIndex: 0,
        },
        {
          question: 'Smooth, slow movements are usually…',
          options: ['Easier to control', 'Impossible to do', 'Always the shakiest', 'Invisible to the sensor'],
          answerIndex: 0,
        },
        {
          question: 'Beeps and warnings during practice can help you…',
          options: ['Move more smoothly', 'Stop breathing', 'Break the phone', 'Skip the experiment'],
          answerIndex: 0,
        },
        {
          question: 'This lab measures how…',
          options: ['Your body moves', 'Clouds form', 'Plants grow', 'Rocks melt'],
          answerIndex: 0,
        },
      ],
      highSchool: [
        {
          question: 'Why do faster movements often produce higher phone vibration readings?',
          options: [
            'The phone battery drains faster',
            'Rapid acceleration and deceleration create more unstable motion',
            'Gravity increases with speed',
            'The vibration sensor only works at high speeds',
          ],
          answerIndex: 1,
        },
        {
          question: 'What do muscles and joints work together to create?',
          options: ['Electrical signals only', 'Controlled body movement', 'Phone vibrations', 'Sound waves'],
          answerIndex: 1,
        },
        {
          question: 'Why might smoother movements show better coordination?',
          options: [
            'They require less muscle activation',
            'Steady, controlled motion reduces jerky accelerations detected by sensors',
            'Smooth movements are always slower',
            'Sensors cannot detect smooth movement',
          ],
          answerIndex: 1,
        },
        {
          question: 'How can vibration feedback help during movement practice?',
          options: [
            'It makes the phone heavier',
            'It provides real-time cues so you can adjust movement to stay smoother',
            'It replaces the need for muscles',
            'It only works for figure-of-8 movements',
          ],
          answerIndex: 1,
        },
        {
          question: 'What does biomechanics study in activities like this lab?',
          options: [
            'Only heart rate during exercise',
            'How the body moves, including forces, speed, and coordination',
            'Chemical reactions in food',
            'Weather patterns affecting movement',
          ],
          answerIndex: 1,
        },
      ],
    },
    'reaction-board': {
      primary: [
        {
          question: 'Reaction time is how long it takes to…',
          options: ['Respond after you see something', 'Run a race', 'Sleep', 'Eat lunch'],
          answerIndex: 0,
        },
        {
          question: 'Your main hand is often faster because you…',
          options: ['Use it more every day', 'Have bigger shoes', 'Hold your breath', 'Skip practice'],
          answerIndex: 0,
        },
        {
          question: 'Your brain helps you move by sending messages through your…',
          options: ['Nerves', 'Hair', 'Shoes', 'Lunch box'],
          answerIndex: 0,
        },
        {
          question: 'Practicing many times usually makes you…',
          options: ['Faster and more accurate', 'Slower every time', 'Unable to tap', 'Forget colors'],
          answerIndex: 0,
        },
        {
          question: 'The tracing game checks how well your hand and eyes…',
          options: ['Work together', 'Make sound', 'Change colour', 'Measure temperature'],
          answerIndex: 0,
        },
      ],
      highSchool: [
        {
          question: 'What is reaction time?',
          options: [
            'How fast you can run',
            'The time it takes to respond to a stimulus',
            'The time it takes to think of an answer',
            'How long your memory lasts',
          ],
          answerIndex: 1,
        },
        {
          question: 'Why might your dominant hand have a faster reaction time?',
          options: [
            'It has stronger muscles',
            'It has larger bones',
            'It has stronger neural pathways from frequent use',
            'It is closer to your brain',
          ],
          answerIndex: 2,
        },
        {
          question: 'Which part of the body processes the visual signal and sends a command to your hand?',
          options: ['The heart', 'The muscles', 'The brain and nervous system', 'The eyes only'],
          answerIndex: 2,
        },
        {
          question: 'How does practice affect reaction time and coordination?',
          options: [
            'It makes you slower because you get tired',
            'It improves speed by strengthening neural pathways',
            'It does not affect reaction time',
            'It makes your fingers bigger',
          ],
          answerIndex: 1,
        },
        {
          question: 'What does the tracing challenge measure?',
          options: [
            'How hard you press the screen',
            "Your phone's processing speed",
            'Your hand-eye coordination and fine motor skills',
            'Your memory of shapes',
          ],
          answerIndex: 2,
        },
      ],
    },
    'breathing-pace': {
      primary: [
        {
          question: 'After exercise, you usually breathe…',
          options: ['Faster', 'Slower forever', 'Not at all', 'Only through your feet'],
          answerIndex: 0,
        },
        {
          question: 'Where should the phone go to feel your breathing?',
          options: ['Gently on your chest', 'On the floor', 'In your bag', 'Under a chair'],
          answerIndex: 0,
        },
        {
          question: 'The phone sensor feels your chest…',
          options: ['Moving up and down', 'Getting heavier', 'Turning blue', 'Making noise only'],
          answerIndex: 0,
        },
        {
          question: 'After star jumps, breathing is faster because your body needs…',
          options: ['More air and rest', 'Less air', 'No oxygen', 'To stop moving'],
          answerIndex: 0,
        },
        {
          question: 'Breaths per minute tells you…',
          options: ['How many breaths in one minute', 'How loud you are', 'Your shoe size', 'The room colour'],
          answerIndex: 0,
        },
      ],
      highSchool: [
        {
          question: 'Why does breathing rate increase during exercise?',
          options: [
            'To cool the lungs down',
            'To supply more oxygen to working muscles',
            'Because the phone sensor speeds up',
            'To reduce heart rate',
          ],
          answerIndex: 1,
        },
        {
          question: 'Where should the phone be placed to detect chest movement?',
          options: ['On the floor', 'Gently on the chest', 'In your pocket', "Held at arm's length"],
          answerIndex: 1,
        },
        {
          question: 'What does the accelerometer measure during this activity?',
          options: [
            'Blood pressure directly',
            'Chest rise and fall from breathing',
            'Room temperature',
            'Sound levels',
          ],
          answerIndex: 1,
        },
        {
          question: 'Why might breathing rate be higher after star jumps than at rest?',
          options: [
            'The body needs less oxygen after exercise',
            'Muscles need more oxygen to recover from activity',
            'Breathing slows down after exercise',
            'The sensor only works after jumping',
          ],
          answerIndex: 1,
        },
        {
          question: 'What is breaths per minute (BPM)?',
          options: [
            'How loud you breathe',
            'The number of breath cycles in one minute',
            'The weight of air inhaled',
            'The speed of your heartbeat',
          ],
          answerIndex: 1,
        },
      ],
    },
  },
  quizWizard: {
    'sound-pollution': {
      primary: [
        {
          question: 'Which sound is usually the quietest?',
          options: ['Whispering to a friend', 'Busy road traffic', 'A rock concert', 'A power drill'],
          correctIndex: 0,
          explanation: 'Talking quietly is much softer than traffic, concerts, or drills.',
        },
        {
          question: 'Very loud sounds for a long time can…',
          options: ['Hurt your hearing', 'Make you taller', 'Change the weather', 'Stop gravity'],
          correctIndex: 0,
          explanation: 'Loud noise can damage your ears if you hear it too long.',
        },
        {
          question: 'A good way to protect your ears near very loud noise is to…',
          options: ['Move away or use ear protection', 'Stand closer', 'Shout louder', 'Cover your eyes only'],
          correctIndex: 0,
          explanation: 'Distance and ear protection help keep your hearing safe.',
        },
      ],
      highSchool: [
        {
          question: 'At what sound level does hearing damage become likely after short exposure?',
          options: ['30-60 dB', '60-85 dB', '90-100 dB', '140+ dB'],
          correctIndex: 2,
          explanation: '90-100 dB (like a motorbike or power tools) can cause hearing damage likely after short exposure.',
        },
        {
          question: 'Which of the following is considered safe for long periods?',
          options: ['Busy traffic (80 dB)', 'Normal conversation (50 dB)', 'Lawn mower (90 dB)', 'Rock concert (110 dB)'],
          correctIndex: 1,
          explanation: '30-60 dB, such as normal conversation, is safe for long periods.',
        },
        {
          question: 'What is the immediate risk at 140+ dB?',
          options: ['No risk', 'Fatigue', 'Instant, permanent hearing damage', 'Temporary ringing'],
          correctIndex: 2,
          explanation: '140+ dB (like an explosion or gunshot) causes instant and permanent hearing damage.',
        },
      ],
    },
    earthquake: {
      primary: [
        {
          question: 'During an earthquake, the ground…',
          options: ['Shakes', 'Turns to ice', 'Stops moving forever', 'Becomes invisible'],
          correctIndex: 0,
          explanation: 'Earthquakes shake the ground back and forth.',
        },
        {
          question: 'A wide, steady base usually helps a tower…',
          options: ['Stay upright longer', 'Fall over faster', 'Float away', 'Melt'],
          correctIndex: 0,
          explanation: 'A wider base can make a structure more stable when it shakes.',
        },
        {
          question: 'Soft padding or folded layers can help because they…',
          options: ['Absorb some shaking', 'Make the phone heavier', 'Stop gravity', 'Remove all sound'],
          correctIndex: 0,
          explanation: 'Cushioning can soak up some of the shaking energy.',
        },
      ],
      highSchool: [
        {
          question: 'Why do engineers design structures to absorb and distribute energy during an earthquake?',
          options: [
            'To make the building heavier',
            'To prevent ground vibrations from collapsing the structure',
            'To increase the speed of the vibrations',
            'To save construction materials',
          ],
          correctIndex: 1,
          explanation:
            'Engineers design buildings to absorb and distribute energy safely to prevent vibrations from collapsing poorly designed structures.',
        },
        {
          question: 'What is the main cause of damage to buildings during an earthquake?',
          options: ['High winds', 'Heavy rain', 'Ground vibrations', 'Loud noises'],
          correctIndex: 2,
          explanation: 'Earthquakes cause severe ground vibrations that shake and can ultimately collapse buildings.',
        },
        {
          question: 'Which structural modification generally makes a building MORE resistant to earthquake vibrations?',
          options: [
            'Making the base narrower',
            'Adding shock-absorbing layers and cross-bracing',
            'Building taller without support',
            'Using weaker materials',
          ],
          correctIndex: 1,
          explanation: 'Adding anti-vibration layers, cross-bracing, and strong pillars helps a building distribute the energy.',
        },
      ],
    },
  },
  discussion: {
    'parachute-drop': {
      primary: {
        paragraphs: [
          'Gravity pulls the toy down. The parachute catches air and slows the fall so the landing is gentler. Bigger parachutes usually slow the fall more. Testing different designs helps you see what works best.',
        ],
        talkAbout: 'Which parachute gave the softest landing? What would you change next time?',
      },
      highSchool: {
        paragraphs: [
          'Gravity pulls objects downward, causing them to speed up as they fall. A parachute increases air resistance (also called drag). Drag acts upward, opposing the motion and slowing the fall. A slower fall reduces the force when the toy hits the ground, making the landing safer. Engineers improve parachute designs through repeated testing and redesign.',
        ],
        tables: [
          {
            title: 'Forces Acting on the Toy',
            headers: ['Force', 'Formula'],
            rows: [
              ['Downward (weight)', 'W = m × g'],
              ['Upward (drag)', 'D = W - F_net'],
              ['Net (total) force', 'F_net = m × a'],
              ["Newton's 2nd Law", 'F = m × a'],
            ],
          },
          {
            title: 'Typical G-Force Ranges and Injury Risk',
            headers: ['G-Force', 'Examples', 'Likely Effects'],
            rows: [
              ['1–5 g', 'Standing up quickly, elevators, amusement rides', 'No injury'],
              ['5–10 g', 'Hard falls while running, minor car braking', 'Possible bruising or strains'],
              ['10–30 g', 'Sports collisions, bicycle crashes, car crashes (seatbelts)', 'Serious injuries possible (broken bones)'],
              ['30–50 g', 'Severe car crashes, falls onto hard surfaces', 'High risk of severe injury'],
              ['50+ g', 'Very sudden stops with no cushioning', 'Life-threatening injuries likely'],
            ],
          },
        ],
        important:
          'Duration matters. A brief spike can be survivable, while sustained g-forces are more dangerous.',
      },
    },
    'hand-fan': {
      primary: {
        paragraphs: [
          'When you fan, you push air toward the paper. The air pushes back on the paper and makes it bend. A bigger fan and faster fanning usually move the paper more. If the paper is farther away, the air feels weaker.',
        ],
        talkAbout: 'Which fan design moved the paper the most? What would you try next?',
      },
      highSchool: {
        paragraphs: [
          'Moving air applies a physical force, known as aerodynamic pressure, to objects in its path. When you use a hand fan, the amount of air you displace and the speed at which it travels determines the force exerted on the target paper.',
        ],
        sections: [
          {
            heading: 'Fan Design & Fluid Dynamics',
            body: 'The design of the fan greatly impacts how effectively it moves air. A fan with wider folds generally has a larger surface area, allowing it to capture and push a larger volume of air. However, the shape of the folds also determines how directional the airflow is. More directional flow means less air "spills" off the sides.',
          },
          {
            heading: 'Material Stiffness & Plasticity',
            body: 'The force required to bend an object depends on its stiffness. When the paper bends and returns to its original shape, it is behaving elastically. If it bends too far and stays bent, it has been stressed too much. Repeated bending can weaken the paper.',
          },
        ],
        tables: [
          {
            title: 'Key Factors Influencing Airflow Force',
            headers: ['Factor', 'Scientific Effect'],
            rows: [
              ['Fan Surface Area', 'A larger area displaces a greater volume of air with each swing.'],
              ['Fanning Speed', "Dynamic pressure increases with the square of the air's velocity."],
              ['Target Distance', 'Airflow spreads outwards over distance, causing the pressure to drop significantly as the distance increases.'],
            ],
          },
        ],
        didYouKnow: 'Engineers use fluid dynamics to design wind turbines, airplane wings, and cooling fans.',
      },
    },
    'sound-pollution': {
      primary: {
        paragraphs: [
          'Share what you found! Which place was the loudest? Which place was the quietest? Why do you think that happened?',
        ],
        activityDiscussionTitle: 'Activity Discussion',
      },
      highSchool: {
        paragraphs: [
          'Share your loudest findings! Which area of the school was the noisiest? Did you find any surprising sources of sound pollution?',
        ],
        activityDiscussionTitle: 'Activity Discussion',
      },
    },
    earthquake: {
      primary: {
        paragraphs: [
          'Show your strongest tower! What helped it stay up when the phone shook — wide base, pillars, or soft layers?',
        ],
        activityDiscussionTitle: 'Activity Discussion',
      },
      highSchool: {
        paragraphs: [
          'Share your most stable building designs! What combination of folds and pillars worked best for you?',
        ],
        activityDiscussionTitle: 'Activity Discussion',
      },
    },
    'human-performance': {
      primary: {
        paragraphs: [
          'Your muscles and joints help you move. When you rush, the phone often feels shakier. Slow, smooth moves are easier to control. The sensor shows how steady your movement is.',
        ],
        talkAbout: 'Which movement was the shakiest? Did the beeps help you slow down on the second try?',
      },
      highSchool: {
        paragraphs: [
          'Muscles and joints work together to create movement. Faster movements often reduce control, while smoother movements show better coordination. Sensors in the phone measure how quickly and smoothly the body moves, helping students understand biomechanics and fatigue.',
        ],
        sections: [
          {
            heading: 'Muscles & Joints',
            body: 'Skeletal muscles pull on bones via tendons, while joints act as pivot points. Coordinated muscle activation produces smooth, purposeful motion. When muscles fatigue, control decreases and vibration readings tend to increase.',
          },
          {
            heading: 'Speed vs. Control',
            body: 'As movement speed increases, the body must manage greater accelerations and decelerations. Jerky or rushed motions create larger sensor spikes. Practicing slow, deliberate movements builds neuromuscular control.',
          },
          {
            heading: 'Sensor Feedback',
            body: 'Phone vibration and movement sensors translate physical motion into measurable data — vibration (cm), speed (m/s), smoothness, and range of motion. Comparing predictions to actual results helps students develop scientific reasoning about their own bodies.',
          },
        ],
        didYouKnow:
          'Athletes and coaches use motion sensors to check form and train smoother, safer movement — like your phone in this lab.',
      },
    },
    'reaction-board': {
      primary: {
        paragraphs: [
          'Reaction time is how fast you respond after you see something. Your eyes send a message to your brain, and your brain tells your hand to tap. Your main hand is often faster because you use it more.',
          'The tracing game checks how well your hand and eyes work together. Practice can make you faster and more accurate.',
        ],
        talkAbout: 'Which hand was faster? Did you get better on the tracing challenge?',
      },
      highSchool: {
        paragraphs: [
          'Reaction time measures how quickly your brain processes visual information from your eyes and sends a signal through your nervous system to your hand muscles.',
        ],
        sections: [
          {
            heading: 'Dominant vs. Non-Dominant Hand',
            body: 'You likely noticed a difference between your hands. The dominant hand usually has faster reaction times because its neural pathways are more developed from everyday use.',
          },
          {
            heading: 'Coordination and Accuracy',
            body: 'The Tracing Challenge tested fine motor skills and hand-eye coordination. It requires the brain to continuously adjust muscle movements based on changing visual feedback.',
          },
        ],
        didYouKnow: 'Athletes and gamers practice for many hours to shave milliseconds off their reaction time.',
      },
    },
    'breathing-pace': {
      primary: {
        paragraphs: [
          'When you rest, you breathe steadily. After jogging or star jumps, you breathe faster because your body needs more air. The phone on your chest feels it move up and down.',
        ],
        talkAbout: 'When did you breathe the fastest — at rest, after jogging, or after star jumps? Why do you think so?',
      },
      highSchool: {
        paragraphs: [
          'Breathing rate increases during exercise to supply more oxygen to muscles. Sensors detect chest movement, helping students visualise breathing patterns.',
        ],
        sections: [
          {
            heading: 'Breathing at Rest vs After Exercise',
            body: 'At rest, your body needs a steady supply of oxygen. After exercise, muscles work harder. Your breathing rate rises so your lungs can bring in more oxygen and remove waste gases faster.',
          },
          {
            heading: 'How the Sensor Works',
            body: 'When the phone rests on your chest, the accelerometer picks up tiny movements with each inhale and exhale. Larger breaths after exercise create bigger sensor readings. Comparing breaths per minute helps you see how exercise affects your body.',
          },
        ],
        didYouKnow:
          'Doctors and athletes sometimes use sensors to watch breathing during training — like your phone in this lab.',
      },
    },
  },
};

// Indonesian translations
const id = JSON.parse(JSON.stringify(en));

const idPatches = {
  shared: {
    postQuizTitle: 'Kuis Pasca-Eksperimen',
    postQuizSubtitlePrimary: {
      'parachute-drop': 'Cek cepat — apa yang kamu pelajari tentang parasut?',
      'hand-fan': 'Cek cepat — apa yang kamu pelajari tentang kipas?',
      'human-performance': 'Cek cepat — apa yang kamu perhatikan dari gerakanmu?',
      'reaction-board': 'Cek cepat — apa yang kamu pelajari tentang waktu reaksi?',
      'breathing-pace': 'Cek cepat — apa yang kamu pelajari tentang pernapasan?',
      'sound-pollution': 'Cek cepat — apa yang kamu pelajari tentang suara?',
      earthquake: 'Cek cepat — apa yang kamu pelajari tentang gempa?',
    },
    postQuizSubtitleHighSchool: {
      'parachute-drop': 'Uji pengetahuanmu tentang sains di balik jatuhnya parasut!',
      'hand-fan': 'Uji pengetahuanmu tentang sains di balik kipas tangan!',
      'human-performance': 'Uji pengetahuanmu tentang biomekanika dan gerakan tubuh!',
      'reaction-board': 'Uji pengetahuanmu tentang neurosains dan keterampilan motorik!',
      'breathing-pace': 'Uji pengetahuanmu tentang pernapasan dan fisiologi olahraga!',
      'sound-pollution': 'Uji pengetahuanmu tentang tingkat suara dan keamanan pendengaran!',
      earthquake: 'Uji pengetahuanmu tentang rekayasa gempa!',
    },
    submitQuiz: 'Kirim Kuis',
    continueDiscussion: 'Lanjut ke Diskusi',
    retakeQuiz: 'Ulangi Kuis',
    quizScore: 'Skormu {{score}} dari {{total}}!',
    quizIncomplete: 'Harap jawab semua soal pilihan ganda dan refleksi sebelum mengirim.',
    quizIncompleteReflection: 'Harap jawab semua pertanyaan refleksi sebelum melanjutkan.',
    reflectionHeading: 'Pertanyaan refleksi',
    answerPlaceholder: 'Tulis jawabanmu…',
    discussionTitle: 'Diskusi',
    activityDiscussionTitle: 'Diskusi Aktivitas',
    talkAboutLabel: 'Diskusikan: ',
    didYouKnowLabel: 'Tahukah Kamu? ',
    importantLabel: 'Penting: ',
    reflectionTitle: 'Refleksi',
    reflectionNotes: 'Catatan refleksi',
    formulasTitle: 'Rumus',
    mapTapHint: 'Ketuk di mana saja pada peta untuk mencatat pembacaan suara.',
    questionProgress: 'Pertanyaan {{current}} dari {{total}}',
    quizCompletedTitle: 'Kuis Selesai!',
    quizCompletedDesc: 'Skor sebelumnya {{score}} / {{total}}',
    quizResultsTitle: 'Hasil Kuis',
    wizardDidYouKnowTitle: 'Tahukah kamu?',
    wizardDidYouKnowSound:
      'Intensitas suara bervariasi tergantung energi dan permukaan. Kebisingan keras dalam waktu lama dapat memengaruhi kesehatan dan konsentrasi.',
    wizardDidYouKnowEarthquake:
      'Gempa menyebabkan getaran tanah yang dapat meruntuhkan struktur yang dirancang buruk. Insinyur merancang bangunan untuk menyerap dan mendistribusikan energi dengan aman.',
  },
};

Object.assign(id.shared, idPatches.shared);

id.instructions = {
  'parachute-drop': [
    'Ukur dan catat massa mainanmu.',
    'Siapkan zona jatuh dengan ketinggian yang diketahui.',
    'Buat desain parasut pertamamu.',
    'Rekam video gerak lambat saat jatuh.',
    'Gunakan pemutaran video untuk mengukur waktu jatuh yang tepat.',
    'Hitung gaya atau gunakan Hitung Instan (dengan penalti).',
  ],
  'hand-fan': [
    'Berdirikan kertas tegak di atas meja.',
    'Kipaskan udara dari jarak yang ditentukan pada percobaan saat ini.',
    'Amati dan catat gerakannya.',
    'Jeda video dalam gerak lambat dan catat sudut lentur menggunakan layar dan busur derajat.',
    'Ulangi untuk keempat desain kipas (Kertas Lebar, Kertas Sempit, Kardus Lebar, Kardus Sempit).',
    'Untuk setiap desain, uji 3 jarak kipas (15 cm, 30 cm, 45 cm). Gunakan kertas sebagai target untuk semua percobaan.',
  ],
  'sound-pollution': [
    'Ukur kebisingan dari berbagai aksi (misalnya menjatuhkan benda, berbicara, berjalan, menghentak).',
    'Catat tingkat suara (desibel) dan lokasi untuk setiap aksi.',
    'Petakan zona keras dan tenang di area kamu.',
    'Ketuk di mana saja pada peta untuk mencatat pembacaan suara.',
  ],
  earthquake: [
    'Buat lapisan anti-getar dengan melipat kertas/kardus.',
    'Letakkan platform kardus datar di atasnya.',
    'Letakkan ponsel di tengah dan gunakan Simulator Gempa di bawah untuk mengaktifkan motor getar ponsel.',
    'Ubah struktur untuk mengurangi gerakan ponsel (misalnya lebih banyak tiang, lebih banyak lipatan).',
  ],
  'human-performance': [
    'Pegang ponsel erat dengan satu tangan. Aktifkan sensor getar aplikasi.',
    'Babak 1: rekam setiap gerakan secara diam (sensor saja).',
    'Babak 2: ulangi dengan umpan balik langsung — layar merah dan bertuliskan "Pelan" jika terlalu goyah.',
    'Tinjau kelancaran dan rentang gerak; hitung kecepatan sendiri.',
    'Unggah hasil dan selesaikan kuis pasca-eksperimen.',
  ],
  'reaction-board': [
    'Fase 1: Ketuk layar segera setelah tombol tersembunyi muncul.',
    'Fase 2: Ulangi dengan tangan non-dominan.',
    'Fase 3: Jejaki bentuk bergerak di layar untuk mengukur koordinasi.',
  ],
  'breathing-pace': [
    'Letakkan ponsel dengan lembut di dada.',
    'Rekam pernapasan saat istirahat selama 1 menit. Hitung setiap napas.',
    'Jogging di tempat selama 1 menit, lalu rekam pernapasan lagi.',
    'Lakukan 100 star jump, lalu rekam pernapasan lagi.',
    'Bandingkan napas per menit dan gerakan dada. Selesaikan kuis.',
  ],
};

id.quizOpen = {
  'parachute-drop': {
    primary: [
      'Apakah parasutmu bekerja seperti yang kamu harapkan?',
      'Desain mana yang paling kamu suka? Mengapa?',
      'Apa yang akan kamu ubah jika menguji lagi?',
    ],
    highSchool: [
      'Apakah prediksi waktu jatuhmu mendekati pengukuran?',
      'Desain mana yang terbaik, dan menurutmu mengapa?',
      'Apa yang akan kamu perbaiki pada prototipe berikutnya?',
    ],
  },
  'hand-fan': {
    primary: [
      'Kipas mana yang paling menggerakkan kertas?',
      'Apa yang mengejutkanmu selama eksperimen?',
      'Jika bisa mencoba satu desain lagi, apa itu?',
    ],
    highSchool: [
      'Bagaimana kekakuan material memengaruhi hasilmu?',
      'Variabel mana (desain, jarak, atau kecepatan kipas) paling memengaruhi sudut lentur?',
      'Apa yang akan kamu perbaiki pada prototipe berikutnya?',
    ],
  },
  'sound-pollution': {
    primary: [
      'Suara mana yang paling keras dalam datamu?',
      'Mengapa kita harus melindungi telinga dari suara sangat keras?',
      'Di mana dalam kehidupan sehari-hari kamu mendengar suara keras serupa?',
    ],
    highSchool: [
      'Bagaimana prediksi aksi terkeras dibandingkan pengukuran?',
      'Pada tingkat dB berapa kerusakan pendengaran mungkin terjadi?',
      'Kebiasaan atau kebijakan apa yang bisa mengurangi paparan kebisingan berbahaya?',
    ],
  },
  earthquake: {
    primary: [
      'Apa yang membuat menara bertahan paling lama?',
      'Apa yang membuatnya jatuh lebih cepat?',
      'Jika membangun lagi, perubahan pertama apa yang akan kamu coba?',
    ],
    highSchool: [
      'Fitur desain mana yang paling menyerap getaran?',
      'Bagaimana lebar alas atau penyangga memengaruhi waktu bertahan?',
      'Fitur bangunan dunia nyata apa yang digunakan insinyur untuk gempa?',
    ],
  },
  'human-performance': {
    primary: [
      'Gerakan mana yang paling sulit dijaga agar halus?',
      'Apakah umpan balik langsung membantu pada percobaan kedua?',
      'Apa yang kamu pelajari tentang bergerak perlahan dan halus?',
    ],
    highSchool: [
      'Gerakan mana yang menghasilkan pembacaan getar tertinggi?',
      'Apakah umpan balik sensor mengurangi getaran? Jelaskan.',
      'Bagaimana atlet atau terapis fisik bisa memakai sensor serupa?',
    ],
  },
  'reaction-board': {
    primary: [
      'Apa yang membantumu bereaksi lebih cepat?',
      'Kapan paling sulit mengetuk warna yang benar?',
      'Apa yang akan kamu lakukan berbeda pada percobaan kedua?',
    ],
    highSchool: [
      'Bagaimana akurasi dan waktu reaksi saling mengimbangi dalam hasilmu?',
      'Faktor apa yang bisa mengubah waktu reaksimu antar percobaan?',
      'Bagaimana waktu reaksi berguna dalam kehidupan nyata?',
    ],
  },
  'breathing-pace': {
    primary: [
      'Kapan kamu bernapas paling cepat, dan menurutmu mengapa?',
      'Kapan ponsel paling banyak bergerak di dadamu?',
      'Apa yang paling sulit saat menjaga ponsel tetap stabil?',
    ],
    highSchool: [
      'Bagaimana olahraga memengaruhi napas per menit dibanding prediksi?',
      'Bagaimana gerakan dada berkaitan dengan laju pernapasan?',
      'Apa yang bisa memengaruhi pembacaan sensor selain pernapasan?',
    ],
  },
};

// Deep translate quiz/discussion - use structured replacements
function translateQuizItem(item, q, opts, ai) {
  return { question: q, options: opts, answerIndex: ai };
}

id.quiz['parachute-drop'] = {
  primary: [
    translateQuizItem(null, 'Apa yang menarik parasut dan mainan ke bawah?', ['Gravitasi', 'Hanya angin', 'Lem', 'Magnet'], 0),
    translateQuizItem(null, 'Apa yang membantu parasut jatuh lebih lambat?', ['Udara mendorong ke atas', 'Beban ekstra', 'Membuatnya lebih kecil', 'Mematikan gravitasi'], 0),
    translateQuizItem(null, 'Parasut yang lebih besar biasanya membuat mainan jatuh…', ['Lebih lambat', 'Lebih cepat', 'Tidak jatuh', 'Hanya ke samping'], 0),
    translateQuizItem(null, 'Pendaratan sangat keras biasanya…', ['Lebih kasar dan mengguncang', 'Lebih lembut dan aman', 'Sama dengan pendaratan lembut', 'Mustahil'], 0),
    translateQuizItem(null, 'Mengapa tim mencoba lebih dari satu desain parasut?', ['Untuk mempelajari yang terbaik', 'Untuk menghabiskan selotip', 'Karena satu tidak seru', 'Untuk membuatnya lebih berat'], 0),
  ],
  highSchool: [
    translateQuizItem(null, 'Gaya apa yang menarik parasut ke bawah?', ['Gravitasi', 'Hambatan udara', 'Magnetisme', 'Gesekan'], 0),
    translateQuizItem(null, 'Gaya apa yang bekerja ke atas untuk memperlambat parasut?', ['Gravitasi', 'Hambatan udara (Drag)', 'Tegangan', 'Gaya normal'], 1),
    translateQuizItem(null, 'Bagaimana memperbesar parasut memengaruhi waktu jatuh?', ['Memperpendek waktu jatuh', 'Memperpanjang waktu jatuh', 'Tidak berpengaruh', 'Membuat mainan lebih berat'], 1),
    translateQuizItem(null, 'Apa yang terjadi pada G-Force jika waktu berhenti sangat singkat?', ['Menurun', 'Meningkat', 'Tetap sama', 'Menjadi negatif'], 1),
    translateQuizItem(null, 'Mengapa insinyur membuat banyak prototipe?', ['Membuang material', 'Menguji dan meningkatkan kinerja', 'Karena satu tidak cukup', 'Agar mainan terlihat lebih bagus'], 1),
  ],
};

id.quiz['hand-fan'] = {
  primary: [
    translateQuizItem(null, 'Apa yang dilakukan udara bergerak pada kertas?', ['Mendorongnya', 'Melelehkannya', 'Membuatnya hilang', 'Menghentikan semua suara'], 0),
    translateQuizItem(null, 'Kipas yang lebih besar biasanya menggerakkan…', ['Lebih banyak udara', 'Lebih sedikit udara', 'Tidak ada udara', 'Hanya air'], 0),
    translateQuizItem(null, 'Saat kertas lebih jauh dari kipas, biasanya melengkung…', ['Lebih sedikit', 'Lebih banyak', 'Sama setiap kali', 'Tidak sama sekali'], 0),
    translateQuizItem(null, 'Mengipas lebih cepat biasanya membuat kertas bergerak…', ['Lebih banyak', 'Lebih sedikit', 'Tidak bergerak', 'Hanya ke belakang'], 0),
    translateQuizItem(null, 'Mengapa mencoba bentuk kipas berbeda?', ['Untuk melihat yang terbaik', 'Untuk merusak kertas', 'Karena selotip berat', 'Tidak ada alasan'], 0),
  ],
  highSchool: [
    translateQuizItem(null, 'Bagaimana kekakuan material memengaruhi sudut lentur?', ['Material lebih kaku lebih mudah lentur', 'Material lebih kaku butuh gaya lebih besar, sudut lebih kecil', 'Kekakuan tidak memengaruhi sudut', 'Hanya lentur jika jarak lebih jauh'], 1),
    translateQuizItem(null, 'Bagaimana desain kipas memengaruhi kecepatan udara dan gerakan kertas?', ['Kipas yang menangkap lebih banyak udara menciptakan kecepatan dan gerakan lebih besar', 'Kipas kecil selalu lebih cepat', 'Desain tidak memengaruhi kecepatan', 'Kecepatan hanya ditentukan material kipas'], 0),
    translateQuizItem(null, 'Bagaimana jarak dari kipas memengaruhi lenturan?', ['Lenturan meningkat seiring jarak', 'Jarak tidak memengaruhi sudut', 'Tekanan udara menurun seiring jarak, lenturan berkurang', 'Kipas hanya bekerja pada 30 cm'], 2),
    translateQuizItem(null, 'Gaya apa yang melengkungkan kertas tegak saat mengipas?', ['Gaya magnet', 'Gravitasi menarik ke bawah', 'Tekanan udara pada permukaan', 'Pemuaian termal'], 2),
    translateQuizItem(null, 'Mengapa lenturan berulang melemahkan kertas?', ['Kehilangan massa', 'Tekanan berulang mengubah struktur (plastisitas), lebih fleksibel', 'Menjadi lebih kaku', 'Menyerap kelembapan dari udara'], 1),
  ],
};

id.quiz['human-performance'] = {
  primary: [
    translateQuizItem(null, 'Saat bergerak cepat, ponsel sering terasa…', ['Lebih goyah', 'Benar-benar diam', 'Lebih berat', 'Lebih dingin'], 0),
    translateQuizItem(null, 'Otot dan sendi membantumu…', ['Menggerakkan tubuh', 'Mengisi daya ponsel', 'Mengubah cuaca', 'Tumbuh lebih tinggi seketika'], 0),
    translateQuizItem(null, 'Gerakan halus dan lambat biasanya…', ['Lebih mudah dikendalikan', 'Mustahil dilakukan', 'Selalu paling goyah', 'Tidak terdeteksi sensor'], 0),
    translateQuizItem(null, 'Bunyi peringatan saat latihan dapat membantumu…', ['Bergerak lebih halus', 'Berhenti bernapas', 'Merusak ponsel', 'Melewati eksperimen'], 0),
    translateQuizItem(null, 'Lab ini mengukur bagaimana…', ['Tubuhmu bergerak', 'Awan terbentuk', 'Tanaman tumbuh', 'Batu meleleh'], 0),
  ],
  highSchool: [
    translateQuizItem(null, 'Mengapa gerakan cepat sering menghasilkan getaran ponsel lebih tinggi?', ['Baterai lebih cepat habis', 'Akselerasi/deselerasi cepat menciptakan gerakan tidak stabil', 'Gravitasi meningkat dengan kecepatan', 'Sensor hanya bekerja pada kecepatan tinggi'], 1),
    translateQuizItem(null, 'Apa yang diciptakan otot dan sendi bersama?', ['Hanya sinyal listrik', 'Gerakan tubuh terkendali', 'Getaran ponsel', 'Gelombang suara'], 1),
    translateQuizItem(null, 'Mengapa gerakan lebih halus menunjukkan koordinasi lebih baik?', ['Butuh aktivasi otot lebih sedikit', 'Gerakan terkendali mengurangi akselerasi tersentak yang terdeteksi sensor', 'Gerakan halus selalu lebih lambat', 'Sensor tidak mendeteksi gerakan halus'], 1),
    translateQuizItem(null, 'Bagaimana umpan balik getaran membantu latihan gerak?', ['Membuat ponsel lebih berat', 'Memberi isyarat real-time agar gerakan lebih halus', 'Menggantikan otot', 'Hanya untuk gerakan angka 8'], 1),
    translateQuizItem(null, 'Apa yang dipelajari biomekanika dalam lab ini?', ['Hanya detak jantung saat olahraga', 'Cara tubuh bergerak: gaya, kecepatan, koordinasi', 'Reaksi kimia dalam makanan', 'Pola cuaca memengaruhi gerakan'], 1),
  ],
};

id.quiz['reaction-board'] = {
  primary: [
    translateQuizItem(null, 'Waktu reaksi adalah berapa lama untuk…', ['Merespons setelah melihat sesuatu', 'Berlari', 'Tidur', 'Makan siang'], 0),
    translateQuizItem(null, 'Tangan dominan sering lebih cepat karena kamu…', ['Menggunakannya lebih sering', 'Memakai sepatu lebih besar', 'Menahan napas', 'Melewatkan latihan'], 0),
    translateQuizItem(null, 'Otak membantumu bergerak dengan mengirim pesan melalui…', ['Saraf', 'Rambut', 'Sepatu', 'Kotak bekal'], 0),
    translateQuizItem(null, 'Berlatih berkali-kali biasanya membuatmu…', ['Lebih cepat dan akurat', 'Lebih lambat setiap kali', 'Tidak bisa mengetuk', 'Lupa warna'], 0),
    translateQuizItem(null, 'Permainan menelusuri menguji seberapa baik tangan dan mata…', ['Bekerja sama', 'Membuat suara', 'Mengubah warna', 'Mengukur suhu'], 0),
  ],
  highSchool: [
    translateQuizItem(null, 'Apa itu waktu reaksi?', ['Seberapa cepat kamu lari', 'Waktu untuk merespons rangsangan', 'Waktu memikirkan jawaban', 'Berapa lama ingatan bertahan'], 1),
    translateQuizItem(null, 'Mengapa tangan dominan bisa lebih cepat?', ['Otot lebih kuat', 'Tulang lebih besar', 'Jalur saraf lebih kuat dari penggunaan sering', 'Lebih dekat ke otak'], 2),
    translateQuizItem(null, 'Bagian tubuh mana yang memproses sinyal visual dan mengirim perintah ke tangan?', ['Jantung', 'Otot', 'Otak dan sistem saraf', 'Hanya mata'], 2),
    translateQuizItem(null, 'Bagaimana latihan memengaruhi waktu reaksi dan koordinasi?', ['Membuat lebih lambat karena lelah', 'Meningkatkan kecepatan dengan memperkuat jalur saraf', 'Tidak memengaruhi waktu reaksi', 'Membuat jari lebih besar'], 1),
    translateQuizItem(null, 'Apa yang diukur tantangan menelusuri?', ['Seberapa keras menekan layar', 'Kecepatan pemrosesan ponsel', 'Koordinasi mata-tangan dan motorik halus', 'Ingatan bentuk'], 2),
  ],
};

id.quiz['breathing-pace'] = {
  primary: [
    translateQuizItem(null, 'Setelah olahraga, kamu biasanya bernapas…', ['Lebih cepat', 'Lebih lambat selamanya', 'Tidak sama sekali', 'Hanya melalui kaki'], 0),
    translateQuizItem(null, 'Di mana ponsel harus diletakkan untuk merasakan pernapasan?', ['Lembut di dada', 'Di lantai', 'Di tas', 'Di bawah kursi'], 0),
    translateQuizItem(null, 'Sensor ponsel merasakan dada…', ['Bergerak naik turun', 'Menjadi lebih berat', 'Berubah biru', 'Hanya membuat suara'], 0),
    translateQuizItem(null, 'Setelah star jump, pernapasan lebih cepat karena tubuh butuh…', ['Lebih banyak udara dan istirahat', 'Lebih sedikit udara', 'Tanpa oksigen', 'Berhenti bergerak'], 0),
    translateQuizItem(null, 'Napas per menit memberitahumu…', ['Berapa napas dalam satu menit', 'Seberapa keras kamu', 'Ukuran sepatu', 'Warna ruangan'], 0),
  ],
  highSchool: [
    translateQuizItem(null, 'Mengapa laju pernapasan meningkat saat olahraga?', ['Mendinginkan paru-paru', 'Menyuplai lebih banyak oksigen ke otot', 'Karena sensor ponsel mempercepat', 'Menurunkan detak jantung'], 1),
    translateQuizItem(null, 'Di mana ponsel harus diletakkan untuk mendeteksi gerakan dada?', ['Di lantai', 'Lembut di dada', 'Di saku', 'Diulurkan sejauh lengan'], 1),
    translateQuizItem(null, 'Apa yang diukur akselerometer dalam aktivitas ini?', ['Tekanan darah langsung', 'Naik turun dada dari pernapasan', 'Suhu ruangan', 'Tingkat suara'], 1),
    translateQuizItem(null, 'Mengapa laju pernapasan lebih tinggi setelah star jump?', ['Tubuh butuh lebih sedikit oksigen', 'Otot butuh lebih banyak oksigen untuk pulih', 'Pernapasan melambat setelah olahraga', 'Sensor hanya bekerja setelah lompat'], 1),
    translateQuizItem(null, 'Apa itu napas per menit (BPM)?', ['Seberapa keras bernapas', 'Jumlah siklus napas dalam satu menit', 'Berat udara yang dihirup', 'Kecepatan detak jantung'], 1),
  ],
};

id.quizWizard['sound-pollution'] = {
  primary: [
    { question: 'Suara mana yang biasanya paling tenang?', options: ['Berbisik ke teman', 'Lalu lintas ramai', 'Konser rock', 'Bor listrik'], correctIndex: 0, explanation: 'Berbicara pelan jauh lebih lembut daripada lalu lintas, konser, atau bor.' },
    { question: 'Suara sangat keras dalam waktu lama dapat…', options: ['Merusak pendengaran', 'Membuat lebih tinggi', 'Mengubah cuaca', 'Menghentikan gravitasi'], correctIndex: 0, explanation: 'Kebisingan keras dapat merusak telinga jika didengar terlalu lama.' },
    { question: 'Cara baik melindungi telinga dekat suara sangat keras adalah…', options: ['Menjauh atau memakai pelindung telinga', 'Berdiri lebih dekat', 'Berteriak lebih keras', 'Hanya menutup mata'], correctIndex: 0, explanation: 'Jarak dan pelindung telinga membantu menjaga pendengaran aman.' },
  ],
  highSchool: [
    { question: 'Pada tingkat suara berapa kerusakan pendengaran mungkin terjadi setelah paparan singkat?', options: ['30-60 dB', '60-85 dB', '90-100 dB', '140+ dB'], correctIndex: 2, explanation: '90-100 dB (seperti motor atau alat listrik) dapat merusak pendengaran setelah paparan singkat.' },
    { question: 'Manakah yang dianggap aman untuk waktu lama?', options: ['Lalu lintas ramai (80 dB)', 'Percakapan normal (50 dB)', 'Mesin rumput (90 dB)', 'Konser rock (110 dB)'], correctIndex: 1, explanation: '30-60 dB, seperti percakapan normal, aman untuk waktu lama.' },
    { question: 'Apa risiko langsung pada 140+ dB?', options: ['Tidak ada risiko', 'Kelelahan', 'Kerusakan pendengaran instan dan permanen', 'Denging sementara'], correctIndex: 2, explanation: '140+ dB (seperti ledakan atau tembakan) menyebabkan kerusakan pendengaran instan dan permanen.' },
  ],
};

id.quizWizard.earthquake = {
  primary: [
    { question: 'Saat gempa, tanah…', options: ['Bergetar', 'Berubah menjadi es', 'Berhenti bergerak selamanya', 'Menjadi tidak terlihat'], correctIndex: 0, explanation: 'Gempa mengguncang tanah maju mundur.' },
    { question: 'Alas lebar dan stabil biasanya membantu menara…', options: ['Tegak lebih lama', 'Jatuh lebih cepat', 'Mengambang', 'Meleleh'], correctIndex: 0, explanation: 'Alas lebih lebar dapat membuat struktur lebih stabil saat bergetar.' },
    { question: 'Bantalan lembut atau lapisan lipatan membantu karena…', options: ['Menyerap sebagian guncangan', 'Membuat ponsel lebih berat', 'Menghentikan gravitasi', 'Menghilangkan semua suara'], correctIndex: 0, explanation: 'Bantalan dapat menyerap sebagian energi guncangan.' },
  ],
  highSchool: [
    { question: 'Mengapa insinyur merancang struktur menyerap dan mendistribusikan energi saat gempa?', options: ['Membuat bangunan lebih berat', 'Mencegah getaran tanah meruntuhkan struktur', 'Meningkatkan kecepatan getaran', 'Menghemat material'], correctIndex: 1, explanation: 'Bangunan dirancang menyerap dan mendistribusikan energi agar getaran tidak meruntuhkan struktur buruk.' },
    { question: 'Apa penyebab utama kerusakan bangunan saat gempa?', options: ['Angin kencang', 'Hujan lebat', 'Getaran tanah', 'Suara keras'], correctIndex: 2, explanation: 'Gempa menyebabkan getaran tanah parah yang mengguncang dan dapat meruntuhkan bangunan.' },
    { question: 'Modifikasi struktur mana yang membuat bangunan LEBIH tahan getaran gempa?', options: ['Membuat alas lebih sempit', 'Menambah lapisan penyerap guncangan dan penyangga silang', 'Membangun lebih tinggi tanpa dukungan', 'Menggunakan material lebih lemah'], correctIndex: 1, explanation: 'Lapisan anti-getar, penyangga silang, dan tiang kuat membantu mendistribusikan energi.' },
  ],
};

id.discussion['parachute-drop'] = {
  primary: {
    paragraphs: ['Gravitasi menarik mainan ke bawah. Parasut menangkap udara dan memperlambat jatuh agar pendaratan lebih lembut. Parasut lebih besar biasanya memperlambat lebih banyak. Menguji desain berbeda membantu melihat yang terbaik.'],
    talkAbout: 'Parasut mana yang memberi pendaratan paling lembut? Apa yang akan kamu ubah lain kali?',
  },
  highSchool: {
    paragraphs: ['Gravitasi menarik benda ke bawah, mempercepat saat jatuh. Parasut meningkatkan hambatan udara (drag). Drag bekerja ke atas, melawan gerak dan memperlambat jatuh. Jatuh lebih lambat mengurangi gaya saat benturan, membuat pendaratan lebih aman. Insinyur memperbaiki desain parasut melalui pengujian berulang.'],
    tables: [
      { title: 'Gaya yang Bekerja pada Mainan', headers: ['Gaya', 'Rumus'], rows: [['Ke bawah (berat)', 'W = m × g'], ['Ke atas (drag)', 'D = W - F_net'], ['Gaya bersih (total)', 'F_net = m × a'], ['Hukum Newton 2', 'F = m × a']] },
      { title: 'Rentang G-Force Tipikal dan Risiko Cedera', headers: ['G-Force', 'Contoh', 'Dampak yang Mungkin'], rows: [['1–5 g', 'Berdiri cepat, lift, wahana', 'Tidak cedera'], ['5–10 g', 'Jatuh saat lari, rem mobil ringan', 'Memar atau strain mungkin'], ['10–30 g', 'Tabrakan olahraga, sepeda, mobil (sabuk)', 'Cedera serius mungkin'], ['30–50 g', 'Kecelakaan parah, jatuh ke permukaan keras', 'Risiko cedera parah tinggi'], ['50+ g', 'Hentian sangat tiba tanpa bantalan', 'Cedera mengancam jiwa mungkin']] },
    ],
    important: 'Durasi penting. Lonjakan singkat mungkin masih bisa ditahan, sementara g-force berkelanjutan lebih berbahaya.',
  },
};

id.discussion['hand-fan'] = {
  primary: {
    paragraphs: ['Saat mengipas, kamu mendorong udara ke kertas. Udara mendorong balik dan melengkungkan kertas. Kipas lebih besar dan mengipas lebih cepat biasanya menggerakkan kertas lebih banyak. Jika kertas lebih jauh, udara terasa lebih lemah.'],
    talkAbout: 'Desain kipas mana yang paling menggerakkan kertas? Apa yang akan kamu coba berikutnya?',
  },
  highSchool: {
    paragraphs: ['Udara bergerak memberi gaya fisik, tekanan aerodinamis, pada benda di jalurnya. Saat memakai kipas tangan, volume udara dan kecepatannya menentukan gaya pada kertas target.'],
    sections: [
      { heading: 'Desain Kipas & Dinamika Fluida', body: 'Desain kipas sangat memengaruhi efektivitas menggerakkan udara. Lipatan lebih lebar biasanya punya area lebih besar. Bentuk lipatan juga menentukan seberapa terarah aliran udara. Aliran lebih terarah berarti lebih sedikit udara "bocor" ke samping.' },
      { heading: 'Kekakuan Material & Plastisitas', body: 'Gaya untuk melengkungkan benda bergantung pada kekakuannya. Saat kertas melengkung lalu kembali, itu elastis. Jika melengkung terlalu jauh dan tetap lentur, tegangannya berlebihan. Lenturan berulang dapat melemahkan kertas.' },
    ],
    tables: [{ title: 'Faktor Utama yang Memengaruhi Gaya Aliran Udara', headers: ['Faktor', 'Dampak Ilmiah'], rows: [['Luas Permukaan Kipas', 'Area lebih besar menggeser lebih banyak udara tiap ayunan.'], ['Kecepatan Mengipas', 'Tekanan dinamis meningkat dengan kuadrat kecepatan udara.'], ['Jarak Target', 'Aliran menyebar seiring jarak, tekanan turun signifikan.']] }],
    didYouKnow: 'Insinyur memakai dinamika fluida untuk turbin angin, sayap pesawat, dan kipas pendingin.',
  },
};

id.discussion['sound-pollution'] = {
  primary: { paragraphs: ['Bagikan temuanmu! Tempat mana yang paling keras? Mana yang paling tenang? Mengapa menurutmu itu terjadi?'], activityDiscussionTitle: 'Diskusi Aktivitas' },
  highSchool: { paragraphs: ['Bagikan temuan terkeras! Area sekolah mana yang paling berisik? Apakah ada sumber polusi suara yang mengejutkan?'], activityDiscussionTitle: 'Diskusi Aktivitas' },
};

id.discussion.earthquake = {
  primary: { paragraphs: ['Tunjukkan menara terkuatmu! Apa yang membantunya tetap berdiri saat ponsel bergetar — alas lebar, tiang, atau lapisan lembut?'], activityDiscussionTitle: 'Diskusi Aktivitas' },
  highSchool: { paragraphs: ['Bagikan desain bangunan paling stabil! Kombinasi lipatan dan tiang mana yang paling berhasil?'], activityDiscussionTitle: 'Diskusi Aktivitas' },
};

id.discussion['human-performance'] = {
  primary: {
    paragraphs: ['Otot dan sendi membantumu bergerak. Saat terburu-buru, ponsel sering terasa lebih goyah. Gerakan lambat dan halus lebih mudah dikendalikan. Sensor menunjukkan seberapa stabil gerakanmu.'],
    talkAbout: 'Gerakan mana yang paling goyah? Apakah bunyi peringatan membantu melambat pada percobaan kedua?',
  },
  highSchool: {
    paragraphs: ['Otot dan sendi bekerja sama menciptakan gerakan. Gerakan cepat sering mengurangi kontrol; gerakan halus menunjukkan koordinasi lebih baik. Sensor di ponsel mengukur seberapa cepat dan halus tubuh bergerak, membantu memahami biomekanika dan kelelahan.'],
    sections: [
      { heading: 'Otot & Sendi', body: 'Otot rangka menarik tulang melalui tendon; sendi sebagai titik poros. Aktivasi otot terkoordinasi menghasilkan gerakan halus dan terarah. Saat otot lelah, kontrol menurun dan pembacaan getar cenderung naik.' },
      { heading: 'Kecepatan vs. Kontrol', body: 'Saat kecepatan gerak meningkat, tubuh harus mengelola akselerasi/deselerasi lebih besar. Gerakan tersentak menciptakan lonjakan sensor lebih besar. Latihan gerakan lambat dan sengaja membangun kontrol neuromuskular.' },
      { heading: 'Umpan Balik Sensor', body: 'Sensor getar dan gerak menerjemahkan gerakan fisik menjadi data terukur — getaran (cm), kecepatan (m/s), kelancaran, dan rentang gerak. Membandingkan prediksi dengan hasil membantu penalaran ilmiah tentang tubuh sendiri.' },
    ],
    didYouKnow: 'Atlet dan pelatih memakai sensor gerak untuk memeriksa bentuk dan melatih gerakan lebih halus dan aman — seperti ponselmu di lab ini.',
  },
};

id.discussion['reaction-board'] = {
  primary: {
    paragraphs: [
      'Waktu reaksi adalah seberapa cepat kamu merespons setelah melihat sesuatu. Mata mengirim pesan ke otak, otak memberi perintah ke tangan untuk mengetuk. Tangan dominan sering lebih cepat karena lebih sering dipakai.',
      'Permainan menelusuri menguji seberapa baik tangan dan mata bekerja sama. Latihan dapat membuatmu lebih cepat dan akurat.',
    ],
    talkAbout: 'Tangan mana yang lebih cepat? Apakah kamu lebih baik pada tantangan menelusuri?',
  },
  highSchool: {
    paragraphs: ['Waktu reaksi mengukur seberapa cepat otak memproses informasi visual dari mata dan mengirim sinyal melalui sistem saraf ke otot tangan.'],
    sections: [
      { heading: 'Tangan Dominan vs. Non-Dominan', body: 'Kamu mungkin melihat perbedaan antar tangan. Tangan dominan biasanya lebih cepat karena jalur sarafnya lebih berkembang dari penggunaan sehari-hari.' },
      { heading: 'Koordinasi dan Akurasi', body: 'Tantangan Menelusuri menguji keterampilan motorik halus dan koordinasi mata-tangan. Otak terus menyesuaikan gerakan otot berdasarkan umpan balik visual yang berubah.' },
    ],
    didYouKnow: 'Atlet dan gamer berlatih berjam-jam untuk memangkas milidetik dari waktu reaksi.',
  },
};

id.discussion['breathing-pace'] = {
  primary: {
    paragraphs: ['Saat istirahat, kamu bernapas stabil. Setelah jogging atau star jump, pernapasan lebih cepat karena tubuh butuh lebih banyak udara. Ponsel di dada merasakan naik turun.'],
    talkAbout: 'Kapan kamu bernapas paling cepat — saat istirahat, setelah jogging, atau setelah star jump? Mengapa menurutmu begitu?',
  },
  highSchool: {
    paragraphs: ['Laju pernapasan meningkat saat olahraga untuk menyuplai lebih banyak oksigen ke otot. Sensor mendeteksi gerakan dada, membantu memvisualisasikan pola pernapasan.'],
    sections: [
      { heading: 'Pernapasan Saat Istirahat vs Setelah Olahraga', body: 'Saat istirahat, tubuh butuh oksigen stabil. Setelah olahraga, otot bekerja lebih keras. Laju pernapasan naik agar paru-paru membawa lebih banyak oksigen dan membuang gas sisa lebih cepat.' },
      { heading: 'Cara Kerja Sensor', body: 'Saat ponsel di dada, akselerometer mendeteksi gerakan kecil tiap tarik dan hembus. Napas lebih besar setelah olahraga memberi pembacaan lebih besar. Membandingkan napas per menit membantu melihat dampak olahraga pada tubuh.' },
    ],
    didYouKnow: 'Dokter dan atlet kadang memakai sensor untuk memantau pernapasan saat latihan — seperti ponselmu di lab ini.',
  },
};

const compact = (obj) => JSON.stringify(obj);

fs.writeFileSync(path.join(outDir, 'activityContent.en.json'), compact(en));
fs.writeFileSync(path.join(outDir, 'activityContent.id.json'), compact(id));

const enLines = fs.readFileSync(path.join(outDir, 'activityContent.en.json'), 'utf8').split('\n').length;
const idLines = fs.readFileSync(path.join(outDir, 'activityContent.id.json'), 'utf8').split('\n').length;
console.log('activityContent.en.json lines:', enLines);
console.log('activityContent.id.json lines:', idLines);
console.log('en bytes:', fs.statSync(path.join(outDir, 'activityContent.en.json')).size);
console.log('id bytes:', fs.statSync(path.join(outDir, 'activityContent.id.json')).size);
