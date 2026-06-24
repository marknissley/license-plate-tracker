import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Mic, MicOff, RotateCcw, Save, Trash2, Award, Compass, MapPin } from 'lucide-react';

// 1. Data Object Definition
const US_STATES = [
  { name: 'Alabama', code: 'AL', distance: 50 },
  { name: 'Alaska', code: 'AK', distance: 4200 },
  { name: 'Arizona', code: 'AZ', distance: 1500 },
  { name: 'Arkansas', code: 'AR', distance: 450 },
  { name: 'California', code: 'CA', distance: 2100 },
  { name: 'Colorado', code: 'CO', distance: 1300 },
  { name: 'Connecticut', code: 'CT', distance: 1200 },
  { name: 'Delaware', code: 'DE', distance: 1000 },
  { name: 'Florida', code: 'FL', distance: 0 },
  { name: 'Georgia', code: 'GA', distance: 300 },
  { name: 'Hawaii', code: 'HI', distance: 4300 },
  { name: 'Idaho', code: 'ID', distance: 2100 },
  { name: 'Illinois', code: 'IL', distance: 750 },
  { name: 'Indiana', code: 'IN', distance: 700 },
  { name: 'Iowa', code: 'IA', distance: 950 },
  { name: 'Kansas', code: 'KS', distance: 900 },
  { name: 'Kentucky', code: 'KY', distance: 550 },
  { name: 'Louisiana', code: 'LA', distance: 250 },
  { name: 'Maine', code: 'ME', distance: 1500 },
  { name: 'Maryland', code: 'MD', distance: 950 },
  { name: 'Massachusetts', code: 'MA', distance: 1300 },
  { name: 'Michigan', code: 'MI', distance: 950 },
  { name: 'Minnesota', code: 'MN', distance: 1150 },
  { name: 'Mississippi', code: 'MS', distance: 150 },
  { name: 'Missouri', code: 'MO', distance: 650 },
  { name: 'Montana', code: 'MT', distance: 1900 },
  { name: 'Nebraska', code: 'NE', distance: 1100 },
  { name: 'Nevada', code: 'NV', distance: 2000 },
  { name: 'New Hampshire', code: 'NH', distance: 1400 },
  { name: 'New Jersey', code: 'NJ', distance: 1050 },
  { name: 'New Mexico', code: 'NM', distance: 1200 },
  { name: 'New York', code: 'NY', distance: 1150 },
  { name: 'North Carolina', code: 'NC', distance: 600 },
  { name: 'North Dakota', code: 'ND', distance: 1450 },
  { name: 'Ohio', code: 'OH', distance: 800 },
  { name: 'Oklahoma', code: 'OK', distance: 750 },
  { name: 'Oregon', code: 'OR', distance: 2500 },
  { name: 'Pennsylvania', code: 'PA', distance: 1000 },
  { name: 'Rhode Island', code: 'RI', distance: 1300 },
  { name: 'South Carolina', code: 'SC', distance: 450 },
  { name: 'South Dakota', code: 'SD', distance: 1300 },
  { name: 'Tennessee', code: 'TN', distance: 450 },
  { name: 'Texas', code: 'TX', distance: 650 },
  { name: 'Utah', code: 'UT', distance: 1700 },
  { name: 'Vermont', code: 'VT', distance: 1400 },
  { name: 'Virginia', code: 'VA', distance: 800 },
  { name: 'Washington', code: 'WA', distance: 2600 },
  { name: 'West Virginia', code: 'WV', distance: 750 },
  { name: 'Wisconsin', code: 'WI', distance: 1000 },
  { name: 'Wyoming', code: 'WY', distance: 1500 }
];

