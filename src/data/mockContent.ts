import type { Grade } from '../types/content';

export const mockData: Grade[] = [
  {
    id: 'g5',
    title: 'Grade 5',
    subjects: [
      {
        id: 's_sci',
        title: 'Science',
        topics: [
          {
            id: 't_photo',
            title: 'Photosynthesis',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            questions: [
              {
                id: 'q1',
                questionType: 'MULTIPLE_CHOICE',
                question: 'Which gas do plants absorb during photosynthesis?',
                options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
                correctAnswer: 'Carbon Dioxide',
              },
              {
                id: 'q2',
                questionType: 'TRUE_FALSE',
                question: 'Plants produce oxygen during photosynthesis.',
                options: ['True', 'False'],
                correctAnswer: 'True',
              },
              {
                id: 'q3',
                questionType: 'MULTIPLE_CHOICE',
                question: 'Which part of the plant absorbs sunlight?',
                options: ['Roots', 'Stem', 'Leaves', 'Flowers'],
                correctAnswer: 'Leaves',
              },
              {
                id: 'q4',
                questionType: 'VOICE_RESPONSE',
                question: 'Name the green pigment used in photosynthesis.',
                acceptedAnswers: ['chlorophyll', 'chlorophyl'],
              },
              {
                id: 'q5',
                questionType: 'TRUE_FALSE',
                question: 'Photosynthesis only happens at night.',
                options: ['True', 'False'],
                correctAnswer: 'False',
              },
              {
                id: 'q6',
                questionType: 'MULTIPLE_CHOICE',
                question: 'What is the main product made by plants during photosynthesis?',
                options: ['Oxygen', 'Water', 'Sugar (Glucose)', 'Soil'],
                correctAnswer: 'Sugar (Glucose)',
              },
              {
                id: 'q7',
                questionType: 'VOICE_RESPONSE',
                question: 'Through which plant part does water enter for photosynthesis?',
                acceptedAnswers: ['roots', 'root', 'the roots'],
              },
              {
                id: 'q8',
                questionType: 'TRUE_FALSE',
                question: 'Mushrooms can perform photosynthesis.',
                options: ['True', 'False'],
                correctAnswer: 'False',
              },
              {
                id: 'q9',
                questionType: 'MULTIPLE_CHOICE',
                question: 'What type of energy powers photosynthesis?',
                options: ['Light Energy', 'Thermal Energy', 'Sound Energy', 'Electrical Energy'],
                correctAnswer: 'Light Energy',
              },
              {
                id: 'q10',
                questionType: 'VOICE_RESPONSE',
                question: 'What are the two raw materials plants need for photosynthesis?',
                acceptedAnswers: [
                  'sunlight and water',
                  'water and sunlight',
                  'water and co2',
                  'co2 and water',
                  'carbon dioxide and water',
                  'water and carbon dioxide',
                ],
              },
            ],
          },
          {
            id: 't_parts',
            title: 'Plant Parts',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            questions: [
              {
                id: 'pp_q1',
                questionType: 'MULTIPLE_CHOICE',
                question: 'Which part of the plant absorbs water from the soil?',
                options: ['Leaves', 'Stem', 'Roots', 'Flowers'],
                correctAnswer: 'Roots',
              },
              {
                id: 'pp_q2',
                questionType: 'TRUE_FALSE',
                question: 'The stem transports water and nutrients through the plant.',
                options: ['True', 'False'],
                correctAnswer: 'True',
              },
            ],
          },
          {
            id: 't_growth',
            title: 'Plant Growth',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            questions: [
              {
                id: 'pg_q1',
                questionType: 'TRUE_FALSE',
                question: 'Plants need sunlight to grow.',
                options: ['True', 'False'],
                correctAnswer: 'True',
              },
              {
                id: 'pg_q2',
                questionType: 'VOICE_RESPONSE',
                question: 'Name one thing a seed needs to germinate.',
                acceptedAnswers: ['water', 'warmth', 'heat', 'sunlight', 'light', 'soil', 'air'],
              },
            ],
          },
        ],
      },
      {
        id: 's_math',
        title: 'Mathematics',
        topics: [],
      },
      {
        id: 's_eng',
        title: 'English',
        topics: [],
      },
    ],
  },
  {
    id: 'g6',
    title: 'Grade 6',
    isPremium: true,
    subjects: [
      {
        id: 'g6_sci',
        title: 'Science',
        topics: [
          {
            id: 'g6_t_atoms',
            title: 'Atoms & Molecules',
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            questions: [
              {
                id: 'g6_q1',
                questionType: 'MULTIPLE_CHOICE',
                question: 'What is the smallest unit of matter?',
                options: ['Molecule', 'Atom', 'Cell', 'Proton'],
                correctAnswer: 'Atom',
              },
              {
                id: 'g6_q2',
                questionType: 'TRUE_FALSE',
                question: 'Protons and neutrons are found in the nucleus.',
                options: ['True', 'False'],
                correctAnswer: 'True',
              },
              {
                id: 'g6_q3',
                questionType: 'VOICE_RESPONSE',
                question: 'What is the charge of an electron?',
                acceptedAnswers: ['negative', 'negative charge', '-1'],
              },
            ],
          },
        ],
      },
      {
        id: 'g6_math',
        title: 'Mathematics',
        topics: [],
      },
    ],
  },
];
