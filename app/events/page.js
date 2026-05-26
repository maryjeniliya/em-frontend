'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      router.push('/');
      return;
    }

    fetch('https://em-backend-lpos.onrender.com/events')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Available Events</h1>
        <Link
          href="/my-registrations"
          className="bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600"
        >
          My Registrations
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-2">{event.name}</h2>
              <p className="text-gray-500 mb-1">📅 {event.date}</p>
              <p className="text-gray-500 mb-1">📍 {event.location}</p>
              <p className="text-gray-500 mb-4">🪑 Seats Left: {event.seats}</p>
              <Link
                href={`/register-event?event_id=${event._id}`}
                className="block text-center w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Register for Event
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}