// 2. Main Application Component
function LicensePlateTracker() {
  const [counts, setCounts] = useState(() => {
    const saved = localStorage.getItem('current_trip_counts');
    return saved ? JSON.parse(saved) : US_STATES.reduce((acc, state) => ({ ...acc, [state.name]: 0 }), {});
  });
  const [tripName, setTripName] = useState('');
  const [savedTrips, setSavedTrips] = useState(() => {
    const saved = localStorage.getItem('saved_trips');
    return saved ? JSON.parse(saved) : [];
  });
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState('');

  useEffect(() => {
    localStorage.setItem('current_trip_counts', JSON.stringify(counts));
  }, [counts]);

  useEffect(() => {
    localStorage.setItem('saved_trips', JSON.stringify(savedTrips));
  }, [savedTrips]);

  const adjustCount = (stateName, amount) => {
    setCounts(prev => ({
      ...prev,
      [stateName]: Math.max(0, prev[stateName] + amount)
    }));
  };

  useEffect(() => {
    let recognition = null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const lastResultIndex = event.results.length - 1;
        const spokenText = event.results[lastResultIndex][0].transcript.trim().toLowerCase();
        
        const matchedState = US_STATES.find(state => 
          spokenText.includes(state.name.toLowerCase()) || 
          spokenText === state.code.toLowerCase()
        );

        if (matchedState) {
          adjustCount(matchedState.name, 1);
          setVoiceFeedback(`Added ${matchedState.name}!`);
          setTimeout(() => setVoiceFeedback(''), 2000);
        } else {
          setVoiceFeedback(`Not recognized: "${spokenText}"`);
          setTimeout(() => setVoiceFeedback(''), 2000);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    }

    if (isListening && recognition) {
      recognition.start();
    }

    return () => {
      if (recognition) recognition.stop();
    };
  }, [isListening]);

  const totalStatesSeen = Object.values(counts).filter(count => count > 0).length;
  
  const mostSeenState = Object.entries(counts).reduce((max, current) => {
    return current[1] > max[1] ? current : max;
  }, ['', 0]);

  const farthestStateSeen = US_STATES
    .filter(state => counts[state.name] > 0)
    .reduce((farthest, current) => {
      return !farthest || current.distance > farthest.distance ? current : farthest;
    }, null);

  const saveTrip = () => {
    if (!tripName.trim()) return alert('Please enter a trip name first.');
    const newTrip = {
      id: Date.now(),
      name: tripName,
      date: new Date().toLocaleDateString(),
      counts: { ...counts },
      stats: { totalStatesSeen, mostSeen: mostSeenState[0], farthest: farthestStateSeen?.name }
    };
    setSavedTrips(prev => [newTrip, ...prev]);
    setTripName('');
    setCounts(US_STATES.reduce((acc, state) => ({ ...acc, [state.name]: 0 }), {}));
  };

  const deleteTrip = (id) => {
    setSavedTrips(prev => prev.filter(trip => trip.id !== id));
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen font-sans pb-12 shadow-md">
      <header className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-xl font-bold text-center">🚗 Interstate License Tracker</h1>
        <div className="mt-3 flex justify-center items-center gap-3">
          <button 
            onClick={() => setIsListening(!isListening)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-blue-800 hover:bg-blue-900'
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            {isListening ? 'Listening...' : 'Turn on Voice'}
          </button>
          <button 
            onClick={() => setCounts(US_STATES.reduce((acc, state) => ({ ...acc, [state.name]: 0 }), {}))}
            className="p-2 bg-blue-800 rounded-full hover:bg-blue-900"
          >
            <RotateCcw size={18} />
          </button>
        </div>
        {voiceFeedback && <div className="text-center text-xs mt-2 text-yellow-300 font-medium">{voiceFeedback}</div>}
      </header>

      <section className="m-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Live Trip Summary</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 p-2 rounded-lg">
            <Compass className="mx-auto text-blue-500 mb-1" size={20} />
            <div className="text-xl font-bold text-gray-800">{totalStatesSeen}</div>
            <div className="text-[10px] text-gray-500 font-medium">Unique States</div>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg">
            <Award className="mx-auto text-yellow-500 mb-1" size={20} />
            <div className="text-xl font-bold text-gray-800 truncate px-1">{mostSeenState[1] > 0 ? mostSeenState[0] : '—'}</div>
            <div className="text-[10px] text-gray-500 font-medium">Most Seen ({mostSeenState[1]})</div>
          </div>
          <div className="bg-gray-50 p-2 rounded-lg">
            <MapPin className="mx-auto text-red-500 mb-1" size={20} />
            <div className="text-xl font-bold text-gray-800 truncate px-1">{farthestStateSeen ? farthestStateSeen.name : '—'}</div>
            <div className="text-[10px] text-gray-500 font-medium">Farthest Away</div>
          </div>
        </div>
      </section>

      <main className="px-4 space-y-2">
        {US_STATES.map((state) => (
          <div key={state.name} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div>
              <span className="font-semibold text-gray-800 text-base">{state.name}</span>
              <span className="text-xs text-gray-400 ml-2 font-mono">{state.code}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => adjustCount(state.name, -1)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center">-</button>
              <span className="w-8 text-center font-bold text-lg text-blue-600">{counts[state.name]}</span>
              <button onClick={() => adjustCount(state.name, 1)} className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">+</button>
            </div>
          </div>
        ))}
      </main>

      <section className="m-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 space-y-3">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Save Current Run</h3>
        <div className="flex gap-2">
          <input type="text" placeholder="e.g., Summer Trip to Orlando" value={tripName} onChange={(e) => setTripName(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
          <button onClick={saveTrip} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1">Save</button>
        </div>
      </section>

      {savedTrips.length > 0 && (
        <section className="m-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Saved Trips History</h3>
          <div className="space-y-3">
            {savedTrips.map((trip) => (
              <div key={trip.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1 relative">
                <button onClick={() => deleteTrip(trip.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                <div className="font-bold text-gray-700 text-sm">{trip.name}</div>
                <div className="text-gray-400 font-medium">{trip.date}</div>
                <div className="pt-1 text-gray-600 grid grid-cols-2 gap-1 font-medium">
                  <div>States Tracked: <span className="font-bold text-gray-800">{trip.stats.totalStatesSeen}</span></div>
                  <div>Most: <span className="font-bold text-gray-800">{trip.stats.mostSeen || 'N/A'}</span></div>
                  <div className="col-span-2">Furthest: <span className="font-bold text-gray-800">{trip.stats.farthest || 'N/A'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// 3. Render Dom Entry Target (Ensures it hooks into index.html)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<LicensePlateTracker />);
