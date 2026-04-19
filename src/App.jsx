import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { hasSupabaseConfig, supabase } from './lib/supabaseClient';

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

const defaultRewardPoints = 12;
const defaultRewardMessage = 'Great consistency this week.';
const defaultRegulationIndex = 0;

const defaultTasks = [
  { id: 1, label: 'Morning checklist prepared', done: true },
  { id: 2, label: 'School transition plan reviewed', done: false },
  { id: 3, label: 'Evening calm routine scheduled', done: false },
];

function deriveRole(user) {
  return user?.user_metadata?.role === 'admin' ? 'admin' : 'parent';
}

function normalizeTasks(value) {
  if (!Array.isArray(value)) {
    return defaultTasks;
  }
  return value
    .filter((task) => task && typeof task.label === 'string')
    .map((task, index) => ({
      id: typeof task.id === 'number' ? task.id : index + 1,
      label: task.label,
      done: Boolean(task.done),
    }));
}

function normalizeRegulationIndex(value) {
  return value >= 0 && value < regulationTools.length ? value : defaultRegulationIndex;
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

function ProtectedRoute({ isAuthenticated, authLoading, dataLoading, role, allowedRoles, children }) {
  const location = useLocation();

  if (authLoading || dataLoading) {
    return (
      <section className="single-panel">
        <p className="eyebrow">Loading</p>
        <h2>Checking your session and loading your data...</h2>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function LoginPage({ isSupabaseReady, onSignIn, onSignUp, authError, authInfo, isSubmitting }) {
  const location = useLocation();
  const from = location.state?.from ?? '/';
  const [name, setName] = useState('');
  const [role, setRole] = useState('parent');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      email: email.trim(),
      password,
      role,
      fullName: name.trim() || 'Parent Account',
    };

    if (mode === 'signup') {
      onSignUp(payload);
      return;
    }

    onSignIn(payload);
  };

  return (
    <section className="single-panel login-panel">
      <p className="eyebrow">Access</p>
      <h2>{mode === 'signup' ? 'Create account' : 'Sign in to unlock family tools'}</h2>
      <p className="muted">
        {isSupabaseReady
          ? `Continue to ${from} once authenticated.`
          : 'Supabase environment variables are missing. Add them before signing in.'}
      </p>
      {authInfo ? <p className="muted">{authInfo}</p> : null}
      {authError ? <p className="muted">{authError}</p> : null}
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="profileEmail">Email</label>
        <input
          id="profileEmail"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="parent@example.com"
          required
        />
        <label htmlFor="profilePassword">Password</label>
        <input
          id="profilePassword"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          minLength={6}
          required
        />
        <label htmlFor="profileName">Profile name</label>
        <input
          id="profileName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Parent Account"
          required={mode === 'signup'}
          disabled={mode !== 'signup'}
        />
        <label htmlFor="profileRole">Role</label>
        <select
          id="profileRole"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          disabled={mode !== 'signup'}
        >
          <option value="parent">Parent</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={!isSupabaseReady || isSubmitting}>
          {isSubmitting ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <form className="login-mode" onSubmit={(event) => event.preventDefault()}>
        <button
          type="button"
          className={mode === 'signin' ? 'secondary' : ''}
          onClick={() => setMode('signin')}
        >
          Existing account
        </button>
        <button
          type="button"
          className={mode === 'signup' ? 'secondary' : ''}
          onClick={() => setMode('signup')}
        >
          New account
        </button>
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

function ParentsPage({ tasks, setTasks }) {

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

function RewardsPage({ points, setPoints, message, setMessage }) {

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

function RegulationPage({ index, setIndex }) {

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
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parentTasks, setParentTasks] = useState(defaultTasks);
  const [rewardPoints, setRewardPoints] = useState(defaultRewardPoints);
  const [rewardMessage, setRewardMessage] = useState(defaultRewardMessage);
  const [regulationIndex, setRegulationIndex] = useState(defaultRegulationIndex);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setAuthLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !supabase) {
      setParentTasks(defaultTasks);
      setRewardPoints(defaultRewardPoints);
      setRewardMessage(defaultRewardMessage);
      setRegulationIndex(defaultRegulationIndex);
      setDataReady(false);
      setDataLoading(false);
      return;
    }

    let active = true;

    const loadData = async () => {
      setDataLoading(true);

      const { data, error } = await supabase
        .from('user_app_state')
        .select('parent_tasks,reward_points,reward_message,regulation_index')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error) {
        setAuthError(error.message);
        setDataLoading(false);
        return;
      }

      if (!data) {
        const { error: insertError } = await supabase.from('user_app_state').upsert({
          user_id: user.id,
          parent_tasks: defaultTasks,
          reward_points: defaultRewardPoints,
          reward_message: defaultRewardMessage,
          regulation_index: defaultRegulationIndex,
        });

        if (!active) {
          return;
        }

        if (insertError) {
          setAuthError(insertError.message);
          setDataLoading(false);
          return;
        }

        setParentTasks(defaultTasks);
        setRewardPoints(defaultRewardPoints);
        setRewardMessage(defaultRewardMessage);
        setRegulationIndex(defaultRegulationIndex);
        setDataReady(true);
        setDataLoading(false);
        return;
      }

      setParentTasks(normalizeTasks(data.parent_tasks));
      setRewardPoints(Number.isFinite(data.reward_points) ? data.reward_points : defaultRewardPoints);
      setRewardMessage(typeof data.reward_message === 'string' ? data.reward_message : defaultRewardMessage);
      setRegulationIndex(normalizeRegulationIndex(data.regulation_index));
      setDataReady(true);
      setDataLoading(false);
    };

    loadData();

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated || !dataReady || !supabase) {
      return;
    }

    supabase.from('user_app_state').upsert({
      user_id: user.id,
      parent_tasks: parentTasks,
      reward_points: rewardPoints,
      reward_message: rewardMessage,
      regulation_index: regulationIndex,
    });
  }, [
    dataReady,
    isAuthenticated,
    parentTasks,
    regulationIndex,
    rewardMessage,
    rewardPoints,
    user?.id,
  ]);

  const handleSignIn = async ({ email, password }) => {
    if (!supabase) {
      return;
    }

    setAuthError('');
    setAuthInfo('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    }

    setIsSubmitting(false);
  };

  const handleSignUp = async ({ email, password, fullName, role }) => {
    if (!supabase) {
      return;
    }

    setAuthError('');
    setAuthInfo('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role === 'admin' ? 'admin' : 'parent',
        },
      },
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthInfo('Account created. Check your email for confirmation if required.');
    }

    setIsSubmitting(false);
  };

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
  };

  const role = deriveRole(user);
  const profileName = user?.user_metadata?.full_name || user?.email || 'Account';
  const isAuthenticated = Boolean(user);

  return (
    <AppShell
      isAuthenticated={isAuthenticated}
      profileName={profileName}
      role={role}
      onSignOut={handleSignOut}
    >
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage
                isSupabaseReady={hasSupabaseConfig}
                onSignIn={handleSignIn}
                onSignUp={handleSignUp}
                authError={authError}
                authInfo={authInfo}
                isSubmitting={isSubmitting}
              />
            )
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              authLoading={authLoading}
              dataLoading={dataLoading}
              role={role}
            >
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parents"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              authLoading={authLoading}
              dataLoading={dataLoading}
              role={role}
              allowedRoles={['parent', 'admin']}
            >
              <ParentsPage tasks={parentTasks} setTasks={setParentTasks} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/games"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              authLoading={authLoading}
              dataLoading={dataLoading}
              role={role}
            >
              <GamesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              authLoading={authLoading}
              dataLoading={dataLoading}
              role={role}
              allowedRoles={['parent', 'admin']}
            >
              <RewardsPage
                points={rewardPoints}
                setPoints={setRewardPoints}
                message={rewardMessage}
                setMessage={setRewardMessage}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/regulation"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              authLoading={authLoading}
              dataLoading={dataLoading}
              role={role}
              allowedRoles={['parent', 'admin']}
            >
              <RegulationPage index={regulationIndex} setIndex={setRegulationIndex} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              authLoading={authLoading}
              dataLoading={dataLoading}
              role={role}
              allowedRoles={['admin']}
            >
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              authLoading={authLoading}
              dataLoading={dataLoading}
              role={role}
            >
              <NotFoundPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppShell>
  );
}