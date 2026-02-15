import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { roles } from "../data/roles";

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="card">
        <h2>Select a Role</h2>
        <p>Choose the professional path you want to practice for.</p>
      </div>
      <div className="grid">
        {roles.map((role) => (
          <button
            key={role.id}
            className="card"
            onClick={() => navigate("/levels", { state: { role: role.roleName } })}
            type="button"
          >
            <div className="tag">{role.category}</div>
            <h3>{role.roleName}</h3>
            <p>{role.description}</p>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
