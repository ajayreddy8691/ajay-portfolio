import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import { useOwner } from '../../context/OwnerContext';
import SectionHead from '../ui/SectionHead';
import AddButton from '../ui/AddButton';
import Acts from '../ui/Acts';
import Modal from '../ui/Modal';
import EducationForm from '../forms/EducationForm';
import { sortEducation } from '../../utils/dates';
import { flash, tilt, uid, untilt } from '../../utils/helpers';

export default function Education() {
  const { education: [list, put, del] } = useData();
  const { own } = useOwner();
  const [ed, setEd] = useState(null);
  const sorted = useMemo(() => sortEducation(list), [list]); // latest first
  const save = (f) => { const id = f.id || uid(); put({ ...f, id }); setEd(null); flash(id); };
  if (!list.length && !own) return null;

  return (
    <section id="education">
      <SectionHead n="02" title="Education" accent="Academic" sub="Where I studied, newest first.">
        <AddButton onClick={() => setEd({ degree: '', school: '', place: '', period: '', grade: '' })} label="Add Education" />
      </SectionHead>
      <div className="edg">
        {sorted.map((x) => (
          <div className="card edc rv" key={x.id} data-id={x.id} onMouseMove={tilt} onMouseLeave={untilt}>
            <Acts onEdit={() => setEd(x)} onDel={() => del(x.id)} />
            <small className="mono">{x.period}</small>
            <h3>{x.degree}</h3>
            <p>{x.school}{x.place ? ` · ${x.place}` : ''}</p>
            {x.grade && <span className="grade">{x.grade}</span>}
          </div>
        ))}
      </div>
      {!list.length && <div className="empty">No education added yet.</div>}
      <Modal open={!!ed} onClose={() => setEd(null)} title={ed?.id ? 'Edit education' : 'Add education'}>
        {ed && <EducationForm init={ed} onSave={save} />}
      </Modal>
    </section>
  );
}
