import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';

const gameLibrary = [
  { name: 'Emotion Match', level: 'Beginner', focus: 'Emotion vocabulary' },
  { name: 'Focus Garden', level: 'Intermediate', focus: 'Attention and sequencing' },
  { name: 'Routine Quest', level: 'Beginner', focus: 'Daily structure' },
];

const regulationTools = [
  '4-4 Breathing Cycle',
  '5 Senses Grounding',
  'Quiet Break Checklist',
  'Body Tension Scan',
];

const parentTasksKey = 'ar-autis-parent-tasks';
const rewardPointsKey = 'ar-autis-reward-points';
const rewardMessageKey = 'ar-autis-reward-message';
const regulationIndexKey = 'ar-autis-regulation-index';
const authNameKey = 'ar-autis-auth-name';
const authRoleKey = 'ar-autis-auth-role';

const defaultTasks = [
  { id: 1, label: 'Morning checklist prepared', done: true },
  { id: 2, label: 'School transition plan reviewed', done: false },
  { id: 3, label: 'Evening calm routine scheduled', done: false },
];

function loadJsonState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function loadNumberState(key, fallback) {
  const value = Number(localStorage.getItem(key));
  return Number.isFinite(value) ? value : fallback;
}

function loadStringState(key, fallback) {
  const value = localStorage.getItem(key);
  return value ?? fallback;
}

