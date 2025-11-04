import type { Id } from '@ehc-gym2/backend/convex/_generated/dataModel';

// Mock IDs generators
export const mockId = (prefix: string): any => {
  return `${prefix}_mock_${Math.random().toString(36).substr(2, 9)}`;
};

// Mock User Data
export const mockUser = {
  _id: mockId('users'),
  _creationTime: Date.now(),
  clerkUserId: 'user_mock_123',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
};

// Mock Person Data
export const mockPerson = {
  _id: mockId('persons'),
  _creationTime: Date.now(),
  name: 'John',
  lastName: 'Doe',
  bornDate: '1990-01-01',
  documentType: 'CC' as const,
  documentNumber: '1234567890',
};

// Mock Trainer Data
export const mockTrainer = {
  _id: mockId('trainers'),
  _creationTime: Date.now(),
  userId: mockUser._id,
  personId: mockPerson._id,
  branchId: mockId('branches'),
  specialties: ['Funcional', 'Crossfit'],
  status: 'ACTIVE' as const,
};

// Mock Client Data
export const mockClient = {
  _id: mockId('clients'),
  _creationTime: Date.now(),
  userId: mockUser._id,
  personId: mockPerson._id,
  status: 'ACTIVE' as const,
};

// Mock Admin Data
export const mockAdmin = {
  _id: mockId('admins'),
  _creationTime: Date.now(),
  userId: mockUser._id,
  personId: mockPerson._id,
  status: 'ACTIVE' as const,
};

// Mock Branch Data
export const mockBranch = {
  _id: mockId('branches'),
  _creationTime: Date.now(),
  name: 'Sede Principal',
  addressId: mockId('addresses'),
  status: 'ACTIVE' as const,
};

export const mockBranches = [
  {
    _id: mockId('branches'),
    _creationTime: Date.now(),
    name: 'Sede Norte',
    addressId: mockId('addresses'),
    status: 'ACTIVE' as const,
  },
  {
    _id: mockId('branches'),
    _creationTime: Date.now(),
    name: 'Sede Sur',
    addressId: mockId('addresses'),
    status: 'ACTIVE' as const,
  },
];

// Mock Address Data
export const mockAddress = {
  _id: mockId('addresses'),
  _creationTime: Date.now(),
  cityId: mockId('cities'),
  addressLine: 'Calle 123 #45-67',
  neighborhood: 'Centro',
};

// Mock City Data
export const mockCity = {
  _id: mockId('cities'),
  _creationTime: Date.now(),
  name: 'Bogotá',
  department: 'Cundinamarca',
};

// Mock Role Assignment Data
export const mockRoleAssignments = {
  superAdmin: {
    userId: mockUser._id,
    roles: ['SUPER_ADMIN' as const],
  },
  admin: {
    userId: mockUser._id,
    roles: ['ADMIN' as const],
  },
  trainer: {
    userId: mockUser._id,
    roles: ['TRAINER' as const],
  },
  client: {
    userId: mockUser._id,
    roles: ['CLIENT' as const],
  },
};

// Mock User with Roles Data
export const mockUserWithRoles = {
  superAdmin: {
    user: mockUser,
    person: mockPerson,
    roles: ['SUPER_ADMIN' as const],
  },
  admin: {
    user: mockUser,
    person: mockPerson,
    roles: ['ADMIN' as const],
  },
  trainer: {
    user: mockUser,
    person: mockPerson,
    roles: ['TRAINER' as const],
  },
  client: {
    user: mockUser,
    person: mockPerson,
    roles: ['CLIENT' as const],
  },
};

// Mock Specialty Data
export const mockSpecialties = [
  'Funcional',
  'Crossfit',
  'Cardio',
  'Pesas',
  'Yoga',
  'Pilates',
];

// Mock Form Data
export const mockTrainerFormData = {
  userData: {
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '+1234567890',
  },
  personalData: {
    personName: 'John',
    personLastName: 'Doe',
    personBornDate: '1990-01-01',
    personDocumentType: 'CC' as const,
    personDocumentNumber: '1234567890',
  },
  workData: {
    branch: 'Sede Principal',
    specialties: ['Funcional', 'Crossfit'],
  },
};

export const mockClientFormData = {
  userData: {
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    userPhone: '+0987654321',
  },
  personalData: {
    personName: 'Jane',
    personLastName: 'Smith',
    personBornDate: '1995-05-15',
    personDocumentType: 'CC' as const,
    personDocumentNumber: '0987654321',
  },
  emergencyContact: {
    emergencyContactName: 'John Smith',
    emergencyContactPhone: '+1111111111',
  },
  membershipData: {
    branches: ['Sede Principal'],
  },
};

export const mockAdministratorFormData = {
  userData: {
    userName: 'Admin User',
    userEmail: 'admin@example.com',
    userPhone: '+1122334455',
  },
  personalData: {
    personName: 'Admin',
    personLastName: 'User',
    personBornDate: '1985-03-20',
    personDocumentType: 'CC' as const,
    personDocumentNumber: '1122334455',
  },
  branchData: {
    branch: 'Sede Principal',
  },
};

export const mockSedeFormData = {
  name: 'Nueva Sede',
  cityId: mockCity._id,
  addressLine: 'Carrera 50 #30-20',
  neighborhood: 'Chapinero',
};
