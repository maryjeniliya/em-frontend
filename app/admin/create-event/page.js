'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateEventPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [seats, setSeats] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, []);

  const handleCreate = async () => {
    if (!name || !date || !location || !seats) {
      setMessage('Please fill in all fields.');
      setIsSuccess(false);
      return;
    }
    setSubmitting(true);
    const res = await fetch('http://localhost:5000/event/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, date, location, seats }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setIsSuccess(true);
      setMessage('✅ Event created successfully!');
      setName('');
      setDate('');
      setLocation('');
      setSeats('');
    } else {
      setIsSuccess(false);
      setMessage(data.message || 'Failed to create event.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Create New Event</h2>
          <Link href="/admin" className="text-sm text-blue-500 hover:underline">
            ← Back to Events
          </Link>
        </div>

        <input
          type="text"
          placeholder="Event Name"
          className="w-full border p-2 rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block text-sm text-gray-500 mb-1">Event Date</label>
        <input
          type="date"
          className="w-full border p-2 rounded mb-4"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Location"
          className="w-full border p-2 rounded mb-4"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          type="number"
          placeholder="Number of Seats"
          className="w-full border p-2 rounded mb-4"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
        />

        {message && (
          <p className={`text-center mb-4 ${isSuccess ? 'text-green-600' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={submitting}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
        >
          {submitting ? 'Creating...' : 'Create Event'}
        </button>

        {isSuccess && (
          <Link
            href="/admin"
            className="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            View All Events
          </Link>
        )}
      </div>
    </div>
  );
}