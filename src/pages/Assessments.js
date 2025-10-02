import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function Assessments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get('jobId') ? Number(searchParams.get('jobId')) : null;
  const builderMode = searchParams.get('builder') === '1';
  const previewMode = searchParams.get('preview') ? Number(searchParams.get('preview')) : null;
  const editMode = searchParams.get('edit') ? Number(searchParams.get('edit')) : null;

  const [jobs, setJobs] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [builder, setBuilder] = useState({ name: '', sections: [] });

  useEffect(() => {
    fetch('/jobs?page=1&pageSize=100').then(r=>r.json()).then(p=> setJobs(p.data || []));
    fetch('/assessments').then(r=>r.json()).then(setAssessments);
  }, []);

  const selectJob = (jobId) => {
    setSearchParams({ jobId });
  };

  const backToJobs = () => {
    setSearchParams({});
  };

  const openBuilder = (jobId) => {
    setSearchParams({ jobId, builder: '1' });
  };

  const closeBuilder = () => {
    setSearchParams({ jobId: selectedJobId });
  };

  const previewAssessment = (assessmentId) => {
    setSearchParams({ jobId: selectedJobId, preview: assessmentId });
  };

  const editAssessment = (assessmentId) => {
    setSearchParams({ jobId: selectedJobId, builder: '1', edit: assessmentId });
  };

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const jobAssessments = assessments.filter(a => a.jobId === selectedJobId);

  useEffect(() => {
    if (selectedJobId && builderMode) {
      const job = jobs.find(j => j.id === selectedJobId);
      if (job) {
        if (editMode !== null) {
          const assessment = assessments.find(a => a.id === editMode);
          if (assessment) {
            setBuilder({
              name: assessment.name,
              sections: [{
                id: 's1',
                title: 'Questions',
                questions: assessment.questions || []
              }]
            });
          }
        } else {
          setBuilder({ 
            name: `${job.title} Assessment`, 
            sections: [{ id: 's1', title: 'Section 1', questions: [] }] 
          });
        }
      }
    }
  }, [selectedJobId, builderMode, editMode, jobs, assessments]);

  const addSection = () => {
    setBuilder(b => ({ 
      ...b, 
      sections: [...b.sections, { 
        id: `s${Date.now()}`, 
        title: `Section ${b.sections.length + 1}`, 
        questions: [] 
      }] 
    }));
  };

  const addQuestion = (sectionId, questionType = 'multiple-choice') => {
    const newQuestion = {
      id: `q${Date.now()}`,
      text: '',
      type: questionType,
      options: questionType === 'multiple-choice' ? ['Option 1', 'Option 2', 'Option 3', 'Option 4'] : [],
      correctAnswer: 0,
      validation: {
        required: true,
        minLength: null,
        maxLength: null,
        minValue: null,
        maxValue: null
      },
      conditional: {
        enabled: false,
        dependsOn: null,
        condition: 'equals',
        value: ''
      }
    };
    
    setBuilder(b => ({
      ...b,
      sections: b.sections.map(s => 
        s.id === sectionId 
          ? { ...s, questions: [...s.questions, newQuestion] } 
          : s
      )
    }));
  };

  if (!selectedJobId) {
    return (
      <div className="content">
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>Select a Job Role</h2>
          <p className="muted">Choose a job role to view and manage its assessments</p>
        </div>
        <div 
          className="assessment-job-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: window.innerWidth <= 768 ? 12 : 16 
          }}
        >
          {jobs.map(job => {
            const jobAssessmentCount = assessments.filter(a => a.jobId === job.id).length;
            return (
              <div 
                key={job.id} 
                className="card" 
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onClick={() => selectJob(job.id)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>{job.title}</h3>
                <p className="muted" style={{ margin: '0 0 12px 0', fontSize: 14 }}>{job.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {jobAssessmentCount} assessment{jobAssessmentCount !== 1 ? 's' : ''}
                  </span>
                  <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>
                    View Assessments →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (previewMode !== null) {
    const assessment = assessments.find(a => a.id === previewMode);
    if (!assessment) {
      return (
        <div className="content">
          <div className="muted">Assessment not found</div>
        </div>
      );
    }

    return (
      <div className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <button 
              onClick={() => setSearchParams({ jobId: selectedJobId })}
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: 8 }}
            >
              ← Back to {selectedJob?.title} Assessments
            </button>
            <h2 style={{ margin: 0 }}>Assessment Preview</h2>
            <p className="muted">{assessment.name} • {selectedJob?.title}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className="icon-btn" 
              style={{ width: 'auto', padding: '0 12px' }}
              onClick={() => editAssessment(assessment.id)}
            >
              Edit Assessment
            </button>
          </div>
        </div>
        
        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 8px 0' }}>{assessment.name}</h3>
            <p className="muted">{assessment.level} Level • {assessment.questions?.length || 0} Questions</p>
          </div>
          
          <div style={{ display: 'grid', gap: window.innerWidth <= 768 ? 12 : 16 }}>
            {(assessment.questions || []).map((question, index) => (
              <div 
                key={index} 
                className="assessment-preview-question"
                style={{ 
                  padding: window.innerWidth <= 768 ? 20 : 16, 
                  border: '1px solid var(--border)', 
                  borderRadius: 8 
                }}
              >
                <div style={{ 
                  fontWeight: 600, 
                  marginBottom: 12,
                  fontSize: window.innerWidth <= 768 ? 16 : 14,
                  lineHeight: 1.4
                }}>
                  Question {index + 1}: {question.text}
                </div>
                {question.options && (
                  <div style={{ display: 'grid', gap: window.innerWidth <= 768 ? 10 : 8 }}>
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className="assessment-preview-option"
                        style={{ 
                          padding: window.innerWidth <= 768 ? 12 : 8, 
                          background: question.answerIndex === optIndex ? '#e0f2fe' : 'var(--panel)', 
                          borderRadius: 4,
                          border: question.answerIndex === optIndex ? '1px solid #0284c7' : '1px solid var(--border)',
                          fontSize: window.innerWidth <= 768 ? 16 : 14,
                          lineHeight: 1.4
                        }}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {question.answerIndex === optIndex && (
                          <span style={{ 
                            color: '#0284c7', 
                            fontWeight: 600, 
                            marginLeft: 8,
                            fontSize: window.innerWidth <= 768 ? 14 : 12
                          }}>
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!builderMode) {
    return (
      <div className="content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <button 
              onClick={backToJobs}
              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: 8 }}
            >
              ← Back to Job Roles
            </button>
            <h2 style={{ margin: 0 }}>{selectedJob?.title} Assessments</h2>
            <p className="muted">{selectedJob?.description}</p>
          </div>
          <div 
            className="assessment-buttons"
            style={{ 
              display: 'flex', 
              gap: window.innerWidth <= 768 ? 8 : 8,
              flexDirection: window.innerWidth <= 480 ? 'column' : 'row'
            }}
          >
            <AssignModal jobId={selectedJobId} />
            <button 
              className="icon-btn" 
              style={{ 
                width: window.innerWidth <= 480 ? '100%' : 'auto', 
                padding: '0 16px' 
              }}
              onClick={() => openBuilder(selectedJobId)}
            >
              + Create Assessment
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gap: 16 }}>
          {jobAssessments.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p className="muted">No assessments created for this job role yet.</p>
              <button 
                className="icon-btn" 
                style={{ width: 'auto', padding: '8px 16px', marginTop: 12 }}
                onClick={() => openBuilder(selectedJobId)}
              >
                Create First Assessment
              </button>
            </div>
          ) : (
            jobAssessments.map(assessment => (
              <div key={assessment.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0' }}>{assessment.name}</h3>
                    <p className="muted" style={{ margin: 0 }}>
                      {assessment.level} • {assessment.questions?.length || 0} questions
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      className="icon-btn" 
                      style={{ width: 'auto', padding: '0 12px' }}
                      onClick={() => previewAssessment(assessment.id)}
                    >
                      Preview
                    </button>
                    <button 
                      className="icon-btn" 
                      style={{ width: 'auto', padding: '0 12px' }}
                      onClick={() => editAssessment(assessment.id)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <button 
            onClick={closeBuilder}
            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: 8 }}
          >
            ← Back to {selectedJob?.title} Assessments
          </button>
          <h2 style={{ margin: 0 }}>
            {editMode !== null ? 'Edit Assessment' : 'Assessment Builder'}
          </h2>
          <p className="muted">
            {editMode !== null ? 'Editing' : 'Creating'} assessment for {selectedJob?.title}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn" style={{ width: 'auto', padding: '0 12px' }}>
            Save Draft
          </button>
          <button className="icon-btn" style={{ width: 'auto', padding: '0 12px' }}>
            Publish
          </button>
        </div>
      </div>
      
      <div className="card">
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>Assessment Name</label>
          <input 
            type="text" 
            className="search" 
            value={builder.name}
            onChange={(e) => setBuilder(b => ({ ...b, name: e.target.value }))}
            placeholder="Enter assessment name..."
            style={{ width: '100%', maxWidth: 400 }}
          />
        </div>
        
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Sections</h3>
            <button 
              className="icon-btn" 
              style={{ width: 'auto', padding: '0 12px' }}
              onClick={addSection}
            >
              + Add Section
            </button>
          </div>
          
          {builder.sections.map(section => (
            <div key={section.id} style={{ marginBottom: 20, padding: 16, border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <input 
                  type="text" 
                  value={section.title}
                  onChange={(e) => setBuilder(b => ({
                    ...b,
                    sections: b.sections.map(s => 
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    )
                  }))}
                  style={{ fontWeight: 600, border: 'none', background: 'transparent', fontSize: 16 }}
                />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select 
                    onChange={(e) => addQuestion(section.id, e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: 4, border: '1px solid var(--border)' }}
                    defaultValue=""
                  >
                    <option value="" disabled>+ Add Question</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="text">Text Input</option>
                    <option value="number">Number Input</option>
                    <option value="yes-no">Yes/No</option>
                    <option value="rating">Rating Scale</option>
                  </select>
                </div>
              </div>
              
              {section.questions.map((question, qIndex) => (
                <div key={question.id || qIndex} style={{ marginBottom: 16, padding: 16, background: 'var(--panel)', borderRadius: 6, border: '1px solid var(--border)' }}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14 }}>
                      Question {qIndex + 1}
                    </label>
                    <input 
                      type="text" 
                      placeholder="Enter question..."
                      value={question.text || ''}
                      onChange={(e) => setBuilder(b => ({
                        ...b,
                        sections: b.sections.map(s => 
                          s.id === section.id 
                            ? {
                                ...s,
                                questions: s.questions.map((q, idx) => 
                                  idx === qIndex ? { ...q, text: e.target.value } : q
                                )
                              }
                            : s
                        )
                      }))}
                      style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4 }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                      Answer Options
                    </label>
                    {(question.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4']).map((option, optIndex) => (
                      <div 
                        key={optIndex} 
                        className="assessment-question-option"
                        style={{ 
                          display: 'flex', 
                          alignItems: window.innerWidth <= 768 ? 'flex-start' : 'center', 
                          gap: 8, 
                          marginBottom: 6,
                          flexDirection: window.innerWidth <= 480 ? 'column' : 'row'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: window.innerWidth <= 480 ? 'auto' : 60 }}>
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            checked={question.correctAnswer === optIndex || question.answerIndex === optIndex}
                            onChange={() => setBuilder(b => ({
                              ...b,
                              sections: b.sections.map(s => 
                                s.id === section.id 
                                  ? {
                                      ...s,
                                      questions: s.questions.map((q, idx) => 
                                        idx === qIndex ? { ...q, correctAnswer: optIndex, answerIndex: optIndex } : q
                                      )
                                    }
                                  : s
                              )
                            }))}
                          />
                          <span style={{ minWidth: 20, fontSize: 14, fontWeight: 600 }}>
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                        </div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => setBuilder(b => ({
                            ...b,
                            sections: b.sections.map(s => 
                              s.id === section.id 
                                ? {
                                    ...s,
                                    questions: s.questions.map((q, idx) => 
                                      idx === qIndex 
                                        ? { 
                                            ...q, 
                                            options: (q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4']).map((opt, oIdx) => 
                                              oIdx === optIndex ? e.target.value : opt
                                            )
                                          } 
                                        : q
                                    )
                                  }
                                : s
                            )
                          }))}
                          style={{ 
                            flex: 1, 
                            width: window.innerWidth <= 480 ? '100%' : 'auto',
                            padding: window.innerWidth <= 768 ? 8 : 6, 
                            border: '1px solid var(--border)', 
                            borderRadius: 4,
                            fontSize: window.innerWidth <= 768 ? 16 : 14
                          }}
                          placeholder={`Option ${optIndex + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Question Settings</h4>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Question Type</label>
                        <select 
                          value={question.type || 'multiple-choice'}
                          onChange={(e) => setBuilder(b => ({
                            ...b,
                            sections: b.sections.map(s => 
                              s.id === section.id 
                                ? {
                                    ...s,
                                    questions: s.questions.map((q, idx) => 
                                      idx === qIndex ? { ...q, type: e.target.value } : q
                                    )
                                  }
                                : s
                            )
                          }))}
                          style={{ width: '100%', padding: 6, border: '1px solid var(--border)', borderRadius: 4 }}
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="text">Text Input</option>
                          <option value="number">Number Input</option>
                          <option value="yes-no">Yes/No</option>
                          <option value="rating">Rating Scale</option>
                        </select>
                      </div>
                      
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                          <input 
                            type="checkbox" 
                            checked={question.validation?.required !== false}
                            onChange={(e) => setBuilder(b => ({
                              ...b,
                              sections: b.sections.map(s => 
                                s.id === section.id 
                                  ? {
                                      ...s,
                                      questions: s.questions.map((q, idx) => 
                                        idx === qIndex ? { 
                                          ...q, 
                                          validation: { ...q.validation, required: e.target.checked }
                                        } : q
                                      )
                                    }
                                  : s
                              )
                            }))}
                          />
                          Required
                        </label>
                      </div>
                    </div>

                    {(question.type === 'text' || question.type === 'number') && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 12 }}>
                        {question.type === 'text' && (
                          <>
                            <div>
                              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Min Length</label>
                              <input 
                                type="number" 
                                value={question.validation?.minLength || ''}
                                onChange={(e) => setBuilder(b => ({
                                  ...b,
                                  sections: b.sections.map(s => 
                                    s.id === section.id 
                                      ? {
                                          ...s,
                                          questions: s.questions.map((q, idx) => 
                                            idx === qIndex ? { 
                                              ...q, 
                                              validation: { ...q.validation, minLength: e.target.value ? parseInt(e.target.value) : null }
                                            } : q
                                          )
                                        }
                                      : s
                                  )
                                }))}
                                style={{ width: '100%', padding: 6, border: '1px solid var(--border)', borderRadius: 4 }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Max Length</label>
                              <input 
                                type="number" 
                                value={question.validation?.maxLength || ''}
                                onChange={(e) => setBuilder(b => ({
                                  ...b,
                                  sections: b.sections.map(s => 
                                    s.id === section.id 
                                      ? {
                                          ...s,
                                          questions: s.questions.map((q, idx) => 
                                            idx === qIndex ? { 
                                              ...q, 
                                              validation: { ...q.validation, maxLength: e.target.value ? parseInt(e.target.value) : null }
                                            } : q
                                          )
                                        }
                                      : s
                                  )
                                }))}
                                style={{ width: '100%', padding: 6, border: '1px solid var(--border)', borderRadius: 4 }}
                              />
                            </div>
                          </>
                        )}
                        {question.type === 'number' && (
                          <>
                            <div>
                              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Min Value</label>
                              <input 
                                type="number" 
                                value={question.validation?.minValue || ''}
                                onChange={(e) => setBuilder(b => ({
                                  ...b,
                                  sections: b.sections.map(s => 
                                    s.id === section.id 
                                      ? {
                                          ...s,
                                          questions: s.questions.map((q, idx) => 
                                            idx === qIndex ? { 
                                              ...q, 
                                              validation: { ...q.validation, minValue: e.target.value ? parseFloat(e.target.value) : null }
                                            } : q
                                          )
                                        }
                                      : s
                                  )
                                }))}
                                style={{ width: '100%', padding: 6, border: '1px solid var(--border)', borderRadius: 4 }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Max Value</label>
                              <input 
                                type="number" 
                                value={question.validation?.maxValue || ''}
                                onChange={(e) => setBuilder(b => ({
                                  ...b,
                                  sections: b.sections.map(s => 
                                    s.id === section.id 
                                      ? {
                                          ...s,
                                          questions: s.questions.map((q, idx) => 
                                            idx === qIndex ? { 
                                              ...q, 
                                              validation: { ...q.validation, maxValue: e.target.value ? parseFloat(e.target.value) : null }
                                            } : q
                                          )
                                        }
                                      : s
                                  )
                                }))}
                                style={{ width: '100%', padding: 6, border: '1px solid var(--border)', borderRadius: 4 }}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div style={{ marginTop: 12 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 8 }}>
                        <input 
                          type="checkbox" 
                          checked={question.conditional?.enabled || false}
                          onChange={(e) => setBuilder(b => ({
                            ...b,
                            sections: b.sections.map(s => 
                              s.id === section.id 
                                ? {
                                    ...s,
                                    questions: s.questions.map((q, idx) => 
                                      idx === qIndex ? { 
                                        ...q, 
                                        conditional: { ...q.conditional, enabled: e.target.checked }
                                      } : q
                                    )
                                  }
                                : s
                            )
                          }))}
                        />
                        Conditional Question
                      </label>
                      
                      {question.conditional?.enabled && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginTop: 8 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Depends On</label>
                            <select 
                              value={question.conditional?.dependsOn || ''}
                              onChange={(e) => setBuilder(b => ({
                                ...b,
                                sections: b.sections.map(s => 
                                  s.id === section.id 
                                    ? {
                                        ...s,
                                        questions: s.questions.map((q, idx) => 
                                          idx === qIndex ? { 
                                            ...q, 
                                            conditional: { ...q.conditional, dependsOn: e.target.value }
                                          } : q
                                        )
                                      }
                                    : s
                                )
                              }))}
                              style={{ width: '100%', padding: 6, border: '1px solid var(--border)', borderRadius: 4 }}
                            >
                              <option value="">Select Question</option>
                              {section.questions.slice(0, qIndex).map((prevQ, prevIdx) => (
                                <option key={prevQ.id} value={prevQ.id}>
                                  Q{prevIdx + 1}: {prevQ.text || 'Untitled'}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Condition</label>
                            <select 
                              value={question.conditional?.condition || 'equals'}
                              onChange={(e) => setBuilder(b => ({
                                ...b,
                                sections: b.sections.map(s => 
                                  s.id === section.id 
                                    ? {
                                        ...s,
                                        questions: s.questions.map((q, idx) => 
                                          idx === qIndex ? { 
                                            ...q, 
                                            conditional: { ...q.conditional, condition: e.target.value }
                                          } : q
                                        )
                                      }
                                    : s
                                )
                              }))}
                              style={{ width: '100%', padding: 6, border: '1px solid var(--border)', borderRadius: 4 }}
                            >
                              <option value="equals">Equals</option>
                              <option value="not_equals">Not Equals</option>
                              <option value="contains">Contains</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Value</label>
                            <input 
                              type="text" 
                              value={question.conditional?.value || ''}
                              onChange={(e) => setBuilder(b => ({
                                ...b,
                                sections: b.sections.map(s => 
                                  s.id === section.id 
                                    ? {
                                        ...s,
                                        questions: s.questions.map((q, idx) => 
                                          idx === qIndex ? { 
                                            ...q, 
                                            conditional: { ...q.conditional, value: e.target.value }
                                          } : q
                                        )
                                      }
                                    : s
                                )
                              }))}
                              style={{ width: '100%', padding: 6, border: '1px solid var(--border)', borderRadius: 4 }}
                              placeholder="Expected value"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssignModal({ jobId }) {
  const [open, setOpen] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(jobId || "");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  
  useEffect(() => {
    if (!open) return;
    fetch('/assessments').then(r=>r.json()).then(setAssessments);
    fetch('/jobs?page=1&pageSize=100').then(r=>r.json()).then(p=> setJobs(p.data || []));
  }, [open]);

  // Set the job when jobId prop is provided
  useEffect(() => {
    if (jobId) {
      setSelectedJob(jobId);
    }
  }, [jobId]);
  
  useEffect(() => {
    if (!selectedJob) {
      setCandidates([]);
      return;
    }
    fetch(`/candidates?jobId=${selectedJob}&page=1&pageSize=500`).then(r=>r.json()).then(p=> setCandidates(p.data || []));
  }, [selectedJob]);
  
  const filteredAssessments = selectedJob ? assessments.filter(a => a.jobId === selectedJob) : [];
  
  const assign = async () => {
    if (!selectedAssessment || !selectedCandidate) return;
    await fetch(`/assessments/${selectedAssessment}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidateId: selectedCandidate }) });
    // Audit log entry
    try {
      const log = JSON.parse(localStorage.getItem("tf_audit_log") || "[]");
      const assessment = assessments.find(a => a.id === selectedAssessment);
      const candidate = candidates.find(c => c.id === selectedCandidate);
      log.unshift({
        action: "Assessment Assigned",
        details: `${assessment?.name} assigned to ${candidate?.name} for ${candidate?.jobTitle}`,
        timestamp: Date.now()
      });
      localStorage.setItem("tf_audit_log", JSON.stringify(log.slice(0, 100)));
    } catch {}
    setOpen(false);
    setSelectedJob('');
    setSelectedAssessment('');
    setSelectedCandidate('');
  };
  
  return (
    <div>
      <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={() => setOpen(true)}>Assign Assessment</button>
      {open && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.1)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }} onClick={() => setOpen(false)}>
          <div className="card modal-card" style={{ width: 520, background: 'var(--bg)' }} onClick={e=>e.stopPropagation()}>
            <h3 style={{ marginTop:0 }}>Assign Assessment to Candidate</h3>
            <div style={{ display:'grid', gap:12 }}>
              {!jobId && (
                <div>
                  <label style={{ display:'block', marginBottom:4, fontWeight:600 }}>Select Job Position</label>
                  <select className="search" value={selectedJob} onChange={e=>{setSelectedJob(e.target.value); setSelectedAssessment(''); setSelectedCandidate('');}}>
                    <option value="">Choose job position...</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
                </div>
              )}
              
              {jobId && (
                <div>
                  <label style={{ display:'block', marginBottom:4, fontWeight:600 }}>Job Position</label>
                  <div style={{ padding: 8, background: 'var(--panel)', borderRadius: 4, border: '1px solid var(--border)' }}>
                    {jobs.find(j => j.id === jobId)?.title || 'Loading...'}
                  </div>
                </div>
              )}
              
              {selectedJob && (
                <div>
                  <label style={{ display:'block', marginBottom:4, fontWeight:600 }}>Select Assessment</label>
                  <select className="search" value={selectedAssessment} onChange={e=>setSelectedAssessment(e.target.value)}>
                    <option value="">Choose assessment...</option>
                    {filteredAssessments.map(a => <option key={a.id} value={a.id}>{a.name} ({a.level})</option>)}
                  </select>
                </div>
              )}
              
              {selectedJob && (
                <div>
                  <label style={{ display:'block', marginBottom:4, fontWeight:600 }}>Select Candidate</label>
                  <select className="search" value={selectedCandidate} onChange={e=>setSelectedCandidate(e.target.value)}>
                    <option value="">Choose candidate...</option>
                    {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email}) - {c.stage}</option>)}
                  </select>
                </div>
              )}
              
              <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:8 }}>
                <button className="icon-btn" style={{ width:'auto', padding:'0 10px' }} onClick={() => setOpen(false)}>Cancel</button>
                <button 
                  className="icon-btn" 
                  style={{ width:'auto', padding:'0 10px', opacity: selectedAssessment && selectedCandidate ? 1 : 0.5 }} 
                  onClick={assign}
                  disabled={!selectedAssessment || !selectedCandidate}
                >
                  Assign Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assessments;
