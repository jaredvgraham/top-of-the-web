"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  SlotInfo,
  NavigateAction,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, add, sub } from "date-fns";
import enUS from "date-fns/locale/en-US";
import axios from "axios";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

interface Event {
  id: string;
  start: Date;
  end: Date;
  title: string;
}

type Props = {
  email: string;
};

const ScheduleCall = ({ email }: Props) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchScheduledCalls(currentDate);
  }, [currentDate]);

  const fetchScheduledCalls = async (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    try {
      const response = await axios.get(`/api/scheduleCalls`, {
        params: { date: formattedDate },
      });
      const data: Event[] = response.data;
      setEvents(
        data.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch scheduled calls", error);
    }
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    // Prevent selection of past dates
    if (slotInfo.start < new Date()) {
      alert("Cannot select past dates");
      return;
    }

    // Allow only one slot to be selected at a time
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.title !== "Selected Slot")
    );

    const newEvent: Event = {
      id: "selected-slot",
      start: slotInfo.start,
      end: add(slotInfo.start, { hours: 1 }),
      title: "Selected Slot",
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setSelectedSlot(slotInfo);
  };

  const handleSubmit = async () => {
    if (selectedSlot) {
      const start = selectedSlot.start;
      const end = add(start, { hours: 1 });
      const newEvent: Event = {
        id: "scheduled-call",
        start,
        end,
        title: "Scheduled Call",
      };

      try {
        const response = await axios.post(
          "/api/scheduleCalls",
          { ...newEvent, email },
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.title !== "Selected Slot")
        );
        setEvents((prevEvents) => [
          ...prevEvents,
          {
            ...response.data,
            start: new Date(response.data.start),
            end: new Date(response.data.end),
          },
        ]);
        setSelectedSlot(null);
        alert(`Scheduled call on ${format(start, "PPpp")}`);
      } catch (error) {
        alert("Failed to schedule the call");
        console.error("Failed to schedule the call", error);
      }
    }
  };

  const eventStyleGetter = (event: Event) => {
    const style = {
      backgroundColor:
        event.title === "Scheduled Call"
          ? "#3174ad"
          : event.title === "Selected Slot"
          ? "#f0ad4e"
          : "#d9534f",
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return { style };
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md w-full h-screen">
      <h2 className="text-2xl font-bold mb-4">Schedule a Call</h2>
      {selectedSlot && (
        <div className="w-full mb-4 p-4 bg-yellow-100 rounded-md">
          <p>Selected Slot: {format(selectedSlot.start, "PPpp")}</p>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Confirm Slot
          </button>
          <button
            onClick={() => {
              setEvents((prevEvents) =>
                prevEvents.filter((event) => event.title !== "Selected Slot")
              );
              setSelectedSlot(null);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 ml-2"
          >
            Cancel
          </button>
        </div>
      )}
      <div className="w-full h-full mt-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
          selectable
          onSelectSlot={handleSelectSlot}
          views={[Views.WEEK, Views.DAY]}
          step={60}
          timeslots={1}
          defaultView={Views.WEEK}
          min={new Date(2024, 6, 0, 9, 0)} // 9:00 AM
          max={new Date(2024, 6, 0, 17, 0)} // 5:00 PM
          eventPropGetter={eventStyleGetter}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
};

export default ScheduleCall;
