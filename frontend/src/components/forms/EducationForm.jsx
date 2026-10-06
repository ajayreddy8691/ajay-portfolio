import useForm from '../../hooks/useForm';

export default function EducationForm({ init, onSave }) {
  const { f, bind } = useForm(init);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }}>
      <input required placeholder="Degree / course (e.g. B.E. Computer Science)" {...bind('degree')} />
      <input required placeholder="School / college" {...bind('school')} />
      <div className="row">
        <input placeholder="Place (e.g. Coimbatore)" {...bind('place')} />
        <input required placeholder="Years (e.g. 2022 – 2026)" {...bind('period')} />
      </div>
      <input placeholder="Grade (e.g. CGPA 8.00 or 91.4%)" {...bind('grade')} />
      <button className="btn">{init.id ? 'Save Changes' : 'Add Education'}</button>
    </form>
  );
}
