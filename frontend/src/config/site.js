export const SITE = {
  name: 'Ajay Kumar Reddy',
  email: 'ajayreddy8691@gmail.com',
  phone: '+91 82474 46244',
  phoneHref: '+918247446244',
  location: 'Madanapalle, Andhra Pradesh, India · open to relocate',
  github: 'https://github.com/ajayreddy8691',
  linkedin: 'https://www.linkedin.com/in/ajayreddy8691',
};

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

// Update the resume in Google Drive (same file, new version) and the site stays current.
const RESUME_ID = import.meta.env.VITE_RESUME_FILE_ID || '1tnbvHStC2cZqO0p_z57SZJaWlxCrqMTN';
export const RESUME = {
  view: `https://drive.google.com/file/d/${RESUME_ID}/view`,
  preview: `https://drive.google.com/file/d/${RESUME_ID}/preview`,
  download: `https://drive.google.com/uc?export=download&id=${RESUME_ID}`,
};
