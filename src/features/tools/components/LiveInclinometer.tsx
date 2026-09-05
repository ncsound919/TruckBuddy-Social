import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export function LiveInclinometer() {
  const [pitchAngle, setPitchAngle] = useState<number>(0);
  const [rollAngle, setRollAngle] = useState<number>(0);
  const [compassHeading, setCompassHeading] = useState<number>(270);
  const [gpsSpeedMph, setGpsSpeedMph] = useState<number>(0);
  const [gpsAltitudeFt, setGpsAltitudeFt] = useState<number | null>(null);
  const [isSensorsActive, setIsSensorsActive] = useState<boolean>(false);
  const [sensorStatus, setSensorStatus] = useState<string>('Sensors Standby');

  useEffect(() => {
    if (!isSensorsActive) return;

    let geoWatchId: number | null = null;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta !== null) setPitchAngle(Math.round(e.beta));
      if (e.gamma !== null) setRollAngle(Math.round(e.gamma));
      if (e.alpha !== null) setCompassHeading(Math.round(e.alpha));
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
      setSensorStatus('Hardware Gyro & Orientation Online');
    }

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      geoWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (pos.coords.speed !== null && !isNaN(pos.coords.speed)) {
            setGpsSpeedMph(Math.round(pos.coords.speed * 2.23694));
          }
          if (pos.coords.altitude !== null && !isNaN(pos.coords.altitude)) {
            setGpsAltitudeFt(Math.round(pos.coords.altitude * 3.28084));
          }
          if (pos.coords.heading !== null && !isNaN(pos.coords.heading)) {
            setCompassHeading(Math.round(pos.coords.heading));
          }
        },
        (err) => {
          console.warn('Geolocation sensor error:', err);
          setSensorStatus('GPS Signal Limited - Using Gyro');
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      if (geoWatchId !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(geoWatchId);
      }
    };
  }, [isSensorsActive]);

  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            <span>Live Mountain Grade & Hardware Gyro Inclinometer</span>
          </h3>
          <p className="text-xs text-zinc-500">
            Uses real device orientation gyros and GPS sensors to track road pitch, roll, and elevation.
          </p>
        </div>
        <button
          onClick={() => setIsSensorsActive(prev => !prev)}
          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
            isSensorsActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {isSensorsActive ? 'Sensors Active (Click to Stop)' : 'Activate Real Live Sensors'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Grade Pitch */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl text-center space-y-2 border border-slate-800">
          <span className="text-[10px] font-black uppercase text-amber-400">Road Pitch / Grade</span>
          <div className="text-3xl font-black">{pitchAngle}°</div>
          <span className="text-xs text-zinc-400 font-bold block">
            {pitchAngle > 4 ? '⚠️ Steep Downhill (Use Engine Brake)' : pitchAngle < -4 ? '⛰️ Steep Climb' : 'Level Highway'}
          </span>
        </div>

        {/* Roll Angle */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl text-center space-y-2 border border-slate-800">
          <span className="text-[10px] font-black uppercase text-sky-400">Chassis Roll Angle</span>
          <div className="text-3xl font-black">{rollAngle}°</div>
          <span className="text-xs text-zinc-400 font-bold block">
            {Math.abs(rollAngle) > 6 ? '⚠️ Superelevated Bank' : 'Level Lateral'}
          </span>
        </div>

        {/* GPS Speed / Heading */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl text-center space-y-2 border border-slate-800">
          <span className="text-[10px] font-black uppercase text-emerald-400">GPS Speed & Heading</span>
          <div className="text-3xl font-black">{gpsSpeedMph} <span className="text-xs font-normal">MPH</span></div>
          <span className="text-xs text-zinc-400 font-bold block">
            Bearing: {compassHeading}° {gpsAltitudeFt !== null ? `• ${gpsAltitudeFt} ft elev` : ''}
          </span>
        </div>
      </div>

      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between text-xs text-zinc-600">
        <span>Sensor Status: <strong>{sensorStatus}</strong></span>
        <span className="text-zinc-400">Calibration: Automatic Web API</span>
      </div>
    </div>
  );
}
