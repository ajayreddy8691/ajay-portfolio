import { SITE } from '../../config/site';
import { useOwner } from '../../context/OwnerContext';
import useNavLinks from '../../hooks/useNavLinks';
import { SocialLinks } from '../ui/Icons';

export default function Footer({ onLogin }) {
  const { own, logout } = useOwner();
  const links = useNavLinks();
  return (
    <footer className="ft">
      <div className="fg">
        <div>
          <a className="logo" href="#home"><b>AK</b><span>{SITE.name}</span></a>
          <p className="fabout">Data Analyst and Power BI Analyst who turns raw data into clear, decision-ready insights.</p>
        </div>
        <div><h4>Explore</h4>{links.map(([h, t]) => <a key={h} href={h}>{t}</a>)}</div>
        <div><h4>Connect</h4><SocialLinks labels /></div>
        <div><h4>Built with</h4><span className="fabout">React · Vite · three.js · FastAPI · SQLAlchemy</span></div>
      </div>
      <div className="fb">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span>
          <a href="#home" style={{ color: 'inherit', textDecoration: 'none' }}>↑ Back to top</a> ·{' '}
          <button className="lk" style={{ all: 'unset', cursor: 'pointer' }} onClick={own ? logout : onLogin}>{own ? 'Exit owner mode' : 'Owner login'}</button>
        </span>
      </div>
    </footer>
  );
}
