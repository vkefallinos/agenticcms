'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAgentResource, LessonPlan } from '@agenticcms/core';
import { ArrowLeft, Sparkles, Download, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { useState } from 'react';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;
  const [creditError, setCreditError] = useState<string | null>(null);

  const { record: lesson, isLoading, artifacts, actions } = useAgentResource(
    LessonPlan,
    lessonId
  );

  const handleStartAgent = async () => {
    setCreditError(null); // Clear any previous errors
    try {
      await actions.startAgent.execute();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Insufficient credits')) {
        setCreditError('You need at least 10 credits to generate a lesson plan.');
      } else {
        console.error('Failed to start agent:', error);
        alert('Failed to start lesson generation. Please try again.');
      }
    }
  };

  if (isLoading || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading lesson plan...</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    idle: 'bg-gray-100 text-gray-700',
    gathering_context: 'bg-blue-100 text-blue-700',
    generating: 'bg-purple-100 text-purple-700',
    compiling_artifacts: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {lesson.title || lesson.topic}
              </h1>
              <p className="text-gray-600 mt-1">Topic: {lesson.topic}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  statusColors[lesson.status]
                }`}
              >
                {lesson.status.replace('_', ' ')}
              </span>
              {actions.startAgent.canExecute && (
                <button
                  onClick={handleStartAgent}
                  disabled={actions.startAgent.isLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actions.startAgent.isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  {actions.startAgent.metadata.label}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Insufficient Credits Warning */}
            {creditError && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CreditCard size={24} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-2">Insufficient Credits</h3>
                    <p className="text-sm text-amber-700 mb-4">{creditError}</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 text-sm font-medium flex items-center gap-2"
                      >
                        <CreditCard size={16} />
                        Purchase Credits
                      </button>
                      <button
                        onClick={() => setCreditError(null)}
                        className="text-amber-700 hover:text-amber-900 text-sm font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generation Error Display */}
            {lesson.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Generation Error</h3>
                  <p className="text-sm text-red-700">{lesson.error}</p>
                </div>
              </div>
            )}

            {/* Content Display */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Lesson Content
              </h2>
              {lesson.content ? (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {lesson.content}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Click "Start Generator" to create lesson content
                  </p>
                </div>
              )}
            </div>

            {/* Artifacts */}
            {artifacts.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Generated Files
                </h2>
                <div className="space-y-3">
                  {artifacts.map((artifact) => (
                    <div
                      key={artifact.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Download size={20} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {artifact.fileName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {artifact.fileType.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={artifact.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Learning Objectives */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Learning Objectives
              </h2>
              {lesson.objectives.length > 0 ? (
                <ul className="space-y-2">
                  {lesson.objectives.map((objective, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">
                  Objectives will appear here after generation
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Details
              </h2>
              <dl className="space-y-3">
                {lesson.duration > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Duration
                    </dt>
                    <dd className="text-gray-900">{lesson.duration} minutes</dd>
                  </div>
                )}
                {lesson.cost > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Credits Used
                    </dt>
                    <dd className="text-gray-900">{lesson.cost}</dd>
                  </div>
                )}
                {lesson.metadata.tokensUsed && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Tokens Used
                    </dt>
                    <dd className="text-gray-900">
                      {lesson.metadata.tokensUsed.toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
