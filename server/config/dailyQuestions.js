const dailyQuestions = {
  // Free text questions for deep reflection
  freeText: [
    {
      id: 'ft_gratitude',
      text: 'What are three things you\'re grateful for today? Describe why each one matters to you.',
      category: 'gratitude',
      priority: 1
    },
    {
      id: 'ft_reflection',
      text: 'Reflect on your day. What moment stood out to you the most and why?',
      category: 'reflection',
      priority: 2
    },
    {
      id: 'ft_challenge',
      text: 'What was the biggest challenge you faced today? How did you handle it, and what did you learn?',
      category: 'challenges',
      priority: 1
    },
    {
      id: 'ft_growth',
      text: 'Describe one way you grew or improved today, no matter how small.',
      category: 'reflection',
      priority: 2
    },
    {
      id: 'ft_tomorrow',
      text: 'What\'s one thing you want to focus on or improve tomorrow?',
      category: 'goals',
      priority: 1
    },
    {
      id: 'ft_emotions',
      text: 'Describe your emotional journey today. What triggered different feelings?',
      category: 'mood',
      priority: 2
    },
    {
      id: 'ft_accomplishment',
      text: 'What accomplishment, big or small, are you most proud of today?',
      category: 'reflection',
      priority: 1
    },
    {
      id: 'ft_relationship',
      text: 'How did your interactions with others impact your day? Describe a meaningful connection.',
      category: 'reflection',
      priority: 3
    }
  ],

  // Deterministic questions with specific answer formats
  deterministic: [
    {
      id: 'det_mood_scale',
      text: 'On a scale of 1-10, how would you rate your overall mood today?',
      category: 'mood',
      answerType: 'scale',
      min: 1,
      max: 10,
      priority: 1
    },
    {
      id: 'det_energy_level',
      text: 'How would you rate your energy level today?',
      category: 'mood',
      answerType: 'scale',
      min: 1,
      max: 10,
      priority: 1
    },
    {
      id: 'det_sleep_hours',
      text: 'How many hours did you sleep last night?',
      category: 'health',
      answerType: 'number',
      min: 0,
      max: 24,
      priority: 1
    },
    {
      id: 'det_sleep_quality',
      text: 'Rate the quality of your sleep (1=Very Poor, 5=Excellent)',
      category: 'health',
      answerType: 'scale',
      min: 1,
      max: 5,
      priority: 1
    },
    {
      id: 'det_exercise',
      text: 'Did you exercise today?',
      category: 'health',
      answerType: 'boolean',
      priority: 2
    },
    {
      id: 'det_meditation',
      text: 'Did you practice mindfulness or meditation today?',
      category: 'wellness',
      answerType: 'boolean',
      priority: 2
    },
    {
      id: 'det_social_time',
      text: 'How many hours did you spend in meaningful social interaction today?',
      category: 'social',
      answerType: 'number',
      min: 0,
      max: 24,
      priority: 2
    },
    {
      id: 'det_screen_time',
      text: 'Approximately how many hours did you spend on recreational screen time today?',
      category: 'digital_wellness',
      answerType: 'number',
      min: 0,
      max: 24,
      priority: 3
    },
    {
      id: 'det_productivity',
      text: 'How productive did you feel today? (1=Not at all, 10=Extremely productive)',
      category: 'productivity',
      answerType: 'scale',
      min: 1,
      max: 10,
      priority: 2
    },
    {
      id: 'det_stress_level',
      text: 'What was your stress level today? (1=No stress, 10=Extremely stressed)',
      category: 'mood',
      answerType: 'scale',
      min: 1,
      max: 10,
      priority: 1
    }
  ],

  // Non-deterministic questions with multiple choice or varied responses
  nonDeterministic: [
    {
      id: 'nd_primary_emotion',
      text: 'What was your primary emotion today?',
      category: 'mood',
      answerType: 'single_choice',
      options: ['Joy', 'Gratitude', 'Excitement', 'Contentment', 'Calm', 'Neutral', 'Anxious', 'Frustrated', 'Sad', 'Angry', 'Overwhelmed', 'Confused'],
      priority: 1
    },
    {
      id: 'nd_weather_impact',
      text: 'How did the weather affect your mood today?',
      category: 'environment',
      answerType: 'single_choice',
      options: ['Very positively', 'Somewhat positively', 'No impact', 'Somewhat negatively', 'Very negatively'],
      priority: 3
    },
    {
      id: 'nd_biggest_win',
      text: 'What category best describes your biggest win today?',
      category: 'goals',
      answerType: 'single_choice',
      options: ['Work/Career', 'Personal Relationships', 'Health/Fitness', 'Learning/Growth', 'Creativity', 'Finances', 'Home/Organization', 'Spiritual/Mental', 'Community/Service'],
      priority: 1
    },
    {
      id: 'nd_time_of_day',
      text: 'When did you feel most energized today?',
      category: 'energy',
      answerType: 'single_choice',
      options: ['Early morning (5-8 AM)', 'Morning (8-11 AM)', 'Midday (11 AM-2 PM)', 'Afternoon (2-5 PM)', 'Evening (5-8 PM)', 'Night (8-11 PM)', 'Late night (11 PM+)'],
      priority: 2
    },
    {
      id: 'nd_coping_strategies',
      text: 'Which coping strategies did you use today? (Select all that apply)',
      category: 'wellness',
      answerType: 'multiple_choice',
      options: ['Deep breathing', 'Exercise', 'Talking to someone', 'Journaling', 'Music', 'Nature/Fresh air', 'Reading', 'Creative activity', 'Meditation', 'Prayer', 'Other'],
      priority: 2
    },
    {
      id: 'nd_learning_source',
      text: 'What was your primary source of new learning or insight today?',
      category: 'growth',
      answerType: 'single_choice',
      options: ['Books/Reading', 'Conversations', 'Online content', 'Experience/Practice', 'Reflection', 'Mistakes/Challenges', 'Nature/Observation', 'Art/Culture', 'None today'],
      priority: 2
    },
    {
      id: 'nd_priorities',
      text: 'Which areas received most of your attention today? (Select up to 3)',
      category: 'focus',
      answerType: 'multiple_choice',
      maxSelections: 3,
      options: ['Work/Career', 'Family', 'Friends', 'Health', 'Learning', 'Hobbies', 'Finances', 'Home', 'Community', 'Spirituality', 'Self-care', 'Planning'],
      priority: 1
    },
    {
      id: 'nd_communication_style',
      text: 'How would you describe your communication style today?',
      category: 'social',
      answerType: 'single_choice',
      options: ['Very open and expressive', 'Moderately communicative', 'Balanced listening and speaking', 'More listening than speaking', 'Minimal communication', 'Avoided communication'],
      priority: 3
    }
  ]
};

