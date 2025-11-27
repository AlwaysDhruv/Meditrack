import { Link } from 'react-router-dom'
import '../styles/home.css'

export default function Home() {
  return (
    <div className="home">
      <header className="nav">
        <div className="logo">MediTrack</div>
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>
      </header>

      <section className="hero">
        <h1>Your Health, Organized.</h1>
        <p>
          Book doctor appointments, access digital health records, 
          and receive intelligent health tips — all in one place.
        </p>

        <div className="hero-buttons">
          <Link to="/register" className="btn primary">Get Started</Link>
          <Link to="/login" className="btn secondary">Sign In</Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>Appointment Booking</h3>
          <p>Find doctors and schedule appointments effortlessly.</p>
        </div>

        <div className="feature-card">
          <h3>Digital Records</h3>
          <p>Store and view your complete medical history anywhere.</p>
        </div>

        <div className="feature-card">
          <h3>AI Health Tips</h3>
          <p>Receive personalized health suggestions instantly.</p>
        </div>
      </section>

      <footer className="footer">
        © 2025 MediTrack · Smart Health System
      </footer>
    </div>
  )
}
