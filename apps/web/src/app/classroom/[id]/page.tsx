'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { repo } from 'remult';
import { Classroom, LessonPlan } from '@agenticcms/core';
import { ArrowLeft, Plus, FileText, Loader2 } from 'lucide-react';

export default function ClassroomPage() {
  const params = useParams();
  const router = useRouter();
  const classroomId = params.id as string;

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [lessons, setLessons] = useState<LessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [topic, setTopic] = useState('');

  // Load classroom and lessons
  useState(() => {
    const loadData = async () => {
      try {
        const classroomRepo = repo(Classroom);
        const lessonRepo = repo(LessonPlan);

        const [classroomData, lessonsData] = await Promise.all([
          classroomRepo.findId(classroomId),
          lessonRepo.find({ where: { parentResourceId: classroomId } }),
        ]);

        setClassroom(classroomData);
        setLessons(lessonsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  });

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const lessonRepo = repo(LessonPlan);
      const lesson = await lessonRepo.insert({
        topic,
        parentResourceId: classroomId,
        parentResourceType: 'classroom',
        status: 'idle',
      });

      setIsCreating(false);
      setTopic('');
      router.push(`/lesson/${lesson.id}`);
    } catch (error) {
      console.error('Failed to create lesson:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading classroom...</p>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Classroom not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {classroom.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Grade {classroom.gradeLevel} • {classroom.subject}
              </p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={20} />
              New Lesson Plan
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {lessons.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No lesson plans yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first AI-generated lesson plan
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Lesson Plan
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => router.push(`/lesson/${lesson.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {lesson.title || lesson.topic}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Topic: {lesson.topic}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          lesson.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : lesson.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : lesson.status === 'idle'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {lesson.status}
                      </span>
                      {lesson.duration > 0 && (
                        <span className="text-xs text-gray-600">
                          {lesson.duration} min
                        </span>
                      )}
                    </div>
                  </div>
                  <FileText size={24} className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Create New Lesson Plan
            </h2>

            <form onSubmit={handleCreateLesson}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Introduction to Fractions"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Our AI will generate a complete lesson plan based on this topic
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
