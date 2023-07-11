import './App.css';
import { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { formatInTimeZone } from 'date-fns-tz'

const params = CalculationMethod.MoonsightingCommittee();
params.fajrAngle = 15;

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

  const dateFormatter = Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: true })
  return dateFormatter.format(time).split(" ")[0]
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

        const prayerTimes = new PrayerTimes(new Coordinates(latitude, longitude), currentDate, params);

        if (isNaN(prayerTimes.asr)) {
          setError(true)
          return {}
        }

        return {
            day: day.substring(0,day.length - 4),
            asr_h: formatForDst(times.asr_h, +inDst && 1, timezone),
            asr_s: formatForDst(times.asr_s, +inDst && 1, timezone),
            dhuhr: formatForDst(times.dhuhr, +inDst && 1, timezone),
            fajr: formatForDst(prayerTimes.fajr, +inDst && 1, timezone),
            isha: formatForDst(times.isha, +inDst && 1, timezone),
            isha2: formatForDst(isha2, +inDst && 1, timezone),
            maghrib: formatForDst(times.maghrib, +inDst && 1, timezone),
            suhoor: formatForDst(times.fajr, +inDst && 1, timezone),
        }
      }))

      setFinished(true);
    }

    fetchData();
  }

  let prev = "Jan";
  let output = `Date1\tSuhoor1\tFajr1\tDhuhr1\tAsr_s1\tAsr_h1\tMaghrib1\tIsha1\tIshaTwo1\tDate2\tSuhoor2\tFajr2\tDhuhr2\tAsr_s2\tAsr_h2\tMaghrib2\tIsha2\tIshaTwo2\tDate3\tSuhoor3\tFajr3\tDhuhr3\tAsr_s3\tAsr_h3\tMaghrib3\tIsha3\tIshaTwo3\tDate4\tSuhoor4\tFajr4\tDhuhr4\tAsr_s4\tAsr_h4\tMaghrib4\tIsha4\tIshaTwo4\tDate5\tSuhoor5\tFajr5\tDhuhr5\tAsr_s5\tAsr_h5\tMaghrib5\tIsha5\tIshaTwo5\tDate6\tSuhoor6\tFajr6\tDhuhr6\tAsr_s6\tAsr_h6\tMaghrib6\tIsha6\tIshaTwo6\tDate7\tSuhoor7\tFajr7\tDhuhr7\tAsr_s7\tAsr_h7\tMaghrib7\tIsha7\tIshaTwo7\tDate8\tSuhoor8\tFajr8\tDhuhr8\tAsr_s8\tAsr_h8\tMaghrib8\tIsha8\tIshaTwo8\tDate9\tSuhoor9\tFajr9\tDhuhr9\tAsr_s9\tAsr_h9\tMaghrib9\tIsha9\tIshaTwo9\tDate10\tSuhoor10\tFajr10\tDhuhr10\tAsr_s10\tAsr_h10\tMaghrib10\tIsha10\tIshaTwo10\tDate11\tSuhoor11\tFajr11\tDhuhr11\tAsr_s11\tAsr_h11\tMaghrib11\tIsha11\tIshaTwo11\tDate12\tSuhoor12\tFajr12\tDhuhr12\tAsr_s12\tAsr_h12\tMaghrib12\tIsha12\tIshaTwo12\tDate13\tSuhoor13\tFajr13\tDhuhr13\tAsr_s13\tAsr_h13\tMaghrib13\tIsha13\tIshaTwo13\tDate14\tSuhoor14\tFajr14\tDhuhr14\tAsr_s14\tAsr_h14\tMaghrib14\tIsha14\tIshaTwo14\tDate15\tSuhoor15\tFajr15\tDhuhr15\tAsr_s15\tAsr_h15\tMaghrib15\tIsha15\tIshaTwo15\tDate16\tSuhoor16\tFajr16\tDhuhr16\tAsr_s16\tAsr_h16\tMaghrib16\tIsha16\tIshaTwo16\tDate17\tSuhoor17\tFajr17\tDhuhr17\tAsr_s17\tAsr_h17\tMaghrib17\tIsha17\tIshaTwo17\tDate18\tSuhoor18\tFajr18\tDhuhr18\tAsr_s18\tAsr_h18\tMaghrib18\tIsha18\tIshaTwo18\tDate19\tSuhoor19\tFajr19\tDhuhr19\tAsr_s19\tAsr_h19\tMaghrib19\tIsha19\tIshaTwo19\tDate20\tSuhoor20\tFajr20\tDhuhr20\tAsr_s20\tAsr_h20\tMaghrib20\tIsha20\tIshaTwo20\tDate21\tSuhoor21\tFajr21\tDhuhr21\tAsr_s21\tAsr_h21\tMaghrib21\tIsha21\tIshaTwo21\tDate22\tSuhoor22\tFajr22\tDhuhr22\tAsr_s22\tAsr_h22\tMaghrib22\tIsha22\tIshaTwo22\tDate23\tSuhoor23\tFajr23\tDhuhr23\tAsr_s23\tAsr_h23\tMaghrib23\tIsha23\tIshaTwo23\tDate24\tSuhoor24\tFajr24\tDhuhr24\tAsr_s24\tAsr_h24\tMaghrib24\tIsha24\tIshaTwo24\tDate25\tSuhoor25\tFajr25\tDhuhr25\tAsr_s25\tAsr_h25\tMaghrib25\tIsha25\tIshaTwo25\tDate26\tSuhoor26\tFajr26\tDhuhr26\tAsr_s26\tAsr_h26\tMaghrib26\tIsha26\tIshaTwo26\tDate27\tSuhoor27\tFajr27\tDhuhr27\tAsr_s27\tAsr_h27\tMaghrib27\tIsha27\tIshaTwo27\tDate28\tSuhoor28\tFajr28\tDhuhr28\tAsr_s28\tAsr_h28\tMaghrib28\tIsha28\tIshaTwo28\tDate29\tSuhoor29\tFajr29\tDhuhr29\tAsr_s29\tAsr_h29\tMaghrib29\tIsha29\tIshaTwo29\tDate30\tSuhoor30\tFajr30\tDhuhr30\tAsr_s30\tAsr_h30\tMaghrib30\tIsha30\tIshaTwo30\tDate31\tSuhoor31\tFajr31\tDhuhr31\tAsr_s31\tAsr_h31\tMaghrib31\tIsha31\tIshaTwo31\n`;
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
    setFinished(false)
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
    <div className="App">
      <div className="Container">
        <label className="Label">Year</label>
        <input name="year" type="text" value={formData.year} onChange={handleChange}></input>
      </div>
      <div className="Container">
        <label className="Label">Latitude</label>
        <input name="latitude" type="text" value={formData.latitude} onChange={handleChange}></input>
      </div>
      <div className="Container">
        <label className="Label">Longitude</label>
        <input name="longitude" type="text" value={formData.longitude} onChange={handleChange}></input>
      </div>
      <div className="Container">
        <label className="Label">Timezone</label>
        <input name="timezone" type="text" value={formData.timezone} onChange={handleChange}></input>
      </div>
      <div className="Container">
        <label className="Label">Daylight savings</label>
        <input name="useDst" type="checkbox" checked={useDst} onChange={toggleDst}></input>
      </div>
      {useDst && (
        <>
          <div className="Container">
            <label className="Label">Start</label>
            <input name="dstStart" type="date" value={formData.dstStart} onChange={handleChange}></input>
          </div>
          <div className="Container">
            <label className="Label">End</label>
            <input name="dstEnd" type="date" value={formData.dstEnd} onChange={handleChange}></input>
          </div>
        </>
      )}
        {finished ? <span>Finished generating</span> : null}
        {error ? <span>Error</span> : null}
        <button onClick={generate}>Generate data</button>
        {finished ? <button onClick={tryCopy}>Copy data</button> : null}
    </div>
  );
}

export default App;
