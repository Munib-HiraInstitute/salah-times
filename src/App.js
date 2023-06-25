import './App.css';
import { useState } from 'react';
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

const App = () => {
  const [data, setData] = useState([]);
  const [year, setYear] = useState(2024);
  const [latitude, setLatitude] = useState(38.196510);
  const [longitude, setLongitude] = useState(-85.654381);
  const [timezone, setTimezone] = useState("EST");
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState(false);

  const parseDate = dateString => {
    const parts = dateString.split(' '); // Split the date string by space
    const month = getMonthNumber(parts[0]); // Get the month number
    const day = parseInt(parts[1], 10); // Get the day number
    const date = new Date(year, month, day); // Create the Date object
  
    return date;
  }

  const generate = () => {
    setFinished(false);
    setError(false);

    const fetchData = async () => {
      const res1 = await fetch(`https://www.moonsighting.com/time_json.php?year=${year}&tz=${timezone}&lat=${latitude}&lon=${longitude}&method=1&both=true&time=1`);
      const res2 = await fetch(`https://www.moonsighting.com/time_json.php?year=${year}&tz=${timezone}&lat=${latitude}&lon=${longitude}&method=2&both=true&time=1`);

      const data1 = await res1.json();
      const data2 = await res2.json();

      const times1 = data1.times;
      const times2 = data2.times;

      setData(times2.map(item => {
        const { day, times } = item;
        const isha2 = times1.find(i => i.day === day).times.isha;
        const prayerTimes = new PrayerTimes(new Coordinates(latitude, longitude), parseDate(day), params);
        if (isNaN(prayerTimes.asr)) {
          setError(true)
          return []
        }

        return {
            day: day.substring(0,day.length - 4),
            asr_h: times.asr_h.split(" ")[0],
            asr_s: times.asr_s.split(" ")[0],
            dhuhr: times.dhuhr.split(" ")[0],
            fajr: formatInTimeZone(prayerTimes.fajr, timezone, 'HH:mm'),
            isha: times.isha.split(" ")[0],
            isha2: isha2.split(" ")[0],
            maghrib: times.maghrib.split(" ")[0],
            suhoor: times.fajr.split(" ")[0]
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

  const handleChange = (e, type) => {
    switch (type) {
      case "year":
        setYear(e.target.value);
        break;
      case "latitude":
        setLatitude(e.target.value);
        break;
      case "longitude":
        setLongitude(e.target.value);
        break;
      case "timezone":
        setTimezone(e.target.value);
        break;
      default:
        break;
    }
  }

  return (
    <div className="App">
      <div className="Container">
        <label>Year</label>
        <input type="text" value={year} onChange={(e) => handleChange(e, "year")}></input>
      </div>
      <div className="Container">
        <label>Latitude</label>
        <input type="text" value={latitude} onChange={(e) => handleChange(e, "latitude")}></input>
      </div>
      <div className="Container">
        <label>Longitude</label>
        <input type="text" value={longitude} onChange={(e) => handleChange(e, "longitude")}></input>
      </div>
      <div className="Container">
        <label>Timezone</label>
        <input type="text" value={timezone} onChange={(e) => handleChange(e, "timezone")}></input>
      </div>
        {finished ? <span>Finished generating</span> : null}
        <button onClick={generate}>Generate data</button>
        {error ? <span>Error</span> : null}
        <button onClick={tryCopy}>Copy data</button>
    </div>
  );
}

export default App;
