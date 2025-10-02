import React from 'react';
import { useNavigate } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "👥",
      title: "Candidate Pipeline Management",
      description: "Track candidates through different stages: Applied → Screening → Technical → Offer → Hired"
    },
    {
      icon: "💼",
      title: "Job Posting & Management",
      description: "Create and manage job postings with detailed requirements, skills, and descriptions"
    },
    {
      icon: "📝",
      title: "Technical Assessments",
      description: "Create role-specific assessments with multiple choice questions to evaluate candidate skills"
    },
    {
      icon: "📊",
      title: "Application Tracking",
      description: "Monitor candidate progress, move them between stages, and maintain detailed records"
    },
    {
      icon: "🔍",
      title: "Search & Filter",
      description: "Find candidates and jobs quickly with search functionality and filtering options"
    },
    {
      icon: "📋",
      title: "Audit Trail",
      description: "Keep track of all actions and changes made in the system for compliance and review"
    }
  ];

  const stats = [
    { number: "25", label: "Job Roles Available" },
    { number: "1000", label: "Sample Candidates" },
    { number: "75", label: "Assessment Questions" },
    { number: "6", label: "Pipeline Stages" }
  ];

  return (
    <div className="landing-page" style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      color: '#1e293b',
      overflow: 'auto'
    }}>
      <header style={{ 
        padding: window.innerWidth <= 768 ? '16px 20px' : '20px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            TF
          </div>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '20px' : '24px', 
            fontWeight: 'bold', 
            color: '#1e293b' 
          }}>
            TalentFlow
          </div>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            border: 'none',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          Get Started →
        </button>
      </header>

      <section style={{ 
        textAlign: 'center', 
        padding: window.innerWidth <= 768 ? '60px 20px' : '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontSize: window.innerWidth <= 768 ? '2.5rem' : window.innerWidth <= 480 ? '2rem' : '3.5rem', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          lineHeight: '1.1'
        }}>
          Streamline Your Hiring Process with 
          <span style={{ 
            background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'block',
            marginTop: '10px'
          }}>
            TalentFlow HR Management
          </span>
        </h1>
        
        <p style={{ 
          fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.3rem', 
          marginBottom: window.innerWidth <= 768 ? '32px' : '40px', 
          color: '#64748b',
          maxWidth: '600px',
          margin: '0 auto 40px auto',
          lineHeight: '1.6',
          padding: window.innerWidth <= 768 ? '0 10px' : '0'
        }}>
          Manage job postings, track candidates through your hiring pipeline, create assessments, and maintain organized records - all in one place.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: window.innerWidth <= 768 ? '12px' : '20px', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
          alignItems: 'center'
        }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
              border: 'none',
              color: 'white',
              padding: window.innerWidth <= 768 ? '14px 28px' : '16px 32px',
              borderRadius: '30px',
              fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem',
              fontWeight: 'bold',
              width: window.innerWidth <= 480 ? '100%' : 'auto',
              maxWidth: window.innerWidth <= 480 ? '280px' : 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
            }}
          >
            Try the Demo
          </button>
          
          <button 
            onClick={() => navigate('/jobs')}
            style={{
              background: 'transparent',
              border: '2px solid #64748b',
              color: '#64748b',
              padding: window.innerWidth <= 768 ? '12px 26px' : '14px 30px',
              borderRadius: '30px',
              fontSize: window.innerWidth <= 768 ? '1rem' : '1.1rem',
              fontWeight: 'bold',
              width: window.innerWidth <= 480 ? '100%' : 'auto',
              maxWidth: window.innerWidth <= 480 ? '280px' : 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#64748b';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#64748b';
            }}
          >
            Browse Jobs
          </button>
        </div>
      </section>

      <section style={{ 
        padding: window.innerWidth <= 768 ? '40px 20px' : '60px 40px',
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(148, 163, 184, 0.2)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: window.innerWidth <= 768 ? '24px' : '40px',
          textAlign: 'center'
        }}>
          {stats.map((stat, index) => (
            <div key={index}>
              <div style={{ 
                fontSize: window.innerWidth <= 768 ? '2.5rem' : '3rem', 
                fontWeight: 'bold', 
                marginBottom: '8px',
                background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {stat.number}
              </div>
              <div style={{ fontSize: '1.1rem', color: '#64748b' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ 
        padding: window.innerWidth <= 768 ? '60px 20px' : '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: window.innerWidth <= 768 ? '2rem' : '2.5rem', 
          marginBottom: window.innerWidth <= 768 ? '40px' : '60px',
          fontWeight: 'bold'
        }}>
          What TalentFlow Includes
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: window.innerWidth <= 768 ? '24px' : '40px' 
        }}>
          {features.map((feature, index) => (
            <div 
              key={index}
              style={{
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(10px)',
                padding: window.innerWidth <= 768 ? '24px' : '30px',
                borderRadius: '20px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
                {feature.icon}
              </div>
              <h3 style={{ 
                fontSize: '1.4rem', 
                marginBottom: '15px', 
                fontWeight: 'bold' 
              }}>
                {feature.title}
              </h3>
              <p style={{ 
                color: '#64748b', 
                lineHeight: '1.6',
                fontSize: '1rem'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ 
        padding: '80px 40px',
        textAlign: 'center',
        background: 'rgba(255,255,255,0.6)',
        borderTop: '1px solid rgba(148, 163, 184, 0.2)'
      }}>
        <h2 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          Ready to Try TalentFlow?
        </h2>
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '40px', 
          color: '#64748b',
          maxWidth: '500px',
          margin: '0 auto 40px auto'
        }}>
          Explore the demo with sample data to see how TalentFlow can organize your hiring process.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
            border: 'none',
            color: 'white',
            padding: '18px 40px',
            borderRadius: '30px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3)';
          }}
        >
          Explore the Demo
        </button>
      </section>

      <footer style={{ 
        padding: '40px',
        textAlign: 'center',
        borderTop: '1px solid rgba(148, 163, 184, 0.2)',
        background: 'rgba(255,255,255,0.4)',
        color: '#64748b'
      }}>
        <p>© 2025 TalentFlow. A demo HR management system for organizing your hiring process.</p>
      </footer>
    </div>
  );
}

export default Landing;
