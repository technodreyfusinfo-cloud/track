export interface UserProfile {
  name: string;
  email: string;
  dob: string;
  profession: string;
  photoUrl: string;
}

export interface UserAccount extends UserProfile {
  password: string;
  createdAt: string;
  mustChangePassword: boolean;
}

export interface ActivityRecord {
  email: string;
  action: string;
  createdAt: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || response.statusText || 'Erreur API');
  }
  return response.json();
};

export const getUsers = async (): Promise<UserAccount[]> => {
  const data = await apiFetch<{ users: UserAccount[] }>('/api/users');
  return data.users;
};

export const getUserByEmail = async (email: string): Promise<UserProfile> => {
  const data = await apiFetch<{ user: UserProfile }>(`/api/users/${encodeURIComponent(email)}`);
  return data.user;
};

export const getActivity = async (): Promise<ActivityRecord[]> => {
  const data = await apiFetch<{ activity: ActivityRecord[] }>('/api/activity');
  return data.activity;
};

export const loginUser = async (email: string, password: string): Promise<{ user: UserProfile; mustChangePassword: boolean }> => {
  return apiFetch<{ user: UserProfile; mustChangePassword: boolean }>('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
};

export const createUser = async (account: Omit<UserAccount, 'createdAt' | 'mustChangePassword'>): Promise<void> => {
  await apiFetch('/api/users/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  });
};

export const changePassword = async (email: string, newPassword: string): Promise<void> => {
  await apiFetch('/api/users/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
};

export const resetPassword = async (email: string, newPassword: string): Promise<void> => {
  await apiFetch('/api/users/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
};

export const updateUserProfile = async (oldEmail: string, profile: UserProfile): Promise<UserProfile> => {
  const data = await apiFetch<{ user: UserProfile }>('/api/users/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldEmail, ...profile }),
  });
  return data.user;
};

export const logActivity = async (email: string, action: string): Promise<void> => {
  await apiFetch('/api/activity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, action }),
  });
};