function AppShell({ children, isAuthenticated, profileName, role, onSignOut }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <p className="eyebrow">AR AutisReality</p>
          <h1>Family Support Platform</h1>
        </div>
        <nav aria-label="Main navigation" className="topnav">
          {isAuthenticated ? (
            <>
              <NavLink to="/" end>
                Home
              </NavLink>
              <NavLink to="/parents">Parents</NavLink>
              <NavLink to="/games">Games</NavLink>
              <NavLink to="/rewards">Rewards</NavLink>
              <NavLink to="/regulation">Regulation</NavLink>
              {role === 'admin' ? <NavLink to="/admin">Admin</NavLink> : null}
            </>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </nav>
        <div className="auth-chip">
          {isAuthenticated ? (
            <>
              <span>{profileName} ({role})</span>
              <button type="button" className="secondary" onClick={onSignOut}>Sign out</button>
            </>
          ) : (
            <span>Guest mode</span>
          )}
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}

function ProtectedRoute({ isAuthenticated, role, allowedRoles, children }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function LoginPage({ onSignIn }) {
  const location = useLocation();
  const from = location.state?.from ?? '/';
  const [name, setName] = useState('Parent Account');
  const [role, setRole] = useState('parent');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSignIn(name.trim() || 'Parent Account', role);
  };

  return (
    <section className="single-panel login-panel">
      <p className="eyebrow">Access</p>
      <h2>Sign in to unlock family tools</h2>
      <p className="muted">Protected routes are now enabled. Sign in to continue to {from}.</p>
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="profileName">Profile name</label>
        <input
          id="profileName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Parent Account"
        />
        <label htmlFor="profileRole">Role</label>
        <select
          id="profileRole"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          <option value="parent">Parent</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Sign in</button>
      </form>
    </section>
  );
}

function HomePage() {
  return (
    <section className="panel-grid" aria-label="Platform overview">
      <article className="panel hero-panel">
        <p className="eyebrow">Welcome</p>
        <h2>Support parents, reward progress, and coach regulation in one place.</h2>
        <p>
          This app now has real product sections and route-based navigation so you can evolve
          each area independently while keeping one consistent family experience.
        </p>
      </article>
      <article className="panel">
        <h3>What is ready now</h3>
        <ul>
          <li>Multi-page navigation</li>
          <li>Parent planning workflows</li>
          <li>Interactive rewards counter</li>
          <li>Regulation strategy picker</li>
        </ul>
      </article>
      <article className="panel">
        <h3>Next build slices</h3>
        <ul>
          <li>User accounts and saved plans</li>
          <li>Game progress persistence</li>
          <li>Family-specific personalization</li>
        </ul>
      </article>
    </section>
  );
}

function ParentsPage() {
  const [tasks, setTasks] = useState(() => loadJsonState(parentTasksKey, defaultTasks));

  useEffect(() => {
    localStorage.setItem(parentTasksKey, JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  const completed = tasks.filter((task) => task.done).length;

  return (
    <section className="single-panel">
      <p className="eyebrow">Parent Hub</p>
      <h2>Daily support plan</h2>
      <p className="muted">Track routines that reduce uncertainty and improve transitions.</p>
      <p className="metric">Completed today: {completed} / {tasks.length}</p>
      <ul className="checklist">
        {tasks.map((task) => (
          <li key={task.id}>
            <label>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
              />
              <span>{task.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GamesPage() {
  return (
    <section className="single-panel">
      <p className="eyebrow">Learning Games</p>
      <h2>Game library</h2>
      <div className="tile-grid">
        {gameLibrary.map((game) => (
          <article className="tile" key={game.name}>
            <h3>{game.name}</h3>
            <p>Level: {game.level}</p>
            <p>Focus: {game.focus}</p>
            <button type="button">Launch</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function RewardsPage() {
  const [points, setPoints] = useState(() => loadNumberState(rewardPointsKey, 12));
  const [message, setMessage] = useState(() =>
    loadStringState(rewardMessageKey, 'Great consistency this week.')
  );

  useEffect(() => {
    localStorage.setItem(rewardPointsKey, String(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem(rewardMessageKey, message);
  }, [message]);

  const awardPoints = () => {
    setPoints((value) => value + 2);
    setMessage('Nice work. Reward progress recorded.');
  };

  const redeem = () => {
    if (points < 10) {
      setMessage('Not enough points yet. Keep building streaks.');
      return;
    }
    setPoints((value) => value - 10);
    setMessage('Reward redeemed: choose a family celebration activity.');
  };

  return (
    <section className="single-panel">
      <p className="eyebrow">Rewards Center</p>
      <h2>Motivation tracker</h2>
      <p className="metric">Current points: {points}</p>
      <div className="action-row">
        <button type="button" onClick={awardPoints}>+2 points</button>
        <button type="button" className="secondary" onClick={redeem}>Redeem 10 points</button>
      </div>
      <p className="muted">{message}</p>
    </section>
  );
}

function RegulationPage() {
  const [index, setIndex] = useState(() => {
    const savedIndex = loadNumberState(regulationIndexKey, 0);
    return savedIndex >= 0 && savedIndex < regulationTools.length ? savedIndex : 0;
  });

  useEffect(() => {
    localStorage.setItem(regulationIndexKey, String(index));
  }, [index]);

  const nextTool = () => {
    setIndex((value) => (value + 1) % regulationTools.length);
  };

  return (
    <section className="single-panel">
      <p className="eyebrow">Regulation Toolkit</p>
      <h2>Current strategy</h2>
      <p className="metric">{regulationTools[index]}</p>
      <button type="button" onClick={nextTool}>Try another strategy</button>
      <div className="note-box">
        <h3>How to use</h3>
        <p>
          Choose one strategy at a time, practice for 2 to 5 minutes, and note what helped.
          Repeat during calm moments so it is easier to use during stress.
        </p>
      </div>
    </section>
  );
}

function AdminPage() {
  return (
    <section className="single-panel">
      <p className="eyebrow">Admin Console</p>
      <h2>Administrative controls</h2>
      <p className="muted">
        This route is restricted to admin accounts. Use this area for moderation,
        content management, and environment settings.
      </p>
    </section>
  );
}

function UnauthorizedPage() {
  const location = useLocation();
  const from = location.state?.from ?? 'the requested page';

  return (
    <section className="single-panel">
      <p className="eyebrow">Access denied</p>
      <h2>You do not have permission to view this route.</h2>
      <p className="muted">Requested: {from}</p>
    </section>
  );
}

function NotFoundPage() {
  return (
    <section className="single-panel">
      <p className="eyebrow">Page not found</p>
      <h2>This route is not available.</h2>
      <p className="muted">Use the navigation to return to a supported section.</p>
    </section>
  );
}

export default function App() {
  const [profileName, setProfileName] = useState(() => loadStringState(authNameKey, ''));
  const [role, setRole] = useState(() => loadStringState(authRoleKey, 'parent'));
  const isAuthenticated = Boolean(profileName);

  useEffect(() => {
    if (!profileName) {
      localStorage.removeItem(authNameKey);
      return;
    }
    localStorage.setItem(authNameKey, profileName);
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem(authRoleKey, role);
  }, [role]);

  const handleSignIn = (name, nextRole) => {
    setProfileName(name);
    setRole(nextRole === 'admin' ? 'admin' : 'parent');
  };

  const handleSignOut = () => {
    setProfileName('');
    setRole('parent');
    localStorage.removeItem(authRoleKey);
  };

  return (
    <AppShell
      isAuthenticated={isAuthenticated}
      profileName={profileName || 'Guest'}
      role={role}
      onSignOut={handleSignOut}
    >
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onSignIn={handleSignIn} />
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parents"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={['parent', 'admin']}>
              <ParentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role}>
              <GamesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={['parent', 'admin']}>
              <RewardsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/regulation"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={['parent', 'admin']}>
              <RegulationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role}>
              <NotFoundPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppShell>
  );
}