import { Activity, UserProfile } from './types';

// SUBSTITUA ESTA URL PELA URL DA SUA LOGO (ESCUDO AZUL)
export const APP_LOGO = "/src/assets/logo.png"; 

export const AVATAR_GALLERY = [
  "https://api.dicebear.com/8.x/bottts/svg?seed=Buddy",
  "https://api.dicebear.com/8.x/bottts/svg?seed=Misty",
  "https://api.dicebear.com/8.x/bottts/svg?seed=Shadow",
  "https://api.dicebear.com/8.x/bottts/svg?seed=Pixel",
  "https://api.dicebear.com/8.x/bottts/svg?seed=Gizmo",
  "https://api.dicebear.com/8.x/bottts/svg?seed=Sparky",
  "https://api.dicebear.com/8.x/bottts/svg?seed=Rusty",
  "https://api.dicebear.com/8.x/bottts/svg?seed=Bolt"
];

export const WORKOUT_GALLERY = [
  "https://images.unsplash.com/photo-1574680096145-d05b4747414c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80", // Treadmill, vertical
  "https://images.unsplash.com/photo-1505751172876-fa1923c58541?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80", // Road running, vertical
  "https://images.unsplash.com/photo-1541534741688-60dc2bdafd17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80", // Gym workout, vertical
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80", // Weights, vertical
  "https://images.unsplash.com/photo-1530605663936-3c253e2c9973?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80", // Mountain view, vertical
  "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80", // Sunset run, vertical
  "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80", // Trail running, vertical
  "https://images.unsplash.com/photo-1538370965046-79c0d6927485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80", // City run, vertical
  "https://images.unsplash.com/photo-1546483875-ad9014f0ba5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80", // Cycling road, vertical
  "https://images.unsplash.com/photo-1519500099198-fd86276ef005?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80", // Night run, vertical
  "https://images.unsplash.com/photo-1592894407708-22271271211c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80", // Woman running, vertical
  "https://images.unsplash.com/photo-1594037997942-021211211c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=720&h=1080&q=80"  // Man running, vertical
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