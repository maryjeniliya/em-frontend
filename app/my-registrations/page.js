'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyRegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      router.push('/');
      return;
    }

    // Step 1: Get user's registration records
    fetch(`https://em-backend-lpos.onrender.com/registrations/${user._id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch registrations');
        return res.json();
      })
      .then(async (regs) => {
        if (regs.length === 0) {
          setRegistrations([]);
          setLoading(false);
          return;
        }

        // Step 2: Fetch all events once, then match by event_id locally
        const eventsRes = await fetch('https://em-backend-lpos.onrender.com/events');
        if (!eventsRes.ok) throw new Error('Failed to fetch events');
        const allEvents = await eventsRes.json();

        // Build a lookup map: event._id → event
        const eventMap = Object.fromEntries(allEvents.map((e) => [e._id, e]));

        // Step 3: Match each registration to its event
        const matched = regs
          .map((reg) => eventMap[reg.event_id])
          .filter(Boolean); // remove any orphaned registrations

        setRegistrations(matched);
        setLoading(false);
      })
      .catch((err) => {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Registrations</h1>
        <Link
          href="/events"
          className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600"
        >
          Browse Events
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500 mt-16">Loading your registrations...</p>
      )}

      {/* Error */}
      {error && (
        <p className="text-center text-red-500 mt-16">{error}</p>
      )}

      {/* Empty state */}
      {!loading && !error && registrations.length === 0 && (
        <div className="text-center mt-16">
          <p className="text-gray-500 text-lg mb-2">You haven't registered for any events yet.</p>
          <p className="text-gray-400 mb-6">Browse available events and register for one!</p>
          <Link
            href="/events"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Browse Events
          </Link>
        </div>
      )}

      {/* Registered events grid */}
      {!loading && !error && registrations.length > 0 && (
        <>
          <p className="text-gray-500 mb-6">
            You are registered for <span className="font-semibold text-gray-700">{registrations.length}</span> event{registrations.length > 1 ? 's' : ''}.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {registrations.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-3">{event.name}</h2>
                <p className="text-gray-500 mb-1">📅 {event.date}</p>
                <p className="text-gray-500 mb-1">📍 {event.location}</p>
                <p className="text-gray-500 mb-4">🪑 Seats remaining: {event.seats}</p>
                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Registered
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}