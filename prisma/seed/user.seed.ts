// Define the Gender enum
enum Gender {
  Male = 'male',
  Female = 'female',
}

// Define your users array with the Gender enum
export const users = [
  {
    id: 1,
    name: 'Suos Phearith',
    email: 'suosphearith@gmail.com',
    password: '12345678',
    gender: Gender.Male,
    roleId: 1,
  },
  {
    id: 2,
    name: 'Vann Chansethy',
    email: 'vannchansethy@gmail.com',
    password: '12345678',
    gender: Gender.Male,
    roleId: 2,
  },
];
