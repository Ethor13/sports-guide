import React from 'react';
import './LandingPage.css';
import Navbar from './components/Navbar';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />

      <header className="hero">
        <div className="hero-content">
          <h1>Never Miss a Big Game Again</h1>
          <h2>Smart sports guides that help your bar deliver the best game-day experience</h2>
          <button className="cta-button">Get Started Free</button>
        </div>
      </header>

      <section className="benefits">
        <div className="container">
          <div className="benefit-item">
            <img src="/img/leaguelogos/nba.png" alt="NBA Coverage" />
            <h3>Automatic Scheduling</h3>
            <p>Save hours of manual work with AI-powered game schedules</p>
          </div>
          <div className="benefit-item">
            <img src="/img/leaguelogos/nfl.png" alt="NFL Coverage" />
            <h3>Multi-Sport Coverage</h3>
            <p>Get comprehensive guides for NBA, NFL, NHL, and NCAA games</p>
          </div>
          <div className="benefit-item">
            <img src="/img/leaguelogos/ncaambb.png" alt="NCAA Coverage" />
            <h3>Smart Prioritization</h3>
            <p>Never miss high-stakes games with our intelligent ranking system</p>
          </div>
        </div>
      </section>

      <section className="social-proof">
        <div className="container">
          <h2>Trusted by Leading Sports Bars</h2>
          <div className="testimonials">
            <div className="testimonial">
              <p>"Slates has completely transformed how we manage our TVs. Our customers love that they never miss their favorite teams' games."</p>
              <cite>- Mike Johnson, The Sports Corner</cite>
            </div>
            <div className="testimonial">
              <p>"We've increased our game day revenue by 30% since using Slates. It's a game-changer for sports bars."</p>
              <cite>- Sarah Williams, Champions Bar & Grill</cite>
            </div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container">
          <h2>Ready to Transform Your Sports Bar?</h2>
          <p>Join hundreds of successful sports bars using Slates</p>
          <button className="cta-button">Start Your Free Trial</button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;