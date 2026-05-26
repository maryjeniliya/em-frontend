'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function RegisterEventContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event_id');

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      router.push('/');
      return;
    }

    if (!eventId) {
      router.push('/events');
      return;
    }

    fetch('https://em-backend-lpos.onrender.com/events')
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((e) => e._id === eventId);
        if (!found) {
          router.push('/events');
          return;
        }
        setEvent(found);
        setLoading(false);
      });
  }, [eventId]);

  const handleRegister = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setSubmitting(true);
    const res = await fetch('https://em-backend-lpos.onrender.com/event/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user._id, event_id: eventId }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (res.ok) {
      setIsSuccess(true);
      setMessage(data.message || 'Successfully registered!');
    } else {
      setIsSuccess(false);
      setMessage(data.message || 'Registration failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Register for Event</h2>

        {/* Event Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-xl font-bold mb-3">{event.name}</h3>
          <p className="text-gray-600 mb-1">📅 {event.date}</p>
          <p className="text-gray-600 mb-1">📍 {event.location}</p>
          <p className="text-gray-600">🪑 Seats Left: {event.seats}</p>
        </div>

        {/* Success state */}
        {isSuccess ? (
          <div className="text-center">
            <p className="text-green-600 font-semibold mb-4">✅ {message}</p>
            <Link
              href="/my-registrations"
              className="block w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 text-center mb-3"
            >
              View My Registrations
            </Link>
            <Link
              href="/events"
              className="block w-full bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 text-center"
            >
              Back to Events
            </Link>
          </div>
        ) : (
          <>
            {message && (
              <p className="text-center text-red-500 mb-4">{message}</p>
            )}

            <button
              onClick={handleRegister}
              disabled={submitting || event.seats === 0}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed mb-3"
            >
              {submitting ? 'Registering...' : event.seats === 0 ? 'No Seats Available' : 'Confirm Registration'}
            </button>

            <Link
              href="/events"
              className="block w-full bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-300 text-center"
            >
              Cancel
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function RegisterEventPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <RegisterEventContent />
    </Suspense>
  );
}