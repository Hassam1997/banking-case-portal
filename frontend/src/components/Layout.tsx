import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import Avatar from './Avatar'

export default function Layout() {
    const { session, logout } = useAuth()
    return (
        <div className="app">
            <header className="topbar">
                <div className="brand">🏦 Case Portal</div>
                <nav className="nav">
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/board">Board</NavLink>
                    <NavLink to="/cases" end>Cases</NavLink>
                </nav>
                <div className="user">
                    <Avatar name={session?.username ?? '?'} size={28} />
                    <span className="user-name">{session?.username}</span>
                    <span className="role">{session?.role}</span>
                    <button className="btn btn-subtle" onClick={() => logout()}>Sign out</button>
                </div>
            </header>
            <main className="content">
                <Outlet />
            </main>
        </div>
    )
}