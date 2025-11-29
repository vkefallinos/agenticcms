import { describe, it, expect, beforeEach } from 'vitest';
import { Artifact } from './Artifact';

describe('Artifact Entity', () => {
  let artifact: Artifact;

  beforeEach(() => {
    artifact = new Artifact();
  });

  describe('Basic Properties', () => {
    it('should create an artifact instance', () => {
      expect(artifact).toBeInstanceOf(Artifact);
    });

    it('should allow setting parent ID', () => {
      artifact.parentId = 'lesson-123';
      expect(artifact.parentId).toBe('lesson-123');
    });

    it('should allow setting file name', () => {
      artifact.fileName = 'lesson-plan.html';
      expect(artifact.fileName).toBe('lesson-plan.html');
    });

    it('should allow setting file type to html', () => {
      artifact.fileType = 'html';
      expect(artifact.fileType).toBe('html');
    });

    it('should allow setting file type to pdf', () => {
      artifact.fileType = 'pdf';
      expect(artifact.fileType).toBe('pdf');
    });

    it('should allow setting file type to json', () => {
      artifact.fileType = 'json';
      expect(artifact.fileType).toBe('json');
    });

    it('should allow setting URL', () => {
      artifact.url = 'https://example.com/artifacts/123.html';
      expect(artifact.url).toBe('https://example.com/artifacts/123.html');
    });

    it('should allow setting content', () => {
      artifact.content = '<html><body>Lesson Plan</body></html>';
      expect(artifact.content).toBe('<html><body>Lesson Plan</body></html>');
    });
  });

  describe('Artifact Types', () => {
    it('should create an HTML artifact', () => {
      const htmlArtifact = new Artifact();
      htmlArtifact.parentId = 'lesson-123';
      htmlArtifact.fileName = 'lesson.html';
      htmlArtifact.fileType = 'html';
      htmlArtifact.content = '<html><body>Content</body></html>';
      htmlArtifact.url = 'https://storage.example.com/lesson.html';

      expect(htmlArtifact.fileType).toBe('html');
      expect(htmlArtifact.fileName).toContain('.html');
    });

    it('should create a PDF artifact', () => {
      const pdfArtifact = new Artifact();
      pdfArtifact.parentId = 'lesson-456';
      pdfArtifact.fileName = 'worksheet.pdf';
      pdfArtifact.fileType = 'pdf';
      pdfArtifact.url = 'https://storage.example.com/worksheet.pdf';

      expect(pdfArtifact.fileType).toBe('pdf');
      expect(pdfArtifact.fileName).toContain('.pdf');
    });

    it('should create a JSON artifact', () => {
      const jsonArtifact = new Artifact();
      jsonArtifact.parentId = 'lesson-789';
      jsonArtifact.fileName = 'data.json';
      jsonArtifact.fileType = 'json';
      jsonArtifact.content = JSON.stringify({ key: 'value' });
      jsonArtifact.url = 'https://storage.example.com/data.json';

      expect(jsonArtifact.fileType).toBe('json');
      expect(jsonArtifact.fileName).toContain('.json');
      expect(JSON.parse(jsonArtifact.content)).toEqual({ key: 'value' });
    });
  });

  describe('BaseRecord Properties', () => {
    it('should have an ID field (inherited from BaseRecord)', () => {
      artifact.id = 'artifact-123';
      expect(artifact.id).toBe('artifact-123');
    });
  });

  describe('Full Artifact Creation', () => {
    it('should create a complete artifact with all properties', () => {
      const fullArtifact = new Artifact();
      fullArtifact.id = 'artifact-999';
      fullArtifact.parentId = 'lesson-999';
      fullArtifact.fileName = 'complete-lesson.html';
      fullArtifact.fileType = 'html';
      fullArtifact.url = 'https://cdn.example.com/artifacts/complete-lesson.html';
      fullArtifact.content = '<html><head><title>Complete Lesson</title></head><body><h1>Lesson Content</h1></body></html>';

      expect(fullArtifact.id).toBe('artifact-999');
      expect(fullArtifact.parentId).toBe('lesson-999');
      expect(fullArtifact.fileName).toBe('complete-lesson.html');
      expect(fullArtifact.fileType).toBe('html');
      expect(fullArtifact.url).toContain('https://');
      expect(fullArtifact.content).toContain('<html>');
    });
  });
});
