import { useState } from 'react';
import useNavLinks from '../../hooks/useNavLinks';

export default function Navbar({ onResume }) {
  const [menu, setMenu] = useState(false);
  const links = useNavLinks();
  const toggleTheme = () => {
    const root = document.documentElement;
    const cur = root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    root.dataset.theme = cur === 'dark' ? 'light' : 'dark';
  };
  return (
    <nav>
      <a href="#home" className="logo" aria-label="Ajay Kumar Reddy, home"><b>AK</b><span>Ajay Kumar Reddy</span></a>
      <div className={'nl' + (menu ? ' open' : '')}>
        {links.map(([h, t]) => <a key={h} href={h} onClick={() => setMenu(false)}>{t}</a>)}
      </div>
      <div className="nr">
        <button className="btn sm" onClick={() => { onResume(); setMenu(false); }}>Resume</button>
        <button className="ib" aria-label="Toggle theme" onClick={toggleTheme}>◐</button>
        <button className="ib burger" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? '✕' : '☰'}</button>
      </div>
    </nav>
  );
}
