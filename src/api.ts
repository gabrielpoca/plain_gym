import Axios from 'axios';

const axios = Axios.create({
  baseURL: 'https://log.gabrielpoca.com',
});

export const update = (data: any) =>
  axios.post('/api/journal_entries_batch/update', data);

export const signIn = (data: any) => axios.post('/api/sessions', data);

export const signUp = (data: any) => axios.post('/api/users', data);

export const currentUser = () => axios.get('/api/current_user');

export const setAuthToken = (token: string) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};