// Function to get daily question set based on priority and rotation
const getDailyQuestionSet = (date = new Date(), customPreferences = {}) => {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  
  // Always include priority 1 questions
  const selectedQuestions = {
    freeText: dailyQuestions.freeText.filter(q => q.priority === 1),
    deterministic: dailyQuestions.deterministic.filter(q => q.priority === 1),
    nonDeterministic: dailyQuestions.nonDeterministic.filter(q => q.priority === 1)
  };

  // Rotate through priority 2 and 3 questions based on day
  const priority2Index = dayOfYear % 7; // Weekly rotation for priority 2
  const priority3Index = Math.floor(dayOfYear / 7) % 4; // Monthly rotation for priority 3

  // Add some priority 2 questions
  const priority2FreeText = dailyQuestions.freeText.filter(q => q.priority === 2);
  if (priority2FreeText.length > 0) {
    selectedQuestions.freeText.push(priority2FreeText[priority2Index % priority2FreeText.length]);
  }

  const priority2Det = dailyQuestions.deterministic.filter(q => q.priority === 2);
  if (priority2Det.length > 0) {
    selectedQuestions.deterministic.push(priority2Det[priority2Index % priority2Det.length]);
  }

  const priority2NonDet = dailyQuestions.nonDeterministic.filter(q => q.priority === 2);
  if (priority2NonDet.length > 0) {
    selectedQuestions.nonDeterministic.push(priority2NonDet[priority2Index % priority2NonDet.length]);
  }

  // Occasionally add priority 3 questions
  if (dayOfYear % 3 === 0) { // Every 3rd day
    const priority3FreeText = dailyQuestions.freeText.filter(q => q.priority === 3);
    if (priority3FreeText.length > 0) {
      selectedQuestions.freeText.push(priority3FreeText[priority3Index % priority3FreeText.length]);
    }

    const priority3NonDet = dailyQuestions.nonDeterministic.filter(q => q.priority === 3);
    if (priority3NonDet.length > 0) {
      selectedQuestions.nonDeterministic.push(priority3NonDet[priority3Index % priority3NonDet.length]);
    }
  }

  return selectedQuestions;
};

module.exports = {
  dailyQuestions,
  getDailyQuestionSet
};