import './App.css';
import { useState, useEffect } from 'react';

import { formatDate, getCsvHeaders } from './App.utils';
import { initialValues, headers } from './App.constants';

const App = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState(initialValues);
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

  const generate = () => {
    setFinished(false);
    setError(false);

    const fetchData = async () => {
      const res15 = await fetch(`https://api.aladhan.com/v1/calendar/${formData.year}?latitude=${formData.latitude}&longitude=${formData.longitude}&method=99&methodSettings=15,null,15&iso8601=true`);
      const res18 = await fetch(`https://api.aladhan.com/v1/calendar/${formData.year}?latitude=${formData.latitude}&longitude=${formData.longitude}&method=99&methodSettings=18,null,18&iso8601=true`);
      const resasr = await fetch(`https://api.aladhan.com/v1/calendar/${formData.year}?latitude=${formData.latitude}&longitude=${formData.longitude}&method=99&methodSettings=18,null,18&iso8601=true&school=1`);

      const data15 = await res15.json();
      const data18 = await res18.json();
      const dataasr = await resasr.json();

      const combinedData = Object.values(data15?.data).flat(1).map((t15, index) => {
        const t18 = Object.values(data18?.data).flat(1)[index];
        const asr = Object.values(dataasr?.data).flat(1)[index];
    
        return {
            date: {
              ...t15.date,
              readable: t15.date.readable.split(" ").slice(0,2).join(" ")
            },
            meta: t15.meta,
            timings: {
              Suhoor: formatDate(t18.timings.Fajr, formData.timezone),
              Fajr: formatDate(t15.timings.Fajr, formData.timezone),
              Sunrise: formatDate(t15.timings.Sunrise, formData.timezone),
              Dhuhr: formatDate(t15.timings.Dhuhr, formData.timezone),
              Asr_s: formatDate(t15.timings.Asr, formData.timezone),
              Asr_h: formatDate(asr.timings.Asr, formData.timezone),
              Maghrib: formatDate(t15.timings.Maghrib, formData.timezone),
              Isha: formatDate(t15.timings.Isha, formData.timezone),
              Isha18: formatDate(t18.timings.Isha, formData.timezone),
            }
        }
      })

      setData(combinedData)
      setFinished(true);
    }

    fetchData();
  }

  const tryCopy = () => {
    let output = getCsvHeaders();
    let curentMonth = 1;

    data.forEach(({ date: { gregorian: { day, month }}, timings: { Suhoor, Fajr, Sunrise, Dhuhr, Asr_s, Asr_h, Maghrib, Isha, Isha18 }}) => {
      const row = [day, Suhoor, Fajr, Sunrise, Dhuhr, Asr_s, Asr_h, Maghrib, Isha, Isha18];
      if (month.number === curentMonth) {
        output += row.join("\t");
        output += "\t";
      } else {
        output += "\n"
        curentMonth = month.number;
        output += row.join("\t");
        output += "\t";
      }
    })

    navigator.clipboard.writeText(output)
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

      <button onClick={generate}>Generate table</button>
      {error ? <span>Error</span> : null}
      {finished ? <button onClick={tryCopy}>Copy tab separated</button> : null}
      {finished && (
        <table className="table-container">
          <thead>
            <tr className="header-row">
              {headers.map(header => <th className="header-cell" key={header}>{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.date.timestamp}>
                <td>{row.date.readable}</td>
                <td>{row.timings.Suhoor}</td>
                <td>{row.timings.Fajr}</td>
                <td>{row.timings.Sunrise}</td>
                <td>{row.timings.Dhuhr}</td>
                <td>{row.timings.Asr_s}</td>
                <td>{row.timings.Asr_h}</td>
                <td>{row.timings.Maghrib}</td>
                <td>{row.timings.Isha}</td>
                <td>{row.timings.Isha18}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
