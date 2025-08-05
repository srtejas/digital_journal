import React from 'react';
import { MessageSquare, Hash, CheckSquare } from 'lucide-react';

const QuestionRenderer = ({ question, value, onChange, index }) => {
  const getQuestionIcon = () => {
    if (question.id.startsWith('ft_')) return <MessageSquare className="h-5 w-5 text-primary-600" />;
    if (question.id.startsWith('det_')) return <Hash className="h-5 w-5 text-accent-600" />;
    return <CheckSquare className="h-5 w-5 text-secondary-600" />;
  };

  const getQuestionTypeLabel = () => {
    if (question.id.startsWith('ft_')) return 'Free Text';
    if (question.id.startsWith('det_')) return 'Metric';
    return 'Multiple Choice';
  };

  const renderInput = () => {
    // Free text questions
    if (question.id.startsWith('ft_')) {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Share your thoughts..."
          className="textarea-field h-32"
          rows={4}
        />
      );
    }

    // Deterministic questions
    if (question.id.startsWith('det_')) {
      if (question.answerType === 'boolean') {
        return (
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={value === true || value === 'true'}
                onChange={() => onChange(true)}
                className="text-primary-600"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={value === false || value === 'false'}
                onChange={() => onChange(false)}
                className="text-primary-600"
              />
              <span>No</span>
            </label>
          </div>
        );
      }

      if (question.answerType === 'scale') {
        return (
          <div className="space-y-3">
            <input
              type="range"
              min={question.min}
              max={question.max}
              value={value || question.min}
              onChange={(e) => onChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #0ea5e9 0%, #0ea5e9 ${((value || question.min) - question.min) / (question.max - question.min) * 100}%, #e5e7eb ${((value || question.min) - question.min) / (question.max - question.min) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{question.min}</span>
              <span className="font-medium text-primary-600">{value || question.min}</span>
              <span>{question.max}</span>
            </div>
          </div>
        );
      }

      if (question.answerType === 'number') {
        return (
          <input
            type="number"
            min={question.min}
            max={question.max}
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            placeholder="Enter a number..."
            className="input-field w-32"
          />
        );
      }
    }

    // Non-deterministic questions
    if (question.id.startsWith('nd_')) {
      if (question.answerType === 'single_choice') {
        return (
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option) => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={() => onChange(option)}
                  className="text-primary-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      }

      if (question.answerType === 'multiple_choice') {
        const selectedValues = Array.isArray(value) ? value : [];
        
        const handleMultipleChoice = (option) => {
          let newSelection;
          if (selectedValues.includes(option)) {
            newSelection = selectedValues.filter(v => v !== option);
          } else {
            newSelection = [...selectedValues, option];
            // Respect maxSelections if set
            if (question.maxSelections && newSelection.length > question.maxSelections) {
              newSelection = newSelection.slice(-question.maxSelections);
            }
          }
          onChange(newSelection);
        };

        return (
          <div className="space-y-2">
            {question.maxSelections && (
              <p className="text-sm text-gray-600">
                Select up to {question.maxSelections} options ({selectedValues.length}/{question.maxSelections} selected)
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((option) => (
                <label key={option} className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={() => handleMultipleChoice(option)}
                    className="text-primary-600"
                    disabled={question.maxSelections && selectedValues.length >= question.maxSelections && !selectedValues.includes(option)}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="fade-in">
      <div className="flex items-start space-x-3 mb-4">
        {getQuestionIcon()}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {getQuestionTypeLabel()}
            </span>
            <span className="text-sm text-gray-500">Question {index + 1}</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            {question.text}
          </h3>
          {renderInput()}
        </div>
      </div>
    </div>
  );
};

export default QuestionRenderer;