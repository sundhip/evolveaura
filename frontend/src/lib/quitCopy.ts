/**
 * Centralised user-facing copy for the Smoke-Free Path module.
 * 
 * Strict Evidence & Safety Rules:
 * 1. Health/clinical statements are ONLY sourced from docs/rehab-evidence.md.
 * 2. Zero medication brand or dose recommendations.
 * 3. NO occurrences of medication terms or clinical prescriptions.
 * 4. Ready for future localization (e.g., Hindi translation).
 */

export const QUIT_COPY = {
  // Disclaimer & Helplines (docs/rehab-evidence.md #1, #4)
  footerDisclaimer:
    'EvolveAura is a self-help tool, not medical care. For medicines or health concerns, speak to a doctor or visit a Tobacco Cessation Centre. National Tobacco Quitline: 1800-11-2356.',
  crisisBannerTitle: 'Need urgent mental health or cessation support?',
  crisisBannerBody:
    'You are never alone. Confidential, free government helplines are available 24/7 across India.',
  teleManasHelpline: '14416',
  teleManasLabel: 'Tele-MANAS Mental Health Helpline (Toll-Free 24/7)',
  quitlineHelpline: '1800-11-2356',
  quitlineLabel: 'National Tobacco Quitline (Toll-Free)',

  // Consent & Agreement (Self-help tool & 18+ requirement)
  consentTitle: 'Smoke-Free Path: Self-Help Agreement',
  consentSubtitle:
    'A dedicated digital companion modelled after Tobacco Cessation Centres (TCC) to support your smoke-free journey.',
  consentCheckbox18: 'I confirm that I am 18 years of age or older.',
  consentCheckboxInformed:
    'I understand that EvolveAura is an interactive self-help and motivation tool, not medical care or clinical treatment. If I need health advice or medical assistance, I will consult a doctor or a Tobacco Cessation Centre.',
  consentSubmitButton: 'I Agree & Begin',
  consentErrorUnder18: 'You must be 18 or older to access the Smoke-Free Path module.',
  consentErrorNoInformed: 'Please acknowledge the self-help guidelines to proceed.',

  // Screening & FTND Questions
  screeningTitle: 'Assessment & Readiness',
  screeningSubtitle:
    'This brief assessment helps tailor your personal plan. Your responses remain private and confidential.',
  step1Title: 'Nicotine Dependence (FTND)',
  step2Title: 'Readiness & Motivation',
  step3Title: 'Current Habits & Baseline',

  ftndQuestions: [
    {
      id: 0,
      question: 'How soon after you wake up do you smoke your first cigarette?',
      options: [
        { label: 'Within 5 minutes', value: 3 },
        { label: '6 to 30 minutes', value: 2 },
        { label: '31 to 60 minutes', value: 1 },
        { label: 'After 60 minutes', value: 0 }
      ]
    },
    {
      id: 1,
      question: 'Do you find it difficult to refrain from smoking in places where it is forbidden?',
      options: [
        { label: 'Yes', value: 1 },
        { label: 'No', value: 0 }
      ]
    },
    {
      id: 2,
      question: 'Which cigarette would you hate most to give up?',
      options: [
        { label: 'The first one in the morning', value: 1 },
        { label: 'Any other', value: 0 }
      ]
    },
    {
      id: 3,
      question: 'How many cigarettes per day do you typically smoke?',
      options: [
        { label: '10 or fewer', value: 0 },
        { label: '11 to 20', value: 1 },
        { label: '21 to 30', value: 2 },
        { label: '31 or more', value: 3 }
      ]
    },
    {
      id: 4,
      question: 'Do you smoke more frequently during the first hours after waking than during the rest of the day?',
      options: [
        { label: 'Yes', value: 1 },
        { label: 'No', value: 0 }
      ]
    },
    {
      id: 5,
      question: 'Do you smoke if you are so ill that you are in bed most of the day?',
      options: [
        { label: 'Yes', value: 1 },
        { label: 'No', value: 0 }
      ]
    }
  ],

  readinessQuestions: {
    stage: 'Where do you see yourself right now in your quitting journey?',
    stageOptions: [
      { label: 'Thinking about quitting in the next 6 months', value: 'PRECONTEMPLATION' },
      { label: 'Planning to quit in the next 30 days', value: 'CONTEMPLATION' },
      { label: 'Ready to take action right now', value: 'PREPARATION' },
      { label: 'Already actively taking steps or quit recently', value: 'ACTION' }
    ],
    confidence: 'How confident do you feel about succeeding in your quit journey? (1 = Low, 10 = Very confident)',
    importance: 'How important is quitting tobacco to you right now? (1 = Low, 10 = Top priority)',
    triggers: 'What are your most common smoking triggers? (Select all that apply)',
    triggerOptions: [
      'Stress or anxiety',
      'Social gatherings or with friends',
      'Morning routine or with tea/coffee',
      'After meals',
      'Boredom or breaks at work',
      'Driving or commuting'
    ]
  },

  baselineQuestions: {
    tobaccoType: 'Primary tobacco type:',
    tobaccoOptions: ['Cigarettes', 'Bidis', 'Smokeless tobacco', 'Mixed'],
    dailyCount: 'Average units consumed per day:',
    costPerUnit: 'Estimated cost per unit in INR (Rs.):',
    yearsUsed: 'Number of years using tobacco:'
  },

  // Plan Builder (5 A's Model: Ask, Advise, Assess, Assist, Arrange)
  planBuilderTitle: 'Design Your Personal Quit Plan',
  planBuilderSubtitle:
    'Evidence-based strategy adapted from clinical cessation counselling guidelines.',
  planModeTaper: 'Gradual Taper (Recommended for heavier routines)',
  planModeTaperDesc: 'Gradually step down daily cigarettes over 2 to 6 weeks toward a definitive quit date.',
  planModeCold: 'Target Quit Date (Set within next 14 days)',
  planModeColdDesc: 'Choose a firm date within the next two weeks to stop completely.',
  planTaperWeeksLabel: 'Taper duration (weeks):',
  planQuitDateLabel: 'Select your Quit Date (within 14 days):',
  chainSmokerAdvisory:
    'Your assessment indicates a heavy morning intake pattern. A doctor or Tobacco Cessation Centre can advise on nicotine replacement and other support.',
  highDependenceAdvisory:
    'Your assessment indicates high nicotine dependence. While our structured check-ins will help you build habits, pairing this tool with counselling from a Tobacco Cessation Centre is strongly advised.',
  printablePlanHeader: 'My Personal Quit Plan - EvolveAura',
  printPlanButton: 'Print / Save Plan (PDF)',

  // Daily Check-in & Craving SOS
  checkinTitle: 'Daily Smoke-Free Check-In',
  checkinSubtitle: 'Consistent daily follow-up is the proven foundation of long-term tobacco cessation.',
  cigarettesSmokedToday: 'Cigarettes or tobacco units used today:',
  cravingCountToday: 'Cravings experienced today:',
  moodLabel: 'How is your mood today? (1 = Very Low, 5 = Great)',
  notesLabel: 'Notes or thoughts on today:',
  notesPlaceholder: 'Write down how you coped, triggers you noticed, or feelings...',
  checkinSavedMessage: 'Your daily check-in has been recorded. Every tracked day builds resilience.',

  // Slip / Lapse Logger (Non-judgmental)
  lapseModalTitle: 'Log a Slip (Judgment-Free)',
  lapseModalSubtitle:
    'A slip is a learning moment, not a failure. It does not reset your commitment or erase your progress.',
  lapseUnitsLabel: 'How many units were used during this slip?',
  lapseTriggerLabel: 'What triggered this moment?',
  lapseNotesLabel: 'What can we learn or do differently next time?',
  lapseSubmitButton: 'Save & Keep Moving Forward',
  lapseEncouragement:
    'Be kind to yourself. Overcoming dependence is a journey of persistence, not perfection.',

  // Craving SOS Tools (5 Science-Backed Behavioural Tools)
  sosTitle: 'Craving SOS',
  sosSubtitle: 'Cravings are temporary waves. Most intense cravings subside within 3 to 5 minutes.',
  sosToolBreathe: '4-7-8 Breathing (2 min)',
  sosToolBreatheDesc: 'Calm your nervous system: Inhale for 4 seconds, hold for 7, exhale gently for 8.',
  sosToolDelay: '10-Minute Delay Timer',
  sosToolDelayDesc: 'Tell yourself: "I will wait 10 minutes." Notice how the urge peaks and fades.',
  sosToolWater: 'Slow Glass of Water',
  sosToolWaterDesc: 'Drink a cold glass of water slowly through a straw or in small mindful sips.',
  sosToolMove: 'Physical Reset (60 sec)',
  sosToolMoveDesc: 'Walk around, do 10 gentle stretches, or change rooms to interrupt the automatic urge.',
  sosToolDistract: 'Mental Focus Shift',
  sosToolDistractDesc: 'Engage your senses: count 5 blue objects around you, or solve a quick puzzle.',
  cravingLoggedSuccess: 'Craving overcome! You strengthened your willpower muscle.',

  // Progress Dashboard
  progressTitle: 'Your Smoke-Free Milestones',
  streakLabel: 'Smoke-Free Days Streak',
  avoidedLabel: 'Estimated Avoided Units',
  moneySavedLabel: 'Money Saved (INR)',
  cravingsSurvivedLabel: 'Cravings Survived',
  exportDataButton: 'Export My Cessation Data (JSON)',
  deleteDataButton: 'Delete My Cessation Data',
  deleteDataModalTitle: 'Permanently Delete Cessation Data',
  deleteDataWarning:
    'This will permanently delete your quit profile, check-ins, cravings, and lapse logs. This action cannot be undone. Type DELETE_MY_QUIT_DATA to confirm.',

  // Tobacco Cessation Centre (TCC) & Help Guide
  helpTitle: 'Tobacco Cessation Support & Resources',
  helpSubtitle: 'Professional counselling and national resources to empower your journey.',
  whatIsTccTitle: 'What is a Tobacco Cessation Centre (TCC)?',
  whatIsTccBody:
    'Tobacco Cessation Centres were established across India by the Ministry of Health and Family Welfare (MoHFW) and WHO. They offer dedicated face-to-face counselling, tailored quit plans, follow-up monitoring, and educational materials. Both smokers and smokeless-tobacco users benefit substantially from quitting; quitting lowers the risk of respiratory disease, delays its onset, and slows chronic lung disease progression.',
  tccDoctorAdviceNote:
    'A doctor or Tobacco Cessation Centre can advise on nicotine replacement and other support.',
  nationalQuitlineTitle: 'National Tobacco Quitline (Toll-Free)',
  nationalQuitlineNumber: '1800-11-2356',
  nationalQuitlineTimings: 'Toll-free telephone counselling available Tuesday through Sunday (8:00 AM to 8:00 PM).',
  callQuitlineButton: 'Call 1800-11-2356',
  teleManasTitle: 'Tele-MANAS Comprehensive Mental Health Helpline',
  teleManasNumber: '14416',
  teleManasTimings: '24 hours a day, 7 days a week, in multiple Indian languages.',
  callTeleManasButton: 'Call 14416',
  questionsForDoctorTitle: 'Questions to Ask Your Doctor or TCC Counsellor',
  questionsForDoctorList: [
    'What support options are best suited for my daily routine and health history?',
    'How can I best manage sleep disruptions, irritability, or cravings during the initial weeks?',
    'Are there local support groups or community clinics near me offering regular follow-up?',
    'What strategies can help protect my lungs and heart as my body begins to heal?'
  ],

  // Phase 6: Ethical Incentives & Invitations
  landingSectionBadge: 'Smoke-Free Path Support',
  landingSectionTitle: 'Trying to quit tobacco or smoking?',
  landingSectionSubtitle:
    'A free, private digital self-help tool modeled after India’s Tobacco Cessation Centres (TCCs). Designed to support your daily follow-up without guilt or pressure.',
  landingFeature1Title: '100% Free & Private',
  landingFeature1Desc: 'No subscriptions, no ads, and no public disclosure. Your records remain strictly yours.',
  landingFeature2Title: '2-Minute Craving Rescue',
  landingFeature2Desc: 'Access rapid 4-7-8 breathing and delay timers anytime an urge spikes, even without logging in.',
  landingFeature3Title: 'Honest Behaviour Rewards',
  landingFeature3Desc: 'Earn XP, badges, and shields for showing up and honest logging—even on days you experience a slip.',
  landingStartButton: 'Start the Smoke-Free Path',
  landingTryButton: 'Try Craving SOS in 2 Minutes',
  landingProfessionalSupportNote:
    'EvolveAura is a digital self-help tool. For professional cessation counselling, visit an official Tobacco Cessation Centre or call the National Tobacco Quitline: 1800-11-2356.',

  // Savings Goal
  savingsGoalTitle: 'Target Reward Goal',
  savingsGoalSubtitle: 'Allocate real tobacco savings toward something meaningful for yourself or your family.',
  savingsItemLabel: 'What are you saving for?',
  savingsAmountLabel: 'Target cost in INR (Rs.):',
  saveGoalButton: 'Save Reward Goal',
  savingsGoalProgress: 'Progress towards',

  // Welcome & Reminders
  welcomeBannerTitle: 'Welcome to the Smoke-Free Path!',
  welcomeBannerBody:
    'You earned +100 XP and the "First Breath" badge for setting up your personal strategy. Take it one day at a time.',
  remindersTitle: 'Gentle Browser Check-in Reminders',
  remindersSubtitle: 'Optional, private local browser notifications to support your daily follow-up routine.',
  remindersEnableToggle: 'Enable Daily Check-in Reminder',
  remindersTimeLabel: 'Preferred check-in time:',
  saveRemindersButton: 'Save Reminder Settings',

  // Gentle Re-engagement
  reengagementBannerTitle: 'Welcome back. No catch-up needed.',
  reengagementBannerBody:
    'Quitting is a continuous journey. You never need to compensate for missed days—simply take a slow breath and log today.',

  // Evidence-Backed Health Cards
  evidenceHealthTitle: 'Why Cessation Matters (Evidence-Backed Insights)',
  evidenceHealthCards: [
    {
      title: 'Respiratory Protection & Progression',
      fact: 'WHO and India’s MoHFW findings show that both smokers and smokeless-tobacco users benefit substantially from quitting; quitting lowers the risk of respiratory disease, delays its onset, and slows chronic lung disease progression.',
      citation: 'Kaushik et al., Healthline 2023;14(3):244-247'
    },
    {
      title: 'Daily Follow-Up is the Core Keystone',
      fact: 'A comprehensive NTCP evaluation of Tobacco Cessation Centres found that while thousands seek counselling, regular follow-up is where most drop off. Consistent daily check-ins represent the highest leverage factor in long-term success.',
      citation: 'Kaushik et al., Indian J Community Health 2025;37(5):842-847'
    },
    {
      title: 'Behavioural Interventions Double Success',
      fact: 'A systematic review and meta-analysis of 16 studies (9,613 participants) in India demonstrated that structured behavioural interventions increase the likelihood of quitting by roughly 1.7 to 2.0 times.',
      citation: 'J Family Med Prim Care 2023 (9,613 participants)'
    }
  ],

  // Boss Battle
  nicotineShadeBossTitle: 'Recovery Boss: Nicotine Shade',
  nicotineShadeBossDesc:
    'A shadowy manifestation of chemical cravings. Damaged by daily check-ins, surviving cravings, and smoke-free days. It never heals from slips.',

  // Share card
  shareCardTitle: 'Share Smoke-Free Progress',
  shareCardSubtitle: 'Private summary card with zero health notes, names, or internal data.'
};
