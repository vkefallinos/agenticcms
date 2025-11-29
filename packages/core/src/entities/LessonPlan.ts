import { Entity, Fields, Validators, remult, repo } from 'remult';
import type { Remult } from 'remult';
import { AgentResource } from './AgentResource';
import { Classroom } from './Classroom';
import type { CoreTool } from 'ai';
import { z } from 'zod';

@Entity('lesson_plans', {
  allowApiCrud: 'authenticated',
})
export class LessonPlan extends AgentResource {
  @Fields.string({
    validate: Validators.required,
  })
  topic!: string;

  @Fields.string()
  title: string = '';

  @Fields.string()
  content: string = ''; // Markdown content

  @Fields.json()
  objectives: string[] = [];

  @Fields.number()
  duration: number = 0; // in minutes

  async resolveContext(remult: Remult): Promise<any> {
    const classroomRepo = repo(Classroom);
    const classroom = await classroomRepo.findId(this.parentResourceId);

    if (!classroom) {
      throw new Error('Classroom not found');
    }

    return {
      gradeLevel: classroom.gradeLevel,
      subject: classroom.subject,
      classroomName: classroom.name,
      topic: this.topic,
    };
  }

  getSystemPrompt(context: any): string {
    return `You are an expert educational content creator.

Your task is to create a comprehensive lesson plan for:
- Grade Level: ${context.gradeLevel}
- Subject: ${context.subject}
- Classroom: ${context.classroomName}
- Topic: ${context.topic}

Use the provided tools to:
1. Set a clear, engaging title for the lesson
2. Add structured content sections (Introduction, Main Content, Activities, Assessment)
3. Define clear learning objectives

Make the content age-appropriate, engaging, and aligned with educational standards.`;
  }

  getTools(): Record<string, CoreTool> {
    return {
      setTitle: {
        description: 'Set the title of the lesson plan',
        parameters: z.object({
          title: z.string().describe('The lesson title'),
        }),
        execute: async ({ title }) => {
          this.title = title;
          await repo(LessonPlan).save(this);
          return `Title set to: ${title}`;
        },
      },
      addSection: {
        description: 'Add a content section to the lesson plan',
        parameters: z.object({
          heading: z.string().describe('Section heading'),
          content: z.string().describe('Section content in markdown'),
        }),
        execute: async ({ heading, content }) => {
          this.content += `\n\n## ${heading}\n\n${content}`;
          await repo(LessonPlan).save(this);
          return `Section "${heading}" added`;
        },
      },
      addObjective: {
        description: 'Add a learning objective to the lesson plan',
        parameters: z.object({
          objective: z.string().describe('The learning objective'),
        }),
        execute: async ({ objective }) => {
          this.objectives.push(objective);
          await repo(LessonPlan).save(this);
          return `Objective added: ${objective}`;
        },
      },
      setDuration: {
        description: 'Set the estimated duration of the lesson in minutes',
        parameters: z.object({
          minutes: z.number().describe('Duration in minutes'),
        }),
        execute: async ({ minutes }) => {
          this.duration = minutes;
          await repo(LessonPlan).save(this);
          return `Duration set to: ${minutes} minutes`;
        },
      },
    };
  }

  async generateArtifacts(): Promise<Array<{ fileName: string; type: string; content: string }>> {
    // Generate HTML version of the lesson plan
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; }
    .metadata { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .objectives { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .objectives ul { margin: 10px 0; }
    .objectives li { margin: 5px 0; }
  </style>
</head>
<body>
  <h1>${this.title}</h1>

  <div class="metadata">
    <strong>Duration:</strong> ${this.duration} minutes
  </div>

  <div class="objectives">
    <h3>Learning Objectives</h3>
    <ul>
      ${this.objectives.map(obj => `<li>${obj}</li>`).join('\n      ')}
    </ul>
  </div>

  <div class="content">
    ${this.content.replace(/\n/g, '<br>')}
  </div>
</body>
</html>
    `.trim();

    return [
      {
        fileName: `${this.title.replace(/\s+/g, '-').toLowerCase()}.html`,
        type: 'html',
        content: htmlContent,
      },
    ];
  }
}
