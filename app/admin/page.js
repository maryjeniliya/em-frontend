'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState(null); // holds event being edited
  const [editForm, setEditForm] = useState({ name: '', date: '', location: '', seats: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    fetch('https://em-backend-lpos.onrender.com/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  };

  // Open edit modal with current event data pre-filled
  const openEdit = (event) => {
    setEditingEvent(event);
    setEditForm({
      name: event.name,
      date: event.date,
      location: event.location,
      seats: event.seats,
    });
    setMessage('');
  };

  const closeEdit = () => {
    setEditingEvent(null);
    setMessage('');
  };

  const handleUpdate = async () => {
    const res = await fetch(`https://em-backend-lpos.onrender.com/event/update/${editingEvent._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('✅ Event updated successfully!');
      fetchEvents();
      setTimeout(() => closeEdit(), 1000);
    } else {
      setMessage(data.message || 'Update failed.');
    }
  };

  const handleDelete = async (eventId, eventName) => {
    if (!confirm(`Are you sure you want to delete "${eventName}"?`)) return;
    const res = await fetch(`https://em-backend-lpos.onrender.com/event/delete/${eventId}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      fetchEvents();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin — Manage Events</h1>
        <Link
          href="/admin/create-event"
          className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600"
        >
          + Create New Event
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <div className="text-center mt-16">
          <p className="text-gray-500 mb-4">No events yet.</p>
          <Link href="/admin/create-event" className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-2">{event.name}</h2>
              <p className="text-gray-500 mb-1">📅 {event.date}</p>
              <p className="text-gray-500 mb-1">📍 {event.location}</p>
              <p className="text-gray-500 mb-4">🪑 Seats: {event.seats}</p>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(event)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id, event.name)}
                  className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Edit Event</h2>

            <input
              type="text"
              placeholder="Event Name"
              className="w-full border p-2 rounded mb-4"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <input
              type="date"
              className="w-full border p-2 rounded mb-4"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
            />
            <input
              type="text"
              placeholder="Location"
              className="w-full border p-2 rounded mb-4"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            />
            <input
              type="number"
              placeholder="Seats"
              className="w-full border p-2 rounded mb-4"
              value={editForm.seats}
              onChange={(e) => setEditForm({ ...editForm, seats: e.target.value })}
            />

            {message && (
              <p className={`text-center mb-4 ${message.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                onClick={closeEdit}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}