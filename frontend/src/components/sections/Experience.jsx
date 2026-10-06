import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useOwner } from '../../context/OwnerContext';
import SectionHead from '../ui/SectionHead';
import AddButton from '../ui/AddButton';
import Acts from '../ui/Acts';
import Modal from '../ui/Modal';
import ExperienceForm from '../forms/ExperienceForm';
import { periodLabel, sortExperience } from '../../utils/dates';
import { flash, uid } from '../../utils/helpers';
import { techList } from '../../utils/text';

/** Hidden from visitors until the first internship or job is added (owner always sees it). */
export default function Experience() {
  const { experience: [list, put, del] } = useData();
  const { own } = useOwner();
  const [ed, setEd] = useState(null);
  const sorted = useMemo(() => sortExperience(list), [list]); // newest first, whatever order was entered
  const save = (f) => { const id = f.id || uid(); put({ ...f, id }); setEd(null); flash(id); };
  if (!list.length && !own) return null;

  return (
    <section id="experience">
      <SectionHead n="03" title="Experience" accent="Work" sub="Internships and roles, newest first.">
        <AddButton onClick={() => setEd({ role: '', org: '', start: '', end: '', current: false, tech: '', pts: '' })} label="Add Experience" />
      </SectionHead>
      <div className="tl">
        {sorted.map((x) => (
          <div className="card rv" key={x.id} data-id={x.id}>
            <Acts onEdit={() => setEd(x)} onDel={() => del(x.id)} />
            <small className="mono">{periodLabel(x)}</small>
            <h3>{x.role}</h3>
            <p style={{ margin: '2px 0 8px' }}>{x.org}</p>
            {!!techList(x.tech).length && <div className="pills">{techList(x.tech).map((t) => <span key={t}>{t}</span>)}</div>}
            <ul>{(x.pts || '').split('|').filter(Boolean).map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
        ))}
      </div>
      {!list.length && <div className="empty">No experience yet. Add your first internship or job here.</div>}
      <Modal open={!!ed} onClose={() => setEd(null)} title={ed?.id ? 'Edit experience' : 'Add experience'}>
        {ed && <ExperienceForm init={ed} onSave={save} />}
      </Modal>
    </section>
  );
}
