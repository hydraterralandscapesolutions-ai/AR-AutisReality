import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './NavBar.css'

const NAV_LINKS = [
  { to: '/',          label: 'Home'       },
  { to: '/resources', label: 'Resources'  },
  { to: '/games',     label: 'Games'      },
  { to: '/rewards',   label: 'Rewards'    },
  { to: '/calm',      label: 'Calm Corner'},
]

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [location])

  return (
    <header className="navbar" role="banner">
      <nav className="navbar__inner" aria-label="Main navigation">
        <NavLink to="/" className="navbar__logo" aria-label="AutisReality home">
          🌟 AutisReality
        </NavLink>

        <button
          className={`navbar__burger${open ? ' navbar__burger--open' : ''}`}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen(o => !o)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul
          id="nav-links"
          className={`navbar__links${open ? ' navbar__links--open' : ''}`}
          role="list"
        >
          {NAV_LINKS.map(link => (
            <li key={link.to} role="listitem">
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `navbar__link${isActive ? ' navbar__link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
