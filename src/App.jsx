import { useEffect, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { hasSupabaseConfig, supabase } from './lib/supabaseClient';
import {
  getDashboardState,
  refreshDashboard,
  setDashboardFilters,
} from '../dashboard/main';

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
const defaultCompletionHistory = [];

const defaultTasks = [
  { id: 1, label: 'Morning checklist prepared', done: true },
  { id: 2, label: 'School transition plan reviewed', done: false },
  { id: 3, label: 'Evening calm routine scheduled', done: false },
];

function deriveRole(user) {
  return user?.user_metadata?.role === 'admin' ? 'admin' : 'parent';
}

function isUserEmailVerified(user) {
  return Boolean(user?.email_confirmed_at);
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

function normalizeCompletionHistory(value) {
  if (!Array.isArray(value)) {
    return defaultCompletionHistory;
  }

  return value
    .filter((entry) => entry && typeof entry.date === 'string')
    .map((entry) => ({
      date: entry.date,
      completionRate: Number.isFinite(entry.completionRate) ? entry.completionRate : 0,
      completed: Number.isFinite(entry.completed) ? entry.completed : 0,
      total: Number.isFinite(entry.total) ? entry.total : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function parseRangeDays(dateRange) {
  const numeric = Number.parseInt(String(dateRange || '').replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 7;
}

function AppShell({ children, isAuthenticated, isEmailVerified, profileName, role, onSignOut }) {
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
              <span className="status-pill">{isEmailVerified ? 'Verified' : 'Not verified'}</span>
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

function ProtectedRoute({
  isAuthenticated,
  authLoading,
  dataLoading,
  role,
  allowedRoles,
  requireVerified,
  isEmailVerified,
  children,
}) {
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

  if (requireVerified && !isEmailVerified) {
    return <Navigate to="/verify-email" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function LoginPage({
  isSupabaseReady,
  onSignIn,
  onSignUp,
  onRequestPasswordReset,
  onResendVerification,
  authError,
  authInfo,
  isSubmitting,
}) {
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
      <div className="inline-actions">
        <button
          type="button"
          className="secondary"
          disabled={!isSupabaseReady || isSubmitting}
          onClick={() => onRequestPasswordReset(email.trim())}
        >
          Forgot password
        </button>
        <button
          type="button"
          className="secondary"
          disabled={!isSupabaseReady || isSubmitting}
          onClick={() => onResendVerification(email.trim())}
        >
          Resend verification email
        </button>
      </div>
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

function VerifyEmailPage({ email, onResendVerification, isSubmitting, authInfo, authError }) {
  const location = useLocation();
  const from = location.state?.from ?? '/';

  return (
    <section className="single-panel login-panel">
      <p className="eyebrow">Email Verification</p>
      <h2>Verify your email to continue</h2>
      <p className="muted">Your account must be verified before opening {from}.</p>
      <p className="muted">Current email: {email || 'Not available'}</p>
      {authInfo ? <p className="muted">{authInfo}</p> : null}
      {authError ? <p className="muted">{authError}</p> : null}
      <button
        type="button"
        disabled={isSubmitting || !email}
        onClick={() => onResendVerification(email)}
      >
        {isSubmitting ? 'Please wait...' : 'Resend verification email'}
      </button>
    </section>
  );
}

function ResetPasswordPage({ isAuthenticated, onUpdatePassword, authInfo, authError, isSubmitting }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }
    setLocalError('');
    const succeeded = await onUpdatePassword(password);
    if (succeeded) {
      navigate('/', { replace: true });
    }
  };

  return (
    <section className="single-panel login-panel">
      <p className="eyebrow">Password Recovery</p>
      <h2>Set a new password</h2>
      <p className="muted">
        {isAuthenticated
          ? 'Enter a new password for your account.'
          : 'Open this page from the password reset email link after requesting a reset.'}
      </p>
      {authInfo ? <p className="muted">{authInfo}</p> : null}
      {authError ? <p className="muted">{authError}</p> : null}
      {localError ? <p className="muted">{localError}</p> : null}
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="newPassword">New password</label>
        <input
          id="newPassword"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          minLength={6}
          required
        />
        <label htmlFor="confirmPassword">Confirm new password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          minLength={6}
          required
        />
        <button type="submit" disabled={!isAuthenticated || isSubmitting}>
          {isSubmitting ? 'Please wait...' : 'Update password'}
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

function ParentsPage({ tasks, setTasks, completionHistory, setCompletionHistory }) {

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  };

  const completed = tasks.filter((task) => task.done).length;
  const completionRate = Math.round((completed / tasks.length) * 100);

  const recordTodayProgress = () => {
    const today = new Date().toISOString().slice(0, 10);
    const snapshot = {
      date: today,
      completionRate,
      completed,
      total: tasks.length,
    };

    setCompletionHistory((current) => {
      const filtered = current.filter((entry) => entry.date !== today);
      return [...filtered, snapshot].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  const recentHistory = completionHistory.slice(-7);
  const bestRate = recentHistory.reduce((max, entry) => Math.max(max, entry.completionRate), 0);
  const averageRate =
    recentHistory.length > 0
      ? Math.round(
          recentHistory.reduce((sum, entry) => sum + entry.completionRate, 0) / recentHistory.length
        )
      : completionRate;

  let streak = 0;
  for (let i = completionHistory.length - 1; i >= 0; i -= 1) {
    if (completionHistory[i].completionRate >= 80) {
      streak += 1;
    } else {
      break;
    }
  }

  return (
    <section className="single-panel">
      <p className="eyebrow">Parent Hub</p>
      <h2>Daily support plan</h2>
      <p className="muted">Track routines that reduce uncertainty and improve transitions.</p>
      <p className="metric">Completed today: {completed} / {tasks.length}</p>
      <p className="muted">Completion rate: {completionRate}%</p>
      <div className="action-row">
        <button type="button" onClick={recordTodayProgress}>Record today progress</button>
      </div>
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
      <section className="analytics-block" aria-label="Parent analytics">
        <h3>Weekly analytics</h3>
        <div className="analytics-grid">
          <article className="analytics-card">
            <p className="eyebrow">Consistency streak</p>
            <p className="metric">{streak} days</p>
            <p className="muted">Streak counts days with 80%+ completion.</p>
          </article>
          <article className="analytics-card">
            <p className="eyebrow">Weekly average</p>
            <p className="metric">{averageRate}%</p>
            <p className="muted">Average from your last 7 recorded days.</p>
          </article>
          <article className="analytics-card">
            <p className="eyebrow">Best day</p>
            <p className="metric">{bestRate}%</p>
            <p className="muted">Highest completion rate in recent history.</p>
          </article>
        </div>
        <div className="trend-grid" role="list" aria-label="Completion trend bars">
          {recentHistory.length === 0 ? (
            <p className="muted">No trend data yet. Record your first day to start analytics.</p>
          ) : (
            recentHistory.map((entry) => (
              <div className="trend-row" role="listitem" key={entry.date}>
                <span>{entry.date.slice(5)}</span>
                <div className="trend-bar-shell" aria-hidden="true">
                  <div className="trend-bar-fill" style={{ width: `${entry.completionRate}%` }} />
                </div>
                <span>{entry.completionRate}%</span>
              </div>
            ))
          )}
        </div>
      </section>
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

function AdminPage({ tasks, completionHistory, rewardPoints, regulationIndex, userRole }) {
  const [dashboard, setDashboard] = useState(() => getDashboardState());

  useEffect(() => {
    setDashboardFilters({ userRole, dateRange: '7d' });
  }, [userRole]);

  const buildLocalWidgets = () => {
      const latest = completionHistory[completionHistory.length - 1];
      const averageRate =
        completionHistory.length > 0
          ? Math.round(
              completionHistory.reduce((sum, entry) => sum + entry.completionRate, 0) /
                completionHistory.length
            )
          : 0;

      return [
        {
          id: 'active-tasks',
          title: 'Active tasks',
          value: tasks.length,
          note: 'Current routine tasks configured for parent planning.',
        },
        {
          id: 'latest-completion',
          title: 'Latest completion',
          value: latest ? `${latest.completionRate}%` : 'No data',
          note: latest ? `Recorded on ${latest.date}` : 'Record daily progress to generate insights.',
        },
        {
          id: 'avg-completion',
          title: 'Average completion (local)',
          value: `${averageRate}%`,
          note: `${completionHistory.length} tracked day(s) in history.`,
        },
        {
          id: 'reward-points',
          title: 'Reward points',
          value: rewardPoints,
          note: 'Current motivational balance for this account.',
        },
        {
          id: 'regulation-strategy',
          title: 'Regulation index',
          value: regulationIndex + 1,
          note: 'Index of the selected regulation strategy in toolkit.',
        },
      ];
  };

  const buildAdminWidgets = (summary) => {
    const totalUsers = Number(summary?.total_users) || 0;
    const adminUsers = Number(summary?.admin_users) || 0;
    const parentUsers = Number(summary?.parent_users) || 0;
    const avgRewardPoints = Number(summary?.avg_reward_points) || 0;
    const avgCompletionRate = Number(summary?.avg_completion_rate) || 0;
    const activeUsers = Number(summary?.active_users) || 0;
    const rangeDays = Number(summary?.range_days) || 7;

    return [
      {
        id: 'total-users',
        title: 'Total users',
        value: totalUsers,
        note: 'All accounts with auth access in this environment.',
      },
      {
        id: 'parent-users',
        title: 'Parent users',
        value: parentUsers,
        note: 'Accounts with parent role metadata.',
      },
      {
        id: 'admin-users',
        title: 'Admin users',
        value: adminUsers,
        note: 'Accounts with admin role metadata.',
      },
      {
        id: 'avg-reward-points',
        title: 'Avg reward points',
        value: avgRewardPoints,
        note: 'Average current reward balance across users.',
      },
      {
        id: 'avg-completion-rate',
        title: 'Avg completion rate',
        value: `${avgCompletionRate}%`,
        note: 'Average completion from recorded history entries.',
      },
      {
        id: 'active-users',
        title: 'Active users',
        value: activeUsers,
        note: `Users with completion history in last ${rangeDays} day(s).`,
      },
    ];
  };

  const loadDashboard = async () => {
    const next = await refreshDashboard(async ({ dateRange }) => {
      const days = parseRangeDays(dateRange);

      if (!supabase || !hasSupabaseConfig || userRole !== 'admin') {
        return buildLocalWidgets();
      }

      const { data, error } = await supabase.rpc('admin_dashboard_summary', {
        p_days: days,
      });

      if (error) {
        return [
          {
            id: 'admin-metrics-error',
            title: 'Admin metrics unavailable',
            value: 'Fallback mode',
            note: error.message,
          },
          ...buildLocalWidgets(),
        ];
      }

      return buildAdminWidgets(data);
    });

    setDashboard(next);
  };

  useEffect(() => {
    loadDashboard();
  }, [completionHistory, regulationIndex, rewardPoints, tasks]);

  return (
    <section className="single-panel">
      <p className="eyebrow">Admin Console</p>
      <h2>Administrative controls</h2>
      <p className="muted">
        This route is restricted to admin accounts. Use this area for moderation,
        content management, and environment settings.
      </p>
      <div className="action-row">
        <button type="button" onClick={loadDashboard}>Refresh dashboard</button>
      </div>
      <div className="analytics-grid" aria-label="Admin dashboard widgets">
        {dashboard.widgets.map((widget) => (
          <article key={widget.id} className="analytics-card">
            <p className="eyebrow">{widget.title}</p>
            <p className="metric">{widget.value}</p>
            <p className="muted">{widget.note}</p>
          </article>
        ))}
      </div>
      <p className="muted">Last refresh: {dashboard.lastUpdatedAt || 'Not loaded yet'}</p>
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
  const [completionHistory, setCompletionHistory] = useState(defaultCompletionHistory);

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
      if (_event === 'PASSWORD_RECOVERY') {
        setAuthInfo('Password recovery session started. Set your new password now.');
      }
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
      setCompletionHistory(defaultCompletionHistory);
      setDataReady(false);
      setDataLoading(false);
      return;
    }

    let active = true;

    const loadData = async () => {
      setDataLoading(true);

      const { data, error } = await supabase
        .from('user_app_state')
        .select('parent_tasks,reward_points,reward_message,regulation_index,completion_history')
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
          completion_history: defaultCompletionHistory,
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
        setCompletionHistory(defaultCompletionHistory);
        setDataReady(true);
        setDataLoading(false);
        return;
      }

      setParentTasks(normalizeTasks(data.parent_tasks));
      setRewardPoints(Number.isFinite(data.reward_points) ? data.reward_points : defaultRewardPoints);
      setRewardMessage(typeof data.reward_message === 'string' ? data.reward_message : defaultRewardMessage);
      setRegulationIndex(normalizeRegulationIndex(data.regulation_index));
      setCompletionHistory(normalizeCompletionHistory(data.completion_history));
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
      completion_history: completionHistory,
    });
  }, [
    completionHistory,
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
      setAuthInfo('Account created. Check your email to verify your account before signing in.');
    }

    setIsSubmitting(false);
  };

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
  };

  const handleRequestPasswordReset = async (email) => {
    if (!supabase) {
      return;
    }
    if (!email) {
      setAuthError('Enter your email first, then request a password reset.');
      return;
    }

    setAuthError('');
    setAuthInfo('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthInfo('Password reset email sent. Open the link in your inbox.');
    }

    setIsSubmitting(false);
  };

  const handleResendVerification = async (email) => {
    if (!supabase) {
      return;
    }
    if (!email) {
      setAuthError('Enter your email first, then resend verification.');
      return;
    }

    setAuthError('');
    setAuthInfo('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/#/`,
      },
    });

    if (error) {
      setAuthError(error.message);
    } else {
      setAuthInfo('Verification email sent. Check your inbox.');
    }

    setIsSubmitting(false);
  };

  const handleUpdatePassword = async (password) => {
    if (!supabase) {
      return false;
    }

    setAuthError('');
    setAuthInfo('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setAuthError(error.message);
      setIsSubmitting(false);
      return false;
    }

    setAuthInfo('Password updated successfully.');
    setIsSubmitting(false);
    return true;
  };

  const role = deriveRole(user);
  const isEmailVerified = isUserEmailVerified(user);
  const profileName = user?.user_metadata?.full_name || user?.email || 'Account';
  const isAuthenticated = Boolean(user);

  return (
    <AppShell
      isAuthenticated={isAuthenticated}
      isEmailVerified={isEmailVerified}
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
                onRequestPasswordReset={handleRequestPasswordReset}
                onResendVerification={handleResendVerification}
                authError={authError}
                authInfo={authInfo}
                isSubmitting={isSubmitting}
              />
            )
          }
        />
        <Route
          path="/verify-email"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : isEmailVerified ? (
              <Navigate to="/" replace />
            ) : (
              <VerifyEmailPage
                email={user?.email || ''}
                onResendVerification={handleResendVerification}
                isSubmitting={isSubmitting}
                authInfo={authInfo}
                authError={authError}
              />
            )
          }
        />
        <Route
          path="/reset-password"
          element={
            <ResetPasswordPage
              isAuthenticated={isAuthenticated}
              onUpdatePassword={handleUpdatePassword}
              authInfo={authInfo}
              authError={authError}
              isSubmitting={isSubmitting}
            />
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
              requireVerified
              isEmailVerified={isEmailVerified}
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
              requireVerified
              isEmailVerified={isEmailVerified}
            >
              <ParentsPage
                tasks={parentTasks}
                setTasks={setParentTasks}
                completionHistory={completionHistory}
                setCompletionHistory={setCompletionHistory}
              />
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
              requireVerified
              isEmailVerified={isEmailVerified}
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
              requireVerified
              isEmailVerified={isEmailVerified}
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
              requireVerified
              isEmailVerified={isEmailVerified}
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
              requireVerified
              isEmailVerified={isEmailVerified}
            >
              <AdminPage
                tasks={parentTasks}
                completionHistory={completionHistory}
                rewardPoints={rewardPoints}
                regulationIndex={regulationIndex}
                userRole={role}
              />
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
              requireVerified
              isEmailVerified={isEmailVerified}
            >
              <NotFoundPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppShell>
  );
}