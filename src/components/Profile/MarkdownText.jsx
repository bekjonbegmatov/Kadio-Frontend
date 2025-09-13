import React from 'react';
import './MarkdownText.css';

const MarkdownText = ({ text }) => {
  if (!text) return null;

  // Простая функция для обработки markdown
  const parseMarkdown = (text) => {
    let html = text;
    
    // Обработка переносов строк
    html = html.replace(/\n/g, '<br>');
    
    // Обработка жирного текста **text** или __text__
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Обработка курсива *text* или _text_
    html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/(?<!_)_([^_]+?)_(?!_)/g, '<em>$1</em>');
    
    // Обработка зачеркнутого текста ~~text~~
    html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Обработка кода `code`
    html = html.replace(/`([^`]+?)`/g, '<code>$1</code>');
    
    return html;
  };

  return (
    <div 
      className="markdown-text"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }}
    />
  );
};

export default MarkdownText;