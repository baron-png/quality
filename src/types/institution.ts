export interface Institution {
  id: string;
  name: string;
  domain: string;
  email: string;
  logoUrl?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  status: 'Active' | 'Inactive';
  departments: Department[];
  roles: Role[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head?: User;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
  departmentId?: string;
  password?: string;
}