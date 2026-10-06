import photo from '../../assets/images/profile.jpg';
import { useData } from '../../context/DataContext';
import useTypewriter from '../../hooks/useTypewriter';
import Counter from '../ui/Counter';
import { SocialLinks } from '../ui/Icons';

const ROLES = ['Data Analyst', 'Power BI Analyst', 'Python for Data'];

export default function Hero({ onResume }) {
  const { projects: [projects], experience: [experience], education: [education], skills: [skills], ach: [ach] } = useData();
  const role = useTypewriter(ROLES);
  const skillCount = skills.reduce((n, c) => n + c.items.length, 0);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    e.currentTarget.firstChild.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg)`;
  };

  return (
    <section className="hero" id="home">
      <div className="hero-copy">
        <span className="tag"><i className="live" /> Open to Data Analyst roles · India</span>
        <h1>
          <span className="hi">Hello, I'm</span>
          <span className="grad">Ajay Kumar Reddy</span>
        </h1>
        <h2 className="role">{role}<span className="caret">|</span></h2>
        <p className="lead">
          Computer Science graduate (B.E., 2026) who turns raw data into <b>clear decisions</b>: data cleaning, EDA, statistical modelling and dashboards
          with <b>Python, SQL, Power BI and Tableau</b>. Built end-to-end analyses on real estate prices, COVID-19 trends and workout vitals.
        </p>
        <div className="cta">
          <a className="btn" href="#projects">View Projects</a>
          <button className="btn g" onClick={onResume}>Resume</button>
          <a className="btn g" href="#contact">Hire Me</a>
        </div>
        <SocialLinks />
        <div className="stats">
          <div><b><Counter to={projects.length} /></b><span>Projects</span></div>
          <div><b><Counter to={skillCount} />+</b><span>Tools &amp; skills</span></div>
          <div><b><Counter to={ach.length} /></b><span>Certificates &amp; awards</span></div>
          <div><b><Counter to={experience.length > 0 ? experience.length : education.length} /></b><span>{experience.length > 0 ? 'Experiences' : 'Education'}</span></div>
        </div>
      </div>

      <div className="stage" onMouseMove={onMove} onMouseLeave={(e) => { e.currentTarget.firstChild.style.transform = ''; }}>
        <div className="orb">
          <div className="donut" aria-hidden="true" />
          <div className="avatar"><img src={photo} alt="Ajay Kumar Reddy" /></div>
          <div className="kpi k1" aria-hidden="true"><span>Power BI</span><div className="bars"><i /><i /><i /><i /><i /></div></div>
          <div className="kpi k2" aria-hidden="true"><span>Python</span><strong>Pandas · NumPy</strong></div>
          <div className="kpi k3" aria-hidden="true"><strong>283</strong><span>workout records analysed</span></div>
        </div>
      </div>
    </section>
  );
}
