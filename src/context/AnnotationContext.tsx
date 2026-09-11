import React, { createContext, useContext, useState, useEffect } from 'react';
import { TextAnnotation, HighlightColor, AnnotationType } from '../types/annotation';
import { loadAnnotationsFromStorage, saveAnnotationsToStorage } from '../utils/storage';

interface AnnotationContextValue {
  annotations: TextAnnotation[];
  addAnnotation: (params: {
    documentId: string;
    paragraphId: string;
    selectedText: string;
    type: AnnotationType;
    color?: HighlightColor;
    note?: string;
  }) => void;
  removeAnnotation: (id: string) => void;
  updateAnnotationNote: (id: string, note: string) => void;
  getDocAnnotations: (docId: string) => TextAnnotation[];
  getParagraphAnnotations: (docId: string, paragraphId: string) => TextAnnotation[];
  clearDocAnnotations: (docId: string) => void;
}

const AnnotationContext = createContext<AnnotationContextValue | undefined>(undefined);

export const AnnotationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [annotations, setAnnotations] = useState<TextAnnotation[]>(() => loadAnnotationsFromStorage());

  useEffect(() => {
    saveAnnotationsToStorage(annotations);
  }, [annotations]);

  const addAnnotation = (params: {
    documentId: string;
    paragraphId: string;
    selectedText: string;
    type: AnnotationType;
    color?: HighlightColor;
    note?: string;
  }) => {
    const newAnn: TextAnnotation = {
      id: 'ann-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      documentId: params.documentId,
      paragraphId: params.paragraphId,
      selectedText: params.selectedText.trim(),
      type: params.type,
      color: params.color || 'yellow',
      note: params.note,
      createdAt: new Date().toISOString(),
    };

    setAnnotations(prev => [newAnn, ...prev]);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const updateAnnotationNote = (id: string, note: string) => {
    setAnnotations(prev => prev.map(a => a.id === id ? { ...a, note } : a));
  };

  const getDocAnnotations = (docId: string) => {
    return annotations.filter(a => a.documentId === docId);
  };

  const getParagraphAnnotations = (docId: string, paragraphId: string) => {
    return annotations.filter(a => a.documentId === docId && a.paragraphId === paragraphId);
  };

  const clearDocAnnotations = (docId: string) => {
    setAnnotations(prev => prev.filter(a => a.documentId !== docId));
  };

  return (
    <AnnotationContext.Provider
      value={{
        annotations,
        addAnnotation,
        removeAnnotation,
        updateAnnotationNote,
        getDocAnnotations,
        getParagraphAnnotations,
        clearDocAnnotations,
      }}
    >
      {children}
    </AnnotationContext.Provider>
  );
};

export function useAnnotations(): AnnotationContextValue {
  const context = useContext(AnnotationContext);
  if (!context) {
    throw new Error('useAnnotations must be used within an AnnotationProvider');
  }
  return context;
}
