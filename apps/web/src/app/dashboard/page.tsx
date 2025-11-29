'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStaticResource, Classroom } from '@agenticcms/core';
import { Plus, BookOpen, GraduationCap } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { items: classrooms, isLoading, create } = useStaticResource(Classroom);
  const [isCreating, setIsCreating] = useState(false);
  const [newClassroom, setNewClassroom] = useState({
    name: '',
    gradeLevel: '',
    subject: '',
  });

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const classroom = await create({
        ...newClassroom,
        ownerId: 'current-user', // In production, get from auth context
        organizationId: 'school-1',
      });

      setIsCreating(false);
      setNewClassroom({ name: '', gradeLevel: '', subject: '' });
      router.push(`/classroom/${classroom.id}`);
    } catch (error) {
      console.error('Failed to create classroom:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Teacher Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Credits: <span className="font-semibold">100</span>
              </div>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={20} />
                New Classroom
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading classrooms...</p>
          </div>
        ) : classrooms.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No classrooms yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first classroom to start generating lesson plans
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Classroom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <div
                key={classroom.id}
                onClick={() => router.push(`/classroom/${classroom.id}`)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BookOpen size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {classroom.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Grade {classroom.gradeLevel} • {classroom.subject}
                    </p>
                  </div>
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
              Create New Classroom
            </h2>

            <form onSubmit={handleCreateClassroom}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classroom Name
                </label>
                <input
                  type="text"
                  value={newClassroom.name}
                  onChange={(e) =>
                    setNewClassroom({ ...newClassroom, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Math 101"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade Level
                </label>
                <input
                  type="text"
                  value={newClassroom.gradeLevel}
                  onChange={(e) =>
                    setNewClassroom({
                      ...newClassroom,
                      gradeLevel: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., 5th"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={newClassroom.subject}
                  onChange={(e) =>
                    setNewClassroom({
                      ...newClassroom,
                      subject: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Mathematics"
                />
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
