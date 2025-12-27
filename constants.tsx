
import { Activity, UserProfile } from './types';

// SUBSTITUA ESTA URL PELA URL DA SUA LOGO (ESCUDO AZUL)
export const APP_LOGO = "https://cdn-icons-png.flaticon.com/512/1604/1604335.png"; 

export const AVATAR_GALLERY = [
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
];

export const WORKOUT_GALLERY = [
  "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
  "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800&q=80",
  "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80",
  "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800&q=80",
  "https://images.unsplash.com/photo-1530605663936-3c253e2c9973?w=800&q=80",
  "https://images.unsplash.com/photo-1538370965046-79c0d6927485?w=800&q=80"
];

export const DUMMY_ACTIVITIES: Activity[] = [
  {
    id: '1',
    uid: 'dummy-user-123',
    type: 'Corrida',
    title: 'Corrida Matinal',
    date: 'Hoje, 06:30',
    location: 'Ibirapuera',
    distance: 5.0,
    time: '28:45',
    pace: "5' 45\"",
    calories: 320,
    mapImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCRsdjqI5337F-1_1RzFDvJfX-LCu3jc9gtqXcC1oxi-2nWene8ffUrJeExV5MVzFt17owpCRtgA5IVHald8BHSj9kC7z77Y3jezCH60efr9JyQY3KzXVQzNnI8A7b5910o7fcnwbw8YltTc87nFKSPDxDHBVyQcn_kyT1I2KQLZk1V0TeSVLmjm_zEx9C23mLDhMzG59qdEQqRyDUK7zTgzLSAQSrru0lT8SpcSei9woiZfBNQQMyjeexnNz0U7hnRC0U7U30il8E"
  }
];

export const INITIAL_USER: UserProfile = {
  uid: 'dummy-user-123',
  name: 'Alex Silva',
  level: 42,
  status: 'Elite Runner',
  avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop",
  height: 175,
  weight: 70,
  age: 25,
  gender: 'M',
  goal: 'Performance',
  weeklyGoal: 20,
  monthlyGoal: 80
};
