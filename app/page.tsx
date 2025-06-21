'use client';

import { useState } from "react";
import EventForm from "@/components/core/EventForm";
import EventDetails from "@/components/core/EventDetails";

export default function Home() {
  const [createdEvent, setCreatedEvent] = useState<any>(null);

  const handleEventCreated = (event: any) => {
    setCreatedEvent(event);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToForm = () => {
    setCreatedEvent(null);
  };

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Evento - Event Management</h1>
      
      {createdEvent ? (
        <EventDetails 
          event={createdEvent} 
          onBackToForm={handleBackToForm} 
          className="max-w-4xl mx-auto"
        />
      ) : (
        <EventForm 
          onEventCreated={handleEventCreated} 
          className="max-w-4xl mx-auto"
        />
      )}
    </main>
  );
}
