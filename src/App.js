import './App.css';
import { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { formatInTimeZone } from 'date-fns-tz';

const params15 = CalculationMethod.MoonsightingCommittee();
params15.fajrAngle = 15;
params15.ishaAngle = 15;

const params18 = CalculationMethod.MoonsightingCommittee();
params18.fajrAngle = 18;
params18.ishaAngle = 18;

const getMonthNumber = monthAbbreviation => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return months.findIndex(month => month === monthAbbreviation);
}

const formatForDst = (timeString, amount, timezone) => {
  const time = timeString instanceof Date
    ? timeString
    : new Date("2000-01-01 " + timeString);
  time.setHours(time.getHours() + amount)

  return formatInTimeZone(time, timezone, "hh:mm")
}

const createHeaders = headers => {
  const headersCopy = structuredClone(headers)

  for (let i=0; i<30; i++) headersCopy.push(...headers)

  const output = headersCopy.map((header, index) => header + Math.ceil((index + 1)/headers.length)).join("\t")

  return output + "\n";
}

const initialValues = {
  year: new Date().getFullYear() + 1,
  latitude: "",
  longitude: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dstStart: `${new Date().getFullYear() + 1}-03-10`,
  dstEnd: `${new Date().getFullYear() + 1}-11-03`
}

const App = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState(initialValues);
  const [useDst, setUseDst] = useState(true);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(handlePosition)
  }, [])

  const handlePosition = e => {
    if (e?.coords) {
      setFormData(prev => ({
        ...prev,
        latitude: e.coords.latitude,
        longitude: e.coords.longitude,
      }))
    }
  }

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const parseDate = dateString => {
    const parts = dateString.split(' '); // Split the date string by space
    const month = getMonthNumber(parts[0]); // Get the month number
    const day = parseInt(parts[1], 10); // Get the day number
    const date = new Date(formData.year, month, day); // Create the Date object
  
    return date;
  }

  const generate = () => {
    setFinished(false);
    setError(false);

    const fetchData = async () => {
      const res1 = await fetch(`https://www.moonsighting.com/time_json.php?year=${formData.year}&tz=${formData.timezone}&lat=${formData.latitude}&lon=${formData.longitude}&method=1&both=true&time=1`);
      const res2 = await fetch(`https://www.moonsighting.com/time_json.php?year=${formData.year}&tz=${formData.timezone}&lat=${formData.latitude}&lon=${formData.longitude}&method=2&both=true&time=1`);

      const data1 = await res1.json();
      const data2 = await res2.json();

      const times1 = data1.times;
      const times2 = data2.times;

      setData(times2.map(item => {
        const { day, times } = item;
        const { latitude, longitude, dstStart, dstEnd, timezone } = formData;
        const isha2 = times1.find(i => i.day === day).times.isha;

        const currentDate = parseDate(day);
        const inDst = currentDate >= Date.parse(dstStart) && currentDate <= Date.parse(dstEnd);

        const prayerTimes15 = new PrayerTimes(new Coordinates(latitude, longitude), currentDate, params15);
        const prayerTimes18 = new PrayerTimes(new Coordinates(latitude, longitude), currentDate, params18);

        if (isNaN(prayerTimes15.asr)) {
          setError(true)
          return {}
        }

        return {
            day: day.substring(0,day.length - 4),
            asr_h: formatForDst(times.asr_h, +inDst && 1, timezone),
            asr_s: formatForDst(times.asr_s, +inDst && 1, timezone),
            dhuhr: formatForDst(prayerTimes15.dhuhr, +inDst && 1, timezone),
            fajr: formatForDst(prayerTimes15.fajr, +inDst && 1, timezone),
            isha: formatForDst(times.isha, +inDst && 1, timezone),
            isha2: formatForDst(isha2, +inDst && 1, timezone),
            maghrib: formatForDst(times.maghrib, +inDst && 1, timezone),
            suhoor: formatForDst(prayerTimes18.fajr, +inDst && 1, timezone),
        }
      }))

      setFinished(true);
    }

    fetchData();
  }

  const headers = ["Date", "Suhoor", "Fajr", "Dhuhr", "Asr_s", "Asr_h", "Maghrib", "Isha", "IshaTwo"]
  let output = createHeaders(headers)

  let prev = "Jan";
  data.forEach(({ day, suhoor, fajr, dhuhr, asr_s, asr_h, maghrib, isha, isha2 }) => {
    const row = [day.split(" ")[1], suhoor, fajr, dhuhr, asr_s, asr_h, maghrib, isha, isha2];
    if (day.substring(0,3) === prev) {
      output += row.join("\t");
      output += "\t";
    } else {
      output += "\n"
      prev = day.substring(0,3);
      output += row.join("\t");
      output += "\t";
    }
  })

  const tryCopy = () => {
    navigator.clipboard.writeText(output)
  }

  const toggleDst = () => {
    const prev = useDst
    setUseDst(!prev)
    if (prev) {
      setFormData(prev => ({
        ...prev,
        dstStart: "",
        dstEnd: ""
      }))
    }
  }

  return (
    <div className="container">
      <h2>Salah times</h2>
      <div className="form-item">
        <label>Year</label>
        <input name="year" type="text" value={formData.year} onChange={handleChange}></input>
      </div>
      <div className="form-item">
        <label>Latitude</label>
        <input name="latitude" type="text" value={formData.latitude} onChange={handleChange}></input>
      </div>
      <div className="form-item">
        <label>Longitude</label>
        <input name="longitude" type="text" value={formData.longitude} onChange={handleChange}></input>
      </div>
      <div className="form-item">
        <label>Timezone</label>
        <input name="timezone" type="text" value={formData.timezone} onChange={handleChange}></input>
      </div>
      <div className="form-item">
        <label>Daylight savings</label>
        <input name="useDst" type="checkbox" checked={useDst} onChange={toggleDst}></input>
      </div>
      {useDst && (
        <>
          <div className="form-item">
            <label>Start</label>
            <input name="dstStart" type="date" value={formData.dstStart} onChange={handleChange}></input>
          </div>
          <div className="form-item">
            <label>End</label>
            <input name="dstEnd" type="date" value={formData.dstEnd} onChange={handleChange}></input>
          </div>
        </>
      )}
      <button onClick={generate}>Generate data</button>
      {error ? <span>Error</span> : null}
      {finished ? <button onClick={tryCopy}>Copy data</button> : null}
      {finished && (
        <table className="table-container">
          <thead>
            <tr className="header-row">
              {headers.map(header => <th className="header-cell" key={header}>{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.day} className="table-row">
                <td className="table-cell">{row.day}</td>
                <td className="table-cell">{row.suhoor}</td>
                <td className="table-cell">{row.fajr}</td>
                <td className="table-cell">{row.dhuhr}</td>
                <td className="table-cell">{row.asr_s}</td>
                <td className="table-cell">{row.asr_h}</td>
                <td className="table-cell">{row.maghrib}</td>
                <td className="table-cell">{row.isha}</td>
                <td className="table-cell">{row.isha2}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
