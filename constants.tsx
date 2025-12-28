import { Activity, UserProfile } from './types';

// SUBSTITUA ESTA URL PELA URL DA SUA LOGO (ESCUDO AZUL)
export const APP_LOGO = "/logo.png"; 

// AVATAR_GALLERY e WORKOUT_GALLERY agora são carregados dinamicamente do Firestore
// e gerenciados pelo Admin Portal.

export const DUMMY_ACTIVITIES: Activity[] = [
  {
    id: '1',
    uid: 'dummy-user-123',
    type: 'Corrida',
    title: 'Corrida Matinal',
    date: new Date().toISOString(), // Alterado para ISOString
    location: 'Ibirapuera',
    distance: 5.0,
    time: '28:45',
    pace: "5' 45\"",
    calories: 320,
    mapImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRsdjqI5337F-1_1RzFDvJfX-LCu3jc9gtqXcC1oxi-2nWene8ffUrJeExV5MVzFt17owpCRtgA5IVHald8BHSj9kC7z77Y3jezCH60efr9JyQY3KzXVQzNnI8A7b5910o7fcnwbw8YltTc87nRC0U7U30il8E"
  }
];

export const INITIAL_USER: UserProfile = {
  uid: 'dummy-user-123',
  name: 'Alex Silva',
  level: 42,
  status: 'Elite Runner',
  avatar: "https://api.dicebear.com/8.x/bottts/svg?seed=Buddy",
  height: 175,
  weight: 70,
  age: 25,
  gender: 'M',
  goal: 'Performance',
  weeklyGoal: 20,
  monthlyGoal: 80
};