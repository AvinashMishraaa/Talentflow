import React, { useState, useEffect } from 'react';

function AssessmentPreview({ assessment, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [visibleQuestions, setVisibleQuestions] = useState(new Set());

  useEffect(() => {
    const allQuestions = assessment.sections?.flatMap(s => s.questions) || [];
    const visible = new Set();
    
    allQuestions.forEach(question => {
      if (!question.conditional?.enabled) {
        visible.add(question.id);
      } else {
        const dependsOnAnswer = answers[question.conditional.dependsOn];
        const shouldShow = evaluateCondition(
          dependsOnAnswer,
          question.conditional.condition,
          question.conditional.value
        );
        if (shouldShow) {
          visible.add(question.id);
        }
      }
    });
    
    setVisibleQuestions(visible);
  }, [answers, assessment]);

  const evaluateCondition = (answer, condition, expectedValue) => {
    if (!answer) return false;
    
    switch (condition) {
      case 'equals':
        return String(answer) === String(expectedValue);
      case 'not_equals':
        return String(answer) !== String(expectedValue);
      case 'contains':
        return String(answer).toLowerCase().includes(String(expectedValue).toLowerCase());
      default:
        return false;
    }
  };

  const validateQuestion = (question, answer) => {
    const validation = question.validation || {};
    const errors = [];

    if (validation.required && (!answer || answer === '')) {
      errors.push('This field is required');
    }

    if (answer && question.type === 'text') {
      if (validation.minLength && answer.length < validation.minLength) {
        errors.push(`Minimum length is ${validation.minLength} characters`);
      }
      if (validation.maxLength && answer.length > validation.maxLength) {
        errors.push(`Maximum length is ${validation.maxLength} characters`);
      }
    }

    if (answer && question.type === 'number') {
      const numValue = parseFloat(answer);
      if (isNaN(numValue)) {
        errors.push('Please enter a valid number');
      } else {
        if (validation.minValue !== null && numValue < validation.minValue) {
          errors.push(`Minimum value is ${validation.minValue}`);
        }
        if (validation.maxValue !== null && numValue > validation.maxValue) {
          errors.push(`Maximum value is ${validation.maxValue}`);
        }
      }
    }

    return errors;
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    const question = assessment.sections?.flatMap(s => s.questions).find(q => q.id === questionId);
    if (question) {
      const validationErrors = validateQuestion(question, value);
      setErrors(prev => ({ 
        ...prev, 
        [questionId]: validationErrors.length > 0 ? validationErrors : undefined 
      }));
    }
  };

  const handleSubmit = () => {
    const allQuestions = assessment.sections?.flatMap(s => s.questions) || [];
    const newErrors = {};
    let hasErrors = false;

    allQuestions.forEach(question => {
      if (visibleQuestions.has(question.id)) {
        const validationErrors = validateQuestion(question, answers[question.id]);
        if (validationErrors.length > 0) {
          newErrors[question.id] = validationErrors;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);

    if (!hasErrors) {
      onSubmit?.(answers);
    }
  };

  const renderQuestion = (question, index) => {
    if (!visibleQuestions.has(question.id)) return null;

    const answer = answers[question.id] || '';
    const questionErrors = errors[question.id] || [];

    return (
      <div key={question.id} style={{ 
        marginBottom: 24, 
        padding: 20, 
        border: '1px solid var(--border)', 
        borderRadius: 8,
        background: 'var(--panel)'
      }}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 600, 
            marginBottom: 8,
            color: questionErrors.length > 0 ? '#dc2626' : 'inherit'
          }}>
            {index + 1}. {question.text}
            {question.validation?.required && <span style={{ color: '#dc2626' }}>*</span>}
          </label>
          
          {renderQuestionInput(question, answer)}
          
          {questionErrors.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {questionErrors.map((error, idx) => (
                <div key={idx} style={{ 
                  color: '#dc2626', 
                  fontSize: 12, 
                  marginBottom: 4 
                }}>
                  {error}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuestionInput = (question, answer) => {
    const baseStyle = {
      width: '100%',
      padding: 12,
      border: `1px solid ${errors[question.id] ? '#dc2626' : 'var(--border)'}`,
      borderRadius: 4,
      fontSize: 16
    };

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div style={{ display: 'grid', gap: 8 }}>
            {(question.options || []).map((option, idx) => (
              <label key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: 8,
                cursor: 'pointer',
                borderRadius: 4,
                background: answer === option ? '#e0f2fe' : 'transparent'
              }}>
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'yes-no':
        return (
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name={question.id}
                value="Yes"
                checked={answer === 'Yes'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
              <span>Yes</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name={question.id}
                value="No"
                checked={answer === 'No'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              />
              <span>No</span>
            </label>
          </div>
        );

      case 'rating':
        return (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(rating => (
              <label key={rating} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4, 
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: 4,
                background: parseInt(answer) === rating ? '#e0f2fe' : 'transparent',
                border: '1px solid var(--border)'
              }}>
                <input
                  type="radio"
                  name={question.id}
                  value={rating}
                  checked={parseInt(answer) === rating}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  style={{ display: 'none' }}
                />
                <span>⭐</span>
                <span>{rating}</span>
              </label>
            ))}
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            style={baseStyle}
            placeholder="Enter a number"
            min={question.validation?.minValue}
            max={question.validation?.maxValue}
          />
        );

      case 'text':
      default:
        return (
          <textarea
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            style={{ ...baseStyle, minHeight: 80, resize: 'vertical' }}
            placeholder="Enter your answer"
            maxLength={question.validation?.maxLength}
          />
        );
    }
  };

  if (!assessment?.sections) {
    return <div>No assessment data available</div>;
  }

  const allQuestions = assessment.sections.flatMap(s => s.questions);
  let questionIndex = 0;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 8px 0' }}>{assessment.name}</h2>
        <p style={{ color: 'var(--muted)', margin: 0 }}>
          Please answer all questions. Required fields are marked with *
        </p>
      </div>

      {assessment.sections.map(section => (
        <div key={section.id} style={{ marginBottom: 32 }}>
          {section.title && (
            <h3 style={{ 
              margin: '0 0 16px 0', 
              padding: '12px 0', 
              borderBottom: '2px solid var(--border)' 
            }}>
              {section.title}
            </h3>
          )}
          
          {section.questions.map(question => {
            const currentIndex = questionIndex++;
            return renderQuestion(question, currentIndex);
          })}
        </div>
      ))}

      <div style={{ 
        position: 'sticky', 
        bottom: 0, 
        background: 'var(--bg)', 
        padding: '16px 0', 
        borderTop: '1px solid var(--border)',
        textAlign: 'center'
      }}>
        <button
          onClick={handleSubmit}
          style={{
            background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
            color: 'white',
            border: 'none',
            padding: '12px 32px',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Submit Assessment
        </button>
      </div>
    </div>
  );
}

export default AssessmentPreview;
