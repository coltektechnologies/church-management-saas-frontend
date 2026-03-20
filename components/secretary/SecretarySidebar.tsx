'use client';

// Placeholder
export default function SecretarySidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="px-6 py-6 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Secretary</p>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        <a
          href="/secretary/departments"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
        >
          🏛️ Departments
        </a>
      </nav>
    </aside>
  );
}
