import { useData } from '../context/DataContext';
import { useOwner } from '../context/OwnerContext';

/** Navigation links. Education and Experience are hidden from visitors while they are empty. */
export default function useNavLinks() {
  const { experience: [experience], education: [education] } = useData();
  const { own } = useOwner();
  return [['#skills', 'Toolkit'], ['#education', 'Education'], ['#experience', 'Experience'], ['#projects', 'Projects'], ['#contact', 'Contact']]
    .filter(([h]) => h !== '#experience' || experience.length > 0 || own)
    .filter(([h]) => h !== '#education' || education.length > 0 || own);
}
