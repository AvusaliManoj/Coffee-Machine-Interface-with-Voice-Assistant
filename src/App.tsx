import React, { useState, useEffect } from 'react';
import { Coffee, Volume2, VolumeX, Power, Thermometer, Droplet, Timer, Coffee as CoffeeIcon, Loader2, Settings, Clock, Sliders, RefreshCw, XCircle } from 'lucide-react';

function App() {
  const [isOn, setIsOn] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState('');
  const [temperature, setTemperature] = useState(92);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [brewing, setBrewing] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [waterLevel, setWaterLevel] = useState(800);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [grindSize, setGrindSize] = useState('medium');
  const [brewMode, setBrewMode] = useState('eco');
  const [whippedCream, setWhippedCream] = useState('no');
  const [brewTimer, setBrewTimer] = useState(30);
  const [showCustomize, setShowCustomize] = useState(false);
  const [brewingProgress, setBrewingProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const coffeeTypes = [
    { name: 'Espresso', time: '25s', temp: 92, description: 'Strong & bold', icon: CoffeeIcon },
    { name: 'Americano', time: '35s', temp: 94, description: 'Smooth & balanced', icon: CoffeeIcon },
    { name: 'Cappuccino', time: '45s', temp: 90, description: 'Creamy & rich', icon: CoffeeIcon },
    { name: 'Latte', time: '50s', temp: 88, description: 'Silky & mild', icon: CoffeeIcon },
    { name: 'Frappuccino', time: '55s', temp: 85, description: 'Cold & refreshing', icon: CoffeeIcon },
    { name: 'Mocha', time: '45s', temp: 89, description: 'Chocolate heaven', icon: CoffeeIcon },
    { name: 'Cortado', time: '30s', temp: 91, description: 'Perfect balance', icon: CoffeeIcon },
    { name: 'Lungo', time: '40s', temp: 93, description: 'Extended pleasure', icon: CoffeeIcon }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (brewing) {
      const interval = setInterval(() => {
        setWaterLevel(prev => Math.max(prev - 50, 0));
        setBrewingProgress(prev => {
          const newProgress = prev + (100 / (brewTimer * 2));
          return Math.min(newProgress, 100);
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [brewing, brewTimer]);

  const playSound = (type: 'start' | 'complete' | 'error') => {
    const audio = new Audio(
      type === 'start' 
        ? 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
        : type === 'complete'
        ? 'https://assets.mixkit.co/active_storage/sfx/1114/1114-preview.mp3'
        : 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3'
    );
    audio.play();
  };

  const handleVoiceCommand = () => {
    if (!isVoiceEnabled) return;
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setMessage('Listening...');
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      
      if (command.includes('make') || command.includes('brew')) {
        const requestedDrink = command.replace('make ', '').replace('brew ', '');
        const foundDrink = coffeeTypes.find(coffee => 
          requestedDrink.includes(coffee.name.toLowerCase())
        );

        if (foundDrink) {
          handleBrewCoffee(foundDrink.name);
        } else {
          playSound('error');
          showPopupMessage(
            <div className="flex items-center gap-3 text-red-400">
              <XCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold">Drink Not Available</p>
                <p className="text-sm text-gray-300">Sorry, we don't have "{requestedDrink}" on our menu.</p>
              </div>
            </div>
          );
        }
      } else if (command.includes('customize')) {
        setShowCustomize(true);
      } else if (command.includes('power')) {
        setIsOn(prev => !prev);
      }
    };

    recognition.start();
  };

  const showPopupMessage = (msg: string | JSX.Element) => {
    setMessage(msg);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const handleBrewCoffee = (type) => {
    if (!isOn || waterLevel < 100) return;
    setSelectedDrink(type);
    setBrewing(true);
    setBrewingProgress(0);
    playSound('start');
    showPopupMessage(`Brewing ${type} with ${grindSize} grind in ${brewMode} mode${whippedCream === 'yes' ? ' with whipped cream' : ''}...`);
    
    setTimeout(() => {
      setBrewing(false);
      setBrewingProgress(0);
      playSound('complete');
      showPopupMessage(`Your ${type} is ready! Have a wonderful day! ☕️`);
    }, brewTimer * 1000);
  };

  const handleReset = () => {
    setBrewing(false);
    setBrewingProgress(0);
    setWaterLevel(800);
    setSelectedDrink('');
    showPopupMessage('Machine reset and ready for the next brew! ☕️');
  };

  const handleWaterLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWaterLevel(Number(e.target.value));
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemperature(Number(e.target.value));
  };

  const handleBrewTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBrewTimer(Number(e.target.value));
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=3542&ixlib=rb-4.0.3')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlend: 'overlay'
      }}
    >
      {showMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-800/90 p-6 rounded-xl border border-gray-700 shadow-2xl transform transition-all duration-300 animate-fade-in">
            {typeof message === 'string' ? (
              <p className="text-lg font-semibold text-white flex items-center gap-3">
                <Coffee className="w-6 h-6 text-blue-400" />
                {message}
              </p>
            ) : (
              message
            )}
          </div>
        </div>
      )}

      <div className="bg-gray-800/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-4xl border border-gray-700">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Coffee className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Smart Coffee Maker
              </h1>
              <p className="text-sm text-gray-400">Voice-enabled brewing system</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
              title="Reset machine"
              disabled={!isOn || brewing}
            >
              <RefreshCw className="w-6 h-6" />
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-400">{currentTime.toLocaleDateString()}</p>
              <p className="text-lg font-mono text-blue-400">{currentTime.toLocaleTimeString()}</p>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 transition-all"
              title="Machine Settings"
            >
              <Settings className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="p-3 rounded-xl bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 transition-all"
              title="Customize your coffee"
            >
              <Sliders className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsOn(!isOn)}
              className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 ${
                isOn ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/50' : 'bg-red-500/20 text-red-400 ring-2 ring-red-500/50'
              }`}
            >
              <Power className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isOn && (
          <>
            {/* Status Display */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-700/50 backdrop-blur p-4 rounded-xl border border-gray-600/50 transition-transform hover:transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Thermometer className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-sm text-gray-300">Temperature</p>
                </div>
                <p className="font-bold text-xl mb-2">{temperature}°C</p>
                {showSettings && (
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={temperature}
                    onChange={handleTemperatureChange}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                )}
              </div>
              <div className="bg-gray-700/50 backdrop-blur p-4 rounded-xl border border-gray-600/50 transition-transform hover:transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Droplet className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-gray-300">Water Level</p>
                </div>
                <p className="font-bold text-xl mb-2">{waterLevel}ml</p>
                {showSettings && (
                  <input
                    type="range"
                    min="0"
                    max="800"
                    value={waterLevel}
                    onChange={handleWaterLevelChange}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                )}
              </div>
              <div className="bg-gray-700/50 backdrop-blur p-4 rounded-xl border border-gray-600/50 transition-transform hover:transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Timer className="w-5 h-5 text-yellow-400" />
                  </div>
                  <p className="text-sm text-gray-300">Brew Timer</p>
                </div>
                <p className="font-bold text-xl mb-2">{brewTimer}s</p>
                {showSettings && (
                  <input
                    type="range"
                    min="15"
                    max="120"
                    value={brewTimer}
                    onChange={handleBrewTimerChange}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                )}
              </div>
              <div className="bg-gray-700/50 backdrop-blur p-4 rounded-xl border border-gray-600/50 transition-transform hover:transform hover:scale-105">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Sliders className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-300">Grind Size</p>
                </div>
                <p className="font-bold text-xl mb-2 capitalize">{grindSize}</p>
                {showSettings && (
                  <select
                    value={grindSize}
                    onChange={(e) => setGrindSize(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                  >
                    <option value="fine">Fine</option>
                    <option value="medium">Medium</option>
                    <option value="coarse">Coarse</option>
                  </select>
                )}
              </div>
            </div>

            {brewing && (
              <div className="mb-8 bg-gray-700/50 backdrop-blur p-6 rounded-xl border border-gray-600/50">
                <div className="flex items-center gap-4 mb-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  <h3 className="text-lg font-semibold">Brewing in Progress</h3>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${brewingProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 text-center">{Math.round(brewingProgress)}% Complete</p>
              </div>
            )}

            {showCustomize ? (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-700/50 backdrop-blur p-6 rounded-xl border border-gray-600/50">
                  <h3 className="font-bold text-lg mb-4">Brewing Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Grind Size</label>
                      <select
                        value={grindSize}
                        onChange={(e) => setGrindSize(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                      >
                        <option value="fine">Fine</option>
                        <option value="medium">Medium</option>
                        <option value="coarse">Coarse</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Brew Mode</label>
                      <select
                        value={brewMode}
                        onChange={(e) => setBrewMode(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                      >
                        <option value="eco">Eco</option>
                        <option value="waste-tracking">Waste Tracking</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700/50 backdrop-blur p-6 rounded-xl border border-gray-600/50">
                  <h3 className="font-bold text-lg mb-4">Additional Preferences</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Whipped Cream</label>
                      <select
                        value={whippedCream}
                        onChange={(e) => setWhippedCream(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Brew Timer (seconds)</label>
                      <select
                        value={brewTimer}
                        onChange={(e) => setBrewTimer(Number(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white"
                      >
                        <option value="30">30s</option>
                        <option value="60">60s</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4 mb-8">
                {coffeeTypes.map((coffee) => (
                  <button
                    key={coffee.name}
                    onClick={() => handleBrewCoffee(coffee.name)}
                    disabled={brewing || waterLevel < 100}
                    className={`p-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      selectedDrink === coffee.name
                        ? 'bg-blue-500/30 border-2 border-blue-500/50'
                        : 'bg-gray-700/50 border border-gray-600/50 hover:bg-gray-700/70'
                    } ${brewing || waterLevel < 100 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${selectedDrink === coffee.name ? 'bg-blue-500/20' : 'bg-gray-600/50'}`}>
                        <coffee.icon className={`w-5 h-5 ${selectedDrink === coffee.name ? 'text-blue-400' : 'text-gray-300'}`} />
                      </div>
                      <h3 className="font-bold text-lg">{coffee.name}</h3>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{coffee.description}</p>
                    <div className="flex justify-between text-sm text-gray-300">
                      <span>{coffee.temp}°C</span>
                      <span>{coffee.time}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Voice Control */}
            <div className="bg-gray-700/50 backdrop-blur p-6 rounded-xl border border-gray-600/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${isVoiceEnabled ? 'bg-green-500/20' : 'bg-gray-600/50'}`}>
                    {isVoiceEnabled ? (
                      <Volume2 className="w-6 h-6 text-green-400" />
                    ) : (
                      <VolumeX className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Voice Assistant</h3>
                    <p className="text-sm text-gray-400">
                      {brewing ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Try saying "Make Espresso" or "Open Customize"
                        </span>
                      ) : (
                        'Try saying "Make Espresso" or "Open Customize"'
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      isVoiceEnabled 
                        ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/50' 
                        : 'bg-gray-600/50 text-gray-300 hover:bg-gray-600/70'
                    }`}
                  >
                    {isVoiceEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                  {isVoiceEnabled && (
                    <button
                      onClick={handleVoiceCommand}
                      className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 ring-2 ring-blue-500/50 transition-all duration-300 transform hover:scale-105"
                    >
                      Listen
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;